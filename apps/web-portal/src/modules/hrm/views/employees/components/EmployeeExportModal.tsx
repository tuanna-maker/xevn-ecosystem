import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { ChevronDown, Check, Download } from 'lucide-react';

interface EmployeeExportModalProps {
  open: boolean;
  onClose: () => void;
  employees: any[];
}

const EXPORT_COLUMNS = [
  'STT', 'Mã nhân viên', 'Họ và tên', 'Email', 
  'Số điện thoại', 'Phòng ban', 'Chức vụ', 'Ngày vào làm', 
  'Trạng thái', 'Lương cơ bản', 'Giới tính', 'Ngày sinh',
  'Số CMND/CCCD', 'Địa chỉ thường trú', 'Ngân hàng',
  'Số tài khoản', 'Quản lý trực tiếp'
];

const DEPARTMENTS = [
  'Ban Giám đốc', 'Phòng Kinh doanh', 'Phòng Điều phối', 
  'Phòng Bảo trì', 'Phòng Nhân sự', 'Phòng Kế toán', 'Phòng Kỹ thuật'
];

export const EmployeeExportModal: React.FC<EmployeeExportModalProps> = ({ open, onClose, employees }) => {
  const [selectedDept, setSelectedDept] = useState('Tất cả phòng ban');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [openDept, setOpenDept] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [loading, setLoading] = useState(false);

  // Initial selected columns: index 0 to 8
  const [selectedColumns, setSelectedColumns] = useState<string[]>(EXPORT_COLUMNS.slice(0, 9));

  // Actual filtering logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchDept = selectedDept === 'Tất cả phòng ban' || e.department === selectedDept;
      const matchStatus = selectedStatus === 'Tất cả trạng thái' || 
                         (selectedStatus === 'Đang làm việc' && e.status === 'active') ||
                         (selectedStatus === 'Đã thôi việc' && e.status === 'inactive') ||
                         (selectedStatus === 'Thực tập/Thử việc' && e.status === 'probation');
      return matchDept && matchStatus;
    });
  }, [employees, selectedDept, selectedStatus]);

  const handleToggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleSelectAll = () => setSelectedColumns([...EXPORT_COLUMNS]);
  const handleDeselectAll = () => setSelectedColumns([]);

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      alert('Vui lòng chọn ít nhất một cột để xuất dữ liệu.');
      return;
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      let blob: Blob;
      let extension: string;
      
      if (fileFormat === 'xlsx') {
        // Create an HTML table for "fake" Excel download - Excel opens this perfectly
        const tableHtml = `
          <table border="1">
            <thead>
              <tr style="background-color: #0047FF; color: #FFFFFF; font-weight: bold;">
                ${selectedColumns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees.map((e, idx) => `
                <tr>
                  ${selectedColumns.map(col => {
                    let val = '';
                    if (col === 'STT') val = String(idx + 1);
                    else if (col === 'Mã nhân viên') val = e.code || '';
                    else if (col === 'Họ và tên') val = e.fullName || '';
                    else if (col === 'Trạng thái') val = e.status === 'active' ? 'Đang làm việc' : 'Đã thôi việc';
                    else val = String(e[col] || '');
                    return `<td>${val}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
        extension = 'xls'; // Using .xls for HTML tables
      } else {
        const header = selectedColumns.join(',');
        const rows = filteredEmployees.map((e, idx) => 
          selectedColumns.map(col => {
            let val = '';
            if (col === 'STT') val = String(idx + 1);
            else if (col === 'Mã nhân viên') val = e.code || '';
            else if (col === 'Họ và tên') val = e.fullName || '';
            else val = String(e[col] || '');
            return `"${val}"`;
          }).join(',')
        ).join('\n');
        blob = new Blob([`\ufeff${header}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
        extension = 'csv';
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `danh_sach_nhan_vien_${new Date().getTime()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert(`Đã tải xuống danh sách ${filteredEmployees.length} nhân viên.`);
      onClose();
    } catch (error) {
      alert('Xuất file thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredModal 
      open={open} 
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">Xuất danh sách nhân viên</span>
          <span className="text-[11px] font-medium text-slate-400">Tùy chỉnh thông tin và định dạng file xuất</span>
        </div>
      } 
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button 
            className="px-8 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            onClick={onClose}
          >Hủy</button>
          <button 
            disabled={loading}
            onClick={handleExport}
            className="flex items-center gap-2 px-10 h-10 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-200 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {loading ? 'Đang xuất...' : 'Xuất file'}
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* SECTION 1: BỘ LỌC DỮ LIỆU */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-3.5 bg-xevn-primary rounded-full" />
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Bộ lọc dữ liệu</div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Phòng ban</div>
              <div className="relative">
                <button 
                  onClick={() => { setOpenDept(!openDept); setOpenStatus(false); }}
                  className="w-full h-10 px-5 flex items-center justify-between rounded-full border border-slate-200 bg-white text-sm hover:bg-slate-50 shadow-sm transition-all text-slate-600 font-bold"
                >
                  <span className="truncate">{selectedDept}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openDept ? 'rotate-180' : ''}`} />
                </button>
                {openDept && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenDept(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-[20px] shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      <div className="max-h-[160px] overflow-y-auto">
                        <button 
                          onClick={() => { setSelectedDept('Tất cả phòng ban'); setOpenDept(false); }}
                          className={`w-full px-5 py-2 text-left text-sm font-bold transition-colors flex items-center justify-between ${selectedDept === 'Tất cả phòng ban' ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          Tất cả phòng ban
                          {selectedDept === 'Tất cả phòng ban' && <Check className="w-4 h-4" />}
                        </button>
                        {DEPARTMENTS.map(d => (
                          <button 
                            key={d}
                            onClick={() => { setSelectedDept(d); setOpenDept(false); }}
                            className={`w-full px-5 py-2 text-left text-sm font-bold transition-colors flex items-center justify-between ${selectedDept === d ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            {d}
                            {selectedDept === d && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Trạng thái</div>
              <div className="relative">
                <button 
                  onClick={() => { setOpenStatus(!openStatus); setOpenDept(false); }}
                  className="w-full h-10 px-5 flex items-center justify-between rounded-full border border-slate-200 bg-white text-sm hover:bg-slate-50 shadow-sm transition-all text-slate-600 font-bold"
                >
                  <span className="truncate">{selectedStatus}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openStatus ? 'rotate-180' : ''}`} />
                </button>
                {openStatus && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenStatus(false)} />
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-[20px] shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      {['Tất cả trạng thái', 'Đang làm việc', 'Đã thôi việc', 'Thực tập/Thử việc'].map(s => (
                        <button 
                          key={s}
                          onClick={() => { setSelectedStatus(s); setOpenStatus(false); }}
                          className={`w-full px-5 py-2 text-left text-sm font-bold transition-colors flex items-center justify-between ${selectedStatus === s ? 'bg-xevn-primary/5 text-xevn-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {s}
                          {selectedStatus === s && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="inline-flex px-4 py-1.5 bg-xevn-primary/5 rounded-full border border-xevn-primary/10">
            <div className="text-[10px] font-bold text-xevn-primary uppercase tracking-wider">
              Số nhân viên sẽ xuất: <span className="font-black underline decoration-2 underline-offset-2">{filteredEmployees.length}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CHỌN CỘT XUẤT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-3.5 bg-xevn-primary rounded-full" />
              <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Chọn cột xuất ({selectedColumns.length}/{EXPORT_COLUMNS.length})</div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleSelectAll}
                className="text-[10px] font-bold text-xevn-primary uppercase tracking-wider hover:underline"
              >Chọn tất cả</button>
              <button 
                onClick={handleDeselectAll}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:underline"
              >Bỏ chọn</button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-y-3 gap-x-6 bg-slate-50/50 p-6 rounded-[24px] border border-slate-200/60 shadow-inner">
            {EXPORT_COLUMNS.map(col => {
              const isSelected = selectedColumns.includes(col);
              return (
                <label key={col} className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => handleToggleColumn(col)}
                    className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center shadow-sm ${
                      isSelected ? 'border-xevn-primary bg-xevn-primary text-white' : 'border-slate-200 bg-white group-hover:border-xevn-primary'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`text-[13px] font-bold transition-colors ${isSelected ? 'text-slate-800' : 'text-slate-400 group-hover:text-xevn-primary'}`}>
                    {col}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: ĐỊNH DẠNG FILE */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-3.5 bg-xevn-primary rounded-full" />
            <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Định dạng file</div>
          </div>
          
          <div className="flex gap-10 pl-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="format" 
                className="hidden" 
                checked={fileFormat === 'xlsx'} 
                onChange={() => setFileFormat('xlsx')} 
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center p-1 transition-all ${fileFormat === 'xlsx' ? 'border-xevn-primary' : 'border-slate-300 bg-white group-hover:border-xevn-primary'}`}>
                {fileFormat === 'xlsx' && <div className="w-full h-full bg-xevn-primary rounded-full" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${fileFormat === 'xlsx' ? 'text-slate-800' : 'text-slate-500'}`}>Excel (.xlsx)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name="format" 
                className="hidden" 
                checked={fileFormat === 'csv'} 
                onChange={() => setFileFormat('csv')} 
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center p-1 transition-all ${fileFormat === 'csv' ? 'border-xevn-primary' : 'border-slate-300 bg-white group-hover:border-xevn-primary'}`}>
                {fileFormat === 'csv' && <div className="w-full h-full bg-xevn-primary rounded-full" />}
              </div>
              <span className={`text-sm font-bold transition-colors ${fileFormat === 'csv' ? 'text-slate-800' : 'text-slate-500'}`}>CSV (.csv)</span>
            </label>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
};
