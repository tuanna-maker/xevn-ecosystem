/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tab Đãi ngộ
 * UC:         UC-HRM-CI-08..11 · AC-CD-F5-01..04 · BR-AMIS-PAY-SRC-02
 * BR:         BR-CD-F5-01..05 · BR-AMIS-PAY-SRC-02
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/api/openapi/hrm-api.yaml compensation-packages
 * Purpose:    Pure builders/validators for compensation package line payloads
 *             (base required; probation optional; ≥2 distinct allowance codes;
 *             component_code on every line for emp_cb SRC-02).
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeCompensationPanel.tsx · useEmployeeCompensation.ts
 * Callees:    N/A
 * Impact:     Wrong payload → HRM-COMP-001/002/003/004/005 from BE
 * must_keep:  Never invent salary on contract body; raise via revise not PATCH lines
 * SOLID:      Pure functions — testable without React
 * LastVerified: compensationLines.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP-FE-PROFILE-01
 * change_mode: ADD (restore transitive)
 * What: Khôi phục compensationLines từ stash 43c479a — dep của CompensationPanel
 * must_keep: base required · ≥2 allowances · no invent salary on contract body
 * LastVerified: docs/qa/evidence/w1b-02-emp-fe-profile-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-FE-CB-01
 * change_mode: ADD
 * What: deriveComponentCode + emit component_code on every create/revise line;
 *       reject base ≤0 so empty ViMoney cannot silent-pass.
 * Why: R-EMP-SH-FE-CB-CLICK — U65 Đãi ngộ POST must carry component_code for SRC-02
 * must_keep: base→base · probation→probation · allowance→lower(allowance_code);
 *            explicit draft.component_code wins; no invent catalog codes beyond DM §33
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-fe-cb-01.md
 */

import type { HrmCompensationLineInput } from '@/integrations/hrmApi';

export type AllowanceDraft = {
  allowance_code: string;
  amount: string;
  /** Optional override; default = normalize(allowance_code). */
  component_code?: string;
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

/** Normalize to salary_components.code style (lower snake). */
export function normalizeCompensationComponentCode(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');
}

/**
 * Resolve component_code for a line (DATA §4.2 / BE deriveComponentCodeForLine parity).
 * Explicit override wins; else base|probation|lower(allowance_code).
 */
export function deriveComponentCode(input: {
  line_type: 'base' | 'probation' | 'allowance';
  allowance_code?: string | null;
  component_code?: string | null;
}): string | null {
  const explicit = input.component_code?.trim();
  if (explicit) return normalizeCompensationComponentCode(explicit);
  if (input.line_type === 'base') return 'base';
  if (input.line_type === 'probation') return 'probation';
  if (input.line_type === 'allowance') {
    const ac = input.allowance_code?.trim();
    return ac ? normalizeCompensationComponentCode(ac) : null;
  }
  return null;
}

export function buildCompensationLines(draft: CompensationFormDraft): BuildLinesResult {
  const baseRaw = draft.baseAmount.replace(/[.,\s]/g, '').trim();
  const base = Number(baseRaw);
  if (!baseRaw || !Number.isFinite(base) || base <= 0) {
    return { ok: false, error: 'Nhập lương cơ bản (base) hợp lệ' };
  }

  const lines: HrmCompensationLineInput[] = [
    {
      line_type: 'base',
      amount: base,
      currency: 'VND',
      component_code: deriveComponentCode({ line_type: 'base' }) ?? 'base',
    },
  ];

  if (draft.includeProbation) {
    const probationRaw = draft.probationAmount.replace(/[.,\s]/g, '').trim();
    const probation = Number(probationRaw);
    if (!probationRaw || !Number.isFinite(probation) || probation < 0) {
      return { ok: false, error: 'Nhập lương thử việc hợp lệ hoặc tắt dòng probation' };
    }
    lines.push({
      line_type: 'probation',
      amount: probation,
      currency: 'VND',
      component_code: deriveComponentCode({ line_type: 'probation' }) ?? 'probation',
    });
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
  const componentCodes = new Set<string>();
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
    const component_code = deriveComponentCode({
      line_type: 'allowance',
      allowance_code: code,
      component_code: row.component_code,
    });
    if (!component_code) {
      return { ok: false, error: `Thiếu component_code cho phụ cấp ${code}` };
    }
    if (componentCodes.has(component_code)) {
      return { ok: false, error: `Trùng thành phần lương: ${component_code}` };
    }
    componentCodes.add(component_code);
    lines.push({
      line_type: 'allowance',
      amount,
      currency: 'VND',
      allowance_code: code,
      component_code,
      taxable: true,
    });
  }

  // base/probation vs allowance collision (e.g. allowance_code BASE)
  for (const line of lines) {
    if (line.line_type === 'allowance' && line.component_code) {
      if (line.component_code === 'base' || line.component_code === 'probation') {
        return {
          ok: false,
          error: `component_code «${line.component_code}» trùng dòng lương cố định`,
        };
      }
    }
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
