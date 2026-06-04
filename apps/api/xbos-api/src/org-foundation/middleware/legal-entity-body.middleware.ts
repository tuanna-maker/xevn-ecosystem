import type { NextFunction, Request, Response } from 'express';
import { enrichLegalEntityRequestBody } from '../legal-entity-body.util';

function coerceJsonBody(req: Request): void {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf8')) as unknown;
    } catch {
      /* leave as-is */
    }
    return;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      req.body = JSON.parse(req.body) as unknown;
    } catch {
      /* leave as-is — ValidationPipe will fail with a clear message */
    }
  }
}

function isLegalEntityMutation(req: Request): boolean {
  const method = req.method?.toUpperCase();
  if (method !== 'PUT' && method !== 'POST') {
    return false;
  }
  const url = req.originalUrl ?? req.url ?? '';
  return url.includes('legal-entities');
}

/** Runs after express.json() — before Nest ValidationPipe (UC-CC member save). */
export function legalEntityBodyMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (!isLegalEntityMutation(req)) {
    next();
    return;
  }
  coerceJsonBody(req);
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    req.body = enrichLegalEntityRequestBody(req.body);
  }
  next();
}
