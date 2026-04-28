import React, { useState } from 'react';
import { CenteredModal } from '../../shared/CenteredModal';
import { 
  FileText, 
  User, 
  Calendar, 
  Briefcase, 
  Hash,
  X,
  Signature,
  FileUp,
  Tag,
  PenTool,
  Clock,
  ChevronRight,
  Download,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DecisionDetailModalProps {
  open: boolean;
  onClose: () => void;
  data: any;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({ 
  open, 
  onClose, 
  data 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'content' | 'attachments'>('profile');

  if (!data) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Đã ban hành':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Chờ phê duyệt':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Dự thảo':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <CenteredModal
      open={open}
      title={
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">Chi tiết quyết định</span>
          <span className="text-[11px] font-medium text-slate-400">Xem hồ sơ văn bản pháp lý nhân sự</span>
        </div>
      }
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-full bg-xevn-primary px-6 text-sm font-bold text-white shadow-md shadow-blue-200 hover:opacity-90 transition-all active:scale-95"
            onClick={() => window.open(`/hr/decisions/${data.id}`, '_blank')}
          >
            <Download className="h-4 w-4" />
            Tải văn bản
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[28px] text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-white/10 border-white/20`}>
                {data.decision_type || 'Quyết định'}
              </span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(data.status)} bg-white shadow-sm`}>
                {data.status}
              </span>
            </div>
            <h3 className="text-xl font-black mb-1 leading-tight">{data.title || 'Chưa có tiêu đề'}</h3>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-mono font-bold text-blue-300">{data.decision_number || '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Hiệu lực: {data.effective_date || '—'}</span>
              </div>
            </div>
          </div>
          {/* Abstract pattern bg */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center p-1 bg-slate-100 rounded-full w-fit">
          {[
            { id: 'profile', label: 'Thông tin chung', icon: Info },
            { id: 'content', label: 'Nội dung', icon: FileText },
            { id: 'attachments', label: 'Đính kèm', icon: FileUp },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-6 h-8 rounded-full text-xs font-bold transition-all ${
                activeTab === t.id ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Nhân sự áp dụng</p>
                      <p className="text-sm font-bold text-slate-700">{data.employee_name || '—'}</p>
                      <p className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">{data.employee_id || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Phòng ban / Chức vụ</p>
                      <p className="text-sm font-bold text-slate-700">{data.department || '—'}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{data.position || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-l border-slate-100 pl-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <PenTool className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Người ký duyệt</p>
                      <p className="text-sm font-bold text-slate-700">{data.signer_name || '—'}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{data.signer_position || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Signature className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Ngày ban hành</p>
                      <p className="text-sm font-bold text-slate-700">{data.signing_date || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-[20px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Ngày hết hiệu lực:</span>
                  <span className="text-xs font-black text-slate-700">{data.expiry_date || 'Vô thời hạn'}</span>
                </div>
                <button className="text-xs font-bold text-xevn-primary flex items-center gap-1 hover:underline">
                  Xem lịch sử thay đổi <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="animate-in fade-in duration-300">
              <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung quyết định</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {data.content || 'Nội dung đang được cập nhật hoặc xem toàn văn trong tệp đính kèm.'}
                </p>
                {data.note && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ghi chú</span>
                    <p className="text-sm text-slate-500 italic">{data.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="animate-in fade-in duration-300 space-y-3">
              {[
                { name: 'Quyet_dinh_bo_nhiem.pdf', size: '2.4 MB', type: 'PDF' },
                { name: 'Phu_luc_01.docx', size: '1.1 MB', type: 'DOCX' },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[20px] hover:border-xevn-primary/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                      <FileUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{file.name}</p>
                      <p className="text-[11px] font-medium text-slate-400">{file.size} • {file.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400" title="Xem trước">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-400" title="Tải xuống">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-slate-300 italic text-sm">
                Không có tệp tin nào khác
              </div>
            </div>
          )}
        </div>
      </div>
    </CenteredModal>
  );
};
