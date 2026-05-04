import React, { useState } from 'react';
import { Card } from '../../../../../components/common';
import { 
  ClipboardCheck, BarChart3, Users, 
  CheckCircle2, XCircle, Clock, 
  Search, Filter, Plus, FileText
} from 'lucide-react';
import { CompareCandidatesModal } from './CompareCandidatesModal';

export const EvaluationsView: React.FC = () => {
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">Đánh giá ứng viên</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Phân tích và so sánh năng lực hồ sơ</p>
        </div>
        <button 
          onClick={() => setIsCompareModalOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-blue-600 px-6 text-[13px] font-black text-white shadow-lg shadow-blue-200 transition active:scale-95 hover:opacity-90"
        >
          <BarChart3 className="w-4 h-4" />
          So sánh ứng viên
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng đánh giá', val: 0, icon: ClipboardCheck, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Đạt', val: 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Không đạt', val: 0, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Chờ xem xét', val: 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((s, idx) => (
          <Card key={idx} className="p-4 flex flex-col items-center gap-2 border-slate-100 text-center hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-800">{s.val}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-20 border border-slate-100 bg-white shadow-soft rounded-[32px] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
          <ClipboardCheck className="w-12 h-12" />
        </div>
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Chưa có đánh giá ứng viên nào</h4>
        <p className="text-xs font-bold text-slate-400 mt-2 max-w-xs">
          Đánh giá sẽ xuất hiện sau khi hoàn thành phỏng vấn. Bạn có thể sử dụng tính năng so sánh để đối chiếu các hồ sơ.
        </p>
        <button 
          onClick={() => setIsCompareModalOpen(true)}
          className="mt-8 inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 px-6 text-[12px] font-black text-slate-500 hover:bg-slate-50 transition-all"
        >
          <Plus className="w-4 h-4" />
          Thử so sánh mẫu
        </button>
      </Card>

      <CompareCandidatesModal 
        isOpen={isCompareModalOpen} 
        onClose={() => setIsCompareModalOpen(false)} 
      />
    </div>
  );
};
