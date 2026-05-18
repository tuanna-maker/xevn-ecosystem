import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { WorkflowEngineController } from './workflow-engine.controller';
import { WorkflowEngineService } from './workflow-engine.service';

@Module({
  imports: [XbosDbModule],
  controllers: [WorkflowEngineController],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class WorkflowEngineModule {}
