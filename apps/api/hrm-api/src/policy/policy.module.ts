import { Module } from '@nestjs/common';
import { PolicyController, GradesController } from './policy.controller';
import { PolicyService } from './policy.service';

@Module({
  controllers: [PolicyController, GradesController],
  providers: [PolicyService],
  exports: [PolicyService],
})
export class PolicyModule {}
