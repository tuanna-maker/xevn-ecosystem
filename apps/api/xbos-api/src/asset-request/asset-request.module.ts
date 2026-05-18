import { Module } from '@nestjs/common';
import { XbosDbModule } from '../db/xbos-db.module';
import { AssetRequestController } from './asset-request.controller';
import { AssetRequestService } from './asset-request.service';

@Module({
  imports: [XbosDbModule],
  controllers: [AssetRequestController],
  providers: [AssetRequestService],
})
export class AssetRequestModule {}
