import { Global, Module } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';

@Global()
@Module({
  providers: [HrmDbService],
  exports: [HrmDbService],
})
export class CoreModule {}
