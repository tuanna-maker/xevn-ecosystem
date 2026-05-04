import React, { useState } from 'react';
import { 
  X, Briefcase, MapPin, Users, DollarSign, Calendar, 
  AlertCircle, FileText, CheckCircle2, Gift, Edit3, 
  Globe, Clock, Building2, History, MessageSquare,
  ChevronRight, ArrowLeft
} from 'lucide-react';

interface JobPostingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: any;
}

export const JobPostingDetailModal: React.FC<JobPostingDetailModalProps> = ({ isOpen, onClose, jobData }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  // Use jobData or mock if not provided
  const data = jobData || {
    title: 'Kỹ sư phần mềm Backend',
    position: 'Senior Developer',
    department: 'Công nghệ thông tin',
    location: 'Hà Nội',
    type: 'Full-time',
    salary: '25,000,000 - 45,000,000 đ',
    deadline: '2025-05-15',
    headcount: 3,
    status: 'active',
    description: 'Chúng tôi đang tìm kiếm một Kỹ sư Backend tài năng để xây dựng hệ thống lõi...',
    requirements: '- Ít nhất 3 năm kinh nghiệm với Node.js/NestJS\n- Am hiểu về PostgreSQL, Redis\n- Có kinh nghiệm triển khai Microservices',
    benefits: '- Lương thưởng cạnh tranh\n- Bảo hiểm sức khỏe cao cấp\n- Lịch làm việc linh hoạt'
  };

  const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${color}`}>
      {children}
    </span>
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Left Sidebar: Quick Info */}
        <div className="w-80 bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-8">
           <div className="w-16 h-16 rounded-3xl bg-xevn-primary flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <Briefcase className="w-8 h-8" />
           </div>
           
           <div className="space-y-6">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                 <Badge color="bg-emerald-50 text-emerald-600 border-emerald-100">Đang tuyển dụng</Badge>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hạn nộp hồ sơ</p>
                 <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {data.deadline}
                 </div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chỉ tiêu</p>
                 <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <Users className="w-4 h-4 text-slate-400" />
                    {data.headcount} Nhân sự
                 </div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức lương</p>
                 <div className="flex items-center gap-2 text-sm font-black text-xevn-primary">
                    <DollarSign className="w-4 h-4" />
                    {data.salary}
                 </div>
              </div>
           </div>

           <div className="mt-auto space-y-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full h-11 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa tin
              </button>
              <button className="w-full h-11 rounded-2xl bg-slate-800 text-xs font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg">
                Dừng tuyển dụng
              </button>
           </div>
        </div>

        {/* Right Content: Main Details */}
        <div className="flex-1 flex flex-col min-w-0">
           {/* Header */}
           <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-black text-slate-800 leading-tight">{data.title}</h2>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                       <Building2 className="w-3.5 h-3.5" /> {data.department}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                       <MapPin className="w-3.5 h-3.5" /> {data.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                       <Clock className="w-3.5 h-3.5" /> {data.type}
                    </div>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
           </div>

           {/* Tabs and Content */}
           <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-10">
              <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-5 bg-xevn-primary rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Mô tả công việc</h3>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                    {data.description}
                 </p>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Yêu cầu ứng viên</h3>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                    {data.requirements}
                 </p>
              </section>

              <section className="space-y-4">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Quyền lợi</h3>
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                    {data.benefits}
                 </p>
              </section>

              {/* History/Timeline */}
              <section className="pt-10 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Lịch sử thay đổi</h3>
                    <button className="text-[10px] font-black text-xevn-primary uppercase tracking-widest flex items-center gap-1">
                       Xem tất cả <ChevronRight className="w-3 h-3" />
                    </button>
                 </div>
                 <div className="space-y-4">
                    {[1, 2].map((_, i) => (
                       <div key={i} className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                             <History className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-700">Cập nhật nội dung mô tả công việc</p>
                             <p className="text-[10px] text-slate-400 font-medium">Bởi Admin • 2 giờ trước</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};
