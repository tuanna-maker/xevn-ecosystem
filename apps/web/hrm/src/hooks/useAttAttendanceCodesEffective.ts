/**
 * @CODE-MEMORY
 * Screen:     Attendance → Dữ liệu chấm công — picker ký hiệu công / status (F-ATT-CAT-CODE EFF)
 * UC:         UC-HRM-AT-03 · AC-PLT-ATT-CODE-01 / 01c / 01f · VAL-ATT-CODE-CNS-06
 * BR:         BR-PLT-ATT-CODE-06/07 — consumer bind Nest `att_attendance_code`; cấm FE invent code khi EFF>0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md § AC-01/01f
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-FE-SA-01.md (Option A LOCKED)
 * API_DESIGN: GET /api/hrm/attendance/attendance-codes/effective (display-ready code/nameVi/symbol)
 * Purpose:    Helper thuần + React Query cache cho catalog ký hiệu công hiệu lực.
 *             effectiveCount>0 → bind Nest; =0 → caller dùng bootstrap pending|present|absent|leave
 *             (empty UX hợp lệ — U65 no seed, không invent SoT · không invent FE-ADMIN).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    AttendanceRecordsTable
 * Callees:    listEffectiveAttendanceCodes (hrmApi)
 * must_keep:  scope theo currentCompanyId (khớp company khi PATCH status — BE assert
 *             HRM-ATT-CODE-KEY trên đúng company) · submit gửi Nest `code` ·
 *             early_leave|on_leave không sole Edit SoT khi EFF>0 ·
 *             L1 KEY LIVE ATTCODEQA-MSK4T1A5 · OT/COMP Nest pickers RETAIN ·
 *             attendance_uat_ready=false · DENY invent FE-ADMIN Settings
 * SOLID:      RQ read owner + helper thuần SRP — FE không join/không aggregate rewrite
 * solid_convention_ack: FE bind display-ready từ Nest; bootstrap chỉ khi catalog rỗng
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-02
 * change_mode: FIX
 * What: resolveCheckInRecordStatus + default catalog picker — GPS EFF>0 bind Nest code
 * Why: R-ATT-03D-CNS-STATUS-CODE · cấm POST present khi ∉ effective
 * must_keep: bootstrap EFF=0 present; HRM-ATT-CODE-KEY constant; U65; attendance_uat_ready=false
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listEffectiveAttendanceCodes } from '@/integrations/hrmApi';

/** Format-only — khớp BE ATT_ATTENDANCE_CODE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const ATT_ATTENDANCE_CODE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

/** Honesty — FE không flip UAT attendance từ slice consumer này. */
export const ATT_ATTENDANCE_CODE_UAT_HONESTY = false;

/** BE invent KEY khi EFF>0 và status ∉ effective (F-ATT-CODE-CNS-01). */
export const HRM_ATT_CODE_KEY_CODE = 'HRM-ATT-CODE-KEY';

/** Option chuẩn cho picker status / ký hiệu công — value bind = `code` (Nest key). */
export interface AttAttendanceCodePickerOption {
  /** Nest att_attendance_code.code — value + submit (BE assert KEY). */
  code: string;
  /** Nhãn hiển thị (nameVi hoặc symbol + nameVi). */
  name: string;
  /** Ký hiệu ngắn display-ready (optional). */
  symbol?: string;
}

/** Row tối thiểu cần để map (subset của effective record). */
export interface AttAttendanceCodeEffectiveLike {
  code?: string | null;
  nameVi?: string | null;
  statusLabel?: string | null;
  symbol?: string | null;
  sortOrder?: number | null;
  legacyAliasKeys?: string[] | null;
}

/**
 * Bootstrap fallback — CHỈ dùng khi Nest EFF=0 (catalog rỗng, chưa admin tạo).
 * KHÔNG phải SoT, KHÔNG seed (AC-PLT-ATT-CODE-01c · U65).
 */
export interface AttAttendanceCodeBootstrapFallbackItem {
  code: string;
  i18nKey: string;
  defaultNameVi: string;
}

export const ATT_ATTENDANCE_CODE_BOOTSTRAP_FALLBACK: readonly AttAttendanceCodeBootstrapFallbackItem[] = [
  { code: 'pending', i18nKey: 'common.status.pending', defaultNameVi: 'Chờ xử lý' },
  { code: 'present', i18nKey: 'attendance.present', defaultNameVi: 'Có mặt' },
  { code: 'absent', i18nKey: 'attendance.absent', defaultNameVi: 'Vắng mặt' },
  { code: 'leave', i18nKey: 'attendance.onLeave', defaultNameVi: 'Nghỉ phép' },
] as const;

/** Map một effective row → picker option (value = code, không invent). */
export function attAttendanceCodeToPickerOption(
  row: AttAttendanceCodeEffectiveLike,
): AttAttendanceCodePickerOption {
  const code = String(row.code ?? '').trim();
  const symbol = String(row.symbol ?? '').trim();
  const nameVi = String(row.nameVi ?? row.statusLabel ?? '').trim();
  const name = nameVi || symbol || code;
  const display =
    symbol && nameVi && !nameVi.includes(symbol) ? `${symbol} — ${nameVi}` : name;
  return { code, name: display || code, symbol: symbol || undefined };
}

/** Map danh sách effective rows → options (bỏ row thiếu code; giữ sort Nest). */
export function attAttendanceCodesToPickerOptions(
  rows: readonly AttAttendanceCodeEffectiveLike[],
): AttAttendanceCodePickerOption[] {
  return rows.map(attAttendanceCodeToPickerOption).filter((o) => Boolean(o.code));
}

/**
 * Resolve nhãn hiển thị từ giá trị đã lưu (code Nest hoặc nhãn legacy).
 * Khớp code → name; không khớp → trả nguyên giá trị đã lưu (giữ lịch sử, không invent).
 */
export function resolveAttAttendanceCodeLabel(
  options: readonly AttAttendanceCodePickerOption[],
  codeOrValue: string | null | undefined,
): string {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return '—';
  const hit = options.find((o) => o.code.toLowerCase() === raw.toLowerCase());
  return hit ? hit.name : raw;
}

/**
 * Resolve mã Edit Select ban đầu từ status đã lưu.
 * EFF>0: chỉ chọn mã có trong Nest options;
 * không đưa early_leave|on_leave làm sole option trừ khi Nest có đúng code đó.
 */
/**
 * Mã check-in hợp lệ trong catalog EFF (BE assert HRM-ATT-CODE-KEY khi lệch).
 */
export function isAttAttendanceCodeInEffectiveCatalog(
  options: readonly AttAttendanceCodePickerOption[],
  code: string | null | undefined,
): boolean {
  const raw = (code ?? '').trim().toLowerCase();
  if (!raw) return false;
  return options.some((o) => o.code.toLowerCase() === raw);
}

/**
 * Gợi ý mặc định picker GPS/manual khi EFF>0 — ưu tiên `present` nếu Nest có, không invent.
 */
export function resolveDefaultCheckInStatusFromCatalog(
  options: readonly AttAttendanceCodePickerOption[],
): string | null {
  if (options.length === 0) return null;
  const presentHit = options.find((o) => o.code.toLowerCase() === 'present');
  if (presentHit) return presentHit.code;
  return options[0]?.code ?? null;
}

/**
 * Resolve status POST records khi check-in.
 * EFF>0: bắt buộc mã thuộc Nest options (caller truyền explicit sau picker).
 * EFF=0: bootstrap closed-4 — mặc định present khi không chọn.
 */
export function resolveCheckInRecordStatus(params: {
  catalogBound: boolean;
  nestOptions: readonly AttAttendanceCodePickerOption[];
  explicitStatus?: string | null;
}): string | null {
  const explicit = (params.explicitStatus ?? '').trim();
  if (params.catalogBound) {
    if (!isAttAttendanceCodeInEffectiveCatalog(params.nestOptions, explicit)) {
      return null;
    }
    const hit = params.nestOptions.find((o) => o.code.toLowerCase() === explicit.toLowerCase());
    return hit?.code ?? null;
  }
  if (explicit) {
    const s = explicit.toLowerCase().replace(/-/g, '_');
    if (ATT_ATTENDANCE_CODE_KEY_FORMAT.test(s)) return s;
    if (s === 'late' || s === 'early_leave' || s === 'on_leave') return 'present';
    return 'pending';
  }
  return 'present';
}

export function resolveAttAttendanceCodeEditValue(
  options: readonly AttAttendanceCodePickerOption[],
  storedStatus: string | null | undefined,
  catalogBound: boolean,
): string {
  const raw = (storedStatus ?? '').trim().toLowerCase();
  if (!raw) return options[0]?.code ?? 'pending';
  const direct = options.find((o) => o.code.toLowerCase() === raw);
  if (direct) return direct.code;
  if (!catalogBound) {
    // Bootstrap closed-4 coerce — soft alias only khi EFF=0.
    if (raw === 'on_leave' || raw === 'business_trip' || raw === 'holiday') return 'leave';
    if (raw === 'late' || raw === 'early_leave' || raw === 'weekend') return 'present';
    if (options.some((o) => o.code === raw)) return raw;
    return options[0]?.code ?? 'pending';
  }
  // EFF>0 · mã lịch sử ngoài catalog → neo option đầu (không invent early_leave|on_leave).
  return options[0]?.code ?? 'pending';
}

export const ATT_ATTENDANCE_CODES_EFFECTIVE_QUERY_KEY = 'hrm-att-attendance-codes-effective';

export function attAttendanceCodesEffectiveQueryKey(companyId: string | null | undefined) {
  return [ATT_ATTENDANCE_CODES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useAttAttendanceCodesEffective(opts?: { enabled?: boolean }) {
  // Scope theo currentCompanyId để khớp company khi PATCH status
  // (BE assert HRM-ATT-CODE-KEY trên effective của đúng company persist).
  const { currentCompanyId } = useAuth();
  const companyId = (currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: attAttendanceCodesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveAttendanceCodes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const nestOptions = useMemo<AttAttendanceCodePickerOption[]>(
    () => attAttendanceCodesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const effectiveCount = query.data?.total ?? nestOptions.length;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_ATTENDANCE_CODES_EFFECTIVE_QUERY_KEY] });
  };

  return {
    companyId,
    items: query.data?.items ?? [],
    nestOptions,
    effectiveCount,
    isLoading: query.isLoading || query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  };
}
