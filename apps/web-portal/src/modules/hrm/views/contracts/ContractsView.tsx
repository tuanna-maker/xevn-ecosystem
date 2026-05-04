import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { isSupabaseConfigured } from '../../../../integrations/supabase/client';
import { useGlobalFilter } from '../../../../contexts/GlobalFilterContext';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_TABLE_SHELL, HRM_MOCK_CONTRACTS } from '../../mock-data';
import { hrmDataProvider } from '../../data/hrmDataProvider';
import { CenteredModal } from '../shared/CenteredModal';
import { ContractFormModal } from './components/ContractFormModal';
import { ContractFilterModal } from './components/ContractFilterModal';
import { ContractExportModal } from './components/ContractExportModal';
import { ContractImportModal } from './components/ContractImportModal';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Clock,
  Briefcase,
  GraduationCap,
  Calendar,
  Edit3,
  CheckCircle2,
  Hash,
  User
} from 'lucide-react';

type ContractRow = {
  id: string;
  employee_name: string | null;
  employee_code: string | null;
  contract_type: string | null;
  department: string | null;
  status: string;
  effective_date: string | null;
  expiry_date: string | null;
};

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: FileText, color: 'text-blue-500' },
  { id: '1year', label: 'HĐ 1 năm', icon: FileText, color: 'text-indigo-500' },
  { id: '3year', label: 'HĐ 3 năm', icon: Briefcase, color: 'text-emerald-500' },
  { id: '6month', label: 'HĐ 6 tháng', icon: Clock, color: 'text-amber-500' },
  { id: 'intern', label: 'HĐ học việc', icon: GraduationCap, color: 'text-cyan-500' },
  { id: 'probation', label: 'HĐ thử việc', icon: Calendar, color: 'text-purple-500' },
];

export const ContractsView: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();
  const [contractsDb, setContractsDb] = useState<ContractRow[]>([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<ContractRow | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'files'>('info');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<ContractRow | null>(null);
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [activeModal, setActiveModal] = useState<'import' | 'export' | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterState, setFilterState] = useState({
    status: [] as string[],
    effective_from: '',
    effective_to: '',
    expiry_from: '',
    expiry_to: ''
  });

  const handleToggleFilterStatus = (status: string) => {
    setFilterState(prev => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status) 
        : [...prev.status, status]
    }));
  };

  const resetFilters = () => {
    setFilterState({
      status: [],
      effective_from: '',
      effective_to: '',
      expiry_from: '',
      expiry_to: ''
    });
  };

  // Mock counts
  const categoryCounts = useMemo(() => ({
    all: HRM_MOCK_CONTRACTS.length,
    '1year': 0,
    '3year': HRM_MOCK_CONTRACTS.filter(c => c.type.includes('36 tháng')).length,
    '6month': 0,
    'intern': 0,
    'probation': HRM_MOCK_CONTRACTS.filter(c => c.type.includes('thử việc')).length,
  }), []);

  useEffect(() => {
    const companyId = selectedCompany?.id && selectedCompany.id !== 'all' ? selectedCompany.id : null;
    let cancelled = false;

    (async () => {
      setContractsLoading(true);
      try {
        const rows = await hrmDataProvider.listContracts({
          companyId,
          limit: 200,
        });

        if (cancelled) return;

        if (rows && rows.length > 0) {
          setContractsDb(
            rows.map((row: any) => ({
              id: row.id,
              employee_name: row.employee_name ?? null,
              employee_code: row.employee_code ?? null,
              contract_type: row.contract_type ?? null,
              department: row.department_name ?? row.department ?? 'Chưa xác định',
              status: row.status ?? 'draft',
              effective_date: row.effective_date ?? null,
              expiry_date: row.expiry_date ?? null,
            }))
          );
        } else {
          // Fallback map mock data
          const mockMapped = HRM_MOCK_CONTRACTS.map((c) => ({
            id: c.id,
            employee_name: c.employee,
            employee_code: 'NV-' + c.id.split('-')[1],
            contract_type: c.type,
            department: 'Phòng ban chung',
            status: c.status === 'Hiệu lực' ? 'active' : c.status === 'Hết hạn — Gia hạn' ? 'expired' : 'draft',
            effective_date: c.start.split('/').reverse().join('-'), // "01/02/2024" -> "2024-02-01"
            expiry_date: c.end !== '—' ? c.end.split('/').reverse().join('-') : null,
          }));
          setContractsDb(mockMapped as any);
        }
      } catch (err) {
        console.error('Failed to load contracts', err);
        // Ensure mock is shown on error
        const mockMapped = HRM_MOCK_CONTRACTS.map((c) => ({
          id: c.id,
          employee_name: c.employee,
          employee_code: 'NV-' + c.id.split('-')[1],
          contract_type: c.type,
          department: 'Phòng ban chung',
          status: c.status === 'Hiệu lực' ? 'active' : c.status === 'Hết hạn — Gia hạn' ? 'expired' : 'draft',
          effective_date: c.start.split('/').reverse().join('-'), // "01/02/2024" -> "2024-02-01"
          expiry_date: c.end !== '—' ? c.end.split('/').reverse().join('-') : null,
        }));
        if (!cancelled) setContractsDb(mockMapped as any);
      } finally {
        if (!cancelled) setContractsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany?.id]);

  const openDetail = (row: ContractRow) => {
    setDetailRow(row);
    setDetailTab('info');
    setDetailOpen(true);
  };

  const openEdit = (row: ContractRow) => {
    setEditRow(row);
    setFormOpen(true);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredContracts.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Đã xóa thành công ${selectedIds.length} hợp đồng.`);
      setSelectedIds([]);
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveContract = (data: any) => {
    console.log('Saving contract:', data);
    // Refresh logic here
  };

  const filteredContracts = useMemo(() => {
    let result = contractsDb.map(c => ({
      ...c,
    }));

    if (searchQuery) {
      result = result.filter(c => 
        (c.employee_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (activeCategory !== 'all') {
      if (activeCategory === '3year') result = result.filter(c => c.contract_type?.includes('36 tháng'));
      if (activeCategory === 'probation') result = result.filter(c => c.contract_type?.toLowerCase().includes('thử việc'));
    }

    return result;
  }, [contractsDb, searchQuery, activeCategory]);

  const totalPages = Math.ceil(filteredContracts.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredContracts.slice(start, start + pageSize);
  }, [filteredContracts, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <div className="flex flex-col gap-5">
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
          Thêm hợp đồng
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mã HĐ, tên nhân sự..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium focus:bg-white focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
            />
          </div>
          <div className="relative">
            <button 
              ref={filterButtonRef}
              type="button" 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all shadow-sm ${filterOpen ? 'bg-xevn-primary border-xevn-primary text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary'}`} 
              title="Bộ lọc nâng cao"
            >
              <Filter className="h-4 w-4" />
            </button>

            {filterOpen && (
              <>
                <div className="fixed inset-0 z-[70]" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full right-0 mt-3 z-[80] animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-[320px] bg-white rounded-[32px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.18)] border border-slate-200 overflow-hidden">
                    <div className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-black text-slate-800 tracking-tight">BỘ LỌC NÂNG CAO</span>
                        <button onClick={resetFilters} className="text-[10px] font-black text-xevn-primary uppercase tracking-widest hover:underline">Thiết lập lại</button>
                      </div>

                      {/* Status */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tình trạng</label>
                        <div className="flex flex-wrap gap-2">
                          {['Chờ duyệt', 'Hiệu lực', 'Hết hạn'].map(s => {
                            const isSelected = filterState.status.includes(s);
                            return (
                              <button 
                                key={s} 
                                onClick={() => handleToggleFilterStatus(s)}
                                className={`px-5 py-2 rounded-full border text-[12px] font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-emerald-400 border-emerald-400 text-slate-900 shadow-md shadow-emerald-100' 
                                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Effective Date */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày hiệu lực</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <input 
                              type="date" 
                              value={filterState.effective_from}
                              onChange={(e) => setFilterState({...filterState, effective_from: e.target.value})}
                              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-xevn-primary focus:bg-white transition-all appearance-none" 
                            />
                          </div>
                          <div className="relative">
                            <input 
                              type="date" 
                              value={filterState.effective_to}
                              onChange={(e) => setFilterState({...filterState, effective_to: e.target.value})}
                              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-xevn-primary focus:bg-white transition-all appearance-none" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Expiry Date */}
                      <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày hết hạn</label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <input 
                              type="date" 
                              value={filterState.expiry_from}
                              onChange={(e) => setFilterState({...filterState, expiry_from: e.target.value})}
                              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-xevn-primary focus:bg-white transition-all appearance-none" 
                            />
                          </div>
                          <div className="relative">
                            <input 
                              type="date" 
                              value={filterState.expiry_to}
                              onChange={(e) => setFilterState({...filterState, expiry_to: e.target.value})}
                              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 text-[12px] font-bold text-slate-700 focus:outline-none focus:border-xevn-primary focus:bg-white transition-all appearance-none" 
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setFilterOpen(false)}
                        className="w-full h-11 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-100 hover:opacity-90 active:scale-95 transition-all mt-1"
                      >Áp dụng bộ lọc</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <button 
            type="button" 
            onClick={() => setActiveModal('export')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm" 
            title="Xuất danh sách"
          >
            <Download className="h-4 w-4" />
          </button>
          <button 
            type="button" 
            onClick={() => setActiveModal('import')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm" 
            title="Nhập dữ liệu"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button 
            type="button" 
            disabled={selectedIds.length === 0}
            onClick={() => setDeleteConfirmOpen(true)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all shadow-sm ${
              selectedIds.length > 0 
                ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100 animate-pulse' 
                : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
            }`} 
            title="Xóa mục đã chọn"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = categoryCounts[cat.id as keyof typeof categoryCounts] || 0;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-3 rounded-full border px-5 py-2 text-sm font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'border-xevn-primary bg-xevn-primary/5 text-xevn-primary shadow-sm' 
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <cat.icon className={`h-4 w-4 ${isActive ? 'text-xevn-primary' : 'text-slate-400'}`} />
              <span>{cat.label}</span>
              {count > 0 && (
                <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-xevn-primary text-white' : 'bg-slate-100 text-slate-500 font-bold'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Table */}
      <Card className="p-0 overflow-hidden border border-slate-100 bg-white shadow-xl shadow-slate-200/40 rounded-[24px]">
        <div className="overflow-x-auto">
          <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="w-12 px-6 py-4">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                    className="w-4 h-4 rounded border-slate-300 text-xevn-primary focus:ring-xevn-primary transition-all cursor-pointer" 
                  />
                </th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Mã HĐ</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên nhân sự</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Phòng ban</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Loại hợp đồng</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày hiệu lực</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày hết hạn</th>
                <th className="px-4 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Tình trạng</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const isSelected = selectedIds.includes(row.id);
                  return (
                    <tr key={row.id} className={`hover:bg-blue-50/20 transition-colors group ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(row.id)}
                          className="w-4 h-4 rounded border-slate-300 text-xevn-primary focus:ring-xevn-primary transition-all cursor-pointer" 
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button 
                          type="button" 
                          className="font-mono text-sm font-black text-xevn-primary hover:underline"
                          onClick={() => openDetail(row as any)}
                        >
                          {row.employee_code}
                        </button>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-black text-slate-700">{row.employee_name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">
                          {row.department}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-slate-600">{row.contract_type}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-slate-400">{row.effective_date}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-slate-400">{row.expiry_date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {(() => {
                          const s = row.status;
                          const statusConfig: Record<string, { label: string; color: string }> = {
                            active: { label: 'Hiệu lực', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                            draft: { label: 'Dự thảo', color: 'bg-slate-50 text-slate-500 border-slate-200' },
                            expired: { label: 'Hết hạn', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                          };
                          
                          const config = statusConfig[s] || { label: s, color: 'bg-slate-50 text-slate-600 border-slate-200' };
                          
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border shadow-sm ${config.color}`}>
                              {config.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-xevn-primary hover:bg-white hover:shadow-md rounded-full transition-all active:scale-90"
                            title="Sửa"
                            onClick={() => openEdit(row as any)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-full transition-all active:scale-90"
                            title="Xóa"
                            onClick={() => {
                              setSelectedIds([row.id]);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <FileText className="h-8 w-8" />
                      </div>
                      <div className="text-sm font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu hợp đồng</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-6 py-4">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Hiển thị {filteredContracts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredContracts.length)} trong số {filteredContracts.length} bản ghi
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-black text-slate-500 min-w-[60px] text-center">{currentPage} / {Math.max(1, totalPages)}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-40 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* --- REFACTORED MODALS --- */}
      
      {/* Delete Confirmation Modal */}
      <CenteredModal
        open={deleteConfirmOpen}
        title={
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-lg font-black tracking-tight">Xác nhận xóa</span>
          </div>
        }
        onClose={() => setDeleteConfirmOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button 
              className="px-8 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              onClick={() => setDeleteConfirmOpen(false)}
            >Hủy bỏ</button>
            <button 
              disabled={isDeleting}
              onClick={handleBulkDelete}
              className="px-10 h-10 rounded-full bg-red-600 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <Trash2 className="w-4 h-4" />}
              {isDeleting ? 'Đang xóa...' : 'Đồng ý xóa'}
            </button>
          </div>
        }
      >
        <div className="py-4 space-y-4">
          <p className="text-slate-600 font-bold leading-relaxed">
            Bạn có chắc chắn muốn xóa <span className="text-red-600 underline decoration-2">{selectedIds.length} hợp đồng</span> đã chọn? 
          </p>
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-500 shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-amber-700 font-bold leading-relaxed">
              Lưu ý: Dữ liệu sau khi xóa sẽ được chuyển vào Thùng rác và có thể khôi phục lại trong vòng 30 ngày. Sau thời gian này, dữ liệu sẽ bị xóa vĩnh viễn.
            </p>
          </div>
        </div>
      </CenteredModal>

      <ContractFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditRow(null);
        }}
        onSave={handleSaveContract}
        initialData={editRow}
      />

      <ContractExportModal
        open={activeModal === 'export'}
        onClose={() => setActiveModal(null)}
        contracts={filteredContracts}
      />

      <ContractImportModal
        open={activeModal === 'import'}
        onClose={() => setActiveModal(null)}
        onImport={(d) => console.log('Imported:', d)}
      />

      <CenteredModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        className="max-w-2xl"
        title={
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 leading-tight">Chi tiết hợp đồng</span>
            <span className="text-[11px] font-medium text-slate-400">Mã HĐ: {detailRow?.employee_code}</span>
          </div>
        }
        footer={
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="inline-flex h-11 items-center px-10 rounded-full bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
              onClick={() => setDetailOpen(false)}
            >
              Đóng lại
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-50 rounded-full border border-slate-100">
            <button 
              onClick={() => setDetailTab('info')}
              className={`flex-1 h-9 rounded-full text-xs font-bold transition-all ${detailTab === 'info' ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Thông tin chung
            </button>
            <button 
              onClick={() => setDetailTab('files')}
              className={`flex-1 h-9 rounded-full text-xs font-bold transition-all ${detailTab === 'files' ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Hồ sơ đính kèm
            </button>
          </div>

          {detailTab === 'info' ? (
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 px-2 py-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã hợp đồng</p>
                <p className="text-sm font-bold text-slate-700">{detailRow?.employee_code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên nhân sự</p>
                <p className="text-sm font-bold text-slate-700">{detailRow?.employee_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại hợp đồng</p>
                <p className="text-sm font-bold text-slate-700">{detailRow?.contract_type}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng ban</p>
                <p className="text-sm font-bold text-slate-700">{detailRow?.department}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày hiệu lực</p>
                <p className="text-sm font-bold text-slate-700">{detailRow?.effective_date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày hết hạn</p>
                <p className="text-sm font-bold text-slate-700">{detailRow?.expiry_date || '---'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 px-2 py-2">
              <div className="p-4 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-xevn-primary/20 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">Hop_dong_lao_dong.pdf</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PDF • 2.4 MB • 12/04/2024</p>
                  </div>
                </div>
                <button className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-xevn-primary transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {detailRow && (
            <div className="p-5 rounded-[24px] bg-blue-50/50 border border-blue-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs text-blue-800 leading-relaxed font-bold">
                Hợp đồng này hiện đang ở trạng thái <span className="underline decoration-2">{detailRow.status}</span>. Mọi thay đổi về thông tin nhân sự sẽ được tự động đồng bộ hóa với hồ sơ gốc của nhân viên.
              </p>
            </div>
          )}
        </div>
      </CenteredModal>
    </div>
  );
};
