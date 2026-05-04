import React, { useState } from 'react';
import { X, BarChart3, Search, ChevronDown, Users, Layout, Filter } from 'lucide-react';

interface CompareCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompareCandidatesModal: React.FC<CompareCandidatesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">So sánh đánh giá ứng viên</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Đối chiếu năng lực giữa các ứng viên trong cùng vị trí</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-all shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Candidate Selection */}
          <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 ml-1">Chọn tin tuyển dụng</label>
                <div className="relative">
                  <select className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-blue-500 transition-all appearance-none">
                    <option>Chọn vị trí...</option>
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>UI/UX Designer</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Chọn tin tuyển dụng để xem ứng viên</p>
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100 bg-white">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Đã chọn 0/4 ứng viên để so sánh</p>
            </div>
          </div>

          {/* Right Panel: Comparison Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white relative">
            <div className="absolute top-6 right-6">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-4 max-w-sm">
              <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-6">
                <Layout className="w-10 h-10" />
              </div>
              <h4 className="text-base font-black text-slate-800 uppercase tracking-widest">Chọn ứng viên để so sánh</h4>
              <p className="text-xs font-bold text-slate-400 leading-relaxed">
                Nhấn vào ứng viên bên trái để thêm vào bảng so sánh năng lực, kỹ năng và mức lương kỳ vọng.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-[13px] font-black text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
          >
            Đóng
          </button>
          <button className="px-10 py-2.5 rounded-full bg-blue-600 text-[13px] font-black text-white shadow-lg shadow-blue-200 transition active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Bắt đầu so sánh
          </button>
        </div>
      </div>
    </div>
  );
};
