import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../../../components/common';
import { 
  Plus, Search, LayoutDashboard, FileText, Users, 
  Send, Target, MessageSquare, ClipboardCheck, 
  CalendarDays, BarChart3, Filter, ChevronDown, ChevronRight, ChevronLeft,
  Download, RefreshCw, MoreHorizontal, Layout,
  Activity, Video, MapPin, CheckCircle2, AlertCircle
} from 'lucide-react';
import { RecruitmentDashboard } from './components/RecruitmentDashboard';
import { JobPostingsView } from './components/JobPostingsView';
import { CandidatesView } from './components/CandidatesView';
import { InterviewsView } from './components/InterviewsView';
import { RecruitmentBoard } from './components/RecruitmentBoard';
import { JobPostingModal } from './components/JobPostingModal';
import { CandidateModal } from './components/CandidateModal';
import { EvaluationsView } from './components/EvaluationsView';
import { ReportsView } from './components/ReportsView';

type TabKey = 'dashboard' | 'jobs' | 'candidates' | 'proposals' | 'campaigns' | 'interviews' | 'evaluations' | 'planning' | 'reports';
type DashboardSubTab = 'stats' | 'board';

const RECRUITMENT_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, subTabs: ['stats', 'board'] },
  { key: 'jobs', label: 'Tin Tuyển dụng', icon: FileText, menu: ['Tất cả tin tuyển dụng', 'Tin đang tuyển', 'Tin hết hạn', 'Tin nháp'] },
  { key: 'candidates', label: 'Ứng viên', icon: Users, menu: ['Tất cả ứng viên', 'Ứng viên mới', 'Đang sàng lọc', 'Đang phỏng vấn', 'Đã tuyển'], activeColor: 'bg-emerald-500 shadow-emerald-200 ring-emerald-50' },
  { key: 'proposals', label: 'Đề xuất', icon: Send, activeColor: 'bg-purple-500 shadow-purple-200 ring-purple-50' },
  { key: 'campaigns', label: 'Chiến dịch', icon: Target, activeColor: 'bg-rose-500 shadow-rose-200 ring-rose-50' },
  { key: 'interviews', label: 'Phỏng vấn', icon: MessageSquare, activeColor: 'bg-rose-600 shadow-rose-200 ring-rose-50' },
  { key: 'evaluations', label: 'Đánh giá', icon: ClipboardCheck, activeColor: 'bg-emerald-400 shadow-emerald-200 ring-emerald-50' },
  { key: 'planning', label: 'Kế hoạch', icon: CalendarDays, activeColor: 'bg-indigo-500 shadow-indigo-200 ring-indigo-50' },
  { key: 'reports', label: 'Báo cáo', icon: BarChart3, activeColor: 'bg-teal-500 shadow-teal-200 ring-teal-50' },
];

export const RecruitmentView: React.FC<{ openHrmApp: (path: string) => void }> = ({ openHrmApp }) => {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [dashboardSub, setDashboardSub] = useState<DashboardSubTab>('stats');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 200;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
      // We need to wait for smooth scroll to finish before checking again
      setTimeout(checkScroll, 400);
    }
  };

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                <button 
                  onClick={() => setDashboardSub('stats')}
                  className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${dashboardSub === 'stats' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setDashboardSub('board')}
                  className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${dashboardSub === 'board' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Board tuyển dụng
                </button>
              </div>
              <button 
                onClick={() => setIsJobModalOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-xevn-primary px-5 text-[13px] font-bold text-white shadow-md shadow-blue-200 transition active:scale-95 hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                Tạo tin tuyển dụng
              </button>
            </div>
            {dashboardSub === 'stats' ? <RecruitmentDashboard /> : <RecruitmentBoard />}
          </div>
        );
      case 'jobs': return <JobPostingsView openCreateModal={() => setIsJobModalOpen(true)} />;
      case 'candidates': return <CandidatesView openCreateModal={() => setIsCandidateModalOpen(true)} />;
      case 'interviews': return <InterviewsView />;
      case 'evaluations': return <EvaluationsView />;
      case 'reports': return <ReportsView />;
      case 'proposals':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
               {[
                 { label: 'Tổng đề xuất', val: 0, icon: FileText, color: 'text-blue-500' },
                 { label: 'Chờ duyệt', val: 0, icon: CalendarDays, color: 'text-amber-500' },
                 { label: 'Đã duyệt', val: 0, icon: ClipboardCheck, color: 'text-emerald-500' },
                 { label: 'Từ chối', val: 0, icon: Plus, color: 'text-rose-500', rotate: true },
                 { label: 'Tổng nhân sự đề xuất', val: 0, icon: Users, color: 'text-purple-500' },
               ].map((s, idx) => (
                 <Card key={idx} className="p-4 flex flex-col gap-3 border-slate-100 items-center text-center">
                    <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center ${s.color}`}>
                      <s.icon className={`w-5 h-5 ${s.rotate ? 'rotate-45' : ''}`} />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800">{s.val}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
                    </div>
                 </Card>
               ))}
            </div>
            <Card className="p-0 overflow-hidden border border-slate-100 shadow-soft rounded-[32px]">
               <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-xevn-primary" />
                    Danh sách đề xuất ngoài định biên
                  </h4>
                  <div className="flex items-center gap-2">
                    <button className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                      <Download className="w-3.5 h-3.5" />
                      Xuất Excel
                    </button>
                    <button className="inline-flex h-9 items-center gap-2 rounded-full bg-xevn-primary px-5 text-[13px] font-bold text-white shadow-md shadow-blue-200 transition active:scale-95 hover:opacity-90">
                      <Plus className="h-3.5 w-3.5" />
                      Tạo đề xuất
                    </button>
                  </div>
               </div>
               <div className="p-10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chưa có dữ liệu</p>
               </div>
            </Card>
          </div>
        );
      case 'campaigns':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
               {[
                 { label: 'Tổng chiến dịch', val: 0, icon: Target, color: 'text-blue-500' },
                 { label: 'Đang chạy', val: 0, icon: Activity, color: 'text-emerald-500' },
                 { label: 'Hoàn thành', val: 0, icon: ClipboardCheck, color: 'text-purple-500' },
                 { label: 'Tổng vị trí', val: 0, icon: Layout, color: 'text-orange-500' },
               ].map((s, idx) => (
                 <Card key={idx} className="p-4 flex items-center gap-4 border-slate-100">
                    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{s.val}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{s.label}</p>
                    </div>
                 </Card>
               ))}
            </div>
            <Card className="p-6 border-slate-100 shadow-soft rounded-[32px]">
               <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="w-10 h-10 text-xevn-primary/30 animate-spin-slow mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
               </div>
            </Card>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-slate-100">
             <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                <LayoutDashboard className="w-10 h-10" />
             </div>
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Đang phát triển</h3>
             <p className="text-xs font-bold text-slate-400 mt-2">Phân hệ {RECRUITMENT_TABS.find(t => t.key === tab)?.label} đang được đồng bộ dữ liệu.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation with Arrows */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm flex items-center flex-1 relative overflow-hidden group/nav">
          {showLeftArrow && (
            <button 
              onClick={() => handleScroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl border border-slate-100 z-20 flex items-center justify-center text-slate-400 hover:text-xevn-primary transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1 w-full"
          >
            {RECRUITMENT_TABS.map((t) => (
              <button
                key={t.key}
                onClick={(e) => {
                  if (t.menu) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMenuPos({ top: rect.bottom + 8, left: rect.left });
                    setActiveMenu(activeMenu === t.key ? null : t.key);
                  } else {
                    setTab(t.key as TabKey);
                    setActiveMenu(null);
                  }
                }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all whitespace-nowrap shrink-0 ${
                  tab === t.key
                    ? `${t.activeColor || 'bg-xevn-primary shadow-blue-200 ring-blue-50'} text-white shadow-lg ring-4`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-bold'
                }`}
              >
                <t.icon className={`w-4 h-4 ${tab === t.key ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-[11px] font-black uppercase tracking-tight">{t.label}</span>
                {t.menu && (
                  <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === t.key ? 'rotate-180' : ''}`} />
                )}
              </button>
            ))}
          </div>

          {showRightArrow && (
            <button 
              onClick={() => handleScroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-xl border border-slate-100 z-20 flex items-center justify-center text-slate-400 hover:text-xevn-primary transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          type="button"
          onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.set('iframe', '1');
            window.open(url.toString(), '_blank');
          }}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-[13px] font-black text-slate-600 shadow-sm transition active:scale-95 hover:bg-slate-50 hover:border-xevn-primary hover:text-xevn-primary shrink-0"
        >
          <Target className="w-4 h-4" />
          Mở HRM (tham chiếu)
        </button>
      </div>

      {/* Global Dropdown (Fixed to avoid clipping) */}
      {activeMenu && (
        <>
          <div 
            className="fixed inset-0 z-[1000]" 
            onClick={() => setActiveMenu(null)}
          />
          <div 
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed w-56 bg-white text-slate-700 rounded-2xl shadow-2xl z-[1001] overflow-hidden border border-slate-100 p-1 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            {RECRUITMENT_TABS.find(t => t.key === activeMenu)?.menu?.map((m, midx) => (
              <button 
                key={midx} 
                onClick={() => {
                  setTab(activeMenu as TabKey);
                  setActiveMenu(null);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 hover:text-xevn-primary rounded-xl transition-all flex items-center justify-between group"
              >
                {m}
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-300 group-hover:text-xevn-primary" />
              </button>
            ))}
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>

      <JobPostingModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
      />

      <CandidateModal 
        isOpen={isCandidateModalOpen} 
        onClose={() => setIsCandidateModalOpen(false)} 
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
