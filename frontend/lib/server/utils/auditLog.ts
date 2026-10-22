import prisma from '@/lib/server/db';
import type { AuditAction, Prisma, UserRole } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

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

function toCreateData(params: CreateAuditLogParams) {
  return {
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    oldValues: params.oldValues as object | undefined,
    newValues: params.newValues as object | undefined,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  };
}

export const createAuditLog = async (
  params: CreateAuditLogParams,
  db: DbClient = prisma,
): Promise<void> => {
  try {
    await db.auditLog.create({ data: toCreateData(params) });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit log:', err);
  }
};

export const createAuditLogs = async (
  entries: CreateAuditLogParams[],
  db: DbClient = prisma,
): Promise<void> => {
  if (entries.length === 0) return;
  try {
    await db.auditLog.createMany({ data: entries.map(toCreateData) });
  } catch (err) {
    console.error('[AuditLog] Failed to write audit logs:', err);
  }
};
