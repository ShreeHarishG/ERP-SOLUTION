// Pre-populate test environment variables before module imports
process.env.JWT_ACCESS_SECRET = 'test-access-secret-minimum-32-chars-long-123';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-minimum-32-chars-long-123';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/testdb';

import { describe, it } from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';
import { generateAccessToken, verifyAccessToken } from '../lib/server/utils/jwt';

describe('Auth & Cryptography', () => {
  it('generates and verifies signed access tokens', () => {
    const payload = {
      sub: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      email: 'test@chainiq.io',
      role: 'sales',
      name: 'Test Analyst',
    };

    const token = generateAccessToken(payload);
    assert.ok(typeof token === 'string' && token.length > 20);

    const verified = verifyAccessToken(token);
    assert.strictEqual(verified.sub, payload.sub);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.role, payload.role);
    assert.strictEqual(verified.name, payload.name);
  });

  it('rejects tampered access tokens', () => {
    const payload = {
      sub: 'a3bb189e-8bf9-3888-9912-ace4e6543002',
      email: 'test@chainiq.io',
      role: 'sales',
      name: 'Test Analyst',
    };

    const token = generateAccessToken(payload);
    const tampered = token.slice(0, -6) + 'xxxxxx';
    assert.throws(() => verifyAccessToken(tampered));
  });

  it('computes deterministic SHA-256 hashes for refresh tokens', () => {
    const secret = 'test-refresh-token-value-12345';
    const hash1 = crypto.createHash('sha256').update(secret).digest('hex');
    const hash2 = crypto.createHash('sha256').update(secret).digest('hex');
    assert.strictEqual(hash1, hash2);
    assert.strictEqual(hash1.length, 64);
  });
});
