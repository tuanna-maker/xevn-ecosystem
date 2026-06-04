import { Global, Module } from '@nestjs/common';
import { PlatformAuditController } from '../platform/platform-audit.controller';
import { PlatformAuditService } from '../platform/platform-audit.service';
import { XbosDbService } from './xbos-db.service';

@Global()
@Module({
  controllers: [PlatformAuditController],
  providers: [XbosDbService, PlatformAuditService],
  exports: [XbosDbService, PlatformAuditService],
})
export class XbosDbModule {}
