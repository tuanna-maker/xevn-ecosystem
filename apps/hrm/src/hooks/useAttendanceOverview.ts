import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, eachMonthOfInterval } from 'date-fns';

export interface OverviewStats {
  lateEarlyToday: number;
  lateEarlyChange: number;
  actualLeaveThisWeek: number;
  actualLeaveChange: number;
  plannedLeaveNextWeek: number;
  plannedLeaveChange: number;
}

export interface MonthlyLeaveData {
  month: string;
  value: number;
}

export interface DepartmentLeaveData {
  name: string;
  value: number;
}

export interface LeaveTypeData {
  name: string;
  value: number;
  color: string;
}

export interface LateEarlyPerson {
  name: string;
  dept: string;
  count: number;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  'Nghỉ phép': '#3b82f6',
  'Nghỉ thai sản': '#10b981',
  'Nghỉ không lương': '#f59e0b',
  'Nghỉ ốm': '#ef4444',
  'Nghỉ kết hôn': '#8b5cf6',
  'Nghỉ con kết hôn': '#ec4899',
  'Nghỉ tang': '#6b7280',
  'Khác': '#a3a3a3',
};

export function useAttendanceOverview(year?: number) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats>({
    lateEarlyToday: 0,
    lateEarlyChange: 0,
    actualLeaveThisWeek: 0,
    actualLeaveChange: 0,
    plannedLeaveNextWeek: 0,
    plannedLeaveChange: 0,
  });
  const [monthlyLeaveData, setMonthlyLeaveData] = useState<MonthlyLeaveData[]>([]);
  const [departmentLeaveData, setDepartmentLeaveData] = useState<DepartmentLeaveData[]>([]);
  const [leaveTypeData, setLeaveTypeData] = useState<LeaveTypeData[]>([]);
  const [lateEarlyList, setLateEarlyList] = useState<LateEarlyPerson[]>([]);
  const { currentCompanyId } = useAuth();

  const selectedYear = year || new Date().getFullYear();

  const fetchOverview = useCallback(async () => {
    if (!currentCompanyId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const yearStart = format(startOfYear(new Date(selectedYear, 0, 1)), 'yyyy-MM-dd');
      const yearEnd = format(endOfYear(new Date(selectedYear, 0, 1)), 'yyyy-MM-dd');

      // Fetch late/early today from attendance_records
      const { data: todayAttendance } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('company_id', currentCompanyId)
        .eq('attendance_date', todayStr);

      const lateEarlyToday = (todayAttendance || []).filter(
        r => (r.late_minutes && r.late_minutes > 0) || (r.early_leave_minutes && r.early_leave_minutes > 0)
      ).length;

      // Fetch leave requests for the year
      const { data: leaveRequests } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('company_id', currentCompanyId)
        .eq('status', 'approved')
        .gte('start_date', yearStart)
        .lte('end_date', yearEnd);

      const leaves = leaveRequests || [];

      // Monthly leave data
      const months = eachMonthOfInterval({
        start: new Date(selectedYear, 0, 1),
        end: new Date(selectedYear, 11, 31),
      });

      const monthLabels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

      const monthlyData: MonthlyLeaveData[] = months.map((month, idx) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthLeaves = leaves.filter(l => {
          const startDate = new Date(l.start_date);
          return startDate >= monthStart && startDate <= monthEnd;
        });
        const totalDays = monthLeaves.reduce((sum, l) => sum + (l.total_days || 0), 0);
        return {
          month: monthLabels[idx],
          value: totalDays,
        };
      });

      setMonthlyLeaveData(monthlyData);

      // Department leave data
      const deptMap = new Map<string, number>();
      leaves.forEach(l => {
        const dept = l.department || 'Không xác định';
        const current = deptMap.get(dept) || 0;
        deptMap.set(dept, current + (l.total_days || 0));
      });

      const sortedDepts = Array.from(deptMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({
          name: name.length > 12 ? name.substring(0, 12) + '...' : name,
          value,
        }));

      setDepartmentLeaveData(sortedDepts);

      // Leave type data
      const typeMap = new Map<string, number>();
      leaves.forEach(l => {
        const type = l.leave_type || 'Khác';
        const current = typeMap.get(type) || 0;
        typeMap.set(type, current + 1);
      });

      const typeData = Array.from(typeMap.entries()).map(([name, value]) => ({
        name,
        value,
        color: LEAVE_TYPE_COLORS[name] || LEAVE_TYPE_COLORS['Khác'],
      }));

      setLeaveTypeData(typeData);

      // Late/early list - aggregate from attendance records for the year
      const { data: yearAttendance } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('company_id', currentCompanyId)
        .gte('attendance_date', yearStart)
        .lte('attendance_date', yearEnd);

      const lateEarlyMap = new Map<string, { name: string; dept: string; count: number }>();
      (yearAttendance || []).forEach(r => {
        if ((r.late_minutes && r.late_minutes > 0) || (r.early_leave_minutes && r.early_leave_minutes > 0)) {
          const key = r.employee_id;
          const existing = lateEarlyMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            lateEarlyMap.set(key, {
              name: r.employee_name,
              dept: r.department || 'Không xác định',
              count: 1,
            });
          }
        }
      });

      const sortedLateEarly = Array.from(lateEarlyMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setLateEarlyList(sortedLateEarly);

      // Calculate stats
      const thisWeekLeaves = leaves.filter(l => {
        const startDate = new Date(l.start_date);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return startDate >= weekStart && startDate <= weekEnd;
      });

      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + (7 - today.getDay()));
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

      const { data: nextWeekLeaves } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('company_id', currentCompanyId)
        .eq('status', 'approved')
        .gte('start_date', format(nextWeekStart, 'yyyy-MM-dd'))
        .lte('start_date', format(nextWeekEnd, 'yyyy-MM-dd'));

      setStats({
        lateEarlyToday,
        lateEarlyChange: 0,
        actualLeaveThisWeek: thisWeekLeaves.reduce((sum, l) => sum + (l.total_days || 0), 0),
        actualLeaveChange: 0,
        plannedLeaveNextWeek: (nextWeekLeaves || []).reduce((sum: number, l: any) => sum + (l.total_days || 0), 0),
        plannedLeaveChange: 0,
      });

    } catch (error) {
      console.error('Error fetching attendance overview:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, selectedYear]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    isLoading,
    stats,
    monthlyLeaveData,
    departmentLeaveData,
    leaveTypeData,
    lateEarlyList,
    refetch: fetchOverview,
  };
}
