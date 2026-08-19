/**
 * @CODE-MEMORY
 * Screen:     HRM Lương → Thiết lập lương → Ca làm việc (Wave 7)
 * UC:         UC-HRM-SHIFT-01..02
 * SRS:        docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_SRS_01_20260813.md
 * TechSpec:   docs/program/deltas/BA_HRM_ATTENDANCE_SHIFT_TECHSPEC_01_20260813.md
 * UI:         docs/hrm/ui-screens/UI-HRM-ATTENDANCE-SHIFT-01.md
 * WorkItem:   D-PO-HRM-ATT-SHIFT-FE-01
 * Coded:      2026-08-13
 */
import { useState, useMemo } from 'react';
import { Search, Plus, Clock, Moon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export type ShiftItem = {
  id: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  workHours: number;
  isNightShift: boolean;
  status: 'active' | 'inactive';
};

/** 6 Real Shifts from customer operational data */
const SAMPLE_SHIFTS: ShiftItem[] = [
  { id: 's1', code: 'SHIFT_MORNING', name: 'Ca Sáng (06:00 - 14:00)', startTime: '06:00', endTime: '14:00', breakStart: '11:30', breakEnd: '12:00', workHours: 7.5, isNightShift: false, status: 'active' },
  { id: 's2', code: 'SHIFT_AFTERNOON', name: 'Ca Chiều (14:00 - 22:00)', startTime: '14:00', endTime: '22:00', breakStart: '18:00', breakEnd: '18:30', workHours: 7.5, isNightShift: false, status: 'active' },
  { id: 's3', code: 'SHIFT_NIGHT', name: 'Ca Đêm (22:00 - 06:00)', startTime: '22:00', endTime: '06:00', breakStart: '02:00', breakEnd: '02:30', workHours: 7.5, isNightShift: true, status: 'active' },
  { id: 's4', code: 'SHIFT_OFFICE', name: 'Ca Hành chính (08:00 - 17:00)', startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00', workHours: 8.0, isNightShift: false, status: 'active' },
  { id: 's5', code: 'SHIFT_SPLIT', name: 'Ca Gãy (07:00 - 11:00 & 16:00 - 20:00)', startTime: '07:00', endTime: '20:00', breakStart: '11:00', breakEnd: '16:00', workHours: 8.0, isNightShift: false, status: 'active' },
];

export function AttendanceShiftsSetupScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isNight, setIsNight] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const filteredShifts = useMemo(() => {
    return SAMPLE_SHIFTS.filter(
      (s) =>
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const handleSave = () => {
    if (startTime === endTime) {
      setTimeError('Giờ bắt đầu và kết thúc không được trùng nhau');
      return;
    }
    setTimeError(null);
    setIsAddDialogOpen(false);
    setCode('');
    setName('');
  };

  return (
    <div className="space-y-4" data-testid="attendance-shifts-setup-screen">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-lg border">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm ca làm việc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
            data-testid="search-shift-input"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          data-testid="btn-add-shift"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Tạo ca làm việc
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="shifts-table">
              <thead className="text-xs uppercase bg-muted text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3">Mã ca</th>
                  <th className="px-4 py-3">Tên ca</th>
                  <th className="px-4 py-3">Khung giờ làm việc</th>
                  <th className="px-4 py-3 text-center">Công chuẩn</th>
                  <th className="px-4 py-3">Phân loại</th>
                  <th className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono font-medium">{shift.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{shift.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">
                      <Clock className="mr-1 h-3.5 w-3.5 inline text-sky-600" />
                      {shift.startTime} - {shift.endTime}
                      {shift.breakStart && (
                        <span className="text-muted-foreground ml-2">(Nghỉ: {shift.breakStart}-{shift.breakEnd})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold font-mono text-emerald-700">
                      {shift.workHours}h
                    </td>
                    <td className="px-4 py-3">
                      {shift.isNightShift ? (
                        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300">
                          <Moon className="mr-1 h-3 w-3 inline" /> Ca Đêm
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-normal">
                          Ca Ngày
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3 inline" /> Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Shift Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo mới Ca Làm Việc</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {timeError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {timeError}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mã ca</label>
              <Input
                placeholder="VD: SHIFT_EVENING"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tên ca</label>
              <Input
                placeholder="VD: Ca Tối (18:00 - 02:00)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-sm mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Giờ bắt đầu</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Giờ kết thúc</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isNightShift"
                checked={isNight}
                onChange={(e) => setIsNight(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="isNightShift" className="text-xs font-medium text-foreground cursor-pointer">
                Đánh dấu Ca Đêm (hưởng phụ cấp làm đêm)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSave} data-testid="btn-save-shift">
              Lưu ca làm việc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
