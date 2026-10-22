import { jsonError, jsonSuccess } from '@/lib/server/api-response';
import { requireAuth, isErrorResponse } from '@/lib/server/auth';
import { handleRoute } from '@/lib/server/handle-route';
import { env } from '@/lib/server/env';

export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    if (isErrorResponse(user)) return user;

    const body = await request.json();
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return jsonError('Question is required', 400);
    }

    const fastapiUrl = env.FASTAPI_URL || process.env.FASTAPI_URL || 'http://localhost:8000';
    const secret = env.FASTAPI_INTERNAL_SECRET || process.env.FASTAPI_INTERNAL_SECRET || '';
    if (!secret) {
      return jsonError('AI copilot is not configured', 503);
    }

    const response = await fetch(`${fastapiUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
        'x-user-role': user.role,
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      return jsonError('AI copilot request failed', 502);
    }

    const data = await response.json();
    return jsonSuccess({ answer: data.answer ?? data }, 'OK');
  });
}
