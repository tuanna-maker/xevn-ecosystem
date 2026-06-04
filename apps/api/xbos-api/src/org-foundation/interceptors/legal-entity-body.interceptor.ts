import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { enrichLegalEntityRequestBody } from '../legal-entity-body.util';

/** Runs before ValidationPipe so PUT/POST bodies with only payload.companyForm still validate. */
@Injectable()
export class LegalEntityBodyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method?: string;
      url?: string;
      originalUrl?: string;
      body?: unknown;
    }>();
    const method = req.method?.toUpperCase();
    const path = req.originalUrl ?? req.url ?? '';
    if ((method === 'PUT' || method === 'POST') && path.includes('legal-entities')) {
      if (typeof req.body === 'string' && req.body.trim()) {
        try {
          req.body = JSON.parse(req.body) as unknown;
        } catch {
          /* ValidationPipe handles invalid JSON */
        }
      }
      req.body = enrichLegalEntityRequestBody(req.body);
    }
    return next.handle();
  }
}
