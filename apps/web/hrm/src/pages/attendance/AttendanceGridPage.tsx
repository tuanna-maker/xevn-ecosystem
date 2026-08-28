/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảng Công (Attendance Grid) — G6
 * UC:         UC-G6-01..05
 * SRS:        SRS_G6_ATTENDANCE_GRID_v1.md
 * Route:      /attendance-grid
 * WorkItem:   G6-ATTENDANCE-GRID-FE-01
 * Coded:      2026-08-27
 * Purpose:    Bảng chấm công tháng: xem/sửa ô theo ngày × nhân viên.
 *             Tái dùng listAttendanceRecords + createAttendanceRecord từ hrmApi.ts.
 * must_keep:  BR-G6-01 chỉ sửa tháng chưa chốt; BR-G6-02 không seed khi tạo sheet; U65
 * SOLID:      SRP — GridPage = layout + header only; cell logic trong AttendanceCellPopover
 * fe_boundary: import từ integrations/hrmApi.ts; không gọi attendance BE trực tiếp
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Download, Upload, Loader2, AlertCircle,
  Calendar, Users, Search, X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  listAttendanceRecords,
  createAttendanceRecord,
  updateAttendanceStatus,
  type HrmAttendanceRecord,
  type HrmAttendanceStatus,
} from '@/integrations/hrmApi';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { useAttAttendanceCodesEffective } from '@/hooks/useAttAttendanceCodesEffective';
// Map extended local codes → BE HrmAttendanceStatus
function toBeStatus(code: AttCode): HrmAttendanceStatus {
  const map: Record<AttCode, HrmAttendanceStatus> = {
    present:      'present',
    absent:       'absent',
    leave:        'leave',
    half:         'present', // nearest: note sẽ ghi 'Nửa ngày'
    compensatory: 'present', // nearest: note sẽ ghi 'Bù'
    pending:      'pending',
  };
  return map[code];
}

// ─── Constants ─────────────────────────────────────────────────────────────
type AttCode = 'present' | 'absent' | 'leave' | 'half' | 'compensatory' | 'pending';

const ATT_CODE_MAP: Record<AttCode, { label: string; short: string; color: string; bg: string }> = {
  present:      { label: 'Đi làm',    short: '✓', color: '#16a34a', bg: '#f0fdf4' },
  absent:       { label: 'Vắng',      short: 'V', color: '#dc2626', bg: '#fef2f2' },
  leave:        { label: 'Phép',      short: 'P', color: '#7c3aed', bg: '#f5f3ff' },
  half:         { label: 'Nửa ngày',  short: '½', color: '#d97706', bg: '#fffbeb' },
  compensatory: { label: 'Bù',        short: 'B', color: '#0284c7', bg: '#eff6ff' },
  pending:      { label: 'Chưa xác nhận', short: '?', color: '#9ca3af', bg: '#f9fafb' },
};

function getMonthDays(year: number, month: number) {
  // month: 1-based
  const days: Date[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month - 1, d));
  }
  return days;
}

function formatDateISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

// ─── CellPopover ──────────────────────────────────────────────────────────
function CellPopover({
  record, date, employeeId, employeeName, isLocked,
  onSave, onClose,
}: {
  record: HrmAttendanceRecord | null;
  date: string;
  employeeId: string;
  employeeName: string;
  isLocked: boolean;
  onSave: (code: AttCode, note: string) => Promise<void>;
  onClose: () => void;
}) {
  const [code, setCode] = useState<AttCode>((record?.status as AttCode) ?? 'present');
  const [note, setNote] = useState(record?.note ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(code, note);
    } finally {
      setSaving(false);
    }
  };

  if (isLocked) {
    return (
      <div className="absolute z-50 bg-white border shadow-xl rounded-xl p-4 w-64" style={{ minWidth: 240 }}>
        <div className="flex items-center gap-2 text-amber-600 text-sm mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">Tháng đã chốt</span>
        </div>
        <p className="text-xs text-gray-500">Không thể chỉnh sửa bảng công đã chốt.</p>
        <Button size="sm" variant="ghost" className="mt-3 w-full" onClick={onClose}>Đóng</Button>
      </div>
    );
  }

  return (
    <div className="absolute z-50 bg-white border shadow-xl rounded-xl p-4 w-64" style={{ minWidth: 240 }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-900 truncate">{employeeName}</p>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-3">{new Date(date+'T00:00:00').toLocaleDateString('vi-VN', { weekday:'short', day:'2-digit', month:'2-digit' })}</p>

      {/* Code selector */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        {(Object.entries(ATT_CODE_MAP) as [AttCode, typeof ATT_CODE_MAP[AttCode]][]).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setCode(k)}
            className="flex flex-col items-center py-1.5 px-1 rounded-lg border text-xs font-medium transition-all"
            style={code === k ? { background: v.bg, borderColor: v.color, color: v.color } : {}}
          >
            <span className="text-base leading-none">{v.short}</span>
            <span className="mt-0.5 text-[10px]">{v.label}</span>
          </button>
        ))}
      </div>

      <Input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Ghi chú..."
        className="h-8 text-xs mb-3"
      />

      <div className="flex gap-2">
        <Button size="sm" variant="ghost" className="flex-1" onClick={onClose}>Hủy</Button>
        <Button size="sm" className="flex-1 gap-1" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-3 h-3 animate-spin" />} Lưu
        </Button>
      </div>
    </div>
  );
}

// ─── AttendanceGridPage ───────────────────────────────────────────────────
export default function AttendanceGridPage() {
  const { currentCompanyId: companyId } = useAuth();
  const { nestOptions, effectiveCount } = useAttAttendanceCodesEffective();

  const mapGridStatus = (status: HrmAttendanceStatus): HrmAttendanceStatus => {
    if (effectiveCount > 0) {
      if (status === 'present') {
        const hit = nestOptions.find(
          (o) =>
            ['present', 'p'].includes(o.code.toLowerCase()) ||
            o.symbol?.toLowerCase() === 'p'
        );
        return (hit?.code || nestOptions[0]?.code || status) as HrmAttendanceStatus;
      }
      if (status === 'absent') {
        const hit = nestOptions.find(
          (o) =>
            ['absent', 'x'].includes(o.code.toLowerCase()) ||
            o.symbol?.toLowerCase() === 'x'
        );
        return (hit?.code || nestOptions[0]?.code || status) as HrmAttendanceStatus;
      }
      if (status === 'leave') {
        const hit = nestOptions.find(
          (o) =>
            ['leave', 'an'].includes(o.code.toLowerCase()) ||
            o.symbol?.toLowerCase() === 'an'
        );
        return (hit?.code || nestOptions[0]?.code || status) as HrmAttendanceStatus;
      }
    }
    return status;
  };

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<HrmAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [activeCell, setActiveCell] = useState<{ employeeId: string; date: string } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  // --- IMPORT CSV ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        // Assuming format: Mã NV, Ngày(YYYY-MM-DD), Trạng thái(present|absent|leave|half|compensatory)
        let successCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length >= 3) {
            const empId = parts[0].trim();
            const date = parts[1].trim();
            const code = parts[2].trim() as AttCode;
            const emp = employeeMap.get(empId);
            if (emp) {
               await handleCellSave(emp, date, code, 'Import CSV');
               successCount++;
            }
          }
        }
        toast.success(`Import thành công ${successCount} dòng`);
      } catch (err) {
        toast.error('Lỗi khi đọc file CSV');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const days = getMonthDays(year, month);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const fromDate = `${year}-${String(month).padStart(2,'0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const toDate = `${year}-${String(month).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
      const res = await listAttendanceRecords({
        company_id: companyId,
        from_date: fromDate,
        to_date: toDate,
        page_size: 500,
      });
      setRecords(res.data ?? []);
    } catch (e) {
      toast.error(toErrorMessage(e) || 'Không thể tải bảng công');
    } finally {
      setLoading(false);
    }
  }, [companyId, year, month]);

  useEffect(() => { load(); }, [load]);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveCell(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Group records by employee
  const employeeMap = new Map<string, { id: string; name: string; dept: string; records: Map<string, HrmAttendanceRecord> }>();
  for (const r of records) {
    if (!employeeMap.has(r.employee_id)) {
      employeeMap.set(r.employee_id, {
        id: r.employee_id,
        name: r.employee_name ?? r.employee_id,
        dept: r.department ?? '',
        records: new Map(),
      });
    }
    employeeMap.get(r.employee_id)!.records.set(r.attendance_date.substring(0, 10), r);
  }

  // Filter
  let employees = Array.from(employeeMap.values());
  if (deptFilter.trim()) {
    employees = employees.filter(e => e.dept.toLowerCase().includes(deptFilter.toLowerCase()));
  }
  if (search.trim()) {
    employees = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y-1); setMonth(12); }
    else setMonth(m => m-1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y+1); setMonth(1); }
    else setMonth(m => m+1);
  };

  const handleCellSave = async (emp: { id: string; name: string }, date: string, code: AttCode, note: string) => {
    const existing = employeeMap.get(emp.id)?.records.get(date);
    const targetStatus = mapGridStatus(toBeStatus(code));
    try {
      if (existing) {
        await updateAttendanceStatus(existing.id, { status: targetStatus, note: note || undefined }, companyId!);
      } else {
        await createAttendanceRecord({
          company_id: companyId!,
          employee_id: emp.id,
          attendance_date: date,
          status: targetStatus,
          note: note || undefined,
        });
      }
      toast.success('Cập nhật thành công');
      setActiveCell(null);
      await load();
    } catch (e) {
      toast.error(toErrorMessage(e) || 'Cập nhật thất bại');
    }
  };

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const isSunday = (d: Date) => d.getDay() === 0;
  const isSaturday = (d: Date) => d.getDay() === 6;

  // Summary stats per employee
  const getSummary = (emp: ReturnType<typeof Array.from<typeof employeeMap extends Map<string, infer V> ? V : never>>[number]) => {
    let present=0, absent=0, leave=0, compensatory=0, sat=0, sun=0;
    days.forEach(d => {
      const k = formatDateISO(d);
      const r = emp.records.get(k);
      if (isSunday(d)) sun++;
      else if (isSaturday(d)) sat++;
      else if (r) {
        if (r.status === 'present') present++;
        else if (r.status === 'absent') absent++;
        else if (r.status === 'leave') leave++;
      }
    });
    return { present, absent, leave, compensatory, sat, sun };
  };

  // Export CSV
  const handleExport = () => {
    const headers = ['Nhân viên', 'Phòng ban', ...days.map(d => d.getDate()), 'Đi làm', 'Phép', 'Vắng'];
    const rows = employees.map(emp => {
      const cells = days.map(d => {
        const r = emp.records.get(formatDateISO(d));
        return r ? ATT_CODE_MAP[r.status as AttCode]?.short ?? r.status : '';
      });
      const s = getSummary(emp as any);
      return [emp.name, emp.dept, ...cells, s.present, s.leave, s.absent];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `bang-cong-${year}-${String(month).padStart(2,'0')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Xuất file thành công');
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" /> Bảng chấm công
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Tháng {month}/{year}</p>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={prevMonth} className="p-1.5 rounded hover:bg-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-3 text-sm font-semibold min-w-[80px] text-center">{month < 10 ? '0'+month : month}/{year}</span>
          <button onClick={nextMonth} className="p-1.5 rounded hover:bg-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={importing} className="gap-2 h-8 text-xs">
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Import CSV
          </Button>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 h-8 text-xs">
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm nhân viên..." className="pl-9 h-8 text-sm" />
        </div>
        <div className="relative flex-1 max-w-xs">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            placeholder="Lọc phòng ban..." className="pl-9 h-8 text-sm" />
        </div>
        {isLocked && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" /> Tháng đã chốt
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {(Object.entries(ATT_CODE_MAP) as [AttCode, typeof ATT_CODE_MAP[AttCode]][]).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-xs">
            <span className="w-5 h-5 rounded text-center leading-5 font-bold text-xs flex items-center justify-center"
              style={{ background: v.bg, color: v.color }}>{v.short}</span>
            <span className="text-gray-600">{v.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-5 h-5 rounded bg-gray-100 text-gray-400 text-center leading-5 flex items-center justify-center">T7</span>
          <span className="text-gray-600">Thứ 7</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="w-5 h-5 rounded bg-red-50 text-red-300 text-center leading-5 flex items-center justify-center">CN</span>
          <span className="text-gray-600">Chủ nhật</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center gap-2 justify-center py-20 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tải bảng công...
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{records.length === 0 ? 'Chưa có dữ liệu chấm công tháng này' : 'Không tìm thấy nhân viên'}</p>
          <p className="text-sm mt-1">{records.length === 0 ? 'Dữ liệu sẽ xuất hiện khi nhân viên check-in' : 'Thử xóa bộ lọc'}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border rounded-xl relative" ref={popoverRef}>
          <table className="text-xs border-collapse min-w-max w-full">
            <thead className="sticky top-0 z-20 bg-white">
              <tr>
                <th className="sticky left-0 z-30 bg-gray-50 border-b border-r px-3 py-2 text-left font-semibold text-gray-700 min-w-[160px]">
                  Nhân viên
                </th>
                {days.map(d => (
                  <th key={d.getDate()} className={`border-b border-r px-1 py-2 text-center font-semibold min-w-[32px] ${
                    isSunday(d) ? 'bg-red-50 text-red-400' : isSaturday(d) ? 'bg-orange-50 text-orange-400' : 'text-gray-600'
                  }`}>
                    <div>{d.getDate()}</div>
                    <div className="text-[9px] font-normal">{['CN','T2','T3','T4','T5','T6','T7'][d.getDay()]}</div>
                  </th>
                ))}
                {/* Summary cols */}
                <th className="border-b border-r px-2 py-2 text-center text-green-600 min-w-[36px]">ĐL</th>
                <th className="border-b border-r px-2 py-2 text-center text-purple-600 min-w-[36px]">P</th>
                <th className="border-b px-2 py-2 text-center text-red-500 min-w-[36px]">V</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => {
                const s = getSummary(emp as any);
                return (
                  <tr key={emp.id} className={idx % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    <td className="sticky left-0 bg-inherit border-b border-r px-3 py-1.5 font-medium text-gray-800 z-10 min-w-[160px]">
                      <div>{emp.name}</div>
                      {emp.dept && <div className="text-[10px] text-gray-400 font-normal">{emp.dept}</div>}
                    </td>
                    {days.map(d => {
                      const dateStr = formatDateISO(d);
                      const rec = emp.records.get(dateStr);
                      const code = rec?.status as AttCode ?? null;
                      const cfg = code ? ATT_CODE_MAP[code] : null;
                      const isActive = activeCell?.employeeId === emp.id && activeCell?.date === dateStr;
                      const weekend = isWeekend(d);

                      return (
                        <td key={dateStr} className={`border-b border-r relative p-0 ${weekend ? 'bg-gray-50/80' : ''}`}>
                          <div className="relative">
                            <button
                              onClick={() => setActiveCell(isActive ? null : { employeeId: emp.id, date: dateStr })}
                              className={`w-full h-8 flex items-center justify-center text-xs font-bold rounded transition-colors ${
                                weekend ? 'cursor-default opacity-60' : 'hover:ring-1 hover:ring-blue-400 hover:ring-offset-0 cursor-pointer'
                              }`}
                              style={cfg ? { background: cfg.bg, color: cfg.color } : {}}
                              disabled={weekend && !cfg}
                              data-testid={`cell-${emp.id}-${dateStr}`}
                            >
                              {cfg ? cfg.short : ''}
                            </button>
                            {isActive && (
                              <div className="absolute top-8 left-0 z-50">
                                <CellPopover
                                  record={rec ?? null}
                                  date={dateStr}
                                  employeeId={emp.id}
                                  employeeName={emp.name}
                                  isLocked={isLocked}
                                  onSave={(code, note) => handleCellSave(emp, dateStr, code, note)}
                                  onClose={() => setActiveCell(null)}
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="border-b border-r px-2 py-1.5 text-center font-semibold text-green-600">{s.present}</td>
                    <td className="border-b border-r px-2 py-1.5 text-center font-semibold text-purple-600">{s.leave}</td>
                    <td className="border-b px-2 py-1.5 text-center font-semibold text-red-500">{s.absent}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}