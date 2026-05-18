import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { xbosGetData } from '../../integrations/xbosHttp';

/**
 * Dev-oriented banner when XBOS API is unreachable (proxy 500 / connection refused).
 */
export const ApiHealthBanner: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await xbosGetData('/tenant-scope/accessible', { scope: 'health.xbos-ping' });
        if (!cancelled) setMessage(null);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Không kết nối được XBOS API. Chạy `pnpm dev:xbos-api` (cổng 28002).',
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
      className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
      role="status"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{message}</span>
    </div>
  );
};
