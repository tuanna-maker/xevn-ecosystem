/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tab Đãi ngộ
 * UC:         UC-HRM-CI-08..11 · AC-CD-F5-01..04
 * BR:         BR-CD-F5-01..05
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/api/openapi/hrm-api.yaml compensation-packages
 * Purpose:    Pure builders/validators for compensation package line payloads
 *             (base required; probation optional; ≥2 distinct allowance codes).
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeCompensationPanel.tsx · useEmployeeCompensation.ts
 * Callees:    N/A
 * Impact:     Wrong payload → HRM-COMP-001/002/003 from BE
 * must_keep:  Never invent salary on contract body; raise via revise not PATCH lines
 * SOLID:      Pure functions — testable without React
 * LastVerified: compensationLines.test.ts
 */

import type { HrmCompensationLineInput } from '@/integrations/hrmApi';

export type AllowanceDraft = {
  allowance_code: string;
  amount: string;
};

export type CompensationFormDraft = {
  baseAmount: string;
  probationAmount: string;
  includeProbation: boolean;
  allowances: AllowanceDraft[];
  changeReason: string;
  effectiveFrom: string;
};

export type BuildLinesResult =
  | { ok: true; lines: HrmCompensationLineInput[] }
  | { ok: false; error: string };

export function buildCompensationLines(draft: CompensationFormDraft): BuildLinesResult {
  const base = Number(draft.baseAmount.replace(/[.,\s]/g, '').trim());
  if (!Number.isFinite(base) || base < 0) {
    return { ok: false, error: 'Nhập lương cơ bản (base) hợp lệ' };
  }

  const lines: HrmCompensationLineInput[] = [
    { line_type: 'base', amount: base, currency: 'VND' },
  ];

  if (draft.includeProbation) {
    const probation = Number(draft.probationAmount.replace(/[.,\s]/g, '').trim());
    if (!Number.isFinite(probation) || probation < 0) {
      return { ok: false, error: 'Nhập lương thử việc hợp lệ hoặc tắt dòng probation' };
    }
    lines.push({ line_type: 'probation', amount: probation, currency: 'VND' });
  }

  const filled = draft.allowances.filter(
    (a) => a.allowance_code.trim() && a.amount.trim() !== '',
  );
  if (filled.length < 2) {
    return {
      ok: false,
      error: 'Cần ít nhất 2 phụ cấp với mã danh mục khác nhau',
    };
  }

  const codes = new Set<string>();
  for (const row of filled) {
    const code = row.allowance_code.trim();
    if (codes.has(code)) {
      return { ok: false, error: `Mã phụ cấp trùng: ${code}` };
    }
    codes.add(code);
    const amount = Number(row.amount.replace(/[.,\s]/g, '').trim());
    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: `Số tiền phụ cấp không hợp lệ (${code})` };
    }
    lines.push({
      line_type: 'allowance',
      amount,
      currency: 'VND',
      allowance_code: code,
      taxable: true,
    });
  }

  return { ok: true, lines };
}

export function baseAmountFromPackage(
  lines: Array<{ line_type: string; amount: number }> | undefined,
): number | null {
  if (!lines?.length) return null;
  const base = lines.find((l) => l.line_type === 'base');
  return base ? Number(base.amount) : null;
}

export function isProbationContractType(contractType: string | null | undefined): boolean {
  const t = (contractType ?? '').toLowerCase();
  return t.includes('thử việc') || t.includes('thu viec') || t.includes('probation');
}
