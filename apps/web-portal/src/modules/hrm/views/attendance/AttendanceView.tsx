import React, { useEffect, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { isSupabaseConfigured } from '../../../../integrations/supabase/client';
import { useGlobalFilter } from '../../../../contexts/GlobalFilterContext';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_TABLE_CLASS, HRM_TABLE_SHELL, HRM_MOCK_ATTENDANCE } from '../../mock-data';
import { hrmDataProvider } from '../../data/hrmDataProvider';

type AttendanceRow = {
  id: string;
  attendance_date: string;
  employee_name: string;
  status: string;
  actual_hours: number | null;
  late_minutes: number | null;
};

export const AttendanceView: React.FC<{ openHrmApp: (path: string) => void }> = ({ openHrmApp }) => {
  const { selectedCompany } = useGlobalFilter();
  const [attendanceDb, setAttendanceDb] = useState<AttendanceRow[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const companyId = selectedCompany?.id && selectedCompany.id !== 'all' ? selectedCompany.id : null;

    let cancelled = false;
    (async () => {
      setAttendanceLoading(true);
      try {
        const rows = await hrmDataProvider.listAttendance({ companyId, limit: 200 });
        if (cancelled) return;
        setAttendanceDb(
          rows.map((row: any) => ({
            id: row.id,
            attendance_date: row.attendance_date,
            employee_name: row.employee_name ?? '—',
            status: row.status ?? 'unknown',
            actual_hours: row.actual_hours ?? null,
            late_minutes: row.late_minutes ?? null,
          }))
        );
      } finally {
        if (!cancelled) setAttendanceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany?.id]);

  return (
    <Card className="mt-4 p-0 overflow-hidden">
      {isSupabaseConfigured && (attendanceLoading || attendanceDb.length > 0) ? (
        <DataTable
          columns={[
            {
              key: 'attendance_date',
              header: 'Ngày',
              render: (row: { attendance_date: string }) => (
                <span className="text-slate-700">{new Date(row.attendance_date).toLocaleDateString('vi-VN')}</span>
              ),
            },
            { key: 'employee_name', header: 'Nhân sự', render: (row: { employee_name: string }) => <span className="font-medium">{row.employee_name}</span> },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (row: { status: string }) => (
                <span className={row.status === 'present' ? 'font-medium text-emerald-700' : 'text-slate-600'}>{row.status}</span>
              ),
            },
            { key: 'actual_hours', header: 'Giờ thực tế', render: (row: { actual_hours: number | null }) => <span className="tabular-nums">{row.actual_hours ?? '—'}</span> },
            { key: 'late_minutes', header: 'Đi muộn (phút)', render: (row: { late_minutes: number | null }) => <span className="tabular-nums">{row.late_minutes ?? '—'}</span> },
          ]}
          data={attendanceLoading ? [] : attendanceDb}
          emptyMessage={attendanceLoading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu chấm công'}
          className={SETTINGS_CONTROL_TEXT}
        />
      ) : (
        <div className={HRM_TABLE_SHELL}>
          <table className={HRM_TABLE_CLASS}>
            <thead className="bg-white/70 backdrop-blur-md">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kỳ công</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Pháp nhân / Đơn vị</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Ngày công chuẩn</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Nghỉ phép (giờ)</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Đi muộn (lượt)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái kỳ</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {HRM_MOCK_ATTENDANCE.map((row) => (
                <tr key={row.id} className="border-t border-xevn-border">
                  <td className="px-3 py-2 font-medium text-xevn-text">{row.period}</td>
                  <td className="px-3 py-2 text-slate-600">{row.entity}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.workdays}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.leave}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.late}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.locked === 'Đã khóa kỳ'
                          ? 'font-medium text-emerald-700'
                          : row.locked === 'Mở chỉnh sửa'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                      }
                    >
                      {row.locked}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-[15px] font-semibold text-xevn-primary hover:underline"
                      onClick={() => openHrmApp('/hr/attendance')}
                    >
                      Mở kỳ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

