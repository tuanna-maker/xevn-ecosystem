/**
 * @CODE-MEMORY WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01
 * Plane A/B: HRM DB only. No cross-plane FK.
 * HrmDbService provided globally by CoreModule (@Global).
 */
import { Module } from '@nestjs/common';
import { ContractTemplatesController } from './contract-templates.controller';
import { ContractTemplatesService } from './contract-templates.service';

@Module({
  controllers: [ContractTemplatesController],
  providers: [ContractTemplatesService],
  exports: [ContractTemplatesService],
})
export class ContractTemplatesModule {}
