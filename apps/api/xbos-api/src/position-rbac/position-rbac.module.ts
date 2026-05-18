import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { PositionRbacController } from './position-rbac.controller';
import { PositionRbacService } from './position-rbac.service';

@Module({
  imports: [XbosDbModule],
  controllers: [PositionRbacController],
  providers: [PositionRbacService],
  exports: [PositionRbacService],
})
export class PositionRbacModule {}
