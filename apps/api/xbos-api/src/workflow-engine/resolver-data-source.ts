import { HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { resolveHrmApiBaseUrl } from '../common/resolve-hrm-api-base-url';
import { GROUP_APPROVER_USER, MASTER_TENANT_XEVN } from './workflow-catalog.constants';
import type { ResolverDataSource } from './resolver-registry.types';

function internalApiKey(): string {
  return process.env.INTERNAL_API_KEY ?? 'xevn-dev-internal-key';
}

export class XbosResolverDataSource implements ResolverDataSource {
  constructor(private readonly db: XbosDbService) {}

  async isUserActive(userId: string): Promise<boolean> {
    const normalized = userId.trim().toLowerCase();
    if (!normalized) return false;
    const { rows } = await this.db.query<{ active: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM public.xbos_user_tenant_membership
         WHERE lower(user_id) = $1 AND status = 'active'
       ) AS active`,
      [normalized],
    );
    return Boolean(rows[0]?.active);
  }

  async queryPositionAssignments(
    tenantId: string,
    companyId: string,
    positionCode: string,
  ): Promise<Array<{ userId: string; assignmentId: string; hatKey: string }>> {
    const { rows } = await this.db.query<{
      user_id: string;
      id: string;
      code: string;
    }>(
      `SELECT a.user_id, a.id::text AS id, t.code
       FROM public.xbos_position_assignment a
       JOIN public.xbos_position_template t ON t.id = a.position_template_id
       WHERE a.tenant_id = $1
         AND a.company_id = $2
         AND lower(t.code) = lower($3)
         AND a.status = 'active'
         AND a.user_id IS NOT NULL
         AND (a.valid_to IS NULL OR a.valid_to >= CURRENT_DATE)`,
      [tenantId, companyId, positionCode],
    );
    return rows
      .filter((r) => r.user_id?.trim())
      .map((r) => ({
        userId: r.user_id.trim().toLowerCase(),
        assignmentId: r.id,
        hatKey: r.code.trim().toLowerCase(),
      }));
  }

  async queryRoleMembership(tenantId: string, roleCode: string): Promise<string[]> {
    // DISTINCT on lower(trim(...)) — casing variants must not fan-out duplicate tasks
    // (XHRM-REC-WF-BE-TERMINAL-01: 2× admin@xe.vn blocked CEO-only terminal).
    const { rows } = await this.db.query<{ user_id: string }>(
      `SELECT DISTINCT lower(trim(user_id)) AS user_id
       FROM public.xbos_user_tenant_membership
       WHERE tenant_id = $1
         AND lower(role_code) = lower($2)
         AND status = 'active'
         AND user_id IS NOT NULL
         AND trim(user_id) <> ''`,
      [tenantId, roleCode],
    );
    return rows.map((r) => r.user_id).filter(Boolean);
  }

  async queryDirectManagerUserId(employeeId: string, companyId: string): Promise<string | null> {
    try {
      const res = await fetch(
        `${resolveHrmApiBaseUrl()}/api/hrm/attendance/workflow-resolver/manager?employee_id=${encodeURIComponent(employeeId)}&company_id=${encodeURIComponent(companyId)}`,
        {
          method: 'GET',
          headers: {
            'x-internal-api-key': internalApiKey(),
            'content-type': 'application/json',
          },
        },
      );
      if (!res.ok) return null;
      const json = (await res.json()) as {
        success?: boolean;
        data?: { manager_user_id?: string | null };
      };
      const managerUserId = json.data?.manager_user_id;
      return typeof managerUserId === 'string' && managerUserId.trim()
        ? managerUserId.trim().toLowerCase()
        : null;
    } catch {
      return null;
    }
  }

  async queryManagerEmployeeId(employeeId: string): Promise<string | null> {
    try {
      const res = await fetch(
        `${resolveHrmApiBaseUrl()}/api/hrm/attendance/workflow-resolver/manager?employee_id=${encodeURIComponent(employeeId)}`,
        {
          method: 'GET',
          headers: {
            'x-internal-api-key': internalApiKey(),
            'content-type': 'application/json',
          },
        },
      );
      if (!res.ok) return null;
      const json = (await res.json()) as {
        success?: boolean;
        data?: { manager_employee_id?: string | null };
      };
      const managerEmployeeId = json.data?.manager_employee_id;
      return typeof managerEmployeeId === 'string' && managerEmployeeId.trim()
        ? managerEmployeeId.trim()
        : null;
    } catch {
      return null;
    }
  }
}

export function createInMemoryResolverDataSource(
  seed: Partial<{
    positionAssignments: Array<{ tenantId: string; companyId: string; positionCode: string; userId: string; assignmentId: string }>;
    roleMembers: Array<{ tenantId: string; roleCode: string; userId: string }>;
    managers: Record<string, string>;
    managerEmployeeIds: Record<string, string>;
    activeUsers: Set<string>;
  }>,
): ResolverDataSource {
  const positionAssignments = seed.positionAssignments ?? [];
  const roleMembers = seed.roleMembers ?? [];
  const managers = seed.managers ?? {};
  const managerEmployeeIds = seed.managerEmployeeIds ?? {};
  const activeUsers = seed.activeUsers ?? new Set<string>();

  return {
    isUserActive: async (userId) => activeUsers.size === 0 || activeUsers.has(userId.toLowerCase()),
    queryPositionAssignments: async (tenantId, companyId, positionCode) =>
      positionAssignments
        .filter(
          (a) =>
            a.tenantId === tenantId &&
            a.companyId === companyId &&
            a.positionCode.toLowerCase() === positionCode.toLowerCase(),
        )
        .map((a) => ({
          userId: a.userId.toLowerCase(),
          assignmentId: a.assignmentId,
          hatKey: positionCode.toLowerCase(),
        })),
    queryRoleMembership: async (tenantId, roleCode) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const r of roleMembers) {
        if (r.tenantId !== tenantId || r.roleCode.toLowerCase() !== roleCode.toLowerCase()) continue;
        const id = r.userId.trim().toLowerCase();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        out.push(id);
      }
      return out;
    },
    queryDirectManagerUserId: async (employeeId) => managers[employeeId] ?? null,
    queryManagerEmployeeId: async (employeeId) => managerEmployeeIds[employeeId] ?? null,
  };
}

export function defaultEscalationPositionCode(config: Record<string, unknown>): string {
  const fromConfig = config.escalation_position_code ?? config.escalationPositionCode;
  return typeof fromConfig === 'string' && fromConfig.trim() ? fromConfig.trim() : 'CHRO';
}

export function normalizeResolverCompanyId(companyId: string, config: Record<string, unknown>): string {
  const fromConfig = config.company_id ?? config.companyId;
  if (typeof fromConfig === 'string' && fromConfig.trim()) {
    const c = fromConfig.trim().toLowerCase();
    return c === 'main' ? 'holding' : c;
  }
  const c = companyId.trim().toLowerCase();
  return c === 'main' ? 'holding' : c;
}

export function parseResolverType(step: Record<string, unknown>): string {
  const explicit = step.resolver_type ?? step.resolverType;
  if (typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim().toLowerCase();
  }
  const assignee = step.assigneeUserId ?? step.assignee_user_id;
  if (typeof assignee === 'string' && assignee.trim()) {
    return 'fixed_user';
  }
  const handlerRoleId = step.handlerRoleId ?? step.handler_role_id;
  if (typeof handlerRoleId === 'string' && handlerRoleId.trim()) {
    return 'fixed_user';
  }
  return 'fixed_user';
}

export function parseResolverConfig(step: Record<string, unknown>): Record<string, unknown> {
  const raw = step.resolver_config ?? step.resolverConfig;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  const assignee = step.assigneeUserId ?? step.assignee_user_id;
  if (typeof assignee === 'string' && assignee.trim()) {
    return { user_id: assignee.trim() };
  }
  const handlerRoleId = String(step.handlerRoleId ?? step.handler_role_id ?? '').trim();
  if (handlerRoleId) {
    return { user_id: GROUP_APPROVER_USER, hat_key: handlerRoleId };
  }
  return {};
}

export function isDynamicResolverEnabled(): boolean {
  return process.env.WORKFLOW_DYNAMIC_RESOLVER_ENABLED !== 'false';
}

export function newParallelGroupId(): string {
  return randomUUID();
}

export function assertKnownResolverType(resolverType: string): void {
  const known = new Set([
    'fixed_user',
    'position_template',
    'direct_manager',
    'role_code',
    'parallel_group',
  ]);
  if (!known.has(resolverType)) {
    throw new ApiException(
      'XBOS-WF-400',
      `Unknown resolver_type: ${resolverType}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export const ESCALATION_MASTER_TENANT = MASTER_TENANT_XEVN;
