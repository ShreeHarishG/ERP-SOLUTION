import { jsonSuccess } from '@/lib/server/api-response';
import { clearAuthCookies } from '@/lib/server/cookies';
import { getCurrentUser } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { handleRoute } from '@/lib/server/handle-route';
import type { AuditAction, UserRole } from '@prisma/client';

export async function POST() {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    if (user) {
      void createAuditLog({
        userId: user.sub,
        userName: user.name,
        userRole: user.role as UserRole,
        action: 'logout' as AuditAction,
        entityType: 'session',
        entityName: user.email,
      });
    }

    const response = jsonSuccess(null, 'Logged out successfully');
    return clearAuthCookies(response);
  });
}
