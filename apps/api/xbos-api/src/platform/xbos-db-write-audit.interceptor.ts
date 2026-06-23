import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PlatformAuditService } from './platform-audit.service';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class XbosDbWriteAuditInterceptor implements NestInterceptor {
  constructor(private readonly platformAudit: PlatformAuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method?.toUpperCase() ?? 'GET';
    if (!MUTATING_METHODS.has(method)) {
      return next.handle();
    }

    const path = (req.originalUrl ?? req.url ?? '').split('?')[0];

    return next.handle().pipe(
      tap((body) => {
        if (!body || typeof body !== 'object') return;
        const envelope = body as { success?: boolean; code?: string };
        if (envelope.success !== true) return;

        const responseCode = typeof envelope.code === 'string' ? envelope.code : '';
        void this.platformAudit
          .emit({
            tenantId: this.readHeader(req, 'x-tenant-id'),
            companyId: this.readHeader(req, 'x-company-id'),
            action: 'xbos.db_write',
            entityType: 'http_mutation',
            entityId: path,
            payload: { path, method, responseCode },
            request: req,
          })
          .catch(() => {
            /* audit failure must not affect the HTTP response */
          });
      }),
    );
  }

  private readHeader(req: Request, name: string): string | undefined {
    const value = req.headers[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value) && value[0]?.trim()) return value[0].trim();
    return undefined;
  }
}
