import {
  applyRequestContextMiddleware,
  createPlatformLogger,
  createRateLimitMiddleware,
  recordHttpMetrics,
} from '@xevn/platform-core';
import type { Logger } from 'pino';
import type { NextFunction, Request, Response } from 'express';

export const XBOS_SERVICE_NAME = 'xbos-api';
export const xbosRootLogger: Logger = createPlatformLogger({ service: XBOS_SERVICE_NAME });

const rateLimit = createRateLimitMiddleware({
  max: Number(process.env.XBOS_RATE_LIMIT_MAX ?? process.env.RATE_LIMIT_MAX ?? 300),
  windowMs: Number(process.env.XBOS_RATE_LIMIT_WINDOW_MS ?? process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
});

export function registerXbosPlatformMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  applyRequestContextMiddleware(req, res, xbosRootLogger);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'SAMEORIGIN');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'content-security-policy',
    "default-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
  );
  next();
}

export async function xbosRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const allowed = await rateLimit(req, res);
  if (allowed) next();
}

export function xbosMetricsOnFinish(req: Request, res: Response): void {
  const startedAt = Date.now();
  res.on('finish', () => {
    const route = (req.route?.path as string | undefined) ?? req.path ?? req.url ?? 'unknown';
    recordHttpMetrics(XBOS_SERVICE_NAME, {
      method: req.method ?? 'GET',
      route,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
}
