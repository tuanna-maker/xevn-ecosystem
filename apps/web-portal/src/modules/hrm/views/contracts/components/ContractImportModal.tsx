import React, { useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { UploadCloud, FileText, Download, X, Check, AlertCircle } from 'lucide-react';

interface ContractImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

export const ContractImportModal: React.FC<ContractImportModalProps> = ({ open, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    // Simulate upload
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setTimeout(() => {
      onImport([]); // Pass imported data here
      onClose();
      setIsUploading(false);
      setFile(null);
      setUploadProgress(0);
    }, 500);
  };

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">Nhập hợp đồng từ Excel</span>
          <span className="text-[11px] font-medium text-slate-400">Tải lên file dữ liệu để nhập hàng loạt</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 h-10 rounded-full text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Hủy bỏ</button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-10 h-10 rounded-full bg-xevn-primary text-sm font-bold text-white shadow-lg shadow-blue-100 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            {isUploading ? `Đang xử lý ${uploadProgress}%` : 'Bắt đầu nhập dữ liệu'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Template Download */}
        <div className="p-5 rounded-[24px] bg-blue-50/50 border border-blue-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-700">File mẫu nhập liệu</div>
              <div className="text-[11px] font-bold text-slate-500">Tải file mẫu để nhập đúng định dạng hệ thống</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 h-9 rounded-full bg-white border border-blue-200 text-[11px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Tải file mẫu (.xlsx)
          </button>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div className="relative group">
            <div className="flex flex-col items-center justify-center py-12 px-8 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/30 transition-all group-hover:bg-white group-hover:border-xevn-primary/40 cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-xevn-primary group-hover:scale-110 transition-all duration-500 mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black text-slate-700">Kéo thả file hoặc click để chọn</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hỗ trợ: .xlsx, .xls, .csv (Tối đa 5MB)</p>
              </div>
            </div>
            <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx, .xls, .csv" />
          </div>
        ) : (
          <div className="p-6 rounded-[32px] bg-white border-2 border-xevn-primary/20 shadow-xl shadow-blue-100/50 flex items-center justify-between animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-xevn-primary">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-800 line-clamp-1">{file.name}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB • Sẵn sàng để nhập</div>
              </div>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Guidelines */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 ml-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lưu ý khi nhập liệu</span>
          </div>
          <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-xevn-primary mt-1.5 shrink-0" />
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed">Cột bắt buộc: Mã hợp đồng, Tên nhân viên, Loại hợp đồng</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-xevn-primary mt-1.5 shrink-0" />
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed">Loại HĐ: 1 năm, 3 năm, 6 tháng, học việc, thử việc</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-xevn-primary mt-1.5 shrink-0" />
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed">Định dạng ngày: DD/MM/YYYY (VD: 01/01/2024)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-xevn-primary mt-1.5 shrink-0" />
              <p className="text-[11px] font-bold text-slate-600 leading-relaxed">Trạng thái: active, pending, expired</p>
            </div>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
};
