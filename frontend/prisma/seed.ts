import { PrismaClient, UserRole, ProcurementType, ProcurementStrategy, ProductType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const usersData = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Super Admin',
      email: 'admin@shivfurniture.com',
      passwordHash: hashedPassword,
      role: 'admin' as UserRole,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Ravi Sharma',
      email: 'ravi@shivfurniture.com',
      passwordHash: hashedPassword,
      role: 'product_manager' as UserRole,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Priya Singh',
      email: 'priya@shivfurniture.com',
      passwordHash: hashedPassword,
      role: 'sales' as UserRole,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Amit Patel',
      email: 'amit@shivfurniture.com',
      passwordHash: hashedPassword,
      role: 'purchase' as UserRole,
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Neha Gupta',
      email: 'neha@shivfurniture.com',
      passwordHash: hashedPassword,
      role: 'inventory' as UserRole,
    },
  ];

  for (const u of usersData) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }
  console.log('Users seeded.');

  // 2. Create Products
  const productsData = [
    // Finished Goods
    {
      id: '10000000-0000-0000-0000-000000000001',
      name: 'Wooden Dining Table',
      sku: 'WDT-001',
      productType: 'finished_good' as ProductType,
      description: '6-seater solid wood dining table',
      category: 'Furniture',
      unitOfMeasure: 'pcs',
      salesPrice: 15000.00,
      costPrice: 8500.00,
      onHandQuantity: 5.00,
      reservedQuantity: 0.00,
      minStockLevel: 10.00,
      reorderQuantity: 15.00,
      procurementType: 'manufacture' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      name: 'Wooden Chair',
      sku: 'WCH-001',
      productType: 'finished_good' as ProductType,
      description: 'Solid wood dining chair',
      category: 'Furniture',
      unitOfMeasure: 'pcs',
      salesPrice: 3500.00,
      costPrice: 1800.00,
      onHandQuantity: 20.00,
      reservedQuantity: 0.00,
      minStockLevel: 20.00,
      reorderQuantity: 30.00,
      procurementType: 'manufacture' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      name: 'Wooden Bookshelf',
      sku: 'WBS-001',
      productType: 'finished_good' as ProductType,
      description: '5-shelf solid wood bookshelf',
      category: 'Furniture',
      unitOfMeasure: 'pcs',
      salesPrice: 8000.00,
      costPrice: 4500.00,
      onHandQuantity: 8.00,
      reservedQuantity: 0.00,
      minStockLevel: 5.00,
      reorderQuantity: 10.00,
      procurementType: 'manufacture' as ProcurementType,
      procurementStrategy: 'mto' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    // Raw Materials
    {
      id: '20000000-0000-0000-0000-000000000001',
      name: 'Wooden Leg (Table)',
      sku: 'RM-WL-001',
      productType: 'raw_material' as ProductType,
      description: 'Solid teak table leg, 75cm height',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 250.00,
      onHandQuantity: 40.00,
      reservedQuantity: 0.00,
      minStockLevel: 50.00,
      reorderQuantity: 100.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      name: 'Wooden Table Top',
      sku: 'RM-WT-001',
      description: 'Solid teak table top panel, 180x90cm',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 1200.00,
      onHandQuantity: 12.00,
      reservedQuantity: 0.00,
      minStockLevel: 10.00,
      reorderQuantity: 20.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      name: 'Wood Screws (Box)',
      sku: 'RM-SC-001',
      description: 'Box of 50 wood screws, 4x40mm',
      category: 'Raw Material',
      unitOfMeasure: 'box',
      salesPrice: 0.00,
      costPrice: 120.00,
      onHandQuantity: 8.00,
      reservedQuantity: 0.00,
      minStockLevel: 20.00,
      reorderQuantity: 30.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      name: 'Wooden Chair Leg',
      sku: 'RM-CL-001',
      description: 'Solid wood chair leg, 45cm',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 150.00,
      onHandQuantity: 100.00,
      reservedQuantity: 0.00,
      minStockLevel: 80.00,
      reorderQuantity: 100.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      name: 'Chair Seat Panel',
      sku: 'RM-CS-001',
      description: 'Solid wood chair seat panel, 45x45cm',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 400.00,
      onHandQuantity: 30.00,
      reservedQuantity: 0.00,
      minStockLevel: 20.00,
      reorderQuantity: 30.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000006',
      name: 'Chair Back Panel',
      sku: 'RM-CB-001',
      description: 'Solid wood chair back panel',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 350.00,
      onHandQuantity: 25.00,
      reservedQuantity: 0.00,
      minStockLevel: 20.00,
      reorderQuantity: 30.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000007',
      name: 'Shelf Board',
      sku: 'RM-SB-001',
      description: 'Solid wood shelf board, 80x30cm',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 300.00,
      onHandQuantity: 20.00,
      reservedQuantity: 0.00,
      minStockLevel: 15.00,
      reorderQuantity: 25.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000008',
      name: 'Vertical Side Panel',
      sku: 'RM-VP-001',
      description: 'Vertical side panel for bookshelf, 180x30cm',
      category: 'Raw Material',
      unitOfMeasure: 'pcs',
      salesPrice: 0.00,
      costPrice: 600.00,
      onHandQuantity: 10.00,
      reservedQuantity: 0.00,
      minStockLevel: 10.00,
      reorderQuantity: 15.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
    {
      id: '20000000-0000-0000-0000-000000000009',
      name: 'Wood Finish (Litre)',
      sku: 'RM-WF-001',
      description: 'Teak wood finish varnish',
      category: 'Raw Material',
      unitOfMeasure: 'ltr',
      salesPrice: 0.00,
      costPrice: 180.00,
      onHandQuantity: 15.00,
      reservedQuantity: 0.00,
      minStockLevel: 10.00,
      reorderQuantity: 20.00,
      procurementType: 'purchase' as ProcurementType,
      procurementStrategy: 'mts' as ProcurementStrategy,
      createdBy: '00000000-0000-0000-0000-000000000002',
    },
  ];

  for (const p of productsData) {
    const productType: ProductType =
      p.category === 'Raw Material' ? 'raw_material' : 'finished_good';
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { productType },
      create: { ...p, productType },
    });
  }
  console.log('Products seeded.');

  // 3. Create BoMs
  const bomsData = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      productId: '10000000-0000-0000-0000-000000000001',
      name: 'Wooden Dining Table - Standard BoM',
      quantity: 1,
      isActive: true,
      notes: 'Standard recipe for 6-seater dining table',
      createdBy: '00000000-0000-0000-0000-000000000002',
      items: [
        { componentId: '20000000-0000-0000-0000-000000000001', quantity: 4.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000002', quantity: 1.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000003', quantity: 0.24, unitOfMeasure: 'box' },
        { componentId: '20000000-0000-0000-0000-000000000009', quantity: 0.50, unitOfMeasure: 'ltr' },
      ],
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      productId: '10000000-0000-0000-0000-000000000002',
      name: 'Wooden Chair - Standard BoM',
      quantity: 1,
      isActive: true,
      notes: 'Standard recipe for dining chair',
      createdBy: '00000000-0000-0000-0000-000000000002',
      items: [
        { componentId: '20000000-0000-0000-0000-000000000004', quantity: 4.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000005', quantity: 1.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000006', quantity: 1.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000003', quantity: 0.12, unitOfMeasure: 'box' },
        { componentId: '20000000-0000-0000-0000-000000000009', quantity: 0.25, unitOfMeasure: 'ltr' },
      ],
    },
    {
      id: '30000000-0000-0000-0000-000000000003',
      productId: '10000000-0000-0000-0000-000000000003',
      name: 'Wooden Bookshelf - Standard BoM',
      quantity: 1,
      isActive: true,
      notes: 'Standard recipe for 5-shelf bookshelf',
      createdBy: '00000000-0000-0000-0000-000000000002',
      items: [
        { componentId: '20000000-0000-0000-0000-000000000007', quantity: 5.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000008', quantity: 2.00, unitOfMeasure: 'pcs' },
        { componentId: '20000000-0000-0000-0000-000000000003', quantity: 0.40, unitOfMeasure: 'box' },
        { componentId: '20000000-0000-0000-0000-000000000009', quantity: 0.75, unitOfMeasure: 'ltr' },
      ],
    },
  ];

  for (const b of bomsData) {
    const existing = await prisma.bom.findUnique({ where: { id: b.id } });
    if (!existing) {
      await prisma.bom.create({
        data: {
          id: b.id,
          productId: b.productId,
          name: b.name,
          quantity: b.quantity,
          isActive: b.isActive,
          notes: b.notes,
          createdBy: b.createdBy,
          items: {
            create: b.items,
          },
        },
      });
    }
  }
  console.log('BoMs seeded.');

  // 4. Demo Sales Order (draft — for demo workflow)
  const demoOrderId = '40000000-0000-0000-0000-000000000001';
  const existingOrder = await prisma.salesOrder.findUnique({ where: { id: demoOrderId } });
  if (!existingOrder) {
    await prisma.salesOrder.create({
      data: {
        id: demoOrderId,
        orderNumber: 'SO-001',
        customerName: 'Rajesh Home Interiors',
        customerEmail: 'rajesh@homeinteriors.in',
        customerPhone: '+91 98765 43210',
        status: 'draft',
        notes: 'Demo order: 20 dining tables — will trigger shortage on confirm (only 5 on hand)',
        totalAmount: 300000,
        createdBy: '00000000-0000-0000-0000-000000000003',
        items: {
          create: [
            {
              productId: '10000000-0000-0000-0000-000000000001',
              quantityOrdered: 20,
              unitPrice: 15000,
            },
          ],
        },
      },
    });
    console.log('Demo sales order SO-001 seeded.');
  }

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
