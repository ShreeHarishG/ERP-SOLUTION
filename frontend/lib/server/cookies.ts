import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes (seconds)
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)

const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: (IS_PROD ? 'strict' : 'lax') as 'strict' | 'lax',
  path: '/',
};

export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe = false,
): NextResponse => {
  response.cookies.set('access_token', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set('refresh_token', refreshToken, {
    ...cookieOptions,
    ...(rememberMe ? { maxAge: REFRESH_TOKEN_MAX_AGE } : {}),
  });

  return response;
};

export const setAccessTokenCookie = (
  response: NextResponse,
  accessToken: string,
): NextResponse => {
  response.cookies.set('access_token', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  return response;
};

export const clearAuthCookies = (response: NextResponse): NextResponse => {
  response.cookies.set('access_token', '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set('refresh_token', '', { ...cookieOptions, maxAge: 0 });
  return response;
};

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('refresh_token')?.value;
}
