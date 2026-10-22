import net from 'net';
import tls from 'tls';

type CacheEntry = { value: string; expiresAt: number };

const memory = new Map<string, CacheEntry>();

const DEFAULT_TTL_SEC = 45;

function memoryGet(key: string): string | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.value;
}

function memorySet(key: string, value: string, ttlSec: number) {
  memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

function memoryDel(key: string) {
  memory.delete(key);
}

function memoryDelPrefix(prefix: string) {
  for (const key of memory.keys()) {
    if (key.startsWith(prefix)) memory.delete(key);
  }
}

function encodeResp(args: string[]): string {
  let out = `*${args.length}\r\n`;
  for (const arg of args) {
    const payload = Buffer.from(arg);
    out += `$${payload.length}\r\n${arg}\r\n`;
  }
  return out;
}

function parseBulkOrStatus(raw: string): string | null {
  if (raw.startsWith('-')) {
    throw new Error(raw.slice(1).trim());
  }
  if (raw.startsWith('+') || raw.startsWith(':')) {
    const end = raw.indexOf('\r\n');
    return raw.slice(1, end);
  }
  if (raw.startsWith('$-1')) return null;
  if (raw.startsWith('$')) {
    const headerEnd = raw.indexOf('\r\n');
    const size = Number(raw.slice(1, headerEnd));
    if (size < 0) return null;
    return raw.slice(headerEnd + 2, headerEnd + 2 + size);
  }
  return raw;
}

async function redisCommand(args: string[], timeoutMs = 800): Promise<string | null> {
  const urlRaw = process.env.REDIS_URL;
  if (!urlRaw) return null;

  const url = new URL(urlRaw);
  const useTls = url.protocol === 'rediss:';
  const port = Number(url.port || (useTls ? 6380 : 6379));
  const host = url.hostname;
  const password = decodeURIComponent(url.password || '');

  return new Promise((resolve, reject) => {
    const socket = useTls
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port });

    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('Redis timeout'));
    }, timeoutMs);

    let buffer = '';
    const commands: string[] = [];
    if (password) commands.push(encodeResp(['AUTH', password]));
    commands.push(encodeResp(args));

    socket.on('connect', () => {
      socket.write(commands.join(''));
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const parts = buffer.split('\r\n').filter((part) => part.length > 0);
      if (password && parts.length < 2) return;
      clearTimeout(timer);
      socket.end();
      try {
        const payload = password ? buffer.slice(buffer.indexOf('\r\n') + 2) : buffer;
        resolve(parseBulkOrStatus(payload));
      } catch (err) {
        reject(err);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function upstashCommand(args: string[]): Promise<string | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;

  const res = await fetch(`${base.replace(/\/$/, '')}/${args.map(encodeURIComponent).join('/')}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { result?: string | null };
  return body.result ?? null;
}

async function remoteGet(key: string): Promise<string | null> {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      return await upstashCommand(['GET', key]);
    }
    if (process.env.REDIS_URL) {
      return await redisCommand(['GET', key]);
    }
  } catch (err) {
    console.warn('[cache] remote get failed, using memory only', (err as Error).message);
  }
  return null;
}

async function remoteSet(key: string, value: string, ttlSec: number): Promise<void> {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      await upstashCommand(['SET', key, value, 'EX', String(ttlSec)]);
      return;
    }
    if (process.env.REDIS_URL) {
      await redisCommand(['SET', key, value, 'EX', String(ttlSec)]);
    }
  } catch (err) {
    console.warn('[cache] remote set failed', (err as Error).message);
  }
}

async function remoteDel(key: string): Promise<void> {
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      await upstashCommand(['DEL', key]);
      return;
    }
    if (process.env.REDIS_URL) {
      await redisCommand(['DEL', key]);
    }
  } catch (err) {
    console.warn('[cache] remote del failed', (err as Error).message);
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const local = memoryGet(key);
  if (local) {
    try {
      return JSON.parse(local) as T;
    } catch {
      return null;
    }
  }

  const remote = await remoteGet(key);
  if (!remote) return null;
  memorySet(key, remote, DEFAULT_TTL_SEC);
  try {
    return JSON.parse(remote) as T;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSec = DEFAULT_TTL_SEC): Promise<void> {
  const encoded = JSON.stringify(value);
  memorySet(key, encoded, ttlSec);
  await remoteSet(key, encoded, ttlSec);
}

export async function cacheDelete(key: string): Promise<void> {
  memoryDel(key);
  await remoteDel(key);
}

export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  memoryDelPrefix(prefix);
  const known = [
    `${prefix}:p1:l5`,
    `${prefix}:p1:l20`,
    `${prefix}:p1:l50`,
    `${prefix}:summary`,
  ];
  await Promise.all(known.map((key) => remoteDel(key)));
}

export async function cached<T>(
  key: string,
  loader: () => Promise<T>,
  ttlSec = DEFAULT_TTL_SEC,
): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const fresh = await loader();
  await cacheSet(key, fresh, ttlSec);
  return fresh;
}

export function listCacheKey(resource: string, page: number, limit: number, extra = '') {
  return extra ? `list:${resource}:p${page}:l${limit}:${extra}` : `list:${resource}:p${page}:l${limit}`;
}
