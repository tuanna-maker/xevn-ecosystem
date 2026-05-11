import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigSyncController } from './config-sync/config-sync.controller';
import { ConfigSyncService } from './config-sync/config-sync.service';
import { XbosDbService } from './db/xbos-db.service';
import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { InfrastructureController } from './infrastructure/infrastructure.controller';
import { InfrastructureService } from './infrastructure/infrastructure.service';
import { BusinessMasterController } from './business-master/business-master.controller';
import { BusinessMasterService } from './business-master/business-master.service';
import { KpiEngineController } from './kpi-engine/kpi-engine.controller';
import { KpiEngineService } from './kpi-engine/kpi-engine.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    ConfigSyncController,
    AssetsController,
    InfrastructureController,
    BusinessMasterController,
    KpiEngineController,
  ],
  providers: [ConfigSyncService, AssetsService, InfrastructureService, BusinessMasterService, KpiEngineService, XbosDbService],
})
export class AppModule {}
