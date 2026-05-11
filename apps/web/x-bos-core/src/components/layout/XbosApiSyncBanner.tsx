import { useEffect, useState } from 'react';
import { useXbosStore } from '@/store/useXbosStore';
import { syncXbosCatalogs, XbosApiError } from '@/integrations/xbosApi';

const DEFAULT_TENANT = 'tenant-xevn-holding';

export function XbosApiSyncBanner() {
  const hydrateCatalogsFromApi = useXbosStore((s) => s.hydrateCatalogsFromApi);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('Chưa đồng bộ danh mục từ API XBOS.');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const sync = async () => {
    try {
      setStatus('loading');
      setMessage('Đang đồng bộ danh mục từ XBOS API...');
      const catalogs = await syncXbosCatalogs('xbos');
      hydrateCatalogsFromApi(catalogs, DEFAULT_TENANT);
      setStatus('ok');
      setLastSyncedAt(new Date().toISOString());
      setMessage(`Đã đồng bộ ${catalogs.length} danh mục từ API.`);
    } catch (error) {
      setStatus('error');
      if (error instanceof XbosApiError) {
        if (error.causeType === 'timeout') {
          setMessage('API XBOS phản hồi chậm. Vui lòng thử lại.');
          return;
        }
        if (error.causeType === 'auth') {
          setMessage('Xác thực XBOS API thất bại. Kiểm tra token hoặc internal key.');
          return;
        }
        setMessage(error.message);
        return;
      }
      setMessage(error instanceof Error ? error.message : 'Đồng bộ thất bại');
    }
  };

  useEffect(() => {
    void sync();
  }, []);

  return (
    <div className="mb-4 rounded-xl border border-black/[0.08] bg-white/80 px-4 py-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-medium">XBOS API Sync</span>
          <span className="ml-2 text-xs text-xevn-muted">
            {status === 'ok' ? 'CONNECTED' : status === 'loading' ? 'SYNCING' : status === 'error' ? 'ERROR' : 'IDLE'}
          </span>
          <div className="text-xs text-xevn-muted mt-1">{message}</div>
          {lastSyncedAt && (
            <div className="text-xs text-xevn-muted mt-1">
              Sync gần nhất: {lastSyncedAt.slice(0, 19).replace('T', ' ')}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => void sync()}
          disabled={status === 'loading'}
          className="rounded-lg border border-black/[0.1] px-3 py-1.5 text-xs font-medium hover:bg-black/[0.03]"
        >
          Sync lại
        </button>
      </div>
    </div>
  );
}
