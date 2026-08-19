/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Gói chính sách (STP-POLICY-PACK, CHUNG)
 * UC:         UC-BP-PAY-STP-01 (CHUNG Policy Pack CRUD) · AC-PAY-STP-01-03 Archive
 * SRS:        docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md — AC-PAY-STP-01-01..05, AC-PAY-STP-GLOBAL-01
 * TechSpec:   docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md §2.1 (pay_policy_pack)
 * UI:         docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md §4.1/4.2
 * API:        GET/POST/PATCH /api/hrm/payroll/pay-policy-packs · POST …/:id/archive
 *             DTO: company_id snake bắt buộc; body field camel (nameVi, effectiveFrom, rateParams)
 *             + alias snake (name_vi, effective_from) — FE gửi camel + company_id
 * BE (LIVE):  apps/api/hrm-api/src/payroll/payroll.controller.ts `pay-policy-packs*`
 *             + pay-cntt-setup.service.ts
 * Purpose:    TanStack Query hooks CRUD `pay_policy_pack` scope=CHUNG — FE chỉ bind/validate,
 *             KHÔNG tính toán nghiệp vụ (28-FE-BE-SEPARATION-DISPLAY-READY).
 * must_keep:  BASE path Nest `api/hrm` + `payroll`; company_id BẮT BUỘC; unwrap envelope
 *             `{ success, code, message, data }` · list `.data.items`; map
 *             HRM-PAY-POL-409-CODE / 400-DATE / 403 → message VI; U65 — không seed.
 * WorkItem:   PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * Coded:      2026-08-12
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * change_mode: ADD
 * What: Thêm useArchivePolicyPack (POST …/archive?company_id=); map 403 → MSG_SCOPE_403;
 *       giữ company_id + envelope unwrap từ CLEANUP-01.
 * Why: AC-PAY-STP-01-03 Archive + BR-PAY-STP-01 403 banner.
 * must_keep: Export PolicyPack / hooks create-list-update; payroll_e2e_ready=false
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPortalAccessToken, getPortalSessionUser } from '@/lib/portalAuthBridge';
import { resolveHrmSpreadsheetScope } from '@/lib/hrmSpreadsheetScope';
import { HRM_LIST_DEFAULT_COMPANY_ID, HRM_MASTER_TENANT_ID } from '@/lib/hrmListScope';
import { safeRandomUuid } from '@/lib/safeRandomUuid';
import { MSG_SCOPE_403 } from '@/lib/payPolicyPackForm';

export type PolicyPackScope = 'CHUNG' | 'RIENG';
export type PolicyPackStatus = 'draft' | 'active' | 'retired';

export type PolicyPack = {
  id: string;
  companyId?: string;
  code: string;
  nameVi: string;
  scope: PolicyPackScope;
  businessLineTag?: string | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  status?: PolicyPackStatus | string;
  rateParams?: Record<string, unknown>;
  archivedAt?: string | null;
};

type PolicyPackEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  details?: unknown;
};

/** Nest globalPrefix `api/hrm` (main.ts) + PayrollController `payroll` + route `pay-policy-packs`. */
const BASE = '/api/hrm/payroll/pay-policy-packs';

/** Error taxonomy VI (SRS-01 §Error handling UI). */
const ERROR_MESSAGE_VI: Record<string, string> = {
  'HRM-PAY-POL-409-CODE': 'Mã gói đã tồn tại — vui lòng chọn mã khác.',
  'HRM-PAY-POL-400-DATE': 'Hiệu lực đến phải sau hiệu lực từ.',
};

export class PolicyPackApiError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'PolicyPackApiError';
    this.code = code;
    this.status = status;
  }
}

function resolveCompanyScope(): { tenantId: string; companyId: string } {
  return (
    resolveHrmSpreadsheetScope() ?? {
      tenantId: HRM_MASTER_TENANT_ID,
      companyId: HRM_LIST_DEFAULT_COMPANY_ID,
    }
  );
}

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': safeRandomUuid(),
  };
  const token = getPortalAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    const user = getPortalSessionUser();
    if (user?.userId) headers['x-user-id'] = user.userId;
  }
  const scope = resolveCompanyScope();
  headers['x-tenant-id'] = scope.tenantId;
  headers['x-company-id'] = scope.companyId;
  return headers;
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: PolicyPackEnvelope<T> | undefined;
  try {
    body = (await res.json()) as PolicyPackEnvelope<T>;
  } catch {
    // non-JSON — fall through
  }

  if (!res.ok || body?.success === false) {
    if (res.status === 403) {
      throw new PolicyPackApiError(MSG_SCOPE_403, body?.code ?? 'HRM-SCOPE-403', 403);
    }
    const code = body?.code;
    const message =
      (code && ERROR_MESSAGE_VI[code]) || body?.message || `Yêu cầu thất bại (${res.status}).`;
    throw new PolicyPackApiError(message, code, res.status);
  }
  if (body?.data === undefined) {
    throw new PolicyPackApiError('Phản hồi máy chủ trống.');
  }
  return body.data;
}

export function useListPolicyPacks(scope: PolicyPackScope) {
  return useQuery({
    queryKey: ['pay-policy-packs', scope],
    queryFn: async () => {
      const { companyId } = resolveCompanyScope();
      const headers = await buildHeaders();
      const params = new URLSearchParams({ scope, company_id: companyId });
      const res = await fetch(`${BASE}?${params.toString()}`, { headers });
      const data = await parseEnvelope<{ items: PolicyPack[] }>(res);
      return data.items ?? [];
    },
  });
}

export function useCreatePolicyPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<PolicyPack, 'id'>) => {
      const { companyId } = resolveCompanyScope();
      const headers = await buildHeaders();
      const res = await fetch(BASE, {
        method: 'POST',
        headers,
        body: JSON.stringify({ company_id: companyId, ...data }),
      });
      return parseEnvelope<PolicyPack>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pay-policy-packs'] }),
  });
}

export function useUpdatePolicyPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PolicyPack> }) => {
      const { companyId } = resolveCompanyScope();
      const headers = await buildHeaders();
      const res = await fetch(`${BASE}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ company_id: companyId, ...data }),
      });
      return parseEnvelope<PolicyPack>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pay-policy-packs'] }),
  });
}

export function useArchivePolicyPack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { companyId } = resolveCompanyScope();
      const headers = await buildHeaders();
      const params = new URLSearchParams({ company_id: companyId });
      const res = await fetch(`${BASE}/${id}/archive?${params.toString()}`, {
        method: 'POST',
        headers,
      });
      return parseEnvelope<PolicyPack>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pay-policy-packs'] }),
  });
}
