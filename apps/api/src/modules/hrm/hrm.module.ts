import { Module } from '@nestjs/common';
import { ConfigDomainModule } from '../config/config.module';
import { HrmController } from './hrm.controller';
import { HrmService } from './hrm.service';

@Module({
  imports: [ConfigDomainModule],
  controllers: [HrmController],
  providers: [HrmService],
})
export class HrmModule {}
