import { getPortalAccessToken, waitForPortalAccessToken } from '@/lib/portalAuthBridge';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { ApiClientError } from '@/lib/apiError';
import { safeRandomUuid } from '@/lib/safeRandomUuid';

export type GroupMemberUnitRow = {
  tenant_id: string;
  tenant_name: string;
  tenant_short_name: string;
  id: string;
  code: string;
  name: string;
  entity_type: string;
  payload: Record<string, unknown> | null;
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
};

async function xbosHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': safeRandomUuid(),
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
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
      id: 'xbos-group-holding-root',
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
    list.push({
      id: member.id,
      name: member.name,
      code: member.code,
      logo_url: null,
      address: null,
      phone: null,
      email: null,
      tax_code: null,
      website: null,
      industry: member.entity_type || null,
      employee_count: null,
      founded_date: null,
      description: shortFromPayload || member.tenant_short_name || null,
      status: 'active',
      created_at: now,
      updated_at: now,
    });
  }
  return list;
}

/** Group CEO — member units from XBOS tenant-scope (same as Command Center settings). */
export async function fetchGroupMemberUnitsForHrm(): Promise<HrmCompanyRow[]> {
  const res = await fetch('/api/xbos/tenant-scope/group-member-units', {
    method: 'GET',
    headers: await xbosHeaders(),
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
      message: body?.message ?? 'Không tải được danh sách công ty thành viên',
    });
  }
  return mapGroupMemberUnitsToHrmCompanies(body.data);
}
