import { jsonSuccess } from '@/lib/server/api-response';
import { clearAuthCookies, getRefreshToken } from '@/lib/server/cookies';
import { getCurrentUser } from '@/lib/server/auth';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import { handleRoute } from '@/lib/server/handle-route';
import { authService } from '@/lib/server/modules/auth/auth.service';
import type { AuditAction, UserRole } from '@prisma/client';

export async function POST() {
  return handleRoute(async () => {
    const user = await getCurrentUser();
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      try {
        await authService.revokeToken(refreshToken);
      } catch (err) {
        console.warn('[Logout] Failed to revoke session token:', err);
      }
    }

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
