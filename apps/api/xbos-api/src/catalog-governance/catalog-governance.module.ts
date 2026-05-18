import { Module } from '@nestjs/common';
import { WorkflowEngineModule } from '../workflow-engine/workflow-engine.module';
import { CatalogGovernanceController } from './catalog-governance.controller';
import { CatalogGovernanceService } from './catalog-governance.service';

@Module({
  imports: [WorkflowEngineModule],
  controllers: [CatalogGovernanceController],
  providers: [CatalogGovernanceService],
  exports: [CatalogGovernanceService],
})
export class CatalogGovernanceModule {}
