import { useEffect, useState } from 'react';
import { listSyncedCatalogs } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { useAuth } from '@/contexts/AuthContext';

export function HrmApiSyncBanner() {
  const { currentCompanyId } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('Chưa kiểm tra kết nối HRM API.');

  const check = async () => {
    try {
      setStatus('loading');
      const result = await listSyncedCatalogs();
      setStatus('ok');
      setMessage(`Đã kết nối HRM API. Có ${result.total} danh mục đã sync từ XBOS.`);
    } catch (error) {
      setStatus('error');
      setMessage(toErrorMessage(error, 'Không thể kết nối HRM API'));
    }
  };

  useEffect(() => {
    if (!currentCompanyId) {
      setStatus('idle');
      setMessage('Thiếu company context để kiểm tra HRM API.');
      return;
    }
    void check();
  }, [currentCompanyId]);

  return (
    <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-medium">HRM API Sync</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {status === 'ok' ? 'CONNECTED' : status === 'loading' ? 'CHECKING' : status === 'error' ? 'ERROR' : 'IDLE'}
          </span>
          <div className="text-xs text-muted-foreground mt-1">{message}</div>
        </div>
        <button
          type="button"
          onClick={() => void check()}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted/40"
        >
          Kiểm tra lại
        </button>
      </div>
    </div>
  );
}
