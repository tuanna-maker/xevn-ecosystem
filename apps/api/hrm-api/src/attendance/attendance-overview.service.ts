import { Injectable } from '@nestjs/common';
import { AttendanceRequestsService } from './attendance-requests.service';
import { LeaveRequestsService } from './leave-requests.service';
import type { AttendanceOverviewQueryDto } from './dto/attendance-overview.query.dto';

export type AttendanceOverviewPayload = {
  stats: {
    lateEarlyToday: number;
    lateEarlyChange: number;
    actualLeaveThisWeek: number;
    actualLeaveChange: number;
    plannedLeaveNextWeek: number;
    plannedLeaveChange: number;
  };
  monthlyLeaveData: Array<{ month: string; value: number }>;
  departmentLeaveData: Array<{ name: string; value: number }>;
  leaveTypeData: Array<{ name: string; value: number; color: string }>;
  lateEarlyList: Array<{ name: string; dept: string; count: number }>;
};

const MONTH_LABELS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

const LEAVE_TYPE_COLORS: Record<string, string> = {
  annual: '#3b82f6',
  'Nghỉ phép': '#3b82f6',
  other: '#a3a3a3',
  Khác: '#a3a3a3',
};

function leaveDays(totalDays: string | number | null | undefined): number {
  const parsed = Number.parseFloat(String(totalDays ?? '0'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthIndex(isoDate: string): number {
  const m = new Date(isoDate).getMonth();
  return Number.isFinite(m) ? m : 0;
}

/** Single round-trip aggregation for attendance dashboard (avoids FE request storms / 429). */
@Injectable()
export class AttendanceOverviewService {
  constructor(
    private readonly leaveRequests: LeaveRequestsService,
    private readonly attendanceRequests: AttendanceRequestsService,
  ) {}

  async getOverview(
    query: AttendanceOverviewQueryDto,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttendanceOverviewPayload> {
    const selectedYear = query.year ?? new Date().getFullYear();
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const [leaveRes, lateRes] = await Promise.all([
      this.leaveRequests.listLeaveRequests(
        { company_id: query.company_id },
        authorization,
        tenantId,
      ),
      this.attendanceRequests.listLateEarlyRequests(
        { company_id: query.company_id },
        authorization,
        tenantId,
      ),
    ]);

    const leaves = (leaveRes.data ?? []).filter((l) => {
      const y = new Date(l.start_date).getFullYear();
      return y === selectedYear;
    });

    const lateEarlyAll = lateRes.data ?? [];
    const lateEarlyToday = lateEarlyAll.filter(
      (r) => r.request_date === todayStr,
    ).length;

    const monthlyLeaveData = MONTH_LABELS.map((month, idx) => {
      const monthLeaves = leaves.filter(
        (l) => monthIndex(l.start_date) === idx,
      );
      const value = monthLeaves.reduce(
        (sum, l) => sum + leaveDays(l.total_days),
        0,
      );
      return { month, value };
    });

    const deptMap = new Map<string, number>();
    for (const l of leaves) {
      const dept = l.department || 'Không xác định';
      deptMap.set(dept, (deptMap.get(dept) ?? 0) + leaveDays(l.total_days));
    }
    const departmentLeaveData = Array.from(deptMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 12 ? `${name.slice(0, 12)}...` : name,
        value,
      }));

    const typeMap = new Map<string, number>();
    for (const l of leaves) {
      const type = l.leave_type || 'Khác';
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }
    const leaveTypeData = Array.from(typeMap.entries()).map(
      ([name, value]) => ({
        name,
        value,
        color: LEAVE_TYPE_COLORS[name] ?? LEAVE_TYPE_COLORS.Khác,
      }),
    );

    const lateEarlyMap = new Map<
      string,
      { name: string; dept: string; count: number }
    >();
    for (const r of lateEarlyAll) {
      const existing = lateEarlyMap.get((r.employee_id as string));
      if (existing) {
        existing.count += 1;
      } else {
        lateEarlyMap.set((r.employee_id as string), {
          name: String(r.employee_name || ""),
          dept: String(r.department || 'Không xác định'),
          count: 1,
        });
      }
    }
    const lateEarlyList = Array.from(lateEarlyMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const thisWeekLeaves = leaves.filter((l) => {
      const d = new Date(l.start_date);
      return d >= weekStart && d <= weekEnd;
    });

    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    const nextWeekLeaves = leaves.filter((l) => {
      const d = new Date(l.start_date);
      return d >= nextWeekStart && d <= nextWeekEnd;
    });

    return {
      stats: {
        lateEarlyToday,
        lateEarlyChange: 0,
        actualLeaveThisWeek: thisWeekLeaves.reduce(
          (sum, l) => sum + leaveDays(l.total_days),
          0,
        ),
        actualLeaveChange: 0,
        plannedLeaveNextWeek: nextWeekLeaves.reduce(
          (sum, l) => sum + leaveDays(l.total_days),
          0,
        ),
        plannedLeaveChange: 0,
      },
      monthlyLeaveData,
      departmentLeaveData,
      leaveTypeData,
      lateEarlyList,
    };
  }
}
