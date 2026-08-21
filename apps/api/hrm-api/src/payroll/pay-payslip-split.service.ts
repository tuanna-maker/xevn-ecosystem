/**
 * @CODE-MEMORY
 * Screen:     HRM PAY — gộp lương giữa kỳ (F-PAY-SPLIT-01)
 * UC:         UC-BP-PAY-04
 * BR:         BR-BP-SPL-01
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-PAY-04 Diễn biến #1–#3
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-PAY-04-CLUSTER-API-01.md §4.1 S1–S5
 * Purpose:    DETECT · SEGMENT · EVAL-PER · MERGE · AUDIT-DB cho một NV trong process kỳ — một net (DV-13).
 * WorkItem:   PO-HRM-MVP-GD1-PAY-04-CLUSTER-BE-01
 * Coded:      2026-08-10
 * Callers:    payroll.service processPayrollPeriod
 * Callees:    employee_compensation_packages · PayFormulaService.processEmployeePayslipViaSrc · payroll_payslip_split_segments
 * must_keep:  PAY01QC1 ATT closed hours · PAY02QC1 process order · payroll_e2e_ready=false · C-SLICE
 * SOLID:      Tách orchestration split khỏi PayrollService monolith
 * LastVerified: pay-payslip-split.service.spec.ts
 */
import { HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { PayPayslipSplitSegmentDto } from './dto/pay-payslip-split-segment.dto';
import { PayFormulaService } from './pay-formula.service';
import type { PublishedFormulaBind } from './pay-formula.service';
import type { PaySrcResolvedLine } from './pay-src-resolver';
import {
  expandCbReadCompanyIds,
  loadAttHoursFromClosedLine,
  loadCoreCbVariableBag,
} from './pay-formula-variable-bag';
import {
  HRM_PAY_SPLIT_409,
  PAY_SPLIT_STATIC_COMPONENT_PREFIXES,
} from './pay-payslip-split.constants';

export type PaySplitSegmentWindow = {
  segmentSeq: number;
  effectiveFrom: string;
  effectiveTo: string;
  baseSalarySnapshot?: number | null;
};

export type PaySplitEmployeeProcessResult =
  | {
      mode: 'computed';
      split: boolean;
      segmentCount: number;
      gross: number;
      deduction: number;
      net: number;
      lines: PaySrcResolvedLine[];
      primaryFormulaDefinitionId: string;
      warnings: string[];
      segments: PayPayslipSplitSegmentDto[];
    }
  | {
      mode: 'blocked';
      code: string;
      message: string;
      details: Record<string, unknown>;
    };

function parseIsoDate(value: string): Date {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return formatIsoDate(d);
}

function inclusiveDayCount(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  const ms = to.getTime() - from.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** F-PAY-CB-READ-01 — effective_from cuts intersecting payroll period (cấm hardcode ngày 15). */
export async function loadCompensationCutDatesInPeriod(
  db: HrmDbService,
  input: {
    employeeId: string;
    companyId: string;
    periodFrom: string;
    periodTo: string;
  },
): Promise<string[]> {
  const cuts = new Set<string>();
  const companyIds = expandCbReadCompanyIds(input.companyId, null);

  try {
    const pkgRes = await db.query<{ cut: string }>(
      `
        SELECT DISTINCT p.effective_from::date::text AS cut
        FROM public.employee_compensation_packages p
        WHERE p.employee_id = $1::uuid
          AND p.company_id = ANY($2::text[])
          AND p.effective_from::date > $3::date
          AND p.effective_from::date <= $4::date
        ORDER BY cut;
      `,
      [input.employeeId, companyIds, input.periodFrom, input.periodTo],
    );
    for (const row of pkgRes.rows) {
      if (row.cut) cuts.add(row.cut);
    }
  } catch {
    /* soft — TRACE GAP if CORE ring incomplete */
  }

  try {
    const contractRes = await db.query<{ cut: string }>(
      `
        SELECT DISTINCT c.effective_date::date::text AS cut
        FROM public.employee_contracts c
        WHERE c.employee_id = $1::uuid
          AND c.effective_date IS NOT NULL
          AND c.effective_date::date > $2::date
          AND c.effective_date::date <= $3::date
        ORDER BY cut;
      `,
      [input.employeeId, input.periodFrom, input.periodTo],
    );
    for (const row of contractRes.rows) {
      if (row.cut) cuts.add(row.cut);
    }
  } catch {
    /* soft */
  }

  return [...cuts].sort();
}

export function buildSplitSegmentWindows(
  periodFrom: string,
  periodTo: string,
  cutDates: string[],
): PaySplitSegmentWindow[] {
  const sorted = [...cutDates]
    .filter((c) => c > periodFrom && c <= periodTo)
    .sort();
  const windows: PaySplitSegmentWindow[] = [];
  let seq = 1;
  let segmentStart = periodFrom;
  for (const cut of sorted) {
    const segmentEnd = addDays(cut, -1);
    if (segmentStart <= segmentEnd) {
      windows.push({
        segmentSeq: seq,
        effectiveFrom: segmentStart,
        effectiveTo: segmentEnd,
      });
      seq += 1;
    }
    segmentStart = cut;
  }
  if (segmentStart <= periodTo) {
    windows.push({
      segmentSeq: seq,
      effectiveFrom: segmentStart,
      effectiveTo: periodTo,
    });
  }
  if (windows.length === 0) {
    windows.push({
      segmentSeq: 1,
      effectiveFrom: periodFrom,
      effectiveTo: periodTo,
    });
  }
  return windows;
}

export async function resolveBaseSalarySnapshotForSegment(
  db: HrmDbService,
  input: { companyId: string; employeeId: string; asOfDate: string },
): Promise<number | null> {
  const bag = await loadCoreCbVariableBag(db, input);
  const base = bag.vars.base_salary;
  return typeof base === 'number' && Number.isFinite(base) ? base : null;
}

export function isStaticSplitComponentCode(componentCode: string): boolean {
  const upper = componentCode.trim().toUpperCase();
  return PAY_SPLIT_STATIC_COMPONENT_PREFIXES.some(
    (prefix) => upper === prefix || upper.startsWith(prefix),
  );
}

/** Count static deduction lines across segment evals — >1 triggers HRM-PAY-SPLIT-409. */
export function detectDoubleStaticViolation(
  segmentEvals: Array<{
    lines: Array<{ component_code: string; sign: string }>;
  }>,
): boolean {
  let staticDeductionSegments = 0;
  for (const evalSeg of segmentEvals) {
    const hasStaticDeduction = evalSeg.lines.some(
      (line) =>
        line.sign === 'deduction' &&
        isStaticSplitComponentCode(line.component_code),
    );
    if (hasStaticDeduction) staticDeductionSegments += 1;
  }
  return staticDeductionSegments > 1;
}

export function prorateAttHourOverrides(
  fullVars: Record<string, number>,
  segmentFrom: string,
  segmentTo: string,
  periodFrom: string,
  periodTo: string,
): Record<string, number> {
  const periodDays = inclusiveDayCount(periodFrom, periodTo);
  const segmentDays = inclusiveDayCount(segmentFrom, segmentTo);
  const ratio = segmentDays / periodDays;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(fullVars)) {
    if (!Number.isFinite(value)) continue;
    out[key] = roundMoney(value * ratio);
  }
  return out;
}

export async function ensurePayPayslipSplitSegmentsSchema(
  db: HrmDbService,
): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_payslip_split_segments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payslip_id UUID NOT NULL REFERENCES public.payroll_payslips(id) ON DELETE CASCADE,
      company_id TEXT NOT NULL,
      segment_seq INT NOT NULL,
      effective_from DATE NOT NULL,
      effective_to DATE NOT NULL,
      base_salary_snapshot NUMERIC(15,2) NULL,
      hours_payable NUMERIC(12,4) NULL,
      segment_gross NUMERIC(15,2) NULL,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT chk_pay_split_segment_dates CHECK (effective_from <= effective_to)
    );
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_payslip_split_segment_seq
    ON public.payroll_payslip_split_segments (payslip_id, segment_seq)
    WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_payroll_payslip_split_segments_company_payslip
    ON public.payroll_payslip_split_segments (company_id, payslip_id);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_payroll_payslip_split_segments_payslip
    ON public.payroll_payslip_split_segments (payslip_id);
  `);
}

export class PayPayslipSplitService {
  constructor(
    private readonly db: HrmDbService,
    private readonly payFormulas: PayFormulaService,
  ) {}

  async processEmployeeInPeriod(input: {
    companyId: string;
    periodId: string;
    periodFrom: string;
    periodTo: string;
    employeeId: string;
    asOfDate: string;
    sheetTemplateSnapshotJson?: unknown;
    boundFormula: PublishedFormulaBind;
    authorization?: string;
    simulateDoubleStatic?: boolean;
    systemParams: Record<string, number>;
  }): Promise<PaySplitEmployeeProcessResult> {
    const cutDates = await loadCompensationCutDatesInPeriod(this.db, {
      employeeId: input.employeeId,
      companyId: input.companyId,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
    });

    const singlePath = async (): Promise<PaySplitEmployeeProcessResult> => {
      const evaluated = await this.payFormulas.processEmployeePayslipViaSrc({
        companyId: input.companyId,
        periodId: input.periodId,
        employeeId: input.employeeId,
        asOfDate: input.asOfDate,
        periodFrom: input.periodFrom,
        periodTo: input.periodTo,
        sheetTemplateSnapshotJson: input.sheetTemplateSnapshotJson,
        boundFormula: input.boundFormula,
        authorization: input.authorization,
        systemParams: input.systemParams,
      });
      if (evaluated.mode === 'blocked') {
        return evaluated;
      }
      return {
        mode: 'computed',
        split: false,
        segmentCount: 0,
        gross: evaluated.gross,
        deduction: evaluated.deduction,
        net: evaluated.net,
        lines: evaluated.lines,
        primaryFormulaDefinitionId: evaluated.primaryFormulaDefinitionId,
        warnings: [...evaluated.warnings, 'F-PAY-SPLIT-01:DETECT_FALSE'],
        segments: [],
      };
    };

    if (cutDates.length === 0) {
      return singlePath();
    }

    const windows = buildSplitSegmentWindows(
      input.periodFrom,
      input.periodTo,
      cutDates,
    );
    if (windows.length <= 1) {
      return singlePath();
    }

    const fullAtt = await loadAttHoursFromClosedLine(this.db, {
      companyId: input.companyId,
      employeeId: input.employeeId,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
      periodId: input.periodId,
    });

    const segmentEvals: Array<{
      window: PaySplitSegmentWindow;
      gross: number;
      hoursPayable: number | null;
      baseSalarySnapshot: number | null;
      lines: PaySrcResolvedLine[];
    }> = [];

    for (const window of windows) {
      const baseSalarySnapshot = await resolveBaseSalarySnapshotForSegment(
        this.db,
        {
          companyId: input.companyId,
          employeeId: input.employeeId,
          asOfDate: window.effectiveFrom,
        },
      );
      const hourOverrides = prorateAttHourOverrides(
        fullAtt.vars,
        window.effectiveFrom,
        window.effectiveTo,
        input.periodFrom,
        input.periodTo,
      );
      const evaluated = await this.payFormulas.processEmployeePayslipViaSrc({
        companyId: input.companyId,
        periodId: input.periodId,
        employeeId: input.employeeId,
        asOfDate: window.effectiveTo,
        periodFrom: window.effectiveFrom,
        periodTo: window.effectiveTo,
        sheetTemplateSnapshotJson: input.sheetTemplateSnapshotJson,
        boundFormula: input.boundFormula,
        authorization: input.authorization,
        systemParams: input.systemParams,
      });
      if (evaluated.mode === 'blocked') {
        return evaluated;
      }
      const hoursPayable =
        hourOverrides.payable_hours ?? fullAtt.vars.payable_hours ?? null;
      segmentEvals.push({
        window,
        gross: evaluated.gross,
        hoursPayable: hoursPayable != null ? roundMoney(hoursPayable) : null,
        baseSalarySnapshot,
        lines: evaluated.lines,
      });
    }

    if (
      input.simulateDoubleStatic ||
      detectDoubleStaticViolation(segmentEvals)
    ) {
      return {
        mode: 'blocked',
        code: HRM_PAY_SPLIT_409,
        message:
          'Phát hiện trừ biến tĩnh tháng (GTCG/thuế/BH) nhiều lần khi gộp split — từ chối im lặng (BR-BP-SPL-01)',
        details: {
          periodId: input.periodId,
          employeeId: input.employeeId,
          segmentCount: segmentEvals.length,
          payroll_e2e_ready: false,
        },
      };
    }

    const totalSegmentGross = roundMoney(
      segmentEvals.reduce((sum, s) => sum + s.gross, 0),
    );
    const mergeEval = await this.payFormulas.processEmployeePayslipViaSrc({
      companyId: input.companyId,
      periodId: input.periodId,
      employeeId: input.employeeId,
      asOfDate: input.asOfDate,
      periodFrom: input.periodFrom,
      periodTo: input.periodTo,
      sheetTemplateSnapshotJson: input.sheetTemplateSnapshotJson,
      boundFormula: input.boundFormula,
      authorization: input.authorization,
      systemParams: input.systemParams,
    });
    if (mergeEval.mode === 'blocked') {
      return mergeEval;
    }

    const gross = totalSegmentGross;
    const deduction = mergeEval.deduction;
    const net = roundMoney(gross - deduction);

    const segments: PayPayslipSplitSegmentDto[] = segmentEvals.map((s) => ({
      segmentSeq: s.window.segmentSeq,
      effectiveFrom: s.window.effectiveFrom,
      effectiveTo: s.window.effectiveTo,
      baseSalarySnapshotVnd: s.baseSalarySnapshot,
      hoursPayable: s.hoursPayable,
      segmentGrossVnd: roundMoney(s.gross),
    }));

    return {
      mode: 'computed',
      split: true,
      segmentCount: segments.length,
      gross,
      deduction,
      net,
      lines: mergeEval.lines,
      primaryFormulaDefinitionId: mergeEval.primaryFormulaDefinitionId,
      warnings: [
        ...mergeEval.warnings,
        'F-PAY-SPLIT-01:DETECT_TRUE',
        `F-PAY-SPLIT-01:SEGMENTS:${segments.length}`,
        'PAYROLL_E2E_READY_FALSE',
      ],
      segments,
    };
  }

  async replacePayslipSplitSegments(input: {
    payslipId: string;
    companyId: string;
    segments: PayPayslipSplitSegmentDto[];
  }): Promise<void> {
    await ensurePayPayslipSplitSegmentsSchema(this.db);
    await this.db.query(
      `DELETE FROM public.payroll_payslip_split_segments WHERE payslip_id = $1::uuid`,
      [input.payslipId],
    );
    for (const seg of input.segments) {
      await this.db.query(
        `
          INSERT INTO public.payroll_payslip_split_segments (
            id, payslip_id, company_id, segment_seq, effective_from, effective_to,
            base_salary_snapshot, hours_payable, segment_gross
          ) VALUES (
            $1::uuid, $2::uuid, $3::text, $4, $5::date, $6::date,
            $7, $8, $9
          );
        `,
        [
          randomUUID(),
          input.payslipId,
          input.companyId,
          seg.segmentSeq,
          seg.effectiveFrom,
          seg.effectiveTo,
          seg.baseSalarySnapshotVnd,
          seg.hoursPayable,
          seg.segmentGrossVnd,
        ],
      );
    }
  }

  async clearPayslipSplitSegments(payslipId: string): Promise<void> {
    await ensurePayPayslipSplitSegmentsSchema(this.db);
    await this.db.query(
      `DELETE FROM public.payroll_payslip_split_segments WHERE payslip_id = $1::uuid`,
      [payslipId],
    );
  }

  async loadSplitSegmentsForPayslip(
    payslipId: string,
  ): Promise<PayPayslipSplitSegmentDto[]> {
    await ensurePayPayslipSplitSegmentsSchema(this.db);
    const res = await this.db.query<{
      segment_seq: number;
      effective_from: string;
      effective_to: string;
      base_salary_snapshot: string | null;
      hours_payable: string | null;
      segment_gross: string | null;
    }>(
      `
        SELECT
          segment_seq,
          effective_from::text AS effective_from,
          effective_to::text AS effective_to,
          base_salary_snapshot::text AS base_salary_snapshot,
          hours_payable::text AS hours_payable,
          segment_gross::text AS segment_gross
        FROM public.payroll_payslip_split_segments
        WHERE payslip_id = $1::uuid
          AND archived_at IS NULL
        ORDER BY segment_seq ASC;
      `,
      [payslipId],
    );
    return res.rows.map((row) => ({
      segmentSeq: row.segment_seq,
      effectiveFrom: row.effective_from,
      effectiveTo: row.effective_to,
      baseSalarySnapshotVnd:
        row.base_salary_snapshot != null
          ? Number(row.base_salary_snapshot)
          : null,
      hoursPayable:
        row.hours_payable != null ? Number(row.hours_payable) : null,
      segmentGrossVnd: Number(row.segment_gross ?? 0),
    }));
  }

  assertSplit409OrThrow(details: {
    periodId: string;
    employeeId: string;
    message: string;
  }): never {
    throw new ApiException(
      HRM_PAY_SPLIT_409,
      details.message,
      HttpStatus.CONFLICT,
      {
        code: HRM_PAY_SPLIT_409,
        period_id: details.periodId,
        employee_id: details.employeeId,
        payroll_e2e_ready: false,
      },
    );
  }
}
