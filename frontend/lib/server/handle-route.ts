import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { jsonError } from '@/lib/server/api-response';

interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

function mapKnownError(err: unknown): { status: number; message: string; errors?: unknown } | null {
  if (err instanceof ZodError) {
    return {
      status: 400,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    };
  }

  if (err instanceof SyntaxError) {
    return { status: 400, message: 'Malformed JSON body' };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return { status: 409, message: 'A record with this value already exists' };
    }
    if (err.code === 'P2025') {
      return { status: 404, message: 'Record not found' };
    }
    if (err.code === 'P2003') {
      return { status: 400, message: 'Related record does not exist' };
    }
  }

  return null;
}

export async function handleRoute(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    const mapped = mapKnownError(err);
    if (mapped) {
      console.warn(`[Client ${mapped.status}] ${mapped.message}`);
      return jsonError(mapped.message, mapped.status, mapped.errors);
    }

    const error = err as AppError;
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? 'Internal Server Error';

    if (statusCode >= 500) {
      const correlationId = crypto.randomUUID();
      console.error(`[Server Error] ${correlationId} ${statusCode} - ${message}`, error.stack);
      return jsonError('Internal Server Error', 500, { correlationId });
    }

    console.warn(`[Client ${statusCode}] ${message}`);
    return jsonError(message, statusCode, error.errors);
  }
}
