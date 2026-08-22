import {
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  resolveHrmCompanySlugForId,
} from '../common/hrm-list-scope';
import {
  HRM_GROUP_ROLLUP_TENANT_IDS,
  HRM_LEGACY_OU_TO_TENANT,
} from '../common/hrm-tenant-scope';
import type {
  EmployeeSummaryCompanyRow,
  EmployeeSummarySalaryRange,
  EmployeeSummaryTenantRow,
} from './employee-summary.types';

/** SQL fragment: numeric salary from custom_fields.salary | base_salary. */
export const EMPLOYEE_SALARY_NUM_SQL = `
  CASE
    WHEN NULLIF(TRIM(custom_fields->>'salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN (NULLIF(TRIM(custom_fields->>'salary'), ''))::numeric
    WHEN NULLIF(TRIM(custom_fields->>'base_salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN (NULLIF(TRIM(custom_fields->>'base_salary'), ''))::numeric
    ELSE NULL
  END
`;

export const EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS: Array<{
  key: string;
  min: number;
  max: number | null;
}> = [
  { key: 'above_30m', min: 30_000_000, max: null },
  { key: 'range_20_30m', min: 20_000_000, max: 30_000_000 },
  { key: 'range_15_20m', min: 15_000_000, max: 20_000_000 },
  { key: 'below_15m', min: 0, max: 15_000_000 },
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const OPERATING_SLUG_SET = new Set<string>(HRM_GROUP_MEMBER_COMPANY_SLUGS);

export type EmployeeSummaryByCompanyRawRow = {
  company_id: string;
  total: string | number;
  active_count: string | number;
  inactive_count: string | number;
  archived_count: string | number;
};

export function buildSalaryRangesFromCounts(
  row: Record<string, string | number>,
): EmployeeSummarySalaryRange[] {
  const countKeys: Record<string, string> = {
    above_30m: 'salary_range_above_30m',
    range_20_30m: 'salary_range_20_30m',
    range_15_20m: 'salary_range_15_20m',
    below_15m: 'salary_range_below_15m',
  };
  return EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS.map((def) => ({
    key: def.key,
    min: def.min,
    max: def.max,
    count: Number(row[countKeys[def.key] ?? ''] ?? 0),
  }));
}

/**
 * Merge GROUP BY company_id rows into Plane B operating slugs.
 * Zero-fills every slug in `scopeCompanyIds` (group CEO main → 5 slugs).
 * Never returns XBOS legal-entity UUID as company_id.
 */
export function buildEmployeeSummaryByCompany(
  rawRows: EmployeeSummaryByCompanyRawRow[],
  scopeCompanyIds: string[],
): EmployeeSummaryCompanyRow[] {
  const merged = new Map<string, EmployeeSummaryCompanyRow>();

  const ensureSlug = (slug: string): EmployeeSummaryCompanyRow => {
    const existing = merged.get(slug);
    if (existing) {
      return existing;
    }
    const empty: EmployeeSummaryCompanyRow = {
      company_id: slug,
      total: 0,
      active_count: 0,
      inactive_count: 0,
      archived_count: 0,
    };
    merged.set(slug, empty);
    return empty;
  };

  for (const scopeId of scopeCompanyIds) {
    const slug = resolveHrmCompanySlugForId(scopeId);
    if (!OPERATING_SLUG_SET.has(slug) || UUID_RE.test(slug)) {
      continue;
    }
    ensureSlug(slug);
  }

  for (const row of rawRows) {
    const slug = resolveHrmCompanySlugForId(
      String(row.company_id ?? '').trim(),
    );
    if (!slug || UUID_RE.test(slug) || !OPERATING_SLUG_SET.has(slug)) {
      continue;
    }
    const bucket = ensureSlug(slug);
    bucket.total += Number(row.total ?? 0);
    bucket.active_count += Number(row.active_count ?? 0);
    bucket.inactive_count += Number(row.inactive_count ?? 0);
    bucket.archived_count += Number(row.archived_count ?? 0);
  }

  const orderIndex = new Map(
    HRM_GROUP_MEMBER_COMPANY_SLUGS.map((slug, index) => [slug, index] as const),
  );
  return [...merged.values()].sort((a, b) => {
    const ai =
      orderIndex.get(
        a.company_id as (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number],
      ) ?? 99;
    const bi =
      orderIndex.get(
        b.company_id as (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number],
      ) ?? 99;
    if (ai !== bi) {
      return ai - bi;
    }
    return a.company_id.localeCompare(b.company_id);
  });
}

export type EmployeeSummaryByTenantRawRow = {
  tenant_id: string;
  total: string | number;
  active_count: string | number;
  inactive_count: string | number;
  archived_count: string | number;
};

/** Resolve tenant_id from row — migrated partition or legacy OU slug on xevn. */
export function resolveEmployeeRowTenantId(
  tenantIdRaw: string | null | undefined,
  companyId: string,
): string {
  const tenant = tenantIdRaw?.trim();
  if (tenant) {
    return tenant;
  }
  const slug = resolveHrmCompanySlugForId(companyId.trim());
  if (slug in HRM_LEGACY_OU_TO_TENANT) {
    return HRM_LEGACY_OU_TO_TENANT[slug as keyof typeof HRM_LEGACY_OU_TO_TENANT];
  }
  return 'xevn';
}

export function buildEmployeeSummaryByTenant(
  rawRows: Array<
    EmployeeSummaryByCompanyRawRow & { tenant_id?: string | null }
  >,
  scopeTenantIds: string[],
): EmployeeSummaryTenantRow[] {
  const merged = new Map<string, EmployeeSummaryTenantRow>();
  const ensure = (tenantId: string): EmployeeSummaryTenantRow => {
    const existing = merged.get(tenantId);
    if (existing) return existing;
    const empty: EmployeeSummaryTenantRow = {
      tenant_id: tenantId,
      total: 0,
      active_count: 0,
      inactive_count: 0,
      archived_count: 0,
    };
    merged.set(tenantId, empty);
    return empty;
  };

  for (const id of scopeTenantIds) {
    ensure(id);
  }

  for (const row of rawRows) {
    const tenantId = resolveEmployeeRowTenantId(
      row.tenant_id ?? null,
      String(row.company_id ?? ''),
    );
    const bucket = ensure(tenantId);
    bucket.total += Number(row.total ?? 0);
    bucket.active_count += Number(row.active_count ?? 0);
    bucket.inactive_count += Number(row.inactive_count ?? 0);
    bucket.archived_count += Number(row.archived_count ?? 0);
  }

  const orderIndex = new Map(
    HRM_GROUP_ROLLUP_TENANT_IDS.map((id, index) => [id, index] as const),
  );
  return [...merged.values()].sort((a, b) => {
    const ai = orderIndex.get(a.tenant_id as (typeof HRM_GROUP_ROLLUP_TENANT_IDS)[number]) ?? 99;
    const bi = orderIndex.get(b.tenant_id as (typeof HRM_GROUP_ROLLUP_TENANT_IDS)[number]) ?? 99;
    if (ai !== bi) return ai - bi;
    return a.tenant_id.localeCompare(b.tenant_id);
  });
}
