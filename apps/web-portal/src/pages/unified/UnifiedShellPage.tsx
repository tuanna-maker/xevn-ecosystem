import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, LayoutDashboard, ArrowRight } from 'lucide-react';

/**
 * Lớp vào tổng thể (Unified Shell): không sidebar — người dùng vào đây trước,
 * sau đó chuyển sang Bảng điều hành (/cockpit) rồi mới dùng workspace /dashboard/*.
 */
const UnifiedShellPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#F9FAFB] flex flex-col">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-soft">
        <div className="xevn-safe-inline py-6 flex items-center justify-between max-w-[1920px] mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E40AF] to-slate-900 flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">XeVN OS</p>
              <h1 className="text-lg font-bold text-slate-900">Unified Shell</h1>
            </div>
          </div>
          <span className="text-sm text-slate-500 hidden sm:inline">Cổng vào duy nhất · Prototype</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1E40AF]/10 text-[#1E40AF]">
            <LayoutDashboard className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Chào mừng đến hệ điều hành tập đoàn
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Bắt đầu từ lớp Unified, sau đó mở Bảng điều hành (Executive Cockpit). Khi đã vào cockpit,
              workspace nghiệp vụ (sidebar) mới được mở khóa.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
            <Link
              to="/cockpit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E40AF] text-white px-8 py-4 text-sm font-semibold shadow-soft hover:opacity-95 active:scale-95 transition-transform"
            >
              Vào Bảng điều hành
              <ArrowRight className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link
              to="/command-center"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95 transition-transform"
            >
              Command Center
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            Workspace portal: <code className="text-slate-600">/dashboard/*</code> — chỉ khả dụng sau khi đã vào{' '}
            <code className="text-slate-600">/cockpit</code>
          </p>
        </div>
      </main>
    </div>
  );
};

export default UnifiedShellPage;
