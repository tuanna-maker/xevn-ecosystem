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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandCenterService = void 0;
exports.workspaceMetaCompanyIds = workspaceMetaCompanyIds;
exports.resolveWorkspaceAsOf = resolveWorkspaceAsOf;
const common_1 = require("@nestjs/common");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const xbos_db_service_1 = require("../db/xbos-db.service");
/** BR-CC-META-DATE-01 — never expose epoch / pre-2000 as workspace freshness. */
const MIN_VALID_AS_OF_MS = Date.UTC(2000, 0, 1);
function workspaceMetaCompanyIds(companyId) {
    const id = companyId.trim().toLowerCase();
    if (id === xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING || id === xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN) {
        return [xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING, xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN];
    }
    return [companyId];
}
function resolveWorkspaceAsOf(raw) {
    if (raw == null) {
        return new Date().toISOString();
    }
    const ms = new Date(raw).getTime();
    if (!Number.isFinite(ms) || ms < MIN_VALID_AS_OF_MS) {
        return new Date().toISOString();
    }
    return new Date(ms).toISOString();
}
let CommandCenterService = class CommandCenterService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getWorkspaceMeta(tenantId, companyId) {
        const partitionIds = workspaceMetaCompanyIds(companyId);
        const { rows } = await this.db.query(`SELECT
        GREATEST(
          (SELECT MAX(updated_at) FROM public.xbos_legal_entity
           WHERE tenant_id = $1 AND company_id = ANY($2::text[])),
          (SELECT MAX(t.updated_at) FROM public.xbos_workflow_step_task t
           JOIN public.xbos_workflow_instance i ON i.id = t.instance_id
           WHERE i.tenant_id = $1 AND i.company_id = ANY($2::text[])),
          (SELECT MAX(updated_at) FROM public.xbos_legal_entity_document
           WHERE tenant_id = $1 AND company_id = ANY($2::text[]))
        ) AS as_of,
        NULL::text AS data_sync_note`, [tenantId, partitionIds]);
        const asOf = resolveWorkspaceAsOf(rows[0]?.as_of);
        return {
            asOf,
            dataSyncNote: process.env.XBOS_CC_DATA_SYNC_NOTE?.trim() || rows[0]?.data_sync_note || null,
        };
    }
};
exports.CommandCenterService = CommandCenterService;
exports.CommandCenterService = CommandCenterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], CommandCenterService);
