"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsCatalogsModule = void 0;
const common_1 = require("@nestjs/common");
const catalog_sync_service_1 = require("../catalog-sync/catalog-sync.service");
const settings_catalogs_controller_1 = require("./settings-catalogs.controller");
const settings_catalogs_service_1 = require("./settings-catalogs.service");
const xbos_catalog_workflow_bridge_1 = require("./xbos-catalog-workflow.bridge");
let SettingsCatalogsModule = class SettingsCatalogsModule {
};
exports.SettingsCatalogsModule = SettingsCatalogsModule;
exports.SettingsCatalogsModule = SettingsCatalogsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [settings_catalogs_controller_1.SettingsCatalogsController],
        providers: [catalog_sync_service_1.CatalogSyncService, xbos_catalog_workflow_bridge_1.XbosCatalogWorkflowBridge, settings_catalogs_service_1.SettingsCatalogsService],
        exports: [catalog_sync_service_1.CatalogSyncService, xbos_catalog_workflow_bridge_1.XbosCatalogWorkflowBridge, settings_catalogs_service_1.SettingsCatalogsService],
    })
], SettingsCatalogsModule);
//# sourceMappingURL=settings-catalogs.module.js.map