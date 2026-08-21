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
exports.AssetRequestService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const xbos_db_service_1 = require("../db/xbos-db.service");
const STATUS_FLOW = ['draft', 'pending_finance', 'finance_confirmed', 'recorded', 'assigned', 'completed'];
let AssetRequestService = class AssetRequestService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(tenantId, companyId, body) {
        const code = String(body.requestCode ?? `AR-${Date.now()}`);
        const { rows } = await this.db.query(`INSERT INTO public.xbos_asset_request (tenant_id, company_id, asset_id, request_code, status, requested_by, payload)
       VALUES ($1,$2,$3::uuid,$4,'draft',$5,$6::jsonb) RETURNING *`, [tenantId, companyId, body.assetId ?? null, code, body.requestedBy ?? 'system', JSON.stringify(body.payload ?? {})]);
        return rows[0];
    }
    async list(tenantId, companyId) {
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_asset_request WHERE tenant_id = $1 AND company_id = $2 ORDER BY created_at DESC`, [tenantId, companyId]);
        return rows;
    }
    async transition(tenantId, companyId, requestId, nextStatus, actor) {
        const { rows: current } = await this.db.query(`SELECT * FROM public.xbos_asset_request WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3`, [requestId, tenantId, companyId]);
        if (!current[0])
            throw new api_exception_1.ApiException('XBOS-AST-404', 'Asset request not found', common_1.HttpStatus.NOT_FOUND);
        const cur = current[0];
        const curIdx = STATUS_FLOW.indexOf(cur.status);
        const nextIdx = STATUS_FLOW.indexOf(nextStatus);
        if (nextIdx < 0 || (curIdx >= 0 && nextIdx !== curIdx + 1)) {
            throw new api_exception_1.ApiException('ASSET-REQ-409', 'Invalid status transition', common_1.HttpStatus.CONFLICT);
        }
        const financeFields = nextStatus === 'finance_confirmed'
            ? `, finance_confirmed_by = $5, finance_confirmed_at = NOW()`
            : '';
        const { rows } = await this.db.query(`UPDATE public.xbos_asset_request SET status = $4, updated_at = NOW()${financeFields}
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 RETURNING *`, nextStatus === 'finance_confirmed' ? [requestId, tenantId, companyId, nextStatus, actor] : [requestId, tenantId, companyId, nextStatus]);
        return rows[0];
    }
};
exports.AssetRequestService = AssetRequestService;
exports.AssetRequestService = AssetRequestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], AssetRequestService);
