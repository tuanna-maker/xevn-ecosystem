import React, { useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { Filter, Calendar, Check, RotateCcw } from 'lucide-react';

interface ContractFilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const ContractFilterModal: React.FC<ContractFilterModalProps> = ({ open, onClose, onApply }) => {
  const [filters, setFilters] = useState({
    status: [] as string[],
    effective_from: '',
    effective_to: '',
    expiry_from: '',
    expiry_to: '',
  });

  const statuses = [
    { id: 'draft', label: 'Chờ duyệt' },
    { id: 'active', label: 'Có hiệu lực' },
    { id: 'expired', label: 'Hết hạn' },
  ];

  const handleToggleStatus = (id: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(id) 
        ? prev.status.filter(s => s !== id) 
        : [...prev.status, id]
    }));
  };

  const handleReset = () => {
    setFilters({
      status: [],
      effective_from: '',
      effective_to: '',
      expiry_from: '',
      expiry_to: '',
    });
  };

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      className="max-w-xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xevn-primary">
            <Filter className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 tracking-tight">Bộ lọc nâng cao</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tối ưu hóa kết quả tìm kiếm</span>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-6 h-10 rounded-full text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Thiết lập lại
          </button>
          <button 
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            className="px-10 h-10 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-100 hover:opacity-90 active:scale-95 transition-all"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      }
    >
      <div className="space-y-8 py-2">
        {/* Status Selection */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tình trạng hợp đồng</label>
          <div className="flex flex-wrap gap-3">
            {statuses.map(s => {
              const isSelected = filters.status.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => handleToggleStatus(s.id)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    isSelected 
                      ? 'bg-xevn-primary border-xevn-primary text-white shadow-md shadow-blue-100 scale-[1.05]' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Effective Date Range */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày hiệu lực</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={filters.effective_from}
                onChange={(e) => setFilters({...filters, effective_from: e.target.value})}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-xevn-primary transition-all outline-none"
                placeholder="Từ ngày"
              />
              <span className="absolute -top-2 left-4 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase">Từ ngày</span>
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={filters.effective_to}
                onChange={(e) => setFilters({...filters, effective_to: e.target.value})}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-xevn-primary transition-all outline-none"
                placeholder="Đến ngày"
              />
              <span className="absolute -top-2 left-4 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase">Đến ngày</span>
            </div>
          </div>
        </div>

        {/* Expiry Date Range */}
        <div className="space-y-4">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày hết hạn</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={filters.expiry_from}
                onChange={(e) => setFilters({...filters, expiry_from: e.target.value})}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-xevn-primary transition-all outline-none"
                placeholder="Từ ngày"
              />
              <span className="absolute -top-2 left-4 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase">Từ ngày</span>
            </div>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={filters.expiry_to}
                onChange={(e) => setFilters({...filters, expiry_to: e.target.value})}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-xevn-primary transition-all outline-none"
                placeholder="Đến ngày"
              />
              <span className="absolute -top-2 left-4 px-1.5 bg-white text-[9px] font-black text-slate-400 uppercase">Đến ngày</span>
            </div>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
};
