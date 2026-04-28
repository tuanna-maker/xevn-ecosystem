import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { ChevronDown, Check, Download, FileSpreadsheet, FileText } from 'lucide-react';

interface ContractExportModalProps {
  open: boolean;
  onClose: () => void;
  contracts: any[];
}

const EXPORT_COLUMNS = [
  { key: 'employee_code', label: 'Mã HĐ', checked: true },
  { key: 'employee_name', label: 'Tên nhân sự', checked: true },
  { key: 'department', label: 'Phòng ban', checked: true },
  { key: 'contract_type', label: 'Loại hợp đồng', checked: true },
  { key: 'effective_date', label: 'Ngày hiệu lực', checked: true },
  { key: 'expiry_date', label: 'Ngày hết hạn', checked: true },
  { key: 'status', label: 'Tình trạng', checked: true },
];

export const ContractExportModal: React.FC<ContractExportModalProps> = ({ open, onClose, contracts }) => {
  const [format, setFormat] = useState<'excel' | 'csv'>('excel');
  const [selectedColumns, setSelectedColumns] = useState(EXPORT_COLUMNS.map(c => c.key));
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchDept = filterDepartment === 'all' || c.department === filterDepartment;
      const matchStatus = filterStatus === 'all' || c.status === filterStatus;
      return matchDept && matchStatus;
    });
  }, [contracts, filterDepartment, filterStatus]);

  const departments = useMemo(() => ['all', ...new Set(contracts.map(c => c.department).filter(Boolean))], [contracts]);
  const statuses = useMemo(() => ['all', ...new Set(contracts.map(c => c.status).filter(Boolean))], [contracts]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const columns = EXPORT_COLUMNS.filter(c => selectedColumns.includes(c.key));
      const header = columns.map(c => c.label);
      const data = filteredContracts.map(c => columns.map(col => c[col.key] || ''));

      let blob: Blob;
      let filename = `Danh_sach_hop_dong_${new Date().toISOString().slice(0, 10)}`;

      if (format === 'excel') {
        const htmlTable = `
          <table border="1">
            <thead>
              <tr style="background-color: #0047FF; color: white; font-weight: bold;">
                ${header.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
        blob = new Blob(['\ufeff' + htmlTable], { type: 'application/vnd.ms-excel' });
        filename += '.xls';
      } else {
        const csvContent = [header.join(','), ...data.map(row => row.join(','))].join('\n');
        blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        filename += '.csv';
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">Xuất dữ liệu hợp đồng</span>
          <span className="text-[11px] font-medium text-slate-400">Tùy chỉnh định dạng và dữ liệu tải về</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs font-bold text-slate-400">
            Tổng cộng: <span className="text-xevn-primary">{filteredContracts.length}</span> hợp đồng
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Hủy bỏ</button>
            <button 
              onClick={handleExport}
              disabled={isExporting || filteredContracts.length === 0}
              className="px-10 h-10 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-100 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Đang xử lý...' : 'Tải xuống ngay'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo phòng ban</label>
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full h-10 rounded-full border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-xevn-primary transition-all appearance-none outline-none"
            >
              {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'Tất cả phòng ban' : d}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Lọc theo trạng thái</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full h-10 rounded-full border border-slate-200 bg-slate-50/50 px-4 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-xevn-primary transition-all appearance-none outline-none"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'Tất cả trạng thái' : s}</option>)}
            </select>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Định dạng file</label>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setFormat('excel')}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${format === 'excel' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${format === 'excel' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className={`text-sm font-black ${format === 'excel' ? 'text-emerald-700' : 'text-slate-700'}`}>Microsoft Excel</div>
                <div className="text-[10px] font-bold text-slate-400">Định dạng .xls tương thích cao</div>
              </div>
            </button>
            <button 
              onClick={() => setFormat('csv')}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${format === 'csv' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${format === 'csv' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className={`text-sm font-black ${format === 'csv' ? 'text-blue-700' : 'text-slate-700'}`}>CSV UTF-8</div>
                <div className="text-[10px] font-bold text-slate-400">Dữ liệu thô phân cách bởi dấu phẩy</div>
              </div>
            </button>
          </div>
        </div>

        {/* Column Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Cột dữ liệu xuất ra</label>
            <button 
              onClick={() => setSelectedColumns(selectedColumns.length === EXPORT_COLUMNS.length ? [] : EXPORT_COLUMNS.map(c => c.key))}
              className="text-[10px] font-black text-xevn-primary uppercase tracking-wider hover:underline"
            >
              {selectedColumns.length === EXPORT_COLUMNS.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>
          <div className="p-4 rounded-[24px] bg-slate-50/50 border border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            {EXPORT_COLUMNS.map(col => (
              <label key={col.key} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => setSelectedIds(prev => prev.includes(col.key) ? prev.filter(k => k !== col.key) : [...prev, col.key])}
                    className="sr-only" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedColumns([...selectedColumns, col.key]);
                      else setSelectedColumns(selectedColumns.filter(k => k !== col.key));
                    }}
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedColumns.includes(col.key) ? 'bg-xevn-primary border-xevn-primary shadow-sm' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
                    {selectedColumns.includes(col.key) && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                  </div>
                </div>
                <span className={`text-[13px] font-bold transition-colors ${selectedColumns.includes(col.key) ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-500'}`}>{col.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </CenteredModal>
  );
};
