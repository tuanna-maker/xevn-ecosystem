import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, MapPin, Briefcase, Calendar, 
  FileText, Star, Edit3, MessageSquare, Download,
  CheckCircle2, Clock, Shield, Globe, Github, Linkedin,
  MoreVertical, ChevronRight, History
} from 'lucide-react';

interface CandidateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateData: any;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ isOpen, onClose, candidateData }) => {
  if (!isOpen) return null;

  const data = candidateData || {
    name: 'Nguyễn Văn An',
    position: 'Kỹ sư Backend',
    email: 'an.nguyen@example.com',
    phone: '0901,234,567',
    location: 'Hà Nội',
    source: 'TopCV',
    rating: 4,
    status: 'Phỏng vấn',
    appliedAt: '2024-04-20',
    experience: '5 năm kinh nghiệm Node.js',
    education: 'Đại học Bách Khoa Hà Nội'
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Left Sidebar: Profile Summary */}
        <div className="w-80 bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-8">
           <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-xl flex items-center justify-center text-blue-600 mb-4 overflow-hidden">
                 <User className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-black text-slate-800">{data.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{data.position}</p>
              
              <div className="flex items-center gap-1 mt-3">
                 {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < data.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                 ))}
              </div>
           </div>

           <div className="space-y-5">
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <Mail className="w-4 h-4" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Email</p>
                    <p className="text-xs font-black text-slate-700 truncate">{data.email}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <Phone className="w-4 h-4" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Điện thoại</p>
                    <p className="text-xs font-black text-slate-700">{data.phone}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <MapPin className="w-4 h-4" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Địa chỉ</p>
                    <p className="text-xs font-black text-slate-700">{data.location}</p>
                 </div>
              </div>
           </div>

           <div className="mt-auto space-y-3">
              <button className="w-full h-11 rounded-2xl bg-xevn-primary text-xs font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-100">
                 <MessageSquare className="w-4 h-4" /> Liên hệ ngay
              </button>
              <button className="w-full h-11 rounded-2xl bg-white border border-slate-200 text-xs font-black text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                 <Download className="w-4 h-4" /> Tải CV (.pdf)
              </button>
           </div>
        </div>

        {/* Right Content: Details and Experience */}
        <div className="flex-1 flex flex-col min-w-0">
           {/* Header */}
           <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái hồ sơ</p>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-black uppercase">
                       {data.status}
                    </span>
                 </div>
                 <div className="w-px h-10 bg-slate-100" />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nguồn tuyển dụng</p>
                    <p className="text-sm font-black text-slate-700">{data.source}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all border border-transparent hover:border-slate-100">
                    <Edit3 className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={onClose}
                   className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 transition-all"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>
           </div>

           {/* Content Tabs */}
           <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="px-10 py-10 space-y-12">
                 {/* Experience Section */}
                 <section>
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Briefcase className="w-5 h-5" />
                       </div>
                       <h3 className="text-lg font-black text-slate-800">Kinh nghiệm làm việc</h3>
                    </div>
                    <div className="space-y-8 pl-5 border-l-2 border-slate-100 ml-5">
                       {[1, 2].map((_, i) => (
                          <div key={i} className="relative">
                             <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-4 border-xevn-primary shadow-sm" />
                             <div>
                                <h4 className="text-sm font-black text-slate-800">Senior Software Engineer</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mt-0.5">Unicom JSC • 2021 - Hiện tại</p>
                                <p className="text-sm text-slate-600 mt-3 font-medium leading-relaxed">
                                   Chịu trách nhiệm thiết kế và phát triển hệ thống backend cho dự án E-Office.
                                   Tối ưu hóa cơ sở dữ liệu và triển khai quy trình CI/CD.
                                </p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>

                 {/* Education Section */}
                 <section>
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                          <Shield className="w-5 h-5" />
                       </div>
                       <h3 className="text-lg font-black text-slate-800">Học vấn & Chứng chỉ</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Bằng cấp</p>
                          <h4 className="text-sm font-black text-slate-800">Cử nhân Công nghệ thông tin</h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">Đại học Bách Khoa Hà Nội • 2014 - 2019</p>
                       </div>
                       <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Chứng chỉ</p>
                          <h4 className="text-sm font-black text-slate-800">AWS Certified Solutions Architect</h4>
                          <p className="text-xs font-bold text-slate-500 mt-1">Amazon Web Services • 2022</p>
                       </div>
                    </div>
                 </section>

                 {/* Evaluation History */}
                 <section className="pt-10 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lịch sử đánh giá</h3>
                       <button className="text-[10px] font-black text-xevn-primary uppercase tracking-widest flex items-center gap-1">
                          Thêm đánh giá <ChevronRight className="w-3 h-3" />
                       </button>
                    </div>
                    <div className="space-y-4">
                       {[1, 2].map((_, i) => (
                          <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                             <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-500">
                                      HR
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-700">Nguyễn Thu Thủy</p>
                                      <p className="text-[10px] font-bold text-slate-400">Vòng sàng lọc • 2 ngày trước</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-1">
                                   <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                   <span className="text-xs font-black text-slate-700">4.5</span>
                                </div>
                             </div>
                             <p className="text-sm text-slate-600 font-medium italic">
                                "Ứng viên có kiến thức nền tảng tốt, trả lời tự tin các câu hỏi về hệ thống. Cần kiểm tra thêm về khả năng làm việc nhóm ở vòng tiếp theo."
                             </p>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
