import type { IncomingMessage, ServerResponse } from 'node:http';

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  max: number;
  windowMs: number;
  redisUrl?: string;
};

export type RateLimitDecision = { allowed: boolean; remaining: number; resetAt: number };

function memoryRateLimit(key: string, opts: RateLimitOptions): RateLimitDecision {
  const now = Date.now();
  let bucket = memoryBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + opts.windowMs };
    memoryBuckets.set(key, bucket);
  }
  bucket.count += 1;
  const allowed = bucket.count <= opts.max;
  return { allowed, remaining: Math.max(0, opts.max - bucket.count), resetAt: bucket.resetAt };
}

import Redis from 'ioredis';

let redisClient: Redis | null = null;

function getRedis(url: string): Redis {
  if (!redisClient) {
    redisClient = new Redis(url, { maxRetriesPerRequest: 1 });
  }
  return redisClient;
}

async function redisRateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitDecision> {
  const redis = getRedis(opts.redisUrl!);
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / opts.windowMs)}`;
  const count = await redis.incr(windowKey);
  if (count === 1) {
    await redis.pexpire(windowKey, opts.windowMs);
  }
  const ttl = await redis.pttl(windowKey);
  const resetAt = now + (ttl > 0 ? ttl : opts.windowMs);
  return {
    allowed: count <= opts.max,
    remaining: Math.max(0, opts.max - count),
    resetAt,
  };
}

export async function checkRateLimit(ip: string, opts: RateLimitOptions): Promise<RateLimitDecision> {
  const key = ip || 'unknown';
  if (opts.redisUrl) {
    try {
      return await redisRateLimit(key, opts);
    } catch {
      return memoryRateLimit(key, opts);
    }
  }
  return memoryRateLimit(key, opts);
}

export function createRateLimitMiddleware(opts: RateLimitOptions) {
  const redisUrl = opts.redisUrl ?? process.env.REDIS_URL?.trim();
  const max = Number(process.env.RATE_LIMIT_MAX ?? opts.max);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? opts.windowMs);
  const effective: RateLimitOptions = { ...opts, max, windowMs, redisUrl };

  return async function rateLimitMiddleware(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const decision = await checkRateLimit(ip, effective);
    res.setHeader('X-RateLimit-Limit', String(effective.max));
    res.setHeader('X-RateLimit-Remaining', String(decision.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(decision.resetAt / 1000)));
    if (!decision.allowed) {
      res.statusCode = 429;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          code: 'RATE-429',
          message: 'Too many requests',
          timestamp: new Date().toISOString(),
        }),
      );
      return false;
    }
    return true;
  };
}
