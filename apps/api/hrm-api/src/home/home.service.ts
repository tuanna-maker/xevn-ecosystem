import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  normalizeHomeSummaryCompanyId,
  pushCompanyIdUuidFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { AttendanceService } from '../attendance/attendance.service';
import { HrmDbService } from '../db/hrm-db.service';
import type { GetHomeSummaryQueryDto } from './dto/get-home-summary.query.dto';
import type {
  HomeCelebrationItem,
  HomeSummaryData,
  HomeSummaryManagerPreviewItem,
  HomeSummaryTaskItem,
  HomeWhosOutItem,
} from './home-summary.types';

const DEFAULT_INCLUDE = ['tasks', 'manager_pending'] as const;
const HCM_TIMEZONE = 'Asia/Ho_Chi_Minh';
const PREVIEW_LIMIT = 5;
const CELEBRATION_LIMIT = 50;
const WHOS_OUT_LIMIT = 50;

type ViewerRow = {
  id: string;
  full_name: string;
  company_id: string;
  custom_fields: Record<string, string> | null;
};

function todayIsoInHoChiMinh(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: HCM_TIMEZONE }).format(
    new Date(),
  );
}

function monthDayFromIsoDate(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  return `${match[2]}-${match[3]}`;
}

function todayMonthDayInHoChiMinh(): string {
  const iso = todayIsoInHoChiMinh();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  return `${match[2]}-${match[3]}`;
}

function formatLeaveDateRange(start: string, end: string): string {
  const fmt = (raw: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
    return m ? `${m[3]}/${m[2]}` : raw;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

function formatDisplayDateFromMonthDay(monthDay: string): string {
  const match = /^(\d{2})-(\d{2})$/.exec(monthDay.trim());
  if (!match) return '';
  return `${match[2]}/${match[1]}`;
}

function normalizeTimestamp(value: string | Date | null | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function compareTimestampsDesc(
  a: string | Date | null | undefined,
  b: string | Date | null | undefined,
): number {
  return normalizeTimestamp(b).localeCompare(normalizeTimestamp(a));
}

function resolveEmployeeInitials(fullName: string | undefined | null): string {
  const parts = (fullName?.trim() ?? '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function parseInclude(raw: string | undefined): Set<string> {
  if (!raw?.trim()) {
    return new Set(DEFAULT_INCLUDE);
  }
  return new Set(
    raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

function readJwtRoles(authorization: string | undefined): string[] {
  const payload = getVerifiedInternalJwtPayload(authorization);
  const roles = payload?.roles;
  if (Array.isArray(roles)) {
    return roles.filter((r): r is string => typeof r === 'string');
  }
  return [];
}

function isManagerRole(roles: string[]): boolean {
  return roles.includes('manager') || roles.includes('hr_manager');
}

function inboxTitle(
  eventType: string | null | undefined,
  payload: unknown,
  isManager: boolean,
): string {
  const type = eventType ?? '';
  const envelope = payload as {
    type?: string;
    request?: Record<string, unknown>;
  } | null;
  const req = envelope?.request ?? {};
  const name = String(req.employee_name ?? 'Nhân viên');
  if (type === 'leave_request.created') {
    return isManager ? `Đơn nghỉ mới — ${name}` : `Đơn nghỉ — ${name}`;
  }
  if (type === 'leave_request.approved') {
    return 'Đơn nghỉ đã duyệt';
  }
  if (type === 'leave_request.rejected') {
    return 'Đơn nghỉ đã từ chối';
  }
  if (type.startsWith('attendance_update_request.')) {
    return isManager ? `Chỉnh sửa chấm công — ${name}` : `Chỉnh sửa chấm công`;
  }
  if (type.startsWith('service_request.')) {
    return `Yêu cầu dịch vụ — ${name}`;
  }
  return 'Thông báo';
}

function inboxDeepLink(
  eventType: string | null | undefined,
  isManager: boolean,
): string {
  const type = eventType ?? '';
  if (type === 'leave_request.created' && isManager) {
    return 'ManagerApprovals';
  }
  if (type.startsWith('attendance_update_request.') && isManager) {
    return 'ManagerApprovals';
  }
  if (type.startsWith('leave_request.')) {
    return 'LeaveRequestDetail';
  }
  if (type.startsWith('attendance_update_request.')) {
    return 'UpdateRequests';
  }
  return 'InAppNotifications';
}

@Injectable()
export class HomeService {
  constructor(
    private readonly db: HrmDbService,
    private readonly attendance: AttendanceService,
  ) {}

  async getSummary(
    query: GetHomeSummaryQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<HomeSummaryData> {
    const companyId = normalizeHomeSummaryCompanyId(
      authorization,
      query.company_id,
    );
    const scopedQuery: GetHomeSummaryQueryDto = {
      ...query,
      company_id: companyId,
    };
    resolveHrmListScope(authorization, companyId, { tenantId });
    const include = parseInclude(query.include);
    const roles = readJwtRoles(authorization);
    const isManager = isManagerRole(roles);
    const viewer = await this.loadViewer(
      scopedQuery.employee_id,
      companyId,
      authorization,
      tenantId,
    );

    let celebrations = { total_count: 0, items: [] as HomeCelebrationItem[] };
    let whosOut = { total_count: 0, items: [] as HomeWhosOutItem[] };

    let tasks = {
      total_count: 0,
      unread_inbox_count: 0,
      own_pending_count: 0,
      items: [] as HomeSummaryTaskItem[],
    };
    let managerPending = {
      total_count: 0,
      leave_count: 0,
      update_count: 0,
      preview: [] as HomeSummaryManagerPreviewItem[],
    };
    let attendanceToday = {
      checked_in: false,
      check_in_at: null as string | null,
      status: null as string | null,
    };

    if (include.has('tasks')) {
      tasks = await this.buildTasks(
        scopedQuery,
        authorization,
        tenantId,
        isManager,
      );
    }

    if (include.has('manager_pending') && isManager) {
      managerPending = await this.buildManagerPending(
        scopedQuery,
        authorization,
        tenantId,
      );
    }

    if (include.has('celebrations')) {
      celebrations = await this.buildCelebrations(
        scopedQuery,
        authorization,
        tenantId,
      );
    }

    if (include.has('whos_out')) {
      whosOut = await this.buildWhosOut(scopedQuery, authorization, tenantId);
    }

    attendanceToday = await this.buildAttendanceToday(
      scopedQuery,
      authorization,
      tenantId,
    );

    return {
      viewer: {
        employee_id: viewer.id,
        display_name: viewer.full_name,
        is_manager: isManager,
        is_birthday_today: this.isBirthdayToday(viewer.custom_fields),
      },
      tasks,
      manager_pending: managerPending,
      celebrations,
      whos_out: whosOut,
      attendance_today: attendanceToday,
      generated_at: new Date().toISOString(),
    };
  }

  private async loadViewer(
    employeeId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<ViewerRow> {
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const filters: string[] = ['e.id = $1::uuid'];
    const values: unknown[] = [employeeId];
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'e.id');
    const res = await this.db.query<ViewerRow>(
      `
        SELECT e.id, e.full_name, e.company_id, e.custom_fields
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-HOME-404',
      mismatchCode: 'HRM-ERR-SCOPE-INVALID',
    });
    if (!row) {
      throw new ApiException(
        'HRM-HOME-404',
        'Viewer employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  private isBirthdayToday(
    customFields: Record<string, string> | null,
  ): boolean {
    const dob = customFields?.date_of_birth;
    const dobMonthDay = monthDayFromIsoDate(dob);
    if (!dobMonthDay) return false;
    return dobMonthDay === todayMonthDayInHoChiMinh();
  }

  private async buildCelebrations(
    query: GetHomeSummaryQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total_count: number; items: HomeCelebrationItem[] }> {
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const todayMonthDay = todayMonthDayInHoChiMinh();
    if (!todayMonthDay) {
      return { total_count: 0, items: [] };
    }

    const filters: string[] = [
      "e.status = 'active'",
      'e.archived_at IS NULL',
      `e.custom_fields->>'date_of_birth' ~ '^\\d{4}-\\d{2}-\\d{2}'`,
    ];
    const values: unknown[] = [];
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'e.id');
    values.push(todayMonthDay);
    filters.push(
      `substring(e.custom_fields->>'date_of_birth' from 6 for 5) = $${values.length}`,
    );

    type CelebrationRow = {
      id: string;
      full_name: string;
      avatar_url: string | null;
      custom_fields: Record<string, string> | null;
    };

    const res = await this.db.query<CelebrationRow>(
      `
        SELECT e.id, e.full_name, e.avatar_url, e.custom_fields
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        ORDER BY e.full_name ASC
        LIMIT ${CELEBRATION_LIMIT};
      `,
      values,
    );

    const items: HomeCelebrationItem[] = [];
    for (const row of res.rows) {
      const monthDay = monthDayFromIsoDate(row.custom_fields?.date_of_birth);
      if (!monthDay || monthDay !== todayMonthDay) continue;
      const displayName = row.full_name?.trim();
      if (!displayName) continue;
      items.push({
        employee_id: row.id,
        display_name: displayName,
        month_day: monthDay,
        display_date: formatDisplayDateFromMonthDay(monthDay),
        avatar_url: row.avatar_url ?? null,
        avatar_initials: resolveEmployeeInitials(displayName),
      });
    }

    return { total_count: items.length, items };
  }

  private async buildWhosOut(
    query: GetHomeSummaryQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<{ total_count: number; items: HomeWhosOutItem[] }> {
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const today = todayIsoInHoChiMinh();
    const filters: string[] = ["lr.status = 'approved'"];
    const values: unknown[] = [];
    values.push(today);
    filters.push(
      `$${values.length}::date BETWEEN lr.start_date AND lr.end_date`,
    );

    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'lr.employee_id');

    type WhosOutRow = {
      id: string;
      employee_id: string;
      employee_name: string | null;
      leave_type: string;
      full_name: string | null;
      avatar_url: string | null;
    };

    const res = await this.db.query<WhosOutRow>(
      `
        SELECT
          lr.id,
          lr.employee_id,
          lr.employee_name,
          lr.leave_type,
          e.full_name,
          e.avatar_url
        FROM public.leave_requests lr
        LEFT JOIN public.employees e ON e.id = lr.employee_id
        WHERE ${filters.join(' AND ')}
        ORDER BY COALESCE(e.full_name, lr.employee_name) ASC
        LIMIT ${WHOS_OUT_LIMIT};
      `,
      values,
    );

    const items: HomeWhosOutItem[] = res.rows.map((row) => ({
      employee_id: row.employee_id,
      display_name: (row.full_name ?? row.employee_name ?? 'Nhân viên').trim(),
      leave_type: row.leave_type,
      leave_request_id: row.id,
      avatar_url: row.avatar_url ?? null,
    }));

    return { total_count: items.length, items };
  }

  private async queryScopedInbox(
    query: GetHomeSummaryQueryDto,
    authorization: string | undefined,
    tenantId: string | undefined,
    limit: number,
  ) {
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const filters: string[] = [];
    const values: unknown[] = [];
    const companyIds = expandHrmTextCompanyIds(
      scope,
      authorization,
      query.company_id,
    );
    const companyFilters: string[] = [];
    pushCompanyIdUuidFilter(companyFilters, values, companyIds);
    values.push(query.employee_id);
    const viewerParam = values.length;
    filters.push(`(
      (recipient_employee_id IS NULL AND ${companyFilters.join(' AND ')})
      OR recipient_employee_id = $${viewerParam}::uuid
    )`);
    const lim = Math.min(Math.max(limit, 1), 100);

    type InboxRow = {
      id: string;
      event_type: string;
      payload: unknown;
      read_at: string | null;
      created_at: string;
    };

    const res = await this.db.query<InboxRow>(
      `
        SELECT id, event_type, payload, read_at, created_at
        FROM public.hrm_inbox_notifications
        WHERE ${filters.join(' AND ')}
        ORDER BY created_at DESC
        LIMIT ${lim};
      `,
      values,
    );
    return res.rows;
  }

  private async queryScopedLeaveRequests(
    query: GetHomeSummaryQueryDto,
    authorization: string | undefined,
    tenantId: string | undefined,
    options: {
      status?: string;
      employeeId?: string;
      managerEmployeeId?: string;
    },
  ) {
    const scope = resolveHrmListScope(authorization, query.company_id, {
      tenantId,
    });
    const filters: string[] = [];
    const values: unknown[] = [];
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'lr.employee_id');

    if (options.status?.trim()) {
      values.push(options.status.trim());
      filters.push(`lr.status = $${values.length}`);
    }
    if (options.employeeId) {
      values.push(options.employeeId);
      filters.push(`lr.employee_id = $${values.length}::uuid`);
    }
    if (options.managerEmployeeId) {
      values.push(options.managerEmployeeId);
      filters.push(`lr.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${values.length}::uuid AND e.archived_at IS NULL
      )`);
    }

    type LeaveRow = {
      id: string;
      start_date: string;
      end_date: string;
      requested_at: string;
      employee_name: string | null;
      employee_code: string | null;
      leave_type: string;
    };

    const res = await this.db.query<LeaveRow>(
      `
        SELECT lr.id, lr.start_date, lr.end_date, lr.requested_at,
               lr.employee_name, lr.employee_code, lr.leave_type
        FROM public.leave_requests lr
        WHERE ${filters.join(' AND ')}
        ORDER BY lr.requested_at DESC
        LIMIT 200;
      `,
      values,
    );
    return res.rows;
  }

  private async buildTasks(
    query: GetHomeSummaryQueryDto,
    authorization: string | undefined,
    tenantId: string | undefined,
    isManager: boolean,
  ) {
    const [inboxRows, ownLeaveRows, ownUpdateRes] = await Promise.all([
      this.queryScopedInbox(query, authorization, tenantId, PREVIEW_LIMIT),
      this.queryScopedLeaveRequests(query, authorization, tenantId, {
        employeeId: query.employee_id,
        status: 'pending',
      }),
      this.attendance.listUpdateRequests(
        {
          company_id: query.company_id,
          employee_id: query.employee_id,
          status: 'pending',
        },
        authorization,
        tenantId,
      ),
    ]);

    const unreadInboxCount = inboxRows.filter(
      (row) => row.read_at == null,
    ).length;
    const ownPendingCount = ownLeaveRows.length + ownUpdateRes.total;
    const items: HomeSummaryTaskItem[] = [];

    for (const row of inboxRows) {
      items.push({
        id: row.id,
        kind: 'inbox',
        title: inboxTitle(row.event_type, row.payload, isManager),
        subtitle: null,
        priority: 3,
        entity_type: 'inbox_notification',
        entity_id: row.id,
        created_at: normalizeTimestamp(row.created_at),
        deep_link: inboxDeepLink(row.event_type, isManager),
      });
    }

    for (const row of ownLeaveRows) {
      items.push({
        id: row.id,
        kind: 'own_pending_leave',
        title: 'Đơn nghỉ đang chờ duyệt',
        subtitle: formatLeaveDateRange(row.start_date, row.end_date),
        priority: 2,
        entity_type: 'leave_request',
        entity_id: row.id,
        created_at: normalizeTimestamp(row.requested_at),
        deep_link: 'LeaveRequestDetail',
      });
    }

    for (const row of ownUpdateRes.data) {
      items.push({
        id: row.id,
        kind: 'own_pending_update',
        title: 'Chỉnh sửa chấm công đang chờ',
        subtitle: row.attendance_date ?? null,
        priority: 2,
        entity_type: 'attendance_update_request',
        entity_id: row.id,
        created_at: normalizeTimestamp(row.created_at),
        deep_link: 'UpdateRequests',
      });
    }

    items.sort(
      (a, b) =>
        a.priority - b.priority ||
        compareTimestampsDesc(a.created_at, b.created_at),
    );

    return {
      total_count: unreadInboxCount + ownPendingCount,
      unread_inbox_count: unreadInboxCount,
      own_pending_count: ownPendingCount,
      items: items.slice(0, PREVIEW_LIMIT),
    };
  }

  private async buildManagerPending(
    query: GetHomeSummaryQueryDto,
    authorization: string | undefined,
    tenantId: string | undefined,
  ) {
    const managerFilter = {
      manager_employee_id: query.employee_id,
      status: 'pending' as const,
    };
    const [leaveRows, updateRes] = await Promise.all([
      this.queryScopedLeaveRequests(query, authorization, tenantId, {
        managerEmployeeId: query.employee_id,
        status: 'pending',
      }),
      this.attendance.listUpdateRequests(
        { company_id: query.company_id, ...managerFilter },
        authorization,
        tenantId,
      ),
    ]);

    const preview: HomeSummaryManagerPreviewItem[] = [];

    for (const row of leaveRows) {
      preview.push({
        id: row.id,
        kind: 'leave_request',
        employee_name: row.employee_name ?? row.employee_code ?? 'Nhân viên',
        title: `Duyệt đơn nghỉ — ${row.employee_name ?? row.employee_code ?? 'Nhân viên'}`,
        subtitle: `${formatLeaveDateRange(row.start_date, row.end_date)} · ${row.leave_type}`,
        entity_id: row.id,
        created_at: normalizeTimestamp(row.requested_at),
      });
    }

    for (const row of updateRes.data) {
      preview.push({
        id: row.id,
        kind: 'attendance_update_request',
        employee_name: row.employee_name ?? row.employee_code ?? 'Nhân viên',
        title: `Chỉnh sửa chấm công — ${row.employee_name ?? row.employee_code ?? 'Nhân viên'}`,
        subtitle: row.attendance_date ?? null,
        entity_id: row.id,
        created_at: normalizeTimestamp(row.created_at),
      });
    }

    preview.sort((a, b) => compareTimestampsDesc(a.created_at, b.created_at));

    const leaveCount = leaveRows.length;
    const updateCount = updateRes.total;

    return {
      total_count: leaveCount + updateCount,
      leave_count: leaveCount,
      update_count: updateCount,
      preview: preview.slice(0, PREVIEW_LIMIT),
    };
  }

  private async buildAttendanceToday(
    query: GetHomeSummaryQueryDto,
    authorization: string | undefined,
    tenantId: string | undefined,
  ) {
    const today = todayIsoInHoChiMinh();
    const records = await this.attendance.listRecords(
      {
        company_id: query.company_id,
        employee_id: query.employee_id,
        from_date: today,
        to_date: today,
        page: 1,
        page_size: 1,
      },
      authorization,
      { tenantId },
    );
    const row = records.data[0];
    if (!row) {
      return { checked_in: false, check_in_at: null, status: null };
    }
    return {
      checked_in: Boolean(row.check_in_at),
      check_in_at: row.check_in_at ?? null,
      status: row.status ?? null,
    };
  }
}
