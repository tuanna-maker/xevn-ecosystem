/**
 * @CODE-MEMORY
 * Screen:     HRM PAY consumers — template / period pack / compensation (S-PAY-CNS-01..04)
 * UC:         AC-PLT-PAY-01 · AC-PAY-COMP-01 · BR-PLT-PAY-02/03/07 · L-PAY-AC-01/04/06
 * BR:         When Nest salary_components effective active >0 → component_code ∈ catalog;
 *             empty catalog = soft allow (U65 no fake starter); admin CREATE remains open
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md §3–§7
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md L-PAY-AC-01..10
 * API_DESIGN: F-PLT-PAY-COMP-01 picker SoT · consumer mutate EXPAND (not F-PLT-PAY-COMP-02)
 * Purpose:    Shared consumer-write membership assert — same resolveHrmListScope as list (U19).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01
 * Coded:      2026-08-07
 * Callers:    pay-sheet-template · pay-period-input-pack · employee-compensation
 * Callees:    HrmDbService · expandPayrollPeriodCompanyIds · public.salary_components
 * FEActions:  Picker Nest → Lưu; invent free-text → 4xx HRM-SC-COMP-KEY
 * BEChain:    count active → soft if 0 → membership lower(code)/id ∈ active∪scope
 * Impact:     Mis-apply on admin POST = break BR-PLT-05; drift scope = U19 FAIL
 * must_keep:  payroll_e2e_ready=false · formula LIVE DENIED · no second catalog table ·
 *             admin F-PLT-PAY-COMP-02 open N+1 · U65 no seed · HRM-COMP-004 1:1 alias
 * SOLID:      Assert helper SRP — no admin CRUD; consumers inject query only
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-cns-be-01.md
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  expandPayrollPeriodCompanyIds,
  normalizePayrollListCompanyId,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbQueryFn } from '../db/hrm-db.service';
import { HRM_SC_COMP_KEY } from './payroll-catalog.constants';

export type SalaryComponentCatalogHit = {
  id: string;
  code: string;
  companyId: string;
  isActive: boolean;
};

function resolveConsumerCompanyIds(companyId: string, authorization?: string): string[] {
  const scopeCompanyId = normalizePayrollListCompanyId(authorization, companyId);
  const scope = resolveHrmListScope(authorization, scopeCompanyId);
  return expandPayrollPeriodCompanyIds(scope);
}

/** Effective active = is_active + not soft-archived (picker default SoT). */
export async function countEffectiveActiveSalaryComponents(
  query: HrmDbQueryFn,
  companyId: string,
  authorization?: string,
): Promise<number> {
  const companyIds = resolveConsumerCompanyIds(companyId, authorization);
  try {
    const res = await query<{ c: string }>(
      `
        SELECT COUNT(*)::text AS c
        FROM public.salary_components
        WHERE company_id = ANY($1::text[])
          AND is_active = TRUE
          AND archived_at IS NULL;
      `,
      [companyIds],
    );
    return Number(res.rows[0]?.c ?? 0);
  } catch {
    // Cold bootstrap — table may be absent; treat as empty (soft allow).
    return 0;
  }
}

/**
 * BR-PLT-PAY-02 / AC-PAY-COMP-01 — when Nest effective active >0, reject invent/OOS/retired codes.
 * Empty catalog → soft allow (AC-PLT-PAY-01b / L-PAY-AC-04). Does NOT call starter ensure.
 */
export async function assertComponentCodeInEffectiveCatalog(input: {
  query: HrmDbQueryFn;
  companyId: string;
  componentCode: string;
  authorization?: string;
}): Promise<SalaryComponentCatalogHit | null> {
  const code = input.componentCode.trim();
  if (!code) {
    throw new ApiException(
      HRM_SC_COMP_KEY,
      'component_code is required when Nest salary_components catalog is in use',
      HttpStatus.BAD_REQUEST,
    );
  }
  const activeCount = await countEffectiveActiveSalaryComponents(
    input.query,
    input.companyId,
    input.authorization,
  );
  if (activeCount === 0) {
    return null;
  }
  const companyIds = resolveConsumerCompanyIds(input.companyId, input.authorization);
  let row: { id: string; code: string; company_id: string; is_active: boolean } | undefined;
  try {
    const res = await input.query<{
      id: string;
      code: string;
      company_id: string;
      is_active: boolean;
    }>(
      `
        SELECT id::text AS id, code, company_id::text AS company_id, is_active
        FROM public.salary_components
        WHERE company_id = ANY($1::text[])
          AND lower(code) = lower($2::text)
          AND is_active = TRUE
          AND archived_at IS NULL
        LIMIT 1;
      `,
      [companyIds, code],
    );
    row = res.rows[0];
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException(
      HRM_SC_COMP_KEY,
      `component_code '${input.componentCode}' is not in Nest salary_components (free-text SoT forbidden)`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  if (!row) {
    throw new ApiException(
      HRM_SC_COMP_KEY,
      `component_code '${input.componentCode}' is not in Nest salary_components effective catalog (invent/retired forbidden when catalog ≠ empty)`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  return {
    id: row.id,
    code: row.code,
    companyId: row.company_id,
    isActive: Boolean(row.is_active),
  };
}

/**
 * Template line path (UUID FK) — same membership gate as code assert (VAL-PAY-CNS-01).
 * Emits HRM-SC-COMP-KEY when Nest active >0 and id missing/inactive/OOS.
 */
export async function assertComponentIdInEffectiveCatalog(input: {
  query: HrmDbQueryFn;
  companyId: string;
  componentId: string;
  authorization?: string;
}): Promise<SalaryComponentCatalogHit> {
  const componentId = String(input.componentId ?? '').trim();
  if (!componentId) {
    throw new ApiException(
      HRM_SC_COMP_KEY,
      'component_id is required for pay sheet template lines',
      HttpStatus.BAD_REQUEST,
    );
  }
  const activeCount = await countEffectiveActiveSalaryComponents(
    input.query,
    input.companyId,
    input.authorization,
  );
  const companyIds = resolveConsumerCompanyIds(input.companyId, input.authorization);
  let row: { id: string; code: string; company_id: string; is_active: boolean } | undefined;
  try {
    const res = await input.query<{
      id: string;
      code: string;
      company_id: string;
      is_active: boolean;
    }>(
      `
        SELECT id::text AS id, code, company_id::text AS company_id, is_active
        FROM public.salary_components
        WHERE id = $1::uuid
          AND company_id = ANY($2::text[])
          AND is_active = TRUE
          AND archived_at IS NULL
        LIMIT 1;
      `,
      [componentId, companyIds],
    );
    row = res.rows[0];
  } catch (error) {
    if (error instanceof ApiException) throw error;
    // Missing table / bad uuid — when catalog empty soft-fail closed with KEY only if count>0 path unreachable
    throw new ApiException(
      HRM_SC_COMP_KEY,
      'Salary component not found in Nest salary_components effective catalog',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  if (!row) {
    // Empty catalog + unknown id: still reject UUID invent (FK integrity) with same taxonomy when count>0;
    // when count=0 soft allow is N/A for UUID — reject with KEY for deterministic consumer VAL.
    if (activeCount === 0) {
      throw new ApiException(
        HRM_SC_COMP_KEY,
        'Salary component not found in Nest salary_components (create catalog admin row first)',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    throw new ApiException(
      HRM_SC_COMP_KEY,
      'Salary component id is not in Nest salary_components effective catalog (invent/retired/OOS forbidden)',
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
  return {
    id: row.id,
    code: row.code,
    companyId: row.company_id,
    isActive: Boolean(row.is_active),
  };
}
