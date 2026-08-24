import type { Company } from '../data/mock-data';
import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import type { OrgTreeNode } from './orgFoundationApi';
import { coalesceGet } from './requestCoalescer';
import { xbosGetData, xbosFetch } from './xbosHttp';

/** Coalesce window for read-only membership scope (P1-CC-MOUNT-DUP-CALLS-FE). */
const ACCESSIBLE_TENANTS_TTL_MS = 30_000;

/** id tổng hợp cho hàng “công ty mẹ” trên UI Command Center (không bắt buộc trùng uuid DB). */
export const GROUP_HOLDING_ROOT_ID = 'xbos-group-holding-root';

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

export function mapGroupMemberUnitsToCompanies(data: GroupMemberUnitsPayload): Company[] {
  const { holding, members } = data;
  const establishedDate = new Date().toISOString().slice(0, 10);
  const list: Company[] = [];
  if (holding) {
    list.push({
      id: GROUP_HOLDING_ROOT_ID,
      code: (holding.short_name?.trim() || holding.tenant_id).toUpperCase(),
      name: holding.name,
      shortName: holding.short_name ?? undefined,
      employeeCount: 0,
      revenue: 0,
      status: 'active',
      address: '',
      establishedDate,
      entityLevel: 'parent',
      parentEntityId: null,
      tenantId: holding.tenant_id,
    });
  }
  const parentRef = holding ? GROUP_HOLDING_ROOT_ID : null;
  for (const m of members) {
    const shortFromPayload =
      m.payload && typeof m.payload.shortName === 'string' ? (m.payload.shortName as string) : undefined;
    list.push({
      id: m.id,
      code: m.code,
      name: m.name,
      shortName: shortFromPayload || m.tenant_short_name || undefined,
      employeeCount: 0,
      revenue: 0,
      status: 'active',
      address: '',
      establishedDate,
      entityLevel: 'subsidiary',
      parentEntityId: parentRef,
      tenantId: m.tenant_id,
    });
  }
  return list;
}

/**
 * Membership scope row — raw JWT keys + optional OS 28 display-ready labels from auth BE.
 * FE binds *_label; never invent slug→label maps locally (W1-B-04-AUTH-FE).
 */
export type AccessibleTenant = {
  tenantId: string;
  name: string;
  shortName: string;
  tenantKind: 'master' | 'member';
  roleCode: string;
  companyId: string;
  isMaster: boolean;
  /** xbos_user_tenant_membership.id — from login/me/select-membership + JWT claim */
  membershipId?: string;
  /** Enabled modules from xbos_tenant_registry (BR-TOS-06 cockpit entitlement). */
  modules?: string[];
  tenant_label?: string;
  company_label?: string;
  role_label?: string;
  tenant_kind_label?: string;
};

type AccessibleEnvelope = {
  userId: string;
  items: AccessibleTenant[];
};

export async function fetchAccessibleTenants(): Promise<AccessibleTenant[]> {
  const tenantId = import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID;
  try {
    const data = await coalesceGet<AccessibleEnvelope>(
      `tenant-scope.accessible:${tenantId}:${MEMBER_DEFAULT_COMPANY_ID}`,
      () =>
        xbosGetData<AccessibleEnvelope>('/tenant-scope/accessible', {
          scope: 'tenant-scope.accessible',
          tenantId,
          companyId: MEMBER_DEFAULT_COMPANY_ID,
        }),
      { ttlMs: ACCESSIBLE_TENANTS_TTL_MS },
    );
    return data?.items ?? [];
  } catch (error) {
    throw error instanceof Error ? error : new Error('accessible tenants load failed');
  }
}

export async function fetchGroupOrgOverview() {
  const data = await xbosGetData<{
    trees: Array<{ tenantId: string; name: string; roleCode: string; tree: OrgTreeNode[] }>;
  }>('/tenant-scope/group-org-overview', {
    scope: 'tenant-scope.group-org-overview',
    tenantId: MASTER_TENANT_ID,
    companyId: MEMBER_DEFAULT_COMPANY_ID,
  });
  return data;
}

/** Đơn vị thành viên / pháp nhân — group CEO rollup + member CEO scoped (AC-TOS-04). */
export async function fetchCompanyUnitsForCommandCenter(): Promise<Company[]> {
  try {
    const data = await xbosGetData<GroupMemberUnitsPayload>('/tenant-scope/company-units', {
      scope: 'tenant-scope.company-units',
      tenantId: MASTER_TENANT_ID,
      companyId: MEMBER_DEFAULT_COMPANY_ID,
    });
    if (!data) return [];
    return mapGroupMemberUnitsToCompanies(data);
  } catch (error) {
    throw error instanceof Error ? error : new Error('company-units load failed');
  }
}

/** @deprecated Prefer fetchCompanyUnitsForCommandCenter — member CEO receives 403. */
export async function fetchGroupMemberUnitsForCommandCenter(): Promise<Company[]> {
  return fetchCompanyUnitsForCommandCenter();
}

export type CreateMemberTenantApiPayload = {
  tenantId?: string;
  tenantName: string;
  shortName?: string;
  adminEmail: string;
  adminPassword?: string;
  defaultCompanyCode: string;
};

export async function createMemberTenant(payload: CreateMemberTenantApiPayload) {
  const envelope = await xbosFetch<{ success?: boolean; data?: { tenantId: string; defaultCompanyId: string } }>(
    '/tenant-scope/members',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (envelope?.success && envelope.data) {
    return envelope.data;
  }
  throw new Error('Failed to create member tenant');
}

