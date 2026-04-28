import React, { useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { 
  FileText, 
  ShieldCheck, 
  Activity, 
  Clock, 
  CheckCircle2, 
  User, 
  Hash, 
  Building2, 
  Calendar,
  Heart,
  Briefcase,
  TrendingUp,
  Download
} from 'lucide-react';

interface InsuranceDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

export const InsuranceDetailModal: React.FC<InsuranceDetailModalProps> = ({ 
  open, 
  onClose, 
  data 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  if (!data) return null;

  return (
    <CenteredModal
      open={open}
      onClose={onClose}
      className="max-w-2xl"
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">Chi tiết hồ sơ bảo hiểm</span>
          <span className="text-[11px] font-medium text-slate-400">NV: {data.employee_name} • {data.employee_code || '---'}</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-end">
          <button
            type="button"
            className="inline-flex h-11 items-center px-10 rounded-full bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
            onClick={onClose}
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
            onClick={() => setActiveTab('info')}
            className={`flex-1 h-9 rounded-full text-xs font-bold transition-all ${activeTab === 'info' ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Thông tin hồ sơ
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 h-9 rounded-full text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Lịch sử biến động
          </button>
        </div>

        {activeTab === 'info' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 px-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã nhân viên</p>
                <p className="text-sm font-bold text-slate-700">{data.employee_code || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên nhân sự</p>
                <p className="text-sm font-bold text-slate-700">{data.employee_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng ban</p>
                <p className="text-sm font-bold text-slate-700">{data.department || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  data.status === 'Đang hiệu lực' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {data.status}
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số BHXH</p>
                </div>
                <p className="text-sm font-black text-slate-700 font-mono">{data.bhxh_number || '---'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số BHYT</p>
                </div>
                <p className="text-sm font-black text-slate-700 font-mono">{data.bhyt_number || '---'}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số BHTN</p>
                </div>
                <p className="text-sm font-black text-slate-700 font-mono">{data.bhtn_number || '---'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 px-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mức lương đóng BH</p>
                <p className="text-sm font-black text-xevn-primary">{Number(data.salary || 0).toLocaleString()} VND</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng tiền BH/tháng</p>
                <p className="text-sm font-black text-emerald-600">
                  {Math.round(Number(data.salary || 0) * 0.105).toLocaleString()} VND
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-xevn-primary/20 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700">Tăng mới lao động</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kỳ 04/2024 • Đã hoàn tất</p>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            
            <div className="p-5 rounded-[24px] bg-blue-50/50 border border-blue-100 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs text-blue-800 leading-relaxed font-bold">
                Mọi thay đổi về thông tin bảo hiểm được tự động đồng bộ hóa với hệ thống VSSID và Cổng dịch vụ công quốc gia.
              </p>
            </div>
          </div>
        )}
      </div>
    </CenteredModal>
  );
};
