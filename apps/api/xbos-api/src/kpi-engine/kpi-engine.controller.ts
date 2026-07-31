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
import { Body, Controller, Get, Headers, HttpStatus, Post, Query } from '@nestjs/common';
import { resolveScopeContext, resolveTenantOnlyContext } from '../common/scope-context';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import { isAuthorizedInternalRequest } from '../common/internal-auth';
import type { KpiEvaluateBatchBody, KpiEvaluateInput, PublishPortalAlertBody } from './dto/kpi-evaluate.dto';
import { resolveKpiRollupScopeContext } from './kpi-rollup-scope';
import { KpiEngineService } from './kpi-engine.service';

@Controller('kpi-engine')
export class KpiEngineController {
  constructor(private readonly service: KpiEngineService) {}

  private assertInternalAccess(authorization?: string, internalApiKey?: string) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException('XBOS-AUTH-001', 'Unauthorized internal access', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('evaluate')
  async evaluate(
    @Body() body: KpiEvaluateInput,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const result = this.service.evaluate(body);
    let alertId: string | null = null;
    if (body.emitPortalAlert && (result.band === 'warning' || result.band === 'critical')) {
      const scope = resolveScopeContext(authorization, {
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
    return ok({ ...result, alertId }, 'XBOS-KPI-200', 'KPI evaluated');
  }

  @Post('evaluate-batch')
  async evaluateBatch(
    @Body() body: KpiEvaluateBatchBody,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const items = body.items ?? [];
    const results = this.service.evaluateBatch(items);
    const alerts: Array<{ index: number; alertId: string | null }> = [];
    if (body.emitPortalAlerts) {
      const scope = resolveScopeContext(authorization, {
        tenantId: body.tenantId ?? headerTenantId,
        companyId: body.companyId ?? headerCompanyId,
      });
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const row = results[i];
        if (!item || !row || (row.band !== 'warning' && row.band !== 'critical')) continue;
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
    return ok({ results, alerts }, 'XBOS-KPI-201', 'KPI batch evaluated');
  }

  @Get('rollup')
  async rollup(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveKpiRollupScopeContext(authorization, {
      tenantId: tenantId ?? headerTenantId,
      companyId: companyId ?? headerCompanyId,
    });
    const data = await this.service.rollup(scope.tenantId, scope.companyId, from, to);
    return ok(data, 'XBOS-KPI-202', 'KPI rollup loaded');
  }

  @Get('portal-alerts')
  async portalAlerts(
    @Query('tenantId') tenantId?: string,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    const scope = resolveTenantOnlyContext(authorization, {
      tenantId: tenantId ?? headerTenantId,
      companyId: companyId ?? headerCompanyId,
    });
    const filterCompany = (companyId ?? headerCompanyId)?.trim() || undefined;
    const items = await this.service.listPortalAlerts(
      scope.tenantId,
      limit ? Number(limit) : 50,
      filterCompany,
    );
    return ok({ items }, 'XBOS-KPI-203', 'Portal alerts loaded');
  }

  @Post('portal-alerts')
  async publishPortalAlert(
    @Body() body: PublishPortalAlertBody,
    @Headers('authorization') authorization?: string,
    @Headers('x-internal-api-key') internalApiKey?: string,
    @Headers('x-tenant-id') headerTenantId?: string,
    @Headers('x-company-id') headerCompanyId?: string,
  ) {
    this.assertInternalAccess(authorization, internalApiKey);
    if (!body?.title?.trim() || !body?.moduleCode?.trim()) {
      throw new ApiException('XBOS-VAL-003', 'Portal alert requires title and moduleCode', HttpStatus.BAD_REQUEST);
    }
    const scope = resolveScopeContext(authorization, {
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
    return ok(published, 'XBOS-KPI-204', 'Portal alert published');
  }
}
