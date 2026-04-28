import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { isSupabaseConfigured } from '../../../../integrations/supabase/client';
import { useGlobalFilter } from '../../../../contexts/GlobalFilterContext';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_DECISIONS } from '../../mock-data';
import { hrmDataProvider } from '../../data/hrmDataProvider';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  FileText, 
  UserPlus, 
  TrendingUp, 
  AlertTriangle,
  FileCheck,
  Briefcase,
  Award,
  ShieldAlert,
  History,
  XCircle,
  MoreVertical,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  PenTool,
  Tag
} from 'lucide-react';
import { DecisionFormModal } from './components/DecisionFormModal';
import { DecisionDetailModal } from './components/DecisionDetailModal';
import { DeleteConfirmModal } from '../shared/DeleteConfirmModal';

type DecisionRow = {
  id: string;
  decision_number: string;
  decision_date: string;
  decision_type: string;
  title: string;
  employee_name: string;
  employee_id: string;
  department: string;
  position: string;
  effective_date: string;
  expiry_date: string;
  signer_name: string;
  signer_position: string;
  signing_date: string;
  status: string;
  content: string;
  note: string;
};

export const DecisionsView: React.FC<{ openHrmApp: (path: string) => void }> = ({ openHrmApp }) => {
  const { selectedCompany } = useGlobalFilter();
  const [decisionsDb, setDecisionsDb] = useState<DecisionRow[]>([]);
  const [decisionsLoading, setDecisionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editRow, setEditRow] = useState<DecisionRow | null>(null);
  const [detailRow, setDetailRow] = useState<DecisionRow | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    tabsRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const companyId = selectedCompany?.id && selectedCompany.id !== 'all' ? selectedCompany.id : null;
    let cancelled = false;

    (async () => {
      setDecisionsLoading(true);
      try {
        const rows = await hrmDataProvider.listDecisions({
          companyId,
          limit: 200,
        });
        
        if (cancelled) return;
        
        if (rows && rows.length > 0) {
          setDecisionsDb(rows.map((row: any) => ({
            id: row.id,
            decision_number: row.decision_number ?? row.number ?? '—',
            decision_date: row.decision_date ?? row.date ?? '—',
            decision_type: row.decision_type ?? row.kind ?? '—',
            title: row.title ?? row.subject ?? '—',
            employee_name: row.employee_name ?? row.subject ?? '—',
            employee_id: row.employee_id ?? '—',
            department: row.department ?? '—',
            position: row.position ?? '—',
            effective_date: row.effective_date ?? row.date ?? '—',
            expiry_date: row.expiry_date ?? '—',
            signer_name: row.signer_name ?? '—',
            signer_position: row.signer_position ?? '—',
            signing_date: row.signing_date ?? '—',
            status: row.status ?? 'Dự thảo',
            content: row.content ?? '',
            note: row.note ?? ''
          })));
        } else {
           // Fallback to mock data if API returns empty/fails and we don't have real data yet
           setDecisionsDb(HRM_MOCK_DECISIONS as any);
        }
      } catch (err) {
        console.error('Failed to load decisions', err);
        if (!cancelled) setDecisionsDb(HRM_MOCK_DECISIONS as any);
      } finally {
        if (!cancelled) setDecisionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany?.id]);

  const filteredData = useMemo(() => {
    return decisionsDb.filter(d => {
      const matchesSearch = 
        d.decision_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.employee_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'all' || d.decision_type === activeTab;
      
      return matchesSearch && matchesTab;
    });
  }, [decisionsDb, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const stats = useMemo(() => {
    return {
      promotion: decisionsDb.filter(d => d.decision_type === 'Thăng chức').length,
      appointment: decisionsDb.filter(d => d.decision_type === 'Bổ nhiệm').length,
      discipline: decisionsDb.filter(d => d.decision_type === 'Kỷ luật').length,
      total: decisionsDb.length
    };
  }, [decisionsDb]);

  const handleSave = (data: any) => {
    if (editRow) {
      setDecisionsDb(prev => prev.map(d => d.id === editRow.id ? { ...d, ...data } : d));
    } else {
      const newRow = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setDecisionsDb(prev => [newRow, ...prev]);
    }
  };

  const handleBulkDelete = () => {
    setDecisionsDb(prev => prev.filter(d => !selectedIds.includes(d.id)));
    setSelectedIds([]);
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar - Simplified */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm mb-1">
        <button
          type="button"
          onClick={() => {
            setEditRow(null);
            setFormOpen(true);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-xevn-primary px-5 text-[13px] font-bold text-white shadow-md shadow-blue-200 transition active:scale-95 hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm quyết định
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm số QĐ, tiêu đề, nhân sự..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-[13px] font-medium focus:bg-white focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm">
              <Download className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm">
              <Upload className="h-4 w-4" />
            </button>
            {selectedIds.length > 0 && (
              <button 
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {[
          { label: 'Bổ nhiệm', count: stats.appointment, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Thăng chức', count: stats.promotion, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Kỷ luật', count: stats.discipline, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Tổng số QĐ', count: stats.total, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((s, idx) => (
          <div key={idx} className="p-2.5 bg-white rounded-[18px] border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} shrink-0`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">{s.label}</p>
              <p className="text-sm font-black text-slate-800 leading-none">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Table Container */}
      <Card className="p-0 overflow-hidden border border-slate-100 bg-white shadow-soft rounded-[32px]">
        <div className="relative group p-4 border-b border-slate-50">
          <div 
            ref={tabsRef}
            className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { id: 'all', label: 'Tất cả', icon: FileText, count: stats.total },
              { id: 'Bổ nhiệm', label: 'Bổ nhiệm', icon: Award, count: stats.appointment },
              { id: 'Thăng chức', label: 'Thăng chức', icon: TrendingUp, count: stats.promotion },
              { id: 'Điều chuyển', label: 'Điều chuyển', icon: Briefcase, count: decisionsDb.filter(d => d.decision_type === 'Điều chuyển').length },
              { id: 'Điều chỉnh lương', label: 'Điều chỉnh lương', icon: TrendingUp, count: decisionsDb.filter(d => d.decision_type === 'Điều chỉnh lương').length },
              { id: 'Khen thưởng', label: 'Khen thưởng', icon: Award, count: decisionsDb.filter(d => d.decision_type === 'Khen thưởng').length },
              { id: 'Kỷ luật', label: 'Kỷ luật', icon: ShieldAlert, count: stats.discipline },
              { id: 'Chấm dứt HĐLĐ', label: 'Chấm dứt', icon: XCircle, count: decisionsDb.filter(d => d.decision_type === 'Chấm dứt HĐLĐ').length },
              { id: 'Gia hạn HĐ', label: 'Gia hạn', icon: History, count: decisionsDb.filter(d => d.decision_type === 'Gia hạn HĐ').length },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 h-10 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2.5 border shrink-0 ${
                  activeTab === t.id 
                    ? 'bg-blue-50/50 border-xevn-primary text-xevn-primary' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <t.icon className={`w-3.5 h-3.5 ${activeTab === t.id ? 'text-xevn-primary' : 'text-slate-400'}`} />
                <span className={activeTab === t.id ? 'text-xevn-primary' : 'text-slate-600'}>{t.label}</span>
                <div className={`flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full text-[10px] font-black transition-all ${
                  activeTab === t.id ? 'bg-xevn-primary text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.count}
                </div>
              </button>
            ))}
          </div>

          {/* Arrow Navigation */}
          <button 
            onClick={() => scrollTabs('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 border border-slate-200 rounded-full shadow-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-xevn-primary z-10 scale-90 hover:scale-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scrollTabs('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 border border-slate-200 rounded-full shadow-lg text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-xevn-primary z-10 scale-90 hover:scale-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <DataTable
          columns={[
            {
              key: 'decision_number',
              header: 'Số QĐ',
              render: (row: DecisionRow) => (
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-xevn-primary">{row.decision_number}</span>
                  <span className="text-[10px] font-medium text-slate-400 mt-0.5">{row.decision_date}</span>
                </div>
              )
            },
            {
              key: 'type',
              header: 'Loại',
              render: (row: DecisionRow) => (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {row.decision_type}
                </span>
              )
            },
            {
              key: 'title',
              header: 'Tiêu đề',
              render: (row: DecisionRow) => (
                <div className="max-w-[200px] truncate">
                  <span className="text-sm font-bold text-slate-700">{row.title}</span>
                </div>
              )
            },
            {
              key: 'employee',
              header: 'Nhân viên',
              render: (row: DecisionRow) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                    {row.employee_name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{row.employee_name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{row.employee_id}</span>
                  </div>
                </div>
              )
            },
            {
              key: 'department',
              header: 'Phòng ban',
              render: (row: DecisionRow) => (
                <span className="text-[13px] font-medium text-slate-600">{row.department}</span>
              )
            },
            {
              key: 'effective_date',
              header: 'Ngày hiệu lực',
              render: (row: DecisionRow) => (
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[13px] font-medium">{row.effective_date}</span>
                </div>
              )
            },
            {
              key: 'status',
              header: 'Tình trạng',
              render: (row: DecisionRow) => {
                const s = row.status;
                const style = s === 'Đã ban hành' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                             s === 'Chờ phê duyệt' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             s === 'Dự thảo' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                             'bg-amber-50 text-amber-700 border-amber-100';
                return (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${style}`}>
                    {s === 'Đã ban hành' && <CheckCircle2 className="h-3 w-3" />}
                    {s === 'Chờ phê duyệt' && <Clock className="h-3 w-3" />}
                    {s}
                  </span>
                );
              }
            },
            {
              key: 'actions',
              header: 'Thao tác',
              render: (row: DecisionRow) => (
                <div className="flex items-center justify-end gap-1">
                  <button 
                    onClick={() => { setDetailRow(row); setDetailOpen(true); }}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-xevn-primary transition-all"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setEditRow(row); setFormOpen(true); }}
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-emerald-500 transition-all"
                  >
                    <PenTool className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setSelectedIds([row.id]); setDeleteConfirmOpen(true); }}
                    className="p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            }
          ]}
          data={decisionsLoading ? [] : paginatedData}
          onSelectionChange={(ids) => setSelectedIds(ids as string[])}
          emptyMessage={decisionsLoading ? 'Đang tải dữ liệu...' : 'Không tìm thấy quyết định nào'}
        />
        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-6 py-4">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị {filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} trong số {filteredData.length} bản ghi
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số hàng:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="h-8 rounded-full border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
              >
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:border-xevn-primary hover:text-xevn-primary transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-black text-slate-500 min-w-[60px] text-center">{currentPage} / {Math.max(1, totalPages)}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:border-xevn-primary hover:text-xevn-primary transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <DecisionFormModal 
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditRow(null); }}
        onSave={handleSave}
        initialData={editRow}
      />

      <DecisionDetailModal 
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetailRow(null); }}
        data={detailRow}
      />

      <DeleteConfirmModal 
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Xác nhận xóa quyết định"
        description={`Bạn có chắc chắn muốn xóa ${selectedIds.length} quyết định đã chọn? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
};

