import { readListRows } from './envelope';
import { resolveHomeSummaryQueryCompanyId } from './companyWireScope';
import { resolveHrmCompanyHeaderId, hrmRequest } from './hrmApiClient';
import type { HrmAuthConfig } from './types';

export type HomeSummaryQueryParams = {
  summaryCompanyId: string;
  employeeId: string;
  include: string;
};

/** Builds GET /home/summary query scope — never wire UUID when membership rollup slug exists. */
export function composeHomeSummaryParams(
  auth: HrmAuthConfig,
  employeeId: string,
  include = 'celebrations,whos_out',
): HomeSummaryQueryParams | null {
  const eid = employeeId.trim() || auth.employeeId?.trim() || '';
  if (!eid) return null;

  const summaryCompanyId = resolveHomeSummaryQueryCompanyId({
    companyUuid: auth.companyUuid,
    companyId: auth.companyId,
    accessToken: auth.accessToken,
    memberships: auth.memberships,
    employeeId: eid,
    tenantId: auth.tenantId,
  });

  if (!summaryCompanyId.trim()) return null;

  return {
    summaryCompanyId,
    employeeId: eid,
    include,
  };
}
import {
  composeCelebrationsFromEmployees,
  filterApprovedLeaveCoveringToday,
  mapWhosOutFromLeaveRows,
  parseCelebrationItems,
  parseWhosOutItems,
  todayIsoInHoChiMinh,
  todayMonthDayInHoChiMinh,
  type ApprovedLeaveWhosOutRow,
  type EmployeeCelebrationSource,
  type HomeCelebrationItem,
  type HomeWhosOutItem,
} from '../utils/dashboardHubCelebrate';
import {
  composeTenureFromEmployees,
  type HomeTenureItem,
} from '../utils/journeyTimeline';

export type HomeSummaryViewer = {
  employee_id: string;
  display_name: string;
  is_manager: boolean;
  is_birthday_today: boolean;
};

export type HomeSummaryCelebrateResult = {
  viewer: HomeSummaryViewer | null;
  celebrations: HomeCelebrationItem[];
  tenureCelebrations: HomeTenureItem[];
  whosOut: HomeWhosOutItem[];
  celebrationsError: string;
  whosOutError: string;
  source: 'aggregate' | 'compose_fallback' | 'mixed';
};

type HomeSummaryEnvelope = {
  viewer?: HomeSummaryViewer;
  celebrations?: unknown;
  whos_out?: unknown;
};

function parseViewer(raw: unknown): HomeSummaryViewer | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = raw as Record<string, unknown>;
  const employeeId = typeof v.employee_id === 'string' ? v.employee_id.trim() : '';
  if (!employeeId) return null;
  return {
    employee_id: employeeId,
    display_name: typeof v.display_name === 'string' ? v.display_name.trim() : '',
    is_manager: v.is_manager === true,
    is_birthday_today: v.is_birthday_today === true,
  };
}

async function fetchEmployeesForCulture(
  auth: HrmAuthConfig,
  companyId: string,
  maxPages = 3,
): Promise<EmployeeCelebrationSource[]> {
  const headerCompanyId = resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId) || companyId;
  const collected: EmployeeCelebrationSource[] = [];
  let page = 1;
  const pageSize = 100;

  for (let i = 0; i < maxPages; i += 1) {
    const q = new URLSearchParams({
      company_id: headerCompanyId,
      page: String(page),
      page_size: String(pageSize),
    });
    const res = await hrmRequest<unknown>(auth, `/employees?${q.toString()}`, { method: 'GET' });
    if (!res.ok) break;
    const rows = readListRows<EmployeeCelebrationSource>(res.data);
    collected.push(...rows);
    if (rows.length < pageSize) break;
    page += 1;
  }
  return collected;
}

async function composeWhosOutFallback(
  auth: HrmAuthConfig,
  companyId: string,
  todayIso: string,
): Promise<HomeWhosOutItem[]> {
  const q = new URLSearchParams({
    company_id: companyId,
    status: 'approved',
    page: '1',
    page_size: '200',
  });
  const res = await hrmRequest<unknown>(auth, `/attendance/leave-requests?${q.toString()}`, {
    method: 'GET',
  });
  if (!res.ok) return [];
  const rows = readListRows<ApprovedLeaveWhosOutRow>(res.data);
  const covering = filterApprovedLeaveCoveringToday(rows, todayIso);
  return mapWhosOutFromLeaveRows(covering);
}

async function composeCelebrationsFallback(
  auth: HrmAuthConfig,
  companyId: string,
  todayMonthDay: string,
): Promise<HomeCelebrationItem[]> {
  const employees = await fetchEmployeesForCulture(auth, companyId);
  return composeCelebrationsFromEmployees(employees, todayMonthDay);
}

async function composeTenureFallback(
  auth: HrmAuthConfig,
  companyId: string,
  todayMonthDay: string,
): Promise<HomeTenureItem[]> {
  const employees = await fetchEmployeesForCulture(auth, companyId);
  return composeTenureFromEmployees(employees, todayMonthDay);
}

/**
 * Loads celebrations + whos_out via GET /home/summary; composes from existing APIs when BE stubs empty.
 */
export async function loadHomeCelebrateSections(
  auth: HrmAuthConfig,
  employeeId: string,
): Promise<HomeSummaryCelebrateResult> {
  const todayIso = todayIsoInHoChiMinh();
  const todayMonthDay = todayMonthDayInHoChiMinh();
  const empty: HomeSummaryCelebrateResult = {
    viewer: null,
    celebrations: [],
    tenureCelebrations: [],
    whosOut: [],
    celebrationsError: '',
    whosOutError: '',
    source: 'compose_fallback',
  };

  const params = composeHomeSummaryParams(auth, employeeId);
  if (!params) return empty;

  const { summaryCompanyId, employeeId: eid, include } = params;
  const q = new URLSearchParams({
    company_id: summaryCompanyId,
    employee_id: eid,
    include,
  });

  const res = await hrmRequest<{ data?: HomeSummaryEnvelope } | HomeSummaryEnvelope>(
    auth,
    `/home/summary?${q.toString()}`,
    { method: 'GET' },
  );

  let viewer: HomeSummaryViewer | null = null;
  let celebrations: HomeCelebrationItem[] = [];
  let tenureCelebrations: HomeTenureItem[] = [];
  let whosOut: HomeWhosOutItem[] = [];
  let celebrationsError = '';
  let whosOutError = '';
  let usedAggregate = false;
  let usedCompose = false;

  if (res.ok) {
    usedAggregate = true;
    const payload =
      res.data && typeof res.data === 'object' && 'data' in res.data
        ? (res.data as { data: HomeSummaryEnvelope }).data
        : (res.data as HomeSummaryEnvelope);
    viewer = parseViewer(payload?.viewer);
    celebrations = parseCelebrationItems(payload?.celebrations);
    whosOut = parseWhosOutItems(payload?.whos_out);
  } else {
    celebrationsError = res.message || 'Không tải được sinh nhật';
    whosOutError = res.message || 'Không tải được danh sách nghỉ';
  }

  if (celebrations.length === 0) {
    try {
      const fallback = await composeCelebrationsFallback(auth, summaryCompanyId, todayMonthDay);
      if (fallback.length > 0) {
        celebrations = fallback;
        usedCompose = true;
        celebrationsError = '';
      }
    } catch {
      celebrationsError = celebrationsError || 'Không tải được sinh nhật';
    }
  }

  try {
    const tenureFallback = await composeTenureFallback(auth, summaryCompanyId, todayMonthDay);
    if (tenureFallback.length > 0) {
      tenureCelebrations = tenureFallback;
      usedCompose = true;
    }
  } catch {
    /* tenure strip is optional — no error banner */
  }

  if (whosOut.length === 0) {
    try {
      const fallback = await composeWhosOutFallback(auth, summaryCompanyId, todayIso);
      if (fallback.length > 0) {
        whosOut = fallback;
        usedCompose = true;
        whosOutError = '';
      }
    } catch {
      whosOutError = whosOutError || 'Không tải được danh sách nghỉ';
    }
  }

  const source =
    usedAggregate && usedCompose ? 'mixed' : usedAggregate ? 'aggregate' : 'compose_fallback';

  return {
    viewer,
    celebrations,
    tenureCelebrations,
    whosOut,
    celebrationsError,
    whosOutError,
    source,
  };
}
