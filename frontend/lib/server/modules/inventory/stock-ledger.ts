import type { Prisma } from '@prisma/client';

export type TxClient = Prisma.TransactionClient;

export const HEAVY_TX = { maxWait: 5000, timeout: 20000 } as const;

export type LockedProduct = {
  id: string;
  name: string;
  onHandQuantity: number;
  reservedQuantity: number;
};

export type StockMutation = LockedProduct & {
  reservedBefore: number;
  reservedAfter: number;
  onHandBefore: number;
  onHandAfter: number;
  quantity: number;
};

function mapProduct(row: {
  id: string;
  name: string;
  onHandQuantity: unknown;
  reservedQuantity: unknown;
}): LockedProduct {
  return {
    id: row.id,
    name: row.name,
    onHandQuantity: Number(row.onHandQuantity),
    reservedQuantity: Number(row.reservedQuantity),
  };
}

export async function lockSalesOrder(
  tx: TxClient,
  id: string,
): Promise<{ id: string; status: string; orderNumber: string; notes: string | null } | null> {
  const rows = await tx.$queryRaw<
    Array<{ id: string; status: string; orderNumber: string; notes: string | null }>
  >`
    SELECT id, status, order_number AS "orderNumber", notes
    FROM sales_orders
    WHERE id = ${id}::uuid
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export async function lockProducts(tx: TxClient, productIds: string[]): Promise<LockedProduct[]> {
  const unique = [...new Set(productIds)].sort();
  if (unique.length === 0) return [];

  const products: LockedProduct[] = [];
  for (const id of unique) {
    const rows = await tx.$queryRaw<
      Array<{ id: string; name: string; onHandQuantity: unknown; reservedQuantity: unknown }>
    >`
      SELECT id, name,
             on_hand_quantity AS "onHandQuantity",
             reserved_quantity AS "reservedQuantity"
      FROM products
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;
    if (!rows[0]) {
      throw Object.assign(new Error(`Product ${id} not found`), { statusCode: 404 });
    }
    products.push(mapProduct(rows[0]));
  }
  return products;
}

export async function reserve(
  tx: TxClient,
  productId: string,
  quantity: number,
): Promise<StockMutation> {
  if (quantity <= 0) {
    throw Object.assign(new Error('Reserve quantity must be positive'), { statusCode: 400 });
  }

  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      name: string;
      onHandQuantity: unknown;
      reservedQuantity: unknown;
    }>
  >`
    UPDATE products
    SET reserved_quantity = reserved_quantity + ${quantity}
    WHERE id = ${productId}::uuid
      AND on_hand_quantity - reserved_quantity >= ${quantity}
    RETURNING id, name,
              on_hand_quantity AS "onHandQuantity",
              reserved_quantity AS "reservedQuantity"
  `;

  if (!rows[0]) {
    throw Object.assign(new Error('Insufficient free stock available to reserve'), {
      statusCode: 400,
    });
  }

  const after = mapProduct(rows[0]);
  return {
    ...after,
    quantity,
    onHandBefore: after.onHandQuantity,
    onHandAfter: after.onHandQuantity,
    reservedBefore: after.reservedQuantity - quantity,
    reservedAfter: after.reservedQuantity,
  };
}

export async function release(
  tx: TxClient,
  productId: string,
  quantity: number,
): Promise<StockMutation> {
  if (quantity <= 0) {
    throw Object.assign(new Error('Release quantity must be positive'), { statusCode: 400 });
  }

  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      name: string;
      onHandQuantity: unknown;
      reservedQuantity: unknown;
    }>
  >`
    UPDATE products
    SET reserved_quantity = reserved_quantity - ${quantity}
    WHERE id = ${productId}::uuid
      AND reserved_quantity >= ${quantity}
    RETURNING id, name,
              on_hand_quantity AS "onHandQuantity",
              reserved_quantity AS "reservedQuantity"
  `;

  if (!rows[0]) {
    throw Object.assign(new Error('Cannot release more stock than currently reserved'), {
      statusCode: 400,
    });
  }

  const after = mapProduct(rows[0]);
  return {
    ...after,
    quantity,
    onHandBefore: after.onHandQuantity,
    onHandAfter: after.onHandQuantity,
    reservedBefore: after.reservedQuantity + quantity,
    reservedAfter: after.reservedQuantity,
  };
}

export async function deduct(
  tx: TxClient,
  productId: string,
  quantity: number,
): Promise<StockMutation> {
  if (quantity <= 0) {
    throw Object.assign(new Error('Deduct quantity must be positive'), { statusCode: 400 });
  }

  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      name: string;
      onHandQuantity: unknown;
      reservedQuantity: unknown;
    }>
  >`
    UPDATE products
    SET on_hand_quantity = on_hand_quantity - ${quantity},
        reserved_quantity = reserved_quantity - ${quantity}
    WHERE id = ${productId}::uuid
      AND on_hand_quantity >= ${quantity}
      AND reserved_quantity >= ${quantity}
    RETURNING id, name,
              on_hand_quantity AS "onHandQuantity",
              reserved_quantity AS "reservedQuantity"
  `;

  if (!rows[0]) {
    throw Object.assign(new Error('Insufficient reserved stock to deliver'), { statusCode: 400 });
  }

  const after = mapProduct(rows[0]);
  return {
    ...after,
    quantity,
    onHandBefore: after.onHandQuantity + quantity,
    onHandAfter: after.onHandQuantity,
    reservedBefore: after.reservedQuantity + quantity,
    reservedAfter: after.reservedQuantity,
  };
}

export async function adjustOnHand(
  tx: TxClient,
  productId: string,
  delta: number,
): Promise<StockMutation> {
  if (delta === 0) {
    throw Object.assign(new Error('Adjustment quantity cannot be zero'), { statusCode: 400 });
  }

  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      name: string;
      onHandQuantity: unknown;
      reservedQuantity: unknown;
    }>
  >`
    UPDATE products
    SET on_hand_quantity = on_hand_quantity + ${delta}
    WHERE id = ${productId}::uuid
      AND on_hand_quantity + ${delta} >= 0
      AND on_hand_quantity + ${delta} >= reserved_quantity
    RETURNING id, name,
              on_hand_quantity AS "onHandQuantity",
              reserved_quantity AS "reservedQuantity"
  `;

  if (!rows[0]) {
    throw Object.assign(
      new Error('Stock adjustment would go below zero or below reserved commitments'),
      { statusCode: 400 },
    );
  }

  const after = mapProduct(rows[0]);
  return {
    ...after,
    quantity: Math.abs(delta),
    onHandBefore: after.onHandQuantity - delta,
    onHandAfter: after.onHandQuantity,
    reservedBefore: after.reservedQuantity,
    reservedAfter: after.reservedQuantity,
  };
}
