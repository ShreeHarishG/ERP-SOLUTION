import type { Prisma } from '@prisma/client';

type TransactionClient = Prisma.TransactionClient;

async function nextPrefixedNumber(
  tx: TransactionClient,
  sequence: 'so_seq' | 'mo_seq' | 'po_seq',
  prefix: 'SO' | 'MO' | 'PO',
): Promise<string> {
  try {
    const rows = await tx.$queryRawUnsafe<Array<{ n: bigint | number }>>(
      `SELECT nextval('${sequence}') AS n`,
    );
    const value = Number(rows[0]?.n ?? 1);
    return `${prefix}-${String(value).padStart(3, '0')}`;
  } catch {
    await tx.$executeRawUnsafe(`CREATE SEQUENCE IF NOT EXISTS ${sequence}`);
    const table =
      prefix === 'SO' ? 'sales_orders' : prefix === 'MO' ? 'manufacturing_orders' : 'purchase_orders';
    const maxRows = await tx.$queryRawUnsafe<Array<{ max: number | null }>>(
      `SELECT MAX(CAST(substring(order_number FROM '[0-9]+$') AS INTEGER)) AS max
       FROM ${table}
       WHERE order_number ~ '^${prefix}-[0-9]+$'`,
    );
    const currentMax = Number(maxRows[0]?.max ?? 0);
    if (currentMax > 0) {
      await tx.$executeRawUnsafe(`SELECT setval('${sequence}', ${currentMax}, true)`);
    }
    const rows = await tx.$queryRawUnsafe<Array<{ n: bigint | number }>>(
      `SELECT nextval('${sequence}') AS n`,
    );
    const value = Number(rows[0]?.n ?? 1);
    return `${prefix}-${String(value).padStart(3, '0')}`;
  }
}

export async function generateSalesOrderNumber(tx: TransactionClient): Promise<string> {
  return nextPrefixedNumber(tx, 'so_seq', 'SO');
}

export async function generateManufacturingOrderNumber(tx: TransactionClient): Promise<string> {
  return nextPrefixedNumber(tx, 'mo_seq', 'MO');
}

export async function generatePurchaseOrderNumber(tx: TransactionClient): Promise<string> {
  return nextPrefixedNumber(tx, 'po_seq', 'PO');
}
