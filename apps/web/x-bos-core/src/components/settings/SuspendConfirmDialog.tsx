// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Dialog xác nhận trước khi tạm ngưng tenant

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

type Props = {
  companyName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SuspendConfirmDialog({ companyName, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="suspend-confirm-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm rounded-2xl bg-white/97 shadow-overlay backdrop-blur-sm p-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div id="suspend-confirm-title" className="text-base font-semibold text-xevn-text">
              Xác nhận tạm ngưng
            </div>
            <p className="mt-1 text-sm text-xevn-muted">
              Bạn có chắc muốn tạm ngưng{' '}
              <span className="font-medium text-xevn-text">&ldquo;{companyName}&rdquo;</span>?
              Người dùng thuộc công ty này sẽ không thể đăng nhập cho đến khi kích hoạt lại.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-amber-600/25 hover:bg-amber-700"
          >
            Xác nhận tạm ngưng
          </button>
        </div>
      </div>
    </div>
  );
}
