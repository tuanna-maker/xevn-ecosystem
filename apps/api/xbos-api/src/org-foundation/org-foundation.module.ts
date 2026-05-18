import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { OrgFoundationController } from './org-foundation.controller';
import { OrgFoundationService } from './org-foundation.service';

@Module({
  imports: [XbosDbModule],
  controllers: [OrgFoundationController],
  providers: [OrgFoundationService],
  exports: [OrgFoundationService],
})
export class OrgFoundationModule {}
