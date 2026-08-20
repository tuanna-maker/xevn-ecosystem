"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLegacyKhoiDisplayName = isLegacyKhoiDisplayName;
exports.resolveCompanyDisplayNameVi = resolveCompanyDisplayNameVi;
exports.ensureCompanySlugMapLegalDisplayNames = ensureCompanySlugMapLegalDisplayNames;
exports.loadCompanyDisplayNameBySlug = loadCompanyDisplayNameBySlug;
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_operating_unit_registry_1 = require("./hrm-operating-unit-registry");
function isLegacyKhoiDisplayName(name) {
    const trimmed = name?.trim() ?? '';
    if (!trimmed)
        return false;
    if (hrm_operating_unit_registry_1.HRM_LEGACY_KHOI_DISPLAY_NAMES.has(trimmed))
        return true;
    return /^Khối\s+/u.test(trimmed);
}
function resolveCompanyDisplayNameVi(companySlug, fromDb) {
    const slug = companySlug?.trim().toLowerCase() ?? '';
    if (!slug)
        return null;
    const dbName = fromDb?.trim() ?? '';
    if (dbName && !isLegacyKhoiDisplayName(dbName)) {
        return dbName;
    }
    const key = slug;
    const fromRegistry = hrm_operating_unit_registry_1.HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[key];
    return fromRegistry?.trim() || null;
}
async function ensureCompanySlugMapLegalDisplayNames(query) {
    await query(`
    ALTER TABLE public.company_slug_map
    ADD COLUMN IF NOT EXISTS display_name TEXT;
  `);
    for (const row of (0, hrm_operating_unit_registry_1.buildOperatingUnitSeedRows)()) {
        await query(`INSERT INTO public.company_slug_map (tenant_id, company_slug, company_uuid, display_name, updated_at)
       VALUES ($1, $2, $3::uuid, $4, NOW())
       ON CONFLICT (tenant_id, company_slug) DO UPDATE SET
         display_name = CASE
           WHEN NULLIF(TRIM(company_slug_map.display_name), '') IS NULL THEN EXCLUDED.display_name
           WHEN company_slug_map.display_name ~ '^Khối[[:space:]]' THEN EXCLUDED.display_name
           ELSE company_slug_map.display_name
         END,
         company_uuid = EXCLUDED.company_uuid,
         updated_at = NOW();`, [row.tenant_id, row.company_slug, row.company_uuid, row.display_name]);
    }
}
async function loadCompanyDisplayNameBySlug(query, slugs) {
    await ensureCompanySlugMapLegalDisplayNames(query);
    const wanted = slugs && slugs.length > 0
        ? [...new Set(slugs.map((s) => s.trim().toLowerCase()).filter(Boolean))]
        : [...hrm_list_scope_1.HRM_GROUP_MEMBER_COMPANY_SLUGS];
    if (!wanted.length)
        return new Map();
    const res = await query(`SELECT company_slug, display_name
     FROM public.company_slug_map
     WHERE tenant_id = $1 AND company_slug = ANY($2::text[])`, [hrm_list_scope_1.MASTER_TENANT_ID, wanted]);
    const map = new Map();
    for (const row of res.rows) {
        const slug = String(row.company_slug ?? '')
            .trim()
            .toLowerCase();
        if (!slug)
            continue;
        const resolved = resolveCompanyDisplayNameVi(slug, row.display_name);
        if (resolved)
            map.set(slug, resolved);
    }
    for (const slug of wanted) {
        if (!map.has(slug)) {
            const resolved = resolveCompanyDisplayNameVi(slug, null);
            if (resolved)
                map.set(slug, resolved);
        }
    }
    return map;
}
//# sourceMappingURL=hrm-company-display-name.js.map