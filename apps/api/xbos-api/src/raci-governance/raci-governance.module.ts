import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { OrgFoundationModule } from '../org-foundation/org-foundation.module';
import { RaciGovernanceController } from './raci-governance.controller';
import { RaciGovernanceService } from './raci-governance.service';

@Module({
  imports: [XbosDbModule, OrgFoundationModule],
  controllers: [RaciGovernanceController],
  providers: [RaciGovernanceService],
  exports: [RaciGovernanceService],
})
export class RaciGovernanceModule {}
