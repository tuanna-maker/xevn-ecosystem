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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KpiEngineController = void 0;
/**
 * @CODE-MEMORY
 * Screen:     Command Center — rail / widget KPI đa cấp (UF-XBOS-10)
 * UC:         UC-XBOS-KPI-01..04 · FR-XBOS-KPI-03
 * BR:         Scope rollup = resolveKpiRollupScopeContext (group CEO main→holding); empty series hợp lệ
 * SRS:        SRS_XBOS_KHACH.md §3.16 FR-XBOS-KPI-03 Diễn biến #1–7
 * TechSpec:   docs/xbos/TECHSPEC.md §14.17 · ref_srs FR-XBOS-KPI-03
 * db_design:  docs/xbos/DB_DESIGN_XBOS_KPI.md — xbos_kpi_actuals · xbos_portal_alerts
 * api_design: docs/xbos/API_DESIGN_XBOS_KPI.md Endpoints A–E (F.1)
 * Purpose:    Cấp evaluate math, rollup series đa cấp, và portal alerts cho FE bind widget/rail —
 *             read-only rollup không bắt buộc ghi actuals; empty series trung thực (U65).
 * WorkItem:   BE-XBOS-OA-KPI-DTO-01 (OpenAPI series depth; runtime must_keep)
 * Coded:      2026-07-27
 *
 * Callers:
 *   - web-portal kpiEngineApi / useCommandCenterKpiRail → GET/POST /api/xbos/kpi-engine/*
 *
 * Callees:
 *   - resolveKpiRollupScopeContext / resolveScopeContext / resolveTenantOnlyContext
 *   - KpiEngineService.evaluate · evaluateBatch · rollup · listPortalAlerts · publishPortalAlert
 *
 * FE-Actions:
 *   | Thao tác | Handler | API |
 *   |----------|---------|-----|
 *   | Mở KPI tập đoàn | fetch rollup | GET …/kpi-engine/rollup |
 *   | Preview điểm | evaluate | POST …/evaluate |
 *   | Rail cảnh báo | list/publish | GET/POST …/portal-alerts |
 *
 * BE-Chain:
 *   rollup → xbos_kpi_actuals (SUM/AVG group hoặc single)
 *   evaluate → computed (+ optional xbos_portal_alerts)
 *   portal-alerts → xbos_portal_alerts
 *
 * Impact:     Đổi scope rollup hoặc ép fake series → UF-XBOS-10 / 409 sai tư cách
 * must_keep:  UF-XBOS-10 🟢 · series:[] hợp lệ · không seed · RACI/WF/catalog-gov không đụng
 * SOLID:      Controller = auth/scope/envelope; Service = math + SQL actuals/alerts
 * LastVerified: kpi-engine.controller.spec.ts · kpi-engine.service.spec.ts · be-xbos-oa-kpi-dto-01-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-XBOS-OA-KPI-DTO-01
 * change_mode: UPGRADE
 * What: Neo CODE-MEMORY + OpenAPI F.1 (Mục đích/Nghiệp vụ/Bước SRS) · KpiRollupData series/points
 * Why:  Đóng G-DTO-W2-KPI-01 residual sau U71 API_DESIGN — deepen contract; không đổi runtime
 * SRS:  §3.16 FR-XBOS-KPI-03 Diễn biến #1–7
 * TechSpec: §14.17 · G-DTO-W2-KPI-01 CLOSED
 * db_design: DB_DESIGN_XBOS_KPI.md
 * api_design: API_DESIGN_XBOS_KPI.md Endpoints A–E
 * must_keep: Hành vi rollup scope / empty series / evaluate math / UF-10 không đổi
 */
const common_1 = require("@nestjs/common");
const scope_context_1 = require("../common/scope-context");
const api_exception_1 = require("../common/api.exception");
const api_response_1 = require("../common/api-response");
const internal_auth_1 = require("../common/internal-auth");
const kpi_rollup_scope_1 = require("./kpi-rollup-scope");
const kpi_engine_service_1 = require("./kpi-engine.service");
let KpiEngineController = class KpiEngineController {
    service;
    constructor(service) {
        this.service = service;
    }
    assertInternalAccess(authorization, internalApiKey) {
        if (!(0, internal_auth_1.isAuthorizedInternalRequest)(authorization, internalApiKey)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-001', 'Unauthorized internal access', common_1.HttpStatus.UNAUTHORIZED);
        }
    }
    async evaluate(body, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        this.assertInternalAccess(authorization, internalApiKey);
        const result = this.service.evaluate(body);
        let alertId = null;
        if (body.emitPortalAlert && (result.band === 'warning' || result.band === 'critical')) {
            const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
                tenantId: headerTenantId,
                companyId: headerCompanyId,
            });
            const emitted = await this.service.emitKpiBandAlert({
                tenantId: scope.tenantId,
                companyId: scope.companyId,
                metricCode: body.metricCode?.trim() || 'kpi_metric',
                band: result.band,
                score: result.score,
                actual: Number(body.actual),
                target: Number(body.target),
            });
            alertId = emitted.id;
        }
        return (0, api_response_1.ok)({ ...result, alertId }, 'XBOS-KPI-200', 'KPI evaluated');
    }
    async evaluateBatch(body, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        this.assertInternalAccess(authorization, internalApiKey);
        const items = body.items ?? [];
        const results = this.service.evaluateBatch(items);
        const alerts = [];
        if (body.emitPortalAlerts) {
            const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
                tenantId: body.tenantId ?? headerTenantId,
                companyId: body.companyId ?? headerCompanyId,
            });
            for (let i = 0; i < items.length; i += 1) {
                const item = items[i];
                const row = results[i];
                if (!item || !row || (row.band !== 'warning' && row.band !== 'critical'))
                    continue;
                const emitted = await this.service.emitKpiBandAlert({
                    tenantId: scope.tenantId,
                    companyId: scope.companyId,
                    metricCode: item.metricCode?.trim() || `kpi_batch_${i}`,
                    band: row.band,
                    score: row.score,
                    actual: Number(item.actual),
                    target: Number(item.target),
                });
                alerts.push({ index: i, alertId: emitted.id });
            }
        }
        return (0, api_response_1.ok)({ results, alerts }, 'XBOS-KPI-201', 'KPI batch evaluated');
    }
    async rollup(tenantId, companyId, from, to, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, kpi_rollup_scope_1.resolveKpiRollupScopeContext)(authorization, {
            tenantId: tenantId ?? headerTenantId,
            companyId: companyId ?? headerCompanyId,
        });
        const data = await this.service.rollup(scope.tenantId, scope.companyId, from, to);
        return (0, api_response_1.ok)(data, 'XBOS-KPI-202', 'KPI rollup loaded');
    }
    async portalAlerts(tenantId, companyId, limit, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        this.assertInternalAccess(authorization, internalApiKey);
        const scope = (0, scope_context_1.resolveTenantOnlyContext)(authorization, {
            tenantId: tenantId ?? headerTenantId,
            companyId: companyId ?? headerCompanyId,
        });
        const filterCompany = (companyId ?? headerCompanyId)?.trim() || undefined;
        const items = await this.service.listPortalAlerts(scope.tenantId, limit ? Number(limit) : 50, filterCompany);
        return (0, api_response_1.ok)({ items }, 'XBOS-KPI-203', 'Portal alerts loaded');
    }
    async publishPortalAlert(body, authorization, internalApiKey, headerTenantId, headerCompanyId) {
        this.assertInternalAccess(authorization, internalApiKey);
        if (!body?.title?.trim() || !body?.moduleCode?.trim()) {
            throw new api_exception_1.ApiException('XBOS-VAL-003', 'Portal alert requires title and moduleCode', common_1.HttpStatus.BAD_REQUEST);
        }
        const scope = (0, scope_context_1.resolveScopeContext)(authorization, {
            tenantId: body.tenantId ?? headerTenantId,
            companyId: body.companyId ?? headerCompanyId,
        });
        const published = await this.service.publishPortalAlert({
            tenantId: scope.tenantId,
            companyId: scope.companyId,
            moduleCode: body.moduleCode.trim(),
            level: body.level ?? 'info',
            title: body.title.trim(),
            detail: body.detail,
            sourceSystem: body.sourceSystem?.trim() || 'xbos',
            sourceId: body.sourceId,
        });
        return (0, api_response_1.ok)(published, 'XBOS-KPI-204', 'Portal alert published');
    }
};
exports.KpiEngineController = KpiEngineController;
__decorate([
    (0, common_1.Post)('evaluate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiEngineController.prototype, "evaluate", null);
__decorate([
    (0, common_1.Post)('evaluate-batch'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiEngineController.prototype, "evaluateBatch", null);
__decorate([
    (0, common_1.Get)('rollup'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('from')),
    __param(3, (0, common_1.Query)('to')),
    __param(4, (0, common_1.Headers)('authorization')),
    __param(5, (0, common_1.Headers)('x-internal-api-key')),
    __param(6, (0, common_1.Headers)('x-tenant-id')),
    __param(7, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiEngineController.prototype, "rollup", null);
__decorate([
    (0, common_1.Get)('portal-alerts'),
    __param(0, (0, common_1.Query)('tenantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Headers)('authorization')),
    __param(4, (0, common_1.Headers)('x-internal-api-key')),
    __param(5, (0, common_1.Headers)('x-tenant-id')),
    __param(6, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiEngineController.prototype, "portalAlerts", null);
__decorate([
    (0, common_1.Post)('portal-alerts'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Headers)('x-internal-api-key')),
    __param(3, (0, common_1.Headers)('x-tenant-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], KpiEngineController.prototype, "publishPortalAlert", null);
exports.KpiEngineController = KpiEngineController = __decorate([
    (0, common_1.Controller)('kpi-engine'),
    __metadata("design:paramtypes", [kpi_engine_service_1.KpiEngineService])
], KpiEngineController);
