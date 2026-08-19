/**

 * @CODE-MEMORY

 * Screen:     /contracts — create wizard API helpers (context + overlay + preview)

 * UC:         FR-UC-BP-CORE-09 · SA-01 F-CORE-CTR-CREATE-CTX/OVERLAY/PREV

 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-02

 * must_keep:  RETAIN preview/pack paths · cấm syncContractTemplateClauseBind on wizard

 *

 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-CTR-CREATE-REDESIGN-FE-02

 * What: LIVE GET contract-create-context · PUT print-overlay default-on · preview clause_ids

 * Why: BE-01 READY — bỏ VITE_CTR_PRINT_OVERLAY gate · U65 FE path

 */



import {

  createCompensationPackage,

  createEmployeeContract,

  getActiveCompensationPackage,

  getEmployeeById,

  type HrmCompensationPackageRecord,

  type HrmContractPreviewResult,

  type HrmEmployeeRecord,

} from '@/integrations/hrmApi';

import { ApiClientError, toErrorMessage } from '@/lib/apiError';

import { buildContractPrintMutateRequest } from '@/lib/contractPrintRequest';

import { coerceHrmListCompanyId, normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';

import { getHrmPortalMode } from '@/lib/hrmPortalMode';

import {

  getPortalAccessToken,

  getPortalSessionUser,

  waitForPortalAccessToken,

} from '@/lib/portalAuthBridge';

import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';

import { safeRandomUuid } from '@/lib/safeRandomUuid';



const HRM_API_ORIGIN = (import.meta.env.VITE_HRM_API_ORIGIN ?? '').replace(/\/$/, '');

const SERVICE_JWT_TOKEN = import.meta.env.VITE_SERVICE_JWT_TOKEN;

const INTERNAL_API_KEY = import.meta.env.DEV ? import.meta.env.VITE_INTERNAL_API_KEY : undefined;



type HrmEnvelope<T> = {

  success: boolean;

  code: string;

  message: string;

  data?: T;

  details?: unknown;

};



export type ContractCreateAllowanceLine = {

  code: string;

  label_vi: string;

  amount_vnd: number;

};



export type ContractCreateContextSnapshot = {

  employee_party_b: {

    full_name: string;

    id_number: string;

    phone: string;

    dob_display: string;

    job_title: string;

  };

  compensation_snapshot: {

    base_salary_vnd: number | null;

    insurance_salary_vnd: number | null;

    salary_ratio_percent: number | null;

    allowances: ContractCreateAllowanceLine[];

  };

  employer_party_a: {

    legal_name: string;

    unit_label: string;

  };

  suggested_signatory: {

    signer_name: string;

    signer_position: string;

  };

  source: 'api' | 'mock' | 'partial';

  cb_masked?: boolean;

};



/** BE-01 LIVE — overlay persist không còn phụ thuộc env gate (opt-out: VITE_CTR_PRINT_OVERLAY=0). */

export const CONTRACT_PRINT_OVERLAY_LIVE =

  import.meta.env.VITE_CTR_PRINT_OVERLAY !== '0' &&

  import.meta.env.VITE_CTR_PRINT_OVERLAY !== 'false';



type ApiCreateContextBundle = {

  employee_party_b?: {

    full_name?: string | null;

    employee_code?: string | null;

    id_number?: string | null;

    phone?: string | null;

    dob_display?: string | null;

    email?: string | null;

    residence_address?: string | null;

  };

  compensation_snapshot?: {

    base_salary_vnd?: number | null;

    insurance_salary_vnd?: number | null;

    salary_ratio_percent?: number | null;

    allowances?: Array<{

      code?: string;

      label_vi?: string;

      amount_vnd?: number | null;

    }>;

    cb_masked?: boolean;

  };

  employer_party_a?: {

    legal_name?: string | null;

    unit_label?: string | null;

  };

  suggested_signatory?: {

    signer_name?: string | null;

    signer_position?: string | null;

    signer_position_key?: string | null;

  } | null;

  cb_masked?: boolean;

};



async function hrmJsonHeaders(): Promise<Record<string, string>> {

  const baseHeaders: Record<string, string> = {

    Accept: 'application/json',

    'Content-Type': 'application/json',

    'x-request-id': safeRandomUuid(),

  };

  const portalMode =

    typeof window !== 'undefined' && getHrmPortalMode(window.location.search);

  let portalToken = getPortalAccessToken();

  if (!portalToken && portalMode) {

    portalToken = await waitForPortalAccessToken(5000);

  }

  if (portalToken) {

    baseHeaders.Authorization = `Bearer ${portalToken}`;

    baseHeaders['x-access-token'] = portalToken;

    baseHeaders['x-portal-access-token'] = portalToken;

    const portalUser = getPortalSessionUser();

    if (portalUser?.userId) {

      baseHeaders['x-user-id'] = portalUser.userId;

    }

  } else if (SERVICE_JWT_TOKEN) {

    baseHeaders.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;

  } else if (INTERNAL_API_KEY) {

    baseHeaders['x-internal-api-key'] = INTERNAL_API_KEY;

  }

  const storedCompany =

    typeof window !== 'undefined'

      ? localStorage.getItem('hrm_current_company_id') ||

        sessionStorage.getItem('hrm_current_company_id')

      : null;

  const scopeHint = storedCompany?.trim() ? coerceHrmListCompanyId(storedCompany) : storedCompany;

  const scope =

    typeof window !== 'undefined'

      ? resolveHrmSpreadsheetScope(scopeHint, window.location.search)

      : undefined;

  if (scope) {

    baseHeaders['x-tenant-id'] = scope.tenantId;

    baseHeaders['x-company-id'] = scope.companyId;

  }

  return baseHeaders;

}



async function parseHrmEnvelope<T>(res: Response): Promise<T> {

  let body: HrmEnvelope<T> | undefined;

  try {

    body = (await res.json()) as HrmEnvelope<T>;

  } catch {

    /* non-json */

  }

  if (!res.ok) {

    throw new ApiClientError({

      status: res.status,

      code: body?.code,

      message: body?.message ?? `Không xử lý được yêu cầu HRM (${res.status})`,

      details: body?.details,

    });

  }

  if (!body?.success || body.data === undefined) {

    throw new ApiClientError({

      status: res.status,

      code: body?.code ?? 'HRM-NO-DATA',

      message: body?.message ?? 'API trả về không có dữ liệu',

      details: body?.details,

    });

  }

  return body.data;

}



function mapApiContextToSnapshot(

  raw: ApiCreateContextBundle,

  employeeJobTitle?: string,

): ContractCreateContextSnapshot {

  const partyB = raw.employee_party_b ?? {};

  const comp = raw.compensation_snapshot ?? {};

  const allowances: ContractCreateAllowanceLine[] = (comp.allowances ?? [])

    .map((line) => ({

      code: String(line.code ?? '').trim() || 'allowance',

      label_vi: String(line.label_vi ?? '').trim() || 'Phụ cấp',

      amount_vnd: line.amount_vnd ?? 0,

    }))

    .filter((l) => l.code.length > 0);



  const signatory = raw.suggested_signatory;



  return {

    employee_party_b: {

      full_name: partyB.full_name?.trim() || '—',

      id_number: partyB.id_number?.trim() || '—',

      phone: partyB.phone?.trim() || '—',

      dob_display: partyB.dob_display?.trim() || '—',

      job_title: employeeJobTitle?.trim() || '—',

    },

    compensation_snapshot: {

      base_salary_vnd: comp.base_salary_vnd ?? null,

      insurance_salary_vnd: comp.insurance_salary_vnd ?? null,

      salary_ratio_percent: comp.salary_ratio_percent ?? null,

      allowances,

    },

    employer_party_a: {

      legal_name: raw.employer_party_a?.legal_name?.trim() || '—',

      unit_label: raw.employer_party_a?.unit_label?.trim() || '—',

    },

    suggested_signatory: {

      signer_name: signatory?.signer_name?.trim() ?? '',

      signer_position: signatory?.signer_position?.trim() ?? '',

    },

    cb_masked: raw.cb_masked ?? comp.cb_masked,

    source: 'api',

  };

}



function formatVnd(amount: number | null | undefined): number | null {

  if (amount == null || !Number.isFinite(amount)) return null;

  return amount;

}



function mapPackageToSnapshot(pkg: HrmCompensationPackageRecord | null): ContractCreateContextSnapshot['compensation_snapshot'] {

  if (!pkg) {

    return {

      base_salary_vnd: null,

      insurance_salary_vnd: null,

      salary_ratio_percent: null,

      allowances: [],

    };

  }

  const baseLine = pkg.lines.find((l) => l.line_type === 'base');

  const probationLine = pkg.lines.find((l) => l.line_type === 'probation');

  const baseAmount = baseLine?.amount ?? probationLine?.amount ?? null;

  const allowances: ContractCreateAllowanceLine[] = pkg.lines

    .filter((l) => l.line_type === 'allowance')

    .map((l) => ({

      code: l.allowance_code ?? l.component_code ?? l.id,

      label_vi: l.note?.trim() || l.allowance_code || l.component_code || 'Phụ cấp',

      amount_vnd: l.amount,

    }));



  return {

    base_salary_vnd: formatVnd(baseAmount),

    insurance_salary_vnd: formatVnd(baseAmount),

    salary_ratio_percent: null,

    allowances,

  };

}



function mapEmployeePartyB(emp: HrmEmployeeRecord | null): ContractCreateContextSnapshot['employee_party_b'] {

  const cf = (emp?.custom_fields ?? {}) as Record<string, string | undefined>;

  return {

    full_name: emp?.full_name?.trim() || '—',

    id_number: cf.id_number?.trim() || cf.cccd?.trim() || '—',

    phone: cf.phone?.trim() || cf.mobile?.trim() || '—',

    dob_display: cf.dob?.trim() || '—',

    job_title: emp?.job_title_key?.trim() || '—',

  };

}



async function fetchContractCreateContext(

  companyId: string,

  employeeId: string,

): Promise<ContractCreateContextSnapshot> {

  const search = new URLSearchParams();

  search.set('company_id', normalizeHrmApiListCompanyId(companyId));

  const url = `${HRM_API_ORIGIN}/api/hrm/contracts-insurance/employees/${encodeURIComponent(

    employeeId,

  )}/contract-create-context?${search.toString()}`;

  const res = await fetch(url, {

    method: 'GET',

    headers: await hrmJsonHeaders(),

  });

  const data = await parseHrmEnvelope<ApiCreateContextBundle>(res);

  return mapApiContextToSnapshot(data);

}



export async function loadContractCreateContext(

  companyId: string,

  employeeId: string,

  companyIdsForEmployee: string[],

): Promise<ContractCreateContextSnapshot> {

  try {

    const emp = await getEmployeeById(employeeId, companyIdsForEmployee);

    const fromApi = await fetchContractCreateContext(companyId, employeeId);

    return {

      ...fromApi,

      employee_party_b: {

        ...fromApi.employee_party_b,

        job_title:

          fromApi.employee_party_b.job_title !== '—'

            ? fromApi.employee_party_b.job_title

            : emp?.job_title_key?.trim() || '—',

      },

    };

  } catch {

    /* fall through to partial bundle */

  }



  const emp = await getEmployeeById(employeeId, companyIdsForEmployee);

  const pkg = await getActiveCompensationPackage({

    company_id: companyId,

    employee_id: employeeId,

  });



  return {

    employee_party_b: mapEmployeePartyB(emp),

    compensation_snapshot: mapPackageToSnapshot(pkg),

    employer_party_a: {

      legal_name: '—',

      unit_label: companyId,

    },

    suggested_signatory: {

      signer_name: '',

      signer_position: '',

    },

    source: pkg || emp ? 'partial' : 'mock',

  };

}



export type PutPrintOverlayResult = { ok: true } | { ok: false; blocked: true; reason: string };



export async function putContractPrintOverlay(

  contractId: string,

  companyId: string,

  clauseIds: string[],

): Promise<PutPrintOverlayResult> {

  if (!CONTRACT_PRINT_OVERLAY_LIVE) {

    return {

      ok: false,

      blocked: true,

      reason: 'PUT print-overlay tắt bởi VITE_CTR_PRINT_OVERLAY=0.',

    };

  }

  if (!contractId?.trim()) {

    return {

      ok: false,

      blocked: true,

      reason: 'Chưa có mã hợp đồng — lưu bước 1 trước khi đồng bộ overlay.',

    };

  }

  const search = new URLSearchParams();

  search.set('company_id', normalizeHrmApiListCompanyId(companyId));

  const url = `${HRM_API_ORIGIN}/api/hrm/contracts-insurance/contracts/${encodeURIComponent(

    contractId,

  )}/print-overlay?${search.toString()}`;

  const res = await fetch(url, {

    method: 'PUT',

    headers: await hrmJsonHeaders(),

    body: JSON.stringify({ clause_ids: clauseIds }),

  });

  if (!res.ok) {

    const err = await res.json().catch(() => ({}));

    throw new ApiClientError({

      status: res.status,

      code: (err as { code?: string }).code,

      message: (err as { message?: string }).message ?? 'Không lưu overlay điều khoản',

      details: (err as { details?: unknown }).details,

    });

  }

  return { ok: true };

}



export type ContractCreatePreviewInput = {

  company_id: string;

  pack_code?: string;

  template_id?: string;

  template_code?: string;

  field_overrides?: Record<string, unknown>;

  clause_ids?: string[];

};



/** Preview with optional ephemeral clause_ids (F-CORE-CTR-PREV-01 expand). */

export async function previewContractCreatePrint(

  contractId: string,

  input: ContractCreatePreviewInput,

): Promise<HrmContractPreviewResult> {

  const { companyIdQuery, body } = buildContractPrintMutateRequest(input);

  const clauseIds = (input.clause_ids ?? []).map((id) => id.trim()).filter(Boolean);

  const postBody =

    clauseIds.length > 0 ? { ...body, clause_ids: clauseIds } : body;

  const search = new URLSearchParams();

  search.set('company_id', companyIdQuery);

  const url = `${HRM_API_ORIGIN}/api/hrm/contracts-insurance/contracts/${encodeURIComponent(

    contractId,

  )}/preview?${search.toString()}`;

  const res = await fetch(url, {

    method: 'POST',

    headers: await hrmJsonHeaders(),

    body: JSON.stringify(postBody),

  });

  return parseHrmEnvelope<HrmContractPreviewResult>(res);

}



export { createEmployeeContract };



/**

 * @CODE-MEMORY-CHANGE 2026-08-12 D-FE-CTR-CB-BOOT-01

 * What: Bootstrap C&B từ ContractWorkspace — REUSE POST compensation-packages (SA-CTR-INSURANCE-SALARY-SOURCE-01 §3.3/§4).

 *       Ghi gói v1 (lines base + si_base) trước khi lưu HĐ; KHÔNG lưu lương BH làm SoT trên employee_contracts.

 * Why: Sponsor §10b — 2 ô tiền riêng (không auto-copy); NV mới chưa có snapshot vẫn nhập được từ màn HĐ.

 * must_keep: 2 lines base + si_base (allowance shape DTO LIVE); effective_from HĐ→ký→hôm nay; DENY dual salary column.

 */



/** SA §3.3 — draft 2 mức tiền bootstrap (số thuần VND). */

export type ContractCbBootstrapDraft = {

  base_salary_vnd: number;

  insurance_salary_vnd: number;

};



export const INITIAL_CONTRACT_CB_BOOTSTRAP_DRAFT: ContractCbBootstrapDraft = {

  base_salary_vnd: 0,

  insurance_salary_vnd: 0,

};



/** ISO yyyy-MM-dd (client local) — tránh lệch múi giờ khi toISOString(). */

function toIsoDateLocal(d: Date): string {

  const y = d.getFullYear();

  const m = String(d.getMonth() + 1).padStart(2, '0');

  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;

}



/**

 * SA §4 EF-BOOT — effective_from priority:

 *   1) Ngày hiệu lực HĐ · 2) Ngày ký · 3) Hôm nay (client local).

 * Không lấy min() — HĐ hiệu lực ưu tiên (EF-BOOT-02).

 */

export function resolveContractCbBootstrapEffectiveFrom(

  effectiveDate: Date | null | undefined,

  signingDate: Date | null | undefined,

): string {

  const pick = (d: Date | null | undefined): string | null =>

    d instanceof Date && !Number.isNaN(d.getTime()) ? toIsoDateLocal(d) : null;

  return pick(effectiveDate) ?? pick(signingDate) ?? toIsoDateLocal(new Date());

}



export type ContractCbBootstrapValidation =

  | { ok: true; amounts: ContractCbBootstrapDraft }

  | { ok: false; message: string };



/** BR-CTR-CB-BOOT-03 — chặn Tiếp/Lưu nếu trống hoặc ≤ 0 (2 ô riêng, không auto-copy). */

export function validateContractCbBootstrapDraft(

  draft: ContractCbBootstrapDraft | null | undefined,

): ContractCbBootstrapValidation {

  const base = Number(draft?.base_salary_vnd);

  const insurance = Number(draft?.insurance_salary_vnd);

  if (!Number.isFinite(base) || base <= 0) {

    return { ok: false, message: 'Nhập Lương cơ bản lớn hơn 0 trước khi tiếp tục.' };

  }

  if (!Number.isFinite(insurance) || insurance <= 0) {

    return { ok: false, message: 'Nhập Lương đóng BH lớn hơn 0 trước khi tiếp tục.' };

  }

  return {

    ok: true,

    amounts: {

      base_salary_vnd: Math.trunc(base),

      insurance_salary_vnd: Math.trunc(insurance),

    },

  };

}



/**

 * SA §3 / BR-CTR-CB-BOOT-01 — card = trạng thái bootstrap khi:

 *   subject NV · có employee_id · snapshot đã tải · không cb_masked · snapshot rỗng (chưa có gói).

 * UV / candidate (employee_id null) → không bootstrap (EF-BOOT-04 / BR-CTR-CB-BOOT-05).

 */

export function isContractCbBootstrapState(input: {

  subjectType: 'employee' | 'candidate';

  employeeId?: string | null;

  snapshot: ContractCreateContextSnapshot | null;

}): boolean {

  if (input.subjectType !== 'employee') return false;

  if (!input.employeeId?.trim()) return false;

  const ctx = input.snapshot;

  if (!ctx) return false;

  if (ctx.cb_masked) return false;

  const snap = ctx.compensation_snapshot;

  const hasNumbers =

    snap.base_salary_vnd != null || snap.insurance_salary_vnd != null;

  return !hasNumbers;

}



/** SA §3.3 canonical body — lines base + si_base (allowance shape). */

export function buildContractCbBootstrapPayload(input: {

  companyId: string;

  employeeId: string;

  effectiveFrom: string;

  amounts: ContractCbBootstrapDraft;

  contractId?: string | null;

}) {

  return {

    company_id: normalizeHrmApiListCompanyId(input.companyId),

    employee_id: input.employeeId,

    effective_from: input.effectiveFrom,

    change_reason: 'ctr_workspace_bootstrap',

    currency: 'VND',

    ...(input.contractId?.trim()

      ? { contract_id: input.contractId.trim(), link_to_contract: true }

      : {}),

    lines: [

      { line_type: 'base' as const, amount: input.amounts.base_salary_vnd, component_code: 'base' },

      {

        line_type: 'allowance' as const,

        amount: input.amounts.insurance_salary_vnd,

        allowance_code: 'si_base',

        component_code: 'si_base',

      },

    ],

  };

}



/** REUSE POST compensation-packages — không endpoint mới (SA Option A LOCKED). */

export async function bootstrapContractCompensationPackage(input: {

  companyId: string;

  employeeId: string;

  effectiveFrom: string;

  amounts: ContractCbBootstrapDraft;

  contractId?: string | null;

}): Promise<HrmCompensationPackageRecord> {

  return createCompensationPackage(buildContractCbBootstrapPayload(input));

}



export type ContractCbBootstrapErrorOutcome = {

  message: string;

  /** true khi gói đã tồn tại (overlap race) — refresh context rồi cho lưu HĐ tiếp. */

  treatAsExisting: boolean;

};



/** SA §5 error map — VAL-400 / AUTHZ-403 chặn; OVERLAP-409 = gói đã có → RO. */

export function mapContractCbBootstrapError(err: unknown): ContractCbBootstrapErrorOutcome {

  const code = err instanceof ApiClientError ? err.code : undefined;

  const isOverlap =

    code === 'HRM-COMP-409-OVERLAP' || code === 'HRM-CORE-CB-OVERLAP-409';

  if (isOverlap) {

    return {

      message: 'Nhân viên đã có gói lương & bảo hiểm — dùng số hiện có (không tạo trùng).',

      treatAsExisting: true,

    };

  }

  return {

    message: toErrorMessage(err, 'Không lưu được lương & bảo hiểm khởi tạo.'),

    treatAsExisting: false,

  };

}


