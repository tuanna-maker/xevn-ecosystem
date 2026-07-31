import { useEffect, useState } from 'react';
import { listSyncedCatalogs } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { useAuth } from '@/contexts/AuthContext';

export function HrmApiSyncBanner() {
  const { currentCompanyId } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('Chưa kiểm tra đồng bộ danh mục.');

  const check = async () => {
    try {
      setStatus('loading');
      const result = await listSyncedCatalogs();
      setStatus('ok');
      setMessage(`Đã kết nối. Có ${result.total} danh mục đã đồng bộ từ XBOS.`);
    } catch (error) {
      setStatus('error');
      setMessage(toErrorMessage(error, 'Không thể kết nối dịch vụ HRM'));
    }
  };

  useEffect(() => {
    if (!currentCompanyId) {
      setStatus('idle');
      setMessage('Thiếu phạm vi công ty để kiểm tra đồng bộ danh mục.');
      return;
    }
    void check();
  }, [currentCompanyId]);

  return (
    <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-medium">Đồng bộ danh mục</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {status === 'ok'
              ? 'Đã kết nối'
              : status === 'loading'
                ? 'Đang kiểm tra'
                : status === 'error'
                  ? 'Lỗi'
                  : 'Chưa kiểm tra'}
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
