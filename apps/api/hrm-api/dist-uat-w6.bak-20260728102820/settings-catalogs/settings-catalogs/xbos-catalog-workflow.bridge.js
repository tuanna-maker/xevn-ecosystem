"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var XbosCatalogWorkflowBridge_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XbosCatalogWorkflowBridge = void 0;
const common_1 = require("@nestjs/common");
const catalog_sync_service_1 = require("../catalog-sync/catalog-sync.service");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const tourism_fleet_catalog_1 = require("./tourism-fleet-catalog");
const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';
let XbosCatalogWorkflowBridge = XbosCatalogWorkflowBridge_1 = class XbosCatalogWorkflowBridge {
    catalogSync;
    logger = new common_1.Logger(XbosCatalogWorkflowBridge_1.name);
    constructor(catalogSync) {
        this.catalogSync = catalogSync;
    }
    xbosBaseUrl() {
        return (0, catalog_sync_service_1.resolveXbosApiBaseUrl)();
    }
    shouldStartCatalogWorkflow(tenantId, companyId) {
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        if (t === tourism_fleet_catalog_1.TOURISM_TENANT_ID)
            return true;
        if (t === hrm_list_scope_1.MASTER_TENANT_ID && (c === GROUP_HOLDING_COMPANY_ID || c === GROUP_OPERATING_MAIN)) {
            return true;
        }
        return false;
    }
    async startCatalogWorkflowIfConfigured(batchId, tenantId, companyId, requesterUserId) {
        if (!this.shouldStartCatalogWorkflow(tenantId, companyId)) {
            return null;
        }
        const memberTenantId = tenantId.trim().toLowerCase();
        const memberCompanyId = companyId.trim().toLowerCase() || tourism_fleet_catalog_1.TOURISM_COMPANY_ID;
        const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(undefined, {
            tenantId: memberTenantId,
            companyId: memberCompanyId,
        });
        try {
            const res = await fetch(`${this.xbosBaseUrl()}/api/xbos/catalog-governance/workflows/start`, {
                method: 'POST',
                headers: {
                    ...upstreamHeaders,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    batchId,
                    memberTenantId,
                    memberCompanyId,
                    requesterUserId: requesterUserId ?? null,
                }),
            });
            const json = (await res.json());
            if (!res.ok || !json.success) {
                this.logger.warn(`XBOS workflow start failed: ${res.status} code=${json.code ?? 'unknown'} msg=${json.message ?? ''}`);
                return null;
            }
            return json.data ?? null;
        }
        catch (err) {
            this.logger.warn(`XBOS workflow start error: ${err instanceof Error ? err.message : err}`);
            return null;
        }
    }
};
exports.XbosCatalogWorkflowBridge = XbosCatalogWorkflowBridge;
exports.XbosCatalogWorkflowBridge = XbosCatalogWorkflowBridge = XbosCatalogWorkflowBridge_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [catalog_sync_service_1.CatalogSyncService])
], XbosCatalogWorkflowBridge);
//# sourceMappingURL=xbos-catalog-workflow.bridge.js.map