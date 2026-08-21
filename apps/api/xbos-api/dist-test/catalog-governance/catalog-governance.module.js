"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogGovernanceModule = void 0;
const common_1 = require("@nestjs/common");
const xbos_db_module_1 = require("../db/xbos-db.module");
const config_sync_service_1 = require("../config-sync/config-sync.service");
const workflow_engine_module_1 = require("../workflow-engine/workflow-engine.module");
const catalog_governance_controller_1 = require("./catalog-governance.controller");
const catalog_governance_service_1 = require("./catalog-governance.service");
let CatalogGovernanceModule = class CatalogGovernanceModule {
};
exports.CatalogGovernanceModule = CatalogGovernanceModule;
exports.CatalogGovernanceModule = CatalogGovernanceModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_engine_module_1.WorkflowEngineModule, xbos_db_module_1.XbosDbModule],
        controllers: [catalog_governance_controller_1.CatalogGovernanceController],
        providers: [catalog_governance_service_1.CatalogGovernanceService, config_sync_service_1.ConfigSyncService],
        exports: [catalog_governance_service_1.CatalogGovernanceService],
    })
], CatalogGovernanceModule);
