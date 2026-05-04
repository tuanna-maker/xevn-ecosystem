import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-white border-t border-slate-100 rounded-b-[32px]">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          Hiển thị <span className="text-slate-500">{startItem} - {endItem}</span> trong số <span className="text-slate-500">{totalItems}</span> bản ghi
        </p>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Số hàng:</span>
          <div className="relative">
            <select 
              className="appearance-none h-8 pl-4 pr-8 rounded-full border border-slate-200 bg-white text-[11px] font-black text-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary transition-all cursor-pointer"
              defaultValue={itemsPerPage}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-xevn-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[12px] font-black text-slate-600 tracking-tight">
            {currentPage} / {totalPages}
          </span>

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-xevn-primary disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
