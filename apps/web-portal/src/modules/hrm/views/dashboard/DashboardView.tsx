import React, { useMemo, useState } from 'react';
import { BarChart3, Calendar, Clock, FileText, Users, Wallet, ChevronDown, Check, ExternalLink, Download, FileSpreadsheet } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_PENDING_PAYROLL } from '../../mock-data';
import { hrmPortalPath } from '../../paths';
import { useNavigate } from 'react-router-dom';
import { mockEmployees } from '../../../../data/mock-data';

export const DashboardView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [exporting, setExporting] = useState(false);

  const timePeriods = useMemo(
    () =>
      [
        { key: 'week', label: 'Tuần này', short: '7 ngày' },
        { key: 'month', label: 'Tháng này', short: '30 ngày' },
        { key: 'quarter', label: 'Quý này', short: '3 tháng' },
        { key: 'year', label: 'Năm nay', short: '12 tháng' },
      ] as const,
    []
  );

  const currentPeriod = timePeriods.find((p) => p.key === period);

  const go = (view: 'employees' | 'recruitment' | 'attendance' | 'payroll' | 'reports') => {
    navigate(hrmPortalPath(view));
  };

  const handleExport = async (format: 'csv' | 'html' | 'pdf') => {
    if (exporting) return;
    setExporting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      
      if (format === 'pdf') {
        alert('Tính năng Xuất PDF yêu cầu thư viện bổ sung. Đang hiển thị bản xem trước...');
        window.print();
        return;
      }

      const reportData = {
        title: `BÁO CÁO TỔNG QUAN HRM - ${currentPeriod?.label || ''}`,
        date: new Date().toLocaleString('vi-VN'),
        metrics: [
          { label: 'Tổng nhân viên', value: computed.totalEmployees, unit: 'Người' },
          { label: 'Đang làm việc', value: computed.activeEmployees, unit: 'Người' },
          { label: 'Nhân viên mới', value: computed.newEmployees, unit: 'Người' },
          { label: 'Phòng ban', value: computed.departmentCount, unit: 'Phòng' },
          { label: 'Tổng lương', value: computed.formatCompact(computed.totalPayroll), unit: 'VNĐ' },
          { label: 'Thuế TNCN', value: computed.formatCompact(computed.totalTax), unit: 'VNĐ' },
          { label: 'Bảo hiểm', value: computed.formatCompact(computed.totalInsurance), unit: 'VNĐ' },
        ]
      };

      if (format === 'csv') {
        const csvContent = [
          [reportData.title],
          [`Ngày xuất: ${reportData.date}`],
          [''],
          ['CHỈ SỐ', 'GIÁ TRỊ', 'ĐƠN VỊ'],
          ...reportData.metrics.map(m => [m.label, m.value, m.unit])
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadFile(blob, `Bao_cao_HRM_${period}_${new Date().getTime()}.csv`);
      } else {
        // HTML Export
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${reportData.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #334155; }
              .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
              h1 { color: #0f172a; margin: 0; }
              .date { color: #64748b; font-size: 14px; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { text-align: left; padding: 12px 15px; border-bottom: 1px solid #f1f5f9; }
              th { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
              .value { font-weight: bold; color: #1e293b; }
              .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${reportData.title}</h1>
              <div class="date">Ngày xuất báo cáo: ${reportData.date}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Chỉ số nhân sự</th>
                  <th>Giá trị hiện tại</th>
                  <th>Đơn vị</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.metrics.map(m => `
                  <tr>
                    <td>${m.label}</td>
                    <td class="value">${m.value}</td>
                    <td>${m.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">Hệ thống quản trị XEVN Ecosystem - Module HRM</div>
          </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
        downloadFile(blob, `Bao_cao_HRM_${period}_${new Date().getTime()}.html`);
      }
      
      alert('Xuất báo cáo thành công!');
    } catch (error) {
      alert('Có lỗi xảy ra khi xuất báo cáo.');
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const computed = useMemo(() => {
    const employees = (mockEmployees as any[]).slice(0, 50);
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'active').length;
    const newEmployees = Math.max(0, Math.round(totalEmployees * 0.06));
    const departments = new Set(employees.map((e) => e.department).filter(Boolean));
    const departmentCount = departments.size;

    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
    const totalTax = Math.round(totalPayroll * 0.1);
    const totalInsurance = Math.round(totalPayroll * 0.105);

    const formatCompact = (value: number) =>
      new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 0 }).format(value);

    const salaryRanges = [
      { label: 'Trên 30 triệu', min: 30_000_000 },
      { label: '20–30 triệu', min: 20_000_000, max: 30_000_000 },
      { label: '15–20 triệu', min: 15_000_000, max: 20_000_000 },
      { label: 'Dưới 15 triệu', min: 0, max: 15_000_000 },
    ].map((r, idx) => {
      const count = employees.filter((e) => {
        const s = Number(e.salary) || 0;
        if (s <= 0) return false;
        if (r.max == null) return s >= r.min;
        return s >= r.min && s < r.max;
      }).length;
      const fill =
        idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-violet-500' : 'bg-amber-500';
      return { ...r, count, fill };
    });

    const topSalaryCount = salaryRanges[0]?.count ?? 0;

    const incomeStructure = [
      { name: 'Lương cơ bản', value: 100, color: '#10b981' },
      { name: 'Thưởng KPI', value: 0, color: '#f59e0b' },
      { name: 'Phụ cấp', value: 0, color: '#8b5cf6' },
      { name: 'Thưởng khác', value: 0, color: '#3b82f6' },
    ];

    const donutStyle = {
      background: `conic-gradient(${incomeStructure[0].color} 0 360deg)`,
    } as React.CSSProperties;

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return { pct: 0, up: true };
      const pct = ((current - previous) / previous) * 100;
      return { pct: Math.round(pct * 10) / 10, up: pct >= 0 };
    };

    // FE-first: chưa có dữ liệu lịch sử nên dùng baseline = current
    const previousEmployees = totalEmployees;
    const previousPayroll = totalPayroll;
    const previousAttendance = 0;
    const previousLeaves = 0;

    const currentAttendance = 0;
    const currentLeaves = 0;

    const comparison = {
      employees: { current: totalEmployees, previous: previousEmployees, change: calcChange(totalEmployees, previousEmployees) },
      payroll: { current: totalPayroll, previous: previousPayroll, change: calcChange(totalPayroll, previousPayroll) },
      attendance: { current: currentAttendance, previous: previousAttendance, change: calcChange(currentAttendance, Math.max(1, previousAttendance)) },
      leaves: { current: currentLeaves, previous: previousLeaves, change: calcChange(currentLeaves, Math.max(1, previousLeaves)) },
    };

    return {
      totalEmployees,
      activeEmployees,
      newEmployees,
      departmentCount,
      totalPayroll,
      totalTax,
      totalInsurance,
      formatCompact,
      salaryRanges,
      topSalaryCount,
      donutStyle,
      comparison,
    };
  }, []);

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <DashboardDropdown 
            value={period}
            options={timePeriods as any}
            onChange={(v) => setPeriod(v as any)}
          />

          <ExportDropdown 
            onExport={handleExport}
            loading={exporting}
          />
          
          <button
            type="button"
            onClick={() => window.open('/', '_blank')}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-700 shadow-sm transition active:scale-95 hover:bg-amber-100"
            title="Mở toàn bộ hệ thống cũ trong tab mới để xem đầy đủ menu"
          >
            <ExternalLink className="h-4 w-4" />
            Mở phiên bản cũ
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-sm text-xevn-textSecondary">
        <Calendar className="h-4 w-4" />
        <span>
          Dữ liệu hiển thị: <span className="font-semibold text-xevn-text">{currentPeriod?.label}</span>
        </span>
        <span className="rounded-full border border-xevn-border bg-white/60 px-2 py-0.5 text-xs font-semibold text-xevn-textSecondary">
          {currentPeriod?.short}
        </span>
      </div>

      {/* Quick actions tiles */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <button type="button" onClick={() => go('employees')} className="text-left">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-soft hover:shadow-hover hover:-translate-y-1 active:scale-95 transition-all duration-300">
            <div className="p-4 flex flex-col gap-4">
              <div className="w-20 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                <Users className="h-5 w-5 relative z-10" />
              </div>
              <div>
                <div className="text-sm font-semibold">Quản lý nhân viên</div>
                <div className="mt-1 text-xs text-white/80">Xem hồ sơ nhân viên</div>
              </div>
            </div>
          </Card>
        </button>

        <button type="button" onClick={() => go('recruitment')} className="text-left">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-soft hover:shadow-hover hover:-translate-y-1 active:scale-95 transition-all duration-300">
            <div className="p-4 flex flex-col gap-4">
              <div className="w-20 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                <Users className="h-5 w-5 relative z-10" />
              </div>
              <div>
                <div className="text-sm font-semibold">Tuyển dụng</div>
                <div className="mt-1 text-xs text-white/80">Quản lý ứng viên</div>
              </div>
            </div>
          </Card>
        </button>

        <button type="button" onClick={() => go('attendance')} className="text-left">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-soft hover:shadow-hover hover:-translate-y-1 active:scale-95 transition-all duration-300">
            <div className="p-4 flex flex-col gap-4">
              <div className="w-20 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                <Clock className="h-5 w-5 relative z-10" />
              </div>
              <div>
                <div className="text-sm font-semibold">Chấm công</div>
                <div className="mt-1 text-xs text-white/80">Theo dõi giờ làm</div>
              </div>
            </div>
          </Card>
        </button>

        <button type="button" onClick={() => go('payroll')} className="text-left">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-soft hover:shadow-hover hover:-translate-y-1 active:scale-95 transition-all duration-300">
            <div className="p-4 flex flex-col gap-4">
              <div className="w-20 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                <Wallet className="h-5 w-5 relative z-10" />
              </div>
              <div>
                <div className="text-sm font-semibold">Tính lương</div>
                <div className="mt-1 text-xs text-white/80">Xem bảng lương</div>
              </div>
            </div>
          </Card>
        </button>

        <button type="button" onClick={() => go('reports')} className="text-left">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-cyan-400 to-teal-500 text-white shadow-soft hover:shadow-hover hover:-translate-y-1 active:scale-95 transition-all duration-300">
            <div className="p-4 flex flex-col gap-4">
              <div className="w-20 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-white/10 rounded-full blur-lg" />
                <BarChart3 className="h-5 w-5 relative z-10" />
              </div>
              <div>
                <div className="text-sm font-semibold">Báo cáo</div>
                <div className="mt-1 text-xs text-white/80">Xem thống kê</div>
              </div>
            </div>
          </Card>
        </button>
      </div>

      {/* Main grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Payroll summary */}
          <Card className="bg-white/70 backdrop-blur-md p-0 overflow-hidden border border-xevn-border">
            <div className="flex items-start gap-4 p-4">
              <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-2xl md:flex">
                💰
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-xevn-text">Tổng hợp lương</div>
                <div className="mt-1 text-xs text-xevn-textSecondary">{currentPeriod?.label}</div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-xevn-textSecondary">Tổng lương</div>
                    <div className="mt-1 text-2xl font-bold text-xevn-text">{computed.formatCompact(computed.totalPayroll)}</div>
                    <div className="text-xs text-xevn-textSecondary">VNĐ</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-xevn-textSecondary">Thuế TNCN</div>
                    <div className="mt-1 text-2xl font-bold text-amber-500">{computed.formatCompact(computed.totalTax)}</div>
                    <div className="text-xs text-xevn-textSecondary">VNĐ (~10%)</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-xevn-textSecondary">Bảo hiểm</div>
                    <div className="mt-1 text-2xl font-bold text-blue-500">{computed.formatCompact(computed.totalInsurance)}</div>
                    <div className="text-xs text-xevn-textSecondary">VNĐ (~10.5%)</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Charts row (placeholders but same blocks) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
              <div className="p-4">
                <div className="text-sm font-semibold text-xevn-text">Phân tích mức lương nhân viên</div>
                <div className="mt-1 text-xs text-xevn-textSecondary">{currentPeriod?.label}</div>
                <div className="mt-4 space-y-3">
                  {computed.salaryRanges.map((r) => (
                    <div key={r.label} className="grid grid-cols-[110px_1fr_60px] items-center gap-3">
                      <div className="text-xs text-xevn-textSecondary">{r.label}</div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${r.fill}`}
                          style={{ width: `${Math.min(100, (r.count / Math.max(1, computed.totalEmployees)) * 100)}%` }}
                        />
                      </div>
                      <div className="text-right text-xs font-semibold text-xevn-text">{r.count}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-xevn-border pt-3 text-sm">
                  <span className="text-xevn-textSecondary">Trên 30 triệu:</span>
                  <span className="font-semibold text-emerald-700">{computed.topSalaryCount} nhân viên</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
              <div className="p-4">
                <div className="text-sm font-semibold text-xevn-text">Cơ cấu thu nhập</div>
                <div className="mt-1 text-xs text-xevn-textSecondary">{currentPeriod?.label}</div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative h-28 w-28 shrink-0 rounded-full" style={computed.donutStyle}>
                    <div className="absolute inset-3 rounded-full bg-white/90" />
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-xevn-textSecondary">Lương cơ bản</span>
                      <span className="ml-auto font-semibold text-xevn-text">100%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span className="text-xevn-textSecondary">Thưởng KPI</span>
                      <span className="ml-auto font-semibold text-xevn-text">0%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                      <span className="text-xevn-textSecondary">Phụ cấp</span>
                      <span className="ml-auto font-semibold text-xevn-text">0%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <span className="text-xevn-textSecondary">Thưởng khác</span>
                      <span className="ml-auto font-semibold text-xevn-text">0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
              <div className="p-4">
                <div className="text-sm font-semibold text-xevn-text">Thu nhập bình quân theo thời gian</div>
                <div className="mt-1 text-xs text-xevn-textSecondary">{currentPeriod?.label}</div>
                <div className="mt-4 h-40 rounded-lg border border-xevn-border bg-white p-3">
                  <div className="h-full w-full">
                    <svg viewBox="0 0 300 120" className="h-full w-full">
                      <polyline
                        points="0,100 40,98 80,100 120,100 160,100 200,99 240,100 280,100 300,100"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <line x1="0" y1="100" x2="300" y2="100" stroke="#E5E7EB" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
              <div className="p-4">
                <div className="text-sm font-semibold text-xevn-text">Thu nhập bình quân theo đơn vị</div>
                <div className="mt-1 text-xs text-xevn-textSecondary">{currentPeriod?.label}</div>
                <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-xevn-border bg-white text-sm text-xevn-textSecondary">
                  Không có dữ liệu
                </div>
              </div>
            </Card>
          </div>

          {/* Comparison section (iframe parity) */}
          <Card className="border border-xevn-border bg-white/70 backdrop-blur-md">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-xevn-text">So sánh giữa các kỳ</div>
                  <div className="mt-1 text-xs text-xevn-textSecondary">Tháng này vs Tháng trước</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                {[
                  {
                    title: 'Nhân viên',
                    value: computed.comparison.employees.current,
                    prev: computed.comparison.employees.previous,
                    change: computed.comparison.employees.change,
                    suffix: '',
                  },
                  {
                    title: 'Tổng lương',
                    value: computed.comparison.payroll.current,
                    prev: computed.comparison.payroll.previous,
                    change: computed.comparison.payroll.change,
                    suffix: '',
                    format: computed.formatCompact,
                  },
                  {
                    title: 'Tỷ lệ đi làm',
                    value: computed.comparison.attendance.current,
                    prev: computed.comparison.attendance.previous,
                    change: computed.comparison.attendance.change,
                    suffix: '%',
                  },
                  {
                    title: 'Số ngày nghỉ',
                    value: computed.comparison.leaves.current,
                    prev: computed.comparison.leaves.previous,
                    change: computed.comparison.leaves.change,
                    suffix: '',
                  },
                ].map((item) => {
                  const pct = item.change.pct;
                  const up = item.change.up;
                  const pctColor = up ? 'text-emerald-700' : 'text-xevn-danger';
                  const pctText = `${up ? '↗' : '↘'} ${Math.abs(pct).toFixed(1)}%`;
                  const valueText = item.format ? item.format(item.value as any) : String(item.value);
                  const prevText = item.format ? item.format(item.prev as any) : String(item.prev);
                  return (
                    <div key={item.title} className="rounded-xl border border-xevn-border bg-white p-4 shadow-soft">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-xevn-textSecondary">{item.title}</div>
                        <div className={`text-xs font-semibold ${pctColor}`}>{pctText}</div>
                      </div>
                      <div className="mt-2 flex items-end gap-2">
                        <div className="text-2xl font-bold text-xevn-text">
                          {valueText}
                          {item.suffix}
                        </div>
                        <div className="text-sm text-xevn-textSecondary">
                          / {prevText}
                          {item.suffix}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-sm font-semibold text-emerald-800">Tổng quan: Tăng trưởng tích cực</div>
                <div className="mt-1 text-sm text-emerald-700">
                  So với kỳ trước, tổng lương tăng {computed.comparison.payroll.change.pct.toFixed(1)}%, tỷ lệ đi làm cải thiện{' '}
                  {computed.comparison.attendance.change.pct.toFixed(1)}%.
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-xevn-text">
                <Users className="h-5 w-5 text-xevn-primary" />
                Thống kê nhân sự
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xevn-textSecondary">Tổng nhân viên</span>
                  <span className="font-bold text-xevn-text">{computed.totalEmployees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xevn-textSecondary">Đang làm việc</span>
                  <span className="font-bold text-emerald-700">{computed.activeEmployees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xevn-textSecondary">Nhân viên mới</span>
                  <span className="font-bold text-blue-600">{computed.newEmployees}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xevn-textSecondary">Phòng ban</span>
                  <span className="font-bold text-amber-600">{computed.departmentCount}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
            <div className="p-4">
              <div className="text-sm font-semibold text-xevn-text">Phiếu lương chờ duyệt</div>
              <div className="mt-4 rounded-lg border border-xevn-border bg-white p-3">
                <div className="text-xs font-semibold text-xevn-textSecondary">Quỹ lương {currentPeriod?.label?.toLowerCase()}</div>
                <div className="mt-2 text-xl font-bold text-xevn-text">{computed.formatCompact(computed.totalPayroll)} VNĐ</div>
                <div className="mt-1 text-xs text-xevn-textSecondary">{computed.totalEmployees} nhân viên</div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center justify-center text-xs font-semibold text-xevn-primary hover:underline"
                  onClick={() => go('payroll')}
                >
                  Chi tiết
                </button>
              </div>
              <button
                type="button"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-xevn-border bg-white/60 px-3 py-2 text-sm font-semibold text-xevn-primary backdrop-blur-md transition active:scale-95 hover:bg-white"
                onClick={() => go('payroll')}
              >
                Xem thêm
              </button>
            </div>
          </Card>

          <Card className="bg-white/70 backdrop-blur-md border border-xevn-border">
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-xevn-text">
                <span className="text-amber-600">⚠</span> Lời nhắc
              </div>
              <div className="mt-4 text-sm text-xevn-textSecondary">NHÂN VIÊN MỚI NHẤT</div>
              <div className="mt-1 text-sm text-xevn-textSecondary">Không có dữ liệu</div>
            </div>
          </Card>
        </div>
      </div>

    </>
  );
};

const DashboardDropdown: React.FC<{ 
  value: string; 
  options: readonly { key: string, label: string }[]; 
  onChange: (v: string) => void; 
}> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const current = options.find(o => o.key === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white/70 px-3 text-sm font-semibold text-xevn-text shadow-soft backdrop-blur-md transition active:scale-95 hover:bg-white min-w-[140px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-xevn-textSecondary" />
          <span>{current?.label}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-xevn-textSecondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-200">
          {options.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm font-semibold transition-colors flex items-center justify-between ${value === opt.key ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {opt.label}
              {value === opt.key && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ExportDropdown: React.FC<{ 
  onExport: (format: 'csv' | 'html' | 'pdf') => Promise<void>; 
  loading: boolean;
}> = ({ onExport, loading }) => {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const formats = [
    { key: 'csv', label: 'Xuất CSV (Excel)', icon: FileSpreadsheet },
    { key: 'html', label: 'Xuất HTML (Web)', icon: FileText },
    { key: 'pdf', label: 'Xuất PDF', icon: FileText },
  ] as const;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white/70 px-4 text-sm font-semibold text-xevn-text shadow-soft backdrop-blur-md transition active:scale-95 hover:bg-white"
      >
        <Download className="h-4 w-4 text-xevn-textSecondary" />
        {loading ? 'Đang xuất...' : 'Xuất báo cáo'}
        <ChevronDown className={`ml-1 h-3 w-3 text-xevn-textSecondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[220px] bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-1 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Định dạng báo cáo</div>
          {formats.map(f => (
            <button
              key={f.key}
              type="button"
              disabled={loading}
              onClick={() => { onExport(f.key); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-3"
            >
              <f.icon className="h-4 w-4 text-slate-400" />
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
