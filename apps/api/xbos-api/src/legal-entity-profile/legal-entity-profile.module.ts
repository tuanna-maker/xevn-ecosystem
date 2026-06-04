import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { OrgFoundationModule } from '../org-foundation/org-foundation.module';
import { LegalEntityProfileController } from './legal-entity-profile.controller';
import { LegalEntityProfileService } from './legal-entity-profile.service';

@Module({
  imports: [XbosDbModule, OrgFoundationModule],
  controllers: [LegalEntityProfileController],
  providers: [LegalEntityProfileService],
  exports: [LegalEntityProfileService],
})
export class LegalEntityProfileModule {}
