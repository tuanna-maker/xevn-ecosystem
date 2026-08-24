import { getPortalAccessToken, waitForPortalAccessToken } from '@/lib/portalAuthBridge';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { ApiClientError } from '@/lib/apiError';
import { safeRandomUuid } from '@/lib/safeRandomUuid';

/**
 * @CODE-MEMORY
 * Screen:     HRM embed → Công ty (CompanyManagement) — danh sách + chi tiết tập đoàn/thành viên
 * UC:         UC-HRM-CO-01 / FR-HRM-CO-IND-01 · UC-HRM-ORG-COMPANY · UF-XBOS-03 (hồ sơ pháp nhân)
 * BR:         BR-CO-BIND-01 (SoT XBOS legal, không hard-null)
 * SRS:        docs/qa/evidence/fid-p0-ba-data-01-20260722.md §2 · UX_VI_DATE_NUMBER_FORMAT_AC.md
 * TechSpec:   GET /tenant-scope/group-member-units (nav) + GET /org-foundation/legal-entities (hồ sơ)
 * Purpose:    Map đơn vị tập đoàn/thành viên sang hàng Company HRM; MST/email/phone/ngày thành lập
 *             lấy từ xbos_legal_entity (+ payload.companyForm), không ép null.
 * WorkItem:   FID-P0-FE-CO-BIND-01
 * Coded:      2026-07-22
 * Callers:    CompanyManagement.fetchCompanies (portal embed)
 * Callees:    /api/xbos/tenant-scope/group-member-units · /api/xbos/org-foundation/legal-entities
 * FEActions:  load list → enrich holding (company_id=holding) + members (payload / flat legal)
 * must_keep:  id holding = xbos-group-holding-root (OU filter / CC nav); null SoT → «—» honest; cấm seed
 * SOLID:      Mapper thuần tách fetch; enrichment tách SoT pháp nhân khỏi tenant-scope mỏng
 * LastVerified: docs/qa/evidence/fid-p0-fe-co-bind-01-20260722.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FID-P0-FE-CO-BIND-01
 * change_mode: FIX
 * What: Bỏ hard-null tax/email/phone/founded; bind legal entity + companyForm; enrich holding qua API
 * Why: H1 — group-member-units holding chỉ có name; mapper ép null → UI «—» dù SoT có data
 * must_keep: Không đổi synthetic holding id; không toast-only claim persist; OU filter giữ nguyên
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-CO-EMP-COUNT-FE-01
 * change_mode: FIX
 * What: Mapper vẫn để employee_count=null (XBOS không có headcount); enrich workforce ở CompanyManagement
 *       via hrmCompanyEmployeeCount (slug, không LE UUID).
 * Why: `|| 0` trên null → card/table 0; dashboard dùng employees/summary đúng slug
 * must_keep: CO-BIND tax/founded/MST; GROUP_HOLDING_ROOT_ID; không mutate JWT companyId
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-CO-INDUSTRY-FE-01 (alias D-HRM-CO-01-INDUSTRY-FE-01)
 * change_mode: FIX
 * What: Ngành nghề = business_lines / companyForm.industry (VI hoặc catalog key→industries.*);
 *       cấm map entity_type (holding/subsidiary) vào industry.
 * Why: Cột «Ngành nghề» hiện raw `subsidiary` — SoT sai field (entity_type ≠ ngành)
 * must_keep: CO-EMP-COUNT enrich; CO-BIND tax/founded/MST; OU filter / GROUP_HOLDING_ROOT_ID
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: D-HRM-CO-01-INDUSTRY-FE-01
 * change_mode: FIX (verify + matrix promote lane)
 * What: resolveIndustryDisplay · extractIndustryFromLegalSources · INDUSTRY_CATALOG_VI;
 *       mapGroupMemberUnitsToHrmCompanies + legal enrich — không entity_type.
 * Why: UC-HRM-CO-01 planned · AC-CO-IND-01..04 · VAL-CO-IND-01
 * must_keep: employee_count null trong mapper; enrichHrmCompaniesWithWorkforceCounts không đổi
 * LastVerified: docs/qa/evidence/d-hrm-co-01-industry-fe-01.md
 */

export const GROUP_HOLDING_ROOT_ID = 'xbos-group-holding-root';
const MASTER_TENANT_ID = 'xevn';
const HOLDING_COMPANY_ID = 'holding';
const OPERATING_MAIN_COMPANY_ID = 'main';

export type GroupMemberUnitRow = {
  tenant_id: string;
  tenant_name: string;
  tenant_short_name: string;
  id: string;
  code: string;
  name: string;
  entity_type: string;
  payload: Record<string, unknown> | null;
  tax_code?: string | null;
  established_at?: string | null;
  address?: string | null;
  /** XBOS legal-entity SoT for «Ngành nghề» — never confuse with entity_type. */
  business_lines?: string | null;
};

export type GroupMemberUnitsPayload = {
  holding: { tenant_id: string; name: string; short_name: string } | null;
  members: GroupMemberUnitRow[];
};

export type HrmCompanyRow = {
  id: string;
  name: string;
  code: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_code: string | null;
  website: string | null;
  industry: string | null;
  employee_count: number | null;
  founded_date: string | null;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  /** Tenant partition (tenant-only scope). */
  tenant_id?: string | null;
};

/** Org-foundation legal entity row (subset used for company profile bind). */
export type LegalEntityProfileRow = {
  id: string;
  tenant_id: string;
  company_id?: string;
  code?: string;
  name?: string;
  entity_type?: string | null;
  tax_code?: string | null;
  established_at?: string | null;
  address?: string | null;
  business_lines?: string | null;
  payload?: Record<string, unknown> | null;
};

/** Legal / org entity_type keys — must never appear in industry column. */
const ENTITY_TYPE_AS_INDUSTRY_BLOCKLIST = new Set([
  'holding',
  'subsidiary',
  'parent',
  'member',
  'branch',
]);

/**
 * Catalog keys aligned with CompanyManagement Select + i18n `industries.*` (vi).
 * Mapper resolves keys → VI so table/badge show human text without react-i18n.
 */
export const INDUSTRY_CATALOG_VI: Readonly<Record<string, string>> = {
  it: 'Công nghệ thông tin',
  manufacturing: 'Sản xuất',
  trading: 'Thương mại',
  services: 'Dịch vụ',
  finance: 'Tài chính - Ngân hàng',
  realestate: 'Bất động sản',
  education: 'Giáo dục',
  healthcare: 'Y tế',
  tourism: 'Du lịch - Khách sạn',
  logistics: 'Vận tải - Logistics',
  construction: 'Xây dựng',
  other: 'Khác',
};

/**
 * Resolve raw industry / business_lines → display string for «Ngành nghề».
 * - empty → null (UI «—» / «-»)
 * - entity_type keys (holding/subsidiary…) → null (never show as industry)
 * - catalog key (tourism, logistics…) → VI label matching `industries.*`
 * - otherwise keep human-readable text as-is
 */
export function resolveIndustryDisplay(raw: unknown): string | null {
  const s = nonempty(raw);
  if (!s) return null;
  const lower = s.toLowerCase();
  if (ENTITY_TYPE_AS_INDUSTRY_BLOCKLIST.has(lower)) return null;
  const catalog = INDUSTRY_CATALOG_VI[lower];
  if (catalog) return catalog;
  return s;
}

/**
 * Prefer XBOS `business_lines`, then companyForm industry / businessLines fields.
 * Never reads entity_type.
 */
export function extractIndustryFromLegalSources(opts: {
  business_lines?: string | null;
  payload?: Record<string, unknown> | null | undefined;
}): string | null {
  const form = companyFormFromPayload(opts.payload);
  return (
    resolveIndustryDisplay(opts.business_lines) ??
    resolveIndustryDisplay(form.industry) ??
    resolveIndustryDisplay(form.businessLines) ??
    resolveIndustryDisplay(form.business_lines) ??
    null
  );
}

function nonempty(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function asIsoDateOnly(value: unknown): string | null {
  const raw = nonempty(value);
  if (!raw) return null;
  const iso = raw.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : null;
}

function companyFormFromPayload(
  payload: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!payload || typeof payload !== 'object') return {};
  const nested = payload.companyForm;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return {};
}

/**
 * SoT hồ sơ pháp nhân → field Company UI.
 * tax_code / established_at từ cột legal; email/phone/website từ payload.companyForm;
 * industry từ business_lines (không dùng entity_type).
 */
export function mapLegalEntityProfileToCompanyFields(
  row: LegalEntityProfileRow | null | undefined,
): Pick<
  HrmCompanyRow,
  'tax_code' | 'email' | 'phone' | 'founded_date' | 'address' | 'website' | 'industry'
> {
  if (!row) {
    return {
      tax_code: null,
      email: null,
      phone: null,
      founded_date: null,
      address: null,
      website: null,
      industry: null,
    };
  }
  const form = companyFormFromPayload(row.payload);
  return {
    tax_code: nonempty(row.tax_code) ?? nonempty(form.taxCode),
    email: nonempty(form.companyEmail),
    phone: nonempty(form.hotline) ?? nonempty(form.legalRepPhone),
    founded_date:
      asIsoDateOnly(row.established_at) ?? asIsoDateOnly(form.firstIssueDate),
    address: nonempty(row.address) ?? nonempty(form.headOfficeAddress),
    website: nonempty(form.website),
    industry: extractIndustryFromLegalSources({
      business_lines: row.business_lines,
      payload: row.payload,
    }),
  };
}

/** Map payload.companyForm (member list) when flat legal row chưa enrich. */
export function mapCompanyFormPayloadToCompanyFields(
  payload: Record<string, unknown> | null | undefined,
): Pick<
  HrmCompanyRow,
  'tax_code' | 'email' | 'phone' | 'founded_date' | 'address' | 'website' | 'industry'
> {
  const form = companyFormFromPayload(payload);
  return {
    tax_code: nonempty(form.taxCode),
    email: nonempty(form.companyEmail),
    phone: nonempty(form.hotline) ?? nonempty(form.legalRepPhone),
    founded_date: asIsoDateOnly(form.firstIssueDate),
    address: nonempty(form.headOfficeAddress),
    website: nonempty(form.website),
    industry: extractIndustryFromLegalSources({ payload }),
  };
}

export function pickHoldingLegalEntity(
  entities: LegalEntityProfileRow[],
  holdingTenantId: string,
): LegalEntityProfileRow | null {
  const tid = holdingTenantId.trim().toLowerCase();
  const byTypeAndTenant = entities.find(
    (row) =>
      String(row.entity_type ?? '').toLowerCase() === 'holding' &&
      String(row.tenant_id ?? '').toLowerCase() === tid,
  );
  if (byTypeAndTenant) return byTypeAndTenant;
  const byType = entities.find(
    (row) => String(row.entity_type ?? '').toLowerCase() === 'holding',
  );
  if (byType) return byType;
  return entities[0] ?? null;
}

export function resolveCurrentTenantId(): string {
  if (typeof window === 'undefined') return '';

  // 1. Primary: if embedded in portal, portal passes ?tenantId=... in iframe URL
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlTenant = searchParams.get('tenantId');
    if (urlTenant) return urlTenant.trim();
  } catch {}

  // 2. Secondary: check generic storage key first
  let val = localStorage.getItem('current_tenant_id') || sessionStorage.getItem('current_tenant_id');
  if (val) return val.trim();

  // 3. Dynamic search: look for any module's tenant key (e.g., hrm_current_tenant_id, logistic_current_tenant_id)
  // This ensures we don't hardcode future module names.
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('_current_tenant_id')) {
        const dynamicVal = localStorage.getItem(key);
        if (dynamicVal) return dynamicVal.trim();
      }
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.endsWith('_current_tenant_id')) {
        const dynamicVal = sessionStorage.getItem(key);
        if (dynamicVal) return dynamicVal.trim();
      }
    }
  } catch {}

  // 4. Fallback: Parse from pathname if structured as /:tenantId/module/...
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts.length > 0 && !['login', 'hr', 'command-center', 'settings'].includes(pathParts[0])) {
    return pathParts[0].trim();
  }

  return '';
}

async function xbosHeaders(companyId: string = OPERATING_MAIN_COMPANY_ID): Promise<Record<string, string>> {
  const tenantFromStorage = resolveCurrentTenantId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': safeRandomUuid(),
    'x-tenant-id': tenantFromStorage || MASTER_TENANT_ID,
    'x-company-id': companyId,
  };
  let token = getPortalAccessToken();
  if (!token && typeof window !== 'undefined' && getHrmPortalMode(window.location.search)) {
    token = await waitForPortalAccessToken(5000);
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers['x-access-token'] = token;
    headers['x-portal-access-token'] = token;
  }
  return headers;
}

export function mapGroupMemberUnitsToHrmCompanies(data: GroupMemberUnitsPayload): HrmCompanyRow[] {
  const now = new Date().toISOString();
  const list: HrmCompanyRow[] = [];
  if (data.holding) {
    list.push({
      id: GROUP_HOLDING_ROOT_ID,
      tenant_id: data.holding.tenant_id,
      name: data.holding.name,
      code: data.holding.short_name?.trim() || data.holding.tenant_id,
      logo_url: null,
      address: null,
      phone: null,
      email: null,
      tax_code: null,
      website: null,
      industry: null,
      employee_count: null,
      founded_date: null,
      description: null,
      status: 'active',
      created_at: now,
      updated_at: now,
    });
  }
  for (const member of data.members) {
    const shortFromPayload =
      member.payload && typeof member.payload.shortName === 'string'
        ? (member.payload.shortName as string)
        : undefined;
    const fromForm = mapCompanyFormPayloadToCompanyFields(member.payload);
    list.push({
      id: member.id,
      tenant_id: member.tenant_id,
      name: member.name,
      code: member.code,
      logo_url: null,
      address: nonempty(member.address) ?? fromForm.address,
      phone: fromForm.phone,
      email: fromForm.email,
      tax_code: nonempty(member.tax_code) ?? fromForm.tax_code,
      website: fromForm.website,
      industry:
        extractIndustryFromLegalSources({
          business_lines: member.business_lines,
          payload: member.payload,
        }) ?? fromForm.industry,
      employee_count: null,
      founded_date: asIsoDateOnly(member.established_at) ?? fromForm.founded_date,
      description: shortFromPayload || member.tenant_short_name || null,
      status: 'active',
      created_at: now,
      updated_at: now,
    });
  }
  return list;
}

/** Merge SoT legal profile vào hàng holding + members (match id / tenant). */
export function enrichHrmCompaniesWithLegalProfiles(
  companies: HrmCompanyRow[],
  opts: {
    holdingTenantId?: string | null;
    holdingEntities?: LegalEntityProfileRow[];
    memberEntities?: LegalEntityProfileRow[];
  },
): HrmCompanyRow[] {
  const holdingEntity = pickHoldingLegalEntity(
    opts.holdingEntities ?? [],
    opts.holdingTenantId ?? MASTER_TENANT_ID,
  );
  const holdingFields = mapLegalEntityProfileToCompanyFields(holdingEntity);
  const membersById = new Map(
    (opts.memberEntities ?? []).map((row) => [String(row.id), row] as const),
  );
  const membersByTenant = new Map<string, LegalEntityProfileRow>();
  for (const row of opts.memberEntities ?? []) {
    const tid = String(row.tenant_id ?? '').toLowerCase();
    if (tid && !membersByTenant.has(tid)) {
      membersByTenant.set(tid, row);
    }
  }

  return companies.map((company) => {
    if (company.id === GROUP_HOLDING_ROOT_ID) {
      return {
        ...company,
        tax_code: holdingFields.tax_code,
        email: holdingFields.email,
        phone: holdingFields.phone,
        founded_date: holdingFields.founded_date,
        address: holdingFields.address ?? company.address,
        website: holdingFields.website ?? company.website,
        industry: holdingFields.industry ?? company.industry,
        name: nonempty(holdingEntity?.name) ?? company.name,
      };
    }
    const byId = membersById.get(company.id);
    const byTenant =
      byId ??
      (company.code
        ? (opts.memberEntities ?? []).find(
            (row) =>
              String(row.code ?? '').toLowerCase() === String(company.code).toLowerCase(),
          )
        : undefined);
    if (!byId && !byTenant) {
      return company;
    }
    const fields = mapLegalEntityProfileToCompanyFields(byId ?? byTenant);
    return {
      ...company,
      tax_code: fields.tax_code ?? company.tax_code,
      email: fields.email ?? company.email,
      phone: fields.phone ?? company.phone,
      founded_date: fields.founded_date ?? company.founded_date,
      address: fields.address ?? company.address,
      website: fields.website ?? company.website,
      industry: fields.industry ?? company.industry,
    };
  });
}

async function fetchLegalEntitiesForHrm(
  companyId: string,
): Promise<LegalEntityProfileRow[]> {
  const res = await fetch('/api/xbos/org-foundation/legal-entities', {
    method: 'GET',
    headers: await xbosHeaders(companyId),
  });
  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: { items?: LegalEntityProfileRow[] };
    message?: string;
  } | null;
  if (!res.ok || !body?.success) {
    throw new ApiClientError({
      status: res.status,
      code: 'XBOS-ORG-LEGAL',
      message: body?.message ?? 'Không tải được hồ sơ pháp nhân',
    });
  }
/** Group CEO + member CEO — unified company units (legal profile SoT). */
export async function fetchCompanyUnitsForHrm(): Promise<HrmCompanyRow[]> {
  const res = await fetch('/api/xbos/tenant-scope/company-units', {
    method: 'GET',
    headers: await xbosHeaders(OPERATING_MAIN_COMPANY_ID),
  });
  const body = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: GroupMemberUnitsPayload;
    message?: string;
  } | null;
  if (!res.ok || !body?.success || !body.data) {
    throw new ApiClientError({
      status: res.status,
      code: 'XBOS-TENANT-SCOPE',
      message: body?.message ?? 'Không tải được danh sách công ty',
    });
  }

  const base = mapGroupMemberUnitsToHrmCompanies(body.data);
  let holdingEntities: LegalEntityProfileRow[] = [];
  let memberEntities: LegalEntityProfileRow[] = [];

  const currentTenant = resolveCurrentTenantId();

  // Prevent 409 Conflict: Only master tenant has access to holding legal-entities
  if (currentTenant === MASTER_TENANT_ID || !currentTenant) {
    try {
      holdingEntities = await fetchLegalEntitiesForHrm(HOLDING_COMPANY_ID);
    } catch (err) {
      console.warn('[tenantScopeApi] holding legal-entities enrich skipped', err);
    }
  }
  
  try {
    memberEntities = await fetchLegalEntitiesForHrm(OPERATING_MAIN_COMPANY_ID);
  } catch (err) {
    console.warn('[tenantScopeApi] member legal-entities enrich skipped', err);
  }

  return enrichHrmCompaniesWithLegalProfiles(base, {
    holdingTenantId: body.data.holding?.tenant_id ?? MASTER_TENANT_ID,
    holdingEntities,
    memberEntities,
  });
}

/** @deprecated Prefer fetchCompanyUnitsForHrm — member CEO receives 403. */
export async function fetchGroupMemberUnitsForHrm(): Promise<HrmCompanyRow[]> {
  return fetchCompanyUnitsForHrm();
}
