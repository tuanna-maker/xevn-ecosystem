import React from 'react';
import { X } from 'lucide-react';

interface CenteredModalProps {
  title: React.ReactNode;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const CenteredModal: React.FC<CenteredModalProps> = ({ title, open, onClose, children, footer, className = "max-w-3xl" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`w-full ${className} max-h-[min(800px,90vh)] bg-white rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden border border-white flex flex-col animate-in zoom-in-95 duration-500`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md border-b border-slate-50">
          <div className="flex-1">
            {typeof title === 'string' ? (
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            ) : title}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 z-10 px-8 py-6 bg-slate-50/50 backdrop-blur-md border-t border-slate-100/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

