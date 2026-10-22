import prisma from '@/lib/server/db';
import { requireAuth, requireRole, isErrorResponse } from '@/lib/server/auth';
import { jsonSuccess, jsonError } from '@/lib/server/api-response';
import { handleRoute } from '@/lib/server/handle-route';

const DEFAULT_VENDORS = [
  { name: 'Global Timber Ltd', email: 'sales@globaltimber.com', phone: '+91 88888 77777' },
  { name: 'Apex Fasteners Corp', email: 'info@apexfasteners.com', phone: '+91 77777 66666' },
  { name: 'Rainbow Coatings', email: 'orders@rainbowcoatings.com', phone: '+91 66666 55555' },
  { name: 'Woodland Supplies', email: 'woodland@teakwood.in', phone: '+91 99999 88888' },
];

export async function GET() {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const count = await prisma.vendor.count();
    if (count === 0) {
      await prisma.vendor.createMany({
        data: DEFAULT_VENDORS,
      });
    }

    const vendors = await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });

    return jsonSuccess(vendors, 'Vendors fetched successfully');
  });
}

export async function POST(req: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'purchase');
    if (isErrorResponse(user)) return user;

    const payload = await req.json();
    const { name, email, phone } = payload;

    if (!name) {
      return jsonError('Vendor name is required', 400);
    }

    const existing = await prisma.vendor.findUnique({
      where: { name },
    });
    if (existing) {
      return jsonError('Vendor with this name already exists', 400);
    }

    const vendor = await prisma.vendor.create({
      data: { name, email: email || null, phone: phone || null },
    });

    return jsonSuccess(vendor, 'Vendor added successfully', 201);
  });
}

export async function DELETE(request: Request) {
  return handleRoute(async () => {
    const user = await requireRole('admin', 'purchase');
    if (isErrorResponse(user)) return user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return jsonError('Vendor ID is required', 400);
    }

    const vendorToDelete = await prisma.vendor.findUnique({
      where: { id },
    });
    if (!vendorToDelete) {
      return jsonError('Vendor not found', 404);
    }

    const POWithVendor = await prisma.purchaseOrder.findFirst({
      where: { vendorName: vendorToDelete.name },
    });
    if (POWithVendor) {
      return jsonError('Cannot delete vendor because they have active purchase orders', 400);
    }

    await prisma.vendor.delete({
      where: { id },
    });

    return jsonSuccess(null, 'Vendor deleted successfully');
  });
}

