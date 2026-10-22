import prisma from '@/lib/server/db';
import { hashPassword } from '@/lib/server/utils/password';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { UserRole } from '@prisma/client';
import type { CreateUserInput, UpdateUserInput } from '@/lib/server/modules/users/users.validation';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UsersService {
  async list(filters: {
    search?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, role, isActive, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role as UserRole;
    if (isActive !== undefined) where.isActive = isActive;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }

  async create(
    dto: CreateUserInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    }

    const passwordHash = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role as UserRole,
        isActive: dto.isActive ?? true,
      },
      select: USER_SELECT,
    });

    createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'user_created',
      entityType: 'user',
      entityId: user.id,
      entityName: user.name,
      newValues: { name: user.name, email: user.email, role: user.role },
    });

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserInput,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const data: Record<string, unknown> = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email.toLowerCase();
    if (dto.password) data.passwordHash = await hashPassword(dto.password);
    if (dto.role) data.role = dto.role as UserRole;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT,
    });

    createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'user_updated',
      entityType: 'user',
      entityId: user.id,
      entityName: user.name,
      oldValues: {
        name: existing.name,
        email: existing.email,
        role: existing.role,
        isActive: existing.isActive,
      },
      newValues: { name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });

    return user;
  }

  async toggleStatus(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    if (id === actorId) {
      throw Object.assign(new Error('You cannot deactivate your own account'), { statusCode: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: USER_SELECT,
    });

    createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: user.isActive ? 'user_updated' : 'user_deleted',
      entityType: 'user',
      entityId: user.id,
      entityName: user.name,
      newValues: { isActive: user.isActive },
    });

    return user;
  }

  async delete(
    id: string,
    actorId: string,
    actorName: string,
    actorRole: UserRole,
  ) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    if (id === actorId) {
      throw Object.assign(new Error('You cannot delete your own account'), { statusCode: 400 });
    }

    await prisma.user.delete({ where: { id } });

    createAuditLog({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action: 'user_deleted',
      entityType: 'user',
      entityId: id,
      entityName: existing.name,
    });

    return { message: 'User deleted successfully' };
  }
}

export const usersService = new UsersService();
