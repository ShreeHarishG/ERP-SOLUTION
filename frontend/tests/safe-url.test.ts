import { describe, it } from 'node:test';
import assert from 'node:assert';
import { assertSafeHttpUrl } from '../lib/server/utils/safe-url';

describe('Safe URL SSRF Protection', () => {
  it('allows safe public https URLs', () => {
    const url = 'https://webhook.site/abc-123';
    const result = assertSafeHttpUrl(url);
    assert.strictEqual(result, url);
  });

  it('allows safe public domain with query parameters', () => {
    const url = 'https://api.example.com/v1/webhook?source=control-tower';
    const result = assertSafeHttpUrl(url);
    assert.strictEqual(result, url);
  });

  it('rejects loopback localhost and 127.0.0.1', () => {
    assert.throws(() => assertSafeHttpUrl('https://localhost:3000'), /Webhook host is not allowed/i);
    assert.throws(() => assertSafeHttpUrl('https://127.0.0.1:8000'), /Webhook host is not allowed/i);
  });

  it('rejects RFC1918 private ranges', () => {
    assert.throws(() => assertSafeHttpUrl('https://10.0.0.1/webhook'), /Webhook host is not allowed/i);
    assert.throws(() => assertSafeHttpUrl('https://172.16.0.10:8080'), /Webhook host is not allowed/i);
    assert.throws(() => assertSafeHttpUrl('https://192.168.1.1/secret'), /Webhook host is not allowed/i);
  });

  it('rejects cloud metadata IP 169.254.169.254', () => {
    assert.throws(
      () => assertSafeHttpUrl('https://169.254.169.254/latest/meta-data/'),
      /Webhook host is not allowed/i
    );
  });

  it('rejects non-http protocols (file://, gopher://, ftp://)', () => {
    assert.throws(() => assertSafeHttpUrl('file:///etc/passwd'), /Webhook URL must use HTTPS/i);
    assert.throws(() => assertSafeHttpUrl('gopher://evil.com/'), /Webhook URL must use HTTPS/i);
  });
});
