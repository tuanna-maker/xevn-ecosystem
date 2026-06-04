import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { ConfigSyncService } from '../config-sync/config-sync.service';
import { WorkflowEngineModule } from '../workflow-engine/workflow-engine.module';
import { CatalogGovernanceController } from './catalog-governance.controller';
import { CatalogGovernanceService } from './catalog-governance.service';

@Module({
  imports: [WorkflowEngineModule, XbosDbModule],
  controllers: [CatalogGovernanceController],
  providers: [CatalogGovernanceService, ConfigSyncService],
  exports: [CatalogGovernanceService],
})
export class CatalogGovernanceModule {}
