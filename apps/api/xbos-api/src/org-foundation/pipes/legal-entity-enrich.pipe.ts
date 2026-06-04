import { Injectable, PipeTransform } from '@nestjs/common';
import { enrichLegalEntityRequestBody } from '../legal-entity-body.util';

/** Merge Command Center `payload.companyForm` into top-level code/name before ValidationPipe. */
@Injectable()
export class LegalEntityEnrichPipe implements PipeTransform {
  transform(value: unknown): unknown {
    return enrichLegalEntityRequestBody(value);
  }
}
