import React, { useState } from 'react';
import { Card, DataTable } from '../../../../../components/common';
import { 
  Plus, Search, Filter, Briefcase, 
  Building2, MapPin, Users, UserPlus, 
  Eye, Edit3, Trash2, LayoutGrid, List,
  MoreHorizontal, Download, Clock
} from 'lucide-react';
import { Pagination } from './Pagination';
import { JobPostingDetailModal } from './JobPostingDetailModal';

const MOCK_JOBS = [
  { 
    id: '1', 
    title: 'Kỹ sư phần mềm Backend', 
    position: 'Senior Developer',
    department: 'Công nghệ thông tin', 
    location: 'Hà Nội',
    type: 'Full-time',
    headcount: 3, 
    applied: 12,
    salary: '25,000,000 - 45,000,000 đ',
    deadline: '2025-05-15',
    priority: 'High',
    status: 'active' 
  },
  { 
    id: '2', 
    title: 'Chuyên viên phân tích nghiệp vụ', 
    position: 'BA',
    department: 'Khối Vận hành', 
    location: 'Hồ Chí Minh',
    type: 'Full-time',
    headcount: 2, 
    applied: 8,
    salary: '18,000,000 - 30,000,000 đ',
    deadline: '2025-06-01',
    priority: 'Medium',
    status: 'active' 
  },
  { 
    id: '3', 
    title: 'Nhân viên Hành chính Nhân sự', 
    position: 'HR Generalist',
    department: 'HCNS', 
    location: 'Hà Nội',
    type: 'Full-time',
    headcount: 1, 
    applied: 24,
    salary: '10,000,000 - 15,000,000 đ',
    deadline: '2025-04-30',
    priority: 'Urgent',
    status: 'active' 
  },
];

export const JobPostingsView: React.FC<{ openCreateModal?: () => void }> = ({ openCreateModal }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [q, setQ] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const handleViewDetail = (job: any) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tổng tin đăng', val: 12, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Đang tuyển', val: 8, icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Bản nháp', val: 3, icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50' },
          { label: 'Cần tuyển', val: 15, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, idx) => (
          <Card key={idx} className="p-4 flex items-center gap-4 border-slate-100">
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={openCreateModal}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-xevn-primary px-6 text-[13px] font-bold text-white shadow-md shadow-blue-200 transition active:scale-95 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Tạo tin tuyển dụng
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm vị trí..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-64 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-bold text-slate-700 focus:border-xevn-primary focus:outline-none focus:ring-0 transition-all"
            />
          </div>
          <select className="h-10 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 outline-none focus:outline-none focus:ring-0 focus:border-xevn-primary transition-all">
            <option>Tất cả trạng thái</option>
            <option>Đang tuyển</option>
            <option>Tạm dừng</option>
            <option>Đã đóng</option>
          </select>
          <div className="flex items-center bg-slate-100 p-1 rounded-full">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-white text-xevn-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden border border-slate-100 bg-white shadow-soft rounded-[32px]">
          <DataTable
            columns={[
              { 
                key: 'title', 
                header: 'Tiêu đề / Vị trí', 
                render: (row: any) => (
                  <div>
                    <div className="text-[13px] font-black text-slate-700 leading-tight">{row.title}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{row.position}</div>
                  </div>
                ) 
              },
              { key: 'department', header: 'Phòng ban', render: (row: any) => <div className="text-[12px] font-bold text-slate-600">{row.department}</div> },
              { key: 'location', header: 'Địa điểm', render: (row: any) => <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {row.location}</div> },
              { key: 'applied', header: 'Ứng viên', render: (row: any) => (
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="font-bold text-xevn-primary">{row.applied}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500">{row.headcount}</span>
                </div>
              )},
              { key: 'deadline', header: 'Hạn nộp', render: (row: any) => <div className="text-[11px] font-bold text-slate-500">{row.deadline}</div> },
              { 
                key: 'status', 
                header: 'Trạng thái', 
                render: (row: any) => (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase">
                    {row.status === 'active' ? 'Đang tuyển' : row.status}
                  </span>
                )
              },
              {
                key: 'actions',
                header: '',
                render: (row: any) => (
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleViewDetail(row)}
                      className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-xevn-primary transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-xevn-primary transition-all"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )
              }
            ]}
            data={MOCK_JOBS}
          />
          <Pagination 
            currentPage={1}
            totalPages={5}
            onPageChange={() => {}}
            totalItems={45}
            itemsPerPage={10}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6">
            {MOCK_JOBS.map((job) => (
              <Card key={job.id} className="p-6 border-slate-100 hover:shadow-xl transition-all group relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/80 backdrop-blur shadow-sm rounded-full text-slate-400 hover:text-xevn-primary"><MoreHorizontal className="w-4 h-4" /></button>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-6 h-6" />
                 </div>
                 <div className="space-y-4 mb-6">
                    <div>
                       <h4 className="text-[15px] font-black text-slate-800 line-clamp-1 leading-tight">{job.title}</h4>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{job.department}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                         <Building2 className="w-3.5 h-3.5 text-slate-400" /> {job.position}
                       </div>
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                         <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                       </div>
                       <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                         <Users className="w-3.5 h-3.5 text-slate-400" /> Chỉ tiêu: <span className="text-slate-700">{job.headcount}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="text-xs font-black text-xevn-primary">{job.salary}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{job.deadline}</div>
                 </div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination 
              currentPage={1}
              totalPages={5}
              onPageChange={() => {}}
              totalItems={45}
              itemsPerPage={10}
            />
          </div>
        </>
      )}

      <JobPostingDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        jobData={selectedJob}
      />
    </div>
  );
};
