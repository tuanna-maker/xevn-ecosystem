import type { NextFunction, Request, Response } from 'express';
import { enrichLegalEntityRequestBody } from '../legal-entity-body.util';

/** Runs after express.json() — before Nest ValidationPipe (UC-CC member save). */
export function legalEntityBodyMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const method = req.method?.toUpperCase();
  const url = req.originalUrl ?? req.url ?? '';
  if (
    (method === 'PUT' || method === 'POST') &&
    url.includes('legal-entities') &&
    req.body &&
    typeof req.body === 'object'
  ) {
    req.body = enrichLegalEntityRequestBody(req.body);
  }
  next();
}
