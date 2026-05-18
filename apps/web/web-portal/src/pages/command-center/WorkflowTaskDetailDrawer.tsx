import { X } from 'lucide-react';
import type { UnifiedTask } from '../../data/mock-data';

type WorkflowTaskDetailDrawerProps = {
  open: boolean;
  task: UnifiedTask | null;
  detail: Record<string, unknown> | null;
  loading: boolean;
  busy: boolean;
  onClose: () => void;
  onComplete: (outcome: 'approved' | 'rejected') => void;
};

export function WorkflowTaskDetailDrawer({
  open,
  task,
  detail,
  loading,
  busy,
  onClose,
  onComplete,
}: WorkflowTaskDetailDrawerProps) {
  if (!open || !task) return null;

  const instance = (detail?.instance as Record<string, unknown> | undefined) ?? detail;
  const steps = (detail?.steps as unknown[] | undefined) ?? (detail?.tasks as unknown[]) ?? [];

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/30" role="dialog" aria-modal>
      <button type="button" className="flex-1 cursor-default" aria-label="Đóng" onClick={onClose} />
      <aside className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Chi tiết nhiệm vụ</p>
            <h2 className="text-lg font-semibold text-slate-900">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng panel"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700">
          {loading ? (
            <p className="text-slate-500">Đang tải chi tiết workflow…</p>
          ) : (
            <>
              <p>
                <span className="font-medium">Instance:</span> {task.sourceId}
              </p>
              {instance?.status ? (
                <p className="mt-2">
                  <span className="font-medium">Trạng thái:</span> {String(instance.status)}
                </p>
              ) : null}
              {Array.isArray(steps) && steps.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {steps.map((s, i) => {
                    const row = s as Record<string, unknown>;
                    return (
                      <li key={String(row.id ?? i)} className="rounded-lg border border-slate-100 px-3 py-2">
                        <span className="font-medium">{String(row.step_key ?? row.hat_key ?? `Bước ${i + 1}`)}</span>
                        <span className="ml-2 text-slate-500">{String(row.status ?? '')}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-slate-500">Không có bước workflow chi tiết.</p>
              )}
            </>
          )}
        </div>
        <footer className="flex gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => onComplete('rejected')}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Từ chối
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onComplete('approved')}
            className="flex-1 rounded-lg bg-[#1E40AF] px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Hoàn thành
          </button>
        </footer>
      </aside>
    </div>
  );
}
