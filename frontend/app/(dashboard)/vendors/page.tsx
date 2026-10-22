import React from 'react';
import VendorsClient from '@/components/vendors/VendorsClient';
import prisma from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export default async function VendorsPage() {
  let initialVendors: any = null;

  try {
    const count = await prisma.vendor.count();
    if (count === 0) {
      await prisma.vendor.createMany({
        data: [
          { name: 'Global Timber Ltd', email: 'sales@globaltimber.com', phone: '+91 88888 77777' },
          { name: 'Apex Fasteners Corp', email: 'info@apexfasteners.com', phone: '+91 77777 66666' },
          { name: 'Rainbow Coatings', email: 'orders@rainbowcoatings.com', phone: '+91 66666 55555' },
          { name: 'Woodland Supplies', email: 'woodland@teakwood.in', phone: '+91 99999 88888' },
        ],
      });
    }

    const vendors = await prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    });
    initialVendors = JSON.parse(JSON.stringify(vendors));
  } catch (err) {
    console.error('Failed to pre-fetch vendors on server:', err);
  }

  return <VendorsClient initialData={initialVendors} />;
}
