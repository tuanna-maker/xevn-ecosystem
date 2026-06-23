import {
  aggregateAttendanceStats,
  buildDefaultEssStatCards,
  buildEssStatCards,
  resolveRoleSubtitle,
  type AttendanceRecordRow,
  type AttendanceStats,
  type EssStatCard,
} from '../utils/dashboardEss';
import { readListRows } from './envelope';
import { fetchEmployeeById } from './hrmEmployees';
import { resolveHrmCompanyHeaderId, hrmRequest } from './hrmApiClient';
import type { HrmAuthConfig } from './types';

export type EssDashboardSlice = {
  roleSubtitle: string;
  attendanceStats: AttendanceStats;
  attendanceError: string;
  statCards: EssStatCard[];
};

const EMPTY_STATS: AttendanceStats = { totalWork: 0, late: 0, absence: 0 };

/** Wraps sync throws so `.catch` always attaches to a Promise (RN unhandled-rejection safe). */
function safeAsync<T>(fn: () => Promise<T> | T, fallback: T): Promise<T> {
  return Promise.resolve()
    .then(fn)
    .catch(() => fallback);
}

export const EMPTY_ESS_DASHBOARD_SLICE: EssDashboardSlice = {
  roleSubtitle: 'Nhân viên',
  attendanceStats: EMPTY_STATS,
  attendanceError: '',
  statCards: [],
};

function buildAttendanceQuery(
  cid: string,
  date: string,
  isManager: boolean,
  eid: string,
): URLSearchParams {
  const q = new URLSearchParams({
    company_id: cid,
    from_date: date,
    to_date: date,
    page: '1',
    page_size: '200',
  });
  if (!isManager && eid) {
    q.set('employee_id', eid);
  }
  return q;
}

/** ESS dashboard slice — parallel fetches via allSettled; never throws (RN unhandled-rejection safe). */
export async function loadEssDashboardSlice(input: {
  auth: HrmAuthConfig;
  companyId: string;
  employeeId: string;
  isManager: boolean;
  selectedDate: string;
  managerPendingCount: number;
  offWorkCount: number;
  myLeavesCount: number;
}): Promise<EssDashboardSlice> {
  try {
    const { auth, companyId, employeeId, isManager, selectedDate } = input;
    const eid = employeeId.trim();
    const cid = companyId.trim();
    const date = selectedDate.slice(0, 10);

    const rolePromise = eid
      ? safeAsync(() => fetchEmployeeById(auth, eid), null)
      : Promise.resolve(null);

    const attendanceFail = {
      ok: false as const,
      code: 'HRM-MOB-ERR-NETWORK',
      message: 'Không tải được thống kê chấm công',
      requestId: 'local',
    };

    const attendancePromise =
      cid && date
        ? safeAsync(
            () =>
              hrmRequest<unknown>(
                auth,
                `/attendance/records?${buildAttendanceQuery(cid, date, isManager, eid).toString()}`,
                { method: 'GET' },
              ),
            attendanceFail,
          )
        : Promise.resolve(null);

    const batch1 = await Promise.allSettled([rolePromise, attendancePromise]);

    let roleSubtitle = 'Nhân viên';
    const empResult = batch1[0];
    if (empResult.status === 'fulfilled' && empResult.value) {
      roleSubtitle = resolveRoleSubtitle(empResult.value.job_title_key);
    }

    let attendanceStats = EMPTY_STATS;
    let attendanceError = '';

    const attResult = batch1[1];
    if (attResult.status === 'fulfilled' && attResult.value) {
      const attRes = attResult.value;
      if (attRes.ok) {
        const rows = readListRows<AttendanceRecordRow>(attRes.data);
        attendanceStats = aggregateAttendanceStats(rows, {
          isManager,
          employeeId: eid,
          dateIso: date,
        });
      } else {
        attendanceError = attRes.message || 'Không tải được thống kê chấm công';
      }
    } else if (cid && date) {
      attendanceError = 'Không tải được thống kê chấm công';
    }

    let activeTeamCount = attendanceStats.totalWork;
    if (isManager && cid) {
      const headerId = resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId) || cid;
      const eq = new URLSearchParams({
        company_id: headerId,
        page: '1',
        page_size: '1',
        status: 'active',
      });
      const empCountResult = await Promise.allSettled([
        safeAsync(
          () => hrmRequest<unknown>(auth, `/employees?${eq.toString()}`, { method: 'GET' }),
          {
            ok: false as const,
            code: 'HRM-MOB-ERR-NETWORK',
            message: 'Không tải được nhân sự',
            requestId: 'local',
          },
        ),
      ]);
      const empRes = empCountResult[0];
      if (empRes.status === 'fulfilled' && empRes.value?.ok) {
        const payload = empRes.value.data as { total?: number };
        const total =
          typeof payload?.total === 'number'
            ? payload.total
            : readListRows(empRes.value.data).length;
        if (total > 0 && activeTeamCount === 0) {
          activeTeamCount = Math.max(0, total - input.offWorkCount);
        } else if (activeTeamCount === 0 && total > 0) {
          activeTeamCount = attendanceStats.totalWork || Math.max(0, total - input.offWorkCount);
        }
      }
    }

    const statCards = buildEssStatCards({
      isManager,
      activeTeamCount,
      offWorkCount: input.offWorkCount,
      leaveRequestsCount: input.managerPendingCount,
      myLeavesCount: input.myLeavesCount,
    });

    return {
      roleSubtitle,
      attendanceStats,
      attendanceError,
      statCards,
    };
  } catch {
    return {
      ...EMPTY_ESS_DASHBOARD_SLICE,
      statCards: buildDefaultEssStatCards(input.isManager),
    };
  }
}
