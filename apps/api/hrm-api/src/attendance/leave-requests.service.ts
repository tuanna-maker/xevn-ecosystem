/**
 * @CODE-MEMORY
 * Screen:     HRM → Đơn nghỉ phép
 * UC:         UC-HRM-10 · HRM-AT-10
 * BR:         fanout leave_request.* · attachment path under /api/hrm/files
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.5 · FR-HRM-AT-10
 * SRS bước:   Diễn biến #3–#6 validate · #7 Gửi thành công · #8 Thông báo duyệt
 * TechSpec:   docs/hrm/TECHSPEC.md §14.5 (ref_srs: FR-HRM-AT-10)
 * Purpose:    Tạo/list/approve/reject leave_requests + fanout + workflow bridge.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    attendance.controller.ts · leave-workflow.controller.ts
 * Callees:    AttendanceEventFanoutService · LeaveWorkflowBridge · public.leave_requests
 * must_keep:  leave-workflow bridge / terminal callback; không phá AC-ATT-SHEET
 * SOLID:      Leave tách AttendanceService records
 * LastVerified: leave-requests.service.spec.ts · leave-workflow.bridge.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến AT-10 (không đổi logic)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-DB-03-LEAVE-CREATE-01
 * change_mode: ADD
 * What: ensureSchema CREATE TABLE IF NOT EXISTS leave_requests (G-DB-03) trước ALTER cột mở rộng
 * must_keep: leave-workflow bridge; AC-ATT-SHEET
 * TechSpec: docs/hrm/TECHSPEC.md §17.3 G-DB-03 · §14.5 FR-HRM-AT-10
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-AT10-01-SCOPE-SLUG-01
 * change_mode: ADD
 * What: company_id TEXT + resolveHrmPersistCompanyIdText on create (G-AT10-01); INSERT $2::text
 * must_keep: G-DB-03 CREATE IF NOT EXISTS; leave-workflow bridge; không đụng G-AT10-02
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 · §14.9 G-AT10-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-AT10-02-LEAVE-OVERLAP-01
 * change_mode: ADD
 * What: createLeaveRequest Diễn biến #5/#6 — overlap + insufficient balance reject codes
 * must_keep: G-DB-03 CREATE; G-AT10-01 TEXT persist; leave-workflow bridge; happy path 201 khi không track số dư
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 · §14.9 G-AT10-02 · ref_srs FR-HRM-AT-10
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: BE-HRM-G-AT10-01
 * change_mode: ADD
 * What: AT-12/13 approve/reject — normalizePayrollListCompanyId trước resolveHrmListScope (UUID→slug); must_keep create TEXT + G-AT10-02
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 · §16.9 G-AT10-01 · AT-10/12/13
 *
 * @CODE-MEMORY-CHANGE 2026-07-23
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * change_mode: ADD
 * What: createLeaveRequest asserts leave_type ∈ leave_types catalog (BR-HRM-MD-01 / VAL-SET-MD-02)
 * SRS: FR-HRM-SC-LEAVE-01 · delta Cài đặt §4
 * must_keep: G-AT10-01 TEXT · G-AT10-02 overlap/balance · leave-workflow bridge
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-LEAVE-REQ-CREATE-BE-01
 * change_mode: FIX
 * What: assert leave_type via resolveHrmSettingsCatalogCompanyId (main|holding UUID→holding);
 *       pass tenantId from controller; persist TEXT slug (UUID→holding) — no ::uuid on leave_requests
 * must_keep: G-AT10-01 TEXT · G-AT10-02 · leave-workflow bridge · VAL-SET-MD-02 catalog SoT
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 FR-HRM-AT-10 · G-AT10-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-BE-ERP-E3-01
 * change_mode: ADD
 * What: approve/reject via assertStatusTransition('leave') → HRM-SM-001 on illegal reverse
 * Why: AC-E3-SM-01 · FR-HRM-CONSTRAINT-E3-01 · DB_DESIGN_HRM_ERP_E3 §2.2 leave cite
 * must_keep: G-AT10-* · leave-workflow bridge · HRM-LEAVE-404 when not pending
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-WF-LEAVE-BIND-01
 * change_mode: FIX
 * What: createLeaveRequest trả workflow_instance_id sau bridge spawn; forward authorization + submitterUserId
 * Why: QA-HDSD-W4-INT-03-R2 POST 201 nhưng workflow_instance_id null — row trả về trước UPDATE bridge
 * must_keep: G-AT10-* · leave-workflow bridge · fanout · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-WF-LEAVE-RESP-01
 * change_mode: FIX
 * What: createLeaveRequest reload row sau bridge; merge workflow_instance_id từ DB hoặc bridge result
 * Why: QA-HDSD-W4-INT-03-R3 POST 201 vẫn null dù GET sau đó có id — response phải đồng bộ
 * must_keep: G-AT10-* · leave-workflow bridge · fanout · U65 no seed
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { assertStatusTransition } from '../common/assert-status-transition';
import {
  assertResourceInHrmScope,
  normalizePayrollListCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import type { LeaveRequestRealtimePayload } from '../realtime/hrm-realtime.service';
import { HRM_SC_LEAVE_KEY } from '../settings-catalogs/hrm-settings-master-keys';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { LeaveWorkflowBridge } from './leave-workflow.bridge';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';

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
  department: string | null;
  position: string | null;
  total_days: string;
  handover_to: string | null;
  handover_tasks: string | null;
  approver_employee_id: string | null;
  rejected_reason: string | null;
  attachment_url: string | null;
  workflow_instance_id?: string | null;
};

const LEAVE_ATTACHMENT_URL_PATTERN = /^\/api\/hrm\/files\/[a-zA-Z0-9_-]+\/.+$/;

/** G-AT10-02 — deterministic reject codes (FR-HRM-AT-10 Diễn biến #5/#6). */
export const HRM_LEAVE_VAL_OVERLAP = 'HRM-LEAVE-VAL-OVERLAP';
export const HRM_LEAVE_VAL_BALANCE = 'HRM-LEAVE-VAL-BALANCE';

function assertValidLeaveAttachmentUrl(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }
  if (!LEAVE_ATTACHMENT_URL_PATTERN.test(trimmed)) {
    throw new ApiException(
      'HRM-LEAVE-VAL-ATT',
      'attachment_url must be a relative path under /api/hrm/files/{company_scope}/',
      HttpStatus.BAD_REQUEST,
    );
  }
  return trimmed;
}

function toDayNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Balance year from leave start_date (YYYY-MM-DD); fallback UTC year. */
function balanceYearFromStartDate(startDate: string): number {
  const match = /^(\d{4})-/.exec(startDate.trim());
  if (match) {
    return Number(match[1]);
  }
  return new Date().getUTCFullYear();
}

@Injectable()
export class LeaveRequestsService {
  constructor(
    private readonly db: HrmDbService,
    private readonly fanout: AttendanceEventFanoutService,
    private readonly leaveWorkflowBridge: LeaveWorkflowBridge,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
    @Optional() private readonly catalogSync?: CatalogSyncService,
  ) {}

  /**
   * Khi L1 leave_types trống — pull XBOS SoT một lần (UF-HRM-09 / Settings sync parity, không seed).
   */
  private async ensureLeaveTypeCatalogAvailable(
    authorization: string | undefined,
    tenantId: string,
    catalogCompanyId: string,
  ): Promise<void> {
    if (!this.settingsCatalogs || !this.catalogSync || !authorization?.trim()) {
      return;
    }
    const active = (
      await this.settingsCatalogs.getEffectiveItemsForKey(tenantId, catalogCompanyId, HRM_SC_LEAVE_KEY)
    ).filter((item) => item.status === 'active');
    if (active.length > 0) {
      return;
    }
    try {
      await this.catalogSync.pullCatalogFromXbos(
        HRM_SC_LEAVE_KEY,
        tenantId,
        catalogCompanyId,
        authorization,
      );
    } catch {
      // XBOS down — assertCodeInEffectiveCatalog trả 400 trung thực.
    }
  }

  /**
   * G-DB-03 — cold DB: CREATE khớp INSERT/UPDATE, rồi ALTER ADD cột mở rộng.
   * G-AT10-01 — company_id TEXT slug ladder (parity OT/requisition); ALTER UUID→TEXT khi baseline cũ.
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
      CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status
      ON public.leave_requests (company_id, status, requested_at DESC);
    `);
    // Upgrade path: baseline 0002_attendance only had core columns.
    const additiveColumns = [
      'employee_code TEXT NULL',
      'employee_name TEXT NULL',
      'department TEXT NULL',
      'position TEXT NULL',
      'total_days NUMERIC NULL',
      'handover_to TEXT NULL',
      'handover_tasks TEXT NULL',
      'approver_employee_id UUID NULL',
      'rejected_reason TEXT NULL',
      'attachment_url TEXT NULL',
      'workflow_instance_id UUID NULL',
    ];
    for (const col of additiveColumns) {
      await this.db.query(`
        ALTER TABLE public.leave_requests
        ADD COLUMN IF NOT EXISTS ${col};
      `);
    }
    // G-AT10-01 — existing UUID column → TEXT (idempotent USING ::text).
    await this.db.query(`
      ALTER TABLE public.leave_requests
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
  }

  /** Reload leave row after workflow bridge UPDATE (POST 201 must include workflow_instance_id). */
  private async loadLeaveRequestById(requestId: string): Promise<LeaveRow | null> {
    const res = await this.db.query<LeaveRow>(
      `SELECT * FROM public.leave_requests WHERE id = $1::uuid LIMIT 1`,
      [requestId],
    );
    return res.rows[0] ?? null;
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

  /** Soft balance table — chỉ enforce khi có bản ghi / custom_fields (SRS: nếu theo dõi số dư). */
  private async ensureLeaveBalanceSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL DEFAULT 'annual',
        balance_year INT NOT NULL,
        entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
  }

  /**
   * G-AT10-02 / Diễn biến #5 — chồng pending|approved cùng NV (daterange inclusive).
   */
  private async assertNoLeaveOverlap(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const res = await this.db.query<{ id: string; status: string }>(
      `
        SELECT id::text AS id, status
        FROM public.leave_requests
        WHERE employee_id = $1::uuid
          AND status IN ('pending', 'approved')
          AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
        LIMIT 1;
      `,
      [employeeId, startDate, endDate],
    );
    const hit = res.rows[0];
    if (hit) {
      // Thất bại: Diễn biến #5 — đã có đơn trùng ngày.
      throw new ApiException(
        HRM_LEAVE_VAL_OVERLAP,
        'Leave request overlaps an existing pending or approved leave',
        HttpStatus.CONFLICT,
        { conflicting_id: hit.id, conflicting_status: hit.status },
      );
    }
  }

  /**
   * G-AT10-02 / Diễn biến #6 — hết phép khi hệ thống theo dõi số dư.
   * Không có row balance + không custom_fields → không track → cho tạo (must_keep happy path).
   */
  private async assertSufficientLeaveBalance(input: {
    companyId: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    totalDays: number;
  }): Promise<void> {
    await this.ensureLeaveBalanceSchema();
    const leaveType = input.leaveType.trim() || 'annual';
    const balanceYear = balanceYearFromStartDate(input.startDate);

    const balRes = await this.db.query<{
      entitled_days: string;
      used_days: string;
      pending_days: string;
    }>(
      `
        SELECT entitled_days::text, used_days::text, pending_days::text
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4
        LIMIT 1;
      `,
      [input.companyId, input.employeeId, leaveType, balanceYear],
    );

    let availableDays: number | null = null;
    let source: 'employee_leave_balances' | 'custom_fields' | null = null;

    const bal = balRes.rows[0];
    if (bal) {
      availableDays = Math.max(
        0,
        toDayNumber(bal.entitled_days) - toDayNumber(bal.used_days) - toDayNumber(bal.pending_days),
      );
      source = 'employee_leave_balances';
    } else {
      const empRes = await this.db.query<{ custom_fields: Record<string, unknown> | null }>(
        `
          SELECT custom_fields
          FROM public.employees
          WHERE id = $1::uuid AND archived_at IS NULL
          LIMIT 1;
        `,
        [input.employeeId],
      );
      const custom = empRes.rows[0]?.custom_fields ?? null;
      const raw = custom?.[`leave_balance_${leaveType}`];
      if (raw != null && raw !== '') {
        availableDays = Math.max(0, toDayNumber(String(raw)));
        source = 'custom_fields';
      }
    }

    // Không theo dõi số dư → bỏ qua (SRS: «nếu hệ thống theo dõi số dư»).
    if (availableDays == null || source == null) {
      return;
    }

    if (input.totalDays > availableDays) {
      // Thất bại: Diễn biến #6 — không đủ số dư phép.
      throw new ApiException(
        HRM_LEAVE_VAL_BALANCE,
        'Insufficient leave balance for requested total_days',
        HttpStatus.BAD_REQUEST,
        {
          leave_type: leaveType,
          balance_year: balanceYear,
          available_days: availableDays,
          requested_days: input.totalDays,
          source,
        },
      );
    }
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-10 · G-AT10-01 · G-AT10-02
   * SRS bước: Diễn biến #4 Ngày sai · #5 Chồng lịch · #6 Hết phép · #7 Gửi thành công (+ fanout #8)
   * TechSpec: §14.5 / §14.9 ref_srs FR-HRM-AT-10 — company_id TEXT slug ladder + overlap/balance codes
   */
  async createLeaveRequest(
    body: CreateLeaveRequestDto,
    authorization?: string,
    options?: { submitterUserId?: string; tenantId?: string; companySlug?: string },
  ) {
    await this.ensureSchema();
    // Thất bại: Diễn biến #4 — đến ngày trước từ ngày.
    if (body.start_date > body.end_date) {
      throw new ApiException(
        'HRM-LEAVE-VAL-DATES',
        'start_date must be on or before end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    // G-AT10-01: slug/main/UUID → holding TEXT (parity OT/requisition); không ép ::uuid.
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id, {
      tenantId: options?.tenantId,
    });
    const attachmentUrl = assertValidLeaveAttachmentUrl(body.attachment_url);
    const leaveType = body.leave_type.trim();

    // BR-HRM-MD-01 / VAL-SET-MD-02 — same catalog partition as Settings (main|UUID→holding).
    if (this.settingsCatalogs) {
      const tenantForCatalog =
        options?.tenantId?.trim() || masterTenantIdFromEnv() || 'xevn';
      const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
        authorization,
        tenantForCatalog,
        body.company_id,
      );
      await this.ensureLeaveTypeCatalogAvailable(authorization, tenantForCatalog, catalogCompanyId);
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: tenantForCatalog,
        companyId: catalogCompanyId,
        catalogKey: HRM_SC_LEAVE_KEY,
        code: leaveType,
        errorCode: 'HRM-ATT-LEAVE-TYPE',
        errorMessage: `leave_type '${leaveType}' is not in leave_types catalog (free-text SoT forbidden)`,
      });
    }

    // Diễn biến #5 — chồng pending/approved.
    await this.assertNoLeaveOverlap(body.employee_id, body.start_date, body.end_date);
    // Diễn biến #6 — hết phép khi có số dư tracked.
    await this.assertSufficientLeaveBalance({
      companyId,
      employeeId: body.employee_id,
      leaveType,
      startDate: body.start_date,
      totalDays: body.total_days,
    });

    const id = randomUUID();
    const res = await this.db.query<LeaveRow>(
      `
        INSERT INTO public.leave_requests (
          id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
          employee_code, employee_name, department, position, total_days, handover_to, handover_tasks,
          attachment_url, requested_at
        ) VALUES (
          $1::uuid, $2::text, $3::uuid, $4, $5::date, $6::date, $7, 'pending',
          $8, $9, $10, $11, $12, $13, $14, $15, NOW()
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.employee_id,
        leaveType,
        body.start_date,
        body.end_date,
        body.reason?.trim() ?? null,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        body.total_days,
        body.handover_to?.trim() ?? null,
        body.handover_tasks?.trim() ?? null,
        attachmentUrl,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-500', 'Failed to create leave request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const payload = this.toPayload(row);
    await this.fanout.onLeaveRequestCreated(payload);
    const wfResult = await this.leaveWorkflowBridge.startLeaveWorkflowIfConfigured({
      leaveRequestId: row.id,
      companyId: row.company_id,
      employeeId: row.employee_id,
      submitterUserId: options?.submitterUserId,
      tenantId: options?.tenantId,
      companySlug: options?.companySlug ?? companyId,
      authorization,
    });
    const refreshed = await this.loadLeaveRequestById(row.id);
    const workflowInstanceId =
      refreshed?.workflow_instance_id?.trim() ||
      wfResult?.workflowInstanceId?.trim() ||
      null;
    if (refreshed) {
      return { ...refreshed, workflow_instance_id: workflowInstanceId };
    }
    return { ...row, workflow_instance_id: workflowInstanceId };
  }

  async approveLeaveRequestInternal(requestId: string, body: DecideLeaveRequestDto) {
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
    return row;
  }

  async rejectLeaveRequestInternal(requestId: string, body: DecideLeaveRequestDto) {
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [
        requestId,
        body.reviewer_name.trim(),
        body.rejected_reason?.trim() ?? null,
        body.reviewer_employee_id ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return row;
  }

  async listLeaveRequests(
    query: ListLeaveRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const params: unknown[] = [];
    const filters: string[] = [];
    pushWorkforceEmployeeScopeFilter(filters, params, scope, 'lr.employee_id');
    let sql = `SELECT lr.* FROM public.leave_requests lr WHERE ${filters.join(' AND ')}`;
    if (query.status?.trim()) {
      params.push(query.status.trim());
      sql += ` AND lr.status = $${params.length}`;
    }
    if (query.employee_id) {
      params.push(query.employee_id);
      sql += ` AND lr.employee_id = $${params.length}::uuid`;
    }
    if (query.manager_employee_id) {
      params.push(query.manager_employee_id);
      sql += ` AND lr.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${params.length}::uuid AND e.archived_at IS NULL
      )`;
    }
    sql += ` ORDER BY lr.requested_at DESC LIMIT 200`;
    const res = await this.db.query<LeaveRow>(sql, params);
    return { total: res.rows.length, data: res.rows };
  }

  private async loadLeaveRequestCompany(
    requestId: string,
  ): Promise<{ company_id: string; status: string } | null> {
    const res = await this.db.query<{ company_id: string; status: string }>(
      `SELECT company_id::text AS company_id, status FROM public.leave_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  async approveLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    // G-AT10-01 / AT-12 — UUID query → slug ladder (parity list); row.company_id is TEXT.
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    assertStatusTransition({
      domain: 'leave',
      from: String(existing!.status ?? 'pending'),
      to: 'approved',
      entityId: requestId,
    });
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
    return row;
  }

  async rejectLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    // G-AT10-01 / AT-13 — same slug/TEXT scope ladder as approve + list.
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    assertStatusTransition({
      domain: 'leave',
      from: String(existing!.status ?? 'pending'),
      to: 'rejected',
      entityId: requestId,
    });
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [
        requestId,
        body.reviewer_name.trim(),
        body.rejected_reason?.trim() ?? null,
        body.reviewer_employee_id ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return row;
  }
}
