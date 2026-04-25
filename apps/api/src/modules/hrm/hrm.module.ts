import { Module } from '@nestjs/common';
import { ConfigDomainModule } from '../config/config.module';
import { HrmController } from './hrm.controller';
import { HrmRepository, InMemoryHrmRepository } from './hrm.repository';
import { HrmService } from './hrm.service';

@Module({
  imports: [ConfigDomainModule],
  controllers: [HrmController],
  providers: [
    HrmService,
    {
      provide: HrmRepository,
      useClass: InMemoryHrmRepository,
    },
  ],
})
export class HrmModule {}
