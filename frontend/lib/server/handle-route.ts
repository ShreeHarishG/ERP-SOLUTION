import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/server/api-response';

interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export async function handleRoute(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (err) {
    const error = err as AppError;
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? 'Internal Server Error';

    if (statusCode >= 500) {
      console.error(`[Server Error] ${statusCode} - ${message}`, error.stack);
    } else {
      console.warn(`[Client ${statusCode}] ${message}`);
    }

    return jsonError(
      message,
      statusCode,
      error.errors ??
        (process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined),
    );
  }
}
