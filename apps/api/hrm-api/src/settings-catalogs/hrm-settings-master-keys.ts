/**
 * @CODE-MEMORY
 * Screen:     HRM Settings — master catalog key aliases
 * UC:         VAL-SET-MD · FR-HRM-SC-*
 * BR:         Alias → storageKey family resolution
 * Purpose:    Chuẩn hóa catalog key / alias (job_titles, leave_types, …) cho Settings + CatalogSync.
 * WorkItem:   D-HRM-SETTINGS-MD (restored src W1-B-02-EMP)
 * Coded:      2026-07-23
 * Callers:    settings-catalogs.service · catalog-sync.service
 * must_keep:  storageKey canonical; alias try-list; E1B surface keys freeze
 * SOLID:      Pure constants + functions — no Nest
 * LastVerified: leave / settings jest (via import chain)
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP
 * change_mode: ADD
 * What: Restore src from dist (missing tree blocked employees.controller.spec import chain)
 * Why: R-MASTER-KEYS residual from W1-B-01; required for W1-B-02-EMP jest load
 * must_keep: CATALOG_FAMILIES · catalogAliasTryList order storageKey-first
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-MASTER-KEYS
 * change_mode: ADD
 * What: P0 TM R-MASTER-KEYS — confirm/restore src from dist JS/DTS; export parity
 *   HRM_SC_* + normalize/resolve/tryList/is*; CODE-MEMORY + evidence for Settings/
 *   CatalogSync/Decisions import graph.
 * Callers: settings-catalogs.service · catalog-sync.service · decisions.service
 * must_keep: family alias map; HRM_SC_LEAVE_KEY=leave_types; DEC storageKey
 *   hr_decision_types; isPosCatalogKey = pos_titles only; U65 no seed
 * LastVerified: settings-catalogs.service.spec.ts 7/7 · ts-node smoke
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * change_mode: ADD
 * What: CATALOG_FAMILIES + allowance_deduction (storageKey allowance_deduction_types + aliases)
 * must_keep: open catalog · U65 no seed
 */

type CatalogFamilyDef = {
  familyId: string;
  aliases: readonly string[];
  storageKey: string;
};

const CATALOG_FAMILIES: readonly CatalogFamilyDef[] = [
  {
    familyId: 'pos_titles',
    aliases: ['job_titles', 'positions', 'employee_positions'],
    storageKey: 'job_titles',
  },
  {
    familyId: 'org_depts',
    aliases: ['departments', 'department_catalog', 'org_departments'],
    storageKey: 'departments',
  },
  {
    familyId: 'leave',
    aliases: ['leave_types'],
    storageKey: 'leave_types',
  },
  {
    familyId: 'dec_types',
    aliases: ['hr_decision_types', 'decision_types'],
    storageKey: 'hr_decision_types',
  },
  {
    familyId: 'contract',
    aliases: ['contract_types'],
    storageKey: 'contract_types',
  },
  {
    familyId: 'emp_class',
    aliases: ['employment_types', 'employment_type'],
    storageKey: 'employment_types',
  },
  {
    familyId: 'contract_status',
    aliases: ['contract_statuses', 'contract_status'],
    storageKey: 'contract_statuses',
  },
  {
    familyId: 'contract_term_reason',
    aliases: ['contract_termination_reasons', 'termination_reasons'],
    storageKey: 'contract_termination_reasons',
  },
  {
    familyId: 'shift',
    aliases: ['shifts'],
    storageKey: 'shifts',
  },
  {
    familyId: 'grade',
    aliases: ['job_grades', 'grades'],
    storageKey: 'job_grades',
  },
  {
    familyId: 'rec_channel',
    aliases: ['recruitment_channels', 'candidate_sources', 'channels'],
    storageKey: 'recruitment_channels',
  },
  {
    familyId: 'pay_nature',
    aliases: [
      'pay_types',
      'component_types',
      'pay_natures',
      'salary_component_types',
    ],
    storageKey: 'pay_types',
  },
  {
    familyId: 'pay_comp',
    aliases: ['salary_components', 'payroll_components'],
    storageKey: 'salary_components',
  },
  {
    familyId: 'pay_tpl',
    aliases: ['payroll_templates'],
    storageKey: 'payroll_templates',
  },
  {
    familyId: 'insurers',
    aliases: ['insurers', 'insurance_providers', 'bhxh_providers'],
    storageKey: 'insurers',
  },
  {
    familyId: 'insurance_types',
    aliases: ['insurance_types'],
    storageKey: 'insurance_types',
  },
  {
    familyId: 'kpi_library',
    aliases: ['kpi_library', 'kpi_metrics'],
    storageKey: 'kpi_library',
  },
  {
    familyId: 'allowance_deduction',
    aliases: [
      'allowance_deduction_types',
      'allowance_types',
      'deduction_types',
      'phu_cap_khau_tru',
    ],
    storageKey: 'allowance_deduction_types',
  },
];

const FAMILY_BY_ALIAS = new Map<string, CatalogFamilyDef>();
for (const fam of CATALOG_FAMILIES) {
  for (const alias of fam.aliases) {
    FAMILY_BY_ALIAS.set(alias, fam);
  }
}

export type CatalogFamilyResolution = {
  familyId: string;
  aliases: readonly string[];
  storageKey: string;
};

export const HRM_SC_POS_KEYS = [
  'job_titles',
  'departments',
  'department_catalog',
  'org_departments',
  'positions',
  'employee_positions',
] as const;

export const HRM_SC_LEAVE_KEY = 'leave_types' as const;
export const HRM_SC_DEC_KEY = 'decision_types' as const;
export const HRM_SC_DEC_STORAGE_KEY = 'hr_decision_types' as const;
export const HRM_SC_DEC_ALIASES = [
  'hr_decision_types',
  'decision_types',
] as const;
export const HRM_SC_PAY_KEYS = [
  'salary_components',
  'payroll_templates',
  'pay_types',
] as const;

export const HRM_E1B_MASTER_SURFACE_KEYS: readonly string[] = Object.freeze([
  ...new Set(CATALOG_FAMILIES.flatMap((f) => [...f.aliases])),
]);

export type HrmSettingsMasterKey =
  | (typeof HRM_SC_POS_KEYS)[number]
  | typeof HRM_SC_LEAVE_KEY
  | typeof HRM_SC_DEC_KEY
  | typeof HRM_SC_DEC_STORAGE_KEY
  | (typeof HRM_SC_PAY_KEYS)[number]
  | 'contract_types'
  | 'employment_types'
  | 'shifts'
  | 'job_grades'
  | 'recruitment_channels';

export function normalizeMasterCatalogKey(catalogKey: string): string {
  return catalogKey.trim().toLowerCase();
}

/** L1/L2 catalog_key guard — invalid keys must not crash GET /settings-catalogs overview. */
export function isValidCatalogKeyFormat(
  catalogKey: string | null | undefined,
): catalogKey is string {
  if (catalogKey == null || typeof catalogKey !== 'string') return false;
  const normalized = catalogKey.trim().toLowerCase();
  return /^[a-z0-9_][a-z0-9_-]{1,62}$/.test(normalized);
}

export function resolveCatalogFamily(
  catalogKey: string,
): CatalogFamilyResolution {
  const k = normalizeMasterCatalogKey(catalogKey);
  const fam = FAMILY_BY_ALIAS.get(k);
  if (fam) {
    return {
      familyId: fam.familyId,
      aliases: fam.aliases,
      storageKey: fam.storageKey,
    };
  }
  return {
    familyId: `self:${k}`,
    aliases: [k],
    storageKey: k,
  };
}

export function catalogAliasTryList(catalogKey: string): string[] {
  const fam = resolveCatalogFamily(catalogKey);
  const ordered = [
    fam.storageKey,
    ...fam.aliases.filter((a) => a !== fam.storageKey),
  ];
  return [...new Set(ordered)];
}

export function isE1bMasterCatalogKey(catalogKey: string): boolean {
  const k = normalizeMasterCatalogKey(catalogKey);
  return FAMILY_BY_ALIAS.has(k);
}

export function isPosCatalogKey(catalogKey: string): boolean {
  const fam = resolveCatalogFamily(catalogKey);
  return fam.familyId === 'pos_titles';
}

export function isDecCatalogKey(catalogKey: string): boolean {
  return resolveCatalogFamily(catalogKey).familyId === 'dec_types';
}
