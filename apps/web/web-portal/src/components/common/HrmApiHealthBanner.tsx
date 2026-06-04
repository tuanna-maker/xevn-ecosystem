import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Banner when HRM Nest API is unreachable (Vite proxy → 500 on /api/hrm/*).
 */
export const HrmApiHealthBanner: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/api/hrm/', { credentials: 'include' });
        if (!cancelled) {
          if (r.ok) setMessage(null);
          else setMessage(`HRM API trả HTTP ${r.status}. Kiểm tra terminal hrm-api (cổng 28001).`);
        }
      } catch {
        if (!cancelled) {
          setMessage(
            'Không kết nối được HRM API. Chạy `pnpm run dev:hrm-api` (cổng 28001) rồi tải lại trang.',
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!message) return null;

  return (
    <div
      className="mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
};
