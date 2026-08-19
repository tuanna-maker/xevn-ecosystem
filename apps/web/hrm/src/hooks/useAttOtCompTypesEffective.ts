/**
 * @CODE-MEMORY
 * Screen:     Attendance → Đơn từ → Tăng ca — picker hình thức bồi thường (F-ATT-CAT-OTC EFF)
 * UC:         UC-HRM-ATT-OT · AC-PLT-ATT-COMP-01 / 01c · VAL-ATT-COMP-CNS-01
 * BR:         BR-PLT-04/05 — consumer bind Nest `att_ot_comp_type`; cấm FE invent code khi EFF>0
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md (Option B)
 * API_DESIGN: GET /api/hrm/attendance/ot-comp-types/effective (display-ready code/nameVi)
 * Purpose:    Helper thuần + React Query cache cho catalog hình thức bồi thường tăng ca hiệu lực.
 *             effectiveCount>0 → bind Nest; =0 → caller dùng bootstrap salary|compensatory_leave
 *             (empty UX hợp lệ — U65 no seed, không invent SoT).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-FE-01
 * Coded:      2026-08-08
 * Callers:    OvertimeRequestTab
 * Callees:    listEffectiveAttOtCompTypes (hrmApi)
 * must_keep:  scope theo currentCompanyId (khớp company_id khi createOvertimeRequest — BE assert
 *             HRM-ATT-OT-COMP-KEY trên đúng company persist) · submit gửi Nest `code` ·
 *             KHÔNG invent FE-ADMIN panel · KHÔNG fold vào att_ot_type picker ·
 *             attendance_uat_ready=false · payroll formula ≠ catalog
 * SOLID:      RQ read owner + helper thuần SRP — FE không join/không công thức lương
 * solid_convention_ack: FE bind display-ready từ Nest; bootstrap chỉ khi catalog rỗng
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-fe-01.md
 */
import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { listEffectiveAttOtCompTypes } from '@/integrations/hrmApi';

/** Format-only — khớp BE ATT_OT_COMP_TYPE_KEY_FORMAT; KHÔNG phải danh sách đóng. */
export const ATT_OT_COMP_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

/** Honesty — FE không flip UAT attendance / payroll từ slice này. */
export const ATT_OT_COMP_TYPE_UAT_HONESTY = false;

/** Option chuẩn cho picker hình thức bồi thường — value bind = `code` (Nest key). */
export interface AttOtCompTypePickerOption {
  /** Nest att_ot_comp_type.code — value + submit (BE assert KEY). */
  code: string;
  /** Nhãn hiển thị (nameVi hoặc fallback i18n / code). */
  name: string;
}

/** Row tối thiểu cần để map (subset của effective record). */
export interface AttOtCompTypeEffectiveLike {
  code?: string | null;
  nameVi?: string | null;
}

/**
 * Bootstrap fallback — CHỈ dùng khi Nest EFF=0 (catalog rỗng, chưa admin tạo).
 * i18nKey trỏ tới `overtime.*` đã có sẵn; KHÔNG phải SoT, KHÔNG seed (AC-PLT-ATT-COMP-01c).
 */
export interface AttOtCompTypeBootstrapFallbackItem {
  code: string;
  i18nKey: string;
}

export const ATT_OT_COMP_TYPE_BOOTSTRAP_FALLBACK: readonly AttOtCompTypeBootstrapFallbackItem[] = [
  { code: 'salary', i18nKey: 'overtime.compensationSalary' },
  { code: 'compensatory_leave', i18nKey: 'overtime.compensationTimeOff' },
] as const;

/** Map một effective row → picker option (value = code, không invent). */
export function attOtCompTypeToPickerOption(row: AttOtCompTypeEffectiveLike): AttOtCompTypePickerOption {
  const code = String(row.code ?? '').trim();
  const name = String(row.nameVi ?? '').trim() || code;
  return { code, name };
}

/** Map danh sách effective rows → options (bỏ row thiếu code). */
export function attOtCompTypesToPickerOptions(
  rows: readonly AttOtCompTypeEffectiveLike[],
): AttOtCompTypePickerOption[] {
  return rows.map(attOtCompTypeToPickerOption).filter((o) => Boolean(o.code));
}

/**
 * Resolve nhãn hiển thị từ giá trị đã lưu (code Nest hoặc nhãn legacy).
 * Khớp code → name; không khớp → trả nguyên giá trị đã lưu (giữ lịch sử, không invent binary).
 */
export function resolveAttOtCompTypeLabel(
  options: readonly AttOtCompTypePickerOption[],
  codeOrValue: string | null | undefined,
): string {
  const raw = (codeOrValue ?? '').trim();
  if (!raw) return '—';
  const hit = options.find((o) => o.code.toLowerCase() === raw.toLowerCase());
  return hit ? hit.name : raw;
}

export const ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY = 'hrm-att-ot-comp-types-effective';

export function attOtCompTypesEffectiveQueryKey(companyId: string | null | undefined) {
  return [ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY, companyId ?? null] as const;
}

export function useAttOtCompTypesEffective(opts?: { enabled?: boolean }) {
  const { currentCompanyId } = useAuth();
  const { listCompanyId } = useHrmOperatingUnitFilter();
  const companyId = (listCompanyId || currentCompanyId || '').trim() || null;
  const queryClient = useQueryClient();

  const enabled = opts?.enabled !== false && Boolean(companyId);

  const query = useQuery({
    queryKey: attOtCompTypesEffectiveQueryKey(companyId),
    queryFn: () => listEffectiveAttOtCompTypes({ company_id: companyId! }),
    enabled,
    staleTime: 30_000,
  });

  const nestOptions = useMemo<AttOtCompTypePickerOption[]>(
    () => attOtCompTypesToPickerOptions(query.data?.items ?? []),
    [query.data?.items],
  );

  const effectiveCount = query.data?.total ?? nestOptions.length;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY] });
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