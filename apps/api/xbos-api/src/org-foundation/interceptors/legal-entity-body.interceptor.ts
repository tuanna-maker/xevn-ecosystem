import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LegalEntityEnrichPipe } from '../pipes/legal-entity-enrich.pipe';

/** Runs before ValidationPipe so PUT/POST bodies with only payload.companyForm still validate. */
@Injectable()
export class LegalEntityBodyInterceptor implements NestInterceptor {
  private readonly enrich = new LegalEntityEnrichPipe();

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ method?: string; url?: string; body?: unknown }>();
    const method = req.method?.toUpperCase();
    if ((method === 'PUT' || method === 'POST') && req.url?.includes('legal-entities')) {
      req.body = this.enrich.transform(req.body);
    }
    return next.handle();
  }
}
