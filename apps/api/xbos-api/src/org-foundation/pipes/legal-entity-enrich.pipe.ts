import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { enrichLegalEntityRequestBody } from '../legal-entity-body.util';
import { UpsertLegalEntityDto } from '../dto/upsert-legal-entity.dto';

/** Merge Command Center `payload.companyForm` into top-level code/name before ValidationPipe. */
@Injectable()
export class LegalEntityEnrichPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type !== 'body' || metadata.metatype !== UpsertLegalEntityDto) {
      return value;
    }
    return enrichLegalEntityRequestBody(value);
  }
}
