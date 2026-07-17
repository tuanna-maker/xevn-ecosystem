import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Employee } from './useEmployees';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import { normalizeHrmApiListCompanyId, HRM_LIST_DEFAULT_COMPANY_ID } from '@/lib/hrmListScope';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';
import { hasPortalSession } from '@/lib/portalAuthBridge';
import { getEmployeeById, type HrmEmployeeRecord } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';

/** Top-level BE field when merged; interim fallback via custom_fields.avatar_url. */
export function resolveEmployeeAvatarUrl(row: HrmEmployeeRecord): string | null {
  const direct = row.avatar_url?.trim();
  if (direct) return direct;
  const fromCustom = row.custom_fields?.avatar_url?.trim();
  return fromCustom || null;
}

export function mergeEmployeeAvatarWriteFields(
  avatarUrl: string | null | undefined,
  customFields: Record<string, string> | undefined,
): { avatar_url?: string | null; custom_fields?: Record<string, string> } {
  if (avatarUrl === undefined) {
    return customFields && Object.keys(customFields).length > 0
      ? { custom_fields: customFields }
      : {};
  }

  const merged: Record<string, string> = { ...(customFields ?? {}) };
  if (avatarUrl) {
    merged.avatar_url = avatarUrl;
  } else {
    delete merged.avatar_url;
  }

  return {
    avatar_url: avatarUrl,
    custom_fields: merged,
  };
}

export function mapHrmEmployeeRecord(row: HrmEmployeeRecord): Employee {
  return {
    id: row.id,
    company_id: row.company_id,
    employee_code: row.employee_code,
    full_name: row.full_name,
    email: row.email,
    phone: null,
    department: null,
    position: row.job_title_key,
    start_date: row.hired_at,
    end_date: null,
    status: row.status,
    avatar_url: resolveEmployeeAvatarUrl(row),
    salary: null,
    manager_id: null,
    gender: null,
    birth_date: null,
    id_number: null,
    id_issue_date: null,
    id_issue_place: null,
    permanent_address: null,
    temporary_address: null,
    emergency_contact: null,
    emergency_phone: null,
    employment_type: null,
    work_location: null,
    bank_name: null,
    bank_account: null,
    tax_code: null,
    social_insurance_number: null,
    health_insurance_number: null,
    custom_fields: row.custom_fields ?? {},
    deleted_at: row.archived_at,
    deleted_by: null,
    delete_reason: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function resolveCompanyIds(
  currentCompanyId: string | null,
  memberships: { company_id: string }[],
): string[] {
  const companyIdsRaw = currentCompanyId
    ? [currentCompanyId, ...memberships.map((m) => m.company_id)]
    : memberships.map((m) => m.company_id);
  return [
    ...new Set(
      companyIdsRaw
        .filter((id) => !!id && id !== 'all')
        .map((id) => normalizeHrmApiListCompanyId(id)),
    ),
  ];
}

export function resolveEmployeeFetchCompanyIds(
  ctx: LoadEmployeeContext,
  search?: string,
): string[] {
  const resolvedSearch = search ?? ctx.search ?? '';
  const fromAuth = resolveCompanyIds(ctx.currentCompanyId, ctx.memberships);
  if (fromAuth.length > 0) return fromAuth;

  const scope = resolveHrmSpreadsheetScope(ctx.currentCompanyId, resolvedSearch);
  if (scope?.companyId) return [scope.companyId];

  if (getHrmPortalMode(resolvedSearch) || hasPortalSession()) {
    return [HRM_LIST_DEFAULT_COMPANY_ID];
  }

  return [];
}

export type LoadEmployeeContext = {
  memberships: { company_id: string }[];
  currentCompanyId: string | null;
  search?: string;
};

export type LoadEmployeeResult = {
  employee: Employee | null;
  error: string | null;
};

export async function loadEmployee(
  employeeId: string | undefined,
  ctx: LoadEmployeeContext,
): Promise<LoadEmployeeResult> {
  const search = ctx.search ?? (typeof window !== 'undefined' ? window.location.search : '');
  const companyIds = resolveEmployeeFetchCompanyIds(ctx, search);

  if (!employeeId) {
    return { employee: null, error: null };
  }

  if (!shouldSkipSupabaseDataFetches(search)) {
    return { employee: null, error: 'Chế độ API HRM bắt buộc (P1-SUPA-FE-02)' };
  }

  if (companyIds.length === 0) {
    return { employee: null, error: 'Không tìm thấy nhân viên' };
  }

  try {
    const row = await getEmployeeById(employeeId, companyIds);
    if (!row) {
      return { employee: null, error: 'Không tìm thấy nhân viên' };
    }
    return { employee: mapHrmEmployeeRecord(row), error: null };
  } catch (err: unknown) {
    console.error('Error fetching employee:', err);
    return {
      employee: null,
      error: toErrorMessage(err, 'Không thể tải thông tin nhân viên'),
    };
  }
}

export const EMPLOYEE_DETAIL_QUERY_KEY = 'employee-detail' as const;

/** Stable RQ key — StrictMode / remount must share one in-flight detail GET (D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01). */
export function buildEmployeeDetailQueryKey(
  employeeId: string | undefined,
  companyId: string | null | undefined,
): readonly unknown[] {
  return [EMPLOYEE_DETAIL_QUERY_KEY, employeeId ?? null, companyId ?? null] as const;
}

/**
 * P1-HRM-SCALE-FE-W1 / D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01:
 * React Query owns detail fetch so list→profile does not double GET /employees/:id.
 */
export function useEmployee(employeeId: string | undefined) {
  const { memberships, currentCompanyId } = useAuth();
  const search = typeof window !== 'undefined' ? window.location.search : '';

  const query = useQuery({
    queryKey: buildEmployeeDetailQueryKey(employeeId, currentCompanyId),
    queryFn: () =>
      loadEmployee(employeeId, {
        memberships,
        currentCompanyId,
        search,
      }),
    enabled: !!employeeId,
    staleTime: 60_000,
  });

  return {
    employee: query.data?.employee ?? null,
    isLoading: query.isLoading,
    error: query.data?.error ?? (query.error ? toErrorMessage(query.error, 'Không thể tải thông tin nhân viên') : null),
    refetch: async () => {
      await query.refetch();
    },
  };
}
