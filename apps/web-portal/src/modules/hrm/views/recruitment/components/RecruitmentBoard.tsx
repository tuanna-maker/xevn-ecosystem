import React from 'react';
import { Card } from '../../../../../components/common';
import { 
  Plus, MoreHorizontal, User, 
  MapPin, Clock, MessageSquare,
  AlertCircle, Star, Layout
} from 'lucide-react';

const KANBAN_DATA = {
  'Ứng tuyển': [
    { id: '1', name: 'Nguyễn Văn An', position: 'Kỹ sư Backend', source: 'TopCV', date: '1 ngày trước' },
    { id: '2', name: 'Lê Thị Thảo', position: 'UI/UX Designer', source: 'LinkedIn', date: '2 giờ trước' },
  ],
  'Sàng lọc': [
    { id: '3', name: 'Trần Minh Tâm', position: 'Project Manager', source: 'Referral', date: '3 ngày trước' },
  ],
  'Phỏng vấn': [
    { id: '4', name: 'Phạm Hoàng Nam', position: 'Frontend Dev', source: 'Indeed', date: 'Hôm nay - 14:00' },
  ],
  'Đề xuất': [],
  'Đã tuyển': [
    { id: '5', name: 'Hoàng Anh Tuấn', position: 'CTO Assistant', source: 'Headhunt', date: 'Tuần trước' },
  ],
};

export const RecruitmentBoard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6 no-scrollbar min-h-[600px]">
      {Object.entries(KANBAN_DATA).map(([col, items], idx) => (
        <div key={idx} className="flex flex-col gap-4 min-w-[280px]">
          <div className="flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-xevn-primary" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{col}</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">{items.length}</span>
          </div>

          <div className="flex-1 space-y-3 p-1">
            {items.map((item) => (
              <Card key={item.id} className="p-4 border-slate-100 hover:shadow-lg hover:border-xevn-primary transition-all cursor-grab active:cursor-grabbing group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-black text-xs">
                    {item.name.split(' ').pop()?.[0]}
                  </div>
                  <button className="p-1 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
                
                <h5 className="text-[13px] font-black text-slate-800 mb-0.5 leading-tight">{item.name}</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.position}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock className="w-3 h-3" /> {item.date}
                  </div>
                  <div className="px-2 py-0.5 bg-slate-50 rounded text-[9px] font-black text-slate-400 border border-slate-100">
                    {item.source}
                  </div>
                </div>
              </Card>
            ))}
            
            <button className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-100 text-slate-300 hover:border-xevn-primary/30 hover:text-xevn-primary/50 hover:bg-blue-50/20 transition-all flex items-center justify-center gap-2 group">
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Thêm nhanh</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
