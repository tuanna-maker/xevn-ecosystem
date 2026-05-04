import React, { useState } from 'react';
import { Card, DataTable } from '../../../../../components/common';
import { 
  Plus, Search, Filter, Users, 
  Mail, Phone, FileText, Download,
  Eye, Edit3, Trash2, CheckCircle2,
  Clock, MessageSquare, AlertCircle,
  MoreVertical, Star
} from 'lucide-react';
import { Pagination } from './Pagination';
import { CandidateDetailModal } from './CandidateDetailModal';

const MOCK_CANDIDATES = [
  { 
    id: '1', 
    name: 'Nguyễn Văn An', 
    avatar: '', 
    email: 'an.nguyen@example.com',
    phone: '0901,234,567',
    position: 'Kỹ sư Backend', 
    source: 'TopCV',
    rating: 4,
    status: 'screening',
    appliedDate: '2025-04-20'
  },
  { 
    id: '2', 
    name: 'Trần Thị Bình', 
    avatar: '', 
    email: 'binh.tran@example.com',
    phone: '0902,345,678',
    position: 'BA', 
    source: 'LinkedIn',
    rating: 5,
    status: 'interviewing',
    appliedDate: '2025-04-22'
  },
  { 
    id: '3', 
    name: 'Lê Hoàng Cường', 
    avatar: '', 
    email: 'cuong.le@example.com',
    phone: '0903,456,789',
    position: 'HR Manager', 
    source: 'Referral',
    rating: 3,
    status: 'new',
    appliedDate: '2025-04-25'
  },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'Mới', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  screening: { label: 'Đang sàng lọc', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  interviewing: { label: 'Đang phỏng vấn', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  offered: { label: 'Đã đề xuất', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  hired: { label: 'Đã tuyển', color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200' },
  rejected: { label: 'Từ chối', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
};

export const CandidatesView: React.FC<{ openCreateModal?: () => void }> = ({ openCreateModal }) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const handleViewDetail = (candidate: any) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };
  const [q, setQ] = useState('');

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Tổng ứng viên', val: 156, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Ứng viên mới', val: 12, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Đang phỏng vấn', val: 24, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Đã đề xuất', val: 8, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Đã tuyển', val: 45, icon: Star, color: 'text-xevn-primary', bg: 'bg-blue-50' },
        ].map((s, idx) => (
          <Card key={idx} className="p-4 flex flex-col items-center gap-2 border-slate-100 text-center">
            <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center ${s.color}`}>
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
            Thêm ứng viên
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" />
            Nhập Excel
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên, email, sđt..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-64 rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs font-bold text-slate-700 focus:border-xevn-primary focus:outline-none focus:ring-0 transition-all"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-100 bg-white shadow-soft rounded-[32px]">
        <DataTable
          columns={[
            { 
              key: 'name', 
              header: 'Họ và tên', 
              render: (row: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs border-2 border-white shadow-sm">
                    {row.name.split(' ').pop()?.[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-black text-slate-700 leading-tight">{row.name}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{row.appliedDate}</div>
                  </div>
                </div>
              ) 
            },
            { 
              key: 'contact', 
              header: 'Liên hệ', 
              render: (row: any) => (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                    <Mail className="w-3 h-3 text-slate-400" /> {row.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-bold">
                    <Phone className="w-3 h-3 text-slate-400" /> {row.phone}
                  </div>
                </div>
              )
            },
            { key: 'position', header: 'Vị trí ứng tuyển', render: (row: any) => <span className="text-[12px] font-bold text-slate-600">{row.position}</span> },
            { key: 'source', header: 'Nguồn', render: (row: any) => <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{row.source}</span> },
            { 
              key: 'rating', 
              header: 'Đánh giá', 
              render: (row: any) => (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3 h-3 ${s <= row.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              )
            },
            { 
              key: 'status', 
              header: 'Trạng thái', 
              render: (row: any) => {
                const config = STATUS_MAP[row.status] || STATUS_MAP.new;
                return (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                );
              }
            },
            {
              key: 'actions',
              header: '',
              render: (row: any) => (
                <div className="flex items-center justify-end gap-1">
                  <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-xevn-primary transition-all"><FileText className="w-4 h-4" /></button>
                  <button 
                    onClick={() => handleViewDetail(row)}
                    className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-xevn-primary transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-all"><MoreVertical className="w-4 h-4" /></button>
                </div>
              )
            }
          ]}
          data={MOCK_CANDIDATES}
        />
        <Pagination 
          currentPage={1}
          totalPages={8}
          onPageChange={() => {}}
          totalItems={156}
          itemsPerPage={20}
        />
      </Card>

      <CandidateDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        candidateData={selectedCandidate}
      />
    </div>
  );
};
