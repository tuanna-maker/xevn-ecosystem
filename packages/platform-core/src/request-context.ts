import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Logger } from 'pino';

export type RequestContext = {
  requestId: string;
  traceId?: string;
  tenantId?: string;
  companyId?: string;
  userId?: string;
};

declare module 'http' {
  interface IncomingMessage {
    platformContext?: RequestContext;
    log?: Logger;
  }
}

function parseBearerClaims(authHeader?: string): { sub?: string; tenantId?: string; companyId?: string } {
  if (!authHeader?.startsWith('Bearer ')) return {};
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) return {};
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as Record<
      string,
      unknown
    >;
    return {
      sub: typeof payload.sub === 'string' ? payload.sub : undefined,
      tenantId:
        typeof payload.tenantId === 'string'
          ? payload.tenantId
          : typeof payload.tenant_id === 'string'
            ? payload.tenant_id
            : undefined,
      companyId:
        typeof payload.companyId === 'string'
          ? payload.companyId
          : typeof payload.company_id === 'string'
            ? payload.company_id
            : undefined,
    };
  } catch {
    return {};
  }
}

export function extractRequestContext(req: IncomingMessage): RequestContext {
  const requestId = (req.headers['x-request-id'] as string | undefined)?.trim() || randomUUID();
  const traceparent = (req.headers.traceparent as string | undefined)?.trim();
  const traceId = traceparent?.split('-')[1];
  const headerTenant = (req.headers['x-tenant-id'] as string | undefined)?.trim();
  const headerCompany = (req.headers['x-company-id'] as string | undefined)?.trim();
  const claims = parseBearerClaims(req.headers.authorization as string | undefined);
  return {
    requestId,
    traceId,
    tenantId: headerTenant || claims.tenantId,
    companyId: headerCompany || claims.companyId,
    userId: claims.sub,
  };
}

export function applyRequestContextMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  rootLogger: Logger,
): void {
  const ctx = extractRequestContext(req);
  req.platformContext = ctx;
  req.log = rootLogger.child({
    requestId: ctx.requestId,
    traceId: ctx.traceId,
    tenantId: ctx.tenantId,
    companyId: ctx.companyId,
    userId: ctx.userId,
  });
  res.setHeader('x-request-id', ctx.requestId);
  if (ctx.traceId) res.setHeader('traceparent', `00-${ctx.traceId}-01`);

  const startedAt = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const status = res.statusCode;
    const logPayload = {
      method: req.method,
      path: req.url,
      status,
      durationMs,
    };
    if (status >= 500) {
      req.log?.error(logPayload, 'request completed with server error');
    } else if (status >= 400) {
      req.log?.warn(logPayload, 'request completed with client error');
    } else if (durationMs >= 500) {
      req.log?.warn(logPayload, 'slow request');
    } else {
      req.log?.info(logPayload, 'request completed');
    }
  });
}
