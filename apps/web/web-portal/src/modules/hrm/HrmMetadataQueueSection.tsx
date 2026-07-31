/**
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01
 * change_mode: UPGRADE
 * What: Cột Quy trình humanize/hide workflow_code kỹ thuật (parity HRM MetadataQueueTab)
 * Why: QC C-HRM-MENU-SWEEP-01 — không hiện xbos.employee_metadata.*
 * must_keep: approve/reject handlers
 */
import type { EmployeeMetadataQueueItem } from './hrmApiClient';
import { HRM_TABLE_CLASS, HRM_TABLE_SHELL } from './mock-data';
import { SETTINGS_CONTROL_TEXT } from '../../pages/command-center/settings-form-pattern';

/** Parity with apps/web/hrm/src/lib/metadataWorkflowLabel.ts */
function formatMetadataWorkflowLabel(code: string | null | undefined): string {
  const trimmed = typeof code === 'string' ? code.trim() : '';
  if (!trimmed) return 'Quy trình mặc định';
  if (trimmed === 'xbos.employee_metadata.default') {
    return 'Duyệt thay đổi hồ sơ (mặc định)';
  }
  const looksHuman =
    /[\sÀ-ỹ]/.test(trimmed) && !/^xbos\./i.test(trimmed) && !/^[a-z0-9]+(\.[a-z0-9_]+)+$/i.test(trimmed);
  if (looksHuman) return trimmed;
  if (
    /^xbos\./i.test(trimmed) ||
    trimmed.includes('.') ||
    /^[a-z][a-z0-9_-]*$/i.test(trimmed)
  ) {
    return 'Quy trình phê duyệt metadata';
  }
  return trimmed;
}

export interface HrmMetadataQueueSectionProps {
  rows: EmployeeMetadataQueueItem[];
  loading: boolean;
  error: string | null;
  fallback: boolean;
  onDecide: (action: 'approve' | 'reject', row: EmployeeMetadataQueueItem) => void;
}

export function HrmMetadataQueueSection({
  rows,
  loading,
  error,
  fallback,
  onDecide,
}: HrmMetadataQueueSectionProps) {
  return (
    <div className={HRM_TABLE_SHELL}>
      <MetadataQueueHeader loading={loading} count={rows.length} fallback={fallback} />
      {error ? <MetadataQueueErrorBanner message={error} /> : null}
      <table className={HRM_TABLE_CLASS}>
        <thead className="bg-white/70 backdrop-blur-md">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nhân sự</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trường dữ liệu</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Giá trị đề nghị</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Lý do</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Quy trình</th>
            <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && !loading ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                Không có yêu cầu metadata đang chờ duyệt.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-t border-xevn-border">
                <td className="px-3 py-2 text-sm font-medium text-xevn-text">
                  {row.actor_name ?? row.employee_id}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-xevn-primary">{row.field_key}</td>
                <td className="px-3 py-2 text-slate-700">
                  {typeof row.requested_value === 'string'
                    ? row.requested_value
                    : JSON.stringify(row.requested_value)}
                </td>
                <td className="px-3 py-2 text-slate-600">{row.reason ?? 'Không có'}</td>
                <td className="px-3 py-2 text-slate-600" data-testid="metadata-workflow-label">
                  {formatMetadataWorkflowLabel(row.workflow_code)}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                      onClick={() => void onDecide('approve', row)}
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      onClick={() => void onDecide('reject', row)}
                    >
                      Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MetadataQueueHeader({
  loading,
  count,
  fallback,
}: {
  loading: boolean;
  count: number;
  fallback: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-xevn-border px-4 py-3">
      <div>
        <p className={`${SETTINGS_CONTROL_TEXT} font-semibold text-xevn-text`}>
          Hàng chờ thay đổi metadata nhân sự
        </p>
        <p className="text-sm text-slate-500">
          {fallback
            ? 'Không tải được hàng chờ metadata.'
            : 'Duyệt yêu cầu thay đổi metadata nhân sự'}
        </p>
      </div>
      <span className="rounded-full border border-xevn-border bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
        {loading ? 'Đang tải...' : `${count} hồ sơ chờ duyệt`}
      </span>
    </div>
  );
}

function MetadataQueueErrorBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-xevn-border bg-amber-50 px-4 py-2 text-sm text-amber-800">{message}</div>
  );
}
