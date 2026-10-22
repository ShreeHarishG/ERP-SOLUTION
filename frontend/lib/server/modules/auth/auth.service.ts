import { Prisma, type AuditAction } from '@prisma/client';
import prisma from '@/lib/server/db';
import crypto from 'crypto';
import { comparePassword, hashPassword } from '@/lib/server/utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/server/utils/jwt';
import { createAuditLog } from '@/lib/server/utils/auditLog';
import type { LoginDto, AuthResponse, JwtPayload } from '@/lib/server/modules/auth/auth.types';
import type { RegisterInput } from '@/lib/server/modules/auth/auth.validation';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class AuthService {
  async register(dto: RegisterInput): Promise<AuthResponse> {
    const hashedPassword = await hashPassword(dto.password);

    let user: any;
    let accessToken: string;
    let refreshToken: string;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Atomic advisory lock prevents race conditions on empty DB signups
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(1001)`;
        const existingCount = await tx.user.count();
        const role = existingCount === 0 ? 'admin' : 'sales';

        const createdUser = await tx.user.create({
          data: {
            name: dto.name,
            email: dto.email.toLowerCase().trim(),
            passwordHash: hashedPassword,
            role,
            isActive: true,
            companyName: dto.companyName,
            phone: dto.phone,
            country: dto.country,
            language: dto.language,
            companySize: dto.companySize,
            primaryInterest: dto.primaryInterest,
          },
        });

        const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
          sub: createdUser.id,
          email: createdUser.email,
          role: createdUser.role,
          name: createdUser.name,
        };

        const access = generateAccessToken(jwtPayload);
        const refresh = generateRefreshToken(jwtPayload);
        const tokenHash = hashToken(refresh);

        await tx.refreshToken.create({
          data: {
            tokenHash,
            userId: createdUser.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isRevoked: false,
          },
        });

        return { user: createdUser, access, refresh };
      });

      user = result.user;
      accessToken = result.access;
      refreshToken = result.refresh;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw Object.assign(new Error('Email is already registered'), { statusCode: 409 });
      }
      throw err;
    }

    await createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'user_created',
      entityType: 'user',
      entityName: user.email,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    if (!user.isActive) {
      throw Object.assign(new Error('Your account is deactivated. Contact administrator.'), {
        statusCode: 403,
      });
    }

    const isMatch = await comparePassword(dto.password, user.passwordHash);
    if (!isMatch) {
      throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    }

    const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);
    const tokenHash = hashToken(refreshToken);

    // Persist refresh token session in database for revocation tracking
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });

    void createAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'login' as AuditAction,
      entityType: 'session',
      entityName: user.email,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Object.assign(new Error('Invalid or expired refresh token'), { statusCode: 401 });
    }

    const tokenHash = hashToken(refreshToken);
    const storedSession = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    // Revocation & Token Replay Detection
    if (!storedSession || storedSession.isRevoked) {
      if (storedSession && storedSession.isRevoked) {
        // A previously used/revoked token was presented: Compromise detection!
        // Immediately revoke ALL sessions for this user.
        await prisma.refreshToken.updateMany({
          where: { userId: payload.sub },
          data: { isRevoked: true },
        });
        console.warn(`[Security Alert] Refresh token reuse detected for user ${payload.sub}! Revoking all sessions.`);
      }
      throw Object.assign(new Error('Invalid or revoked refresh token'), { statusCode: 401 });
    }

    // Check expiration in DB
    if (new Date() > storedSession.expiresAt) {
      await prisma.refreshToken.update({
        where: { id: storedSession.id },
        data: { isRevoked: true },
      });
      throw Object.assign(new Error('Refresh token expired'), { statusCode: 401 });
    }

    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      await prisma.refreshToken.update({
        where: { id: storedSession.id },
        data: { isRevoked: true },
      });
      throw Object.assign(new Error('User account is deactivated or deleted'), { statusCode: 401 });
    }

    // Revoke old refresh token (Single-use rotating refresh token)
    await prisma.refreshToken.update({
      where: { id: storedSession.id },
      data: { isRevoked: true },
    });

    // Generate new token pair
    const newAccessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const newRefreshToken = generateRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Store new session record
    const newHash = hashToken(newRefreshToken);
    await prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async revokeToken(refreshToken: string): Promise<void> {
    try {
      const tokenHash = hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } catch (err) {
      console.warn('[AuthService] Could not revoke token:', err);
    }
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    return user;
  }
}

export const authService = new AuthService();
