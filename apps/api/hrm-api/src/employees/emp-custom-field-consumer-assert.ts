/**
 * @CODE-MEMORY
 * Screen:     HRM Employees create/update — custom_fields extension invent gate (S-EMP-CF-CNS-01)
 * UC:         AC-PLT-EMP-CUSTOM-01c/01d · UC-PLT-EMP-CF-01c/01d · VAL-EMP-CF-CNS-01/02/03/06
 * BR:         BR-PLT-02 · BR-PLT-EMP-CF-03/04 · L-EMP-CF-05/06 — EFF>0 invent → KEY; EFF=0 skip
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md §3–§7
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md L-EMP-CF-05/06 · F-EMP-CF-CNS-01
 * API_DESIGN: F-EMP-CF-CNS-01 · SoT = Settings hrm_catalog_extension_items allow-list (Option A)
 * Purpose:    Consumer-write membership assert for extension codes in custom_fields.
 *             Admin CREATE / F-EMP-TOK-03 remain open — must_keep; no Nest emp_custom_field.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01
 * Coded:      2026-08-08
 * Callers:    employees.service createEmployee / updateEmployee
 * Callees:    HrmDbQueryFn · resolveHrmListScope · expandHrmTextCompanyIds ·
 *             EMP_EXTENSION_FIELD_CATALOG_KEYS · EMP_EXTENSION_CORE_COLUMN_CODES
 * FEActions:  Employee form Lưu → invent free-text extension → 4xx HRM-EMP-CUSTOM-FIELD-KEY
 * BEChain:    count active allow-list defs → soft if 0 → non-builtin keys ∈ active codes
 * Impact:     Mis-apply on admin extension CREATE = break BR-PLT-05; scope drift = U19 FAIL
 * must_keep:  F-EMP-TOK-03 · Settings extension-items admin CREATE · EXT-04c value≠register ·
 *             ESS phone allow · no Nest field-def · U65 no seed · personnel ready=false
 * SOLID:      Assert helper SRP — no admin CRUD; no merge-token register on value write
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-be-01.md
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  expandHrmTextCompanyIds,
  MASTER_TENANT_ID,
  resolveHrmListScope,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { HrmDbQueryFn } from '../db/hrm-db.service';
import {
  EMP_EXTENSION_CORE_COLUMN_CODES,
  EMP_EXTENSION_FIELD_CATALOG_KEYS,
  normalizeEmpExtensionFieldCode,
  shouldSkipEmpExtensionCoreColumn,
} from '../merge-tokens/emp-merge-token-register';

/** Deterministic consumer invent taxonomy (AC-PLT-EMP-CUSTOM-01c). */
export const HRM_EMP_CUSTOM_FIELD_KEY = 'HRM-EMP-CUSTOM-FIELD-KEY';

/**
 * Platform / builtin keys that live in custom_fields JSON but are NOT extension defs.
 * Invent KEY targets = keys outside this set when EFF>0 (BA L-EMP-CF-05).
 */
export const EMP_CUSTOM_FIELD_BUILTIN_KEYS: ReadonlySet<string> = new Set([
  ...EMP_EXTENSION_CORE_COLUMN_CODES,
  'tenant_id',
  'department',
  'phone_number',
  'work_phone',
  'gender',
  'mobile_persona',
  'is_manager',
  'leave_balance',
  'annual_leave_balance',
  'remaining_leave_days',
  'salary',
  'grade',
  'position',
  'branch',
  'management_unit',
  'status_reason_key',
]);

const EMP_EXTENSION_CATALOG_KEY_LIST = [...EMP_EXTENSION_FIELD_CATALOG_KEYS];

export function isEmpCustomFieldBuiltinKey(code: string): boolean {
  const norm = normalizeEmpExtensionFieldCode(code);
  return (
    !norm ||
    EMP_CUSTOM_FIELD_BUILTIN_KEYS.has(norm) ||
    shouldSkipEmpExtensionCoreColumn(norm)
  );
}

/** Keys that may invent — non-builtin and not already present on the prior row (history retain). */
export function collectEmpCustomFieldInventCandidates(
  customFields: Record<string, unknown> | null | undefined,
  previousCustomFields?: Record<string, unknown> | null,
): string[] {
  if (!customFields || typeof customFields !== 'object') {
    return [];
  }
  const out: string[] = [];
  for (const rawKey of Object.keys(customFields)) {
    if (isEmpCustomFieldBuiltinKey(rawKey)) {
      continue;
    }
    if (
      previousCustomFields &&
      Object.prototype.hasOwnProperty.call(previousCustomFields, rawKey)
    ) {
      // AC-01e / VAL-EMP-CF-CNS-03 — history values may retain retired keys on re-save.
      continue;
    }
    out.push(rawKey);
  }
  return out;
}

function resolveEmpExtensionCatalogCompanyIds(
  companyId: string,
  authorization?: string,
  tenantId?: string,
): string[] {
  const tid = (tenantId ?? MASTER_TENANT_ID).trim().toLowerCase() || MASTER_TENANT_ID;
  const scope = resolveHrmListScope(authorization, companyId, { tenantId: tid });
  const out = new Set(
    expandHrmTextCompanyIds(scope, authorization, companyId).map((id) => id.trim().toLowerCase()),
  );
  out.add(resolveHrmSettingsCatalogCompanyId(authorization, tid, companyId));
  // Group rollup catalogs may live under main and/or holding (GAP probe · Settings SoT).
  if (scope.masterTenantPartition) {
    out.add('main');
    out.add('holding');
  }
  return [...out].filter(Boolean);
}

/**
 * EFF active defs = distinct active codes on EMP field allow-list catalogs (Option A SoT).
 * Soft-retire (status≠active) excluded — VAL-EMP-CF-CNS-03 align.
 */
export async function countEffectiveActiveEmpExtensionDefs(
  query: HrmDbQueryFn,
  companyId: string,
  authorization?: string,
  tenantId?: string,
): Promise<number> {
  const tid = (tenantId ?? MASTER_TENANT_ID).trim().toLowerCase() || MASTER_TENANT_ID;
  const companyIds = resolveEmpExtensionCatalogCompanyIds(companyId, authorization, tid);
  try {
    const res = await query<{ c: string }>(
      `
        SELECT COUNT(DISTINCT lower(code))::text AS c
        FROM public.hrm_catalog_extension_items
        WHERE tenant_id = $1
          AND company_id = ANY($2::text[])
          AND lower(catalog_key) = ANY($3::text[])
          AND lower(status) = 'active';
      `,
      [tid, companyIds, EMP_EXTENSION_CATALOG_KEY_LIST],
    );
    return Number(res.rows[0]?.c ?? 0);
  } catch {
    // Cold bootstrap / table absent — treat as empty (AC-01d soft skip).
    return 0;
  }
}

async function loadActiveEmpExtensionCodes(
  query: HrmDbQueryFn,
  companyId: string,
  authorization?: string,
  tenantId?: string,
): Promise<Set<string>> {
  const tid = (tenantId ?? MASTER_TENANT_ID).trim().toLowerCase() || MASTER_TENANT_ID;
  const companyIds = resolveEmpExtensionCatalogCompanyIds(companyId, authorization, tid);
  try {
    const res = await query<{ code: string }>(
      `
        SELECT DISTINCT lower(code) AS code
        FROM public.hrm_catalog_extension_items
        WHERE tenant_id = $1
          AND company_id = ANY($2::text[])
          AND lower(catalog_key) = ANY($3::text[])
          AND lower(status) = 'active';
      `,
      [tid, companyIds, EMP_EXTENSION_CATALOG_KEY_LIST],
    );
    return new Set(res.rows.map((r) => normalizeEmpExtensionFieldCode(r.code)).filter(Boolean));
  } catch (error) {
    if (error instanceof ApiException) throw error;
    return new Set();
  }
}

/**
 * F-EMP-CF-CNS-01 / VAL-EMP-CF-CNS-01 — when EFF active defs >0, reject invent extension codes.
 * Empty EFF → soft skip (AC-PLT-EMP-CUSTOM-01d). Builtin/system keys never KEY.
 * History keys already on the row may retain (soft-retire align CNS-03) — only *new* keys gated.
 * Does NOT register merge tokens (EXT-04c value ≠ definition — must_keep).
 */
export async function assertEmpCustomFieldsAgainstEffectiveCatalog(input: {
  query: HrmDbQueryFn;
  companyId: string;
  customFields: Record<string, unknown> | null | undefined;
  previousCustomFields?: Record<string, unknown> | null;
  authorization?: string;
  tenantId?: string;
}): Promise<void> {
  const inventKeys = collectEmpCustomFieldInventCandidates(
    input.customFields,
    input.previousCustomFields,
  );
  if (inventKeys.length === 0) {
    return;
  }

  const activeCount = await countEffectiveActiveEmpExtensionDefs(
    input.query,
    input.companyId,
    input.authorization,
    input.tenantId,
  );
  if (activeCount === 0) {
    return;
  }

  const activeCodes = await loadActiveEmpExtensionCodes(
    input.query,
    input.companyId,
    input.authorization,
    input.tenantId,
  );
  for (const rawKey of inventKeys) {
    const code = normalizeEmpExtensionFieldCode(rawKey);
    if (!activeCodes.has(code)) {
      throw new ApiException(
        HRM_EMP_CUSTOM_FIELD_KEY,
        `custom_fields key '${rawKey}' is not in Settings EMP extension effective catalog (invent/retired forbidden when EFF ≠ empty)`,
        HttpStatus.UNPROCESSABLE_ENTITY,
        { key: rawKey, code },
      );
    }
  }
}
