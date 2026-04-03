import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';

export interface AttendanceSummary {
  totalEmployees: number;
  totalWorkDays: number;
  presentCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  absentCount: number;
  leaveCount: number;
  overtimeHours: number;
  attendanceRate: number;
  lateRate: number;
}

export interface DepartmentAttendance {
  department: string;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  attendanceRate: number;
}

export interface EmployeeAttendanceSummary {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string | null;
  workDays: number;
  presentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  leaveDays: number;
  absentDays: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface DailyAttendance {
  date: string;
  dayLabel: string;
  presentCount: number;
  lateCount: number;
  leaveCount: number;
  absentCount: number;
  totalEmployees: number;
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  attendanceRate: number;
  lateRate: number;
  leaveRate: number;
}

export interface LeaveTypeSummary {
  leaveType: string;
  count: number;
  totalDays: number;
}

export function useAttendanceReports(year: number, month: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentAttendance[]>([]);
  const [employeeStats, setEmployeeStats] = useState<EmployeeAttendanceSummary[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyAttendance[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [leaveTypeStats, setLeaveTypeStats] = useState<LeaveTypeSummary[]>([]);
  const { currentCompanyId } = useAuth();

  const fetchReports = useCallback(async () => {
    if (!currentCompanyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

      // Fetch attendance records for the month
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('company_id', currentCompanyId)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      if (attendanceError) throw attendanceError;

      // Fetch employees count
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, employee_code, full_name, department')
        .eq('company_id', currentCompanyId)
        .eq('status', 'active')
        .is('deleted_at', null);

      if (employeesError) throw employeesError;

      // Fetch leave requests for the month
      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('company_id', currentCompanyId)
        .eq('status', 'approved')
        .gte('start_date', startDate)
        .lte('end_date', endDate);

      if (leaveError) throw leaveError;

      const records = attendanceData || [];
      const employees = employeesData || [];
      const leaves = leaveData || [];

      // Calculate summary
      const totalEmployees = employees.length;
      const daysInMonth = eachDayOfInterval({
        start: new Date(year, month - 1, 1),
        end: endOfMonth(new Date(year, month - 1))
      }).filter(d => d.getDay() !== 0 && d.getDay() !== 6).length; // Exclude weekends

      const totalWorkDays = totalEmployees * daysInMonth;
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'early_leave').length;
      const lateCount = records.filter(r => r.status === 'late' || (r.late_minutes && r.late_minutes > 0)).length;
      const earlyLeaveCount = records.filter(r => r.status === 'early_leave' || (r.early_leave_minutes && r.early_leave_minutes > 0)).length;
      const leaveCount = leaves.reduce((sum, l) => sum + (l.total_days || 0), 0);
      const absentCount = Math.max(0, totalWorkDays - presentCount - leaveCount);
      const overtimeHours = records.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

      setSummary({
        totalEmployees,
        totalWorkDays,
        presentCount,
        lateCount,
        earlyLeaveCount,
        absentCount,
        leaveCount,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        attendanceRate: totalWorkDays > 0 ? Math.round((presentCount / totalWorkDays) * 10000) / 100 : 0,
        lateRate: presentCount > 0 ? Math.round((lateCount / presentCount) * 10000) / 100 : 0,
      });

      // Calculate department stats
      const deptMap = new Map<string, { present: number; late: number; leave: number; absent: number; total: number }>();
      
      records.forEach(r => {
        const dept = r.department || 'Không có phòng ban';
        if (!deptMap.has(dept)) {
          deptMap.set(dept, { present: 0, late: 0, leave: 0, absent: 0, total: 0 });
        }
        const stats = deptMap.get(dept)!;
        stats.total++;
        if (r.status === 'present' || r.status === 'late' || r.status === 'early_leave') {
          stats.present++;
        }
        if (r.status === 'late' || (r.late_minutes && r.late_minutes > 0)) {
          stats.late++;
        }
      });

      setDepartmentStats(
        Array.from(deptMap.entries()).map(([dept, stats]) => ({
          department: dept,
          presentCount: stats.present,
          lateCount: stats.late,
          leaveCount: stats.leave,
          absentCount: stats.absent,
          attendanceRate: stats.total > 0 ? Math.round((stats.present / stats.total) * 10000) / 100 : 0,
        }))
      );

      // Calculate employee stats
      const empMap = new Map<string, {
        code: string;
        name: string;
        department: string | null;
        workDays: number;
        present: number;
        late: number;
        earlyLeave: number;
        lateMinutes: number;
        earlyLeaveMinutes: number;
        overtime: number;
      }>();

      employees.forEach(emp => {
        empMap.set(emp.id, {
          code: emp.employee_code,
          name: emp.full_name,
          department: emp.department,
          workDays: daysInMonth,
          present: 0,
          late: 0,
          earlyLeave: 0,
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          overtime: 0,
        });
      });

      records.forEach(r => {
        const emp = empMap.get(r.employee_id);
        if (emp) {
          if (r.status === 'present' || r.status === 'late' || r.status === 'early_leave') {
            emp.present++;
          }
          if (r.status === 'late' || (r.late_minutes && r.late_minutes > 0)) {
            emp.late++;
            emp.lateMinutes += r.late_minutes || 0;
          }
          if (r.status === 'early_leave' || (r.early_leave_minutes && r.early_leave_minutes > 0)) {
            emp.earlyLeave++;
            emp.earlyLeaveMinutes += r.early_leave_minutes || 0;
          }
          emp.overtime += r.overtime_hours || 0;
        }
      });

      // Count leave days per employee
      const empLeaveMap = new Map<string, number>();
      leaves.forEach(l => {
        const current = empLeaveMap.get(l.employee_id) || 0;
        empLeaveMap.set(l.employee_id, current + (l.total_days || 0));
      });

      setEmployeeStats(
        Array.from(empMap.entries()).map(([id, stats]) => {
          const leaveDays = empLeaveMap.get(id) || 0;
          const absentDays = Math.max(0, stats.workDays - stats.present - leaveDays);
          return {
            employeeId: id,
            employeeCode: stats.code,
            employeeName: stats.name,
            department: stats.department,
            workDays: stats.workDays,
            presentDays: stats.present,
            lateDays: stats.late,
            earlyLeaveDays: stats.earlyLeave,
            leaveDays,
            absentDays,
            totalLateMinutes: stats.lateMinutes,
            totalEarlyLeaveMinutes: stats.earlyLeaveMinutes,
            totalOvertimeHours: Math.round(stats.overtime * 100) / 100,
            attendanceRate: stats.workDays > 0 ? Math.round((stats.present / stats.workDays) * 10000) / 100 : 0,
          };
        })
      );

      // Calculate daily stats
      const dailyMap = new Map<string, { present: number; late: number; leave: number; absent: number }>();
      const allDays = eachDayOfInterval({
        start: new Date(year, month - 1, 1),
        end: endOfMonth(new Date(year, month - 1))
      });

      allDays.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        dailyMap.set(dateStr, { present: 0, late: 0, leave: 0, absent: 0 });
      });

      records.forEach(r => {
        const stats = dailyMap.get(r.attendance_date);
        if (stats) {
          if (r.status === 'present' || r.status === 'late' || r.status === 'early_leave') {
            stats.present++;
          }
          if (r.status === 'late' || (r.late_minutes && r.late_minutes > 0)) {
            stats.late++;
          }
        }
      });

      const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      setDailyStats(
        Array.from(dailyMap.entries()).map(([date, stats]) => {
          const d = parseISO(date);
          return {
            date,
            dayLabel: `${dayLabels[d.getDay()]} ${format(d, 'dd')}`,
            presentCount: stats.present,
            lateCount: stats.late,
            leaveCount: stats.leave,
            absentCount: stats.absent,
            totalEmployees,
          };
        })
      );

      // Calculate leave type stats
      const leaveTypeMap = new Map<string, { count: number; days: number }>();
      leaves.forEach(l => {
        const type = l.leave_type || 'Khác';
        if (!leaveTypeMap.has(type)) {
          leaveTypeMap.set(type, { count: 0, days: 0 });
        }
        const stats = leaveTypeMap.get(type)!;
        stats.count++;
        stats.days += l.total_days || 0;
      });

      setLeaveTypeStats(
        Array.from(leaveTypeMap.entries()).map(([type, stats]) => ({
          leaveType: type,
          count: stats.count,
          totalDays: stats.days,
        }))
      );

      // Fetch monthly trend (last 12 months)
      const monthlyTrendData: MonthlyTrend[] = [];
      for (let i = 11; i >= 0; i--) {
        const trendDate = new Date(year, month - 1 - i, 1);
        const trendStart = format(startOfMonth(trendDate), 'yyyy-MM-dd');
        const trendEnd = format(endOfMonth(trendDate), 'yyyy-MM-dd');

        const { data: trendRecords } = await supabase
          .from('attendance_records')
          .select('status, late_minutes')
          .eq('company_id', currentCompanyId)
          .gte('attendance_date', trendStart)
          .lte('attendance_date', trendEnd);

        const trendData = trendRecords || [];
        const trendTotal = trendData.length;
        const trendPresent = trendData.filter(r => r.status === 'present' || r.status === 'late' || r.status === 'early_leave').length;
        const trendLate = trendData.filter(r => r.status === 'late' || (r.late_minutes && r.late_minutes > 0)).length;

        monthlyTrendData.push({
          month: format(trendDate, 'yyyy-MM'),
          monthLabel: `T${trendDate.getMonth() + 1}`,
          attendanceRate: trendTotal > 0 ? Math.round((trendPresent / trendTotal) * 10000) / 100 : 0,
          lateRate: trendPresent > 0 ? Math.round((trendLate / trendPresent) * 10000) / 100 : 0,
          leaveRate: 0,
        });
      }

      setMonthlyTrend(monthlyTrendData);

    } catch (error) {
      console.error('Error fetching attendance reports:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, year, month]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    isLoading,
    summary,
    departmentStats,
    employeeStats,
    dailyStats,
    monthlyTrend,
    leaveTypeStats,
    refetch: fetchReports,
  };
}
