import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { isSupabaseConfigured } from '../../../../integrations/supabase/client';
import { useGlobalFilter } from '../../../../contexts/GlobalFilterContext';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_INSURANCE } from '../../mock-data';
import { hrmDataProvider } from '../../data/hrmDataProvider';
import { CenteredModal } from '../shared/CenteredModal';
import { InsuranceFormModal } from './components/InsuranceFormModal';
import { InsuranceDetailModal } from './components/InsuranceDetailModal';
import { DeleteConfirmModal } from '../shared/DeleteConfirmModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Heart, 
  Activity, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit3,
  Eye,
  FileText
} from 'lucide-react';

type InsuranceRow = {
  id: string;
  employee_name: string;
  employee_code?: string;
  department?: string;
  bhxh_number?: string;
  bhyt_number?: string;
  bhtn_number?: string;
  salary?: string;
  status: string;
  effective_date: string | null;
  insurance_type?: string;
};

export const InsuranceView: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();
  const [insuranceDb, setInsuranceDb] = useState<InsuranceRow[]>([]);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<InsuranceRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editRow, setEditRow] = useState<InsuranceRow | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filterOpen, setFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const companyId = selectedCompany?.id && selectedCompany.id !== 'all' ? selectedCompany.id : null;
    let cancelled = false;

    (async () => {
      setInsuranceLoading(true);
      try {
        const rows = await hrmDataProvider.listInsurance({
          companyId,
          limit: 200,
        });

        if (cancelled) return;

        if (rows && rows.length > 0) {
          setInsuranceDb(
            rows.map((row: any) => ({
              id: row.id,
              employee_name: row.employee_name ?? '—',
              employee_code: row.employee_code ?? ('NV-' + row.id.substring(0, 5)),
              department: row.department_name ?? row.department ?? 'HCNS',
              bhxh_number: row.bhxh_number ?? row.insurance_number ?? '—',
              bhyt_number: row.bhyt_number ?? '—',
              salary: row.salary_base ?? row.amount ?? 0,
              status: row.status ?? 'Đang hiệu lực',
              effective_date: row.effective_date ?? row.start_date ?? null,
            }))
          );
        } else {
          // Fallback to mock if API returns empty
          const mockMapped = HRM_MOCK_INSURANCE.map(i => ({
            id: i.id,
            employee_name: i.employee,
            employee_code: 'NV-' + i.id.split('-')[1],
            department: 'Phòng Kỹ thuật',
            bhxh_number: i.ref,
            bhyt_number: i.ref.replace('BHXH', 'BHYT'),
            salary: 15000000,
            status: i.sync === 'Đã nộp' || i.sync === 'Đồng bộ VSSID' ? 'Đang hiệu lực' : 'Tạm dừng',
            effective_date: '2024-01-01',
          }));
          setInsuranceDb(mockMapped as any);
        }
      } catch (err) {
        console.error('Failed to load insurance', err);
        // Ensure mock is shown on error
        if (!cancelled) setInsuranceDb(HRM_MOCK_INSURANCE as any);
      } finally {
        if (!cancelled) setInsuranceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany?.id]);

  const filteredData = useMemo(() => {
    let result = HRM_MOCK_INSURANCE.map(i => ({
      id: i.id,
      employee_name: i.employee,
      employee_code: 'NV-' + i.id.split('-')[1],
      department: 'Phòng HCNS',
      bhxh_number: i.ref,
      bhyt_number: 'BHYT-' + i.id.split('-')[1],
      salary: '8500000',
      status: i.sync === 'Đồng bộ VSSID' ? 'Đang hiệu lực' : 'Chờ xử lý',
      effective_date: i.period,
      insurance_type: i.regime
    }));

    if (searchQuery) {
      result = result.filter(i => 
        i.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.employee_code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab !== 'all') {
      if (activeTab === 'bhxh') result = result.filter(i => i.insurance_type?.includes('BHXH'));
      if (activeTab === 'bhyt') result = result.filter(i => i.insurance_type?.includes('BHYT'));
      if (activeTab === 'bhtn') result = result.filter(i => i.insurance_type?.includes('BHTN'));
    }

    return result;
  }, [searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const stats = useMemo(() => ({
    bhxh: filteredData.filter(i => i.insurance_type?.includes('BHXH')).length,
    bhyt: filteredData.filter(i => i.insurance_type?.includes('BHYT')).length,
    bhtn: filteredData.filter(i => i.insurance_type?.includes('BHTN')).length,
    total: filteredData.length
  }), [filteredData]);

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 1000));
    alert(`Đã xóa ${selectedIds.length} hồ sơ.`);
    setSelectedIds([]);
    setDeleteConfirmOpen(false);
    setIsDeleting(false);
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
          Thêm bảo hiểm
        </button>

        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-end">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm nhân viên, số sổ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-medium focus:bg-white focus:border-xevn-primary focus:outline-none focus:ring-4 focus:ring-xevn-primary/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm">
              <Download className="h-4 w-4" />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-xevn-primary hover:text-xevn-primary transition-all shadow-sm">
              <Upload className="h-4 w-4" />
            </button>
            {selectedIds.length > 0 && (
              <button 
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
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
          { label: 'Tổng BHXH', count: stats.bhxh, icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Tổng BHYT', count: stats.bhyt, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Tổng BHTN', count: stats.bhtn, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Tổng cộng', count: stats.total, icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
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
        <div className="p-4 border-b border-slate-50 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Tất cả', icon: FileText, count: stats.total },
            { id: 'bhxh', label: 'BHXH', icon: ShieldCheck, count: stats.bhxh },
            { id: 'bhyt', label: 'BHYT', icon: Heart, count: stats.bhyt },
            { id: 'bhtn', label: 'BHTN', icon: Activity, count: stats.bhtn },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 h-10 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2.5 border ${
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

        <DataTable
          columns={[
            { 
              key: 'selection', 
              header: <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])} checked={selectedIds.length === filteredData.length && filteredData.length > 0} className="rounded" />,
              render: (row: any) => <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => setSelectedIds(prev => prev.includes(row.id) ? prev.filter(i => i !== row.id) : [...prev, row.id])} className="rounded" />
            },
            { 
              key: 'employee_code', 
              header: 'Mã NV',
              render: (row: any) => <span className="font-mono text-[13px] font-bold text-xevn-primary">{row.employee_code}</span>
            },
            { 
              key: 'employee_name', 
              header: 'Tên nhân viên',
              render: (row: any) => (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-700">{row.employee_name}</span>
                  <span className="text-[10px] font-medium text-slate-400">{row.department}</span>
                </div>
              )
            },
            { key: 'bhxh_number', header: 'Số BHXH', render: (row: any) => <span className="font-mono text-[12px] font-medium">{row.bhxh_number}</span> },
            { 
              key: 'salary', 
              header: 'Lương đóng BH', 
              render: (row: any) => <span className="font-bold text-slate-600">{Number(row.salary).toLocaleString()} ₫</span> 
            },
            { 
              key: 'effective_date', 
              header: 'Kỳ áp dụng',
              render: (row: any) => <span className="text-[12px] font-bold text-slate-500">{row.effective_date}</span>
            },
            { 
              key: 'status', 
              header: 'Tình trạng',
              render: (row: any) => {
                const isEff = row.status === 'Đang hiệu lực';
                return (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${
                    isEff ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    <div className={`w-1 h-1 rounded-full mr-1.5 ${isEff ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {row.status}
                  </span>
                );
              }
            },
            {
              key: 'actions',
              header: '',
              render: (row: any) => (
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => { setDetailRow(row); setDetailOpen(true); }} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-xevn-primary transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditRow(row); setFormOpen(true); }} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-xevn-primary transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={insuranceLoading ? [] : paginatedData}
          emptyMessage={insuranceLoading ? 'Đang tải dữ liệu...' : 'Không có hồ sơ bảo hiểm'}
          className={SETTINGS_CONTROL_TEXT}
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

      {/* Modals */}
      <InsuranceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(d) => { console.log('Saved:', d); setFormOpen(false); }}
        initialData={editRow}
      />

      <InsuranceDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={detailRow}
      />

      <CenteredModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Xác nhận xóa"
        className="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteConfirmOpen(false)} className="px-6 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700">Hủy</button>
            <button 
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="px-8 h-10 rounded-full bg-red-500 text-sm font-bold text-white shadow-lg shadow-red-100 hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        }
      >
        <div className="p-2 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Trash2 className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-slate-800">Bạn có chắc chắn muốn xóa?</p>
            <p className="text-sm text-slate-500 mt-1">Đã chọn {selectedIds.length} hồ sơ bảo hiểm. Hành động này không thể hoàn tác.</p>
          </div>
        </div>
      </CenteredModal>
    </div>
  );
};
