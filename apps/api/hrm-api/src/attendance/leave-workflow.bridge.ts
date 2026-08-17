/**
 * @CODE-MEMORY
 * Screen: HRM leave → XBOS workflow-engine instances/start (S2S manager resolve)
 * UC: UC-HRM-WF-01 / UC-HRM-WF-02 · AC-CD-F4-01..02
 * BR: BR-CD-F4-02 (direct_manager) · BR-CD-F4-04 (escalate only when manager missing)
 * SRS: docs/decisions/ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md §5/§9
 * TechSpec: F4 delta — HRM GET /attendance/workflow-resolver/manager
 * Purpose: Bridge leave spawn + terminal callback; resolveDirectManager reads
 *   employees.manager_id under TEXT company_id slug scope (never ::uuid cast).
 * WorkItem: CD-FB-07-WF-DYNAMIC-BE-FIX-01
 * Coded: 2026-07-19
 * Callers: LeaveWorkflowController · LeaveRequestsService (spawn)
 * Callees: HrmDbService → employees · CatalogSync → XBOS instances/start
 * Impact: Wrong ::uuid cast → HRM-SYS-001 → null manager → group_ceo escalation
 * must_keep: CatalogWorkflowBridge; F4 resolver registry; terminal callback semantics
 * SOLID: SRP — leave↔WF bridge only; company TEXT normalize local to resolve path
 * LastVerified: leave-workflow.bridge.spec.ts · cd-fb-07-wf-dynamic-be-fix-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-07-WF-DYNAMIC-BE-FIX-01
 * Fix resolveManagerForWorkflow: employees.company_id is TEXT (holding slug).
 * Compare via ::text / ANY(text[]) after expanding main→holding and UUID↔slug.
 * Cite: ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620 §5 + R-WF-01 · F4 AC-CD-F4-01/02.
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-DB-03-LEAVE-CREATE-01
 * change_mode: ADD
 * What: ensureSchema CREATE TABLE IF NOT EXISTS leave_requests trước ALTER workflow_instance_id (cold callback)
 * TechSpec: docs/hrm/TECHSPEC.md §17.3 G-DB-03
 * must_keep: CD-FB-07 TEXT slug resolve; terminal callback semantics
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-WF-LEAVE-BIND-01
 * change_mode: FIX
 * What: Group CEO portal scope parity recruitment bridge; x-tenant-id/x-company-id headers; forward authorization
 * Why: QA-HDSD-W4-INT-03-R2 spawn miss when memberCompanyId=main vs holding partition
 * must_keep: terminal callback · F4 resolver · CD-FB-07 TEXT slug
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-WF-LEAVE-RESP-01
 * change_mode: FIX
 * What: UPDATE … RETURNING workflow_instance_id; parse data.instanceId from XBOS ok() envelope
 * Why: POST 201 must include workflow_instance_id synchronously — QA-HDSD-W4-INT-03-R3
 * must_keep: terminal callback · BIND-01 scope headers · CD-FB-07 TEXT slug
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-01
 * change_mode: ADD
 * What: Terminal completed → materialize leave attendance markers (Option A);
 *       terminal rejected after pending only (no markers) — reverse via cancel path.
 * must_keep: G-DB-03 · CD-FB-07 · WAIVE_L2 · no AGG
 */
import { Injectable, Logger, Optional } from '@nestjs/common';
import { CatalogSyncService, resolveXbosApiBaseUrl } from '../catalog-sync/catalog-sync.service';
import {
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  HRM_PILOT_OPERATING_COMPANY_ID,
  MASTER_TENANT_ID,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import type { LeaveRequestRealtimePayload } from '../realtime/hrm-realtime.service';
import { LeaveAttendanceFunnelService } from './leave-attendance-funnel.service';

const GROUP_HOLDING_COMPANY_ID = 'holding';
const GROUP_OPERATING_MAIN = 'main';
const WF_HRM_LEAVE_APPROVAL_CODE = 'hrm_leave_approval';
const WF_BUSINESS_TYPE_HRM_LEAVE = 'hrm_leave';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Expand submitter company_id (slug | main | pilot UUID) to TEXT match set for
 * `employees.company_id` — ADR R-WF-01 / scope ladder. Never cast to uuid.
 */
export function expandWorkflowResolverCompanyIds(companyId: string): string[] {
  const raw = companyId.trim().toLowerCase();
  if (!raw) return [];
  const out = new Set<string>();
  const normalized = raw === HRM_PILOT_OPERATING_COMPANY_ID ? GROUP_HOLDING_COMPANY_ID : raw;
  out.add(normalized);

  if (UUID_RE.test(normalized)) {
    for (const slug of HRM_GROUP_MEMBER_COMPANY_SLUGS) {
      if (HRM_COMPANY_UUID_BY_SLUG[slug] === normalized) {
        out.add(slug);
        break;
      }
    }
  } else {
    const uuid = HRM_COMPANY_UUID_BY_SLUG[normalized as keyof typeof HRM_COMPANY_UUID_BY_SLUG];
    if (uuid) out.add(uuid);
  }
  return [...out];
}

export type LeaveWorkflowSpawnContext = {
  leaveRequestId: string;
  companyId: string;
  employeeId: string;
  submitterUserId?: string;
  tenantId?: string;
  companySlug?: string;
  /** Portal/service bearer — forwarded for XBOS scope + S2S JWT fallback. */
  authorization?: string;
};

@Injectable()
export class LeaveWorkflowBridge {
  private readonly logger = new Logger(LeaveWorkflowBridge.name);

  constructor(
    private readonly catalogSync: CatalogSyncService,
    private readonly db: HrmDbService,
    private readonly fanout: AttendanceEventFanoutService,
    @Optional() private readonly leaveAttendanceFunnel?: LeaveAttendanceFunnelService,
  ) {}

  private xbosBaseUrl(): string {
    return resolveXbosApiBaseUrl();
  }

  /**
   * G-DB-03 — cold DB: CREATE khớp LeaveRequestsService trước ALTER cột WF.
   * Callback/spawn không phụ thuộc bootstrap ngoài Nest.
   */
  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.leave_requests (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ NULL,
        reviewed_by TEXT NULL,
        employee_code TEXT NULL,
        employee_name TEXT NULL,
        department TEXT NULL,
        position TEXT NULL,
        total_days NUMERIC NOT NULL DEFAULT 1,
        handover_to TEXT NULL,
        handover_tasks TEXT NULL,
        approver_employee_id UUID NULL,
        rejected_reason TEXT NULL,
        attachment_url TEXT NULL,
        workflow_instance_id UUID NULL,
        CONSTRAINT chk_leave_date_range CHECK (start_date <= end_date),
        CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
      );
    `);
    await this.db.query(`
      ALTER TABLE public.leave_requests
      ADD COLUMN IF NOT EXISTS workflow_instance_id UUID NULL;
    `);
  }

  async resolveManagerForWorkflow(employeeId: string, companyId?: string): Promise<{
    manager_user_id: string | null;
    manager_employee_id: string | null;
  }> {
    const params: unknown[] = [employeeId];
    let companyFilter = '';
    if (companyId?.trim()) {
      const companyIds = expandWorkflowResolverCompanyIds(companyId);
      params.push(companyIds);
      // employees.company_id is TEXT slug (holding, …) — never compare as ::uuid (CD-FB-07 P0)
      companyFilter = ` AND e.company_id = ANY($${params.length}::text[])`;
    }
    const res = await this.db.query<{
      manager_user_id: string | null;
      manager_employee_id: string | null;
    }>(
      `
        SELECT lower(m.email) AS manager_user_id, m.id::text AS manager_employee_id
        FROM public.employees e
        LEFT JOIN public.employees m ON m.id = e.manager_id AND m.archived_at IS NULL
        WHERE e.id = $1::uuid
          AND e.archived_at IS NULL
          ${companyFilter}
        LIMIT 1;
      `,
      params,
    );
    const row = res.rows[0];
    return {
      manager_user_id: row?.manager_user_id ?? null,
      manager_employee_id: row?.manager_employee_id ?? null,
    };
  }

  async startLeaveWorkflowIfConfigured(ctx: LeaveWorkflowSpawnContext): Promise<{ workflowInstanceId?: string } | null> {
    await this.ensureSchema();
    const tenantId = (ctx.tenantId ?? MASTER_TENANT_ID).trim().toLowerCase();
    const companySlug =
      (ctx.companySlug ?? GROUP_HOLDING_COMPANY_ID).trim().toLowerCase() || GROUP_HOLDING_COMPANY_ID;
    const isGroupCeoPortal =
      tenantId === MASTER_TENANT_ID &&
      (companySlug === GROUP_OPERATING_MAIN || companySlug === GROUP_HOLDING_COMPANY_ID);
    const xbosHeaderCompanyId = isGroupCeoPortal ? GROUP_HOLDING_COMPANY_ID : companySlug;
    const memberCompanyId = isGroupCeoPortal ? GROUP_HOLDING_COMPANY_ID : companySlug;
    const entityCompanyId = (ctx.companyId?.trim().toLowerCase() || memberCompanyId);
    const upstreamHeaders = this.catalogSync.buildXbosUpstreamHeaders(ctx.authorization, {
      tenantId,
      companyId: xbosHeaderCompanyId,
    });

    try {
      const res = await fetch(`${this.xbosBaseUrl()}/api/xbos/workflow-engine/instances/start`, {
        method: 'POST',
        headers: {
          ...upstreamHeaders,
          'content-type': 'application/json',
          'x-tenant-id': tenantId,
          'x-company-id': xbosHeaderCompanyId,
        },
        body: JSON.stringify({
          workflowCode: WF_HRM_LEAVE_APPROVAL_CODE,
          businessType: WF_BUSINESS_TYPE_HRM_LEAVE,
          businessId: ctx.leaveRequestId,
          submitter: {
            userId: ctx.submitterUserId ?? null,
            employeeId: ctx.employeeId,
            companyId: entityCompanyId,
            companySlug: memberCompanyId,
          },
          context: {
            memberTenantId: tenantId,
            memberCompanyId,
            entityCompanyId,
            leaveRequestId: ctx.leaveRequestId,
          },
        }),
      });
      const json = (await res.json()) as {
        success?: boolean;
        code?: string;
        message?: string;
        data?: { id?: string; workflowInstanceId?: string; instanceId?: string };
      };
      if (!res.ok || !json.success) {
        this.logger.warn(
          `HRM-WF-SPAWN-MISSING: leave=${ctx.leaveRequestId} XBOS start failed status=${res.status} code=${json.code ?? 'unknown'} msg=${json.message ?? ''}`,
        );
        return null;
      }
      const data = json.data ?? {};
      const instanceId =
        (typeof data.id === 'string' && data.id.trim()) ||
        (typeof data.workflowInstanceId === 'string' && data.workflowInstanceId.trim()) ||
        (typeof data.instanceId === 'string' && data.instanceId.trim()) ||
        '';
      if (!instanceId) {
        this.logger.warn(
          `HRM-WF-SPAWN-MISSING: leave=${ctx.leaveRequestId} XBOS start returned no instance id`,
        );
        return null;
      }

      const updateRes = await this.db.query<{ workflow_instance_id: string }>(
        `UPDATE public.leave_requests
         SET workflow_instance_id = $2::uuid
         WHERE id = $1::uuid
         RETURNING workflow_instance_id::text AS workflow_instance_id`,
        [ctx.leaveRequestId, instanceId],
      );
      const persistedId = updateRes.rows[0]?.workflow_instance_id?.trim() || instanceId;
      return { workflowInstanceId: persistedId };
    } catch (err) {
      this.logger.warn(
        `HRM-WF-SPAWN-MISSING: XBOS workflow start error ${err instanceof Error ? err.message : String(err)}`,
      );
      return null;
    }
  }

  async handleTerminalCallback(payload: {
    leaveRequestId: string;
    workflowInstanceId?: string;
    terminalStatus: 'completed' | 'rejected';
    reviewerUserId: string;
    reviewerName?: string;
    rejectedReason?: string | null;
  }): Promise<{ applied: boolean; status: string }> {
    await this.ensureSchema();
    const pending = await this.db.query<{ status: string }>(
      `SELECT status FROM public.leave_requests WHERE id = $1::uuid LIMIT 1`,
      [payload.leaveRequestId],
    );
    const currentStatus = pending.rows[0]?.status;
    if (!currentStatus) {
      throw new Error('HRM-LEAVE-404');
    }
    if (currentStatus !== 'pending') {
      this.logger.log(`HRM-WF-CALLBACK-SKIP leave=${payload.leaveRequestId} status=${currentStatus}`);
      return { applied: false, status: currentStatus };
    }

    const reviewerName = (payload.reviewerName ?? payload.reviewerUserId).trim();
    if (payload.terminalStatus === 'completed') {
      const res = await this.db.query<LeaveRow>(
        `
          UPDATE public.leave_requests
          SET status = 'approved',
              reviewed_at = NOW(),
              reviewed_by = $2
          WHERE id = $1::uuid AND status = 'pending'
          RETURNING *;
        `,
        [payload.leaveRequestId, reviewerName],
      );
      const row = res.rows[0];
      if (!row) {
        throw new Error('HRM-LEAVE-404');
      }
      await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
      if (this.leaveAttendanceFunnel) {
        await this.leaveAttendanceFunnel.materializeApprovedLeave({
          id: row.id,
          company_id: row.company_id,
          employee_id: row.employee_id,
          leave_type: row.leave_type,
          start_date: row.start_date,
          end_date: row.end_date,
        });
      }
      return { applied: true, status: 'approved' };
    }

    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [payload.leaveRequestId, reviewerName, payload.rejectedReason ?? 'Workflow rejected'],
    );
    const row = res.rows[0];
    if (!row) {
      throw new Error('HRM-LEAVE-404');
    }
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return { applied: true, status: 'rejected' };
  }

  private toPayload(row: LeaveRow): LeaveRequestRealtimePayload {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code ?? '',
      employee_name: row.employee_name ?? '',
      leave_type: row.leave_type,
      start_date: row.start_date,
      end_date: row.end_date,
      total_days: Number(row.total_days ?? 1),
      reason: row.reason,
      status: row.status,
      requested_at: row.requested_at,
      reviewed_at: row.reviewed_at,
      reviewed_by: row.reviewed_by,
      rejected_reason: row.rejected_reason,
    };
  }
}

type LeaveRow = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string | null;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejected_reason: string | null;
  total_days: string;
};
