"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const asset_request_module_1 = require("./asset-request/asset-request.module");
const assets_controller_1 = require("./assets/assets.controller");
const assets_service_1 = require("./assets/assets.service");
const business_master_controller_1 = require("./business-master/business-master.controller");
const business_master_service_1 = require("./business-master/business-master.service");
const config_sync_controller_1 = require("./config-sync/config-sync.controller");
const config_sync_service_1 = require("./config-sync/config-sync.service");
const xbos_db_module_1 = require("./db/xbos-db.module");
const foundation_module_1 = require("./foundation/foundation.module");
const infrastructure_controller_1 = require("./infrastructure/infrastructure.controller");
const infrastructure_service_1 = require("./infrastructure/infrastructure.service");
const kpi_engine_controller_1 = require("./kpi-engine/kpi-engine.controller");
const kpi_engine_service_1 = require("./kpi-engine/kpi-engine.service");
const alerts_controller_1 = require("./alerts/alerts.controller");
const alerts_service_1 = require("./alerts/alerts.service");
const org_foundation_module_1 = require("./org-foundation/org-foundation.module");
const tenant_scope_module_1 = require("./tenant-scope/tenant-scope.module");
const position_rbac_module_1 = require("./position-rbac/position-rbac.module");
const workflow_engine_module_1 = require("./workflow-engine/workflow-engine.module");
const catalog_governance_module_1 = require("./catalog-governance/catalog-governance.module");
const raci_governance_module_1 = require("./raci-governance/raci-governance.module");
const auth_module_1 = require("./auth/auth.module");
const legal_entity_profile_module_1 = require("./legal-entity-profile/legal-entity-profile.module");
const command_center_module_1 = require("./command-center/command-center.module");
const xbos_db_write_audit_interceptor_1 = require("./platform/xbos-db-write-audit.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            xbos_db_module_1.XbosDbModule,
            foundation_module_1.FoundationModule,
            org_foundation_module_1.OrgFoundationModule,
            legal_entity_profile_module_1.LegalEntityProfileModule,
            command_center_module_1.CommandCenterModule,
            auth_module_1.AuthModule,
            tenant_scope_module_1.TenantScopeModule,
            position_rbac_module_1.PositionRbacModule,
            workflow_engine_module_1.WorkflowEngineModule,
            asset_request_module_1.AssetRequestModule,
            catalog_governance_module_1.CatalogGovernanceModule,
            raci_governance_module_1.RaciGovernanceModule,
        ],
        controllers: [
            app_controller_1.AppController,
            config_sync_controller_1.ConfigSyncController,
            assets_controller_1.AssetsController,
            infrastructure_controller_1.InfrastructureController,
            business_master_controller_1.BusinessMasterController,
            kpi_engine_controller_1.KpiEngineController,
            alerts_controller_1.AlertsController,
        ],
        providers: [
            config_sync_service_1.ConfigSyncService,
            assets_service_1.AssetsService,
            infrastructure_service_1.InfrastructureService,
            business_master_service_1.BusinessMasterService,
            kpi_engine_service_1.KpiEngineService,
            alerts_service_1.AlertsService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: xbos_db_write_audit_interceptor_1.XbosDbWriteAuditInterceptor,
            },
        ],
    })
], AppModule);
