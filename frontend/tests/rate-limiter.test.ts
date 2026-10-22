import { describe, it } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, getClientIp } from '../lib/server/rate-limiter';

describe('Rate Limiter Module', () => {
  it('allows requests within window threshold', () => {
    const testIp = '198.51.100.42';
    const first = checkRateLimit(testIp, 3, 60000);
    assert.strictEqual(first.success, true);
    assert.strictEqual(first.remaining, 2);

    const second = checkRateLimit(testIp, 3, 60000);
    assert.strictEqual(second.success, true);
    assert.strictEqual(second.remaining, 1);
  });

  it('blocks requests exceeding maximum threshold', () => {
    const testIp = '198.51.100.99';
    checkRateLimit(testIp, 2, 60000);
    checkRateLimit(testIp, 2, 60000);

    const third = checkRateLimit(testIp, 2, 60000);
    assert.strictEqual(third.success, false);
    assert.strictEqual(third.remaining, 0);
    assert.ok(typeof third.retryAfterSec === 'number' && third.retryAfterSec > 0);
  });

  it('correctly parses Cloudflare cf-connecting-ip header', () => {
    const req = new Request('https://api.chainiq.internal/api/auth/login', {
      headers: {
        'cf-connecting-ip': '203.0.113.195',
      },
    });
    assert.strictEqual(getClientIp(req), '203.0.113.195');
  });

  it('extracts leftmost IP from x-forwarded-for chain', () => {
    const req = new Request('https://api.chainiq.internal/api/auth/login', {
      headers: {
        'x-forwarded-for': '198.51.100.12, 10.0.0.1, 172.16.0.2',
      },
    });
    assert.strictEqual(getClientIp(req), '198.51.100.12');
  });
});
