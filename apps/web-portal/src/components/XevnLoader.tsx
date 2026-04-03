import React, { useState, useEffect } from 'react';

interface XevnLoaderProps {
  targetUrl: string;
  onNavigate: () => void;
}

export const XevnLoader: React.FC<XevnLoaderProps> = ({ targetUrl, onNavigate }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onNavigate();
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    }, 1000);

    return () => clearTimeout(timer);
  }, [targetUrl, onNavigate]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 backdrop-blur-xl">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="relative z-10 w-32 h-32 mx-auto rounded-3xl flex items-center justify-center shadow-2xl" style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #7c3aed 100%)',
            boxShadow: '0 0 60px rgba(59, 130, 246, 0.6)'
          }}>
            <span className="text-white font-black text-4xl">X</span>
          </div>
        </div>

        <p className="text-white text-lg font-medium mb-4">Đang kết nối Hệ điều hành XeVN OS...</p>

        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};
