import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { FoundationSchemaService } from './foundation-schema.service';

@Module({
  imports: [XbosDbModule],
  providers: [FoundationSchemaService],
  exports: [FoundationSchemaService],
})
export class FoundationModule {}
