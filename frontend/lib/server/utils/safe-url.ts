const BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
  'metadata.google.internal',
]);

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  if (a === 10 || a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

export function assertSafeHttpUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw Object.assign(new Error('Invalid webhook URL'), { statusCode: 400 });
  }

  const allowHttp = process.env.NODE_ENV !== 'production';
  if (parsed.protocol !== 'https:' && !(allowHttp && parsed.protocol === 'http:')) {
    throw Object.assign(new Error('Webhook URL must use HTTPS'), { statusCode: 400 });
  }

  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith('.internal') || host.endsWith('.local')) {
    throw Object.assign(new Error('Webhook host is not allowed'), { statusCode: 400 });
  }
  if (isPrivateIpv4(host)) {
    throw Object.assign(new Error('Webhook host is not allowed'), { statusCode: 400 });
  }

  return parsed.toString();
}
