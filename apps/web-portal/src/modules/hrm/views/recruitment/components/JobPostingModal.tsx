import React from 'react';
import { X, Briefcase, MapPin, Users, DollarSign, Calendar, AlertCircle, FileText, CheckCircle2, Gift } from 'lucide-react';

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobPostingModal: React.FC<JobPostingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const inputClass = "w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/30 px-4 text-sm font-bold text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary focus:bg-white transition-all placeholder:text-slate-300";
  const selectClass = "w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/30 px-4 text-sm font-bold text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary focus:bg-white transition-all appearance-none";
  const textareaClass = "w-full rounded-2xl border border-slate-200 bg-slate-50/30 p-4 text-sm font-medium text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary focus:bg-white transition-all min-h-[120px] resize-none";

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
            <div className="w-10 h-10 rounded-xl bg-xevn-primary flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Tạo tin tuyển dụng mới</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Cung cấp thông tin chi tiết để thu hút ứng viên</p>
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
              <div className="w-1.5 h-4 bg-xevn-primary rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Thông tin cơ bản</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Tiêu đề <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="VD: Lập trình viên Frontend Senior"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Vị trí <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="VD: Frontend Developer"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Phòng ban</label>
                  <input 
                    type="text" 
                    placeholder="VD: Phòng Kỹ thuật"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Loại hình <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <select className={selectClass}>
                      <option>Toàn thời gian</option>
                      <option>Bán thời gian</option>
                      <option>Thực tập</option>
                      <option>Freelance</option>
                    </select>
                    <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Địa điểm</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="VD: Hà Nội"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Số lượng <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    defaultValue={1}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Lương tối thiểu (VNĐ)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-300">$</span>
                    <input 
                      type="text" 
                      placeholder="VD: 15000000"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Lương tối đa (VNĐ)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-300">$</span>
                    <input 
                      type="text" 
                      placeholder="VD: 25000000"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Hạn nộp hồ sơ</label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                    <input 
                      type="date" 
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Độ ưu tiên</label>
                  <div className="relative">
                    <select className={selectClass} defaultValue="Trung bình">
                      <option>Thấp</option>
                      <option>Trung bình</option>
                      <option>Cao</option>
                      <option>Khẩn cấp</option>
                    </select>
                    <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">Trạng thái</label>
                  <div className="relative">
                    <select className={selectClass} defaultValue="Công khai">
                      <option>Nháp</option>
                      <option>Công khai</option>
                      <option>Tạm dừng</option>
                    </select>
                    <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Chi tiết công việc */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">Chi tiết công việc</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">
                  <FileText className="w-3.5 h-3.5" /> Mô tả công việc
                </label>
                <textarea 
                  placeholder="Mô tả chi tiết về công việc..."
                  className={textareaClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Yêu cầu ứng viên
                </label>
                <textarea 
                  placeholder="Kinh nghiệm, kỹ năng yêu cầu..."
                  className={textareaClass}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">
                  <Gift className="w-3.5 h-3.5" /> Quyền lợi
                </label>
                <textarea 
                  placeholder="Bảo hiểm, nghỉ phép, thưởng..."
                  className={textareaClass}
                />
              </div>
            </div>
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
          <button className="px-10 py-2.5 rounded-full bg-xevn-primary text-[13px] font-black text-white shadow-lg shadow-blue-200 transition active:scale-95 hover:opacity-90">
            Tạo tin tuyển dụng
          </button>
        </div>
      </div>
    </div>
  );
};
