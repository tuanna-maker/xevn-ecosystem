import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import type { KpiEvaluateInput } from './dto/kpi-evaluate.dto';
import { GROUP_ROLLUP_COMPANY_IDS, isGroupRollupCompanyId } from './kpi-scope.constants';

export type KpiEvaluateResult = {
  score: number;
  band: 'excellent' | 'warning' | 'critical';
  rewardAmount: number;
  penaltyAmount: number;
  netAmount: number;
  ratio: number;
};

@Injectable()
export class KpiEngineService {
  constructor(private readonly db: XbosDbService) {}

  assertEvaluateInput(input: KpiEvaluateInput): void {
    for (const field of ['target', 'actual'] as const) {
      const value = input[field];
      if (value === undefined || value === null || Number.isNaN(Number(value))) {
        throw new ApiException(
          'XBOS-VAL-003',
          `KPI evaluate requires numeric ${field}`,
          HttpStatus.BAD_REQUEST,
          { field },
        );
      }
    }
  }

  evaluate(input: KpiEvaluateInput): KpiEvaluateResult {
    this.assertEvaluateInput(input);
    const target = Number(input.target);
    const actual = Number(input.actual);
    const weight = Number(input.weight ?? 1);
    const warningThreshold = Number(input.warningThreshold ?? target * 0.8);
    const criticalThreshold = Number(input.criticalThreshold ?? target * 0.6);
    const ratio = target > 0 ? actual / target : 0;
    const score = Math.max(0, Math.round(ratio * 100 * weight));

    let band: 'excellent' | 'warning' | 'critical' = 'excellent';
    if (actual <= criticalThreshold) band = 'critical';
    else if (actual <= warningThreshold) band = 'warning';

    const rewardAmount = band === 'excellent' ? Math.round((score - 100) * 10000) : 0;
    const penaltyAmount =
      band === 'critical'
        ? Math.round((100 - score) * 15000)
        : band === 'warning'
          ? Math.round((100 - score) * 7000)
          : 0;

    return {
      score,
      band,
      rewardAmount: rewardAmount > 0 ? rewardAmount : 0,
      penaltyAmount: penaltyAmount > 0 ? penaltyAmount : 0,
      netAmount: Math.max(rewardAmount, 0) - Math.max(penaltyAmount, 0),
      ratio,
    };
  }

  evaluateBatch(items: KpiEvaluateInput[]) {
    return items.map((item, index) => ({ index, ...this.evaluate(item) }));
  }

  async ensureKpiActualsSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_kpi_actuals (
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        metric_code TEXT NOT NULL,
        period_date DATE NOT NULL,
        actual_value NUMERIC NOT NULL DEFAULT 0,
        target_value NUMERIC NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, company_id, metric_code, period_date)
      );
    `);
  }

  resolveRollupCompanyIds(companyId: string): string[] {
    if (isGroupRollupCompanyId(companyId)) {
      return [...GROUP_ROLLUP_COMPANY_IDS];
    }
    return [companyId];
  }

  async rollup(tenantId: string, companyId: string, from?: string, to?: string) {
    await this.ensureKpiActualsSchema();
    const fromDate = from ?? new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10);
    const toDate = to ?? new Date().toISOString().slice(0, 10);
    const companyIds = this.resolveRollupCompanyIds(companyId);
    const groupRollup = isGroupRollupCompanyId(companyId);

    const res = await this.db.query<{
      metric_code: string;
      period_date: string;
      actual_value: string;
      target_value: string | null;
    }>(
      groupRollup
        ? `
      SELECT metric_code,
             period_date::text,
             SUM(actual_value)::text AS actual_value,
             AVG(target_value)::text AS target_value
      FROM public.xbos_kpi_actuals
      WHERE tenant_id = $1
        AND company_id = ANY($2::text[])
        AND period_date >= $3::date AND period_date <= $4::date
      GROUP BY metric_code, period_date
      ORDER BY metric_code, period_date
      `
        : `
      SELECT metric_code, period_date::text, actual_value::text, target_value::text
      FROM public.xbos_kpi_actuals
      WHERE tenant_id = $1 AND company_id = $2
        AND period_date >= $3::date AND period_date <= $4::date
      ORDER BY metric_code, period_date
      `,
      groupRollup ? [tenantId, companyIds, fromDate, toDate] : [tenantId, companyId, fromDate, toDate],
    );

    const byMetric = new Map<string, Array<{ period: string; actual: number; target: number | null }>>();
    for (const row of res.rows) {
      const list = byMetric.get(row.metric_code) ?? [];
      list.push({
        period: row.period_date,
        actual: Number(row.actual_value),
        target: row.target_value != null ? Number(row.target_value) : null,
      });
      byMetric.set(row.metric_code, list);
    }

    return {
      tenantId,
      companyId,
      rollupMode: groupRollup ? ('group' as const) : ('single' as const),
      companyIds: groupRollup ? companyIds : [companyId],
      from: fromDate,
      to: toDate,
      series: Array.from(byMetric.entries()).map(([metricCode, points]) => ({ metricCode, points })),
    };
  }

  async ensurePortalAlertsSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_portal_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id TEXT NOT NULL,
        company_id TEXT NULL,
        module_code TEXT NOT NULL DEFAULT 'system',
        level TEXT NOT NULL DEFAULT 'info',
        title TEXT NOT NULL,
        detail TEXT NULL,
        source_system TEXT NOT NULL DEFAULT 'xbos',
        source_id TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        dismissed_at TIMESTAMPTZ NULL
      );
    `);
  }

  async listPortalAlerts(tenantId: string, limit = 50, companyId?: string) {
    await this.ensurePortalAlertsSchema();
    const res = await this.db.query(
      companyId
        ? `
      SELECT id, tenant_id, company_id, module_code, level, title, detail, source_system, source_id, created_at
      FROM public.xbos_portal_alerts
      WHERE tenant_id = $1 AND dismissed_at IS NULL
        AND (company_id IS NULL OR company_id = $3)
      ORDER BY created_at DESC
      LIMIT $2
      `
        : `
      SELECT id, tenant_id, company_id, module_code, level, title, detail, source_system, source_id, created_at
      FROM public.xbos_portal_alerts
      WHERE tenant_id = $1 AND dismissed_at IS NULL
      ORDER BY created_at DESC
      LIMIT $2
      `,
      companyId ? [tenantId, limit, companyId] : [tenantId, limit],
    );
    return res.rows;
  }

  async publishPortalAlert(row: {
    tenantId: string;
    companyId?: string;
    moduleCode: string;
    level: string;
    title: string;
    detail?: string;
    sourceSystem: string;
    sourceId?: string;
  }) {
    await this.ensurePortalAlertsSchema();
    const res = await this.db.query<{ id: string }>(
      `
      INSERT INTO public.xbos_portal_alerts (tenant_id, company_id, module_code, level, title, detail, source_system, source_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id::text
      `,
      [
        row.tenantId,
        row.companyId ?? null,
        row.moduleCode,
        row.level,
        row.title,
        row.detail ?? null,
        row.sourceSystem,
        row.sourceId ?? null,
      ],
    );
    return { id: res.rows[0]?.id ?? null };
  }

  /** UC-XBOS-KPI-04 — emit portal alert from KPI band evaluation. */
  async emitKpiBandAlert(params: {
    tenantId: string;
    companyId: string;
    metricCode: string;
    band: 'warning' | 'critical';
    score: number;
    actual: number;
    target: number;
  }) {
    const level = params.band;
    const title =
      params.band === 'critical'
        ? `KPI critical: ${params.metricCode}`
        : `KPI warning: ${params.metricCode}`;
    const detail = `score=${params.score}; actual=${params.actual}; target=${params.target}`;
    return this.publishPortalAlert({
      tenantId: params.tenantId,
      companyId: params.companyId,
      moduleCode: 'kpi-engine',
      level,
      title,
      detail,
      sourceSystem: 'xbos',
      sourceId: `${params.metricCode}:${params.band}`,
    });
  }
}
