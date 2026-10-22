import { NextResponse } from 'next/server';

export const jsonSuccess = <T>(
  data: T,
  message = 'Success',
  status = 200,
): NextResponse => {
  return NextResponse.json({ success: true, message, data }, { status });
};

export const jsonError = (
  message: string,
  status = 500,
  errors?: unknown,
): NextResponse => {
  return NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status },
  );
};
