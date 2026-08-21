import type { NextFunction, Request, Response } from 'express';

const seenKeys = new Map<string, number>();
const TTL_MS = 24 * 60 * 60 * 1000;

export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    next();
    return;
  }
  const key = (req.headers['idempotency-key'] as string | undefined)?.trim();
  if (!key) {
    next();
    return;
  }
  const now = Date.now();
  const existing = seenKeys.get(key);
  if (existing && now - existing < TTL_MS) {
    res.status(409).json({
      success: false,
      code: 'HRM-IDEMPOTENCY-409',
      message: 'Duplicate Idempotency-Key',
      timestamp: new Date().toISOString(),
    });
    return;
  }
  seenKeys.set(key, now);
  next();
}
