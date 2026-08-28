import { Module } from '@nestjs/common';
import { PayStepController } from './pay-step.controller';
import { PayStepService } from './pay-step.service';

@Module({
  controllers: [PayStepController],
  providers: [PayStepService],
})
export class PayStepModule {}