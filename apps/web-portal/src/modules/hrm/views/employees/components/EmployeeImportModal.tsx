import React from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { Download, Upload, FileSpreadsheet } from 'lucide-react';

interface EmployeeImportModalProps {
  open: boolean;
  onClose: () => void;
}

export const EmployeeImportModal: React.FC<EmployeeImportModalProps> = ({ open, onClose }) => {
  return (
    <CenteredModal 
      open={open} 
      title="Import nhân viên từ Excel" 
      onClose={onClose}
      className="max-w-3xl"
      footer={
        <div className="flex justify-end gap-3">
          <button 
            className="px-8 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            onClick={onClose}
          >Hủy</button>
          <button className="px-8 py-2.5 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-soft hover:opacity-90 active:scale-95 transition-all">Bắt đầu Import</button>
        </div>
      }
    >
      <div className="space-y-8 py-2">
        <div className="p-6 bg-xevn-primary/5 rounded-[32px] border border-xevn-primary/10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-xevn-primary flex items-center justify-center text-white shadow-lg shadow-xevn-primary/20">
              <Download className="w-7 h-7" />
            </div>
            <div>
              <div className="font-black text-slate-800 text-base">Tải file mẫu</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">Tải file Excel mẫu để biết định dạng dữ liệu cần nhập</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95">
            <FileSpreadsheet className="w-4 h-4" />
            Tải file mẫu (.xlsx)
          </button>
        </div>

        <div className="relative group">
          <div className="h-64 rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center transition-all group-hover:bg-slate-100/50 group-hover:border-xevn-primary/30 shadow-inner">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl mb-5 text-xevn-primary">
              <Upload className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <div className="font-black text-slate-700 text-lg">Kéo thả file hoặc click để chọn</div>
            <div className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-widest opacity-60">Hỗ trợ: .xlsx, .xls, .csv (tối đa 5MB)</div>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" />
          </div>
        </div>

        <div className="space-y-4 px-2">
          <div className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-1.5 h-5 bg-xevn-primary rounded-full" />
            Hướng dẫn quan trọng:
          </div>
          <ul className="space-y-3 text-sm text-slate-600 pl-4">
            {[
              'Tải file mẫu và điền thông tin nhân viên theo đúng định dạng các cột.',
              'Các cột bắt buộc: Mã NV, Họ và tên, Email, Phòng ban, Chức vụ, Ngày vào làm.',
              'Định dạng ngày tháng phải chuẩn: DD/MM/YYYY (VD: 28/04/2026).',
              'Trạng thái nhân viên chỉ được dùng: active, inactive, hoặc probation.'
            ].map((text, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-xevn-primary mt-2 shrink-0" />
                <span className="font-medium leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CenteredModal>
  );
};
