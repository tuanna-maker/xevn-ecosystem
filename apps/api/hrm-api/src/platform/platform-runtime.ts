import {
  applyRequestContextMiddleware,
  createPlatformLogger,
  createRateLimitMiddleware,
  recordHttpMetrics,
} from '@xevn/platform-core';
import type { Logger } from 'pino';
import type { NextFunction, Request, Response } from 'express';

export const HRM_SERVICE_NAME = 'hrm-api';
export const hrmRootLogger: Logger = createPlatformLogger({ service: HRM_SERVICE_NAME });

const rateLimit = createRateLimitMiddleware({
  max: Number(process.env.HRM_RATE_LIMIT_MAX ?? process.env.RATE_LIMIT_MAX ?? 300),
  windowMs: Number(process.env.HRM_RATE_LIMIT_WINDOW_MS ?? process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
});

export function registerHrmPlatformMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  applyRequestContextMiddleware(req, res, hrmRootLogger);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'SAMEORIGIN');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'content-security-policy',
    "default-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  );
  next();
}

function isLoopbackClient(req: Request): boolean {
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
  const ip = forwarded || req.socket.remoteAddress || '';
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('127.')
  );
}

export async function hrmRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (process.env.NODE_ENV !== 'production' && isLoopbackClient(req)) {
    next();
    return;
  }
  const allowed = await rateLimit(req, res);
  if (allowed) next();
}

export function hrmMetricsOnFinish(req: Request, res: Response): void {
  const startedAt = Date.now();
  res.on('finish', () => {
    const route = (req.route?.path as string | undefined) ?? req.path ?? req.url ?? 'unknown';
    const codeHeader = res.getHeader('x-api-code');
    recordHttpMetrics(HRM_SERVICE_NAME, {
      method: req.method ?? 'GET',
      route,
      status: res.statusCode,
      code: typeof codeHeader === 'string' ? codeHeader : undefined,
      durationMs: Date.now() - startedAt,
    });
  });
}
