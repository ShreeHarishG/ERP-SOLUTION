import crypto from 'crypto';

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Cleanup stale records every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 15 * 60 * 1000);
    if (record.timestamps.length === 0) {
      ipRequestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

if (typeof cleanupTimer.unref === 'function') {
  cleanupTimer.unref();
}

/**
 * In-memory sliding-window rate limiter for high-risk authentication routes.
 */
export function checkRateLimit(
  ip: string,
  maxRequests = 10,
  windowMs = 15 * 60 * 1000
): { success: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const record = ipRequestMap.get(ip) || { timestamps: [] };

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return { success: false, remaining: 0, retryAfterSec };
  }

  record.timestamps.push(now);
  ipRequestMap.set(ip, record);

  return {
    success: true,
    remaining: maxRequests - record.timestamps.length,
  };
}

export function getClientIp(request: Request): string {
  // 1. Cloudflare Connecting IP
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  // 2. Vercel Forwarded For
  const xVercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  if (xVercelForwardedFor) {
    const ip = xVercelForwardedFor.split(',')[0].trim();
    if (isValidIp(ip)) return ip;
  }

  // 3. Real IP header (Nginx / HAProxy / ALB)
  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp.trim())) {
    return realIp.trim();
  }

  // 4. Standard X-Forwarded-For header (leftmost entry is original client)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ip = xForwardedFor.split(',')[0].trim();
    if (isValidIp(ip)) return ip;
  }

  // 5. In local development, use loopback
  if (process.env.NODE_ENV === 'development') {
    return '127.0.0.1';
  }

  // 6. In production without trusted IP headers, generate a per-client fallback
  // to avoid collapsing all anonymous traffic into a single rate-limit bucket
  const ua = request.headers.get('user-agent') || 'unknown-ua';
  const acceptLang = request.headers.get('accept-language') || 'unknown-lang';
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ua}:${acceptLang}`)
    .digest('hex')
    .substring(0, 16);

  return `anon_${fingerprint}`;
}

function isValidIp(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^[0-9a-fA-F:]+$/;
  return (ipv4Regex.test(ip) || ipv6Regex.test(ip)) && ip.length <= 45;
}

