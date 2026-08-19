/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Tăng ca — picker loại tăng ca (F-ATT-CAT-OT EFF)
 * UC:         UC-HRM-ATT-OT · AC-PLT-ATT-OT-01 / 01c · VAL-ATT-OT-CNS-01
 * BR:         BR-PLT-04/05 — consumer bind Nest `att_ot_type`; cấm FE invent code khi EFF>0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md (Option B)
 * API_DESIGN: GET /api/hrm/attendance/ot-types/effective (display-ready code/nameVi/defaultCoeff)
 * Purpose:    Helper thuần + React Query cache cho catalog loại tăng ca hiệu lực.
 *             effectiveCount>0 → bind Nest; =0 → caller dùng bootstrap weekday|weekend|holiday
 *             (empty UX hợp lệ — U65 no seed, không invent SoT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    OvertimeRequestTab
 * Callees:    listEffectiveAttOtTypes (hrmApi)
 * must_keep:  scope theo currentCompanyId (khớp company_id khi createOvertimeRequest — BE assert
 *             HRM-ATT-OT-TYPE-KEY trên đúng company persist) · submit gửi Nest `code` ·
 *             defaultCoeff chỉ display-ready, KHÔNG phải payroll formula · attendance_uat_ready=false
 * SOLID:      RQ read owner + helper thuần SRP — FE không join/không công thức lương
 * solid_convention_ack: FE bind display-ready từ Nest; bootstrap chỉ khi catalog rỗng
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveAttOtTypes } from '@/integrations/hrmApi';

/** Format-only — khớp BE ATT_OT_TYPE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const ATT_OT_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

/** Honesty — FE không flip UAT attendance từ slice này. */
export const ATT_OT_TYPE_UAT_HONESTY = false;

/** Option chuẩn cho picker loại tăng ca — value bind = `code` (Nest key). */
export interface AttOtTypePickerOption {
  /** Nest att_ot_type.code — value + submit (BE assert KEY). */
  code: string;
  /** Nhãn hiển thị (nameVi hoặc fallback i18n / code). */
  name: string;
  /** Hệ số mặc định để hiển thị + prefill — ≠ công thức lương. */
  defaultCoeff: number;
}

/** Row tối thiểu cần để map (subset của effective record). */
export interface AttOtTypeEffectiveLike {
  code?: string | null;
  nameVi?: string | null;
  defaultCoeff?: number | string | null;
  defaultCoefficient?: number | string | null;
}

/**
 * Bootstrap fallback — CHỈ dùng khi Nest EFF=0 (catalog rỗng, chưa admin tạo).
 * i18nKey trỏ tới `overtime.*` đã có sẵn; KHÔNG phải SoT, KHÔNG seed (AC-PLT-ATT-OT-01c).
 */
export interface AttOtTypeBootstrapFallbackItem {
  code: string;
  i18nKey: string;
  defaultCoeff: number;
}

export const ATT_OT_TYPE_BOOTSTRAP_FALLBACK: readonly AttOtTypeBootstrapFallbackItem[] = [
  { code: 'weekday', i18nKey: 'overtime.weekday', defaultCoeff: 1.5 },
  { code: 'weekend', i18nKey: 'overtime.weekend', defaultCoeff: 2.0 },
  { code: 'holiday', i18nKey: 'overtime.holiday', defaultCoeff: 3.0 },
] as const;

/** Hệ số hiển thị khi không xác định được từ catalog / bootstrap. */
export const ATT_OT_TYPE_FALLBACK_COEFF = 1.5;

function toCoeff(raw: number | string | null | undefined, fallback: number): number {
  if (raw === null || raw === undefined || raw === '') return fallback;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Map một effective row → picker option (value = code, không invent). */
export function attOtTypeToPickerOption(row: AttOtTypeEffectiveLike): AttOtTypePickerOption {
  const code = String(row.code ?? '').trim();
  const name = String(row.nameVi ?? '').trim() || code;
  const coeff = toCoeff(
    row.defaultCoeff ?? row.defaultCoefficient,
    ATT_OT_TYPE_FALLBACK_COEFF,
  );
  return { code, name, defaultCoeff: coeff };
}

/** Map danh sách effective rows → options (bỏ row thiếu code). */
export function attOtTypesToPickerOptions(
  rows: readonly AttOtTypeEffectiveLike[],
): AttOtTypePickerOption[] {
  return rows.map(attOtTypeToPickerOption).filter((o) => Boolean(o.code));
}

/**
 * Resolve nhãn hiển thị từ giá trị đã lưu (code Nest hoặc nhãn legacy).
 * Khớp code → name; không khớp → trả nguyên giá trị đã lưu (giữ lịch sử, không invent).
 */
export function resolveAttOtTypeLabel(
  options: readonly AttOtTypePickerOption[],
  codeOrValue: string | null | undefined,
): string {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return '—';
  const hit = options.find((o) => o.code.toLowerCase() === raw.toLowerCase());
  return hit ? hit.name : raw;
}

/** Resolve hệ số hiển thị/prefill từ options; không khớp → fallback truyền vào. */
export function resolveAttOtTypeCoefficient(
  options: readonly AttOtTypePickerOption[],
  codeOrValue: string | null | undefined,
  fallback = ATT_OT_TYPE_FALLBACK_COEFF,
): number {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return fallback;
  const hit = options.find((o) => o.code.toLowerCase() === raw.toLowerCase());
  return hit ? hit.defaultCoeff : fallback;
}

export const ATT_OT_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-att-ot-types-effective';

export function attOtTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [ATT_OT_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useAttOtTypesEffective(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: attOtTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveAttOtTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const nestOptions = useMemo<AttOtTypePickerOption[]>(
    () => attOtTypesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const effectiveCount = query.data?.total ?? nestOptions.length;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_OT_TYPES_EFFECTIVE_QUERY_KEY] });
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
