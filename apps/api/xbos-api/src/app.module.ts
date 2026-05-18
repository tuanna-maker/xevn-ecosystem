import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AssetRequestModule } from './asset-request/asset-request.module';
import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { BusinessMasterController } from './business-master/business-master.controller';
import { BusinessMasterService } from './business-master/business-master.service';
import { ConfigSyncController } from './config-sync/config-sync.controller';
import { ConfigSyncService } from './config-sync/config-sync.service';
import { XbosDbModule } from './db/xbos-db.module';
import { FoundationModule } from './foundation/foundation.module';
import { InfrastructureController } from './infrastructure/infrastructure.controller';
import { InfrastructureService } from './infrastructure/infrastructure.service';
import { KpiEngineController } from './kpi-engine/kpi-engine.controller';
import { KpiEngineService } from './kpi-engine/kpi-engine.service';
import { OrgFoundationModule } from './org-foundation/org-foundation.module';
import { TenantScopeModule } from './tenant-scope/tenant-scope.module';
import { PositionRbacModule } from './position-rbac/position-rbac.module';
import { WorkflowEngineModule } from './workflow-engine/workflow-engine.module';
import { CatalogGovernanceModule } from './catalog-governance/catalog-governance.module';
import { RaciGovernanceModule } from './raci-governance/raci-governance.module';
import { AuthModule } from './auth/auth.module';
import { LegalEntityProfileModule } from './legal-entity-profile/legal-entity-profile.module';
import { CommandCenterModule } from './command-center/command-center.module';

@Module({
  imports: [
    XbosDbModule,
    FoundationModule,
    OrgFoundationModule,
    LegalEntityProfileModule,
    CommandCenterModule,
    AuthModule,
    TenantScopeModule,
    PositionRbacModule,
    WorkflowEngineModule,
    AssetRequestModule,
    CatalogGovernanceModule,
    RaciGovernanceModule,
  ],
  controllers: [
    AppController,
    ConfigSyncController,
    AssetsController,
    InfrastructureController,
    BusinessMasterController,
    KpiEngineController,
  ],
  providers: [ConfigSyncService, AssetsService, InfrastructureService, BusinessMasterService, KpiEngineService],
})
export class AppModule {}
