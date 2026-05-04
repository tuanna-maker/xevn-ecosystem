import React, { useState } from 'react';
import { Card, DataTable } from '../../../../../components/common';
import { 
  Calendar as CalendarIcon, List, Search, Filter, 
  Download, RefreshCw, ChevronLeft, ChevronRight,
  User, MapPin, Clock, Video, MoreVertical, Eye,
  CheckCircle2, XCircle, AlertCircle, CalendarDays
} from 'lucide-react';
import { Pagination } from './Pagination';

type ViewMode = 'list' | 'calendar';

export const InterviewsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');

  const stats = [
    { label: 'Tổng phỏng vấn', val: 0, color: 'border-blue-500' },
    { label: 'Đã lên lịch', val: 0, color: 'border-amber-500' },
    { label: 'Hoàn thành', val: 0, color: 'border-emerald-500' },
    { label: 'Đạt phỏng vấn', val: 0, color: 'border-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-800">Quản lý lịch phỏng vấn</h3>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all">
            <Download className="w-3.5 h-3.5" />
            Xuất Excel
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <Card key={idx} className={`p-4 border-l-4 ${s.color} border-slate-100 shadow-soft`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-800">{s.val}</p>
          </Card>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-xevn-primary text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <List className="w-4 h-4" />
          Danh sách
        </button>
        <button 
          onClick={() => setViewMode('calendar')}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'calendar' ? 'bg-xevn-primary text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CalendarIcon className="w-4 h-4" />
          Lịch
        </button>
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="p-4 border-slate-100 rounded-[24px] bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo ứng viên, vị trí, người phỏng vấn..."
                  className="w-full h-11 rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-xs font-bold text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary transition-all"
                />
              </div>
              <select className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary min-w-[150px]">
                <option>Tất cả trạng thái</option>
              </select>
              <select className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary min-w-[130px]">
                <option>Tất cả loại</option>
              </select>
              <select className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary min-w-[130px]">
                <option>Tất cả kết quả</option>
              </select>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border border-slate-100 bg-white shadow-soft rounded-[32px]">
            <DataTable 
              columns={[
                { key: 'candidate', header: 'Ứng viên', render: (row: any) => <div className="text-[13px] font-black text-slate-700">{row.candidate}</div> },
                { key: 'position', header: 'Vị trí', render: (row: any) => <div className="text-[12px] font-bold text-slate-600">{row.position}</div> },
                { key: 'round', header: 'Vòng', render: (row: any) => <div className="text-[11px] font-black text-slate-500 uppercase">{row.round}</div> },
                { key: 'time', header: 'Ngày & Giờ', render: (row: any) => <div className="text-[12px] font-bold text-slate-600">{row.time}</div> },
                { key: 'type', header: 'Hình thức', render: (row: any) => <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">{row.type}</div> },
                { key: 'interviewer', header: 'Người phỏng vấn', render: (row: any) => <div className="text-[12px] font-bold text-slate-600">{row.interviewer}</div> },
                { key: 'status', header: 'Trạng thái', render: (row: any) => <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase">{row.status}</span> },
                { key: 'result', header: 'Kết quả', render: (row: any) => <span className="text-[11px] font-bold text-slate-400">---</span> },
                { 
                  key: 'actions', 
                  header: 'Thao tác', 
                  render: () => (
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-xevn-primary transition-all"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  )
                },
              ]}
              data={[]}
              emptyText="Đang tải..."
            />
            <Pagination 
              currentPage={1}
              totalPages={3}
              onPageChange={() => {}}
              totalItems={24}
              itemsPerPage={10}
            />
          </Card>
        </div>
      ) : (
        /* Calendar View */
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="p-4 border-slate-100 rounded-[24px] bg-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button className="px-5 py-2 rounded-xl bg-slate-50 text-xs font-black text-slate-600 hover:bg-slate-100 transition-all">
                  Hôm nay
                </button>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <h4 className="text-sm font-black text-slate-800">27/04 - 03/05/2026</h4>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-xl">
                <button 
                  onClick={() => setCalendarView('week')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${calendarView === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Tuần
                </button>
                <button 
                  onClick={() => setCalendarView('month')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all ${calendarView === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Tháng
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-t border-slate-200">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, idx) => (
                <div key={idx} className={`border-r border-slate-200 min-h-[400px] ${idx === 6 ? 'border-r-0' : ''} ${day === 'T4' ? 'bg-blue-50/60' : ''}`}>
                  <div className={`p-4 text-center border-b border-slate-200 ${day === 'T4' ? 'bg-blue-100/40' : 'bg-slate-50/50'}`}>
                    <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${day === 'T4' ? 'text-blue-600' : 'text-slate-500'}`}>{day}</p>
                    <p className={`text-base font-black ${day === 'T4' ? 'text-blue-700' : 'text-slate-800'}`}>
                      {27 + idx > 30 ? (27 + idx) - 30 : 27 + idx}
                    </p>
                  </div>
                  <div className="p-3 flex flex-col items-center justify-center h-[300px] text-center opacity-60">
                    <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Không có lịch</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center flex-wrap gap-x-8 gap-y-3 px-6 py-4 bg-slate-50/80 rounded-[20px] border border-slate-200">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-2">Chú thích:</span>
              {[
                { label: 'Đã Lên Lịch', color: 'bg-blue-500' },
                { label: 'Hoàn Thành', color: 'bg-emerald-500' },
                { label: 'Đã Hủy', color: 'bg-rose-500' },
                { label: 'Đổi Lịch', color: 'bg-amber-500' },
                { label: 'Vắng Mặt', color: 'bg-slate-500' },
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${l.color}`} />
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
