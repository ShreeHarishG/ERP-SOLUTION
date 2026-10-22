import prisma from '@/lib/server/db';
import type { AuditAction, UserRole } from '@prisma/client';

interface CreateAuditLogParams {
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const createAuditLog = async (params: CreateAuditLogParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        oldValues: params.oldValues as object,
        newValues: params.newValues as object,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err);
  }
};
