import React from 'react';
import { X, User, Mail, Phone, Briefcase, Globe, Home, Heart, FileText, Calendar, Star, CheckCircle2, ChevronDown } from 'lucide-react';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const inputClass = "w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/30 px-4 text-sm font-bold text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300";
  const selectClass = "w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/30 px-4 text-sm font-bold text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-emerald-500 focus:bg-white transition-all appearance-none";
  const textareaClass = "w-full rounded-2xl border border-slate-200 bg-slate-50/30 p-4 text-sm font-medium text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-emerald-500 focus:bg-white transition-all min-h-[120px] resize-none";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Thêm ứng viên mới</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Quản lý hồ sơ ứng viên tiềm năng</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-8">
          {/* Section: Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Thông tin cơ bản</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Họ và tên <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Nguyễn Văn A"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Email <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="0912345678"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Vị trí ứng tuyển</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="VD: Frontend Developer"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Thông tin tuyển dụng */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Thông tin tuyển dụng</h4>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Nguồn tuyển dụng</label>
                <div className="relative">
                  <select className={selectClass}>
                    <option>Chọn nguồn</option>
                    <option>TopCV</option>
                    <option>LinkedIn</option>
                    <option>Referral</option>
                    <option>Facebook</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Trạng thái <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <select className={selectClass} defaultValue="Ứng tuyển">
                    <option>Ứng tuyển</option>
                    <option>Sàng lọc</option>
                    <option>Phỏng vấn</option>
                    <option>Đề xuất</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Đánh giá (1-5)</label>
                <div className="relative">
                  <Star className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
                  <input 
                    type="number" 
                    min="0" max="5" defaultValue="0"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Ngày ứng tuyển</label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Ngày có thể bắt đầu</label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="date" 
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Thông tin cá nhân */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Thông tin cá nhân</h4>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Quốc tịch</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="text" 
                    defaultValue="Việt Nam"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Quê quán</label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Nhập quê quán"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Tình trạng hôn nhân</label>
                <div className="relative">
                  <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  <select className={`${selectClass} pl-11`}>
                    <option>Chọn tình trạng</option>
                    <option>Độc thân</option>
                    <option>Đã kết hôn</option>
                    <option>Khác</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Ghi chú */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">
              <FileText className="w-3.5 h-3.5" /> Ghi chú
            </label>
            <textarea 
              placeholder="Ghi chú về ứng viên..."
              className={textareaClass}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-[13px] font-black text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
          >
            Hủy
          </button>
          <button className="px-10 py-2.5 rounded-full bg-emerald-500 text-[13px] font-black text-white shadow-lg shadow-emerald-100 transition active:scale-95 hover:opacity-90">
            Thêm ứng viên mới
          </button>
        </div>
      </div>
    </div>
  );
};
