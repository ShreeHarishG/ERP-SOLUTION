import { describe, it } from 'node:test';
import assert from 'node:assert';
import prisma from '../lib/server/db';
import {
  generateSalesOrderNumber,
  generateManufacturingOrderNumber,
  generatePurchaseOrderNumber,
} from '../lib/server/utils/order-number';

describe('Database Sequences & Order Numbers', () => {
  it('generates sequential SO order numbers using PostgreSQL sequences', async () => {
    const orderNumber = await prisma.$transaction(async (tx) => {
      return generateSalesOrderNumber(tx);
    });

    assert.ok(typeof orderNumber === 'string');
    assert.match(orderNumber, /^SO-\d{3,}$/);
  });

  it('generates sequential MO order numbers using PostgreSQL sequences', async () => {
    const orderNumber = await prisma.$transaction(async (tx) => {
      return generateManufacturingOrderNumber(tx);
    });

    assert.ok(typeof orderNumber === 'string');
    assert.match(orderNumber, /^MO-\d{3,}$/);
  });

  it('generates sequential PO order numbers using PostgreSQL sequences', async () => {
    const orderNumber = await prisma.$transaction(async (tx) => {
      return generatePurchaseOrderNumber(tx);
    });

    assert.ok(typeof orderNumber === 'string');
    assert.match(orderNumber, /^PO-\d{3,}$/);
  });
});
