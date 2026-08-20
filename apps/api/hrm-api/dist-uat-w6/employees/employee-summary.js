"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS = exports.EMPLOYEE_SALARY_NUM_SQL = void 0;
exports.buildSalaryRangesFromCounts = buildSalaryRangesFromCounts;
exports.buildEmployeeSummaryByCompany = buildEmployeeSummaryByCompany;
const hrm_list_scope_1 = require("../common/hrm-list-scope");
exports.EMPLOYEE_SALARY_NUM_SQL = `
  CASE
    WHEN NULLIF(TRIM(custom_fields->>'salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN (NULLIF(TRIM(custom_fields->>'salary'), ''))::numeric
    WHEN NULLIF(TRIM(custom_fields->>'base_salary'), '') ~ '^[0-9]+(\\.[0-9]+)?$'
      THEN (NULLIF(TRIM(custom_fields->>'base_salary'), ''))::numeric
    ELSE NULL
  END
`;
exports.EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS = [
    { key: 'above_30m', min: 30_000_000, max: null },
    { key: 'range_20_30m', min: 20_000_000, max: 30_000_000 },
    { key: 'range_15_20m', min: 15_000_000, max: 20_000_000 },
    { key: 'below_15m', min: 0, max: 15_000_000 },
];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPERATING_SLUG_SET = new Set(hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS);
function buildSalaryRangesFromCounts(row) {
    const countKeys = {
        above_30m: 'salary_range_above_30m',
        range_20_30m: 'salary_range_20_30m',
        range_15_20m: 'salary_range_15_20m',
        below_15m: 'salary_range_below_15m',
    };
    return exports.EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS.map((def) => ({
        key: def.key,
        min: def.min,
        max: def.max,
        count: Number(row[countKeys[def.key] ?? ''] ?? 0),
    }));
}
function buildEmployeeSummaryByCompany(rawRows, scopeCompanyIds) {
    const merged = new Map();
    const ensureSlug = (slug) => {
        const existing = merged.get(slug);
        if (existing) {
            return existing;
        }
        const empty = {
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
        const slug = (0, hrm_list_scope_1.resolveHrmCompanySlugForId)(scopeId);
        if (!OPERATING_SLUG_SET.has(slug) || UUID_RE.test(slug)) {
            continue;
        }
        ensureSlug(slug);
    }
    for (const row of rawRows) {
        const slug = (0, hrm_list_scope_1.resolveHrmCompanySlugForId)(String(row.company_id ?? '').trim());
        if (!slug || UUID_RE.test(slug) || !OPERATING_SLUG_SET.has(slug)) {
            continue;
        }
        const bucket = ensureSlug(slug);
        bucket.total += Number(row.total ?? 0);
        bucket.active_count += Number(row.active_count ?? 0);
        bucket.inactive_count += Number(row.inactive_count ?? 0);
        bucket.archived_count += Number(row.archived_count ?? 0);
    }
    const orderIndex = new Map(hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS.map((slug, index) => [slug, index]));
    return [...merged.values()].sort((a, b) => {
        const ai = orderIndex.get(a.company_id) ?? 99;
        const bi = orderIndex.get(b.company_id) ?? 99;
        if (ai !== bi) {
            return ai - bi;
        }
        return a.company_id.localeCompare(b.company_id);
    });
}
//# sourceMappingURL=employee-summary.js.map