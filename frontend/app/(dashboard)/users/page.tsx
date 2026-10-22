import React from 'react';
import UsersClient from '@/components/users/UsersClient';
import { usersService } from '@/lib/server/modules/users/users.service';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  let initialData: any = null;

  try {
    const result = await usersService.list({ page: 1, limit: 10 });
    initialData = JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.error('Failed to pre-fetch users on server:', err);
  }

  return <UsersClient initialData={initialData} />;
}
