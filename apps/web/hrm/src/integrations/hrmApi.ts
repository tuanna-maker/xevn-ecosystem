import { serializePayrollEnrollBody } from "@/lib/payrollEnrollPayload";
import { buildCreateAdvanceRequestEmployeeBody } from "@/lib/advanceRequestEmployeeRequest";
import { buildWirePaymentBatchBody } from "@/lib/wirePaymentBatchRequest";
import { buildContractPrintMutateRequest } from "@/lib/contractPrintRequest";
import {
  buildContractLibraryApplyRequest,
  buildContractLibraryPublishRequest,
  buildContractLibraryPullRequest,
} from "@/lib/contractLibraryPublishRequest";
import { ApiClientError, isAbortLikeError } from "@/lib/apiError";
import {
  parseLeaveBalancePanelPayload,
  parseLeaveBalancePayload,
  type LeaveBalancePanelPayload,
  type LeaveBalancePayload,
} from "@/lib/leaveBalance";
import { clampHrmPageSize, HRM_API_MAX_PAGE_SIZE } from "@/lib/hrmDataMode";
import {
  coerceHrmListCompanyId,
  HRM_MASTER_TENANT_ID,
  normalizeHrmApiListCompanyId,
} from "@/lib/hrmListScope";
import { buildSettingsCatalogItemPayload } from "@/lib/hrmSettingsCatalogItem";
import { resolveHrmMetadataCompanyUuid, serializeMetadataJsonValue } from "@/lib/hrmMetadataCompany";
import { getHrmPortalMode } from "@/lib/hrmPortalMode";
import {
  getPortalJwtTenantId,
  resolveHrmMutateCompanyScope,
  resolveHrmRequestTenantId,
  resolveHrmSpreadsheetScope,
} from "@/lib/hrmSpreadsheetScope";
import { safeRandomUuid } from "@/lib/safeRandomUuid";
import { getPortalAccessToken, getPortalSessionUser, waitForPortalAccessToken } from "@/lib/portalAuthBridge";
import type { JdLayoutSnapshotV2, JdSnapshotGroup } from "@/lib/jdDynamicSnapshot";
import {
  normalizeJdPackResolveResult,
  stripJdPackRulesForPut,
} from "@/lib/jdPackClientNormalize";

const HRM_API_ORIGIN = (import.meta.env.VITE_HRM_API_ORIGIN ?? "").replace(/\/$/, "");
const SERVICE_JWT_TOKEN = import.meta.env.VITE_SERVICE_JWT_TOKEN;
const INTERNAL_API_KEY = import.meta.env.DEV ? import.meta.env.VITE_INTERNAL_API_KEY : undefined;

type HrmEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  details?: unknown;
};

export type HrmSpreadsheetScope = {
  tenantId: string;
  companyId: string;
};

type HrmHeaderOptions = {
  /** Omit for `FormData` / binary so the runtime sets `Content-Type` (multipart boundary). */
  omitContentType?: boolean;
  /** Required for spreadsheet import preview/commit when the caller JWT has no tenant/company claims. */
  scope?: HrmSpreadsheetScope;
};

function inferRuntimeScope(): HrmSpreadsheetScope | undefined {
  if (typeof window === "undefined") return undefined;
  const storedCompany =
    localStorage.getItem("hrm_current_company_id") ||
    sessionStorage.getItem("hrm_current_company_id");
  const scopeHint = storedCompany?.trim() ? coerceHrmListCompanyId(storedCompany) : storedCompany;
  return resolveHrmSpreadsheetScope(scopeHint, window.location.search) ?? undefined;
}

async function headers(opts?: HrmHeaderOptions) {
  const baseHeaders: Record<string, string> = {
    "x-request-id": safeRandomUuid(),
  };
  if (!opts?.omitContentType) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const portalMode =
    typeof window !== "undefined" && getHrmPortalMode(window.location.search);
  let portalToken = getPortalAccessToken();
  if (!portalToken && portalMode) {
    portalToken = await waitForPortalAccessToken(5000);
  }
  if (portalToken) {
    baseHeaders.Authorization = `Bearer ${portalToken}`;
    baseHeaders["x-access-token"] = portalToken;
    baseHeaders["x-portal-access-token"] = portalToken;
    const portalUser = getPortalSessionUser();
    if (portalUser?.userId) {
      baseHeaders["x-user-id"] = portalUser.userId;
    }
  }
  if (!baseHeaders.Authorization) {
    if (SERVICE_JWT_TOKEN) {
      baseHeaders.Authorization = `Bearer ${SERVICE_JWT_TOKEN}`;
    } else if (INTERNAL_API_KEY) {
      baseHeaders["x-internal-api-key"] = INTERNAL_API_KEY;
    }
  }

  const effectiveScope = opts?.scope ?? inferRuntimeScope();
  if (effectiveScope) {
    baseHeaders["x-tenant-id"] = effectiveScope.tenantId;
    baseHeaders["x-company-id"] = effectiveScope.companyId;
  }

  if (!baseHeaders["x-tenant-id"]) {
    const fallbackTenant =
      resolveHrmRequestTenantId() ||
      import.meta.env.VITE_HRM_SCOPE_TENANT_ID?.trim() ||
      HRM_MASTER_TENANT_ID;

    if (fallbackTenant) {
      baseHeaders["x-tenant-id"] = fallbackTenant;
    }
  }
  return baseHeaders;
}

async function parseHrmJson<T>(res: Response): Promise<{ data: T; envelope: HrmEnvelope<T> }> {
  let body: HrmEnvelope<T> | undefined;
  try {
    body = (await res.json()) as HrmEnvelope<T>;
  } catch {
    // ignore parse error for non-json body
  }

  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      code: body?.code,
      message: body?.message ?? `Không xử lý được yêu cầu HRM (${res.status})`,
      details: body?.details,
    });
  }

  if (!body) {
    throw new ApiClientError({
      status: res.status,
      code: "HRM-EMPTY-BODY",
      message: "Empty response body",
    });
  }
  if (body.success === false) {
    throw new ApiClientError({
      status: res.status,
      code: body.code,
      message: body.message ?? "Không xử lý được yêu cầu HRM",
      details: body.details,
    });
  }
  // Removed HRM-NO-DATA throw to allow endpoints returning just { success: true }

  const responseData = body.data !== undefined ? body.data : body;
    return { data: (responseData ?? ({} as T)) as T, envelope: body as HrmEnvelope<T> };
}

const DEFAULT_HRM_FETCH_MS =
  Number(import.meta.env.VITE_HRM_FETCH_TIMEOUT_MS) ||
  (import.meta.env.DEV ? 120_000 : 60_000);

/** Payroll schema/template bind can be slow on remote dev DB — allow longer than generic GET. */
export const PAYROLL_HRM_TIMEOUT_MS =
  Number(import.meta.env.VITE_HRM_PAYROLL_FETCH_TIMEOUT_MS) ||
  (import.meta.env.DEV ? 180_000 : 90_000);

type RequestHrmOptions = HrmHeaderOptions & { timeoutMs?: number };

async function requestHrmOnce<T>(
  path: string,
  init: RequestInit,
  opts: RequestHrmOptions | undefined,
  timeoutMs: number,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const userSignal = init.signal;
  if (userSignal) {
    if (userSignal.aborted) controller.abort();
    else userSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    const res = await fetch(`${HRM_API_ORIGIN}${path}`, {
      ...init,
      signal: controller.signal,
      headers: await headers(opts),
    });
    const { data } = await parseHrmJson<T>(res);
    return data;
  } catch (error) {
    if (isAbortLikeError(error)) {
      if (timedOut) {
        throw new ApiClientError({
          code: "HRM-TIMEOUT",
          message: "Hết thời gian chờ phản hồi từ server.",
          status: 408,
        });
      }
      throw error;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function requestHrm<T>(
  path: string,
  init?: RequestInit,
  opts?: RequestHrmOptions,
): Promise<T> {
  const baseTimeout = opts?.timeoutMs ?? DEFAULT_HRM_FETCH_MS;
  const method = (init?.method ?? "GET").toUpperCase();
  const safeInit = init ?? {};
  try {
    return await requestHrmOnce<T>(path, safeInit, opts, baseTimeout);
  } catch (error) {
    const canRetryGet =
      method === "GET" &&
      error instanceof ApiClientError &&
      error.code === "HRM-TIMEOUT" &&
      baseTimeout < PAYROLL_HRM_TIMEOUT_MS;
    if (canRetryGet) {
      return await requestHrmOnce<T>(path, safeInit, opts, PAYROLL_HRM_TIMEOUT_MS);
    }
    throw error;
  }
}

export type EmployeeSpreadsheetImportPreview = {
  kind: "employee_import";
  headersDetected: string[];
  canonicalHeaders: readonly string[];
  rowCount: number;
  previewRows: Record<string, string>[];
  truncated: boolean;
  errors: Array<{ row: number; field?: string; code: string; message?: string }>;
  dryRun: boolean;
};

export type EmployeeSpreadsheetImportCommitResult = {
  importedCount: number;
  ids: string[];
  errors: Array<{ row: number; field?: string; code: string; message?: string }>;
};

/** Server-side parse + validation preview (`SHEET-200`); no DB writes. */
export async function previewEmployeeSpreadsheetImport(file: File, scope: HrmSpreadsheetScope) {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", "employee_import");
  form.append("dryRun", "true");
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/spreadsheet/import/preview`, {
    method: "POST",
    headers: await headers({ omitContentType: true, scope }),
    body: form,
  });
  const { data } = await parseHrmJson<EmployeeSpreadsheetImportPreview>(res);
  return data;
}

/** Persists rows via `EmployeesService` per README (no cross-row transaction). */
export async function commitEmployeeSpreadsheetImport(file: File, scope: HrmSpreadsheetScope) {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", "employee_import");
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/spreadsheet/import/commit`, {
    method: "POST",
    headers: await headers({ omitContentType: true, scope }),
    body: form,
  });
  const { data } = await parseHrmJson<EmployeeSpreadsheetImportCommitResult>(res);
  return data;
}

/** Official template from `SpreadsheetModule` (auth only; no tenant/company scope on controller). */
export async function downloadEmployeeImportTemplate(format: "csv" | "xlsx" = "xlsx"): Promise<Blob> {
  const res = await fetch(
    `${HRM_API_ORIGIN}/api/hrm/spreadsheet/templates/employee_import?format=${encodeURIComponent(format)}`,
    { method: "GET", headers: await headers({ omitContentType: true }) },
  );
  if (!res.ok) {
    let body: HrmEnvelope<unknown> | undefined;
    try {
      body = (await res.json()) as HrmEnvelope<unknown>;
    } catch {
      /* ignore */
    }
    throw new ApiClientError({
      status: res.status,
      code: body?.code,
      message: body?.message ?? `Không xử lý được yêu cầu HRM (${res.status})`,
      details: body?.details,
    });
  }
  return res.blob();
}

export async function listSyncedCatalogs() {
  return requestHrm<{ total: number; data: unknown[] }>("/api/hrm/catalog-sync", {
    method: "GET",
  });
}

export type HrmSettingsCatalogItem = {
  code: string;
  label: string;
  unit: string | null;
  status: "active" | "draft";
  origin: "xbos" | "hrm";
};

export type HrmSettingsCatalogTenantWriterMeta = {
  kind: 'att_leave_type';
  apiPath: string;
  effectiveApiPath: string;
  groupRefReadOnly: true;
};

export type HrmSettingsCatalogOverviewRow = {
  catalogKey: string;
  name: string | null;
  domain: string | null;
  xbosVersion: number | null;
  xbosSyncedAt: string | null;
  xbosItems: HrmSettingsCatalogItem[];
  hrmExtensionItems: HrmSettingsCatalogItem[];
  effectiveItems: HrmSettingsCatalogItem[];
  /** HRM-SC-01 — dual SoT hint when group REF partition has a Nest tenant writer. */
  tenantWriter?: HrmSettingsCatalogTenantWriterMeta;
};

export async function getSettingsCatalogsOverview(scope: HrmSpreadsheetScope) {
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs`, {
    method: "GET",
    headers: await headers({ scope }),
  });
  const { data } = await parseHrmJson<{ catalogs: HrmSettingsCatalogOverviewRow[] }>(res);
  return data;
}

export async function syncSettingsCatalogsFromXbos(scope: HrmSpreadsheetScope) {
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/sync-from-xbos`, {
    method: "POST",
    headers: await headers({ scope }),
    body: JSON.stringify({ company_id: normalizeHrmApiListCompanyId(scope.companyId) }),
  });
  const { data } = await parseHrmJson<{ pulledKeys: string[] }>(res);
  return data;
}

export async function upsertSettingsCatalogItem(
  input: {
    companyId: string;
    catalogKey: string;
    code: string;
    label: string;
    itemValue?: string;
    /** draft = ngưng dùng (soft-stop); omit → BE default active. */
    status?: "active" | "draft";
  },
  scope: HrmSpreadsheetScope,
) {
  const body = buildSettingsCatalogItemPayload(input);
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/items`, {
    method: "POST",
    headers: await headers({ scope }),
    body: JSON.stringify(body),
  });
  const { data } = await parseHrmJson<{ upserted?: number; item_key?: string; category_key?: string }>(res);
  return data;
}

export async function appendSettingsCatalogExtensionItems(
  catalogKey: string,
  items: Array<{ code: string; label: string; unit?: string; status?: "active" | "draft" }>,
  scope: HrmSpreadsheetScope,
) {
  const h = await headers({ scope });
  const res = await fetch(
    `${HRM_API_ORIGIN}/api/hrm/settings-catalogs/${encodeURIComponent(catalogKey)}/extension-items`,
    {
      method: "POST",
      headers: h,
      body: JSON.stringify({ items }),
    },
  );
  const { data, envelope } = await parseHrmJson<{
    upserted?: number;
    submitted?: number;
    batchId?: string;
    status?: string;
    message?: string;
  }>(res);
  return { ...data, message: envelope.message ?? data?.message };
}

export async function requestSettingsCatalogFieldRemoval(
  catalogKey: string,
  payload: { code: string; label?: string; reason?: string; requested_by_name?: string; requested_by_email?: string },
  scope: HrmSpreadsheetScope,
) {
  const res = await fetch(
    `${HRM_API_ORIGIN}/api/hrm/settings-catalogs/${encodeURIComponent(catalogKey)}/removal-requests`,
    {
      method: 'POST',
      headers: await headers({ scope }),
      body: JSON.stringify(payload),
    },
  );
  const { data } = await parseHrmJson<{
    requestId: string;
    status: string;
    leadershipEmails: string[];
    createdAt: string;
    message: string;
  }>(res);
  return data;
}

export async function createPlatformAdmin(payload: {
  email: string;
  password: string;
  full_name?: string;
}) {
  return requestHrm<{ success: boolean; user_id: string }>("/api/hrm/admin/platform-admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCompanyAdmin(payload: {
  company_id: string;
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}) {
  return requestHrm<{ success: boolean; user_id: string; is_existing_user: boolean }>("/api/hrm/admin/company-admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type HrmAttendanceStatus = "pending" | "present" | "absent" | "leave";

/**
 * Nest GET /attendance/records row — F-ATT-LEAVE-FUNNEL-03 display-ready when status=leave.
 * FE binds status_label / leave_type_label only; cấm join leave-requests (Option C).
 */
export type HrmAttendanceRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  /** OS 28 — display-ready from BE join employees. */
  employee_code?: string | null;
  employee_name?: string | null;
  department?: string | null;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: HrmAttendanceStatus;
  /** vi-VN status label from BE (e.g. «Nghỉ phép»). */
  status_label?: string | null;
  note: string | null;
  leave_request_id?: string | null;
  leave_type?: string | null;
  leave_type_key?: string | null;
  /** vi-VN leave type label from BE (e.g. «Phép năm»). */
  leave_type_label?: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export async function listAttendanceRecords(params: {
  company_id: string;
  employee_id?: string;
  status?: HrmAttendanceStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "page_size") {
      search.set(key, String(clampHrmPageSize(Number(value))));
      return;
    }
    if (key === "company_id" && typeof value === "string") {
      setListCompanyId(search, value);
      return;
    }
    search.set(key, String(value));
  });
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmAttendanceRecord[] }>(
    `/api/hrm/attendance/records?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * @CODE-MEMORY
 * Screen: HRM Chấm công → Clock-In → GPS / Thủ công · POST /api/hrm/attendance/records
 * UC: HRM-AT-01 · BR: geofence assertWithinWorkSite khi có latitude+longitude
 * SRS: docs/hrm/SRS.md · SRS_VN GPS/geofence · docs/qa/professional/by-uc/HRM-AT-01.md
 * TechSpec: docs/hrm/TECHSPEC.md attendance records create · CreateAttendanceRecordDto
 * Purpose: Tạo bản ghi chấm công; khi GPS gửi lat/lon thì BE có thể trả HRM-ATT-GEO-001 (ngoài site).
 * WorkItem: PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
 * Coded: 2026-08-04
 * Callers: useAttendanceRecords.checkIn → GPSAttendance / CheckInOutWidget / QR / Face
 * Callees: Nest POST /api/hrm/attendance/records
 * must_keep: Manual check-in không bắt buộc lat/lon; Face GĐ2-HOLD không đổi; U65 no seed
 * Impact: Bỏ lat/lon trên GPS → silent 201, GEO-001 không chạy (residual R-MFD-M2-CLOCK-GPS-LATLON)
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-CLOCK-GPS-LATLON-01
 * change_mode: FIX
 * What: payload type + JSON body chấp nhận optional latitude/longitude
 * Why: QA CLOCK-01 — UI GPS hiện 10,10 nhưng POST omit coords → BE không assert geofence
 * must_keep: status/note/created_by; manual path không gửi coords vẫn 201
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-FE-01
 * change_mode: ADD
 * What: payload type chấp nhận optional check_in_method (gps|manual|qr|wifi|face)
 * Why: R-PLT-ATT-WS-FE-CNS-05 — GPS path gửi method=gps để BE enforce HRM-ATT-GEO-REQ
 * must_keep: lat/lon optional; manual omit method soft-skip; Face HOLD; U65; attendance_uat_ready=false
 */
export async function createAttendanceRecord(payload: {
  company_id: string;
  employee_id: string;
  attendance_date: string;
  check_in_at?: string;
  check_out_at?: string;
  status?: HrmAttendanceStatus;
  note?: string;
  created_by?: string;
  /** GPS check-in — BE assertWithinWorkSite / HRM-ATT-GEO-001 when gps_enabled + sites exist */
  latitude?: number;
  longitude?: number;
  /** Punch channel — gps + omit lat/lon → HRM-ATT-GEO-REQ (VAL-ATT-WS-CNS-05) */
  check_in_method?: 'gps' | 'manual' | 'qr' | 'wifi' | 'face';
}) {
  return requestHrm<HrmAttendanceRecord>("/api/hrm/attendance/records", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01
 * change_mode: FIX (consumer wire — transport unchanged)
 * What: AttendanceRecordsTable Edit modal → updateRecord → this PATCH
 * Why: R-MFD-M2-ATT-RECORDS-EDIT-STUB — Sửa CTA had no onClick; HRM-AT-03
 * must_keep: status enum pending|present|absent|leave; list GET; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M2-ATT-RECORDS-EDIT-01-R3-FE
 * change_mode: FIX
 * What: PATCH status passes resolveHrmMutateCompanyScope via hrmOuMutateOpts → x-company-id
 * Why: QA R2 — browser Lưu → 409 HRM-ATT-409 with x-company-id=main (OU trsport); L1+trsport→200
 * must_keep: list GET LIVE; DATE harden; Edit testids; no Delete→absent as AT-03; CLOCK/SHEETS/LEAVE/OT
 */
export async function updateAttendanceStatus(
  recordId: string,
  payload: {
    status: HrmAttendanceStatus;
    note?: string;
    updated_by?: string;
  },
  companyId?: string,
) {
  return requestHrm<HrmAttendanceRecord>(
    `/api/hrm/attendance/records/${recordId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    hrmOuMutateOpts(companyId),
  );
}

export type HrmPayrollPeriodStatus = "draft" | "processed" | "closed";

export type HrmPaySheetTemplatePeriodSnapshot = {
  template_id?: string;
  template_code?: string;
  template_name?: string;
  columns?: Array<{
    component_code?: string;
    display_label?: string | null;
    sort_order?: number;
    formula_definition_id?: string | null;
    override_applied?: boolean;
    sign?: 'earning' | 'deduction' | string | null;
  }>;
  bound_at?: string;
};

/** Process POST display-ready rollup (HRM-PAY-202) — not always on GET list. */
export type HrmPayrollPayslipSummary = {
  total_gross?: string | number;
  total_net?: string | number;
  total_deduction?: string | number;
};

export type HrmPayrollPeriod = {
  id: string;
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: HrmPayrollPeriodStatus;
  employee_count?: number;
  total_gross?: string | number;
  total_deduction?: string | number;
  total_net?: string | number;
  /** Present on POST /process — prefer over missing list totals (R-PAY-W3-FE-SUMMARY-ZERO). */
  payslip_summary?: HrmPayrollPayslipSummary | null;
  created_by: string | null;
  processed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  /** AMIS mẫu bảng lương — NOT salary_templates enroll pack. */
  pay_sheet_template_id?: string | null;
  paySheetTemplateId?: string | null;
  sheet_template_snapshot_json?: HrmPaySheetTemplatePeriodSnapshot | null;
  sheetTemplateSnapshotJson?: HrmPaySheetTemplatePeriodSnapshot | null;
  payroll_e2e_ready?: boolean;
  payroll_group_id?: string | null;
  payroll_group_code?: string | null;
  payroll_group_name_vi?: string | null;
};

export async function listPayrollPeriods(params: {
  company_id: string;
  status?: string;
  payroll_group_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  if (params.payroll_group_id) search.set("payroll_group_id", params.payroll_group_id);
  return requestHrm<{ total: number; data: HrmPayrollPeriod[] }>(
    `/api/hrm/payroll/periods?${search.toString()}`,
    { method: "GET" },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

export async function createPayrollPeriod(payload: {
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  created_by?: string;
  /** Active pay-sheet-template id — binds snapshot on create (F-PAY-PERIOD-01). */
  paySheetTemplateId?: string;
  payroll_group_id?: string | null;
}) {
  const body: Record<string, unknown> = {
    company_id: payload.company_id,
    period_label: payload.period_label,
    start_date: payload.start_date,
    end_date: payload.end_date,
  };
  if (payload.created_by?.trim()) {
    body.created_by = payload.created_by.trim();
  }
  if (payload.paySheetTemplateId?.trim()) {
    body.paySheetTemplateId = payload.paySheetTemplateId.trim();
  }
  if (payload.payroll_group_id) {
    body.payroll_group_id = payload.payroll_group_id;
  }
  return requestHrm<HrmPayrollPeriod>(
    "/api/hrm/payroll/periods",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

export async function updatePayrollPeriod(
  periodId: string,
  payload: { payroll_group_id?: string | null },
) {
  return requestHrm<HrmPayrollPeriod>(`/api/hrm/payroll/periods/${periodId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type HrmPayrollGroupApiRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  priority: number;
  match_rule_json: {
    department_ids?: string[];
    position_keys?: string[];
    employee_ids?: string[];
  };
  formula_definition_id?: string | null;
  status: "active" | "retired";
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPayrollGroups(params: { company_id: string; status?: "active" | "retired" }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ items: HrmPayrollGroupApiRow[] }>(`/api/hrm/payroll/groups?${search.toString()}`, {
    method: "GET",
  });
}

export async function getPayrollGroup(groupId: string) {
  return requestHrm<HrmPayrollGroupApiRow>(`/api/hrm/payroll/groups/${encodeURIComponent(groupId)}`, {
    method: "GET",
  });
}

export async function createPayrollGroup(payload: {
  company_id: string;
  code: string;
  name_vi: string;
  priority?: number;
  match_rule_json?: HrmPayrollGroupApiRow["match_rule_json"];
  formula_definition_id?: string | null;
  status?: "active" | "retired";
}) {
  return requestHrm<HrmPayrollGroupApiRow>("/api/hrm/payroll/groups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePayrollGroup(
  groupId: string,
  payload: {
    name_vi?: string;
    priority?: number;
    match_rule_json?: HrmPayrollGroupApiRow["match_rule_json"];
    formula_definition_id?: string | null;
    status?: "active" | "retired";
  },
) {
  return requestHrm<HrmPayrollGroupApiRow>(`/api/hrm/payroll/groups/${encodeURIComponent(groupId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export type HrmPayrollGroupMembersPreview = {
  group_id: string;
  period_id: string;
  items: Array<{
    employee_id: string;
    employee_code: string;
    employee_name: string;
    match_source: string;
    conflict?: boolean;
  }>;
  warnings?: string[];
};

export async function getPayrollGroupMembers(groupId: string, periodId: string) {
  const search = new URLSearchParams();
  search.set("period_id", periodId);
  return requestHrm<HrmPayrollGroupMembersPreview>(
    `/api/hrm/payroll/groups/${encodeURIComponent(groupId)}/members?${search.toString()}`,
    { method: "GET" },
  );
}

export async function processPayrollPeriod(periodId: string, companyId?: string) {
  const search = new URLSearchParams();
  if (companyId?.trim()) {
    search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  }
  const qs = search.toString();
  return requestHrm<HrmPayrollPeriod>(
    `/api/hrm/payroll/periods/${periodId}/process${qs ? `?${qs}` : ""}`,
    { method: "POST" },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

export type PayrollEnrollMode = "explicit" | "auto_eligible";

export type HrmPayrollEnrollRequest =
  | {
      mode: "explicit";
      employee_ids: string[];
    }
  | {
      mode: "auto_eligible";
      employee_ids?: never;
    };

export type HrmPayrollEnrollEntry = {
  payslip_id?: string;
  employee_id: string;
  employee_code?: string;
  employee_name?: string;
  reasons?: string[];
};

export type HrmPayrollEnrollResponse = {
  period_id: string;
  enrolled: HrmPayrollEnrollEntry[];
  rejected: HrmPayrollEnrollEntry[];
  employee_count?: number;
};

export async function enrollPayrollPeriod(periodId: string, payload: HrmPayrollEnrollRequest) {
  return requestHrm<HrmPayrollEnrollResponse>(
    `/api/hrm/payroll/periods/${periodId}/enroll`,
    {
      method: "POST",
      body: serializePayrollEnrollBody(payload),
    },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

export type HrmPayrollEligibilityItem = {
  employee_id: string;
  employee_code: string;
  employee_name: string;
  hire_date: string | null;
  eligible: boolean;
  reasons: string[];
};

export type HrmPayrollEligibilityResponse = {
  period_id: string;
  require_closed_timesheet: boolean;
  has_closed_sheet?: boolean;
  eligible_count: number;
  ineligible_count: number;
  items: HrmPayrollEligibilityItem[];
};

export async function getPayrollEligibility(periodId: string) {
  return requestHrm<HrmPayrollEligibilityResponse>(
    `/api/hrm/payroll/periods/${periodId}/eligibility`,
    { method: "GET" },
  );
}

/** F-PAY-PERIOD-INP — GET /payroll/periods/:id/input-lines (display-ready draft amounts).
 *
 * @CODE-MEMORY-CHANGE 2026-08-24
 * WorkItem: PO-HRM-PAY-VP-HANOI-BATCH-DETAIL-COLUMNS-01
 * change_mode: FIX
 * What: Consumer must pass employee_id filter when loading batch detail — BE caps limit at 500/order updated_at DESC
 * Why: VP HN seed 85×~8=700 lines — global list omits late-sort employees (XE00236/XE00250)
 * must_keep: camelCase response (employeeId/componentCode) · PAYROLL_HRM_TIMEOUT_MS · payroll_e2e_ready=false
 */
export type HrmPayPeriodInputLineRow = {
  id: string;
  companyId: string;
  periodId: string;
  employeeId: string;
  employeeDisplayName?: string;
  componentCode: string;
  componentDisplayLabel?: string;
  amount: number;
  quantity?: number | null;
  sourceKind?: string;
  sourceRef?: string | null;
  effectiveDate?: string | null;
  note?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function listPayrollPeriodInputLines(
  periodId: string,
  params: {
    company_id: string;
    employee_id?: string;
    component_code?: string;
    limit?: number;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.component_code) search.set("component_code", params.component_code);
  if (params.limit != null) search.set("limit", String(params.limit));
  return requestHrm<{ items: HrmPayPeriodInputLineRow[] }>(
    `/api/hrm/payroll/periods/${encodeURIComponent(periodId)}/input-lines?${search.toString()}`,
    { method: "GET" },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-PAY-01-CLUSTER-FE-01
 * change_mode: ADD
 * What: GET/POST …/payroll/periods/:id/timesheet-binds — closed assert · display-ready status
 * Why: G-PAY-01-BIND-FE · AC-PAY-01-BIND-* · J-HRM-PAY-01-02/03
 * must_keep: payroll_e2e_ready=false · ≠ PAY-01 DONE · ATT11QC1 peer · U65 no seed
 */
export type HrmPayPeriodTimesheetBindItem = {
  id: string;
  companyId?: string;
  payrollPeriodId?: string;
  timesheetHeaderId: string;
  timesheetDisplayLabel: string;
  timesheetStatus: string;
  transferKind?: string | null;
  boundAt?: string | null;
  boundBy?: string | null;
  note?: string | null;
  archivedAt?: string | null;
  sheetDateFrom?: string | null;
  sheetDateTo?: string | null;
};

export type HrmPayPeriodTimesheetBindsListResponse = {
  items: HrmPayPeriodTimesheetBindItem[];
};

export async function listPayrollPeriodTimesheetBinds(periodId: string) {
  return requestHrm<HrmPayPeriodTimesheetBindsListResponse>(
    `/api/hrm/payroll/periods/${periodId}/timesheet-binds`,
    { method: "GET" },
  );
}

export async function createPayrollPeriodTimesheetBind(
  periodId: string,
  body: { timesheetHeaderId: string; transferKind?: string; note?: string },
) {
  return requestHrm<HrmPayPeriodTimesheetBindItem>(
    `/api/hrm/payroll/periods/${periodId}/timesheet-binds`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function closePayrollPeriod(periodId: string, companyId?: string) {
  const search = new URLSearchParams();
  if (companyId?.trim()) {
    search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  }
  const qs = search.toString();
  return requestHrm<HrmPayrollPeriod>(
    `/api/hrm/payroll/periods/${periodId}/close${qs ? `?${qs}` : ""}`,
    { method: "POST" },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

export type HrmPayslipRow = {
  id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  gross_amount: string;
  deduction_amount: string;
  net_amount: string;
  status: string;
  period_label: string;
  payroll_group_id?: string | null;
  payroll_group_code?: string | null;
  payroll_group_name_vi?: string | null;
};

/**
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-PAY-04-CLUSTER-FE-01
 * change_mode: ADD
 * What: F-PAY-PAYSLIP-01 GET by id — segments[] display-ready (API-01 §5.1)
 * Why: J-HRM-PAY-04-06 preview bind · display-only · BE one Net SoT
 * must_keep: PAY01QC1 · PAY02QC1 · payroll_e2e_ready=false · ≠ PAY-04 DONE · no FE net merge
 */
export type HrmPayslipSplitSegment = {
  segmentSeq: number;
  effectiveFrom: string;
  effectiveTo: string;
  baseSalarySnapshotVnd: number | null;
  hoursPayable: number | null;
  segmentGrossVnd: number;
};

export type HrmPayslipDetail = {
  id: string;
  company_id: string;
  period_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  gross_amount: number | string;
  deduction_amount: number | string;
  net_amount: number | string;
  currency?: string;
  status: string;
  period_label: string;
  split?: boolean;
  segmentCount?: number;
  segments?: HrmPayslipSplitSegment[];
  components?: unknown[];
  lines?: unknown[];
};

export async function listPayrollPayslips(params: {
  company_id: string;
  period_id?: string;
  payroll_group_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.period_id) search.set("period_id", params.period_id);
  if (params.payroll_group_id) search.set("payroll_group_id", params.payroll_group_id);
  return requestHrm<{ total: number; data: HrmPayslipRow[] }>(
    `/api/hrm/payroll/payslips?${search.toString()}`,
    { method: "GET" },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

export type HrmPayslipLineRow = {
  id: string;
  payslip_id: string;
  company_id: string;
  component_code: string;
  amount: number | string;
  sign: 'earning' | 'deduction' | string;
  source_ref?: string | null;
  formula_definition_id?: string | null;
  sort_order: number;
  source_tier?: string | null;
  created_at?: string;
};

/** F-PAY-PAYSLIP-01 — GET /payroll/payslips/:id/lines */
export async function listPayrollPayslipLines(
  payslipId: string,
  params: { company_id: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  return requestHrm<{ payslip_id: string; company_id: string; total: number; data: HrmPayslipLineRow[] }>(
    `/api/hrm/payroll/payslips/${encodeURIComponent(payslipId)}/lines?${search.toString()}`,
    { method: "GET" },
    { timeoutMs: PAYROLL_HRM_TIMEOUT_MS },
  );
}

/** F-PAY-PAYSLIP-01 — GET /payroll/payslips/:id · include_segments default true */
export async function getPayrollPayslipById(
  payslipId: string,
  params: { company_id: string; include_segments?: boolean },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.include_segments === false) search.set("include_segments", "false");
  return requestHrm<HrmPayslipDetail>(
    `/api/hrm/payroll/payslips/${encodeURIComponent(payslipId)}?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-ESS-FE-01
 * change_mode: ADD
 * What: ESS GET/POST /payroll/me/payslips* — list · get by id · confirm (AMIS Step6 GĐ1)
 * Why: Close FE residual after L1 ESS GWC (QC-01)
 * must_keep: L1 API SEAL · own-only 403 · CEO 403 · F5 after confirm · payroll_e2e_ready=false · U65 · no FE formula
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-ESS-FE-02
 * change_mode: FIX
 * What: ESS scope opts — normalize company_id (preserve holding) + x-company-id aligned; no coerce→main
 * Why: D-PAY-ESS-FE-SCOPE-COERCE — query/header main + holding JWT → 409 SCOPE_CONTEXT_MISMATCH
 * must_keep: L1 SEAL · CEO main 403 · payroll_e2e_ready=false · U65
 */
export type HrmEssPayslipRow = {
  id: string;
  company_id?: string;
  period_id?: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  gross_amount: string | number;
  deduction_amount: string | number;
  net_amount: string | number | null;
  currency?: string;
  status: string;
  period_label: string;
  ess_confirmed?: boolean;
  employee_confirmed_at?: string | null;
  employee_confirmed_by?: string | null;
};

/** Align query company_id + x-company-id for ESS (holding JWT must not send main). */
function hrmEssPayslipScopeOpts(companyId: string): RequestHrmOptions {
  const scopedCompanyId = normalizeHrmApiListCompanyId(companyId);
  const tenantId =
    getPortalJwtTenantId() ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("hrm_current_tenant_id") : null) ||
    (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("hrm_current_tenant_id") : null) ||
    HRM_MASTER_TENANT_ID;
  return {
    scope: {
      tenantId,
      companyId: scopedCompanyId,
    },
  };
}

export type HrmEssPayslipLine = {
  id: string;
  payslip_id?: string;
  component_code: string;
  amount: string | number;
  sign?: string;
  source_ref?: string | null;
  source_tier?: string | null;
  sort_order?: number;
};

export type HrmEssPayslipDetail = HrmEssPayslipRow & {
  components?: HrmEssPayslipLine[];
  lines?: HrmEssPayslipLine[];
};

export async function listMyPayslips(params: { company_id: string; period_id?: string }) {
  const scopedCompanyId = normalizeHrmApiListCompanyId(params.company_id);
  const search = new URLSearchParams();
  search.set("company_id", scopedCompanyId);
  if (params.period_id) search.set("period_id", params.period_id);
  return requestHrm<{ total: number; data: HrmEssPayslipRow[] }>(
    `/api/hrm/payroll/me/payslips?${search.toString()}`,
    { method: "GET" },
    hrmEssPayslipScopeOpts(scopedCompanyId),
  );
}

export async function getMyPayslipById(payslipId: string, companyId: string) {
  const scopedCompanyId = normalizeHrmApiListCompanyId(companyId);
  const search = new URLSearchParams();
  search.set("company_id", scopedCompanyId);
  return requestHrm<HrmEssPayslipDetail>(
    `/api/hrm/payroll/me/payslips/${payslipId}?${search.toString()}`,
    { method: "GET" },
    hrmEssPayslipScopeOpts(scopedCompanyId),
  );
}

/** POST confirm — Nest may return 201 (OBS-NEST-POST-201); treat 2xx as success. */
export async function confirmMyPayslip(payslipId: string, companyId: string) {
  const scopedCompanyId = normalizeHrmApiListCompanyId(companyId);
  const search = new URLSearchParams();
  search.set("company_id", scopedCompanyId);
  return requestHrm<HrmEssPayslipDetail>(
    `/api/hrm/payroll/me/payslips/${payslipId}/confirm?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
    hrmEssPayslipScopeOpts(scopedCompanyId),
  );
}

export async function getPayrollReconciliationSummary(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<{ draft: number; processed: number; closed: number }>(
    `/api/hrm/payroll/reports/reconciliation?${search.toString()}`,
    { method: "GET" },
  );
}

export type HrmJobRequisitionStatus =
  | "open"
  | "closed"
  | "on_hold"
  | "draft"
  | "pending_approval"
  | "approved"
  | "rejected"
  /** O3 normative receivable after full approve (UC-BP-REC-02/02b). */
  | "open_for_hire"
  | "cancelled";

/** Wave-2 YCTD — in_plan | out_of_plan (NULL = O4 legacy unclassified). */
export type HrmJobRequisitionHeadcountMode = "in_plan" | "out_of_plan";

/** Wave-2 — API enum new|replace (paper replacement → replace). */
export type HrmJobRequisitionHireReason = "new" | "replace";

/** F-REC-YCTD-04 — flags on YCTD (REC-03 Campaign DENY). + REC-04 internal_scan_* (O2). */
export type HrmJobRequisitionPipelineFlags = {
  posted?: boolean;
  has_cv?: boolean;
  interview_started?: boolean;
  cv_intake_allowed?: boolean;
  posted_at?: string | null;
  has_cv_at?: string | null;
  interview_started_at?: string | null;
  /** UC-BP-REC-04 / F-REC-CV-SCAN — display-ready from BE (VAL-21). */
  internal_scan_done?: boolean;
  internal_scan_skipped?: boolean;
  internal_scan_at?: string | null;
  internal_scan_skip_reason?: string | null;
};

export type HrmJobRequisition = {
  id: string;
  company_id: string;
  title: string;
  department: string;
  employment_type: string;
  /** FR-HRM-RC-01 / G-RC-01 — số lượng cần tuyển (≥1); not job_postings.headcount. */
  headcount: number;
  status: HrmJobRequisitionStatus;
  job_description?: string | null;
  requirements?: string | null;
  /** Soft FK physical — ONE column (PO-HRM-JD-YCTD-REF). */
  job_template_id?: string | null;
  /** Alias of job_template_id (API AV-YCTD-JD-ALIAS) — same id value. */
  job_description_id?: string | null;
  /** Display-ready from soft FK join (F-YCTD-JD-05) — survive F5. */
  jd_code?: string | null;
  jd_title?: string | null;
  /** Optional human code for picker label (F-REC-UV-YCTD-01). */
  code?: string | null;
  /** Lane A UV count — compare/picker disambiguation under Group CEO rollup. */
  candidate_count?: number | null;
  /** Position SoT derived for UV bind (F-REC-UV-YCTD-02) — never free-text. */
  position_key?: string | null;
  position_name?: string | null;
  /** Settings `job_grades` code (AC-SET-CONSUMER-JG-REC-01). */
  job_grade_key?: string | null;
  /** Logical alias of id (API AV-UV-YCTD-ALIAS) — same value as id when exposed. */
  recruitment_request_id?: string | null;
  /** XBOS WF instance — BR-REC-WF-08 lock when set + non-terminal. */
  workflow_instance_id?: string | null;
  /** Wave-2 — in_plan | out_of_plan; NULL = O4 classify required. */
  headcount_mode?: HrmJobRequisitionHeadcountMode | null;
  headcount_cell_id?: string | null;
  target_month?: string | null;
  recruitment_plan_id?: string | null;
  hire_reason?: HrmJobRequisitionHireReason | null;
  replace_employee_id?: string | null;
  out_of_plan_reason?: string | null;
  approval_matrix_key?: string | null;
  pipeline_flags?: HrmJobRequisitionPipelineFlags | null;
  /** O4 — BE warn when mode NULL. */
  classification_required?: boolean | null;
  /** out_of_plan LONG+BOD display hint. */
  requires_bod?: boolean | null;
  rejected_reason?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * F-YCTD-JD-02 preview contract — title + short; NOT full values_json SoT on YCTD.
 * @see docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md §3.2
 */
export type HrmYctdJdPreview = {
  job_template_id: string;
  job_description_id?: string;
  code: string;
  title: string;
  short_description: string;
  requirements_preview?: string;
  status: "active";
};

/** Submit/start-pipeline response (data contract §4 + §6 SPAWN-MISSING). */
export type HrmRecruitmentWfSubmitResult = HrmJobRequisition & {
  spawn?: { workflowInstanceId?: string; idempotent?: boolean } | null;
  spawnMissing?: boolean;
};

export type HrmJobDescriptionTemplate = {
  id: string;
  company_id: string;
  code: string;
  title: string;
  /** Catalog SoT (job_titles) — FR-HRM-RC-JD-01 / AC-SET-FS-03. */
  position_code?: string | null;
  /** Display denormalized from catalog label (optional). */
  position_name: string | null;
  job_description: string | null;
  requirements: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** ADD PO-HRM-JD-DYNAMIC — Q6 dynamic values + snapshot (optional until BE lands). */
  values_json?: Record<string, string> | null;
  layout_snapshot_json?: JdLayoutSnapshotV2 | null;
  layout_version?: number | null;
  /** Display-ready sections from F-JD-03 (server-composed). */
  sections?: Array<{
    section?: string;
    group_code?: string;
    label?: string;
    view_style?: string;
    fields: Array<{
      field_key: string;
      label: string;
      value?: string | null;
      field_type?: string;
    }>;
  }> | null;
  /**
   * PO-HRM-MVP-GD1-REC-00 — display-ready lifecycle (API-01 O2).
   * Canonical: draft | active | retired. Bridge slave: is_active.
   */
  status?: "draft" | "active" | "retired" | string | null;
  /** Bridge slave to status (active⇔true; draft|retired⇔false). */
  is_active?: boolean;
  /** Thin list/preview text for YCTD picker (F-YCTD-JD-01/02) — not live values_json. */
  short_description?: string | null;
};

export type HrmRecruitmentCandidate = {
  id: string;
  company_id: string;
  requisition_id: string;
  /** Alias of requisition_id (AV-UV-YCTD-ALIAS) — same id value. */
  recruitment_request_id?: string | null;
  full_name: string;
  email: string;
  source: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  created_at: string;
  updated_at: string;
  /** F-REC-UV-YCTD-05 display-ready — survive F5 (AC-REC-UV-02). */
  yctd_title?: string | null;
  yctd_code?: string | null;
  position_key?: string | null;
  position_name?: string | null;
  position_source?: "yctd" | string | null;
  /** FR-UC-BP-REC-06a — Lane A list projection (display-ready badge). */
  active_interview?: {
    has_active_interview?: boolean | null;
    /** ACTIVE row id — manage cancel/complete/reschedule (AC-REC-IV-06). */
    active_interview_id?: string | null;
    active_interview_status?: string | null;
    active_interview_at?: string | null;
    active_interview_display_time_vi_vn?: string | null;
    active_interview_badge_label?: string | null;
  } | null;
  /** Flat id when BE returns projection columns at row root. */
  active_interview_id?: string | null;
};

export type HrmRecruitmentInterviewStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"
  | "passed"
  | "failed";

export type HrmRecruitmentInterview = {
  id: string;
  company_id: string;
  candidate_id: string;
  scheduled_at: string;
  interviewer: string;
  status: HrmRecruitmentInterviewStatus;
  cancel_reason?: string | null;
  created_at: string;
  updated_at: string;
  /** Display-ready from Lane A list join (optional). */
  candidate_name?: string | null;
  candidate_email?: string | null;
  position?: string | null;
  scheduled_at_display_vi_vn?: string | null;
};

export async function listJobRequisitions(params: {
  company_id: string;
  page?: number;
  page_size?: number;
  /** F-REC-UV-YCTD-01 — picker Thêm UV / So sánh; empty → 200 []. */
  receivable?: boolean;
  /** Alias query open_for_hire (API-01 §6.1). */
  open_for_hire?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  if (params.receivable === true) search.set("receivable", "true");
  if (params.open_for_hire === true) search.set("open_for_hire", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const raw = await requestHrm<{
    total?: number;
    page?: number;
    page_size?: number;
    data?: HrmJobRequisition[];
    items?: HrmJobRequisition[];
  }>(`/api/hrm/recruitment/requisitions?${search.toString()}`, { method: "GET" });
  const data = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
      ? raw.items
      : [];
  return {
    total: raw?.total ?? data.length,
    page: raw?.page ?? params.page ?? 1,
    page_size: raw?.page_size ?? params.page_size ?? data.length,
    data,
  };
}

/**
 * F-REC-CMP-01 — UV + evals by YCTD (AC-REC-CMP-03/05).
 * Query SoT = requisition_id | recruitment_request_id — FORBIDDEN job_posting_id.
 * @see docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md §7.1
 */
export type HrmCompareApplicationItem = {
  candidate_id: string;
  application_id?: string | null;
  full_name: string;
  email?: string | null;
  avatar_url?: string | null;
  position_name?: string | null;
  position_key?: string | null;
  stage?: string | null;
  eval_status?: string | null;
  scores?: Array<{
    criterion_name?: string;
    category?: string;
    actual_score?: number | null;
    required_score?: number;
    weight?: number;
  }> | null;
  result?: string | null;
  recommendation?: string | null;
  weighted_score?: number | null;
  overall_feedback?: string | null;
};

export async function listRecruitmentApplicationsByYctd(params: {
  company_id: string;
  requisition_id?: string;
  recruitment_request_id?: string;
  include?: "evals";
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.requisition_id) search.set("requisition_id", params.requisition_id);
  if (params.recruitment_request_id) {
    search.set("recruitment_request_id", params.recruitment_request_id);
  }
  if (params.include) search.set("include", params.include);
  return requestHrm<{
    total?: number;
    data?: HrmCompareApplicationItem[];
    items?: HrmCompareApplicationItem[];
  }>(`/api/hrm/recruitment/applications?${search.toString()}`, { method: "GET" });
}

/**
 * F-REC-CMP-02 — compare matrix ≤ N (A1). Errors: HRM-REC-CMP-MAX-N · HRM-REC-CMP-YCTD-MIX.
 * @see docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md §7.2
 */
export type HrmCompareMatrixPayload = {
  requisition_id: string;
  recruitment_request_id?: string;
  max_n?: number;
  criteria: Array<{ id?: string; name: string; weight?: number }>;
  rows: Array<{
    candidate_id: string;
    application_id?: string | null;
    full_name?: string;
    eval_status?: string | null;
    scores: Record<string, number | null | undefined>;
    weighted_score?: number | null;
    result?: string | null;
    recommendation?: string | null;
    overall_feedback?: string | null;
  }>;
};

export async function getRecruitmentCompareMatrix(params: {
  company_id: string;
  requisition_id?: string;
  recruitment_request_id?: string;
  candidate_ids: string[];
  application_ids?: string[];
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.requisition_id) search.set("requisition_id", params.requisition_id);
  if (params.recruitment_request_id) {
    search.set("recruitment_request_id", params.recruitment_request_id);
  }
  for (const id of params.candidate_ids) {
    search.append("candidate_ids", id);
  }
  for (const id of params.application_ids ?? []) {
    search.append("application_ids", id);
  }
  return requestHrm<HrmCompareMatrixPayload>(
    `/api/hrm/recruitment/compare?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createJobRequisition(payload: {
  company_id: string;
  title: string;
  department: string;
  employment_type: string;
  /** Required integer ≥1 (FR-HRM-RC-01). */
  headcount: number;
  job_description?: string;
  requirements?: string;
  job_template_id?: string;
  /** Wave-2 UC-BP-REC-02/02b — draft create (status=draft; cấm open bypass). */
  headcount_mode?: HrmJobRequisitionHeadcountMode;
  headcount_cell_id?: string;
  target_month?: string;
  recruitment_plan_id?: string;
  hire_reason?: HrmJobRequisitionHireReason;
  replace_employee_id?: string;
  out_of_plan_reason?: string;
  department_key?: string;
  position_key?: string;
  job_grade_key?: string;
}) {
  return requestHrm<HrmJobRequisition>("/api/hrm/recruitment/requisitions", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

/**
 * List JD templates.
 * YCTD picker MUST pass `bindable: true` (F-YCTD-JD-01) — Hiệu lực only; empty → 200 [].
 * Thư viện JD CRUD keeps full list (omit bindable).
 * Physical path ONLY `/recruitment/job-templates*` — DENY Nest `/rec/job-descriptions` SoT (O1).
 */
export async function listJobDescriptionTemplates(params: {
  company_id: string;
  /** PO-HRM-JD-YCTD-REF — picker SoT (JobPostingsTab được phép pick JD từ REC-JP-JD-LINK-BE-01). */
  bindable?: boolean;
  /** Alias query `for=yctd` (API-01 §3.1). */
  for?: "yctd";
  q?: string;
  /** UC-BP-REC-00 O2 — prefer status= over legacy active= (ALT-03). */
  status?: "draft" | "active" | "retired";
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.bindable === true) search.set("bindable", "true");
  if (params.for) search.set("for", params.for);
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmJobDescriptionTemplate[] }>(
    `/api/hrm/recruitment/job-templates?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * F-YCTD-JD-02 — preview title + short for YCTD create (STATUS/NOT-FOUND from BE).
 */
export async function getJobDescriptionTemplateYctdPreview(
  templateId: string,
  companyId: string,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  search.set("preview", "yctd");
  return requestHrm<HrmYctdJdPreview>(
    `/api/hrm/recruitment/job-templates/${encodeURIComponent(templateId)}?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * F-JD-02 — create always Nháp (P04). FE MUST NOT send status=active / is_active=true.
 * Physical `/recruitment/job-templates` only (O1).
 */
export async function createJobDescriptionTemplate(payload: {
  company_id: string;
  code: string;
  title: string;
  /** Required catalog code from job_titles (BE HRM-REC-JD-POS). */
  position_code: string;
  /** Optional denormalized label. */
  position_name?: string;
  job_description?: string;
  requirements?: string;
  notes?: string;
  /** Q6 — dynamic payload + snapshot v2 (GROUP-ARCH §3.7). */
  values_json?: Record<string, string>;
  layout_snapshot?: JdLayoutSnapshotV2;
  layout_snapshot_json?: JdLayoutSnapshotV2;
  layout_version?: number;
}) {
  return requestHrm<HrmJobDescriptionTemplate>("/api/hrm/recruitment/job-templates", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

/** F-JD-04 PATCH content — must_keep: status/is_active alone cannot publish (use publishJobDescriptionTemplate). */
export async function updateJobDescriptionTemplate(
  templateId: string,
  companyId: string,
  payload: Partial<{
    code: string;
    title: string;
    position_code: string;
    position_name: string;
    job_description: string;
    requirements: string;
    notes: string;
    values_json: Record<string, string>;
    layout_snapshot: JdLayoutSnapshotV2;
    layout_snapshot_json: JdLayoutSnapshotV2;
    layout_version: number;
  }>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobDescriptionTemplate>(
    `/api/hrm/recruitment/job-templates/${encodeURIComponent(templateId)}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

/**
 * F-JD-04 publish — POST …/:id/publish (primary). Nháp → Hiệu lực when required-on-layout PASS.
 * DENY invent PATCH status=active as sole publish path from FE (API-01 §6.4.2).
 */
export async function publishJobDescriptionTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobDescriptionTemplate>(
    `/api/hrm/recruitment/job-templates/${encodeURIComponent(templateId)}/publish?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/** Soft-retire → status=retired (P03). Path DELETE RETAIN; FORBIDDEN hard delete claim. */
export async function deleteJobDescriptionTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string; status?: string; is_active?: boolean }>(
    `/api/hrm/recruitment/job-templates/${encodeURIComponent(templateId)}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/** F-JD-03 — GET by id (scope_parity with list). */
export async function getJobDescriptionTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobDescriptionTemplate>(
    `/api/hrm/recruitment/job-templates/${encodeURIComponent(templateId)}?${search.toString()}`,
    { method: "GET" },
  );
}

/* ─── PO-HRM-JD-DYNAMIC — field / group / pack / rules (GROUP-ARCH §3.6 · ARCH-02 §2) ─── */

export type HrmJdFieldDef = {
  id: string;
  company_id: string;
  field_key: string;
  label: string;
  field_type: string;
  is_required: boolean;
  sort_order: number;
  section_hint?: string | null;
  is_system?: boolean;
  is_active: boolean;
  validation_json?: Record<string, unknown> | null;
};

export type HrmJdGroupDef = {
  id: string;
  company_id: string;
  group_code?: string;
  code?: string;
  label: string;
  kind: string;
  usage: string;
  view_style: string;
  sort_hint?: number;
  sort_order?: number;
  is_active: boolean;
  fields?: Array<{
    field_id: string;
    field_key?: string;
    label?: string;
    field_type?: string;
    sort_order: number;
    is_required?: boolean;
  }>;
};

export type HrmJdDefaultPack = {
  id?: string;
  company_id: string;
  pack_code?: string;
  code?: string;
  label: string;
  status?: string;
  is_system?: boolean;
  group_codes?: string[];
  groups?: Array<{ group_code: string; sort_order: number; label?: string }>;
};

export type HrmJdPackRule = {
  id?: string;
  rule_id?: string;
  company_id?: string;
  priority: number;
  match_type?: string;
  match_value?: string | null;
  pack_id?: string;
  pack_code?: string;
  pack_label?: string;
  condition_json?: Record<string, unknown>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

/**
 * Client-facing resolve result — `groups` always populated after normalize
 * (API live body uses `always_on_groups`; see PO-HRM-JD-DYNAMIC-FE-03).
 */
export type HrmJdPackResolveResult = {
  pack_code: string;
  pack_label?: string | null;
  resolved_from_rule_id?: string | null;
  groups: JdSnapshotGroup[];
  optional_groups?: JdSnapshotGroup[];
};

export type HrmJdFormLayoutDefault = {
  id?: string;
  company_id?: string;
  name?: string;
  is_default?: boolean;
  status?: string;
  items: Array<{
    field_id: string;
    field_key: string;
    label: string;
    field_type: string;
    is_required?: boolean;
    section?: string;
    sort_order: number;
    is_system?: boolean;
  }>;
};

function unwrapItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const o = payload as { items?: unknown; data?: unknown };
    if (Array.isArray(o.items)) return o.items as T[];
    if (Array.isArray(o.data)) return o.data as T[];
  }
  return [];
}

export async function listJdFieldDefs(params: { company_id: string; active?: boolean }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.active !== undefined) search.set("active", String(params.active));
  const res = await requestHrm<unknown>(
    `/api/hrm/recruitment/jd-field-defs?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmJdFieldDef>(res) };
}

export async function createJdFieldDef(payload: {
  company_id: string;
  field_key: string;
  label: string;
  field_type: string;
  is_required?: boolean;
  sort_order?: number;
  section_hint?: string;
  validation_json?: Record<string, unknown>;
}) {
  return requestHrm<HrmJdFieldDef>("/api/hrm/recruitment/jd-field-defs", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function updateJdFieldDef(
  id: string,
  companyId: string,
  payload: Partial<{
    label: string;
    is_required: boolean;
    sort_order: number;
    section_hint: string;
    validation_json: Record<string, unknown>;
    is_active: boolean;
  }>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJdFieldDef>(
    `/api/hrm/recruitment/jd-field-defs/${encodeURIComponent(id)}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function archiveJdFieldDef(id: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJdFieldDef>(
    `/api/hrm/recruitment/jd-field-defs/${encodeURIComponent(id)}/archive?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function getJdDefaultFormLayout(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJdFormLayoutDefault>(
    `/api/hrm/recruitment/jd-form-layouts/default?${search.toString()}`,
    { method: "GET" },
  );
}

export async function putJdDefaultFormLayout(payload: {
  company_id: string;
  name?: string;
  items: Array<{ field_id: string; section?: string; sort_order: number }>;
}) {
  return requestHrm<HrmJdFormLayoutDefault>("/api/hrm/recruitment/jd-form-layouts/default", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function listJdGroupDefs(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const res = await requestHrm<unknown>(
    `/api/hrm/recruitment/jd-group-defs?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmJdGroupDef>(res) };
}

export async function createJdGroupDef(payload: {
  company_id: string;
  group_code: string;
  label: string;
  kind: string;
  usage: string;
  view_style: string;
  fields?: Array<{ field_id: string; sort_order: number }>;
}) {
  return requestHrm<HrmJdGroupDef>("/api/hrm/recruitment/jd-group-defs", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function updateJdGroupDef(
  id: string,
  companyId: string,
  payload: Partial<{
    label: string;
    kind: string;
    usage: string;
    view_style: string;
    is_active: boolean;
    fields: Array<{ field_id: string; sort_order: number }>;
  }>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJdGroupDef>(
    `/api/hrm/recruitment/jd-group-defs/${encodeURIComponent(id)}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function listJdDefaultPacks(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const res = await requestHrm<unknown>(
    `/api/hrm/recruitment/jd-default-packs?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmJdDefaultPack>(res) };
}

export async function upsertJdDefaultPack(payload: {
  company_id: string;
  pack_code: string;
  label: string;
  status?: string;
  group_codes: string[];
}) {
  const code = encodeURIComponent(payload.pack_code);
  return requestHrm<HrmJdDefaultPack>(
    `/api/hrm/recruitment/jd-default-packs/${code}`,
    {
      method: "PUT",
      body: JSON.stringify({
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
        pack_code: payload.pack_code,
        label: payload.label,
        status: payload.status ?? "published",
        group_codes: payload.group_codes,
      }),
    },
  );
}

export async function listJdPackRules(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const res = await requestHrm<unknown>(
    `/api/hrm/recruitment/jd-pack-rules?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmJdPackRule>(res) };
}

export async function putJdPackRules(payload: {
  company_id: string;
  rules: HrmJdPackRule[];
}) {
  // FE-RULES-PUT-STRIP — whitelist DTO fields; GET objects include id/company_id/pack_label/…
  const rules = stripJdPackRulesForPut(payload.rules);
  return requestHrm<{ items: HrmJdPackRule[] }>("/api/hrm/recruitment/jd-pack-rules", {
    method: "PUT",
    body: JSON.stringify({
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
      rules,
    }),
  });
}

/** F-JD-RUL-03 / F-JD-RESOLVE-01 — resolve pack for writer (no FE hardcode PACK_*). */
export async function resolveJdPack(params: {
  company_id: string;
  position_code: string;
  job_family?: string;
  employment_type?: string;
  work_mode?: string;
}): Promise<HrmJdPackResolveResult> {
  const raw = await requestHrm<unknown>("/api/hrm/recruitment/jd-pack-rules/resolve", {
    method: "POST",
    body: JSON.stringify({
      company_id: normalizeHrmApiListCompanyId(params.company_id),
      position_code: params.position_code,
      job_family: params.job_family,
      employment_type: params.employment_type,
      work_mode: params.work_mode,
    }),
  });
  // FE-RESOLVE-GROUPS-MAP — API returns always_on_groups; writer consumes groups[]
  const normalized = normalizeJdPackResolveResult(raw);
  return {
    pack_code: normalized.pack_code,
    pack_label: normalized.pack_label,
    resolved_from_rule_id: normalized.resolved_from_rule_id,
    groups: normalized.groups,
    optional_groups: normalized.optional_groups,
  };
}

export async function getJobRequisition(requisitionId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobRequisition>(
    `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function updateJobRequisition(
  requisitionId: string,
  companyId: string,
  payload: {
    status?: HrmJobRequisition["status"];
    headcount?: number;
    /** O4 classify + draft fields — FORBIDDEN client set open_for_hire bypass. */
    headcount_mode?: HrmJobRequisitionHeadcountMode;
    headcount_cell_id?: string | null;
    hire_reason?: HrmJobRequisitionHireReason;
    replace_employee_id?: string | null;
    out_of_plan_reason?: string | null;
    job_template_id?: string | null;
    job_description?: string | null;
    requirements?: string | null;
    job_grade_key?: string | null;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const path = `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}?${search.toString()}`;
  const body = JSON.stringify(payload);
  try {
    return await requestHrm<HrmJobRequisition>(path, { method: "PATCH", body });
  } catch (err: unknown) {
    if (err instanceof ApiClientError && err.status === 404) {
      return requestHrm<HrmJobRequisition>(path, { method: "PUT", body });
    }
    throw err;
  }
}

/**
 * F-REC-YCTD-03 — approve → open_for_hire (BOD gate out_of_plan) / reject + reason.
 * Primary path remains XBOS callback; secondary thin FE transitions for U65 chain.
 */
export async function transitionJobRequisition(
  requisitionId: string,
  companyId: string,
  payload: {
    action: "approve" | "reject";
    comment?: string;
    rejected_reason?: string;
    /** out_of_plan BOD complete signal when bridge requires. */
    bod_complete?: boolean;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobRequisition>(
    `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}/transitions?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

/** F-REC-YCTD-04 — PATCH pipeline flags on YCTD only when receivable (REC-03 DENY). */
export async function patchJobRequisitionPipelineFlags(
  requisitionId: string,
  companyId: string,
  payload: HrmJobRequisitionPipelineFlags,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobRequisition>(
    `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}/pipeline-flags?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

/**
 * F-REC-CV-SCAN-02/03 — complete|skip internal CV pool scan on YCTD (UC-BP-REC-04).
 * Physical only `/api/hrm/recruitment/…` — DENY Nest `/rec` dual · REC-03 Campaign.
 */
export type HrmInternalScanAction = "complete" | "skip";

export type HrmInternalScanPayload = {
  action: HrmInternalScanAction;
  skip_reason?: string;
  hit_count?: number;
  criteria_snapshot?: {
    position_code?: string;
    skill?: string;
    experience?: string;
  };
};

export async function postJobRequisitionInternalScan(
  requisitionId: string,
  companyId: string,
  payload: HrmInternalScanPayload,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobRequisition>(
    `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}/internal-scan?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function listRecruitmentCandidates(params: {
  company_id: string;
  requisition_id?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.requisition_id) search.set("requisition_id", params.requisition_id);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(params.page_size));
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmRecruitmentCandidate[] }>(
    `/api/hrm/recruitment/candidates?${search.toString()}`,
    { method: "GET" },
  );
}

/** Resolve Lane A spine candidate id by email (for scheduleRecruitmentInterview mutate). */
export async function resolveSpineRecruitmentCandidateId(
  companyId: string,
  email: string,
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  const response = await listRecruitmentCandidates({ company_id: companyId, page: 1, page_size: 500 });
  const match = response.data.find((row) => row.email?.trim().toLowerCase() === normalized);
  return match?.id ?? null;
}

export async function createRecruitmentCandidate(payload: {
  company_id: string;
  requisition_id: string;
  full_name: string;
  email: string;
  source: string;
}) {
  return requestHrm<HrmRecruitmentCandidate>("/api/hrm/recruitment/candidates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listRecruitmentInterviews(params: {
  company_id: string;
  candidate_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.candidate_id) search.set("candidate_id", params.candidate_id);
  return requestHrm<{ total: number; data: HrmRecruitmentInterview[] }>(
    `/api/hrm/recruitment/interviews?${search.toString()}`,
    { method: "GET" },
  );
}

export async function scheduleRecruitmentInterview(payload: {
  company_id: string;
  candidate_id: string;
  scheduled_at: string;
  interviewer: string;
}) {
  return requestHrm<HrmRecruitmentInterview>("/api/hrm/recruitment/interviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * F-REC-IV-02 — confirm / cancel / complete / no_show (Lane A physical only).
 * DENY catalog / Nest `/rec` dual as FR-06a SoT.
 */
export async function updateRecruitmentInterviewStatus(
  interviewId: string,
  payload: {
    status: HrmRecruitmentInterviewStatus;
    cancel_reason?: string;
  },
  companyId?: string,
) {
  const search = new URLSearchParams();
  if (companyId) search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const qs = search.toString();
  return requestHrm<HrmRecruitmentInterview>(
    `/api/hrm/recruitment/interviews/${interviewId}/status${qs ? `?${qs}` : ""}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * F-REC-IV-03 R-A — PATCH scheduled_at (± interviewer) on same ACTIVE id.
 * DENY POST create as reschedule path.
 */
export async function rescheduleRecruitmentInterview(
  interviewId: string,
  payload: {
    scheduled_at: string;
    interviewer?: string;
  },
  companyId?: string,
) {
  const search = new URLSearchParams();
  if (companyId) search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const qs = search.toString();
  return requestHrm<HrmRecruitmentInterview>(
    `/api/hrm/recruitment/interviews/${interviewId}${qs ? `?${qs}` : ""}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export type HrmJobPostingRow = {
  owner_id?: string;
  owner_name?: string;
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  /** E1-A catalog code (job_titles); snapshot in `position`. */
  position_key?: string | null;
  department_key?: string | null;
  position: string;
  employment_type: string;
  work_location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_salary_visible: boolean;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  headcount: number;
  applied_count: number;
  status: string;
  deadline: string | null;
  priority: string;
  created_at: string;
  updated_at: string;
  /** REC-JP-JD-LINK-BE-01 — FK to job_description_templates (nullable). */
  jd_template_id?: string | null;
  /** JD template catalog code (from JOIN). */
  jd_code?: string | null;
  /** JD template title (from JOIN). */
  jd_title?: string | null;
  /** COALESCE(jd_snapshot_json, jdt.values_json) — values at link time or current. */
  jd_content?: Record<string, unknown> | null;
};

export type HrmCandidatePoolRow = {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  stage: string;
  source: string | null;
  applied_date: string | null;
  notes: string | null;
  /** Soft hire link — FR-HRM-INT-01 / G-DB-01 (required when stage=hired). */
  employee_id?: string | null;
  /** XBOS candidate pipeline instance — lock stage PATCH when active. */
  workflow_instance_id?: string | null;
  /** Soft FK YCTD (F-REC-UV-YCTD-05) — ONE physical requisition_id. */
  requisition_id?: string | null;
  recruitment_request_id?: string | null;
  yctd_title?: string | null;
  yctd_code?: string | null;
  position_key?: string | null;
  position_name?: string | null;
  position_source?: "yctd" | string | null;
  /** Legacy remnant — not SoT for FR-05a. */
  position?: string | null;
  /** FR-UC-BP-REC-06a projection — display-ready badge fields from BE. */
  has_active_interview?: boolean | null;
  active_interview_id?: string | null;
  active_interview_status?: string | null;
  active_interview_at?: string | null;
  active_interview_display_time_vi_vn?: string | null;
  active_interview_badge_label?: string | null;
  active_interview?: {
    has_active_interview?: boolean | null;
    active_interview_id?: string | null;
    active_interview_status?: string | null;
    active_interview_at?: string | null;
    active_interview_display_time_vi_vn?: string | null;
    active_interview_badge_label?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
};

export type HrmCandidatePipelineStartResult = HrmCandidatePoolRow & {
  spawn?: { workflowInstanceId?: string; idempotent?: boolean } | null;
  spawnMissing?: boolean;
};

export type HrmCandidateApplicationRow = {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  company_id: string;
  applied_date: string | null;
  stage: string;
  rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmRecruitmentPlanPositionRow = {
  id: string;
  department_id: string;
  company_id: string;
  name: string;
  /** Catalog SoT when EFF>0 (F-REC-HC-01 · VAL-REC-HC-03). */
  position_key?: string | null;
  months_data: unknown;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type HrmRecruitmentPlanDepartmentRow = {
  id: string;
  plan_id: string;
  company_id: string;
  name: string;
  /** Catalog SoT when EFF>0 (F-REC-HC-01 · VAL-REC-HC-02). */
  department_key?: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  positions?: HrmRecruitmentPlanPositionRow[];
};

export type HrmRecruitmentPlanRow = {
  id: string;
  company_id: string;
  title: string;
  start_month: number;
  end_month: number;
  year: number;
  note: string | null;
  status: string;
  creator_name: string | null;
  workflow_instance_id?: string | null;
  submitted_by_dept_key?: string | null;
  created_at: string;
  updated_at: string;
  departments?: HrmRecruitmentPlanDepartmentRow[];
};

export type HrmRecruitmentPlanWfSubmitResult = HrmRecruitmentPlanRow & {
  spawn?: { workflowInstanceId?: string; idempotent?: boolean } | null;
  spawnMissing?: boolean;
};

/** F-REC-HC-05 · BR-BP-HC-04 — POST …/spawn-requests */
export type HrmRecruitmentPlanSpawnResult = {
  created: Array<{
    requisition_id: string;
    headcount_cell_id: string;
    headcount: number;
    target_month: string;
  }>;
  skipped_duplicate: Array<{
    headcount_cell_id: string;
    existing_requisition_id: string;
  }>;
  blocked?: Array<{ reason_code: string; message: string }>;
  drift_warnings?: Array<{
    headcount_cell_id: string;
    cell_need_hire: number;
    yctd_headcount: number;
    code: string;
  }>;
};

export async function listJobPostings(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmJobPostingRow[] }>(
    `/api/hrm/recruitment/job-postings?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createJobPosting(payload: {
  company_id: string;
  title: string;
  position: string;
  /** E1-A — catalog code SoT (required when Vị trí shown). */
  position_key?: string;
  department?: string;
  department_key?: string;
  employment_type?: string;
  work_location?: string;
  salary_min?: number;
  salary_max?: number;
  is_salary_visible?: boolean;
  description?: string;
  requirements?: string;
  benefits?: string;
  headcount?: number;
  deadline?: string;
  priority?: string;
  status?: string;
  /** REC-JP-JD-LINK-BE-01 — optional JD template UUID to link to this posting. */
  jd_template_id?: string;
}) {
  return requestHrm<HrmJobPostingRow>("/api/hrm/recruitment/job-postings", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function deleteJobPosting(jobPostingId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/job-postings/${jobPostingId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/** F-REC-CV-SCAN-01 — pool list (+ optional YCTD internal-scan criteria). */
export async function listCandidatesPool(params: {
  company_id: string;
  stage?: string;
  requisition_id?: string;
  for?: "internal_scan";
  position_code?: string;
  position?: string;
  q_position?: string;
  skill?: string;
  q_skill?: string;
  experience?: string;
  experience_min_years?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.stage) search.set("stage", params.stage);
  if (params.requisition_id) search.set("requisition_id", params.requisition_id);
  if (params.for) search.set("for", params.for);
  if (params.position_code) search.set("position_code", params.position_code);
  if (params.position) search.set("position", params.position);
  if (params.q_position) search.set("q_position", params.q_position);
  if (params.skill) search.set("skill", params.skill);
  if (params.q_skill) search.set("q_skill", params.q_skill);
  if (params.experience) search.set("experience", params.experience);
  if (
    params.experience_min_years != null &&
    Number.isFinite(params.experience_min_years)
  ) {
    search.set("experience_min_years", String(params.experience_min_years));
  }
  return requestHrm<{ total: number; data: HrmCandidatePoolRow[] }>(
    `/api/hrm/recruitment/candidates-pool?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createCandidatePool(payload: {
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  /**
   * @deprecated FR-UC-BP-REC-05a — do not send free-text position as SoT.
   * Prefer requisition_id + optional position_key matching YCTD.
   */
  position?: string | null;
  source?: string | null;
  stage?: string;
  /** FR-HRM-INT-01 — bắt buộc khi stage=hired. */
  employee_id?: string | null;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  /** F-REC-UV-YCTD-03 — required for FR-05a create (BR-BP-CV-03). */
  requisition_id?: string | null;
  /** Alias of requisition_id — same id; do not send conflicting dual. */
  recruitment_request_id?: string | null;
  /** Optional — must match YCTD or BE returns POSITION-MISMATCH. */
  position_key?: string | null;
}) {
  return requestHrm<HrmCandidatePoolRow>("/api/hrm/recruitment/candidates", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateCandidatePool(
  candidateId: string,
  companyId: string,
  payload: Partial<{
    full_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    source: string | null;
    stage: string;
    /** FR-HRM-INT-01 / G-DB-01 — soft hire link when stage=hired. */
    employee_id: string | null;
    rating: number | null;
    applied_date: string | null;
    expected_start_date: string | null;
    nationality: string | null;
    hometown: string | null;
    marital_status: string | null;
    notes: string | null;
  }>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmCandidatePoolRow>(
    `/api/hrm/recruitment/candidates-pool/${candidateId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteCandidatePool(candidateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/candidates-pool/${candidateId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function listCandidateApplications(params: {
  company_id: string;
  job_posting_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.job_posting_id) search.set("job_posting_id", params.job_posting_id);
  return requestHrm<{ total: number; data: HrmCandidateApplicationEnriched[] }>(
    `/api/hrm/recruitment/candidate-applications?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listRecruitmentPlans(companyId: string, year?: number) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  if (year != null && Number.isFinite(year)) search.set("year", String(year));
  return requestHrm<{ total: number; data: HrmRecruitmentPlanRow[] }>(
    `/api/hrm/recruitment/recruitment-plans?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     Tuyển dụng → Dashboard / Reports (recruitment)
 * UC:         UC-BP-REC-08 · FR-UC-BP-REC-08
 * BR:         O1–O10 · BR-REC-08-BE-FORMULA · DENY FE aggregate
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-08 Diễn biến #1–#3
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md F-REC-DASH-01/02 §7
 * Purpose:    Client GET Nest display-ready dashboard DTO — FE bind only (no KH/%/ETA formula).
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    useRecruitmentNestDashboard · useReportsData
 * Callees:    GET /api/hrm/recruitment/dashboard*
 * FEActions:  filter kỳ → GET → bind KPIs/funnel/YCTD drill
 * Impact:     Dual /rec path or FE formula = FAIL O1/O8/SOLID 25 §3.1
 * must_keep:  Physical /recruitment/dashboard* · paper /rec = alias only · C&B omit · U65
 * SOLID:      Transport SRP — no domain aggregation
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-fe-01.md
 */
export type HrmRecDashFunnelKey = "cv" | "screening" | "interview" | "offer" | "onboard";

export type HrmRecDashEnoughPeopleStatus = "no_plan" | "enough" | "in_progress" | "at_risk";

export type HrmRecDashFunnel = Record<HrmRecDashFunnelKey, number>;

export type HrmRecDashEmptyGuide = {
  code: string;
  title: string;
  body: string;
  cta_hint: string;
};

export type HrmRecDashYctdRow = {
  requisition_id: string;
  title: string;
  status: string;
  headcount_mode: string | null;
  mode_warn: boolean;
  headcount: number;
  filled_count: number;
  in_pipeline_count: number;
  remaining: number;
  target_month: string | null;
  headcount_cell_id: string | null;
  department_key: string | null;
  position_key: string | null;
  company_id: string;
};

export type HrmRecDashMonthSlice = {
  month: string;
  planned_need: number;
  filled_count: number;
  in_pipeline_count: number;
  gap_count: number;
  completion_pct: number | null;
};

export type HrmRecDashOrgUnitSlice = {
  company_id: string;
  department_key: string | null;
  label: string;
  planned_need: number;
  filled_count: number;
  in_pipeline_count: number;
  gap_count: number;
  completion_pct: number | null;
};

export type HrmRecruitmentDashboardDto = {
  period: { year: number | null; from: string | null; to: string | null };
  scope?: { company_ids: string[]; rollup: boolean };
  planned_need: number;
  filled_count: number;
  in_pipeline_count: number;
  open_yctd_count: number;
  gap_count: number;
  completion_pct: number | null;
  enough_people_status: HrmRecDashEnoughPeopleStatus | string;
  enough_people_eta: string | null;
  enough_people_eta_label: string;
  funnel: HrmRecDashFunnel;
  funnel_labels: Record<HrmRecDashFunnelKey, string>;
  by_month: HrmRecDashMonthSlice[];
  by_org_unit: HrmRecDashOrgUnitSlice[];
  by_yctd: HrmRecDashYctdRow[];
  empty_guide: HrmRecDashEmptyGuide | null;
  total?: number;
  page?: number;
  page_size?: number;
};

export type HrmRecruitmentDashboardQuery = {
  company_id: string;
  year?: number;
  from?: string;
  to?: string;
  department_key?: string;
  position_key?: string;
  include?: "yctd";
  page?: number;
  page_size?: number;
};

function buildRecruitmentDashboardSearch(params: HrmRecruitmentDashboardQuery): URLSearchParams {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.year != null && Number.isFinite(params.year)) search.set("year", String(params.year));
  if (params.from?.trim()) search.set("from", params.from.trim());
  if (params.to?.trim()) search.set("to", params.to.trim());
  if (params.department_key?.trim()) search.set("department_key", params.department_key.trim());
  if (params.position_key?.trim()) search.set("position_key", params.position_key.trim());
  if (params.include === "yctd") search.set("include", "yctd");
  if (params.page != null && Number.isFinite(params.page)) search.set("page", String(params.page));
  if (params.page_size != null && Number.isFinite(params.page_size)) {
    search.set("page_size", String(params.page_size));
  }
  return search;
}

/** F-REC-DASH-01 — summary (+ optional by_yctd when include=yctd). */
export async function getRecruitmentDashboard(params: HrmRecruitmentDashboardQuery) {
  const search = buildRecruitmentDashboardSearch(params);
  return requestHrm<HrmRecruitmentDashboardDto>(
    `/api/hrm/recruitment/dashboard?${search.toString()}`,
    { method: "GET" },
  );
}

/** F-REC-DASH-02 — YCTD drill (same scope/period as summary). */
export async function getRecruitmentDashboardYctd(params: HrmRecruitmentDashboardQuery) {
  const search = buildRecruitmentDashboardSearch(params);
  return requestHrm<HrmRecruitmentDashboardDto>(
    `/api/hrm/recruitment/dashboard/yctd?${search.toString()}`,
    { method: "GET" },
  );
}

/** F-REC-HC-01 GET by id — U19 scope_parity with list. */
export async function getRecruitmentPlan(planId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecruitmentPlanRow>(
    `/api/hrm/recruitment/recruitment-plans/${encodeURIComponent(planId)}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function updateRecruitmentPlanStatus(
  planId: string,
  companyId: string,
  status: string,
  rejectedReason?: string,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const body: { status: string; rejected_reason?: string } = { status };
  if (rejectedReason?.trim()) body.rejected_reason = rejectedReason.trim();
  return requestHrm<HrmRecruitmentPlanRow>(
    `/api/hrm/recruitment/recruitment-plans/${planId}/status?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

/** UC-HRM-REC-WF-02 — spawn plan approval (U65 FE path). */
export async function submitRecruitmentPlanWorkflow(planId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecruitmentPlanWfSubmitResult>(
    `/api/hrm/recruitment/recruitment-plans/${encodeURIComponent(planId)}/submit-workflow?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * F-REC-HC-05 — Auto spawn YCTD from approved need_hire cells (BR-BP-HC-04).
 * Physical: POST /api/hrm/recruitment/recruitment-plans/:planId/spawn-requests
 */
export async function spawnRecruitmentPlanRequests(
  planId: string,
  companyId: string,
  body?: { dry_run?: boolean; cell_ids?: string[] },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecruitmentPlanSpawnResult>(
    `/api/hrm/recruitment/recruitment-plans/${encodeURIComponent(planId)}/spawn-requests?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body ?? {}) },
  );
}

/** UC-HRM-REC-WF-02 — spawn requisition approval (U65 FE path). */
export async function submitJobRequisitionWorkflow(requisitionId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecruitmentWfSubmitResult>(
    `/api/hrm/recruitment/requisitions/${encodeURIComponent(requisitionId)}/submit-workflow?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/** UC-HRM-REC-WF-04 — start candidate pipeline (U65 FE path). */
export async function startCandidatePipeline(candidateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmCandidatePipelineStartResult>(
    `/api/hrm/recruitment/candidates-pool/${encodeURIComponent(candidateId)}/start-pipeline?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export type HrmInsuranceRatePeriodRow = {
  id: string;
  effective_from: string;
  effective_to?: string | null;
  period_status?: string;
  status?: string;
  /** R-CORE-10-DISP — optional BE envelope; FE-derive when absent. */
  statusLabelVi?: string | null;
  status_label_vi?: string | null;
  contribution?: number | null;
  employer_contribution?: number | null;
  employee_amount?: number | null;
  employer_amount?: number | null;
  suspend_reason?: string | null;
};

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Optional statusLabelVi on enrollment/period DTO (FE-derive prefer · HOLD schema)
 * Why: R-CORE-10-DISP · API-01 CONFIRMED RETAIN · Nest /core DENY
 * must_keep: physical /employee-insurances* · CORE-09/07 seals · U65 · honesty false
 */
export type HrmEmployeeInsuranceRow = {
  id: string;
  /** BE-02 / contracts-insurance parity — equals id when present. */
  enrollment_id?: string;
  employee_id: string;
  company_id: string;
  type: string;
  provider: string;
  policy_number: string | null;
  start_date: string | null;
  end_date: string | null;
  contribution: number;
  employer_contribution: number;
  status: string;
  /** R-CORE-10-DISP — optional; FE derives BH «Hoạt động» from status=active when absent. */
  statusLabelVi?: string | null;
  status_label_vi?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  /** F-CORE-SI-02 display-ready periods (when BE exposes). */
  periods?: HrmInsuranceRatePeriodRow[];
};

/**
 * F-CORE-SI-03 — POST action body; FE pass-through only (no formulas).
 * Aligns InsuranceActionDto — company_id required in JSON body.
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-04
 * change_mode: FIX
 * What: Payload + POST merge company_id into body; employee_amount/employer_amount wire names
 * Why: R-EMP-SI-ACTION-COMPANY-ID-BODY — query-only company_id → 400 HRM-VAL-001
 * must_keep: query company_id optional keep; no apps/api; U65
 */
export type HrmInsuranceTimelineActionPayload = {
  company_id: string;
  action: 'close' | 'stop' | 'suspend' | 'change_rate' | 'resume';
  effective_from: string;
  suspend_reason?: string;
  employee_amount?: number;
  employer_amount?: number;
  change_reason?: string;
};

export type HrmInsuranceActionResult = {
  enrollment?: HrmEmployeeInsuranceRow;
  periods?: HrmInsuranceRatePeriodRow[];
} & Partial<HrmEmployeeInsuranceRow>;

/** F-CORE-HTP-05 display-ready. */
export type HrmHireReadiness = {
  employee_id: string;
  company_id: string;
  profile_ok: boolean;
  active_contract: { contract_id: string; status: string } | null;
  ready_for_payroll: boolean;
  blockers: string[];
};

export async function listEmployeeInsurances(params: { company_id: string; employee_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<{ total: number; data: HrmEmployeeInsuranceRow[] }>(
    `/api/hrm/employee-insurances?${search.toString()}`,
    { method: "GET" },
  );
}

/** F-CORE-SI-02 — get-by-id includes display-ready periods[]. */
export async function getEmployeeInsurance(insuranceId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmEmployeeInsuranceRow>(
    `/api/hrm/employee-insurances/${encodeURIComponent(insuranceId)}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeInsurance(payload: {
  company_id: string;
  employee_id: string;
  type?: string;
  provider: string;
  policy_number?: string;
  start_date?: string;
  end_date?: string;
  contribution?: number;
  employer_contribution?: number;
  status?: string;
  notes?: string;
}) {
  return requestHrm<HrmEmployeeInsuranceRow>("/api/hrm/employee-insurances", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateEmployeeInsurance(
  insuranceId: string,
  payload: Partial<{
    company_id: string;
    type: string;
    provider: string;
    policy_number: string;
    start_date: string;
    end_date: string;
    contribution: number;
    employer_contribution: number;
    status: string;
    notes: string;
  }>,
) {
  return requestHrm<HrmEmployeeInsuranceRow>(`/api/hrm/employee-insurances/${insuranceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeInsurance(insuranceId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/employee-insurances/${insuranceId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/**
 * F-CORE-SI-03 — Đóng / Ngừng / Tạm hoãn / Đổi mức / Tiếp tục.
 * Physical: POST /api/hrm/employee-insurances/:id/actions (BE-01 peer).
 * Body must include company_id (InsuranceActionDto); query kept for scope filters.
 */
export async function postEmployeeInsuranceAction(
  insuranceId: string,
  companyId: string,
  payload: HrmInsuranceTimelineActionPayload,
) {
  const scopedCompanyId = normalizeHrmApiListCompanyId(companyId);
  const search = new URLSearchParams();
  search.set("company_id", scopedCompanyId);
  const body: HrmInsuranceTimelineActionPayload = {
    ...payload,
    company_id: (payload.company_id ?? "").trim() || scopedCompanyId,
  };
  return requestHrm<HrmInsuranceActionResult>(
    `/api/hrm/employee-insurances/${encodeURIComponent(insuranceId)}/actions?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

/**
 * F-CORE-HTP-05 — Hire-to-Pay bước 5 readiness read-model.
 * Physical: GET /api/hrm/employees/:id/hire-readiness (BE-01 peer).
 */
export async function getEmployeeHireReadiness(employeeId: string, companyId: string) {
  return requestHrm<HrmHireReadiness>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/hire-readiness?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export type HrmEmployeeBenefitRow = {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  category: string;
  value: number;
  unit: string | null;
  frequency: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export async function listEmployeeBenefits(params: { company_id: string; employee_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<{ total: number; data: HrmEmployeeBenefitRow[] }>(
    `/api/hrm/employee-benefits?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeBenefit(payload: {
  company_id: string;
  employee_id: string;
  name: string;
  category?: string;
  value: number;
  unit?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  description?: string;
}) {
  return requestHrm<HrmEmployeeBenefitRow>("/api/hrm/employee-benefits", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateEmployeeBenefit(
  benefitId: string,
  payload: Partial<{
    company_id: string;
    name: string;
    category: string;
    value: number;
    unit: string;
    frequency: string;
    start_date: string;
    end_date: string;
    status: string;
    description: string;
  }>,
) {
  return requestHrm<HrmEmployeeBenefitRow>(`/api/hrm/employee-benefits/${benefitId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeBenefit(benefitId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/employee-benefits/${benefitId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmEmployeeKpiRow = {
  id: string;
  employee_id: string;
  company_id: string;
  kpi_name: string;
  kpi_type: string | null;
  target_value: number | null;
  actual_value: number | null;
  unit: string | null;
  weight: number | null;
  period_start: string | null;
  period_end: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listEmployeeKpis(params: { company_id: string; employee_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<{ total: number; data: HrmEmployeeKpiRow[] }>(
    `/api/hrm/employee-kpis?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeKpi(payload: {
  company_id: string;
  employee_id: string;
  kpi_name: string;
  kpi_type?: string;
  target_value?: number;
  actual_value?: number | null;
  unit?: string;
  weight?: number;
  period_start?: string;
  period_end?: string;
  status?: string;
  notes?: string;
}) {
  return requestHrm<HrmEmployeeKpiRow>("/api/hrm/employee-kpis", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function deleteEmployeeKpi(kpiId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(`/api/hrm/employee-kpis/${kpiId}?${search.toString()}`, {
    method: "DELETE",
  });
}

export type HrmSalaryTemplateRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  is_default: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function listSalaryTemplates(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmSalaryTemplateRow[] }>(
    `/api/hrm/payroll/salary-templates?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createSalaryTemplate(payload: {
  company_id: string;
  code: string;
  name: string;
  description?: string;
  is_default?: boolean;
}) {
  return requestHrm<HrmSalaryTemplateRow>("/api/hrm/payroll/salary-templates", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateSalaryTemplate(
  templateId: string,
  payload: {
    company_id: string;
    code?: string;
    name?: string;
    description?: string;
    is_default?: boolean;
    status?: string;
  },
) {
  return requestHrm<HrmSalaryTemplateRow>(`/api/hrm/payroll/salary-templates/${templateId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSalaryTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/salary-templates/${templateId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /settings — Mẫu bảng lương (AMIS GĐ1)
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-TPL-01..06
 * BR:         pack≠mẫu · OV-C FK · soft-delete · scope_parity
 * SRS:        docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md §5
 * API_DESIGN: F-PAY-SHEET-TPL-LIST/UPSERT/LINES/ARCHIVE (+ optional bind)
 * Purpose:    Wire `/api/hrm/payroll/pay-sheet-templates*` — display-ready; không FE net / không formula engine.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
 * Coded:      2026-08-07
 * Callers:    PaySheetTemplateSettingsPanel
 * Callees:    requestHrm · normalizeHrmApiListCompanyId · unwrapItems
 * must_keep:  payroll_e2e_ready=false · cấm merge /salary-templates* as mẫu · cấm DnD
 * solid_convention_ack: FE–BE — pass-through DTO camelCase từ Nest; amounts chỉ từ BE process
 * LastVerified: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-fe-01.md
 */
export type HrmPaySheetTemplateStatus = "draft" | "active" | "retired";

export type HrmPaySheetTemplateLine = {
  id: string;
  templateId: string;
  companyId: string;
  componentId: string;
  componentCode: string;
  displayLabel: string | null;
  sortOrder: number;
  groupKey?: string | null;
  isVisible?: boolean;
  isIdentityOrTotal?: boolean;
  formulaOverrideDefinitionId: string | null;
  inputMethod?: string | null;
  systemDataMappingId?: string | null;
  formulaOverrideJson?: Record<string, unknown> | null;
  formulaOverrideCode?: string | null;
  formulaOverrideVersion?: number | null;
  archivedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type HrmPaySheetTemplateRecord = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  description: string | null;
  status: HrmPaySheetTemplateStatus | string;
  isDefault: boolean;
  applicabilityScope: string;
  ouId?: string | null;
  positionKey?: string | null;
  employeeId?: string | null;
  archivedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  lines?: HrmPaySheetTemplateLine[];
};

export type CreatePaySheetTemplatePayload = {
  company_id: string;
  code: string;
  name: string;
  description?: string;
  status?: HrmPaySheetTemplateStatus | string;
  isDefault?: boolean;
  applicabilityScope?: string;
  ouId?: string;
  positionKey?: string;
  employeeId?: string;
};

export type UpdatePaySheetTemplatePayload = {
  company_id: string;
  code?: string;
  name?: string;
  description?: string | null;
  status?: HrmPaySheetTemplateStatus | string;
  isDefault?: boolean;
  applicabilityScope?: string;
  ouId?: string | null;
  positionKey?: string | null;
  employeeId?: string | null;
};

export type PutPaySheetTemplateLineInput = {
  componentId: string;
  displayLabel?: string | null;
  sortOrder: number;
  groupKey?: string | null;
  isVisible?: boolean;
  isIdentityOrTotal?: boolean;
  formulaOverrideDefinitionId?: string | null;
  inputMethod?: string | null;
  systemDataMappingId?: string | null;
  formulaOverrideJson?: Record<string, unknown> | null;
};

export async function listPaySheetTemplates(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_lines?: boolean;
  active_only?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status?.trim()) search.set("status", params.status.trim());
  if (params.include_archived !== undefined) {
    search.set("include_archived", String(params.include_archived));
  }
  if (params.include_lines !== undefined) {
    search.set("include_lines", String(params.include_lines));
  }
  if (params.active_only !== undefined) {
    search.set("active_only", String(params.active_only));
  }
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ items?: HrmPaySheetTemplateRecord[] } | HrmPaySheetTemplateRecord[]>(
    `/api/hrm/payroll/pay-sheet-templates?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmPaySheetTemplateRecord>(res) };
}

export async function getPaySheetTemplate(
  templateId: string,
  companyId: string,
  opts?: { include_lines?: boolean },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  if (opts?.include_lines) search.set("include_lines", "true");
  return requestHrm<HrmPaySheetTemplateRecord>(
    `/api/hrm/payroll/pay-sheet-templates/${templateId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createPaySheetTemplate(payload: CreatePaySheetTemplatePayload) {
  return requestHrm<HrmPaySheetTemplateRecord>("/api/hrm/payroll/pay-sheet-templates", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function updatePaySheetTemplate(
  templateId: string,
  payload: UpdatePaySheetTemplatePayload,
) {
  return requestHrm<HrmPaySheetTemplateRecord>(
    `/api/hrm/payroll/pay-sheet-templates/${templateId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...payload,
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
      }),
    },
  );
}

export async function listPaySheetTemplateLines(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const res = await requestHrm<
    | { templateId: string; lines: HrmPaySheetTemplateLine[] }
    | HrmPaySheetTemplateLine[]
  >(`/api/hrm/payroll/pay-sheet-templates/${templateId}/lines?${search.toString()}`, {
    method: "GET",
  });
  if (Array.isArray(res)) return { templateId, lines: res };
  return {
    templateId: res.templateId ?? templateId,
    lines: Array.isArray(res.lines) ? res.lines : [],
  };
}

export async function putPaySheetTemplateLines(
  templateId: string,
  payload: { company_id: string; lines: PutPaySheetTemplateLineInput[] },
) {
  return requestHrm<{ templateId: string; lines: HrmPaySheetTemplateLine[] }>(
    `/api/hrm/payroll/pay-sheet-templates/${templateId}/lines`,
    {
      method: "PUT",
      body: JSON.stringify({
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
        lines: payload.lines,
      }),
    },
  );
}

export async function archivePaySheetTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPaySheetTemplateRecord>(
    `/api/hrm/payroll/pay-sheet-templates/${templateId}/archive?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/** Optional period bind — low-blast helper; Settings panel may skip UX. */
export async function bindPaySheetTemplateToPeriod(
  periodId: string,
  payload: { company_id: string; paySheetTemplateId: string },
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/periods/${periodId}/bind-sheet-template`,
    {
      method: "POST",
      body: JSON.stringify({
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
        paySheetTemplateId: payload.paySheetTemplateId,
      }),
    },
  );
}

export type HrmContractRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  /** Nest list/create — SoT display/search code when present (CI-01 F5). */
  contract_code?: string | null;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "terminated";
  /** R-CORE-09-DISP-01 — optional display-ready VI (ABSENT OK → FE-derive). */
  statusLabelVi?: string | null;
  status_label_vi?: string | null;
  status_label?: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
  department_key?: string | null;
  position?: string | null;
  position_key?: string | null;
  signer_position?: string | null;
  signer_position_key?: string | null;
  /** F5 / CD-FB-08 — link to compensation package (salary deprecated on body). */
  compensation_package_id?: string | null;
  /** LEGAL-PRINT EXPAND — denorm last issued pack (nullable until print save). */
  pack_code?: string | null;
  template_id?: string | null;
  /** Frozen on create/print — may be omitted on older list SELECT; prefer with template_id. */
  template_code?: string | null;
  term_type?: string | null;
  work_location?: string | null;
  job_description_text?: string | null;
  /** PO-HRM-CTR-CREATE-REDESIGN — registry list/get parity. */
  subject_type?: 'candidate' | 'employee' | string | null;
  candidate_id?: string | null;
  candidate_name?: string | null;
  candidate_label?: string | null;
  contract_abstract?: string | null;
  signing_date?: string | null;
  signed_at?: string | null;
  contract_name?: string | null;
  notes?: string | null;
  work_arrangement?: string | null;
  work_form_label_vi?: string | null;
  salary_ratio_percent?: number | null;
  /** PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01 — GET detail view-shell (read-only). */
  clause_ids?: string[] | null;
  print_overlay_clause_ids?: string[] | null;
  clause_layout?: HrmContractClauseLayoutItem[] | null;
  can_issue?: boolean | null;
  preview_summary?: HrmContractPreviewSummary | null;
};

/** Display-ready clause row from GET contract detail (Settings SoT — read-only on wire). */
export type HrmContractClauseLayoutItem = {
  id: string;
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  mandatory: boolean;
  sort_order: number;
};

/** Lightweight issue gate from GET detail — same predicate as POST preview. */
export type HrmContractPreviewSummary = {
  pack_code?: string | null;
  template_code?: string | null;
  missing_fields?: Array<{ field: string; message?: string }>;
  missing_clauses?: Array<{ code: string; title_vi?: string } | string>;
};

export type HrmInsuranceRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: "active" | "expired" | "cancelled";
  created_at: string;
  updated_at: string;
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
  social_insurance_number?: string | null;
  health_insurance_number?: string | null;
  unemployment_insurance_number?: string | null;
  social_insurance_rate?: number | null;
  health_insurance_rate?: number | null;
  unemployment_insurance_rate?: number | null;
  base_salary?: number | null;
  effective_date?: string | null;
};

export type HrmEmployeeRecord = {
  id: string;
  company_id: string;
  /** Plane A / ĐVTV display when BE-HRM-EMP-COMPANY-COL-01 enriches list/get. */
  company_display_name?: string | null;
  /** Optional alias some payloads may use for the same SoT. */
  company_name?: string | null;
  employee_code: string;
  email: string;
  full_name: string;
  /** OS 28 display-ready name when BE flattens. */
  display_name?: string | null;
  job_title_key: string | null;
  job_title_label?: string | null;
  department?: string | null;
  /** Direct manager UUID (FR-UC-H01 / FR-UC-H03 L1). */
  manager_id?: string | null;
  /** Optional display-ready manager label when BE denormalizes (U72). */
  manager_label?: string | null;
  manager_name?: string | null;
  manager_display_name?: string | null;
  /** Open employment-status catalog — HOLD RETAIN spine pending_docs|active (CORE-07). */
  status: string;
  status_label?: string | null;
  /** Display-ready VI label (O11) — prefer over status_label when present. */
  statusLabelVi?: string | null;
  status_label_vi?: string | null;
  /** F-CORE-ACT-01 / R-CORE-07-GATE-01 display-ready (may be omitted until BE wire). */
  can_activate?: boolean | null;
  canActivate?: boolean | null;
  checklist_complete?: boolean | null;
  checklistComplete?: boolean | null;
  blocking_items?: Array<{
    documentTypeKey?: string;
    document_type_key?: string;
    nameVi?: string;
    name_vi?: string;
    status?: string;
  }> | null;
  blockingItems?: Array<{
    documentTypeKey?: string;
    document_type_key?: string;
    nameVi?: string;
    name_vi?: string;
    status?: string;
  }> | null;
  /** EFF display — typed col HOLD invent; null → «—». */
  activated_at?: string | null;
  activatedAt?: string | null;
  hired_at: string | null;
  archived_at: string | null;
  /** REC→EMP trace (BR-CTR-CREATE-08 banner when null on contract create). */
  candidate_id?: string | null;
  avatar_url?: string | null;
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
};

/**
 * @CODE-MEMORY
 * Screen:     Employees list / export / archive walk (HRM API client)
 * UC:         UC-HRM-20 / UC-HRM-21 · J-HRM-02 export
 * BR:         BR-HRM-SCOPE-LIST
 * SRS:        docs/hrm/SRS.md §Employees list
 * TechSpec:   docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md §5.4 Cursor
 * Purpose:    GET /employees list page + keyset cursor; listAllEmployees walks next_cursor
 *             for export/archive only (never dashboard tiles — use getEmployeesSummary).
 * WorkItem:   C-P1-HRM-PERF-02-CURSOR-FE
 * Coded:      2026-07-20
 * Callers:    Employees.tsx export/archive · useEmployeesPage (listEmployees only)
 * Callees:    GET /api/hrm/employees · GET /api/hrm/employees/summary
 * FEActions:  Export/Archive dialog open → listAllEmployees → cursor walk
 * Impact:     Deep OFFSET page=N>5 storm on ~1k NV export if cursor walk regresses
 * must_keep:  Dashboard getEmployeesSummary (FE-04); table listEmployees page=1; pickers capped
 * SOLID:      SRP — transport only; no UI state
 * LastVerified: hooks/c-p1-hrm-perf-02-cursor-fe.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 C-P1-HRM-PERF-02-CURSOR-FE
 *   Replace OFFSET page+=1 walk with next_cursor keyset (BE CD-FB-05 READY).
 *   listEmployees accepts optional cursor; response includes next_cursor.
 */

export type HrmEmployeeListPage = {
  total: number;
  page: number;
  page_size: number;
  /** Opaque keyset cursor for the next page; null/absent when exhausted (CD-FB-05). */
  next_cursor?: string | null;
  data: HrmEmployeeRecord[];
};

export async function listEmployees(params: {
  company_id: string;
  keyword?: string;
  status?: string;
  include_archived?: boolean;
  page?: number;
  page_size?: number;
  /** When set, BE uses keyset pagination and ignores `page` (CD-FB-05). */
  cursor?: string;
  scope?: HrmSpreadsheetScope;
}): Promise<HrmEmployeeListPage> {
  const search = buildListSearchParams(params);
  return requestHrm<HrmEmployeeListPage>(`/api/hrm/employees?${search.toString()}`, {
    method: "GET",
    scope: params.scope,
  });
}

export type HrmEmployeeSummary = {
  company_id: string;
  total: number;
  active_count: number;
  inactive_count: number;
  archived_count: number;
  payroll: {
    total: number;
    employees_with_salary: number;
  };
  by_department: Array<{
    department: string;
    count: number;
    avg_salary: number | null;
  }>;
  salary_ranges: Array<{
    key: string;
    min: number;
    max: number | null;
    count: number;
  }>;
  new_hires: {
    last_30_days: number;
    recent: Array<{
      id: string;
      employee_code: string;
      full_name: string;
      status: string;
      hired_at: string | null;
      avatar_url: string | null;
    }>;
  };
  /**
   * Optional per-operating-slug headcounts (D-HRM-CO-EMP-COUNT-BE-01).
   * When present, CompanyManagement enrich prefers this over N× summary calls.
   */
  by_company?: Array<{
    company_id: string;
    total: number;
    active_count?: number;
  }>;
  /** Tenant-only scope rollup (HRM-TENANT-ONLY-SCOPE). */
  by_tenant?: Array<{
    tenant_id: string;
    total: number;
    active_count?: number;
    inactive_count?: number;
    archived_count?: number;
  }>;
};

/** P1-HRM-PERF-BE-01 — dashboard aggregates (HRM-EMP-SUMMARY-200). must_keep FE-04. */
export async function getEmployeesSummary(params: {
  company_id: string;
  keyword?: string;
  status?: string;
  include_archived?: boolean;
}): Promise<HrmEmployeeSummary> {
  const search = buildListSearchParams(params);
  return requestHrm<HrmEmployeeSummary>(`/api/hrm/employees/summary?${search.toString()}`, {
    method: "GET",
  });
}

/**
 * Full export/archive walk via keyset `next_cursor` (no deep OFFSET `page=N>5`).
 * Dashboard must NOT call this — use getEmployeesSummary (P1-HRM-PERF-FE-04).
 */
export async function listAllEmployees(params: {
  company_id: string;
  keyword?: string;
  status?: string;
  include_archived?: boolean;
  page_size?: number;
}): Promise<{ total: number; data: HrmEmployeeRecord[] }> {
  const all: HrmEmployeeRecord[] = [];
  let cursor: string | undefined;
  let total = 0;
  const pageSize = clampHrmPageSize(params.page_size ?? HRM_API_MAX_PAGE_SIZE);
  // Safety: ~1k NV / 100 ≈ 12 pages; hard cap prevents runaway if BE misbehaves.
  const maxPages = 500;
  for (let i = 0; i < maxPages; i += 1) {
    const res = await listEmployees({
      company_id: params.company_id,
      keyword: params.keyword,
      status: params.status,
      include_archived: params.include_archived,
      page_size: pageSize,
      ...(cursor ? { cursor } : {}),
    });
    total = res.total ?? all.length;
    const batch = res.data ?? [];
    all.push(...batch);
    const next = res.next_cursor?.trim() || null;
    if (!next || batch.length === 0) break;
    if (next === cursor) break;
    cursor = next;
  }
  return { total, data: all };
}

function setListCompanyId(search: URLSearchParams, companyId: string) {
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
}

function buildListSearchParams(
  params: Record<string, string | number | boolean | undefined | null>,
): URLSearchParams {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "page_size") {
      search.set(key, String(clampHrmPageSize(Number(value))));
      return;
    }
    if (key === "company_id" && typeof value === "string") {
      setListCompanyId(search, value);
      return;
    }
    search.set(key, String(value));
  });
  return search;
}

/** Scope fallback for embed J-HRM-02 — main first, then other company_ids. */
export async function getEmployeeById(
  employeeId: string,
  companyIds: string[],
): Promise<HrmEmployeeRecord | null> {
  const id = employeeId.trim();
  if (!id) return null;

  const scopes = [
    ...new Set(
      [...companyIds]
        .filter(Boolean)
        .map((c) => normalizeHrmApiListCompanyId(c))
        .sort((a, b) => {
          if (a === "main") return -1;
          if (b === "main") return 1;
          return 0;
        }),
    ),
  ];

  let lastError: unknown;
  for (const companyId of scopes) {
    const search = new URLSearchParams();
    setListCompanyId(search, companyId);
    try {
      const res = await fetch(
        `${HRM_API_ORIGIN}/api/hrm/employees/${encodeURIComponent(id)}?${search.toString()}`,
        { method: "GET", headers: await headers() },
      );
      const { data, envelope } = await parseHrmJson<HrmEmployeeRecord>(res);
      if (data?.id?.toLowerCase() === id.toLowerCase()) {
        return data;
      }
      return data ?? null;
    } catch (err: unknown) {
      lastError = err;
      if (err instanceof ApiClientError) {
        const status = err.status ?? 0;
        if (status === 400 || status === 404 || status === 409) continue;
      }
      throw err;
    }
  }

  if (lastError instanceof ApiClientError && (lastError.status === 404 || lastError.status === 409)) {
    return null;
  }
  return null;
}

export async function createEmployee(payload: {
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key?: string;
  hired_at?: string;
  avatar_url?: string | null;
  /** FR-UC-H01 / R-SPINE-MGR-HIER-01 — QL trực tiếp (nullable). */
  manager_id?: string | null;
  /** F-EMP-ST-CNS-01 — Nest status_key when EFF>0 (HRM-EMP-STATUS-KEY). */
  status?: string;
  /** F-EMP-ST-CNS-02 — Nest reason_key when requires_reason / STR EFF (HRM-EMP-STATUS-REASON-KEY). */
  status_reason_key?: string | null;
  custom_fields?: Record<string, string>;
}) {
  return requestHrm<HrmEmployeeRecord>("/api/hrm/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEmployee(employeeId: string, payload: {
  email?: string;
  full_name?: string;
  job_title_key?: string;
  hired_at?: string;
  avatar_url?: string | null;
  /** FR-UC-H01 / R-SPINE-MGR-HIER-01 — QL trực tiếp (null clears). */
  manager_id?: string | null;
  /** F-EMP-ST-CNS-01 — Nest status_key when EFF>0 (HRM-EMP-STATUS-KEY). */
  status?: string;
  /** F-EMP-ST-CNS-02 — Nest reason_key when requires_reason / STR EFF (HRM-EMP-STATUS-REASON-KEY). */
  status_reason_key?: string | null;
  /**
   * R-CORE-07-EFF-01 — only when gated activate via PATCH alt (status=active + date).
   * Free status PATCH without gate/date ≠ CORE-07 DONE (O5). Prefer activateEmployee POST.
   */
  effective_date?: string;
  custom_fields?: Record<string, string>;
}) {
  return requestHrm<HrmEmployeeRecord>(`/api/hrm/employees/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → CTA «Kích hoạt Hoạt động»
 * UC:         UC-BP-CORE-07 · FR-UC-BP-CORE-07
 * BR:         BR-BP-LC-02 · AC-CORE-07-01/04/05
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-07 Diễn biến #2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md F-CORE-ACT-01
 * Purpose:    POST physical /api/hrm/employees/:id/activate — body effective_date dd/MM/yyyy;
 *             Nest /core DENY; free PATCH ≠ CORE-07 DONE; checklist≠DONE footer on FE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    useEmployeeActivate
 * Callees:    requestHrm · employeeProfileQuery
 * must_keep:  Physical activate path O1 · U19 company_id · U65 · honesty false · C-SLICE
 * LastVerified: poHrmMvpGd1Core07ClusterFe01.source.test.ts
 */
export type HrmEmployeeActivatePayload = {
  /** Locale dd/MM/yyyy (R-CORE-07-EFF-01). */
  effective_date: string;
};

export async function activateEmployee(
  employeeId: string,
  companyId: string,
  payload: HrmEmployeeActivatePayload,
) {
  return requestHrm<HrmEmployeeRecord>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/activate?${employeeProfileQuery(companyId).toString()}`,
    {
      method: "POST",
      body: JSON.stringify({
        effective_date: payload.effective_date,
      }),
    },
  );
}

/**
 * Gated PATCH alternate — same SoT as activateEmployee (API-01 prefer POST).
 * DENY claim free status PATCH alone = FR-07 DONE.
 */
export async function activateEmployeeViaGatedPatch(
  employeeId: string,
  companyId: string,
  payload: HrmEmployeeActivatePayload,
) {
  void companyId; // scope via path + JWT · company_id query optional on profile PATCH AS-IS
  return updateEmployee(employeeId, {
    status: "active",
    effective_date: payload.effective_date,
  });
}

export async function archiveEmployee(employeeId: string) {
  return requestHrm<HrmEmployeeRecord>(`/api/hrm/employees/${employeeId}/archive`, {
    method: "POST",
  });
}

export async function restoreEmployee(employeeId: string) {
  return requestHrm<HrmEmployeeRecord>(`/api/hrm/employees/${employeeId}/restore`, {
    method: "POST",
  });
}

/**
 * F-CORE-DEP-01 — Employee dependents (welfare / quà 1/6).
 * Physical: /api/hrm/employees/:id/dependents* — DENY Nest /core dual SoT.
 * WorkItem: PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01
 */
export type HrmEmployeeDependentRecord = {
  id: string;
  employee_id: string;
  company_id: string;
  full_name: string;
  relation_code: string;
  /** Display-ready from BE — FE MUST NOT invent SoT label. */
  relation_label?: string | null;
  date_of_birth: string;
  is_tax_dependent?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HrmEmployeeDependentWritePayload = {
  full_name: string;
  relation_code: string;
  date_of_birth: string;
  is_tax_dependent?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
};

export async function listEmployeeDependents(
  employeeId: string,
  companyId: string,
  opts?: { include_archived?: boolean },
) {
  const search = employeeProfileQuery(companyId);
  if (opts?.include_archived) search.set("include_archived", "true");
  return requestHrm<HrmEmployeeDependentRecord[]>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/dependents?${search.toString()}`,
    { method: "GET" },
  );
}

export async function getEmployeeDependent(
  employeeId: string,
  dependentId: string,
  companyId: string,
) {
  return requestHrm<HrmEmployeeDependentRecord>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/dependents/${encodeURIComponent(dependentId)}?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeDependent(
  employeeId: string,
  companyId: string,
  payload: HrmEmployeeDependentWritePayload,
) {
  return requestHrm<HrmEmployeeDependentRecord>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/dependents?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeDependent(
  employeeId: string,
  dependentId: string,
  companyId: string,
  payload: Partial<HrmEmployeeDependentWritePayload>,
) {
  return requestHrm<HrmEmployeeDependentRecord>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/dependents/${encodeURIComponent(dependentId)}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

/** Soft-delete — BE sets archived_at (DENY hard-delete sole product path). */
export async function softDeleteEmployeeDependent(
  employeeId: string,
  dependentId: string,
  companyId: string,
) {
  return requestHrm<HrmEmployeeDependentRecord>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/dependents/${encodeURIComponent(dependentId)}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function createEmployeeContract(payload: {
  company_id: string;
  employee_id?: string;
  subject_type?: 'candidate' | 'employee';
  candidate_id?: string;
  requisition_id?: string;
  contract_type: string;
  start_date: string;
  /** Optional for open-ended types (G-CI-01 / FR-HRM-CI-01); omit when empty. */
  end_date?: string;
  contract_code?: string;
  /** E1-A MD-BIND — catalog codes + optional snapshots. */
  position_key: string;
  position?: string;
  department_key?: string;
  department?: string;
  signer_position_key?: string;
  signer_position?: string;
  signer_name?: string;
  /** LEGAL-PRINT overlay — open catalog (any active template). */
  pack_code?: string;
  template_id?: string;
  /** Prefer with template_id — BE freezes template_code on contract row. */
  template_code?: string;
  term_type?: string;
  work_location?: string;
  job_description_text?: string;
  compensation_package_id?: string | null;
  notes?: string;
  signed_at?: string;
  contract_name?: string;
  contract_abstract?: string;
  work_arrangement?: string;
  salary_ratio_percent?: number;
}) {
  return requestHrm<HrmContractRecord>("/api/hrm/contracts-insurance/contracts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createInsuranceRecord(payload: {
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
}) {
  return requestHrm<HrmInsuranceRecord>("/api/hrm/contracts-insurance/insurance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listExpiringContracts(params: { company_id: string; days?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.days) search.set("days", String(params.days));
  return requestHrm<{ total: number; days: number; data: HrmContractRecord[] }>(
    `/api/hrm/contracts-insurance/contracts/expiring?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listExpiringInsurance(params: { company_id: string; days?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.days) search.set("days", String(params.days));
  return requestHrm<{ total: number; days: number; data: HrmInsuranceRecord[] }>(
    `/api/hrm/contracts-insurance/insurance/expiring?${search.toString()}`,
    { method: "GET" },
  );
}

/** BR-INS-01 embed / insurance module list (`GET /api/hrm/contracts-insurance/insurance`). */
export async function listInsuranceRecords(params: {
  company_id: string;
  employee_id?: string;
  status?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{ total: number; page?: number; page_size?: number; data: HrmInsuranceRecord[] }>(
    `/api/hrm/contracts-insurance/insurance?${search.toString()}`,
    { method: "GET" },
  );
}

/** Paginate through full insurance list (BR-INS-01 — matches menu-density total). */
export async function listAllInsuranceRecords(params: {
  company_id: string;
  employee_id?: string;
  status?: string;
}): Promise<{ total: number; data: HrmInsuranceRecord[] }> {
  const all: HrmInsuranceRecord[] = [];
  let page = 1;
  let total = 0;
  const pageSize = clampHrmPageSize();
  for (;;) {
    const res = await listInsuranceRecords({ ...params, page, page_size: pageSize });
    total = res.total ?? all.length;
    const batch = res.data ?? [];
    all.push(...batch);
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }
  return { total, data: all };
}

export async function listEmployeeContracts(params: {
  company_id: string;
  employee_id?: string;
  status?: "active" | "expired" | "terminated";
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.status) search.set("status", params.status);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{ total: number; page?: number; page_size?: number; data: HrmContractRecord[] }>(
    `/api/hrm/contracts-insurance/contracts?${search.toString()}`,
    { method: "GET" },
  );
}

/** Paginate through full contract list for dashboard / reports consumers. */
export async function listAllEmployeeContracts(params: {
  company_id: string;
  employee_id?: string;
  status?: "active" | "expired" | "terminated";
}): Promise<{ total: number; data: HrmContractRecord[] }> {
  const all: HrmContractRecord[] = [];
  let page = 1;
  let total = 0;
  const pageSize = clampHrmPageSize();
  for (;;) {
    const res = await listEmployeeContracts({ ...params, page, page_size: pageSize });
    total = res.total ?? all.length;
    const batch = res.data ?? [];
    all.push(...batch);
    if (batch.length === 0 || all.length >= total) break;
    page += 1;
  }
  return { total, data: all };
}

/** GET-by-id — list/detail scope parity (U19 · D-PO-HRM-CTR-VIEW-SYNC-01).
 * @CODE-MEMORY-CHANGE 2026-08-10 D-PO-HRM-CTR-VIEW-SYNC-01 — view dialog SoT; company_id query; U65
 */
export async function getEmployeeContractById(contractId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractRecord>(
    `/api/hrm/contracts-insurance/contracts/${encodeURIComponent(contractId)}?${search.toString()}`,
    { method: 'GET' },
  );
}

export async function updateEmployeeContract(
  contractId: string,
  payload: Partial<{
    contract_type: string;
    start_date: string;
    end_date: string;
    status: "active" | "expired" | "terminated";
    compensation_package_id?: string | null;
    notes?: string;
    position_key?: string;
    position?: string;
    department_key?: string;
    department?: string;
    signer_position_key?: string;
    signer_position?: string;
    signer_name?: string;
    pack_code?: string | null;
    template_id?: string | null;
    template_code?: string | null;
    term_type?: string | null;
    work_location?: string | null;
    job_description_text?: string | null;
    signed_at?: string | null;
    contract_name?: string | null;
    work_arrangement?: string | null;
    salary_ratio_percent?: number | null;
  }>,
) {
  return requestHrm<HrmContractRecord>(`/api/hrm/contracts-insurance/contracts/${contractId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployeeContract(contractId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/contracts-insurance/contracts/${contractId}`, {
    method: "DELETE",
  });
}

// --- LEGAL-PRINT — clause / template / preview / print-version (DATA-01 §5) ---
/**
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-FE-02
 * What: preview + print-versions POST — company_id query only; body via buildContractPrintMutateRequest
 * Why: QA-01 R-CTR-PREVIEW-COMPANY-ID-BODY — 400 HRM-VAL-001 property company_id should not exist
 * must_keep: clause/template CRUD bodies may still carry company_id; SI action body company_id elsewhere
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * What: HrmContractPreviewResult.missing_fields accepts { field, message }[]; work_location already on create/PATCH
 * Why: R-CTR-PRINT-CAN-ISSUE — FE spine field_overrides + registry work_location
 * must_keep: FE-02 query-only company_id; UF-HRM-02; honesty printable=false
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-FE-05
 * What: ADD contract-library publishes/pull/apply clients; origin* overlay on TPL/CL types; query-only company_id
 * Why: BE-03 READY_FOR_QA · ADR Option A · DATA-02 §7 F-CORE-CTR-PUB/PULL/APPLY
 * must_keep: FE-01 DnD · FE-02 preview · FE-03 work_location paths · no synced_catalogs · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-05.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-FE-03
 * What: Re-verify library clients for PM W7.5 FE-03; origin-star already typed; no body invent
 * Why: FE-03 exit Settings Publish/Pull/Apply · company_id query only
 * must_keep: FE-05 clients · work_location FE-03-A · printable=false · no synced_catalogs
 * solid_convention_ack: display-ready origin-star and publish meta from BE — no FE formula
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-FE-04
 * change_mode: FIX
 * What: Reword CODE-MEMORY — never write star-slash inside block comments (D-CTR-FE-HRMAPI-COMMENT-SWC)
 * Why: QA-03 FAIL — SWC Syntax Error at origin-star-slash-publish closed comment early → hrmApi.ts HTTP 500
 * must_keep: print-spine GWC · UF-HRM-02 · PDF BE-02 · Wave A work_location · FE-01 DnD · PUB/PULL/APPLY · printable=false
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-fe-04.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * change_mode: EXPAND
 * What: Open catalog TPL fields (duration/title/matrix) · matrix=xevn list filter · CFG-01 company-settings · template_code on create/preview
 * Why: BE-01 READY_FOR_QA · DYNAMIC LOCK · AC-CTR-XEVN-11 — cấm hardcode 8-only
 * must_keep: print-spine · Q-CTR · UF-HRM-02 · printable=false · library publish FE-05
 * solid_convention_ack: FE binds display-ready template_code / CFG from BE — no FE invent closed enum
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-EDIT-01
 * change_mode: FIX
 * What: HrmContractRecord.template_code typed for list/detail passthrough (edit F5 restore)
 * Why: R-CTR-XEVN-TPL-FE-EDIT-RESTORE — mapApiContract + handleOpenEdit need display-ready fields
 * must_keep: print-spine · open catalog · printable=false · Q-CTR · UF-HRM-02
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-xevn-tpl-fe-edit-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01
 * change_mode: FIX
 * What: updateContractClause(clauseId, companyId, fields) — company_id query only; PATCH body whitelist DTO
 * Why: QA CLQA-KM4JR3 AC-01 HRM-VAL-001 · peer activate/retire · BE UpdateContractClauseDto @Query company_id
 * must_keep: createContractClause POST body company_id · retire/activate query · printable=false · U65
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-fe-fix-patch-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-SNAPSHOT-BIND-FE-01
 * What: syncContractTemplateClauseBind — PATCH template clause_ids + layout_json for junction bind
 * Why: R-CTR-CL-SNAPSHOT-BIND — issued clauses_snapshot_json needs elem.code from attached clauses
 * must_keep: CLQA2 PATCH · preview/print query-only company_id
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-snapshot-bind-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01
 * What: getContractClause GET-by-id U19 · RETAIN list/create/update/activate/retire physical paths
 * Why: API-01 CONFIRMED · Settings UX residual CORE-09a · DENY Nest /core dual
 * must_keep: company_id query · printable=false · publish/pull ≠ body SoT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09a-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: getContractTemplate U19 · putContractTemplateClauses PUT SoT · sync bind → PUT /clauses
 *       · template.clauses[] display-ready · open catalog RETAIN · matrix=xevn family only
 * Why: API-01 CONFIRMED RETAIN · OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY · UC-BP-CORE-09d U65 residual
 * must_keep: CORE-09c VER/PDF ≠ printable · CORE-09b PACK+PREV · CORE-09a CL · CORE-08/02/01
 *            Nest /core DENY · starter 8 ≠ ceiling · printable=false · no seed
 * solid_convention_ack: FE binds display-ready clauses[] / template_code — no invent closed-8
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-02
 * change_mode: FIX
 * What: updateContractTemplate — company_id query only; PATCH JSON body omits company_id
 * Why: QA-01 R-FE-CORE-09D-PATCH-COMPANY-ID · HRM-VAL-001 · blocks PUT …/clauses on edit (J-03)
 * must_keep: FE-01 PUT clauses SoT · create POST body company_id · J-01/02/04 · Nest /core DENY
 *            printable=false · sealed CORE-09c/09b/09a · U65 no seed
 * solid_convention_ack: scope via query peer UpdateContractTemplateDto — no invent DTO fields
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01
 * change_mode: ADD · preserve_default
 * What: HrmContractRecord statusLabelVi optional (R-CORE-09-DISP-01 FE-derive) ·
 *       PreviewResult merged_fields/can_issue/cb_masked RETAIN · Nest /core DENY
 * Why: UC-BP-CORE-09 parent · API-01 CONFIRMED RETAIN · printable=false
 * must_keep: physical /contracts-insurance/* · 09a–d ≠ DONE · CORE-07 seals · U65
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-09-cluster-fe-01.md
 */

export type HrmContractLibraryOrigin = "member" | "group" | "member_override" | string;

export type HrmContractClauseRecord = {
  id: string;
  company_id: string;
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  apply_to_packs: string[];
  sort_order: number;
  mandatory: boolean;
  status: "draft" | "active" | "retired" | string;
  version: number;
  effective_from?: string | null;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
  /** DATA-02 overlay — display-ready lineage (BE-03). */
  origin?: HrmContractLibraryOrigin;
  origin_company_id?: string | null;
  origin_publish_version?: number | null;
  lineage_code?: string | null;
};

export type HrmContractTemplateRecord = {
  id: string;
  company_id: string;
  code: string;
  /** Display-ready echo of code (BE-01). */
  template_code?: string;
  name_vi: string;
  pack_code: string;
  layout_json: Record<string, unknown> | { clause_ids?: string[] };
  keyword_map: Record<string, unknown>;
  status: "draft" | "active" | "retired" | string;
  version: number;
  default_term_type?: "probation" | "definite" | "indefinite" | string | null;
  default_duration_days?: number | null;
  default_duration_months?: number | null;
  title_print_vi?: string | null;
  matrix_family?: "XEVN_MATRIX" | "LEGACY" | string | null;
  /** Ordered junction clauses from displayTemplate — prefer over layout_json for canvas. */
  clauses?: HrmContractClauseRecord[];
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
  /** DATA-02 overlay — display-ready lineage (BE-03). */
  origin?: HrmContractLibraryOrigin;
  origin_company_id?: string | null;
  origin_publish_version?: number | null;
  lineage_code?: string | null;
};

export type HrmContractCompanySettingRecord = {
  company_id: string;
  setting_key: string;
  value: Record<string, unknown> | null;
  updated_at?: string | null;
};

export type HrmContractLibraryPublishMeta = {
  id: string;
  tenant_id?: string;
  source_company_id: string;
  publish_version: number;
  checksum: string;
  label_vi?: string | null;
  template_count: number;
  clause_count: number;
  pack_rule_count?: number;
  published_at: string;
  published_by?: string | null;
  status: string;
};

export type HrmContractLibraryPublishResult = {
  publish_version: number;
  checksum: string;
  template_count: number;
  clause_count: number;
  pack_rule_count?: number;
  published_at: string;
  label_vi?: string | null;
  id?: string;
};

export type HrmContractLibraryPullResult = {
  publish_version: number;
  company_id: string;
  upserted: string[];
  skipped_override: string[];
  conflicts: string[];
  pack_rules_upserted?: string[];
};

export type HrmContractLibraryApplyResult = {
  publish_version: number;
  company_id: string;
  activated_templates: number;
  activated_clauses: number;
  activated_pack_rules?: number;
  missing_mandatory?: Array<{ code: string; title_vi?: string }>;
  print_versions_mutated: boolean;
};

export type HrmContractPackResolveResult = {
  employee_id?: string;
  job_family?: string | null;
  suggested_pack: string;
  allowed_packs: string[];
  reason?: string | null;
};

export type HrmContractPreviewClause = {
  id?: string;
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  clause_version?: number;
  mandatory?: boolean;
  sort_order?: number;
};

export type HrmContractPreviewMissingField =
  | string
  | { field: string; message?: string; code?: string; title_vi?: string };

export type HrmContractPreviewResult = {
  pack_code: string;
  template_id?: string | null;
  template_code?: string | null;
  sections?: Array<{ title?: string; body?: string; clause_group?: string }>;
  merged_fields?: Record<string, unknown>;
  clauses?: HrmContractPreviewClause[];
  /** BE may return string[] or { field, message }[] (Đ.21 validatePreview). */
  missing_fields?: HrmContractPreviewMissingField[];
  missing_clauses?: Array<string | { code: string; title_vi?: string }>;
  can_issue?: boolean;
  cb_masked?: boolean;
  /** true when pack=DRIVER — FE shows GPLX/plate block (AC-CORE-09B-03). */
  show_driver_license_block?: boolean;
  compensation_snapshot?: Record<string, unknown> | null;
};

export type HrmContractPrintVersionRecord = {
  id: string;
  contract_id: string;
  company_id: string;
  version_no: number;
  pack_code: string;
  template_id?: string | null;
  /** Frozen at issue — display-ready (F-CORE-CTR-VER-02). */
  template_code?: string | null;
  template_version?: number | null;
  status: string;
  issued_at?: string | null;
  issued_by?: string | null;
  pdf_artifact_ref?: string | null;
  merged_fields_json?: Record<string, unknown>;
  clauses_snapshot_json?: unknown;
  compensation_snapshot_json?: unknown;
};

export async function listContractClauses(params: {
  company_id: string;
  status?: string;
  clause_group?: string;
  pack_code?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.clause_group) search.set("clause_group", params.clause_group);
  if (params.pack_code) search.set("pack_code", params.pack_code);
  const res = await requestHrm<unknown>(
    `/api/hrm/contracts-insurance/contract-clauses?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmContractClauseRecord>(res) };
}

/** F-CORE-CTR-CL-01b — U19 get-by-id same scope family as list. */
export async function getContractClause(clauseId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractClauseRecord>(
    `/api/hrm/contracts-insurance/contract-clauses/${clauseId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createContractClause(payload: {
  company_id: string;
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  apply_to_packs: string[];
  sort_order?: number;
  mandatory?: boolean;
  status?: string;
  effective_from?: string | null;
}) {
  return requestHrm<HrmContractClauseRecord>("/api/hrm/contracts-insurance/contract-clauses", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function updateContractClause(
  clauseId: string,
  companyId: string,
  payload: Partial<{
    title_vi: string;
    body_vi: string;
    clause_group: string;
    apply_to_packs: string[];
    sort_order: number;
    mandatory: boolean;
    status: string;
    effective_from: string | null;
  }>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractClauseRecord>(
    `/api/hrm/contracts-insurance/contract-clauses/${clauseId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function activateContractClause(clauseId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractClauseRecord>(
    `/api/hrm/contracts-insurance/contract-clauses/${clauseId}/activate?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function retireContractClause(clauseId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractClauseRecord>(
    `/api/hrm/contracts-insurance/contract-clauses/${clauseId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function listContractTemplates(params: {
  company_id: string;
  status?: string;
  pack_code?: string;
  /** Optional filter matrix_family=XEVN_MATRIX — open catalog, not code IN 8. */
  matrix?: "xevn" | string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.pack_code) search.set("pack_code", params.pack_code);
  if (params.matrix?.trim()) search.set("matrix", params.matrix.trim().toLowerCase());
  const res = await requestHrm<unknown>(
    `/api/hrm/contracts-insurance/contract-templates?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmContractTemplateRecord>(res) };
}

/** F-CORE-CTR-TPL-01b — U19 get-by-id same scope family as list. */
export async function getContractTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractTemplateRecord>(
    `/api/hrm/contracts-insurance/contract-templates/${templateId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createContractTemplate(payload: {
  company_id: string;
  code: string;
  name_vi: string;
  pack_code: string;
  layout_json: Record<string, unknown>;
  keyword_map?: Record<string, unknown>;
  status?: string;
  default_term_type?: string | null;
  default_duration_days?: number | null;
  default_duration_months?: number | null;
  title_print_vi?: string | null;
  matrix_family?: string | null;
  clause_ids?: string[];
}) {
  return requestHrm<HrmContractTemplateRecord>("/api/hrm/contracts-insurance/contract-templates", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
      keyword_map: payload.keyword_map ?? {},
    }),
  });
}

export async function updateContractTemplate(
  templateId: string,
  payload: Partial<{
    company_id: string;
    name_vi: string;
    pack_code: string;
    layout_json: Record<string, unknown>;
    keyword_map: Record<string, unknown>;
    status: string;
    default_term_type: string | null;
    default_duration_days: number | null;
    default_duration_months: number | null;
    title_print_vi: string | null;
    matrix_family: string | null;
    clause_ids: string[];
  }>,
) {
  // R-FE-CORE-09D-PATCH-COMPANY-ID — scope is query only; UpdateContractTemplateDto rejects body company_id.
  const { company_id: scopeCompanyId, ...body } = payload;
  const search = new URLSearchParams();
  if (scopeCompanyId) {
    search.set("company_id", normalizeHrmApiListCompanyId(scopeCompanyId));
  }
  const qs = search.toString();
  return requestHrm<HrmContractTemplateRecord>(
    `/api/hrm/contracts-insurance/contract-templates/${templateId}${qs ? `?${qs}` : ""}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

/**
 * F-CORE-CTR-TPL-02 bind — PUT …/contract-templates/:id/clauses (junction SoT).
 * OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY — Settings IT_OFFICE vs DRIVER distinct packs.
 */
export async function putContractTemplateClauses(
  templateId: string,
  companyId: string,
  clauseIds: readonly string[],
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const clause_ids = clauseIds.map((id) => id.trim()).filter((id) => id.length > 0);
  return requestHrm<HrmContractTemplateRecord>(
    `/api/hrm/contracts-insurance/contract-templates/${templateId}/clauses?${search.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify({ clause_ids }),
    },
  );
}

/**
 * Persist template canvas clause order via PUT /clauses (BE replaceTemplateClauses).
 * Required for preview/issue clauses_snapshot_json to include each clause `code` (AC-PLT-CTR-CL-02).
 * CORE-09d: SoT path is PUT — not PATCH-only layout_json.
 */
export async function syncContractTemplateClauseBind(
  templateId: string,
  companyId: string,
  clauseIds: readonly string[],
) {
  return putContractTemplateClauses(templateId, companyId, clauseIds);
}

/** F-CORE-CTR-CFG-01 — GET company-settings?company_id=&key= */
export async function getContractCompanySetting(params: {
  company_id: string;
  key: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("key", params.key);
  return requestHrm<HrmContractCompanySettingRecord>(
    `/api/hrm/contracts-insurance/company-settings?${search.toString()}`,
    { method: "GET" },
  );
}

/** F-CORE-CTR-CFG-01 — PUT company-settings (org_suffix / number pattern). */
export async function putContractCompanySetting(payload: {
  company_id: string;
  setting_key: string;
  value: Record<string, unknown>;
}) {
  return requestHrm<HrmContractCompanySettingRecord>(
    `/api/hrm/contracts-insurance/company-settings`,
    {
      method: "PUT",
      body: JSON.stringify({
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
        setting_key: payload.setting_key,
        value: payload.value,
      }),
    },
  );
}

export async function activateContractTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmContractTemplateRecord>(
    `/api/hrm/contracts-insurance/contract-templates/${templateId}/activate?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function resolveContractPack(params: {
  company_id: string;
  employee_id: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  return requestHrm<HrmContractPackResolveResult>(
    `/api/hrm/contracts-insurance/contracts/pack-resolve?${search.toString()}`,
    { method: "GET" },
  );
}

export async function previewContractPrint(
  contractId: string,
  payload: {
    company_id: string;
    template_id?: string;
    template_code?: string;
    pack_code?: string;
    field_overrides?: Record<string, unknown>;
    can_view_cb?: boolean;
  },
) {
  // Scope: ?company_id= only — ContractPreviewDto forbids company_id in JSON body (FE-02).
  const { companyIdQuery, body } = buildContractPrintMutateRequest(payload);
  const search = new URLSearchParams();
  search.set("company_id", companyIdQuery);
  return requestHrm<HrmContractPreviewResult>(
    `/api/hrm/contracts-insurance/contracts/${contractId}/preview?${search.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function createContractPrintVersion(
  contractId: string,
  payload: {
    company_id: string;
    template_id?: string;
    template_code?: string;
    pack_code?: string;
    field_overrides?: Record<string, unknown>;
    can_view_cb?: boolean;
  },
) {
  // Scope: ?company_id= only — CreatePrintVersionDto forbids company_id in JSON body (FE-02).
  const { companyIdQuery, body } = buildContractPrintMutateRequest(payload);
  const search = new URLSearchParams();
  search.set("company_id", companyIdQuery);
  return requestHrm<HrmContractPrintVersionRecord>(
    `/api/hrm/contracts-insurance/contracts/${contractId}/print-versions?${search.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

export async function listContractPrintVersions(params: {
  contract_id: string;
  company_id: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const res = await requestHrm<unknown>(
    `/api/hrm/contracts-insurance/contracts/${params.contract_id}/print-versions?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmContractPrintVersionRecord>(res) };
}

/** F-CORE-CTR-VER-02 — get-by-id same U19 scope family as list/create/PDF. */
export async function getContractPrintVersion(params: {
  contract_id: string;
  version_id: string;
  company_id: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  return requestHrm<HrmContractPrintVersionRecord>(
    `/api/hrm/contracts-insurance/contracts/${params.contract_id}/print-versions/${params.version_id}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listContractLibraryPublishes(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const res = await requestHrm<unknown>(
    `/api/hrm/contracts-insurance/contract-library/publishes?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmContractLibraryPublishMeta>(res) };
}

export async function getContractLibraryPublish(params: {
  publish_version: number;
  company_id: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  return requestHrm<HrmContractLibraryPublishMeta & { payload_json?: unknown }>(
    `/api/hrm/contracts-insurance/contract-library/publishes/${params.publish_version}?${search.toString()}`,
    { method: "GET" },
  );
}

/** F-CORE-CTR-PUB-01 — body = { label_vi? }; company_id query only (FE-05). */
export async function publishContractLibrary(payload: {
  company_id: string;
  label_vi?: string;
}) {
  const { companyIdQuery, body } = buildContractLibraryPublishRequest(payload);
  const search = new URLSearchParams();
  search.set("company_id", companyIdQuery);
  return requestHrm<HrmContractLibraryPublishResult>(
    `/api/hrm/contracts-insurance/contract-library/publishes?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

/** F-CORE-CTR-PULL-01 — pull ≠ apply; company_id query only. */
export async function pullContractLibrary(payload: {
  company_id: string;
  publish_version?: number;
  force?: boolean;
}) {
  const { companyIdQuery, body } = buildContractLibraryPullRequest(payload);
  const search = new URLSearchParams();
  search.set("company_id", companyIdQuery);
  return requestHrm<HrmContractLibraryPullResult>(
    `/api/hrm/contracts-insurance/contract-library/pull?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

/** F-CORE-CTR-APPLY-01 — activate group drafts; never mutates print_versions. */
export async function applyContractLibrary(payload: {
  company_id: string;
  publish_version?: number;
}) {
  const { companyIdQuery, body } = buildContractLibraryApplyRequest(payload);
  const search = new URLSearchParams();
  search.set("company_id", companyIdQuery);
  return requestHrm<HrmContractLibraryApplyResult>(
    `/api/hrm/contracts-insurance/contract-library/apply?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

/**
 * F-CORE-CTR-PDF-01 — binary from issued snapshot only (pdfkit).
 * DENY FE invent PDF by re-merging live library; surface VERSION-NOT-ISSUED / PV-404 / RENDER-FAIL.
 */
export async function fetchContractPrintPdf(params: {
  version_id: string;
  company_id: string;
}): Promise<Blob> {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const path = `/api/hrm/contracts-insurance/print-versions/${params.version_id}/pdf?${search.toString()}`;
  const hdrs = await headers({ omitContentType: true });
  const url = HRM_API_ORIGIN ? `${HRM_API_ORIGIN}${path}` : path;
  const res = await fetch(url, {
    method: "GET",
    headers: hdrs,
  });
  if (!res.ok) {
    let body: HrmEnvelope<unknown> | undefined;
    try {
      body = (await res.json()) as HrmEnvelope<unknown>;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiClientError({
      status: res.status,
      code: body?.code ?? "HRM-CTR-RENDER-FAIL",
      message: body?.message ?? `PDF request failed (${res.status})`,
      details: body?.details,
    });
  }
  const blob = await res.blob();
  // Soft magic check — reject empty/non-PDF so FE never treats HTML/JSON as printable.
  const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
  const isPdf =
    head.length >= 4 &&
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46;
  if (!isPdf) {
    throw new ApiClientError({
      status: res.status,
      code: "HRM-CTR-RENDER-FAIL",
      message: "PDF response did not start with %PDF — không dùng bản ghép từ thư viện live.",
    });
  }
  return blob;
}

/** F5 / UC-HRM-CI-08 — compensation line types (base | probation | allowance). */
export type HrmCompensationLineType = "base" | "probation" | "allowance";

export type HrmCompensationLineInput = {
  line_type: HrmCompensationLineType;
  amount: number;
  currency?: string;
  allowance_code?: string;
  /** Soft bind salary_components.code — BR-AMIS-PAY-SRC-02 / emp_cb. */
  component_code?: string;
  taxable?: boolean;
  note?: string;
  sort_order?: number;
};

export type HrmCompensationLineRecord = {
  id: string;
  package_id: string;
  line_type: HrmCompensationLineType;
  amount: number;
  currency: string;
  allowance_code: string | null;
  component_code?: string | null;
  taxable: boolean;
  note: string | null;
  sort_order: number;
  created_at: string;
};

export type HrmCompensationPackageRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_id: string | null;
  version: number;
  supersedes_package_id: string | null;
  effective_from: string;
  effective_to: string | null;
  currency: string;
  change_reason: string | null;
  /** C&B header — bank/MST (CORE-02); never on public EMP DTO. */
  bank_account?: string | null;
  bank_name?: string | null;
  bank_branch?: string | null;
  tax_id?: string | null;
  created_at: string;
  updated_at: string;
  lines: HrmCompensationLineRecord[];
};

/** Bank/MST fields on create/revise (DATA §4 / API-01 F-CORE-EMP-02). */
export type HrmCompensationBankTaxInput = {
  bank_account?: string | null;
  bank_name?: string | null;
  bank_branch?: string | null;
  tax_id?: string | null;
};

export type HrmCompensationHistoryRecord = {
  id: string;
  company_id: string;
  employee_id: string;
  package_id: string;
  previous_package_id: string | null;
  version: number;
  change_reason: string | null;
  snapshot: Record<string, unknown>;
  created_at: string;
};

export async function createCompensationPackage(
  payload: {
    company_id: string;
    employee_id: string;
    effective_from: string;
    effective_to?: string;
    currency?: string;
    change_reason?: string;
    contract_id?: string;
    link_to_contract?: boolean;
    lines: HrmCompensationLineInput[];
  } & HrmCompensationBankTaxInput,
) {
  return requestHrm<HrmCompensationPackageRecord>(
    "/api/hrm/contracts-insurance/compensation-packages",
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function listCompensationPackages(params: {
  company_id: string;
  employee_id?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{
    total: number;
    page: number;
    page_size: number;
    data: HrmCompensationPackageRecord[];
  }>(`/api/hrm/contracts-insurance/compensation-packages?${search.toString()}`, { method: "GET" });
}

export async function getActiveCompensationPackage(params: {
  company_id: string;
  employee_id: string;
  as_of?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  if (params.as_of) search.set("as_of", params.as_of);
  return requestHrm<HrmCompensationPackageRecord | null>(
    `/api/hrm/contracts-insurance/compensation-packages/active?${search.toString()}`,
    { method: "GET" },
  );
}

export async function getCompensationPackageById(packageId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmCompensationPackageRecord>(
    `/api/hrm/contracts-insurance/compensation-packages/${packageId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function reviseCompensationPackage(
  packageId: string,
  companyId: string,
  payload: {
    effective_from: string;
    effective_to?: string;
    currency?: string;
    change_reason?: string;
    lines: HrmCompensationLineInput[];
  } & HrmCompensationBankTaxInput,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmCompensationPackageRecord>(
    `/api/hrm/contracts-insurance/compensation-packages/${packageId}/revise?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function listCompensationHistory(params: {
  company_id: string;
  employee_id?: string;
  package_id?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.package_id) search.set("package_id", params.package_id);
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{
    total: number;
    page: number;
    page_size: number;
    data: HrmCompensationHistoryRecord[];
  }>(`/api/hrm/contracts-insurance/compensation-history?${search.toString()}`, { method: "GET" });
}

export type HrmOperationsTask = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done" | "blocked";
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export async function listOperationsTasks(params: { company_id: string; page?: number; page_size?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.page) search.set("page", String(params.page));
  if (params.page_size) search.set("page_size", String(clampHrmPageSize(params.page_size)));
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmOperationsTask[] }>(
    `/api/hrm/operations/tasks?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createOperationsTask(payload: {
  company_id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  due_date?: string;
}) {
  return requestHrm<HrmOperationsTask>("/api/hrm/operations/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOperationsTaskStatus(taskId: string, payload: {
  status: "todo" | "in_progress" | "done" | "blocked";
}) {
  return requestHrm<HrmOperationsTask>(`/api/hrm/operations/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getOperationsSummary(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{
    attendance_records: number;
    payroll_periods: number;
    job_requisitions: number;
    tasks: number;
  }>(`/api/hrm/operations/reports/summary?${search.toString()}`, {
    method: "GET",
  });
}

export type HrmEmployeeMetadataChangeRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  legal_entity_id: string | null;
  field_key: string;
  current_value: unknown;
  requested_value: unknown;
  reason: string | null;
  actor_user_id: string | null;
  actor_name: string | null;
  workflow_code: string | null;
  source_catalog_key: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  decided_by: string | null;
  decided_note: string | null;
  decided_at: string | null;
  submitted_at: string;
  updated_at: string;
};

export async function listEmployeeMetadataChangeRequests(params: {
  company_id: string;
  employee_id?: string;
  legal_entity_id?: string;
  status?: string;
  field_key?: string;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return requestHrm<{ total: number; page: number; page_size: number; data: HrmEmployeeMetadataChangeRequest[] }>(
    `/api/hrm/employee-metadata/change-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function submitEmployeeMetadataChangeRequest(payload: {
  company_id: string;
  employee_id: string;
  legal_entity_id?: string;
  field_key: string;
  current_value?: unknown;
  requested_value: unknown;
  reason?: string;
  actor_user_id?: string;
  actor_name?: string;
  workflow_code?: string;
  source_catalog_key?: string;
}) {
  /**
   * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-DEV-FE-B2-MD01-SUBMIT-ISJSON
   * Omit optional current_value when absent; serialize requested_value as JSON object for @IsJSON.
   */
  const companyUuid = resolveHrmMetadataCompanyUuid(payload.company_id);
  if (!companyUuid) {
    throw new ApiClientError({
      status: 400,
      code: 'HRM-META-SCOPE',
      message: 'Không xác định được công ty cho yêu cầu metadata',
    });
  }
  const { current_value, ...rest } = payload;
  const body: Record<string, unknown> = {
    ...rest,
    company_id: companyUuid,
    requested_value: serializeMetadataJsonValue(payload.requested_value),
  };
  if (current_value !== null && current_value !== undefined) {
    body.current_value = serializeMetadataJsonValue(current_value);
  }
  return requestHrm<HrmEmployeeMetadataChangeRequest>("/api/hrm/employee-metadata/change-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function approveEmployeeMetadataChangeRequest(
  changeRequestId: string,
  payload?: { actor_user_id?: string; actor_name?: string; note?: string },
  scope?: HrmSpreadsheetScope,
) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/approve`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
    scope ? { scope } : undefined,
  );
}

export async function rejectEmployeeMetadataChangeRequest(
  changeRequestId: string,
  payload?: { actor_user_id?: string; actor_name?: string; note?: string },
  scope?: HrmSpreadsheetScope,
) {
  return requestHrm<HrmEmployeeMetadataChangeRequest>(
    `/api/hrm/employee-metadata/change-requests/${changeRequestId}/reject`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
    scope ? { scope } : undefined,
  );
}

export type HrmAttendanceUpdateRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  attendance_date: string;
  update_type: string;
  current_check_in: string | null;
  current_check_out: string | null;
  requested_check_in: string | null;
  requested_check_out: string | null;
  reason: string;
  evidence_url: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listAttendanceUpdateRequests(params: {
  company_id: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmAttendanceUpdateRequest[] }>(
    `/api/hrm/attendance/update-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceUpdateRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmAttendanceUpdateRequest>("/api/hrm/attendance/update-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-04 U78-U84-ATT-ADJ-TMDV-AP-COMPANY-HEADER-01
 * change_mode: FIX
 * What: approve/reject/delete/update update-requests pass resolveHrmMutateCompanyScope → x-company-id
 * Why: inferRuntimeScope→spreadsheet main rollup → mgr Duyệt 409 SCOPE_CONTEXT_MISMATCH; L1 + trsport → 201
 * must_keep: create ISO body path; list company_id query; spreadsheet catalog main early-return
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-AT12-L1-APPROVE-SCOPE-01
 * change_mode: FIX
 * What: leave approve/reject reuse hrmOuMutateOpts (same mutate scope as ATT update approve)
 * Why: QA AT-12 R3 mgr Duyệt → 409 HRM-LEAVE-409 x-company-id=main vs token trsport
 * must_keep: leave list company_id query; Chờ duyệt CTA; ATT-07; no ceo@ Duyệt invent; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ATT-LEAVE-CANCEL-FE-01
 * change_mode: FIX
 * What: cancelLeaveRequest → POST …/leave-requests/:id/cancel + hrmOuMutateOpts (F-ATT-LEAVE-FUNNEL-02)
 * Why: QC GWC AC-ATT-LV-SHEET-02 — FE cancel/reverse CTA was stub (R-ATT-LV-SHEET-02-FE-CANCEL-STUB)
 * must_keep: approve→materialize; 409 HRM-ATT-SHEET-LOCKED; Option A no Option C; attendance_uat_ready=false; U65
 */
function hrmOuMutateOpts(companyId?: string): RequestHrmOptions | undefined {
  const scope = resolveHrmMutateCompanyScope(companyId);
  return scope ? { scope } : undefined;
}

export async function updateAttendanceUpdateRequest(
  requestId: string,
  payload: Record<string, unknown>,
  companyId?: string,
) {
  return requestHrm<HrmAttendanceUpdateRequest>(
    `/api/hrm/attendance/update-requests/${requestId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    hrmOuMutateOpts(companyId),
  );
}

export async function approveAttendanceUpdateRequest(
  requestId: string,
  payload?: {
    approver_name?: string;
  },
  companyId?: string,
) {
  return requestHrm<HrmAttendanceUpdateRequest>(
    `/api/hrm/attendance/update-requests/${requestId}/approve`,
    {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    },
    hrmOuMutateOpts(companyId),
  );
}

export async function rejectAttendanceUpdateRequest(
  requestId: string,
  payload?: {
    approver_name?: string;
    rejected_reason?: string;
  },
  companyId?: string,
) {
  return requestHrm<HrmAttendanceUpdateRequest>(
    `/api/hrm/attendance/update-requests/${requestId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    },
    hrmOuMutateOpts(companyId),
  );
}

export async function deleteAttendanceUpdateRequest(requestId: string, companyId?: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/attendance/update-requests/${requestId}`,
    {
      method: "DELETE",
    },
    hrmOuMutateOpts(companyId),
  );
}

export type HrmDecideAttendanceRequestPayload = {
  reviewer_name: string;
  reviewer_employee_id?: string;
  rejected_reason?: string;
};

function attendanceRequestListParams(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.employee_id) search.set("employee_id", params.employee_id);
  return search;
}

export type HrmOvertimeRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  overtime_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  overtime_type: string;
  coefficient: number | null;
  reason: string;
  compensation_type: string | null;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  actual_hours: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  accrual?: {
    credited_days: number;
    balance_year: number;
    ledger_id: string;
    idempotent_replay: boolean;
  } | null;
};

export async function listOvertimeRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmOvertimeRequest[] }>(
    `/api/hrm/attendance/overtime-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createOvertimeRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmOvertimeRequest>("/api/hrm/attendance/overtime-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveOvertimeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmOvertimeRequest>(
    `/api/hrm/attendance/overtime-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectOvertimeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmOvertimeRequest>(
    `/api/hrm/attendance/overtime-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteOvertimeRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/overtime-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmBusinessTripRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  purpose: string;
  transportation: string | null;
  accommodation: string | null;
  estimated_cost: number | null;
  advance_amount: number | null;
  companions: string | null;
  contact_info: string | null;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  actual_cost: number | null;
  expense_report_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listBusinessTripRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmBusinessTripRequest[] }>(
    `/api/hrm/attendance/business-trip-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createBusinessTripRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmBusinessTripRequest>("/api/hrm/attendance/business-trip-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveBusinessTripRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmBusinessTripRequest>(
    `/api/hrm/attendance/business-trip-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectBusinessTripRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmBusinessTripRequest>(
    `/api/hrm/attendance/business-trip-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteBusinessTripRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/business-trip-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmLateEarlyRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  request_date: string;
  request_type: string;
  late_time: string | null;
  late_minutes: number | null;
  early_time: string | null;
  early_minutes: number | null;
  reason: string;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listLateEarlyRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmLateEarlyRequest[] }>(
    `/api/hrm/attendance/late-early-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createLateEarlyRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmLateEarlyRequest>("/api/hrm/attendance/late-early-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveLateEarlyRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmLateEarlyRequest>(
    `/api/hrm/attendance/late-early-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectLateEarlyRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmLateEarlyRequest>(
    `/api/hrm/attendance/late-early-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteLateEarlyRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/late-early-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmShiftChangeRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  change_date: string;
  change_type: string;
  current_shift: string;
  current_shift_time: string | null;
  requested_shift: string;
  requested_shift_time: string | null;
  swap_with_employee_id: string | null;
  swap_with_employee_name: string | null;
  swap_with_employee_code: string | null;
  reason: string;
  approver_id: string | null;
  approver_name: string | null;
  status: string;
  approved_at: string | null;
  rejected_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listShiftChangeRequests(params: {
  company_id: string;
  status?: string;
  employee_id?: string;
}) {
  const search = attendanceRequestListParams(params);
  return requestHrm<{ total: number; data: HrmShiftChangeRequest[] }>(
    `/api/hrm/attendance/shift-change-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createShiftChangeRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmShiftChangeRequest>("/api/hrm/attendance/shift-change-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function approveShiftChangeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmShiftChangeRequest>(
    `/api/hrm/attendance/shift-change-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectShiftChangeRequest(
  requestId: string,
  payload: HrmDecideAttendanceRequestPayload,
) {
  return requestHrm<HrmShiftChangeRequest>(
    `/api/hrm/attendance/shift-change-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteShiftChangeRequest(requestId: string) {
  return requestHrm<{ id: string; deleted?: boolean }>(
    `/api/hrm/attendance/shift-change-requests/${requestId}`,
    { method: "DELETE" },
  );
}

export type HrmAdvanceRequest = {
  id: string;
  company_id: string;
  name: string;
  salary_period: string;
  department: string | null;
  position: string | null;
  employee_count: number;
  total_amount: number;
  status: string;
  current_approval_level: number;
  approval_steps: unknown[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmAdvanceRequestEmployee = {
  id: string;
  company_id: string;
  request_id: string;
  employee_id: string | null;
  employee_code: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  advance_amount: number;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export async function listAdvanceRequests(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmAdvanceRequest[] }>(
    `/api/hrm/payroll/advance-requests?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAdvanceRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmAdvanceRequest>("/api/hrm/payroll/advance-requests", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
    }),
  });
}

export async function listAdvanceRequestEmployees(requestId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmAdvanceRequestEmployee[] }>(
    `/api/hrm/payroll/advance-requests/${requestId}/employees?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * F-PAY-ADV-EMP-01 / VAL-INP-ADV-01 — POST NV vào bảng tạm ứng (HRM-ADV-201).
 * company_id query-only; body via buildCreateAdvanceRequestEmployeeBody.
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-FE-01
 */
export async function createAdvanceRequestEmployee(
  requestId: string,
  companyId: string,
  payload: Parameters<typeof buildCreateAdvanceRequestEmployeeBody>[0],
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const body = buildCreateAdvanceRequestEmployeeBody(payload);
  return requestHrm<HrmAdvanceRequestEmployee>(
    `/api/hrm/payroll/advance-requests/${requestId}/employees?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export type HrmDecideAdvanceRequestPayload = {
  reviewer_name: string;
  reviewer_employee_id?: string;
  rejected_reason?: string;
  /** Required by MarkAdvancePaidDto for advance → period input pack bridge. */
  payrollPeriodId?: string;
  componentCode?: string;
};

export async function approveAdvanceRequest(
  requestId: string,
  payload: HrmDecideAdvanceRequestPayload,
) {
  return requestHrm<HrmAdvanceRequest>(
    `/api/hrm/payroll/advance-requests/${requestId}/approve`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function rejectAdvanceRequest(
  requestId: string,
  payload: HrmDecideAdvanceRequestPayload,
) {
  return requestHrm<HrmAdvanceRequest>(
    `/api/hrm/payroll/advance-requests/${requestId}/reject`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function markAdvanceRequestPaid(
  requestId: string,
  payload: HrmDecideAdvanceRequestPayload,
) {
  return requestHrm<HrmAdvanceRequest>(
    `/api/hrm/payroll/advance-requests/${requestId}/mark-paid`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export type HrmLeaveRequest = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string | null;
  employee_name: string | null;
  leave_type: string;
  /** Display-ready leave type VI (optional). */
  leave_type_label?: string | null;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  /** Display-ready VI status (ATT-09 · R-ATT-09-DISP). */
  status_label?: string | null;
  statusLabelVi?: string | null;
  status_label_vi?: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  department: string | null;
  position: string | null;
  total_days: string;
  handover_to: string | null;
  handover_tasks: string | null;
  approver_employee_id: string | null;
  rejected_reason: string | null;
  /** BR-LEAVE-ATT-01 — relative `/api/hrm/files/…` when present. */
  attachment_url?: string | null;
  /** F-ATT-SICK-DAY-BRANCH — sick POST 201 when allocator LIVE (PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01). */
  dayBranches?: Array<{
    calendarDate?: string;
    calendar_date?: string;
    branchCode?: string;
    branch_code?: string;
    deductUnits?: number;
    deduct_units?: number;
    sheetDayCode?: string | null;
    sheet_day_code?: string | null;
  }>;
};

export type HrmAttendanceOverview = {
  stats: {
    lateEarlyToday: number;
    lateEarlyChange: number;
    actualLeaveThisWeek: number;
    actualLeaveChange: number;
    plannedLeaveNextWeek: number;
    plannedLeaveChange: number;
  };
  monthlyLeaveData: Array<{ month: string; value: number }>;
  departmentLeaveData: Array<{ name: string; value: number }>;
  leaveTypeData: Array<{ name: string; value: number; color: string }>;
  lateEarlyList: Array<{ name: string; dept: string; count: number }>;
};

export async function fetchAttendanceOverview(params: { company_id: string; year?: number }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.year != null) search.set("year", String(params.year));
  return requestHrm<HrmAttendanceOverview>(
    `/api/hrm/attendance/overview?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listLeaveRequests(params: { company_id: string; status?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ data: HrmLeaveRequest[] }>(
    `/api/hrm/attendance/leave-requests?${search.toString()}`,
    { method: "GET" },
  );
}

/** GET /attendance/leave-balance — PO-MFD-M2-ATT-WIRE-BALANCE-01 */
export async function fetchLeaveBalance(params: {
  company_id: string;
  employee_id: string;
  leave_type?: string;
  year?: number;
}): Promise<LeaveBalancePayload> {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  if (params.leave_type) search.set("leave_type", params.leave_type);
  if (params.year != null) search.set("year", String(params.year));
  const raw = await requestHrm<unknown>(
    `/api/hrm/attendance/leave-balance?${search.toString()}`,
    { method: "GET" },
  );
  const parsed = parseLeaveBalancePayload(raw);
  if (!parsed) {
    throw new ApiClientError({
      code: "HRM-LEAVE-BAL-PARSE",
      message: "Phản hồi số dư phép không hợp lệ",
      status: 502,
    });
  }
  return parsed;
}

/**
 * GET /attendance/leave-balance/panel — UC-BP-ATT-05b (5 loại MVP / một response).
 * company_id = token scope (slug TEXT). Empty items → zeros hợp lệ phía BE.
 */
export async function fetchLeaveBalancePanel(params: {
  company_id: string;
  employee_id: string;
  year?: number;
}): Promise<LeaveBalancePanelPayload> {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  if (params.year != null) search.set("year", String(params.year));
  const raw = await requestHrm<unknown>(
    `/api/hrm/attendance/leave-balance/panel?${search.toString()}`,
    { method: "GET" },
  );
  const parsed = parseLeaveBalancePanelPayload(raw);
  if (!parsed) {
    throw new ApiClientError({
      code: "HRM-LEAVE-BAL-PANEL-PARSE",
      message: "Phản hồi panel quỹ phép không hợp lệ",
      status: 502,
    });
  }
  return parsed;
}

export type HrmActivateDefaultShiftAssignment = {
  assignmentId: string | null;
  shiftId: string | null;
  shiftCode: string | null;
  shiftName: string | null;
  effectiveFrom: string | null;
  source: string | null;
};

/**
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * change_mode: ADD
 * What: GET …/shift-assignments/activate-default — display-ready ca mặc định profile strip
 * Why: FR-UC-BP-ATT-12 · AC-ATT-12-FE-CONFIRM · F-ATT-SHIFT-02 read peer
 * must_keep: physical /attendance/* · Nest /core DENY · ≠ ATT-12 DONE · U65
 */
export async function fetchActivateDefaultShiftAssignment(params: {
  company_id: string;
  employee_id: string;
}): Promise<HrmActivateDefaultShiftAssignment> {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("employee_id", params.employee_id);
  const raw = await requestHrm<Record<string, unknown>>(
    `/api/hrm/attendance/shift-assignments/activate-default?${search.toString()}`,
    { method: "GET" },
  );
  const row = raw as Record<string, unknown>;
  return {
    assignmentId: (row.assignmentId ?? row.assignment_id ?? null) as string | null,
    shiftId: (row.shiftId ?? row.shift_id ?? null) as string | null,
    shiftCode: (row.shiftCode ?? row.shift_code ?? null) as string | null,
    shiftName: (row.shiftName ?? row.shift_name ?? null) as string | null,
    effectiveFrom: (row.effectiveFrom ?? row.effective_from ?? null) as string | null,
    source: (row.source ?? null) as string | null,
  };
}

export async function createLeaveRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmLeaveRequest>("/api/hrm/attendance/leave-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01
 * change_mode: ADD
 * What: previewLeaveDeduction → POST /attendance/leave-requests/preview-deduction (F-ATT-LEAVE-01)
 * Why: UC-BP-ATT-08 · BR-BP-LV-05 · display-ready deductible_units·working_days·calendar_days
 * must_keep: physical /attendance/* · Nest /core DENY · no fake T6→T2 when ABSENT · U65 · PAY OUT
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md §4
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: RETAIN previewLeaveDeduction physical path — LIVE bind confirmed (BE-01);
 *       R-ATT-08-PREVIEW-FE CLOSED · Nest /core DENY · PAY OUT · printable false
 * Why: FE-02 LIVE · UC-BP-ATT-08
 * must_keep: /attendance/leave-requests/preview-deduction · no Nest /core
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: RETAIN create/approve/reject/cancel + leave-balance/panel physical /attendance/*;
 *       HrmLeaveRequest status_label/statusLabelVi display-ready; Nest /core DENY;
 *       DENY invent att_leave_hold · claim soft/ATT-08=ATT-09 DONE · ATT UAT · CFG=ATT-02.
 * Why: UC-BP-ATT-09 · F-ATT-LEAVE-02/03 · BR-BP-LV-06 · API-01 RETAIN
 * must_keep: ATT08QC1-MSLSL36C preview · ATT02QC1-MSLQZUK7 · PLT/CORE · printable false · PAY OUT · U65
 */
export async function previewLeaveDeduction(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    "/api/hrm/attendance/leave-requests/preview-deduction",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function approveLeaveRequest(
  requestId: string,
  payload: { reviewer_name: string; reviewer_employee_id?: string },
  companyId?: string,
) {
  return requestHrm<HrmLeaveRequest>(
    `/api/hrm/attendance/leave-requests/${requestId}/approve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    hrmOuMutateOpts(companyId),
  );
}

export async function rejectLeaveRequest(
  requestId: string,
  payload: { reviewer_name: string; reviewer_employee_id?: string; rejected_reason?: string },
  companyId?: string,
) {
  return requestHrm<HrmLeaveRequest>(
    `/api/hrm/attendance/leave-requests/${requestId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    hrmOuMutateOpts(companyId),
  );
}

/**
 * F-ATT-LEAVE-FUNNEL-02 / AC-ATT-LV-SHEET-02 — cancel pending or approved;
 * BE reverses attendance leave markers when leaving approved (409 LOCKED if sheet closed).
 */
export async function cancelLeaveRequest(
  requestId: string,
  payload: { reviewer_name: string; reviewer_employee_id?: string; rejected_reason?: string },
  companyId?: string,
) {
  return requestHrm<HrmLeaveRequest>(
    `/api/hrm/attendance/leave-requests/${requestId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    hrmOuMutateOpts(companyId),
  );
}

export type HrmInboxNotification = {
  id: string;
  company_id: string;
  event_type: string;
  payload: unknown;
  recipient_employee_id: string | null;
  read_at: string | null;
  created_at: string;
};

export async function listHrmInboxNotifications(params: {
  company_id: string;
  employee_id: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  search.set("employee_id", params.employee_id);
  if (params.limit != null) search.set("limit", String(params.limit));
  return requestHrm<{ total: number; data: HrmInboxNotification[] }>(
    `/api/hrm/notifications/inbox?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     HRM API client — inbox mark read (HRM-NT-01)
 * UC:         UC-HRM-12 · HRM-NT-01
 * SRS:        docs/hrm/SRS.md · docs/qa/professional/by-uc/HRM-NT-01.md
 * Purpose:    PATCH inbox row read → BE `HRM-NOTIF-202`; viewer_employee_id scope parity mobile
 * WorkItem:   PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01
 * Coded:      2026-08-04
 * must_keep:  listHrmInboxNotifications query params; hrmOuMutateOpts on mutate; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01
 * change_mode: FIX
 * What: mark PATCH query `company_id` = resolveHrmMetadataCompanyUuid(slug|uuid) — MarkInboxReadQueryDto @IsUUID
 * Why: QA R3 — company_id=trsport → 400 HRM-VAL-001; list accepts slug, mark does not
 * must_keep: GET inbox slug list; x-company-id via hrmOuMutateOpts (JWT/OU slug); ceo@ EXPECTED_NO_INBOX; U65 no seed
 */
export type HrmInboxMarkReadResult = {
  id: string;
  company_id: string;
  event_type: string;
  read_at: string;
};

export async function markHrmInboxNotificationRead(
  notificationId: string,
  params: { company_id: string; viewer_employee_id: string },
) {
  const companyUuid = resolveHrmMetadataCompanyUuid(params.company_id);
  if (!companyUuid) {
    throw new Error(
      'company_id phải là UUID hoặc slug công ty hợp lệ để đánh dấu đã đọc',
    );
  }
  const search = new URLSearchParams();
  search.set("company_id", companyUuid);
  return requestHrm<HrmInboxMarkReadResult>(
    `/api/hrm/notifications/inbox/${encodeURIComponent(notificationId)}/read?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify({ viewer_employee_id: params.viewer_employee_id }),
    },
    // Header scope stays OU slug (JWT/hint); query company_id is UUID for MarkInboxReadQueryDto.
    hrmOuMutateOpts(params.company_id),
  );
}

export type HrmServiceRequest = {
  id: string;
  company_id: string;
  service_type: string;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  request_date: string;
  status: string;
  notes: string | null;
  meal_type: string | null;
  meal_date: string | null;
  meal_quantity: number | null;
  vehicle_purpose: string | null;
  vehicle_destination: string | null;
  vehicle_date: string | null;
  vehicle_time_start: string | null;
  vehicle_time_end: string | null;
  vehicle_passengers: number | null;
  supply_items: unknown;
  supply_urgency: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
};

export async function listServiceRequests(params: { company_id: string; service_type?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.service_type) search.set("service_type", params.service_type);
  return requestHrm<HrmServiceRequest[]>(`/api/hrm/operations/service-requests?${search.toString()}`, {
    method: "GET",
  });
}

export async function createServiceRequest(payload: Record<string, unknown>) {
  return requestHrm<HrmServiceRequest>("/api/hrm/operations/service-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateServiceRequest(requestId: string, payload: Record<string, unknown>) {
  return requestHrm<HrmServiceRequest>(`/api/hrm/operations/service-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteServiceRequest(requestId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/operations/service-requests/${requestId}`, {
    method: "DELETE",
  });
}

export async function approveServiceRequest(requestId: string, payload?: { approved_by?: string }) {
  return requestHrm<HrmServiceRequest>(`/api/hrm/operations/service-requests/${requestId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function rejectServiceRequest(requestId: string, payload?: {
  approved_by?: string;
  rejected_reason?: string;
}) {
  return requestHrm<HrmServiceRequest>(`/api/hrm/operations/service-requests/${requestId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export type HrmPerformanceCycle = {
  id: string;
  company_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "closed";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HrmPerformanceEvaluation = {
  id: string;
  company_id: string;
  employee_id: string;
  /** Optional BE enrich (prevents UI leaking raw employee_id UUID). */
  employee_name?: string | null;
  employee_code?: string | null;
  cycle_id: string;
  score: number;
  summary: string;
  reviewer: string;
  /** E3 SM — draft|submitted|approved|completed (orthogonal to cycle status). */
  status?: 'draft' | 'submitted' | 'approved' | 'completed' | string;
  kpi_code?: string | null;
  kpi_name?: string | null;
  job_grade_key?: string | null;
  department_key?: string | null;
  created_at: string;
  updated_at: string;
};

/** E3 — insurance policy master (`/contracts-insurance/insurance-policies`). */
export type HrmInsurancePolicy = {
  id: string;
  company_id: string;
  policy_code: string;
  policy_name: string;
  insurer_key: string;
  insurer_label?: string | null;
  insurance_type: string;
  status: 'draft' | 'active' | 'expired' | 'cancelled' | string;
  effective_date: string;
  expiry_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function listPerformanceCycles(params: { company_id: string; status?: "draft" | "active" | "closed" }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmPerformanceCycle[] }>(`/api/hrm/performance/cycles?${search.toString()}`, {
    method: "GET",
  });
}

export async function createPerformanceCycle(payload: {
  company_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  created_by: string;
}) {
  return requestHrm<HrmPerformanceCycle>("/api/hrm/performance/cycles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listPerformanceEvaluations(params: { company_id: string; employee_id?: string; cycle_id?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.employee_id) search.set("employee_id", params.employee_id);
  if (params.cycle_id) search.set("cycle_id", params.cycle_id);
  return requestHrm<{ total: number; data: HrmPerformanceEvaluation[] }>(
    `/api/hrm/performance/evaluations?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createPerformanceEvaluation(payload: {
  company_id: string;
  employee_id: string;
  cycle_id: string;
  score: number;
  summary: string;
  reviewer: string;
  kpi_code?: string;
  kpi_name?: string;
  job_grade_key?: string;
  department_key?: string;
}) {
  return requestHrm<HrmPerformanceEvaluation>("/api/hrm/performance/evaluations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** E3 — PATCH cycle (AC-PERF-01). */
export async function updatePerformanceCycle(
  cycleId: string,
  payload: {
    company_id: string;
    cycle_name?: string;
    start_date?: string;
    end_date?: string;
    status?: "draft" | "active" | "closed";
  },
) {
  return requestHrm<HrmPerformanceCycle>(`/api/hrm/performance/cycles/${cycleId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/** E3 — DELETE cycle when draft / no submitted+ evals (AC-PERF-02). */
export async function deletePerformanceCycle(cycleId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<{ id: string }>(`/api/hrm/performance/cycles/${cycleId}?${search.toString()}`, {
    method: "DELETE",
  });
}

/** E3 — PATCH evaluation status / content / KPI keys (AC-PERF-03..05). */
export async function updatePerformanceEvaluation(
  evaluationId: string,
  payload: {
    company_id: string;
    status?: "draft" | "submitted" | "approved" | "completed";
    score?: number;
    summary?: string;
    reviewer?: string;
    kpi_code?: string;
    kpi_name?: string;
    job_grade_key?: string;
    department_key?: string;
  },
) {
  return requestHrm<HrmPerformanceEvaluation>(
    `/api/hrm/performance/evaluations/${evaluationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/** E3 — DELETE draft evaluation only. */
export async function deletePerformanceEvaluation(evaluationId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/performance/evaluations/${evaluationId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/** E3 — list insurance policy masters. */
export async function listInsurancePolicies(params: {
  company_id: string;
  status?: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", params.company_id);
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  return requestHrm<{ total: number; data: HrmInsurancePolicy[] }>(
    `/api/hrm/contracts-insurance/insurance-policies?${search.toString()}`,
    { method: "GET" },
  );
}

/** POST CreateInsurancePolicyDto — cấm insurer_label (BE snapshots catalog). D-HDSD-BF-03-BH-POL-DTO-01 */
export async function createInsurancePolicy(payload: {
  company_id: string;
  policy_code: string;
  policy_name: string;
  insurer_key: string;
  insurance_type: string;
  effective_date: string;
  expiry_date?: string;
  notes?: string;
  status?: "draft" | "active" | "expired" | "cancelled";
}) {
  return requestHrm<HrmInsurancePolicy>("/api/hrm/contracts-insurance/insurance-policies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getInsurancePolicy(policyId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<HrmInsurancePolicy>(
    `/api/hrm/contracts-insurance/insurance-policies/${policyId}?${search.toString()}`,
    { method: "GET" },
  );
}

/**
 * PATCH UpdateInsurancePolicyDto — company_id = query only (body forbidNonWhitelisted).
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-BF-03-BH-POL-DTO-01 — strip company_id/insurer_label from body
 */
export async function updateInsurancePolicy(
  policyId: string,
  companyId: string,
  payload: {
    policy_code?: string;
    policy_name?: string;
    insurer_key?: string;
    insurance_type?: string;
    effective_date?: string;
    expiry_date?: string | null;
    notes?: string | null;
    status?: "draft" | "active" | "expired" | "cancelled";
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<HrmInsurancePolicy>(
    `/api/hrm/contracts-insurance/insurance-policies/${policyId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteInsurancePolicy(policyId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/contracts-insurance/insurance-policies/${policyId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmDecisionRecord = {
  id: string;
  company_id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content: string | null;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  department_key?: string | null;
  position: string | null;
  position_key?: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signer_position_key?: string | null;
  signing_date: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function listHrDecisions(params: {
  company_id: string;
  decision_type?: string;
  status?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.decision_type) search.set("decision_type", params.decision_type);
  if (params.status) search.set("status", params.status);
  return requestHrm<{ total: number; data: HrmDecisionRecord[] }>(
    `/api/hrm/decisions?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createHrDecision(payload: {
  company_id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content?: string;
  employee_id?: string;
  employee_name: string;
  employee_code?: string;
  department?: string;
  department_key?: string;
  position?: string;
  position_key?: string;
  effective_date?: string;
  expiry_date?: string;
  signer_name?: string;
  signer_position?: string;
  signer_position_key?: string;
  signing_date?: string;
  file_url?: string;
  status?: string;
  notes?: string;
}) {
  return requestHrm<HrmDecisionRecord>("/api/hrm/decisions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateHrDecision(
  decisionId: string,
  payload: Partial<{
    company_id: string;
    decision_code: string;
    decision_type: string;
    title: string;
    content?: string;
    employee_id?: string;
    employee_name: string;
    employee_code?: string;
    department?: string;
    department_key?: string;
    position?: string;
    position_key?: string;
    effective_date?: string;
    expiry_date?: string;
    signer_name?: string;
    signer_position?: string;
    signer_position_key?: string;
    signing_date?: string;
    file_url?: string;
    status?: string;
    notes?: string;
  }>,
) {
  return requestHrm<HrmDecisionRecord>(`/api/hrm/decisions/${decisionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteHrDecision(decisionId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(`/api/hrm/decisions/${decisionId}?${search.toString()}`, {
    method: "DELETE",
  });
}

export type HrmSalaryComponentRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  code: string;
  name: string;
  category?: Record<string, unknown> | null;
};

export async function listSalaryComponents(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmSalaryComponentRow[] }>(
    `/api/hrm/payroll/salary-components?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listSalaryComponentCategories(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/payroll/salary-component-categories?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createSalaryComponent(payload: Record<string, unknown>) {
  return requestHrm<HrmSalaryComponentRow>("/api/hrm/payroll/salary-components", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateSalaryComponent(
  componentId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmSalaryComponentRow>(
    `/api/hrm/payroll/salary-components/${componentId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteSalaryComponent(componentId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/salary-components/${componentId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function createSalaryComponentCategory(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/payroll/salary-component-categories", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteSalaryComponentCategory(categoryId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/salary-component-categories/${categoryId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmPaymentBatchRow = Record<string, unknown> & { id: string; company_id: string };

/**
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01
 * change_mode: ADD
 * What: POST periods/:id/wire-payment-batch — AMIS Step7 Chi trả from processed payslips
 * Why: R-PAY-WIRE-FE — browser Chi trả button OOS after L1 wire GWC
 * must_keep: company_id in JSON body (WirePaymentBatchDto); payroll_e2e_ready=false; U65; L1 spine sealed
 */
export type HrmWirePaymentBatchResult = {
  period_id: string;
  batch: HrmPaymentBatchRow;
  records_added: number;
  records_skipped: number;
  payslip_count: number;
  records: Record<string, unknown>[];
  payroll_e2e_ready: boolean;
};

export async function wirePaymentBatchFromPeriod(
  periodId: string,
  companyId: string,
  opts?: {
    name?: string;
    payment_method?: string;
    bank_name?: string;
    require_ess_confirm?: boolean;
  },
) {
  const body = buildWirePaymentBatchBody({
    company_id: normalizeHrmApiListCompanyId(companyId),
    name: opts?.name,
    payment_method: opts?.payment_method,
    bank_name: opts?.bank_name,
    require_ess_confirm: opts?.require_ess_confirm,
  });
  return requestHrm<HrmWirePaymentBatchResult>(
    `/api/hrm/payroll/periods/${periodId}/wire-payment-batch`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function listPaymentBatches(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmPaymentBatchRow[] }>(
    `/api/hrm/payroll/payment-batches?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listPaymentBatchRecords(batchId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/payroll/payment-batches/${batchId}/records?${search.toString()}`,
    { method: "GET" },
  );
}

export async function addPaymentBatchRecord(
  batchId: string,
  companyId: string,
  payload: {
    employee_code: string;
    employee_name: string;
    amount: number;
    department?: string | null;
    bank_name?: string | null;
    bank_account?: string | null;
    payroll_record_id?: string | null;
    employee_id?: string | null;
    notes?: string | null;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/payment-batches/${batchId}/records?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function processPaymentBatchRecord(
  batchId: string,
  recordId: string,
  companyId: string,
  payload?: { transaction_ref?: string; notes?: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/payment-batches/${batchId}/records/${recordId}/process?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function processPaymentBatch(
  batchId: string,
  companyId: string,
  payload?: { notes?: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/payroll/payment-batches/${batchId}/process?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function createPaymentBatch(payload: Record<string, unknown>) {
  return requestHrm<HrmPaymentBatchRow>("/api/hrm/payroll/payment-batches", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updatePaymentBatch(
  batchId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPaymentBatchRow>(
    `/api/hrm/payroll/payment-batches/${batchId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deletePaymentBatch(batchId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/payroll/payment-batches/${batchId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmWorkShiftRow = Record<string, unknown> & { id: string; company_id: string };

export async function listWorkShifts(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmWorkShiftRow[] }>(
    `/api/hrm/attendance/work-shifts?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createWorkShift(payload: Record<string, unknown>) {
  return requestHrm<HrmWorkShiftRow>("/api/hrm/attendance/work-shifts", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateWorkShift(shiftId: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmWorkShiftRow>(
    `/api/hrm/attendance/work-shifts/${shiftId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteWorkShift(shiftId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/attendance/work-shifts/${shiftId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01
 * change_mode: ADD
 * What: Effective (active-only) work-shift picker fetch cho ShiftChangeRequestTab rebind (VAL-ATT-SHIFT-CNS-02).
 * Why: BE F-ATT-CAT-SHIFT `/work-shifts/effective` display-ready · FE bind thay hardcode 5-id khi active>0.
 * must_keep: HRM-ATT-SHIFT-KEY BE (submit gửi Nest code) · U65 no seed · attendance_uat_ready=false
 */
export type HrmWorkShiftEffectiveRecord = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  department: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  work_hours: number;
  coefficient: number;
  is_night_shift: boolean;
  is_overtime_shift: boolean;
  color: string | null;
  status: string;
  notes: string | null;
};

export async function listEffectiveWorkShifts(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  const res = await requestHrm<
    { total?: number; data?: HrmWorkShiftEffectiveRecord[] } | HrmWorkShiftEffectiveRecord[]
  >(`/api/hrm/attendance/work-shifts/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmWorkShiftEffectiveRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01
 * change_mode: ADD
 * What: Effective (active-only) OT-type picker fetch cho OvertimeRequestTab rebind (VAL-ATT-OT-CNS-01).
 * Why: BE F-ATT-CAT-OT-01 `/attendance/ot-types/effective` display-ready nameVi/defaultCoeff ·
 *      FE bind thay hardcode weekday|weekend|holiday khi EFF>0 (AC-PLT-ATT-OT-01 · 01c).
 * must_keep: HRM-ATT-OT-TYPE-KEY BE (submit gửi Nest `code`) · defaultCoeff ≠ formula LIVE ·
 *            U65 no seed · attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What: Sponsor unlock FE-ADMIN — admin list/upsert/retire clients for ot-types (same Nest KEY paths).
 * must_keep: no dual-write outside /attendance/ot-types* · consumer EFF CLOSED RETAIN
 */
export type HrmAttOtTypeEffectiveRecord = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  nameEn: string | null;
  /** Display-ready default hệ số — KHÔNG phải payroll formula (L-ATT-OT-10). */
  defaultCoeff: number;
  /** BA synonym của defaultCoeff. */
  defaultCoefficient?: number;
  sortOrder?: number;
  color?: string | null;
  status?: string;
  source?: string;
  catalogKind?: string;
};

export async function listEffectiveAttOtTypes(params: { company_id: string; q?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmAttOtTypeEffectiveRecord[] } | HrmAttOtTypeEffectiveRecord[]
  >(`/api/hrm/attendance/ot-types/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmAttOtTypeEffectiveRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01
 * change_mode: ADD
 * What: Effective (active-only) OT compensation-type picker fetch cho OvertimeRequestTab rebind (R-PLT-ATT-OTC-03).
 * Why: BE F-ATT-CAT-OTC-01 `/attendance/ot-comp-types/effective` display-ready nameVi ·
 *      FE bind thay hardcode salary|compensatory_leave khi EFF>0 (AC-PLT-ATT-COMP-01 · 01c).
 * must_keep: HRM-ATT-OT-COMP-KEY BE (submit gửi Nest `code`) · orthogonal ≠ OT-TYPE KEY ·
 *            U65 no seed · attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What: Sponsor unlock FE-ADMIN — admin list/upsert/retire clients for ot-comp-types (same Nest KEY paths).
 * must_keep: no dual-write outside /attendance/ot-comp-types* · consumer EFF CLOSED RETAIN
 */
export type HrmAttOtCompTypeEffectiveRecord = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  nameEn: string | null;
  sortOrder?: number;
  color?: string | null;
  status?: string;
  source?: string;
  catalogKind?: string;
};

export async function listEffectiveAttOtCompTypes(params: { company_id: string; q?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmAttOtCompTypeEffectiveRecord[] } | HrmAttOtCompTypeEffectiveRecord[]
  >(`/api/hrm/attendance/ot-comp-types/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmAttOtCompTypeEffectiveRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

/** F-ATT-OT-COMP-POLICY — FR-UC-BP-ATT-06 toggle + hours→days (PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01). */
export type HrmOtCompLeavePolicy = {
  modeEnabled: boolean;
  hoursPerLeaveDay: number | null;
  compBalanceKey: string;
  mapsCompCodes: string[] | null;
  status: string;
  effectiveFrom: string | null;
  updatedAt: string | null;
  companyId: string;
};

export async function getOtCompLeavePolicy(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  return requestHrm<HrmOtCompLeavePolicy>(
    `/api/hrm/attendance/ot-comp-leave-policy?${search.toString()}`,
    { method: "GET" },
  );
}

export async function putOtCompLeavePolicy(payload: {
  company_id?: string;
  mode_enabled: boolean;
  hours_per_leave_day?: number | null;
  comp_balance_key?: string;
  maps_comp_codes?: string[] | null;
  effective_from?: string | null;
}) {
  return requestHrm<HrmOtCompLeavePolicy>("/api/hrm/attendance/ot-comp-leave-policy", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      company_id: payload.company_id
        ? normalizeHrmApiListCompanyId(payload.company_id)
        : undefined,
    }),
  });
}

/** F-ATT-SICK-POLICY-ORDER — FR-UC-BP-ATT-07 fund sequence (PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01). */
export type HrmSickLeaveFundOrder = {
  companyId: string;
  fundSequence: string[];
  annualFirstEnabled: boolean;
  insuranceDayCap: number | null;
  overInsuranceAction: 'company_topup' | 'unpaid' | null;
  status: string;
  effectiveFrom: string | null;
  updatedAt: string | null;
  policyId: string | null;
  isProgramDefault: boolean;
};

export async function getSickLeaveFundOrder(params: { company_id: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  return requestHrm<HrmSickLeaveFundOrder>(
    `/api/hrm/attendance/sick-leave-fund-order?${search.toString()}`,
    { method: "GET" },
  );
}

export async function putSickLeaveFundOrder(payload: {
  company_id?: string;
  fund_sequence: string[];
  annual_first_enabled?: boolean;
  insurance_day_cap?: number | null;
  over_insurance_action?: 'company_topup' | 'unpaid' | null;
  effective_from?: string | null;
  status?: 'active' | 'retired';
}) {
  return requestHrm<HrmSickLeaveFundOrder>("/api/hrm/attendance/sick-leave-fund-order", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      company_id: payload.company_id
        ? normalizeHrmApiListCompanyId(payload.company_id)
        : undefined,
    }),
  });
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01
 * change_mode: ADD
 * What: Effective (active-only) attendance-code picker fetch cho AttendanceRecordsTable rebind (VAL-ATT-CODE-CNS-06).
 * Why: BE F-ATT-CAT-CODE-EFF-01 `/attendance/attendance-codes/effective` display-ready nameVi/symbol ·
 *      FE bind thay hardcode pending|present|absent|leave khi EFF>0 (AC-PLT-ATT-CODE-01 · 01c · 01f).
 * must_keep: HRM-ATT-CODE-KEY BE (submit gửi Nest `code`) · L1 ATTCODEQA-MSK4T1A5 RETAIN ·
 *            U65 no seed · attendance_uat_ready=false · OT/COMP pickers RETAIN
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What: Sponsor unlock FE-ADMIN — admin list/upsert/retire clients for attendance-codes (same Nest KEY paths).
 * must_keep: no dual-write outside /attendance/attendance-codes* · consumer EFF CLOSED RETAIN
 */
export type HrmAttAttendanceCodeEffectiveRecord = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  /** Display-ready status_label alias (OS 28). */
  statusLabel?: string;
  symbol?: string;
  sortOrder?: number;
  countsAs?: string;
  dayWeight?: number;
  isPaid?: boolean;
  isPresent?: boolean;
  color?: string | null;
  legacyAliasKeys?: string[];
  status?: string;
  source?: string;
  catalogKind?: string;
};

export async function listEffectiveAttendanceCodes(params: { company_id: string; q?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    | { total?: number; data?: HrmAttAttendanceCodeEffectiveRecord[] }
    | HrmAttAttendanceCodeEffectiveRecord[]
  >(`/api/hrm/attendance/attendance-codes/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmAttAttendanceCodeEffectiveRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · ATT CFG — F-ATT-CAT-CODE/OT/OTC admin clients
 * UC:         AC-PLT-ATT-CODE/OT/COMP-01* · R-PLT-ATT-FE-ADMIN-01 sponsor unlock
 * API_DESIGN: GET/PUT/POST/PATCH/retire · /attendance/attendance-codes|ot-types|ot-comp-types
 * Purpose:    Admin CRUD Nest KEY paths only (no dual-write Settings / MD).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    AttAttendanceCodeSettingsPanel · AttOtTypeSettingsPanel · AttOtCompTypeSettingsPanel
 * must_keep:  body camelCase companyId · sealed Nest paths only · U65 · honesty false · LVRULE untouched
 * solid_convention_ack: bind display-ready code/nameVi từ Nest
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 */

export type HrmAttAttendanceCodeRecord = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  statusLabel?: string;
  symbol: string;
  sortOrder?: number;
  countsAs?: string;
  dayWeight?: number;
  isPaid?: boolean;
  isPresent?: boolean;
  color?: string | null;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertAttAttendanceCodePayload = {
  companyId: string;
  code: string;
  nameVi: string;
  symbol: string;
  sortOrder?: number;
  countsAs?: string;
  dayWeight?: number;
  isPaid?: boolean;
  isPresent?: boolean;
  color?: string | null;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listAttAttendanceCodes(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmAttAttendanceCodeRecord[] } | HrmAttAttendanceCodeRecord[]
  >(`/api/hrm/attendance/attendance-codes?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmAttAttendanceCodeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertAttAttendanceCode(payload: UpsertAttAttendanceCodePayload) {
  return requestHrm<HrmAttAttendanceCodeRecord>("/api/hrm/attendance/attendance-codes", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireAttAttendanceCode(codeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttAttendanceCodeRecord>(
    `/api/hrm/attendance/attendance-codes/${codeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export type HrmAttOtTypeRecord = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  nameEn?: string | null;
  defaultCoeff: number;
  defaultCoefficient?: number;
  sortOrder?: number;
  color?: string | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertAttOtTypePayload = {
  companyId: string;
  code: string;
  nameVi: string;
  nameEn?: string | null;
  defaultCoeff?: number;
  sortOrder?: number;
  color?: string | null;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listAttOtTypes(params: {
  company_id: string;
  status?: string;
  include_inactive?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_inactive) search.set("include_inactive", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ total?: number; data?: HrmAttOtTypeRecord[] } | HrmAttOtTypeRecord[]>(
    `/api/hrm/attendance/ot-types?${search.toString()}`,
    { method: "GET" },
  );
  const items = unwrapItems<HrmAttOtTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertAttOtType(payload: UpsertAttOtTypePayload) {
  return requestHrm<HrmAttOtTypeRecord>("/api/hrm/attendance/ot-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireAttOtType(otTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttOtTypeRecord>(
    `/api/hrm/attendance/ot-types/${otTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export type HrmAttOtCompTypeRecord = {
  id: string;
  companyId: string;
  code: string;
  nameVi: string;
  nameEn?: string | null;
  sortOrder?: number;
  color?: string | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertAttOtCompTypePayload = {
  companyId: string;
  code: string;
  nameVi: string;
  nameEn?: string | null;
  sortOrder?: number;
  color?: string | null;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listAttOtCompTypes(params: {
  company_id: string;
  status?: string;
  include_inactive?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_inactive) search.set("include_inactive", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmAttOtCompTypeRecord[] } | HrmAttOtCompTypeRecord[]
  >(`/api/hrm/attendance/ot-comp-types?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmAttOtCompTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertAttOtCompType(payload: UpsertAttOtCompTypePayload) {
  return requestHrm<HrmAttOtCompTypeRecord>("/api/hrm/attendance/ot-comp-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireAttOtCompType(compTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttOtCompTypeRecord>(
    `/api/hrm/attendance/ot-comp-types/${compTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * What: RETAIN physical GET/PATCH /api/hrm/attendance/rules* — F-ATT-RULE-01;
 *       peers work-sites / work-shifts / late-early-requests / records same family;
 *       residual mode/bands/scope/latePenaltyEnabled bind when BE envelope PRESENT;
 *       Nest /core DENY · paper /att+/core alias only · CFG alone ≠ ATT-02 DONE.
 * must_keep: PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
 * What: LIVE display-ready types + optional GET scope query (dept/shift) · PATCH rules
 *       carries mode XOR / bands / latePenaltyEnabled · optional …/rules/late-penalty
 *       same family · Nest /core DENY · close R-ATT-02-MODE-FE.
 * must_keep: physical /attendance/* · CFG alone ≠ ATT-02 DONE · printable false · PAY OUT
 */
export type HrmAttendanceRulesRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  updated_at: string;
  mode?: string | null;
  modeLabelVi?: string | null;
  bands?: Array<Record<string, unknown>>;
  scope?: { companyId?: string | null; departmentId?: string | null; shiftId?: string | null };
  sourceFlags?: { gpsEnabled?: boolean; wifiEnabled?: boolean; qrEnabled?: boolean };
  latePenaltyEnabled?: boolean | null;
  latePenaltyHours?: number | null;
  notifyLate?: boolean | null;
};

export async function getAttendanceRules(
  companyId: string,
  scope?: { departmentId?: string | null; shiftId?: string | null },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  if (scope?.departmentId) search.set("department_id", scope.departmentId);
  if (scope?.shiftId) search.set("shift_id", scope.shiftId);
  return requestHrm<HrmAttendanceRulesRow>(
    `/api/hrm/attendance/rules?${search.toString()}`,
    { method: "GET" },
  );
}

export async function patchAttendanceRules(companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const { gps_locations: _omitGps, faceid_enabled: _omitFace, ...body } = payload;
  return requestHrm<HrmAttendanceRulesRow>(
    `/api/hrm/attendance/rules?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

/** Optional thin residual path — same @Controller('attendance') family (API-01). */
export async function patchAttendanceLatePenalty(
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const { gps_locations: _omitGps, faceid_enabled: _omitFace, ...body } = payload;
  return requestHrm<HrmAttendanceRulesRow>(
    `/api/hrm/attendance/rules/late-penalty?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-01
 * What: LIVE thin GET/PUT /api/hrm/attendance/holiday-calendars/:year (F-ATT-HOL-01);
 *       days {date,nameVi} · Nest /core DENY · paper /att+/core alias only ·
 *       thin PUT ≠ ATT-03b DONE · residual lunar/type/publish not invented DONE.
 * must_keep: ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH ·
 *            ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02/PLT/CORE · printable false · PAY OUT
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
 * What: UPGRADE PUT/GET residual — lunarFlag · calendarType · isPaid · dayType · status ·
 *       dayTypeLabelVi · midYearPendingLeaveRecalcRequired · publishMode · Nest /core 0 ·
 *       residual alone ≠ ATT-03b DONE · seals RETAIN · PAY OUT · printable false.
 * must_keep: ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D ·
 *            ATT08QC1-MSLSL36C · ATT02/PLT/CORE · R-ATT-01-ASSIGN open · DENY att_leave_hold
 */
export type HrmHolidayCalendarDay = {
  date: string;
  nameVi?: string | null;
  lunarFlag?: boolean | null;
  calendarType?: string | null;
  isPaid?: boolean | null;
  dayType?: string | null;
  dayTypeLabelVi?: string | null;
};

export type HrmHolidayCalendarRow = Record<string, unknown> & {
  id?: string;
  companyId?: string;
  company_id?: string;
  year?: number;
  status?: string | null;
  statusLabelVi?: string | null;
  calendarType?: string | null;
  days?: HrmHolidayCalendarDay[];
  dayCount?: number;
  publishMode?: string | null;
  midYearPendingLeaveRecalcRequired?: boolean;
  updatedAt?: string;
  createdAt?: string;
};

export type HrmPutHolidayCalendarPayload = {
  companyId: string;
  status?: "draft" | "effective" | null;
  calendarType?: "solar" | "lunar" | null;
  days?: Array<{
    date: string;
    nameVi?: string | null;
    lunarFlag?: boolean | null;
    calendarType?: "solar" | "lunar" | null;
    isPaid?: boolean | null;
    dayType?: string | null;
  }>;
};

export async function getHolidayCalendar(year: number, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmHolidayCalendarRow>(
    `/api/hrm/attendance/holiday-calendars/${year}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function putHolidayCalendar(
  year: number,
  payload: HrmPutHolidayCalendarPayload,
) {
  return requestHrm<HrmHolidayCalendarRow>(
    `/api/hrm/attendance/holiday-calendars/${year}`,
    {
      method: "PUT",
      body: JSON.stringify({
        companyId: normalizeHrmApiListCompanyId(payload.companyId),
        ...(payload.status === "draft" || payload.status === "effective"
          ? { status: payload.status }
          : {}),
        ...(payload.calendarType === "solar" || payload.calendarType === "lunar"
          ? { calendarType: payload.calendarType }
          : {}),
        days: Array.isArray(payload.days)
          ? payload.days.map((d) => {
              const day: Record<string, unknown> = { date: d.date };
              if (d.nameVi != null && String(d.nameVi).trim()) {
                day.nameVi = String(d.nameVi).trim();
              }
              if (d.lunarFlag === true || d.lunarFlag === false) {
                day.lunarFlag = d.lunarFlag;
              }
              if (d.calendarType === "solar" || d.calendarType === "lunar") {
                day.calendarType = d.calendarType;
              }
              if (d.isPaid === true || d.isPaid === false) {
                day.isPaid = d.isPaid;
              }
              if (d.dayType != null && String(d.dayType).trim()) {
                day.dayType = String(d.dayType).trim();
              }
              return day;
            })
          : [],
      }),
    },
  );
}

export type HrmWorkSiteRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius?: number;
  radius_meters?: number;
  active?: boolean;
  statusLabelVi?: string;
  address?: string;
};

export async function listAttendanceWorkSites(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmWorkSiteRow[] }>(
    `/api/hrm/attendance/work-sites?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceWorkSite(payload: Record<string, unknown>) {
  const radius = payload.radius ?? payload.radius_meters ?? 200;
  return requestHrm<HrmWorkSiteRow>("/api/hrm/attendance/work-sites", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")),
      radius_meters: radius,
    }),
  });
}

export async function updateAttendanceWorkSite(
  siteId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const body = { ...payload };
  if (body.radius != null && body.radius_meters == null) {
    body.radius_meters = body.radius;
    delete body.radius;
  }
  return requestHrm<HrmWorkSiteRow>(
    `/api/hrm/attendance/work-sites/${siteId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

export async function deleteAttendanceWorkSite(siteId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/attendance/work-sites/${siteId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmAttendanceSheetRow = Record<string, unknown> & { id: string; company_id: string };

export async function listAttendanceSheets(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmAttendanceSheetRow[] }>(
    `/api/hrm/attendance/attendance-sheets?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceSheet(payload: Record<string, unknown>) {
  return requestHrm<HrmAttendanceSheetRow>("/api/hrm/attendance/attendance-sheets", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateAttendanceSheet(
  sheetId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetRow>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteAttendanceSheet(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type AttendanceSheetPersonaRole = "employee" | "direct_manager" | "hr_admin";

export type HrmAttendanceSheetSignStep = {
  step_code: string;
  persona_role: AttendanceSheetPersonaRole | string;
  outcome: "approved" | "rejected" | string;
  signed_at?: string;
  signer_user_id?: string;
  comment?: string | null;
};

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Optional statusLabelVi / policy_ready on GET signatures display-ready (FE-derive OK)
 * Why: UC-BP-ATT-11 / FR-UC-BP-ATT-11 · API-01 F.1 F-ATT-WF-SIGN-02 · J-HRM-ATT-11-01..06
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md §4 · §8
 * must_keep: physical attendance-sheets/{id}/signatures|close|reopen · Nest /core DENY ·
 *            ATT10QC1-MSLWGUYH ≠ AGG=DONE · DENY att_leave_hold · ≠ LIVE=ATT-11 DONE · U65 · C-SLICE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-02
 * change_mode: FIX
 * What: must_keep path text — cấm chuỗi star-slash trong block comment (Vite 500 P0-ATT11-FE-VITE-COMMENT-TERMINATOR)
 * Why: QA-01 ATT11QA1-MSLXD7ZD · hrmApi.ts premature comment close → blank /hr/attendance
 * must_keep: FE-01 SignPanel behavior · seals ATT10/09/08 · paths unchanged in requestHrm URLs
 */
export type HrmAttendanceSheetSignaturesPayload = {
  header_id: string;
  status: string;
  /** Optional — FE-derive OK when ABSENT (R-ATT-11-DISP). */
  statusLabelVi?: string;
  status_label_vi?: string;
  steps: HrmAttendanceSheetSignStep[];
  missing_mandatory_roles: string[];
  can_close: boolean;
  /** Optional hint after POST sign / GET enrich. */
  policy_ready?: boolean;
};

export async function getAttendanceSheetById(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetRow>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listAttendanceSheetSignatures(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetSignaturesPayload>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}/signatures?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createAttendanceSheetSignature(
  sheetId: string,
  companyId: string,
  payload: {
    step_code: string;
    persona_role: AttendanceSheetPersonaRole;
    outcome: "approved" | "rejected";
    comment?: string;
    wf_task_instance_id?: string;
    workflow_definition_id?: string;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{
    header_id: string;
    step_code: string;
    outcome: string;
    signed_at: string;
    signer_user_id: string;
    policy_ready: boolean;
  }>(`/api/hrm/attendance/attendance-sheets/${sheetId}/signatures?${search.toString()}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function closeAttendanceSheet(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ sheet_id: string; status: string; event?: string }>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}/close?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01
 * change_mode: ADD
 * What: POST /aggregate + POST /reopen client; submit return warnings[] for empty-enrollment honesty
 * Why: R-PAY-F-ATT-LINE-AC4-BIND — product path density → line_count>0 without seed (U65)
 * Spec: F-ATT-SHEET-AGG-01 · F-ATT-SHEET-03 · OPEN-Q2 Option C
 * must_keep: submit invokes AGG; closed AGG → 409; Jul CB-BAG sheets not auto-reopened; payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Display-ready optional lines[] + statusLabelVi on AGG/submit result type; physical path RETAIN
 * Why: UC-BP-ATT-10 / FR-UC-BP-ATT-10 · API-01 F.1 F-ATT-SHEET-01/AGG · payable gold GĐ1
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md §4–§6
 * must_keep: Nest /core DENY · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · CFG≠ATT-02 · printable false ·
 *            DENY att_leave_hold · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · U65 · C-SLICE
 */
export type HrmAttendanceSheetAggLine = {
  employee_id: string;
  employee_name?: string | null;
  standard_hours?: number;
  ot_hours_weighted?: number;
  paid_leave_hours?: number;
  unpaid_leave_hours?: number;
  late_penalty_hours?: number;
  meal_shift_hours?: number | null;
  holiday_hours?: number | null;
  payable_hours?: number;
  work_days?: number;
  line_locked?: boolean;
};

export type HrmAttendanceSheetLinesResponse = {
  sheet_id: string;
  status: string;
  items: HrmAttendanceSheetAggLine[];
};

/** F-PAY-ATT-CLOSED-01 — read-only att_timesheet_line (payroll draft LUONG_THEO_CONG preview). */
export async function listAttendanceSheetLines(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetLinesResponse>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}/lines?${search.toString()}`,
    { method: "GET" },
  );
}

export type HrmAttendanceSheetAggResult = {
  sheet_id: string;
  status: string;
  statusLabelVi?: string;
  status_label_vi?: string;
  line_count: number;
  warnings?: string[];
  /** Optional DISP enrich — ABSENT OK GĐ1 (R-ATT-10-DISP · FE does not invent). */
  lines?: HrmAttendanceSheetAggLine[];
};

export async function aggregateAttendanceSheet(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetAggResult>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}/aggregate?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function reopenAttendanceSheet(
  sheetId: string,
  companyId: string,
  payload?: { reopen_reason?: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ sheet_id: string; status: string; lines_archived?: number }>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}/reopen?${search.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(payload ?? {}),
    },
  );
}

/** FR-UC-BP-ATT-10 · F-ATT-SHEET-01 — draft|open → submitted (chờ ký); BE invokes AGG. */
export async function submitAttendanceSheetForSign(sheetId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttendanceSheetAggResult>(
    `/api/hrm/attendance/attendance-sheets/${sheetId}/submit?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function updateJobPosting(
  jobPostingId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmJobPostingRow>(
    `/api/hrm/recruitment/job-postings/${jobPostingId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

/**
 * FR-HRM-INT-01 / G-DB-01 — stage PATCH via dedicated endpoint; pass employee_id when hired.
 * SRS bước: Diễn biến #5/#7 · TechSpec §17.3 G-DB-01
 * NOTE: ≠ FR-UC-BP-REC-05 timeline SoT — YCTD-bound UV uses postRecruitmentCandidateTransition.
 */
export async function updateCandidatePoolStage(
  candidateId: string,
  companyId: string,
  stage: string,
  employeeId?: string | null,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const body: { stage: string; employee_id?: string } = { stage };
  const linked = employeeId?.trim();
  if (linked) body.employee_id = linked;
  return requestHrm<HrmCandidatePoolRow>(
    `/api/hrm/recruitment/candidates-pool/${candidateId}/stage?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Đổi trạng thái UV–YCTD + timeline
 * UC:         UC-BP-REC-05 · AC-REC-05-02/03/04
 * BR:         BR-BP-CV-02 · BR-REC-STG-PATH O1 · DENY Nest /rec dual
 * SRS:        FR-UC-BP-REC-05 Diễn biến #1–#2
 * API_DESIGN: docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md F-REC-APP-02 · F-REC-APP-02-TL
 * Purpose:    Client POST transitions (atomic append history) + GET stage-history display-ready.
 * WorkItem:   PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidateStageTransitionDialog · CandidateStageHistoryPanel
 * must_keep:  path contains /recruitment/candidates/ · no /rec/ · U65 · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md
 */

export type HrmCandidateStageHistoryItem = {
  id: string;
  recruitment_candidate_id: string;
  application_id?: string | null;
  company_id: string;
  from_stage: string | null;
  to_stage: string;
  note: string | null;
  desired_salary?: number | null;
  changed_by?: string | null;
  changed_at: string;
};

export type HrmCandidateStageTransitionBody = {
  to_stage: string;
  note?: string;
  desired_salary?: number;
  is_reverse?: boolean;
};

export type HrmCandidateStageTransitionResult = {
  id: string;
  stage: string;
  requisition_id?: string | null;
  company_id?: string;
  history_id?: string;
  history?: {
    id: string;
    from_stage: string | null;
    to_stage: string;
    note: string | null;
    desired_salary?: number | null;
    changed_by?: string | null;
    changed_at: string;
  };
};

/** F-REC-APP-02 — POST /recruitment/candidates/:id/transitions (Lane A YCTD-bound). */
export async function postRecruitmentCandidateTransition(
  candidateId: string,
  companyId: string,
  body: HrmCandidateStageTransitionBody,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const payload: HrmCandidateStageTransitionBody = {
    to_stage: body.to_stage.trim(),
  };
  const note = body.note?.trim();
  if (note) payload.note = note;
  if (typeof body.desired_salary === "number" && Number.isFinite(body.desired_salary)) {
    payload.desired_salary = body.desired_salary;
  }
  if (body.is_reverse === true) payload.is_reverse = true;
  return requestHrm<HrmCandidateStageTransitionResult>(
    `/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/transitions?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

/** F-REC-APP-02-TL — GET /recruitment/candidates/:id/stage-history. */
export async function listRecruitmentCandidateStageHistory(
  candidateId: string,
  companyId: string,
  opts?: { requisition_id?: string; limit?: number },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  if (opts?.requisition_id?.trim()) search.set("requisition_id", opts.requisition_id.trim());
  if (typeof opts?.limit === "number" && opts.limit > 0) search.set("limit", String(opts.limit));
  const res = await requestHrm<
    | HrmCandidateStageHistoryItem[]
    | { total?: number; data?: HrmCandidateStageHistoryItem[] }
  >(
    `/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/stage-history?${search.toString()}`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return { items: res, total: res.length };
  const items = unwrapItems<HrmCandidateStageHistoryItem>(res);
  const total =
    res && typeof res === "object" && typeof res.total === "number" ? res.total : items.length;
  return { items, total };
}

/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — Chấp nhận offer → create/link hồ sơ NS
 * UC:         UC-BP-REC-07 · AC-REC-07-01/03 · VAL-REC-HIRE-01/02
 * BR:         BR-REC-HIRE-PATH O1 · DENY Nest /rec dual · DENY PAY invent
 * SRS:        FR-UC-BP-REC-07 Diễn biến #1–#2
 * API_DESIGN: docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-API-01.md F-REC-HIRE-01
 * Purpose:    Client POST accept-offer physical /recruitment/applications/:id — return data + envelope code.
 * WorkItem:   PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    CandidateAcceptOfferDialog
 * must_keep:  path contains /recruitment/applications/ · no /rec/ · U65 · honesty false
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-fe-01.md
 */

export type HrmAcceptOfferResult = {
  application_id: string;
  candidate_id: string;
  employee_id: string;
  company_id: string;
  requisition_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
  department_key?: string | null;
  job_title_key?: string | null;
  position_key?: string | null;
  hired_at?: string | null;
  expected_start_date?: string | null;
  status?: string | null;
  employee_code?: string | null;
  offer_accepted_at?: string | null;
  accepted_application_id?: string | null;
  mode?: "created" | "linked" | "idempotent" | string | null;
  history_id?: string | null;
  hired_outcome_stage?: string | null;
  event?: string | null;
};

export type HrmAcceptOfferBody = {
  expected_start_date?: string;
  note?: string;
  offer_id?: string;
};

/** F-REC-HIRE-01 — POST /recruitment/applications/:applicationId/accept-offer (primary FE). */
export async function postRecruitmentApplicationAcceptOffer(
  applicationId: string,
  companyId: string,
  body?: HrmAcceptOfferBody,
): Promise<{ data: HrmAcceptOfferResult; code?: string; message?: string }> {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const payload: Record<string, unknown> = {};
  const start = body?.expected_start_date?.trim();
  if (start) payload.expected_start_date = start;
  const note = body?.note?.trim();
  if (note) payload.note = note;
  const offerId = body?.offer_id?.trim();
  if (offerId) payload.offer_id = offerId;

  const path = `/api/hrm/recruitment/applications/${encodeURIComponent(applicationId)}/accept-offer?${search.toString()}`;
  const res = await fetch(`${HRM_API_ORIGIN}${path}`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify(payload),
  });
  const { data, envelope } = await parseHrmJson<HrmAcceptOfferResult>(res);
  return {
    data,
    code: envelope.code,
    message: envelope.message,
  };
}

export async function createRecruitmentPlan(payload: Record<string, unknown>) {
  return requestHrm<HrmRecruitmentPlanRow>("/api/hrm/recruitment/recruitment-plans", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

/**
 * F-REC-HC-01 PUT upsert — single need_hire cells + catalog keys (O1 · VAL-REC-HC-15).
 * Physical: PUT /api/hrm/recruitment/recruitment-plans/:planId
 */
export async function upsertRecruitmentPlan(
  planId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecruitmentPlanRow>(
    `/api/hrm/recruitment/recruitment-plans/${encodeURIComponent(planId)}?${search.toString()}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...payload,
        company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? companyId)),
      }),
    },
  );
}

export async function deleteRecruitmentPlan(planId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/recruitment-plans/${planId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export type HrmInterviewCatalogRow = Record<string, unknown> & {
  id: string;
  company_id: string;
  candidate_name: string;
};

export async function listInterviewsCatalog(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ total: number; data: HrmInterviewCatalogRow[] }>(
    `/api/hrm/recruitment/interviews-catalog?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createInterviewCatalog(payload: Record<string, unknown>) {
  return requestHrm<HrmInterviewCatalogRow>("/api/hrm/recruitment/interviews-catalog", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateInterviewCatalog(
  interviewId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmInterviewCatalogRow>(
    `/api/hrm/recruitment/interviews-catalog/${interviewId}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteInterviewCatalog(interviewId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/interviews-catalog/${interviewId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

function employeeProfileQuery(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return search;
}

type ProfileListResult<T> = { total: number; data: T[] };

export async function listEmployeeSkills(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeSkill(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeSkill(
  employeeId: string,
  skillId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills/${skillId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeSkill(employeeId: string, skillId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/skills/${skillId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeWorkTimeline(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeWorkTimelineItem(
  employeeId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeWorkTimelineItem(
  employeeId: string,
  itemId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline/${itemId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeWorkTimelineItem(employeeId: string, itemId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/work-timeline/${itemId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeResumeFiles(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/resume-files?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeResumeFile(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/resume-files?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeResumeFile(employeeId: string, fileId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/resume-files/${fileId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function listEmployeeRewards(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function listEmployeeDiscipline(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeReward(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeReward(
  employeeId: string,
  rewardId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards/${rewardId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeReward(employeeId: string, rewardId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards/${rewardId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function createEmployeeDiscipline(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeDiscipline(
  employeeId: string,
  disciplineId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline/${disciplineId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeDiscipline(employeeId: string, disciplineId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline/${disciplineId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

/** UC-BP-CORE-08 / F-CORE-RD-01 — POST …/rewards/:id/enforce (PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01). */
export async function enforceEmployeeReward(
  employeeId: string,
  rewardId: string,
  companyId: string,
  payload?: { target_status?: "in_force" | "executed"; payroll_period_id?: string },
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards/${encodeURIComponent(rewardId)}/enforce?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function cancelEnforceEmployeeReward(
  employeeId: string,
  rewardId: string,
  companyId: string,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/rewards/${encodeURIComponent(rewardId)}/cancel-enforce?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function enforceEmployeeDiscipline(
  employeeId: string,
  disciplineId: string,
  companyId: string,
  payload?: { target_status?: "in_force" | "executed"; payroll_period_id?: string },
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline/${encodeURIComponent(disciplineId)}/enforce?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload ?? {}) },
  );
}

export async function cancelEnforceEmployeeDiscipline(
  employeeId: string,
  disciplineId: string,
  companyId: string,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/discipline/${encodeURIComponent(disciplineId)}/cancel-enforce?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function listEmployeeTraining(employeeId: string, companyId: string) {
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeTraining(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeTraining(
  employeeId: string,
  trainingId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training/${trainingId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeTraining(employeeId: string, trainingId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/training/${trainingId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

export async function inviteEmployees(payload: {
  company_id: string;
  employees: Array<{ email: string; full_name?: string; employee_id?: string }>;
}) {
  return requestHrm<{
    success: boolean;
    total: number;
    invited: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }>("/api/hrm/admin/invite-employee", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listAdminCompanies() {
  return requestHrm<{ total: number; data: Array<{ id: string; name: string; code: string | null }> }>(
    "/api/hrm/admin/companies",
    { method: "GET" },
  );
}

export type HrmScopedCompanyRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  name: string;
  code: string | null;
  employee_count: number | null;
};

export async function listScopedCompanies() {
  return requestHrm<{
    total: number;
    data: HrmScopedCompanyRow[];
    rollup_total: number | null;
  }>("/api/hrm/company-scope/companies", { method: "GET" });
}

export async function listScopedMemberships(companyId?: string) {
  const search = new URLSearchParams();
  if (companyId) setListCompanyId(search, companyId);
  const qs = search.toString();
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/company-scope/memberships${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function upsertScopedMembership(payload: {
  email: string;
  full_name: string;
  role: string;
  company_id: string;
  tenant_id?: string;
  employee_id?: string | null;
  status?: string;
}) {
  return requestHrm<Record<string, unknown>>("/api/hrm/company-scope/memberships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateScopedMembership(
  membershipId: string,
  payload: { role?: string; employee_id?: string | null; status?: string; full_name?: string; email?: string },
) {
  return requestHrm<Record<string, unknown>>(`/api/hrm/company-scope/memberships/${membershipId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteScopedMembership(membershipId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/company-scope/memberships/${membershipId}`, {
    method: "DELETE",
  });
}

export async function listCompanyMemberships(companyId?: string) {
  const search = new URLSearchParams();
  if (companyId) setListCompanyId(search, companyId);
  const qs = search.toString();
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/admin/company-memberships${qs ? `?${qs}` : ""}`,
    { method: "GET" },
  );
}

export async function upsertCompanyMembership(payload: {
  email: string;
  full_name: string;
  role: string;
  company_id: string;
  employee_id?: string | null;
  status?: string;
}) {
  return requestHrm<Record<string, unknown>>("/api/hrm/admin/company-memberships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCompanyMembership(
  membershipId: string,
  payload: { role?: string; employee_id?: string | null; status?: string; full_name?: string; email?: string },
) {
  return requestHrm<Record<string, unknown>>(`/api/hrm/admin/company-memberships/${membershipId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteCompanyMembership(membershipId: string) {
  return requestHrm<{ id: string }>(`/api/hrm/admin/company-memberships/${membershipId}`, { method: "DELETE" });
}

export type HrmCandidateApplicationEnriched = HrmCandidateApplicationRow & {
  candidates: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    stage: string | null;
    rating: number | null;
    avatar_url: string | null;
    applied_date: string | null;
    source: string | null;
    /** Soft hire link on pool candidate (may be omitted by BE enrich JSON). */
    employee_id?: string | null;
  };
};

export async function createCandidateApplication(payload: {
  company_id: string;
  candidate_id: string;
  job_posting_id: string;
  stage?: string;
}) {
  return requestHrm<HrmCandidateApplicationRow>("/api/hrm/recruitment/candidate-applications", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function deleteCandidateApplication(applicationId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/candidate-applications/${applicationId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

/** FR-HRM-INT-01 — application hired inherits candidate→employee soft link; pass employee_id when known. */
export async function updateCandidateApplicationStage(
  applicationId: string,
  companyId: string,
  stage: string,
  employeeId?: string | null,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  const body: { stage: string; employee_id?: string } = { stage };
  const linked = employeeId?.trim();
  if (linked) body.employee_id = linked;
  return requestHrm<HrmCandidateApplicationRow>(
    `/api/hrm/recruitment/candidate-applications/${applicationId}/stage?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

export async function listHeadcountProposals(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/recruitment/headcount-proposals?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createHeadcountProposal(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/recruitment/headcount-proposals", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateHeadcountProposal(
  proposalId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/recruitment/headcount-proposals/${proposalId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...payload,
        company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? companyId)),
      }),
    },
  );
}

export async function updateHeadcountProposalStatus(
  proposalId: string,
  companyId: string,
  status: string,
  rejectedReason?: string,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/recruitment/headcount-proposals/${proposalId}/status?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify({ status, rejected_reason: rejectedReason }) },
  );
}

/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01
 * change_mode: ADD / UPGRADE
 * What: F-REC-MAIL-01 POST/GET …/candidates/:id/mail · F-REC-APP-03 list/create neo YCTD
 *       (recruitment_candidate_id / application_id) · Pass/Fail commit · physical /recruitment/ only
 * Why: UC-BP-REC-06 AC-01..04 · O1/O2/O5 · DENY Nest /rec dual · Campaign · stage từ mail
 * must_keep: REC-05 transitions · 06a interviews · UV-YCTD · U65 · honesty false · C-SLICE
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md
 */

export type HrmRecMailLogItem = {
  attempt_no?: number;
  result?: string;
  error_message?: string | null;
  logged_at?: string | null;
  provider_ref?: string | null;
};

export type HrmRecMailOutboxRow = {
  outbox_id?: string;
  id?: string;
  recruitment_candidate_id?: string | null;
  application_id?: string | null;
  requisition_id?: string | null;
  template_code?: string;
  status?: string;
  queued_at?: string | null;
  sent_at?: string | null;
  error_message?: string | null;
  to?: string[];
  cc_interviewers?: string[];
  /** local = stub (không vào inbox); smtp = Gmail thật */
  delivery_mode?: "local" | "smtp" | null;
  provider_ref?: string | null;
  log?: HrmRecMailLogItem[];
};

export type HrmRecMailTemplateItem = {
  code: string;
  label_vi: string;
  subject: string;
  body: string;
  active: boolean;
};

/** GET /recruitment/mail-templates — effective catalog (defaults ∪ company CFG). */
export async function listRecruitmentMailTemplates(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const res = await requestHrm<{
    company_id?: string;
    total?: number;
    data?: HrmRecMailTemplateItem[];
    items?: HrmRecMailTemplateItem[];
    active_codes?: string[];
  }>(`/api/hrm/recruitment/mail-templates?${search.toString()}`, {
    method: "GET",
  });
  const raw = res as unknown;
  let items: HrmRecMailTemplateItem[] = [];
  if (Array.isArray(raw)) {
    items = raw as HrmRecMailTemplateItem[];
  } else if (res && typeof res === "object") {
    if (Array.isArray(res.data)) items = res.data;
    else if (Array.isArray(res.items)) items = res.items;
  }
  return {
    company_id:
      res && typeof res === "object" && !Array.isArray(res) && typeof res.company_id === "string"
        ? res.company_id
        : companyId,
    items,
    active_codes:
      res &&
      typeof res === "object" &&
      !Array.isArray(res) &&
      Array.isArray(res.active_codes)
        ? res.active_codes
        : items.filter((t) => t.active).map((t) => t.code),
  };
}

/** PUT /recruitment/mail-templates — save company catalog + sync active codes. */
export async function putRecruitmentMailTemplates(
  companyId: string,
  templates: HrmRecMailTemplateItem[],
) {
  return requestHrm<{
    company_id?: string;
    total?: number;
    data?: HrmRecMailTemplateItem[];
    active_codes?: string[];
  }>("/api/hrm/recruitment/mail-templates", {
    method: "PUT",
    body: JSON.stringify({
      company_id: normalizeHrmApiListCompanyId(companyId),
      templates: templates.map((t) => ({
        code: t.code,
        label_vi: t.label_vi,
        subject: t.subject,
        body: t.body,
        active: Boolean(t.active),
      })),
    }),
  });
}

/** F-REC-MAIL-01 — POST /recruitment/candidates/:id/mail (Lane A YCTD-bound). */
export async function sendRecruitmentCandidateMail(
  candidateId: string,
  companyId: string,
  body: {
    template_code: string;
    to: string[];
    cc_interviewers?: string[];
    subject?: string;
    body?: string;
    payload?: Record<string, unknown>;
    application_id?: string;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const payload: Record<string, unknown> = {
    template_code: body.template_code.trim(),
    to: body.to,
  };
  if (body.cc_interviewers && body.cc_interviewers.length > 0) {
    payload.cc_interviewers = body.cc_interviewers;
  }
  if (typeof body.subject === "string" && body.subject.trim()) {
    payload.subject = body.subject.trim();
  }
  if (typeof body.body === "string" && body.body.trim()) {
    payload.body = body.body.trim();
  }
  if (body.payload && typeof body.payload === "object") {
    payload.payload = body.payload;
  }
  if (body.application_id?.trim()) {
    payload.application_id = body.application_id.trim();
  }
  return requestHrm<HrmRecMailOutboxRow>(
    `/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/mail?${search.toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

/** F-REC-MAIL-01-R — GET /recruitment/candidates/:id/mail (outbox + log display-ready). */
export async function listRecruitmentCandidateMail(
  candidateId: string,
  companyId: string,
  opts?: { limit?: number; status?: string },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  if (typeof opts?.limit === "number" && opts.limit > 0) search.set("limit", String(opts.limit));
  if (opts?.status?.trim()) search.set("status", opts.status.trim());
  const res = await requestHrm<
    HrmRecMailOutboxRow[] | { total?: number; data?: HrmRecMailOutboxRow[] }
  >(
    `/api/hrm/recruitment/candidates/${encodeURIComponent(candidateId)}/mail?${search.toString()}`,
    { method: "GET" },
  );
  if (Array.isArray(res)) return { items: res, total: res.length };
  const items = unwrapItems<HrmRecMailOutboxRow>(res);
  const total =
    res && typeof res === "object" && typeof res.total === "number" ? res.total : items.length;
  return { items, total };
}

const candidateEvaluationsInflight = new Map<
  string,
  Promise<{ total: number; data: Record<string, unknown>[] }>
>();

export async function listCandidateEvaluations(params: {
  company_id: string;
  candidate_id?: string;
  /** FR-06 preferred neo — Lane A. */
  recruitment_candidate_id?: string;
  application_id?: string;
  include_legacy?: boolean;
}) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  if (params.recruitment_candidate_id?.trim()) {
    search.set("recruitment_candidate_id", params.recruitment_candidate_id.trim());
  }
  if (params.application_id?.trim()) {
    search.set("application_id", params.application_id.trim());
  }
  if (params.candidate_id) search.set("candidate_id", params.candidate_id);
  if (params.include_legacy === true) search.set("include_legacy", "true");
  const dedupeKey = `${normalizeHrmApiListCompanyId(params.company_id)}:${params.recruitment_candidate_id ?? ""}:${params.application_id ?? ""}:${params.candidate_id ?? "*"}:${params.include_legacy === true ? "L" : ""}`;
  const inflight = candidateEvaluationsInflight.get(dedupeKey);
  if (inflight) return inflight;

  const promise = requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/recruitment/candidate-evaluations?${search.toString()}`,
    { method: "GET" },
  ).finally(() => {
    candidateEvaluationsInflight.delete(dedupeKey);
  });
  candidateEvaluationsInflight.set(dedupeKey, promise);
  return promise;
}

export async function createCandidateEvaluation(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/recruitment/candidate-evaluations", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteCandidateEvaluation(evaluationId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/recruitment/candidate-evaluations/${evaluationId}?${search.toString()}`,
    { method: "DELETE" },
  );
}

export async function listEvaluationCriteriaTemplates(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/recruitment/evaluation-criteria-templates?${search.toString()}`,
    { method: "GET" },
  );
}

export async function replaceEvaluationCriteriaTemplates(companyId: string, templates: Record<string, unknown>[]) {
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    "/api/hrm/recruitment/evaluation-criteria-templates/replace",
    {
      method: "POST",
      body: JSON.stringify({ company_id: normalizeHrmApiListCompanyId(companyId), templates }),
    },
  );
}

export async function listDepartments(
  params: { company_id: string },
  scope?: HrmSpreadsheetScope,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/departments?${search.toString()}`,
    { method: "GET" },
    scope ? { scope } : undefined,
  );
}

export type HrmPayPositionRecord = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  grade_code: string;
  position_scope: 'company' | 'department';
  historical_note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type HrmDepartmentPositionRecord = {
  id: string;
  department_id: string;
  position_code: string;
  local_name: string | null;
  grade_code_override: string | null;
  effective_name: string;
  effective_grade_code: string;
  position_scope: 'company' | 'department';
  sort_order: number;
  status: string;
};

export type HrmEffectivePositionOption = {
  code: string;
  label: string;
  grade_code: string;
  position_scope: 'company' | 'department';
};

export async function listPayPositions(params: {
  company_id: string;
  status?: string;
  q?: string;
  position_scope?: 'company' | 'department';
}) {
  const search = buildListSearchParams(params);
  return requestHrm<{ total: number; data: HrmPayPositionRecord[] }>(
    `/api/hrm/positions?${search.toString()}`,
    { method: 'GET' },
  );
}

export async function createPayPosition(payload: {
  company_id: string;
  code: string;
  name: string;
  grade_code: string;
  position_scope?: 'company' | 'department';
  historical_note?: string | null;
}) {
  return requestHrm<HrmPayPositionRecord>('/api/hrm/positions', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function listEffectivePayPositions(params: {
  company_id: string;
  department_id?: string;
  department_code?: string;
}) {
  const search = buildListSearchParams(params);
  return requestHrm<{ data: HrmEffectivePositionOption[] }>(
    `/api/hrm/positions/effective?${search.toString()}`,
    { method: 'GET' },
  );
}

export async function listDepartmentPositions(
  departmentId: string,
  params: { company_id: string },
) {
  const search = buildListSearchParams(params);
  return requestHrm<{ total: number; data: HrmDepartmentPositionRecord[] }>(
    `/api/hrm/positions/by-department/${departmentId}?${search.toString()}`,
    { method: 'GET' },
  );
}

export async function upsertDepartmentPosition(
  departmentId: string,
  payload: {
    company_id: string;
    position_code: string;
    local_name?: string | null;
    grade_code_override?: string | null;
    sort_order?: number;
    status?: string;
  },
) {
  return requestHrm<HrmDepartmentPositionRecord>(
    `/api/hrm/positions/by-department/${departmentId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
      }),
    },
  );
}

export async function removeDepartmentPosition(
  departmentId: string,
  positionCode: string,
  companyId: string,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ department_id: string; position_code: string }>(
    `/api/hrm/positions/by-department/${departmentId}/${encodeURIComponent(positionCode)}?${search.toString()}`,
    { method: 'DELETE' },
  );
}

export async function createDepartment(
  payload: {
    company_id: string;
    name: string;
    code?: string;
    description?: string;
    parent_id?: string;
    level?: number;
    sort_order?: number;
    manager_name?: string;
    manager_email?: string;
  },
  scope?: HrmSpreadsheetScope,
) {
  return requestHrm<Record<string, unknown>>(
    "/api/hrm/departments",
    {
      method: "POST",
      body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
    },
    { scope },
  );
}

export async function updateDepartment(
  departmentId: string,
  companyId: string,
  payload: {
    company_id: string;
    name?: string;
    code?: string | null;
    description?: string | null;
    parent_id?: string | null;
    level?: number;
    sort_order?: number;
    manager_name?: string | null;
    manager_email?: string | null;
    status?: string;
  },
  scope?: HrmSpreadsheetScope,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/departments/${departmentId}?${search}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...payload,
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
      }),
    },
    { scope },
  );
}

export async function deleteDepartment(
  departmentId: string,
  companyId: string,
  scope?: HrmSpreadsheetScope,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(
    `/api/hrm/departments/${departmentId}?${search}`,
    { method: "DELETE" },
    { scope },
  );
}

// --- P1-QUAL-FE-W3 catalog extensions ---

export async function listSalesData(params: { company_id: string; period_month?: number; period_year?: number }) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  if (params.period_month) search.set("period_month", String(params.period_month));
  if (params.period_year) search.set("period_year", String(params.period_year));
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(`/api/hrm/sales-data?${search}`, { method: "GET" });
}

export async function createSalesData(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/sales-data", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateSalesData(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/sales-data/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteSalesData(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/sales-data/${id}?${search}`, { method: "DELETE" });
}

export async function syncSalesData(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ synced: number; company_id: string }>(`/api/hrm/sales-data/sync?${search}`, { method: "POST" });
}

export async function listBonusPolicies(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(`/api/hrm/bonus-policies?${search}`, { method: "GET" });
}

export async function createBonusPolicy(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/bonus-policies", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateBonusPolicy(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/bonus-policies/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteBonusPolicy(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/bonus-policies/${id}?${search}`, { method: "DELETE" });
}

export async function listBonusPolicyParticipants(policyId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/bonus-policies/${policyId}/participants?${search}`,
    { method: "GET" },
  );
}

export async function createBonusPolicyParticipant(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/bonus-policies/participants", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function listInsurancePolicyParticipants(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/insurance-policy-participants?${search}`,
    { method: "GET" },
  );
}

export async function createInsurancePolicyParticipant(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/insurance-policy-participants", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateInsurancePolicyParticipant(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/insurance-policy-participants/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteInsurancePolicyParticipant(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/insurance-policy-participants/${id}?${search}`, { method: "DELETE" });
}

export async function listTaxPolicyParticipants(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/tax-policy-participants?${search}`,
    { method: "GET" },
  );
}

export async function createTaxPolicyParticipant(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/tax-policy-participants", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function updateTaxPolicyParticipant(id: string, companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/tax-policy-participants/${id}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTaxPolicyParticipant(id: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/tax-policy-participants/${id}?${search}`, { method: "DELETE" });
}

export async function listFaceData(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(`/api/hrm/face-data?${search}`, { method: "GET" });
}

export async function upsertFaceData(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/face-data", {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(String(payload.company_id ?? "")) }),
  });
}

export async function deleteFaceData(employeeId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ employee_id: string }>(`/api/hrm/face-data/${employeeId}?${search}`, { method: "DELETE" });
}

export async function getCompanySubscription(companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/company-subscription?${search}`, { method: "GET" });
}

export async function upgradeCompanySubscription(companyId: string, payload: Record<string, unknown>) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/company-subscription/upgrade?${search}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listGuideContent(companyId?: string) {
  const search = new URLSearchParams();
  if (companyId) setListCompanyId(search, companyId);
  const q = search.toString();
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/guide-content${q ? `?${q}` : ""}`,
    { method: "GET" },
  );
}

export async function upsertGuideContent(payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>("/api/hrm/guide-content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteGuideContent(payload: { section_id: string; step_index: number | null; company_id?: string }) {
  return requestHrm<{ ok: boolean }>("/api/hrm/guide-content", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export async function listSalaryTemplateComponents(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ total: number; data: Record<string, unknown>[] }>(
    `/api/hrm/payroll/salary-templates/${templateId}/components?${search}`,
    { method: "GET" },
  );
}

export async function addSalaryTemplateComponent(
  templateId: string,
  payload: { company_id: string; component_id: string; default_value?: number; is_required?: boolean; sort_order?: number },
) {
  return requestHrm<Record<string, unknown>>(`/api/hrm/payroll/salary-templates/${templateId}/components`, {
    method: "POST",
    body: JSON.stringify({ ...payload, company_id: normalizeHrmApiListCompanyId(payload.company_id) }),
  });
}

export async function updateSalaryTemplateComponentRow(
  componentRowId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<Record<string, unknown>>(`/api/hrm/payroll/salary-template-components/${componentRowId}?${search}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function removeSalaryTemplateComponentRow(componentRowId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<{ id: string }>(`/api/hrm/payroll/salary-template-components/${componentRowId}?${search}`, {
    method: "DELETE",
  });
}

export async function duplicateSalaryTemplate(templateId: string, companyId: string) {
  const search = new URLSearchParams();
  setListCompanyId(search, companyId);
  return requestHrm<HrmSalaryTemplateRow>(`/api/hrm/payroll/salary-templates/${templateId}/duplicate?${search}`, {
    method: "POST",
  });
}

export async function listEmployeeAssets(
  employeeId: string,
  companyId: string,
  options?: { status?: string; termination_context_id?: string | null },
) {
  /**
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
   * change_mode: RETAIN
   * What: Physical GET /employees/:id/assets — paper /core alias DENY
   * Why: F-CORE-AST-01 O1 · Network MUST assets* · Nest /core = 0
   * must_keep: employeeProfileQuery company scope · no Asset ledger invent
   *
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
   * change_mode: ADD
   * What: Optional status=assigned (+ soft termination_context_id) for TERM checklist feed
   * Why: R-CORE-06-TERM-CHK-01 · FE still FE-filters assigned · Nest TERM dual DENY
   * must_keep: physical assets* · soft≠CORE-06 DONE · no /core
   */
  const q = employeeProfileQuery(companyId);
  const status = (options?.status ?? '').trim();
  if (status) q.set('status', status);
  const termCtx = (options?.termination_context_id ?? '').trim();
  if (termCtx) q.set('termination_context_id', termCtx);
  return requestHrm<ProfileListResult<Record<string, unknown>>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets?${q.toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeAsset(employeeId: string, companyId: string, payload: Record<string, unknown>) {
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeAsset(
  employeeId: string,
  assetId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  /**
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
   * change_mode: ADD
   * What: PATCH spine + F-CORE-AST-BB-01 handoverConfirmed flags (same path)
   * Why: Diễn biến #2 · AC-CORE-05-04 · serial conflict toast on 409
   * must_keep: notes ≠ BB · soft status prefer · no Nest /core
   *
   * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
   * change_mode: ADD
   * What: Same PATCH path = F-CORE-AST-02 soft-return/lost (status+return_date|notes) — DENY /return dual
   * Why: API-01 RETAIN cite · paper /core return alias only · Nest /core 0
   * must_keep: soft≠CORE-06 DONE · CORE-05 BB/serial · no PAY invent
   */
  return requestHrm<Record<string, unknown>>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets/${assetId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function deleteEmployeeAsset(employeeId: string, assetId: string, companyId: string) {
  return requestHrm<{ id: string }>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/assets/${assetId}?${employeeProfileQuery(companyId).toString()}`,
    { method: "DELETE" },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /fleet · Hồ sơ xe
 * UC:         FR-HRM-FL-01
 * BR:         FL-01 list-only · G-FL-02 keyword/q
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49 #2/#3/#4/#8
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · API_DESIGN_HRM_FLEET §A
 * Purpose:    GET danh sách xe theo ĐV; optional q/keyword; empty 200 honesty.
 * WorkItem:   D-FE-HRM-FLEET-CATALOG-UX-01
 * Coded:      2026-07-27
 * Callers:    hooks/useFleetVehicles.ts
 * Callees:    GET /api/hrm/fleet/vehicles
 * must_keep:  No POST/PUT invent · U65 · HOLD_DEPLOY
 * LastVerified: lib/fleetCatalogUx.test.ts
 */
export type HrmFleetVehicleRow = {
  id: string;
  tenant_id?: string;
  company_id?: string;
  license_plate: string;
  fleet_fields: Record<string, unknown>;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export async function listFleetVehicles(params: {
  company_id: string;
  status?: string;
  /** Prefer `q` (BE prefer q over keyword). */
  q?: string;
  keyword?: string;
  limit?: number;
}) {
  const search = new URLSearchParams();
  setListCompanyId(search, params.company_id);
  if (params.status?.trim()) search.set('status', params.status.trim());
  const q = (params.q ?? params.keyword ?? '').trim();
  if (q) search.set('q', q.slice(0, 100));
  if (params.limit != null) search.set('limit', String(params.limit));
  return requestHrm<{ total: number; data: HrmFleetVehicleRow[] }>(
    `/api/hrm/fleet/vehicles?${search.toString()}`,
    { method: 'GET' },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /settings — MergeToken registry client F-PLT-TOK-01..03
 * UC:         BR-PLT-01 · AC-PLT-CTR-05
 * BR:         soft-delete · DYNAMIC-LOCK · U19 company_id scope
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §6
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-*
 * Purpose:    Client GET/PUT/PATCH/retire/resolve-preview cho registry merge tokens.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-FE-01
 * Coded:      2026-08-07
 * Callers:    MergeTokenSettingsPanel
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId (DTO) · list query company_id · no seed · printable=false
 * SOLID:      Thin HTTP adapter — no FE resolve invent
 * solid_convention_ack: bind display-ready labelVi từ BE
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-fe-01.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   PO-HRM-MVP-GD1-PLT-01-CLUSTER-FE-01
 * Date:       2026-08-09
 * What:       RETAIN physical /api/hrm/merge-tokens* F-PLT-TOK-01/02/03 —
 *             list/get · upsert/retire · resolve-preview; DTO display-ready
 *             tokenKey·labelVi·status·ring·domain·archivedAt; DENY Nest /core dual.
 * Why:        API-01 CONFIRMED RETAIN · UC-BP-PLT-01 · U65 · Dev-BE HOLD
 * must_keep:  no /api/hrm/core/ SoT · soft-retire only · resolve-preview ≠ VER write
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-plt-01-cluster-fe-01.md
 */

export type HrmMergeTokenRecord = {
  id: string;
  companyId: string;
  tokenKey: string;
  sourcePath: string;
  ring: string;
  domain: string;
  labelVi: string;
  status: string;
  origin: string;
  extensionFieldRef?: string | null;
  meta?: Record<string, unknown> | null;
  version?: number;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type HrmMergeTokenResolveToken = {
  tokenKey: string;
  displayToken?: string;
  source: string;
  sourcePath?: string;
  ring?: string;
  value?: unknown;
  masked?: boolean;
  warning?: string;
};

export type HrmMergeTokenResolvePreview = {
  companyId?: string;
  templateId?: string;
  resolveOrder?: string;
  tokens: HrmMergeTokenResolveToken[];
  mergedPreview?: Record<string, unknown>;
  warnings?: string[];
};

export type UpsertMergeTokenPayload = {
  companyId: string;
  tokenKey: string;
  sourcePath: string;
  ring: string;
  domain: string;
  labelVi: string;
  status?: string;
  origin?: string;
  extensionFieldRef?: string;
  meta?: Record<string, unknown>;
};

export async function listMergeTokens(params: {
  company_id: string;
  domain?: string;
  status?: string;
  ring?: string;
  origin?: string;
  include_archived?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.domain) search.set("domain", params.domain);
  if (params.status) search.set("status", params.status);
  if (params.ring) search.set("ring", params.ring);
  if (params.origin) search.set("origin", params.origin);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ items?: HrmMergeTokenRecord[]; total?: number } | HrmMergeTokenRecord[]>(
    `/api/hrm/merge-tokens?${search.toString()}`,
    { method: "GET" },
  );
  const items = unwrapItems<HrmMergeTokenRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function getMergeTokenById(tokenId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmMergeTokenRecord>(
    `/api/hrm/merge-tokens/${tokenId}?${search.toString()}`,
    { method: "GET" },
  );
}

/** Preferred BR-PLT-01 path — upsert by (company_id, token_key). */
export async function upsertMergeToken(payload: UpsertMergeTokenPayload) {
  return requestHrm<HrmMergeTokenRecord>("/api/hrm/merge-tokens", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function createMergeToken(payload: UpsertMergeTokenPayload) {
  return requestHrm<HrmMergeTokenRecord>("/api/hrm/merge-tokens", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function patchMergeToken(
  tokenId: string,
  companyId: string,
  payload: Partial<
    Pick<
      UpsertMergeTokenPayload,
      | "sourcePath"
      | "ring"
      | "domain"
      | "labelVi"
      | "status"
      | "origin"
      | "extensionFieldRef"
      | "meta"
    >
  >,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmMergeTokenRecord>(
    `/api/hrm/merge-tokens/${tokenId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function retireMergeToken(tokenId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmMergeTokenRecord>(
    `/api/hrm/merge-tokens/${tokenId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function resolveMergeTokenPreview(payload: {
  companyId: string;
  templateId?: string;
  contractId?: string;
  domain?: string;
  tokenKeys?: string[];
  fieldOverrides?: Record<string, unknown>;
  canViewCb?: boolean;
  strict?: boolean;
}) {
  return requestHrm<HrmMergeTokenResolvePreview>("/api/hrm/merge-tokens/resolve-preview", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · ATT CFG — F-ATT-CAT-LVT/EFF client
 * UC:         AC-PLT-ATT-01..03 · BR-PLT-02/04/05/06
 * BR:         open catalog · soft-delete retire · U19 company_id scope
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §3
 * API_DESIGN: F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01
 * Purpose:    Client GET/POST/PUT/PATCH/retire + effective cho att_leave_type.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
 * Coded:      2026-08-07
 * Callers:    AttLeaveTypeSettingsPanel · useAttLeaveTypesEffective
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId · list query company_id · no LVT closed enum · U65 · work_shifts untouched
 * solid_convention_ack: bind nameVi/leaveTypeKey display-ready từ BE
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md
 */

export type HrmAttLeaveTypeRecord = {
  id: string;
  companyId: string;
  leaveTypeKey: string;
  nameVi: string;
  category: string;
  isPaid?: boolean;
  allowsCarryOver?: boolean;
  allowsAdvance?: boolean;
  insuranceRegimeFlag?: boolean;
  companyTopupFlag?: boolean;
  countsTowardTimesheet?: boolean;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertAttLeaveTypePayload = {
  companyId: string;
  leaveTypeKey: string;
  nameVi: string;
  category: string;
  isPaid?: boolean;
  allowsCarryOver?: boolean;
  allowsAdvance?: boolean;
  insuranceRegimeFlag?: boolean;
  companyTopupFlag?: boolean;
  countsTowardTimesheet?: boolean;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listAttLeaveTypes(params: {
  company_id: string;
  status?: string;
  category?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ total?: number; data?: HrmAttLeaveTypeRecord[] } | HrmAttLeaveTypeRecord[]>(
    `/api/hrm/attendance/leave-types?${search.toString()}`,
    { method: "GET" },
  );
  const items = unwrapItems<HrmAttLeaveTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveAttLeaveTypes(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ total?: number; data?: HrmAttLeaveTypeRecord[] } | HrmAttLeaveTypeRecord[]>(
    `/api/hrm/attendance/leave-types/effective?${search.toString()}`,
    { method: "GET" },
  );
  const items = unwrapItems<HrmAttLeaveTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function getAttLeaveTypeById(leaveTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttLeaveTypeRecord>(
    `/api/hrm/attendance/leave-types/${leaveTypeId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function upsertAttLeaveType(payload: UpsertAttLeaveTypePayload) {
  return requestHrm<HrmAttLeaveTypeRecord>("/api/hrm/attendance/leave-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function createAttLeaveType(payload: UpsertAttLeaveTypePayload) {
  return requestHrm<HrmAttLeaveTypeRecord>("/api/hrm/attendance/leave-types", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function patchAttLeaveType(
  leaveTypeId: string,
  companyId: string,
  payload: Partial<
    Pick<
      UpsertAttLeaveTypePayload,
      | "nameVi"
      | "category"
      | "isPaid"
      | "allowsCarryOver"
      | "allowsAdvance"
      | "insuranceRegimeFlag"
      | "companyTopupFlag"
      | "countsTowardTimesheet"
      | "metadata"
      | "status"
    >
  >,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttLeaveTypeRecord>(
    `/api/hrm/attendance/leave-types/${leaveTypeId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function retireAttLeaveType(leaveTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttLeaveTypeRecord>(
    `/api/hrm/attendance/leave-types/${leaveTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /attendance → Quy tắc quỹ phép · HR grant entitled (ATT-04)
 * UC:         UC-BP-ATT-04 · FR-UC-BP-ATT-04 · peer ATT-09 tracked-entitlement
 * API_DESIGN: F-ATT-LVRULE-01..04 · PUT leave-balance/tracked-entitlement
 * Purpose:    Client CRUD leave-accrual-policies + HR upsert entitled_days — physical /attendance/*
 * WorkItem:   PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * must_keep:  Nest /core DENY · DENY att_leave_hold · FY/engine HOLD · U65 · C-SLICE
 * solid_convention_ack: display-ready bind từ BE — statusLabelVi FE-derive khi thiếu
 * LastVerified: poHrmMvpGd1Att04ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: carryOverExpireRule · carryCapDays on policy DTO
 * Why: F-ATT-LVRULE RETAIN · J-HRM-ATT-05-03
 * must_keep: advance cap 04b · Nest /core DENY · U65
 */

export type HrmAttLeaveAccrualPolicyRecord = {
  id: string;
  companyId: string;
  leaveTypeKey: string;
  leaveTypeNameVi?: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  accrualMode: string;
  accrualModeLabel?: string;
  annualDays: number;
  unit: string;
  allowNegative?: boolean;
  advanceMaxDays?: number | null;
  advanceCapPercent?: number | null;
  carryOverExpireRule?: string | null;
  carryCapDays?: number | null;
  carryOverExpireRuleLabelVi?: string | null;
  status: string;
  statusLabel?: string;
  statusLabelVi?: string;
  archivedAt?: string | null;
};

export type CreateAttLeaveAccrualPolicyPayload = {
  companyId: string;
  leaveTypeKey: string;
  accrualMode: string;
  annualDays?: number;
  unit?: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  version?: number;
  status?: string;
  advanceMaxDays?: number | null;
  advanceCapPercent?: number | null;
  carryOverExpireRule?: string | null;
  carryCapDays?: number | null;
};

export type PatchAttLeaveAccrualPolicyPayload = Partial<
  Omit<CreateAttLeaveAccrualPolicyPayload, 'companyId' | 'leaveTypeKey'>
>;

export async function listAttLeaveAccrualPolicies(params: {
  company_id: string;
  leave_type_key?: string;
  status?: string;
  include_inactive?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.leave_type_key) search.set("leave_type_key", params.leave_type_key);
  if (params.status) search.set("status", params.status);
  if (params.include_inactive) search.set("include_inactive", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmAttLeaveAccrualPolicyRecord[] } | HrmAttLeaveAccrualPolicyRecord[]
  >(`/api/hrm/attendance/leave-accrual-policies?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmAttLeaveAccrualPolicyRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function createAttLeaveAccrualPolicy(payload: CreateAttLeaveAccrualPolicyPayload) {
  return requestHrm<HrmAttLeaveAccrualPolicyRecord>("/api/hrm/attendance/leave-accrual-policies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patchAttLeaveAccrualPolicy(
  policyId: string,
  companyId: string,
  payload: PatchAttLeaveAccrualPolicyPayload,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttLeaveAccrualPolicyRecord>(
    `/api/hrm/attendance/leave-accrual-policies/${policyId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function retireAttLeaveAccrualPolicy(policyId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmAttLeaveAccrualPolicyRecord>(
    `/api/hrm/attendance/leave-accrual-policies/${policyId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export type UpsertTrackedLeaveEntitlementPayload = {
  company_id: string;
  employee_id: string;
  leave_type?: string;
  balance_year?: number;
  entitled_days: number;
};

export async function putTrackedLeaveEntitlement(payload: UpsertTrackedLeaveEntitlementPayload) {
  return requestHrm<LeaveBalancePayload>("/api/hrm/attendance/leave-balance/tracked-entitlement", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · REC CFG — F-REC-CAT-STG/EFF client
 * UC:         AC-PLT-REC-02..05 · BR-PLT-02/04/05/06
 * BR:         open catalog · soft-delete retire · U19 company_id scope
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §3
 * API_DESIGN: F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01
 * Purpose:    Client GET/POST/PUT/PATCH/retire + effective cho rec_pipeline_stage.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * Coded:      2026-08-07
 * Callers:    RecPipelineStageSettingsPanel · useRecPipelineStagesEffective
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId · list query company_id · no six closed enum · U65 · JD/IV/YCTD
 * solid_convention_ack: bind nameVi/stageKey/hiredOutcomeKey display-ready từ BE
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-fe-01.md
 */

export type HrmRecPipelineStageRecord = {
  id: string;
  companyId: string;
  stageKey: string;
  nameVi: string;
  sortOrder?: number;
  isTerminal?: boolean;
  isHiredOutcome?: boolean;
  isRejectOutcome?: boolean;
  allowsInterviewSchedule?: boolean;
  /** O2 / F-REC-HIRE — accept-offer gate (optional EFF flag). */
  allowsAcceptOffer?: boolean;
  wfTaskTypeKey?: string | null;
  colorToken?: string | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertRecPipelineStagePayload = {
  companyId: string;
  stageKey: string;
  nameVi: string;
  sortOrder?: number;
  isTerminal?: boolean;
  isHiredOutcome?: boolean;
  isRejectOutcome?: boolean;
  allowsInterviewSchedule?: boolean;
  wfTaskTypeKey?: string | null;
  colorToken?: string | null;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listRecPipelineStages(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ total?: number; data?: HrmRecPipelineStageRecord[] } | HrmRecPipelineStageRecord[]>(
    `/api/hrm/recruitment/pipeline-stages?${search.toString()}`,
    { method: "GET" },
  );
  const items = unwrapItems<HrmRecPipelineStageRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveRecPipelineStages(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    | { total?: number; data?: HrmRecPipelineStageRecord[]; hiredOutcomeKey?: string | null }
    | HrmRecPipelineStageRecord[]
  >(`/api/hrm/recruitment/pipeline-stages/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmRecPipelineStageRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  const hiredOutcomeKey =
    res && typeof res === "object" && !Array.isArray(res) && "hiredOutcomeKey" in res
      ? (res.hiredOutcomeKey ?? null)
      : items.find((r) => r.isHiredOutcome)?.stageKey ?? null;
  return { items, total, hiredOutcomeKey };
}

export async function getRecPipelineStageById(stageId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecPipelineStageRecord>(
    `/api/hrm/recruitment/pipeline-stages/${stageId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function upsertRecPipelineStage(payload: UpsertRecPipelineStagePayload) {
  return requestHrm<HrmRecPipelineStageRecord>("/api/hrm/recruitment/pipeline-stages", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function createRecPipelineStage(payload: UpsertRecPipelineStagePayload) {
  return requestHrm<HrmRecPipelineStageRecord>("/api/hrm/recruitment/pipeline-stages", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function patchRecPipelineStage(
  stageId: string,
  companyId: string,
  payload: Partial<
    Pick<
      UpsertRecPipelineStagePayload,
      | "nameVi"
      | "sortOrder"
      | "isTerminal"
      | "isHiredOutcome"
      | "isRejectOutcome"
      | "allowsInterviewSchedule"
      | "wfTaskTypeKey"
      | "colorToken"
      | "metadata"
      | "status"
    >
  >,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecPipelineStageRecord>(
    `/api/hrm/recruitment/pipeline-stages/${stageId}?${search.toString()}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function retireRecPipelineStage(stageId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmRecPipelineStageRecord>(
    `/api/hrm/recruitment/pipeline-stages/${stageId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · EMP CFG — F-EMP-CAT-DOC/ET/EFF client
 * UC:         AC-PLT-EMP-02..05 · BR-PLT-02/04/05/06
 * BR:         open catalog · soft-delete retire · U19 company_id scope · format-only keys
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md §3
 * API_DESIGN: F-EMP-CAT-DOC-01/02 · F-EMP-CAT-ET-01/02 · F-EMP-CAT-EFF-01/02
 * Purpose:    Client GET/POST/PUT/PATCH/retire + effective cho emp_document_type + emp_employment_type.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * Coded:      2026-08-07
 * Callers:    EmpDocumentTypeSettingsPanel · EmpEmploymentTypeSettingsPanel · useEmp*Effective
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId · list query company_id · no closed CCCD/FULL_TIME enum · soft-delete · AC-PLT-EMP-01 XBOS position · U65
 * solid_convention_ack: bind nameVi/*TypeKey display-ready từ BE — hrm_personnel_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
 */

export type HrmEmpDocumentTypeRecord = {
  id: string;
  companyId: string;
  documentTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  requiredByDefault?: boolean;
  requiresExpiry?: boolean;
  blocksActivation?: boolean;
  isIdentityDoc?: boolean;
  allowedMime?: unknown;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertEmpDocumentTypePayload = {
  companyId: string;
  documentTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  requiredByDefault?: boolean;
  requiresExpiry?: boolean;
  blocksActivation?: boolean;
  isIdentityDoc?: boolean;
  allowedMime?: unknown;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listEmpDocumentTypes(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmEmpDocumentTypeRecord[] } | HrmEmpDocumentTypeRecord[]
  >(`/api/hrm/employees/document-types?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpDocumentTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveEmpDocumentTypes(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmEmpDocumentTypeRecord[] } | HrmEmpDocumentTypeRecord[]
  >(`/api/hrm/employees/document-types/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpDocumentTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertEmpDocumentType(payload: UpsertEmpDocumentTypePayload) {
  return requestHrm<HrmEmpDocumentTypeRecord>("/api/hrm/employees/document-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireEmpDocumentType(documentTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmEmpDocumentTypeRecord>(
    `/api/hrm/employees/document-types/${documentTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export type HrmEmpEmploymentTypeRecord = {
  id: string;
  companyId: string;
  employmentTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  countsTowardHeadcount?: boolean;
  eligibleForSi?: boolean;
  isContingent?: boolean;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertEmpEmploymentTypePayload = {
  companyId: string;
  employmentTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  countsTowardHeadcount?: boolean;
  eligibleForSi?: boolean;
  isContingent?: boolean;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listEmpEmploymentTypes(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmEmpEmploymentTypeRecord[] } | HrmEmpEmploymentTypeRecord[]
  >(`/api/hrm/employees/employment-types?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpEmploymentTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveEmpEmploymentTypes(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmEmpEmploymentTypeRecord[] } | HrmEmpEmploymentTypeRecord[]
  >(`/api/hrm/employees/employment-types/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpEmploymentTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertEmpEmploymentType(payload: UpsertEmpEmploymentTypePayload) {
  return requestHrm<HrmEmpEmploymentTypeRecord>("/api/hrm/employees/employment-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireEmpEmploymentType(employmentTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmEmpEmploymentTypeRecord>(
    `/api/hrm/employees/employment-types/${employmentTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → checklist giấy tờ · F-CORE-CHK-01
 * UC:         UC-BP-CORE-03 · FR-UC-BP-CORE-03 Diễn biến #1–#2
 * BR:         BR-BP-DOC-01 · BR-PLT-02 · BR-CORE-03-PATH · AC-CORE-03-06..08
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-03
 * API_DESIGN: docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md F-CORE-CHK-01
 * Purpose:    Client GET/POST/PATCH …/employees/:id/document-checklist* — physical SoT only;
 *             paper /core alias DENY; DOC/ET catalog RETAIN on document-types* / employment-types*.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    useEmployeeDocumentChecklist
 * Callees:    requestHrm · employeeProfileQuery
 * must_keep:  Nest /core DENY · no invent DOC SoT · U65 empty OK · CORE-07 OUT · honesty false
 * solid_convention_ack: bind display-ready nameVi/flags from BE — FE không invent required starter
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-fe-01.md
 */

export type HrmDocumentChecklistItem = {
  id: string;
  employeeId: string;
  companyId: string;
  documentTypeKey: string;
  required: boolean;
  status: string;
  statusLabel?: string | null;
  fileRef?: string | null;
  archivedAt?: string | null;
  nameVi?: string | null;
  sortOrder?: number | null;
  requiredByDefault?: boolean | null;
  blocksActivation?: boolean | null;
  requiresExpiry?: boolean | null;
  catalogStatus?: string | null;
  source?: string | null;
  catalogKind?: string | null;
  tokenKey?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function unwrapDocumentChecklistList(
  res:
    | { total?: number; data?: HrmDocumentChecklistItem[] }
    | HrmDocumentChecklistItem[]
    | null
    | undefined,
): { total: number; data: HrmDocumentChecklistItem[] } {
  const items = unwrapItems<HrmDocumentChecklistItem>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { total, data: items };
}

export async function listEmployeeDocumentChecklist(employeeId: string, companyId: string) {
  const res = await requestHrm<
    { total?: number; data?: HrmDocumentChecklistItem[] } | HrmDocumentChecklistItem[]
  >(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/document-checklist?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
  return unwrapDocumentChecklistList(res);
}

export async function getEmployeeDocumentChecklistItem(
  employeeId: string,
  itemId: string,
  companyId: string,
) {
  return requestHrm<HrmDocumentChecklistItem>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/document-checklist/${encodeURIComponent(itemId)}?${employeeProfileQuery(companyId).toString()}`,
    { method: "GET" },
  );
}

export async function createEmployeeDocumentChecklistItem(
  employeeId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<HrmDocumentChecklistItem>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/document-checklist?${employeeProfileQuery(companyId).toString()}`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function updateEmployeeDocumentChecklistItem(
  employeeId: string,
  itemId: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  return requestHrm<HrmDocumentChecklistItem>(
    `/api/hrm/employees/${encodeURIComponent(employeeId)}/document-checklist/${encodeURIComponent(itemId)}?${employeeProfileQuery(companyId).toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

/** Soft-archive — PATCH archivedAt (same SoT; DENY hard DELETE sole path). */
export async function archiveEmployeeDocumentChecklistItem(
  employeeId: string,
  itemId: string,
  companyId: string,
) {
  return updateEmployeeDocumentChecklistItem(employeeId, itemId, companyId, {
    archive: true,
  });
}

/**
 * @CODE-MEMORY
 * Screen:     /employees form + Settings EMP ST/STR CFG — F-EMP-CAT-ST/STR + EFF client
 * UC:         AC-PLT-EMP-STATUS-01* · VAL-EMP-ST-CNS-02 · VAL-EMP-STR-CNS-01
 * BR:         Nest emp_employment_status + emp_status_reason SoT when EFF>0; invent → HRM-EMP-STATUS-KEY / REASON-KEY
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-SA-01.md Option A LOCKED
 * API_DESIGN: F-EMP-CAT-ST-01..04 · F-EMP-CAT-STR-01/02 · F-EMP-CAT-ST-EFF-01 · F-EMP-CAT-STR-EFF-01
 * Purpose:    Client GET/PUT/retire + effective cho employment-statuses + status-reasons (sealed Nest KEY).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    useEmpEmploymentStatusesEffective · useEmpStatusReasonsEffective · Emp*Status*SettingsPanel
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  L1 EMPSTQA-MSK20G7H RETAIN · U65 no seed · personnel=false · ST/STR KEY ·
 *             EMP-CUSTOM · ATT seals · LVRULE HOLD · Nest pos/dept DENY · no dual writer
 * solid_convention_ack: FE bind statusKey/nameVi/requiresReason display-ready — không invent SoT
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-status-fe-admin-build-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What:       list/upsert/retire employment-statuses + status-reasons (admin twin — sealed Nest path)
 * Why:        Sponsor UNLOCK R-PLT-EMP-ST-FE-ADMIN ABSENT twin · peer DEC/ET Settings
 * must_keep:  no new Nest routes · no dual writer · pos/dept Nest DENY · honesty false · C-SLICE
 */

export type HrmEmpEmploymentStatusRecord = {
  id: string;
  companyId: string;
  statusKey: string;
  nameVi: string;
  /** Display-ready status_label alias (OS 28). */
  statusLabel?: string;
  sortOrder?: number;
  isWorkforceActive?: boolean;
  isTerminal?: boolean;
  requiresReason?: boolean;
  countsTowardHeadcount?: boolean;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

/** Alias — effective shape matches admin record (display-ready). */
export type HrmEmpEmploymentStatusEffectiveRecord = HrmEmpEmploymentStatusRecord;

export type HrmEmpStatusReasonRecord = {
  id: string;
  companyId: string;
  reasonKey: string;
  nameVi: string;
  sortOrder?: number;
  appliesToStatusKeys?: string[] | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type HrmEmpStatusReasonEffectiveRecord = HrmEmpStatusReasonRecord;

export type UpsertEmpEmploymentStatusPayload = {
  companyId: string;
  statusKey: string;
  nameVi: string;
  sortOrder?: number;
  isWorkforceActive?: boolean;
  isTerminal?: boolean;
  requiresReason?: boolean;
  countsTowardHeadcount?: boolean;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown>;
  status?: string;
};

export type UpsertEmpStatusReasonPayload = {
  companyId: string;
  reasonKey: string;
  nameVi: string;
  sortOrder?: number;
  appliesToStatusKeys?: string[];
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listEmpEmploymentStatuses(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    | { total?: number; data?: HrmEmpEmploymentStatusRecord[] }
    | HrmEmpEmploymentStatusRecord[]
  >(`/api/hrm/employees/employment-statuses?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpEmploymentStatusRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveEmploymentStatuses(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    | { total?: number; data?: HrmEmpEmploymentStatusEffectiveRecord[] }
    | HrmEmpEmploymentStatusEffectiveRecord[]
  >(`/api/hrm/employees/employment-statuses/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpEmploymentStatusEffectiveRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertEmpEmploymentStatus(payload: UpsertEmpEmploymentStatusPayload) {
  return requestHrm<HrmEmpEmploymentStatusRecord>("/api/hrm/employees/employment-statuses", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireEmpEmploymentStatus(statusId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmEmpEmploymentStatusRecord>(
    `/api/hrm/employees/employment-statuses/${statusId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function listEmpStatusReasons(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  applies_to_status_key?: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.applies_to_status_key?.trim()) {
    search.set("applies_to_status_key", params.applies_to_status_key.trim());
  }
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmEmpStatusReasonRecord[] } | HrmEmpStatusReasonRecord[]
  >(`/api/hrm/employees/status-reasons?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpStatusReasonRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveStatusReasons(params: {
  company_id: string;
  q?: string;
  applies_to_status_key?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.applies_to_status_key?.trim()) {
    search.set("applies_to_status_key", params.applies_to_status_key.trim());
  }
  const res = await requestHrm<
    | { total?: number; data?: HrmEmpStatusReasonEffectiveRecord[] }
    | HrmEmpStatusReasonEffectiveRecord[]
  >(`/api/hrm/employees/status-reasons/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmEmpStatusReasonEffectiveRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertEmpStatusReason(payload: UpsertEmpStatusReasonPayload) {
  return requestHrm<HrmEmpStatusReasonRecord>("/api/hrm/employees/status-reasons", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireEmpStatusReason(reasonId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmEmpStatusReasonRecord>(
    `/api/hrm/employees/status-reasons/${reasonId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · DEC CFG — F-DEC-CAT-TYP/EFF client
 * UC:         AC-PLT-DEC-01..06 · BR-PLT-02/04/05/06 · VAL-DEC-CNS
 * BR:         open catalog · soft-delete retire · U19 company_id scope · HRD_* case allowed
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md §3
 * API_DESIGN: F-DEC-CAT-TYP-01/02 · F-DEC-CAT-EFF-01
 * Purpose:    Client GET/PUT/retire + effective cho hr_decision_type (dual SoT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
 * Coded:      2026-08-07
 * Callers:    DecDecisionTypeSettingsPanel · useDecDecisionTypesEffective · Decisions.tsx
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId · list query company_id · no closed HRD enum · soft-delete · F-CORE-DEC · U65
 * solid_convention_ack: bind nameVi/decisionTypeKey/flags display-ready từ BE — decisions UAT=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md
 */

export type HrmDecDecisionTypeRecord = {
  id: string;
  companyId: string;
  decisionTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  isPersonBound?: boolean;
  writesWorkHistory?: boolean;
  whEventType?: string | null;
  requiresPositionKey?: boolean;
  legacyAliasKeys?: string[] | null;
  colorToken?: string | null;
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertDecDecisionTypePayload = {
  companyId: string;
  decisionTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  isPersonBound?: boolean;
  writesWorkHistory?: boolean;
  whEventType?: string | null;
  requiresPositionKey?: boolean;
  legacyAliasKeys?: string[];
  colorToken?: string | null;
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listDecDecisionTypes(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  person_bound_only?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.person_bound_only) search.set("person_bound_only", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmDecDecisionTypeRecord[] } | HrmDecDecisionTypeRecord[]
  >(`/api/hrm/decisions/decision-types?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmDecDecisionTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveDecDecisionTypes(params: {
  company_id: string;
  q?: string;
  person_bound_only?: boolean;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.person_bound_only) search.set("person_bound_only", "true");
  const res = await requestHrm<
    { total?: number; data?: HrmDecDecisionTypeRecord[] } | HrmDecDecisionTypeRecord[]
  >(`/api/hrm/decisions/decision-types/effective?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmDecDecisionTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertDecDecisionType(payload: UpsertDecDecisionTypePayload) {
  return requestHrm<HrmDecDecisionTypeRecord>("/api/hrm/decisions/decision-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireDecDecisionType(decisionTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmDecDecisionTypeRecord>(
    `/api/hrm/decisions/decision-types/${decisionTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /settings — tab Chức danh công việc (job_titles catalog)
 * UC:         HRM-SC-01..03 · FR-HRM-RC-JD-01
 * BR:         job_titles là prerequisite cho JD templates và YCTD
 * Purpose:    Client CRUD cho job_titles catalog via settings-catalogs API
 * WorkItem:   PO-HRM-SETTINGS-JOB-TITLES-FE-01
 * Coded:      2026-08-24
 * Callers:    CatalogJobTitlesSettingsPanel
 * Callees:    requestHrm · normalizeHrmApiListCompanyId · inferRuntimeScope
 * must_keep:  catalog_key=job_titles · soft-delete via status=draft · FR-HRM-RC-JD-01 dependency
 */

export type HrmJobTitleRecord = {
  code: string;
  label: string;
  unit: string | null;
  status: "active" | "draft";
  origin: "xbos" | "hrm";
};

export async function listJobTitles(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const scope = inferRuntimeScope();
  const res = await requestHrm<{ catalog_key: string; data: HrmJobTitleRecord[] }>(
    `/api/hrm/settings-catalogs/job_titles/items?${search.toString()}`,
    { method: "GET" },
  );
  return res.data ?? [];
}

export type UpsertJobTitlePayload = {
  companyId: string;
  code: string;
  label: string;
  itemValue?: string;
  status?: "active" | "draft";
};

export async function upsertJobTitle(payload: UpsertJobTitlePayload) {
  const scope = inferRuntimeScope();
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/items`, {
    method: "POST",
    headers: await headers({ scope }),
    body: JSON.stringify({
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
      catalogKey: "job_titles",
      code: payload.code.trim(),
      label: payload.label.trim(),
      itemValue: payload.itemValue ?? null,
      status: payload.status ?? "active",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      code: json.code ?? "HRM-SET-ITEM-UPSERT-FAILED",
      message: json.message ?? "Không lưu được chức danh.",
    });
  }
  return json.data as HrmJobTitleRecord;
}

export async function retireJobTitle(code: string, companyId: string) {
  const scope = inferRuntimeScope();
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/items`, {
    method: "PATCH",
    headers: await headers({ scope }),
    body: JSON.stringify({
      companyId: normalizeHrmApiListCompanyId(companyId),
      catalogKey: "job_titles",
      code: code.trim(),
      status: "draft",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      code: json.code ?? "HRM-SET-ITEM-RETIRE-FAILED",
      message: json.message ?? "Không ngừng được chức danh.",
    });
  }
  return json.data as HrmJobTitleRecord;
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · SI CFG — F-SI-CAT-TYP/EFF client
 * UC:         AC-PLT-SI-INS-01..01d · BR-PLT-02/04/05/06 · FR-UC-BP-CORE-10
 * BR:         open catalog · soft-delete retire · U19 company_id scope
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md §6
 * API_DESIGN: F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01
 * Purpose:    Client GET/POST/PUT/PATCH/retire + effective cho si_insurance_type.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    SiInsuranceTypeSettingsPanel · useSiInsuranceTypesEffective
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId · list query company_id · no BHXH closed enum · enrollment/CTR seals · U65
 * solid_convention_ack: bind nameVi/insuranceTypeKey display-ready từ BE
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-fe-01.md
 */

export type HrmSiInsuranceTypeRecord = {
  id: string;
  companyId: string;
  insuranceTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  isStatutory?: boolean;
  eligibleForRateCfg?: boolean;
  requiresPolicy?: boolean;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertSiInsuranceTypePayload = {
  companyId: string;
  insuranceTypeKey: string;
  nameVi: string;
  sortOrder?: number;
  isStatutory?: boolean;
  eligibleForRateCfg?: boolean;
  requiresPolicy?: boolean;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listSiInsuranceTypes(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmSiInsuranceTypeRecord[] } | HrmSiInsuranceTypeRecord[]
  >(`/api/hrm/contracts-insurance/insurance-types?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmSiInsuranceTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveSiInsuranceTypes(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmSiInsuranceTypeRecord[] } | HrmSiInsuranceTypeRecord[]
  >(`/api/hrm/contracts-insurance/insurance-types/effective?${search.toString()}`, {
    method: "GET",
  });
  const items = unwrapItems<HrmSiInsuranceTypeRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertSiInsuranceType(payload: UpsertSiInsuranceTypePayload) {
  return requestHrm<HrmSiInsuranceTypeRecord>("/api/hrm/contracts-insurance/insurance-types", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function createSiInsuranceType(payload: UpsertSiInsuranceTypePayload) {
  return requestHrm<HrmSiInsuranceTypeRecord>("/api/hrm/contracts-insurance/insurance-types", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireSiInsuranceType(insuranceTypeId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmSiInsuranceTypeRecord>(
    `/api/hrm/contracts-insurance/insurance-types/${insuranceTypeId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /settings · SI CFG — F-SI-CAT-INS/EFF client
 * UC:         AC-PLT-SI-INSURER-01..01d · BR-PLT-02/04/05/06 · FR-UC-BP-CORE-10 · E3 AC-INS-02
 * BR:         open catalog · soft-delete retire · U19 company_id scope
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md §6
 * API_DESIGN: F-SI-CAT-INS-01/02 · F-SI-CAT-INS-EFF-01
 * Purpose:    Client GET/POST/PUT/PATCH/retire + effective cho si_insurer (tách SI type).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    SiInsurerSettingsPanel · useSiInsurersEffective
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  body camelCase companyId · list query company_id · no VSS closed enum · SI type L1 RETAIN · enrollment/CTR seals · U65
 * solid_convention_ack: bind nameVi/insurerKey display-ready từ BE
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md
 */

export type HrmSiInsurerRecord = {
  id: string;
  companyId: string;
  insurerKey: string;
  nameVi: string;
  sortOrder?: number;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown> | null;
  status: string;
  source?: string;
  catalogKind?: string;
  archivedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export type UpsertSiInsurerPayload = {
  companyId: string;
  insurerKey: string;
  nameVi: string;
  sortOrder?: number;
  legacyAliasKeys?: string[];
  metadata?: Record<string, unknown>;
  status?: string;
};

export async function listSiInsurers(params: {
  company_id: string;
  status?: string;
  include_archived?: boolean;
  include_group_ref?: boolean;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.include_group_ref) search.set("include_group_ref", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmSiInsurerRecord[] } | HrmSiInsurerRecord[]
  >(`/api/hrm/contracts-insurance/insurers?${search.toString()}`, { method: "GET" });
  const items = unwrapItems<HrmSiInsurerRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function listEffectiveSiInsurers(params: {
  company_id: string;
  q?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<
    { total?: number; data?: HrmSiInsurerRecord[] } | HrmSiInsurerRecord[]
  >(`/api/hrm/contracts-insurance/insurers/effective?${search.toString()}`, {
    method: "GET",
  });
  const items = unwrapItems<HrmSiInsurerRecord>(res);
  const total =
    res && typeof res === "object" && !Array.isArray(res) && typeof res.total === "number"
      ? res.total
      : items.length;
  return { items, total };
}

export async function upsertSiInsurer(payload: UpsertSiInsurerPayload) {
  return requestHrm<HrmSiInsurerRecord>("/api/hrm/contracts-insurance/insurers", {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function createSiInsurer(payload: UpsertSiInsurerPayload) {
  return requestHrm<HrmSiInsurerRecord>("/api/hrm/contracts-insurance/insurers", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
    }),
  });
}

export async function retireSiInsurer(insurerId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmSiInsurerRecord>(
    `/api/hrm/contracts-insurance/insurers/${insurerId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Công thức lương — Nest client F-PAY-FORMULA-*
 * UC:         FR-UC-BP-PAY-02 · AC-PAY-FORMULA-01..05
 * BR:         Option A dual-control · opaque expression · R-PAY-DD-01 Form GĐ1
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7
 * API_DESIGN: F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW
 * Purpose:    Wire `/api/hrm/payroll/formulas*` — FE pass-through display-ready; không evaluate net.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01
 * Coded:      2026-08-07
 * Callers:    PayFormulaAuthorPanel
 * Callees:    requestHrm · normalizeHrmApiListCompanyId
 * must_keep:  payroll_e2e_ready=false · preview stub honest · cấm salary_components.formula SoT
 * solid_convention_ack: FE–BE boundary — amounts/preview chỉ từ BE; FE không invent evaluator
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-01.md
 */
export type HrmPayFormulaStatus = "draft" | "pending_publish" | "active" | "retired";

export type HrmPayFormulaRecord = {
  id: string;
  companyId: string;
  code: string;
  version: number;
  status: HrmPayFormulaStatus | string;
  expressionJson: Record<string, unknown> | null;
  requiredVarsJson: { keys?: string[] } | Record<string, unknown> | string[] | null;
  label: string | null;
  authoredBy: string | null;
  authoredAt: string | null;
  publishedBy: string | null;
  publishedAt: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  archivedAt: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreatePayFormulaPayload = {
  company_id: string;
  code: string;
  expressionJson: Record<string, unknown>;
  requiredVarsJson?: { keys: string[] } | string[];
  label?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
};

export type UpdatePayFormulaPayload = {
  company_id: string;
  expressionJson?: Record<string, unknown>;
  requiredVarsJson?: { keys: string[] } | string[];
  label?: string;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

export async function listPayFormulas(
  params: {
    company_id: string;
    code?: string;
    status?: string;
    active_only?: boolean;
    include_archived?: boolean;
    q?: string;
  },
  opts?: { signal?: AbortSignal; timeoutMs?: number },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.code?.trim()) search.set("code", params.code.trim());
  if (params.status?.trim()) search.set("status", params.status.trim());
  if (params.active_only !== undefined) search.set("active_only", String(params.active_only));
  if (params.include_archived !== undefined) {
    search.set("include_archived", String(params.include_archived));
  }
  if (params.q?.trim()) search.set("q", params.q.trim());
  const res = await requestHrm<{ items?: HrmPayFormulaRecord[] } | HrmPayFormulaRecord[]>(
    `/api/hrm/payroll/formulas?${search.toString()}`,
    { method: "GET", signal: opts?.signal },
    { timeoutMs: opts?.timeoutMs },
  );
  return { items: unwrapItems<HrmPayFormulaRecord>(res) };
}

export async function getPayFormulaById(formulaId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPayFormulaRecord>(
    `/api/hrm/payroll/formulas/${formulaId}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createPayFormula(payload: CreatePayFormulaPayload) {
  return requestHrm<HrmPayFormulaRecord>("/api/hrm/payroll/formulas", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function updatePayFormula(formulaId: string, payload: UpdatePayFormulaPayload) {
  return requestHrm<HrmPayFormulaRecord>(`/api/hrm/payroll/formulas/${formulaId}`, {
    method: "PUT",
    body: JSON.stringify({
      ...payload,
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
    }),
  });
}

export async function createPayFormulaVersion(
  code: string,
  payload: {
    company_id: string;
    expressionJson?: Record<string, unknown>;
    requiredVarsJson?: { keys: string[] } | string[];
    label?: string;
    effectiveFrom?: string;
    effectiveTo?: string;
  },
) {
  return requestHrm<HrmPayFormulaRecord>(
    `/api/hrm/payroll/formulas/${encodeURIComponent(code)}/versions`,
    {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        company_id: normalizeHrmApiListCompanyId(payload.company_id),
      }),
    },
  );
}

export async function submitPayFormulaPublish(formulaId: string, companyId: string, note?: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPayFormulaRecord>(
    `/api/hrm/payroll/formulas/${formulaId}/submit-publish?${search.toString()}`,
    { method: "POST", body: JSON.stringify(note?.trim() ? { note: note.trim() } : {}) },
  );
}

export async function withdrawPayFormulaPublish(formulaId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPayFormulaRecord>(
    `/api/hrm/payroll/formulas/${formulaId}/withdraw-publish?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export async function publishPayFormula(formulaId: string, companyId: string, note?: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPayFormulaRecord>(
    `/api/hrm/payroll/formulas/${formulaId}/publish?${search.toString()}`,
    { method: "POST", body: JSON.stringify(note?.trim() ? { note: note.trim() } : {}) },
  );
}

export async function retirePayFormula(formulaId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPayFormulaRecord>(
    `/api/hrm/payroll/formulas/${formulaId}/retire?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

/**
 * Preview dry-run — BE may return 412 PREVIEW-STUB (honest staging).
 * FE must surface stub; NEVER claim LIVE / payroll_e2e_ready.
 */
export async function previewPayFormula(
  formulaId: string,
  payload: {
    company_id: string;
    periodId?: string;
    employeeId?: string;
    variableOverrides?: Record<string, unknown>;
  },
) {
  return requestHrm<Record<string, unknown>>(`/api/hrm/payroll/formulas/${formulaId}/preview`, {
    method: "POST",
    body: JSON.stringify({
      company_id: normalizeHrmApiListCompanyId(payload.company_id),
      periodId: payload.periodId,
      employeeId: payload.employeeId,
      variableOverrides: payload.variableOverrides,
    }),
  });
}

export async function uploadHrmFile(file: File, feature: string): Promise<string> {
  const scope = inferRuntimeScope();
  if (!scope?.companyId) {
    throw new ApiClientError({
      status: 400,
      code: "HRM-FILE-400",
      message: "Operating company scope is required for file upload",
    });
  }
  const search = new URLSearchParams();
  search.set("feature", feature);
  setListCompanyId(search, scope.companyId);
  const form = new FormData();
  form.append("file", file);
  const origin = HRM_API_ORIGIN;
  const res = await fetch(`${origin}/api/hrm/files/upload?${search.toString()}`, {
    method: "POST",
    headers: await headers({ omitContentType: true, scope }),
    body: form,
  });
  const { data } = await parseHrmJson<{ url: string }>(res);
  const url = data?.url ?? "";
  if (!url) {
    throw new ApiClientError({ status: res.status, code: "HRM-FILE-NO-URL", message: "Upload succeeded without URL" });
  }
  return url.startsWith("http") ? url : `${origin}${url}`;
}

/* ─── F-SET-TAX / SI / POS — Settings defaults (PO-HRM-SETTINGS-DEFAULTS-FE-01) ─── */

export type HrmSettingsCompanySettingRow = {
  id: string | null;
  companyId: string;
  settingKey: string;
  value: Record<string, unknown> | null;
  archivedAt?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  meta?: { cta?: string };
};

export type HrmInsuranceRateCfgRow = {
  id: string;
  companyId: string;
  ouId?: string | null;
  insuranceTypeKey: string;
  employeeRatePct: number;
  employerRatePct: number;
  ceilingAmount?: number | null;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: string;
  version: number;
  supersedesId?: string | null;
  notes?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type HrmPositionCompensationPolicyLine = {
  id?: string;
  policyId?: string;
  componentCode: string;
  salaryComponentId?: string | null;
  allowanceTypeId?: string | null;
  amount: number;
  calcMode: string;
  currency: string;
  sortOrder: number;
  archivedAt?: string | null;
  componentNameVi?: string | null;
};

export type HrmPositionCompensationPolicyRow = {
  id: string;
  companyId: string;
  ouId?: string | null;
  positionKey: string;
  positionLabelSnapshot?: string | null;
  nameVi?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  status: string;
  archivedAt?: string | null;
  lines: HrmPositionCompensationPolicyLine[];
  createdAt?: string;
  updatedAt?: string;
};

export type HrmPositionCompensationPrefillDraft = {
  companyId: string;
  ouId?: string | null;
  positionKey: string;
  asOf: string;
  policyId: string | null;
  policyStatus?: string | null;
  lines: Array<{
    componentCode: string;
    amount: number;
    calcMode: string;
    currency: string;
    salaryComponentId?: string | null;
    allowanceTypeId?: string | null;
    source: string;
  }>;
  warnings: string[];
};

/** F-SET-TAX-01 — GET by key or prefix=`pay_tax_`. */
export async function getSettingsCompanySettings(params: {
  company_id: string;
  key?: string;
  prefix?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.key?.trim()) search.set("key", params.key.trim());
  if (params.prefix?.trim()) search.set("prefix", params.prefix.trim());
  return requestHrm<HrmSettingsCompanySettingRow | { items: HrmSettingsCompanySettingRow[] }>(
    `/api/hrm/settings/company-settings?${search.toString()}`,
    { method: "GET" },
  );
}

export async function listSettingsTaxParams(companyId: string, prefix = "pay_tax_") {
  const res = await getSettingsCompanySettings({
    company_id: companyId,
    prefix,
  });
  if (res && typeof res === "object" && "items" in res) {
    return { items: unwrapItems<HrmSettingsCompanySettingRow>(res) };
  }
  if (res && typeof res === "object" && "settingKey" in res) {
    return { items: [res as HrmSettingsCompanySettingRow] };
  }
  return { items: [] as HrmSettingsCompanySettingRow[] };
}

/** F-SET-TAX-01 — PUT UPSERT (body camelCase companyId/settingKey/value). */
export async function putSettingsCompanySetting(payload: {
  companyId: string;
  settingKey: string;
  value: unknown;
}) {
  return requestHrm<HrmSettingsCompanySettingRow>("/api/hrm/settings/company-settings", {
    method: "PUT",
    body: JSON.stringify({
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
      settingKey: payload.settingKey.trim(),
      value: payload.value,
    }),
  });
}

/** BA-HRM-INSURANCE-RATE — catalog mức đóng BHXH/BHYT/BHTN + lương tối thiểu vùng. */
export type HrmInsuranceRateRow = {
  id: string;
  tenant_id?: string;
  company_id?: string;
  insurance_type: "BHXH" | "BHYT" | "BHTN" | string;
  effective_year: number;
  employer_rate_percent: string;
  employee_rate_percent: string;
  salary_cap_multiplier: string;
  status: string;
  effective_from: string | null;
  effective_to: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HrmMinimumWageRegionRow = {
  id: string;
  tenant_id?: string;
  company_id?: string;
  region_code: string;
  effective_from: string;
  effective_to: string | null;
  monthly_min_wage: string;
  status: string;
  salary_cap?: number;
  created_at?: string;
  updated_at?: string;
};

/** GET /api/hrm/settings/insurance-rates — rates grouped by year + regions. */
export async function listInsuranceRates(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  const res = await requestHrm<{
    rates?: Record<number, HrmInsuranceRateRow[]>;
    regions?: HrmMinimumWageRegionRow[];
  }>(`/api/hrm/settings/insurance-rates?${search.toString()}`, { method: "GET" });
  return {
    rates: res?.rates ?? {},
    regions: Array.isArray(res?.regions) ? res.regions : [],
  };
}

export async function createInsuranceRate(payload: {
  /** SI catalog key (F-SI-CAT-EFF) — không enum đóng BHXH/BHYT/BHTN. */
  insuranceType: string;
  effectiveYear: number;
  employerRatePercent: number;
  employeeRatePercent: number;
  salaryCapMultiplier?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  notes?: string;
  companyId: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(payload.companyId));
  const { companyId: _companyId, ...body } = payload;
  return requestHrm<HrmInsuranceRateRow>(
    `/api/hrm/settings/insurance-rates/rates?${search.toString()}`,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function updateInsuranceRate(
  id: string,
  payload: {
    employerRatePercent?: number;
    employeeRatePercent?: number;
    salaryCapMultiplier?: number;
    status?: "active" | "inactive";
    effectiveFrom?: string;
    effectiveTo?: string;
    notes?: string;
    companyId: string;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(payload.companyId));
  const { companyId: _companyId, ...body } = payload;
  return requestHrm<HrmInsuranceRateRow>(
    `/api/hrm/settings/insurance-rates/rates/${encodeURIComponent(id)}?${search.toString()}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function updateMinimumWageRegion(
  id: string,
  payload: {
    monthlyMinWage: number;
    status?: "active" | "inactive";
    effectiveTo?: string;
    companyId: string;
  },
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(payload.companyId));
  const { companyId: _companyId, ...body } = payload;
  return requestHrm<HrmMinimumWageRegionRow>(
    `/api/hrm/settings/insurance-rates/minimum-wage-regions/${encodeURIComponent(id)}?${search.toString()}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

/** Tham số mặc định tính lương — KV `pay_system_params`. */
export type HrmPaySystemTaxBracket = {
  level: number;
  upTo: number | null;
  rate: number;
};

export type HrmPaySystemParams = {
  MINIMUM_WAGE: number;
  STANDARD_WORK_DAYS: number;
  STANDARD_WORK_DAYS_CC_OFFSET: number;
  STANDARD_WORK_DAYS_DRIVER_OFFSET: number;
  STANDARD_WORK_HOURS: number;
  BHXH_BASE: number;
  BHXH_CAP: number;
  BHXH_EMP_RATE: number;
  BHXH_CMP_RATE: number;
  TNLD_CMP_RATE: number;
  TNCN_PERSONAL: number;
  TNCN_DEPENDENT: number;
  PAY_DAY: number;
  ADVANCE_DAY: number;
  CUTOFF_DAY: number;
  CC_BASE_SALARY: number;
  CC_CALL_FUND: number;
  DRIVER_KPI_EXPRESS: number;
  DRIVER_MEAL_ALLOWANCE: number;
  TNCN_BRACKETS: HrmPaySystemTaxBracket[];
};

export async function getPayrollSystemParams(companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPaySystemParams>(
    `/api/hrm/settings/payroll-params?${search.toString()}`,
    { method: "GET" },
  );
}

export async function putPayrollSystemParams(
  companyId: string,
  params: Partial<HrmPaySystemParams>,
) {
  return requestHrm<HrmPaySystemParams>("/api/hrm/settings/payroll-params", {
    method: "PUT",
    body: JSON.stringify({
      company_id: normalizeHrmApiListCompanyId(companyId),
      ...params,
    }),
  });
}

/** F-SET-SI-01 — list insurance-rate-cfg. */
export async function listInsuranceRateCfg(params: {
  company_id: string;
  insurance_type_key?: string;
  status?: string;
  include_retired?: boolean;
  as_of?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.insurance_type_key?.trim()) {
    search.set("insurance_type_key", params.insurance_type_key.trim());
  }
  if (params.status?.trim()) search.set("status", params.status.trim());
  if (params.include_retired !== undefined) {
    search.set("include_retired", String(params.include_retired));
  }
  if (params.as_of?.trim()) search.set("as_of", params.as_of.trim());
  const res = await requestHrm<{ items?: HrmInsuranceRateCfgRow[]; total?: number }>(
    `/api/hrm/settings/insurance-rate-cfg?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmInsuranceRateCfgRow>(res), total: res?.total ?? 0 };
}

export async function getInsuranceRateCfg(id: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmInsuranceRateCfgRow>(
    `/api/hrm/settings/insurance-rate-cfg/${id}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createInsuranceRateCfg(payload: Record<string, unknown>) {
  return requestHrm<HrmInsuranceRateCfgRow>("/api/hrm/settings/insurance-rate-cfg", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      companyId: normalizeHrmApiListCompanyId(String(payload.companyId ?? "")),
    }),
  });
}

export async function patchInsuranceRateCfg(
  id: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmInsuranceRateCfgRow>(
    `/api/hrm/settings/insurance-rate-cfg/${id}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function retireInsuranceRateCfg(id: string, companyId: string, reason?: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmInsuranceRateCfgRow>(
    `/api/hrm/settings/insurance-rate-cfg/${id}/retire?${search.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  );
}

/** F-SET-POS-01 — list position compensation policies. */
export async function listPositionCompensationPolicies(params: {
  company_id: string;
  position_key?: string;
  status?: string;
  include_retired?: boolean;
  as_of?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.position_key?.trim()) search.set("position_key", params.position_key.trim());
  if (params.status?.trim()) search.set("status", params.status.trim());
  if (params.include_retired !== undefined) {
    search.set("include_retired", String(params.include_retired));
  }
  if (params.as_of?.trim()) search.set("as_of", params.as_of.trim());
  const res = await requestHrm<{ items?: HrmPositionCompensationPolicyRow[] }>(
    `/api/hrm/settings/position-compensation-policies?${search.toString()}`,
    { method: "GET" },
  );
  return { items: unwrapItems<HrmPositionCompensationPolicyRow>(res) };
}

export async function getPositionCompensationPolicy(id: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPositionCompensationPolicyRow>(
    `/api/hrm/settings/position-compensation-policies/${id}?${search.toString()}`,
    { method: "GET" },
  );
}

export async function createPositionCompensationPolicy(payload: Record<string, unknown>) {
  return requestHrm<HrmPositionCompensationPolicyRow>(
    "/api/hrm/settings/position-compensation-policies",
    {
      method: "POST",
      body: JSON.stringify({
        ...payload,
        companyId: normalizeHrmApiListCompanyId(String(payload.companyId ?? "")),
      }),
    },
  );
}

export async function patchPositionCompensationPolicy(
  id: string,
  companyId: string,
  payload: Record<string, unknown>,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPositionCompensationPolicyRow>(
    `/api/hrm/settings/position-compensation-policies/${id}?${search.toString()}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function retirePositionCompensationPolicy(
  id: string,
  companyId: string,
  reason?: string,
) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmPositionCompensationPolicyRow>(
    `/api/hrm/settings/position-compensation-policies/${id}/retire?${search.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  );
}

/**
 * F-SET-POS-05 — resolve prefill draft (SRC-02 read-only).
 * Response must never be treated as emp C&B write ack.
 */
export async function resolvePositionCompensationPolicy(params: {
  company_id: string;
  positionKey: string;
  asOf?: string;
  ouId?: string;
}) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  search.set("positionKey", params.positionKey.trim());
  if (params.asOf?.trim()) search.set("asOf", params.asOf.trim());
  if (params.ouId?.trim()) search.set("ouId", params.ouId.trim());
  return requestHrm<HrmPositionCompensationPrefillDraft>(
    `/api/hrm/settings/position-compensation-policies/resolve?${search.toString()}`,
    { method: "GET" },
  );
}

// Contract Templates — BA-CTR-TPL-8-CLAUSE-MAP-01-S7
// WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-FE-01

export type ClauseOverrideRow = {
  id: string;
  tenant_id: string;
  template_code: string;
  clause_id: string;
  override_text: string | null;
  source: 'template_file' | 'company_specific' | 'manual';
  updated_by: string | null;
  updated_at: string;
  deleted_at: string | null;
  created_at: string;
};

export async function getContractBoundCodes(): Promise<{ bound_codes: string[]; bind_count: number; dropped_codes: string[] }> {
  const data = await requestHrm<{ bound_codes?: string[]; bind_count?: number; dropped_codes?: string[] }>(
    '/api/hrm/contract-templates/bound-codes',
    { method: 'GET' },
  );
  return {
    bound_codes: data.bound_codes ?? [],
    bind_count: data.bind_count ?? 0,
    dropped_codes: data.dropped_codes ?? [],
  };
}

export async function listContractClauseOverrides(templateCode: string): Promise<{ items: ClauseOverrideRow[]; warnings: string[] }> {
  const data = await requestHrm<{ items?: ClauseOverrideRow[]; warnings?: string[] }>(
    '/api/hrm/contract-templates/' + encodeURIComponent(templateCode) + '/clauses',
    { method: 'GET' },
  );
  return { items: data.items ?? [], warnings: data.warnings ?? [] };
}

export async function getContractClauseOverride(templateCode: string, clauseId: string): Promise<{ item: ClauseOverrideRow; warnings: string[] }> {
  const data = await requestHrm<{ item: ClauseOverrideRow; warnings?: string[] }>(
    '/api/hrm/contract-templates/' + encodeURIComponent(templateCode) + '/clauses/' + encodeURIComponent(clauseId),
    { method: 'GET' },
  );
  return { item: data.item, warnings: data.warnings ?? [] };
}

export async function upsertContractClauseOverride(templateCode: string, clauseId: string, body: { override_text?: string; source: string }): Promise<{ item: ClauseOverrideRow; warnings: string[] }> {
  const data = await requestHrm<{ item: ClauseOverrideRow; warnings?: string[] }>(
    '/api/hrm/contract-templates/' + encodeURIComponent(templateCode) + '/clauses/' + encodeURIComponent(clauseId),
    { method: 'PUT', body: JSON.stringify(body) },
  );
  return { item: data.item, warnings: data.warnings ?? [] };
}

export async function softDeleteContractClauseOverride(templateCode: string, clauseId: string): Promise<void> {
  await requestHrm<unknown>(
    '/api/hrm/contract-templates/' + encodeURIComponent(templateCode) + '/clauses/' + encodeURIComponent(clauseId),
    { method: 'DELETE' },
  );
}

// --- SHIFTS, RULES, SCHEDULES (AttConfig) ---
export type HrmAttShiftRecord = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  start_time: string | null;
  end_time: string | null;
  break_minutes: number;
  is_flexible: boolean;
  is_night_shift: boolean;
  apply_to: string | null;
  description: string | null;
  status: string;
};

export type UpsertAttShiftPayload = {
  company_id: string;
  code: string;
  name_vi: string;
  start_time?: string | null;
  end_time?: string | null;
  break_minutes?: number;
  is_flexible?: boolean;
  is_night_shift?: boolean;
  apply_to?: string | null;
  description?: string | null;
  status?: string;
};

export async function listAttShifts(params: { company_id: string; q?: string }) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set('q', params.q.trim());
  const res = await requestHrm<{ total?: number; items?: HrmAttShiftRecord[] }>(
    `/api/hrm/attendance/shifts?${search.toString()}`,
    { method: 'GET' },
  );
  return { items: res.items ?? [], total: res.total ?? res.items?.length ?? 0 };
}

export async function upsertAttShift(payload: UpsertAttShiftPayload) {
  return requestHrm<HrmAttShiftRecord>('/api/hrm/attendance/shifts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function retireAttShift(id: string, company_id: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(company_id));
  return requestHrm<{ retired: boolean }>(
    `/api/hrm/attendance/shifts/${encodeURIComponent(id)}/retire?${search.toString()}`,
    { method: 'POST' },
  );
}

export type HrmAttRuleRecord = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  rule_type: string;
  formula_desc: string | null;
  apply_to: string | null;
  description: string | null;
  status: string;
};

export type UpsertAttRulePayload = {
  company_id: string;
  code: string;
  name_vi: string;
  rule_type: string;
  formula_desc?: string | null;
  apply_to?: string | null;
  description?: string | null;
  status?: string;
};

export async function listAttRules(params: { company_id: string; q?: string }) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set('q', params.q.trim());
  const res = await requestHrm<{
    total?: number;
    items?: HrmAttRuleRecord[];
    data?: HrmAttRuleRecord[];
  }>(`/api/hrm/attendance/work-rules?${search.toString()}`, { method: 'GET' });
  const items = res.items ?? res.data ?? [];
  return { items, total: res.total ?? items.length };
}

export async function upsertAttRule(payload: UpsertAttRulePayload) {
  return requestHrm<HrmAttRuleRecord>('/api/hrm/attendance/work-rules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function retireAttRule(id: string, company_id: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(company_id));
  return requestHrm<{ retired: boolean }>(
    `/api/hrm/attendance/work-rules/${encodeURIComponent(id)}/retire?${search.toString()}`,
    { method: 'POST' },
  );
}

export type HrmAttScheduleRecord = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  default_shift_code: string | null;
  working_days: string | null;
  apply_to: string | null;
  description: string | null;
  status: string;
};

export type UpsertAttSchedulePayload = {
  company_id: string;
  code: string;
  name_vi: string;
  default_shift_code?: string | null;
  working_days?: string | null;
  apply_to?: string | null;
  description?: string | null;
  status?: string;
};

export async function listAttSchedules(params: { company_id: string; q?: string }) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(params.company_id));
  if (params.q?.trim()) search.set('q', params.q.trim());
  const res = await requestHrm<{
    total?: number;
    items?: HrmAttScheduleRecord[];
    data?: HrmAttScheduleRecord[];
  }>(`/api/hrm/attendance/schedules?${search.toString()}`, { method: 'GET' });
  const items = res.items ?? res.data ?? [];
  return { items, total: res.total ?? items.length };
}

export async function upsertAttSchedule(payload: UpsertAttSchedulePayload) {
  return requestHrm<HrmAttScheduleRecord>('/api/hrm/attendance/schedules', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function retireAttSchedule(id: string, company_id: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(company_id));
  return requestHrm<{ retired: boolean }>(
    `/api/hrm/attendance/schedules/${encodeURIComponent(id)}/retire?${search.toString()}`,
    { method: 'POST' },
  );
}

// ============================================================================
// Internal News API
// ============================================================================

export type HrmInternalNewsRecord = {
  id: string;
  company_id: string;
  tenant_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  content: string | null;
  featured_image_url: string | null;
  attachments: unknown[];
  category: string;
  tags: string[];
  status: string;
  published_at: string | null;
  pinned: boolean;
  visibility: string;
  department_ids: string[];
  author_id: string | null;
  author_name: string;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type CreateInternalNewsPayload = {
  company_id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  featured_image_url?: string;
  attachments?: string[];
  category?: string;
  tags?: string[];
  status?: string;
  published_at?: string;
  pinned?: boolean;
  visibility?: string;
  department_ids?: string[];
  author_id?: string;
  author_name?: string;
};

export type UpdateInternalNewsPayload = Partial<Omit<CreateInternalNewsPayload, 'company_id'>> & {
  company_id: string;
};

export async function listHrmInternalNews(params: {
  company_id: string;
  category?: string;
  status?: string;
  include_drafts?: boolean;
  page?: number;
  page_size?: number;
}) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(params.company_id));
  if (params.category) search.set('category', params.category);
  if (params.status) search.set('status', params.status);
  if (params.include_drafts) search.set('include_drafts', 'true');
  if (params.page) search.set('page', String(params.page));
  if (params.page_size) search.set('page_size', String(params.page_size));

  const res = await requestHrm<{
    total: number;
    page: number;
    page_size: number;
    data: HrmInternalNewsRecord[];
  }>(`/api/hrm/internal-news?${search.toString()}`, { method: 'GET' });

  return res;
}

export async function getHrmInternalNews(id: string, company_id: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(company_id));
  return requestHrm<HrmInternalNewsRecord>(
    `/api/hrm/internal-news/${encodeURIComponent(id)}?${search.toString()}`,
    { method: 'GET' },
  );
}

export async function createHrmInternalNews(payload: CreateInternalNewsPayload) {
  return requestHrm<HrmInternalNewsRecord>('/api/hrm/internal-news', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateHrmInternalNews(id: string, payload: UpdateInternalNewsPayload) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(payload.company_id));
  return requestHrm<HrmInternalNewsRecord>(
    `/api/hrm/internal-news/${encodeURIComponent(id)}?${search.toString()}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
}

export async function deleteHrmInternalNews(id: string, company_id: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(company_id));
  return requestHrm<{ id: string }>(
    `/api/hrm/internal-news/${encodeURIComponent(id)}?${search.toString()}`,
    { method: 'DELETE' },
  );
}

export async function viewHrmInternalNews(id: string, company_id: string) {
  const search = new URLSearchParams();
  search.set('company_id', normalizeHrmApiListCompanyId(company_id));
  return requestHrm<{ view_count: number }>(
    `/api/hrm/internal-news/${encodeURIComponent(id)}/view?${search.toString()}`,
    { method: 'POST' },
  );
}

export const hrmApi = {
  get: <T>(path: string, init?: RequestInit & { headers?: Record<string, string> }) =>
    requestHrm<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit & { headers?: Record<string, string> }) =>
    requestHrm<T>(path, { ...init, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown, init?: RequestInit & { headers?: Record<string, string> }) =>
    requestHrm<T>(path, { ...init, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit & { headers?: Record<string, string> }) =>
    requestHrm<T>(path, { ...init, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, init?: RequestInit & { headers?: Record<string, string>; data?: unknown }) =>
    requestHrm<T>(path, { ...init, method: 'DELETE', body: init?.data ? JSON.stringify(init.data) : undefined }),
  resolvePortalParentCompanyId: () => {
    return inferRuntimeScope()?.companyId || 'main';
  },
};
export type HrmPaySystemDataRecord = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  data_type: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

/**
 * @CODE-MEMORY
 * UC: PO-HRM-PAY-SYSTEM-DATA-SPEC-01
 * Business Rule: Client fetch danh sách và CRUD định nghĩa Dữ liệu hệ thống (System Data).
 * Cảnh báo API: Các endpoint phải luôn được đặt trong chuỗi string literal (nháy đơn '')
 * để tránh bị lỗi Regex syntax trên Vite.
 */
export async function listPaySystemData(companyId: string) {
  return requestHrm<HrmPaySystemDataRecord[]>('/api/hrm/settings/pay-system-data', {
    method: "GET",
    headers: { "x-company-id": normalizeHrmApiListCompanyId(companyId) },
  });
}

export async function createPaySystemData(companyId: string, payload: { code: string; name: string; data_type?: string; description?: string }) {
  return requestHrm<HrmPaySystemDataRecord>('/api/hrm/settings/pay-system-data', {
    method: "POST",
    headers: { "x-company-id": normalizeHrmApiListCompanyId(companyId) },
    body: JSON.stringify(payload),
  });
}

export async function updatePaySystemData(id: string, companyId: string, payload: { code?: string; name?: string; data_type?: string; description?: string }) {
  return requestHrm<HrmPaySystemDataRecord>('/api/hrm/settings/pay-system-data/' + id, {
    method: "PUT",
    headers: { "x-company-id": normalizeHrmApiListCompanyId(companyId) },
    body: JSON.stringify(payload),
  });
}

export async function deletePaySystemData(id: string, companyId: string) {
  return requestHrm<{ id: string }>('/api/hrm/settings/pay-system-data/' + id, {
    method: "DELETE",
    headers: { "x-company-id": normalizeHrmApiListCompanyId(companyId) },
  });
}

// ============================================================================
// PAYSLIP TEMPLATES (Added by Antigravity)
// ============================================================================

export type HrmPayslipTemplateRow = {
  id: string;
  code: string;
  name: string;
  pay_sheet_template_id: string | null;
  pay_sheet_template_name?: string;
  settings: any;
  is_active: boolean;
};

export async function listPayslipTemplates() {
  return requestHrm<{ data: HrmPayslipTemplateRow[] }>("/api/hrm/settings/payslip-templates", {
    method: "GET",
  });
}

export async function createPayslipTemplate(payload: Partial<HrmPayslipTemplateRow>) {
  return requestHrm<void>("/api/hrm/settings/payslip-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePayslipTemplate(id: string, payload: Partial<HrmPayslipTemplateRow>) {
  return requestHrm<void>(`/api/hrm/settings/payslip-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deletePayslipTemplate(id: string) {
  return requestHrm<void>(`/api/hrm/settings/payslip-templates/${id}`, {
    method: "DELETE",
  });
}

// ====== RECRUITMENT CATALOG WRAPPERS ====== //

export type HrmRecSettingsRecord = {
  code: string;
  label: string;
  unit: string | null;
  status: "active" | "draft";
  origin: "xbos" | "hrm";
  updated_at: string;
};

export async function listRecSettingsCatalog(catalogKey: string, params: { company_id: string; status?: string; include_archived?: boolean; q?: string }) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(params.company_id));
  if (params.status) search.set("status", params.status);
  if (params.include_archived) search.set("include_archived", "true");
  if (params.q?.trim()) search.set("q", params.q.trim());
  const scope = inferRuntimeScope();
  const res = await requestHrm<{ catalog_key: string; data: HrmRecSettingsRecord[] }>(
    `/api/hrm/settings-catalogs/${catalogKey}/items?${search.toString()}`,
    { method: "GET" },
  );
  return res.data ?? [];
}

export type UpsertRecSettingsPayload = {
  companyId: string;
  catalogKey: string;
  code: string;
  label: string;
  itemValue?: string;
  status?: "active" | "draft";
};

export async function upsertRecSettingsCatalog(payload: UpsertRecSettingsPayload) {
  const scope = inferRuntimeScope();
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/items`, {
    method: "POST",
    headers: await headers({ scope }),
    body: JSON.stringify({
      companyId: normalizeHrmApiListCompanyId(payload.companyId),
      catalogKey: payload.catalogKey,
      code: payload.code.trim(),
      label: payload.label.trim(),
      itemValue: payload.itemValue ?? null,
      status: payload.status ?? "active",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      code: json.code ?? "HRM-SET-ITEM-UPSERT-FAILED",
      message: json.message ?? "Không lưu được cấu hình.",
    });
  }
  return json.data as HrmRecSettingsRecord;
}

export async function retireRecSettingsCatalog(catalogKey: string, companyId: string, code: string) {
  const scope = inferRuntimeScope();
  const res = await fetch(`${HRM_API_ORIGIN}/api/hrm/settings-catalogs/items`, {
    method: "PATCH",
    headers: await headers({ scope }),
    body: JSON.stringify({
      companyId: normalizeHrmApiListCompanyId(companyId),
      catalogKey: catalogKey,
      code: code.trim(),
      status: "draft",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiClientError({
      status: res.status,
      code: json.code ?? "HRM-SET-ITEM-ARCHIVE-FAILED",
      message: json.message ?? "Lỗi xóa/ẩn item.",
    });
  }
  return json.data as HrmRecSettingsRecord;
}

// ====== PAY POLICY GROUP ====== //
export type PayPolicyGroupRecord = {
  id: string;
  tenant_id: string;
  company_id: string;
  code: string;
  name_vi: string;
  icon: string | null;
  color_hex: string | null;
  sort_order: number;
  is_platform: boolean;
  is_active: boolean;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  active_policy_count: number;
};

export async function listPayPolicyGroups(params?: { is_active?: boolean }) {
  const search = new URLSearchParams();
  if (params?.is_active !== undefined) search.set('is_active', String(params.is_active));
  const qs = search.toString() ? `?${search}` : '';
  return requestHrm<{ data: PayPolicyGroupRecord[]; meta: { total: number } }>(
    `/api/hrm/pay-policy-groups${qs}`,
  );
}

export async function checkPayPolicyGroupCode(code: string) {
  return requestHrm<{ available: boolean; reason?: string }>(
    `/api/hrm/pay-policy-groups/check-code?code=${encodeURIComponent(code)}`,
  );
}

export async function createPayPolicyGroup(payload: {
  code: string;
  name_vi: string;
  icon?: string;
  color_hex?: string;
  sort_order?: number;
  description?: string;
}) {
  return requestHrm<{ data: PayPolicyGroupRecord }>(`/api/hrm/pay-policy-groups`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePayPolicyGroup(
  id: string,
  payload: {
    name_vi?: string;
    icon?: string;
    color_hex?: string;
    sort_order?: number;
    description?: string;
  },
) {
  return requestHrm<{ data: PayPolicyGroupRecord }>(`/api/hrm/pay-policy-groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePayPolicyGroup(id: string) {
  return requestHrm<{ success: boolean }>(`/api/hrm/pay-policy-groups/${id}`, {
    method: 'DELETE',
  });
}

// ====== PAY GRADE ====== //
export type PayGradeStepRecord = {
  step_number: number;
  monthly_salary: number;
};
export type PayGradeDefinitionRecord = {
  id: string;
  decision_number: string | null;
  effective_from: string;
  steps: PayGradeStepRecord[];
};
export type PayGradeRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  active_definition?: PayGradeDefinitionRecord;
};

export async function listPayGrades(params?: { search?: string; page?: number; limit?: number }) {
  const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v != null).map(([k,v]) => [k, String(v)])).toString() : '';
  return requestHrm<{ data: PayGradeRecord[]; meta: { total: number } }>(`/api/hrm/payroll/pay-grades${qs}`);
}
export async function listPayGradeDefinitions(gradeId: string) {
  return requestHrm<{ data: PayGradeDefinitionRecord[] }>(`/api/hrm/payroll/pay-grades/${gradeId}/definitions`);
}
export async function checkPayGradeCode(code: string) {
  return requestHrm<{ available: boolean; reason?: string }>(`/api/hrm/payroll/pay-grades/check-code?code=${encodeURIComponent(code)}`);
}
export async function createPayGrade(payload: {
  code: string;
  name: string;
  description?: string;
  decision_number?: string;
  effective_from: string;
  steps: PayGradeStepRecord[];
}) {
  return requestHrm<{ data: PayGradeRecord }>(`/api/hrm/payroll/pay-grades`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
export async function createPayGradeVersion(gradeId: string, payload: { decision_number?: string; effective_from: string }) {
  return requestHrm<{ data: PayGradeDefinitionRecord }>(`/api/hrm/payroll/pay-grades/${gradeId}/definitions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
export async function updatePayGradeSteps(definitionId: string, steps: { step_number: number; monthly_salary: number }[]) {
  return requestHrm<{ success: boolean }>(`/api/hrm/payroll/pay-grade-definitions/${definitionId}/steps`, {
    method: 'PUT',
    body: JSON.stringify({ steps }),
  });
}
export async function archivePayGrade(gradeId: string) {
  return requestHrm<{ success: boolean }>(`/api/hrm/payroll/pay-grades/${gradeId}/archive`, {
    method: 'POST',
  });
}
