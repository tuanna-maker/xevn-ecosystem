import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import {
  ASSET_REQUEST_STATUS_LABELS,
  createAssetRequest,
  listAssetRequests,
  resolveAssetRequestNextStatus,
  transitionAssetRequest,
  type AssetRequestRow,
} from '../../integrations/assetRequestApi';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { allowMockFallback } from '../../utils/mockPolicy';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_LABEL_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_STACK,
} from './settings-form-pattern';

const RAIL_STROKE = 1.5;

export type AssetRequestPanelProps = {
  onStatusMessage?: (message: string | null) => void;
};

export const AssetRequestPanel: React.FC<AssetRequestPanelProps> = ({ onStatusMessage }) => {
  const { companyId } = useTenantScope();
  const [rows, setRows] = useState<AssetRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ requestCode: '', assetId: '', requestedBy: '' });

  const notify = useCallback(
    (message: string | null) => {
      onStatusMessage?.(message);
    },
    [onStatusMessage],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    notify(null);
    try {
      const items = await listAssetRequests(companyId);
      setRows(items);
    } catch (e) {
      setRows([]);
      setLoadFailed(true);
      notify(e instanceof Error ? e.message : 'Không tải được yêu cầu tài sản');
    } finally {
      setLoading(false);
    }
  }, [companyId, notify]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onCreate() {
    setBusyId('create');
    notify(null);
    try {
      await createAssetRequest(
        {
          requestCode: form.requestCode.trim() || undefined,
          assetId: form.assetId.trim() || null,
          requestedBy: form.requestedBy.trim() || undefined,
        },
        companyId,
      );
      setForm({ requestCode: '', assetId: '', requestedBy: '' });
      setCreateOpen(false);
      notify('Đã tạo yêu cầu tài sản.');
      await reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Không tạo được yêu cầu');
    } finally {
      setBusyId(null);
    }
  }

  async function onAdvance(row: AssetRequestRow) {
    const next = resolveAssetRequestNextStatus(row.status);
    if (!next) return;
    setBusyId(row.id);
    notify(null);
    try {
      await transitionAssetRequest(row.id, next, companyId);
      notify(`Đã chuyển trạng thái → ${ASSET_REQUEST_STATUS_LABELS[next] ?? next}.`);
      await reload();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Không chuyển được trạng thái');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className={SETTINGS_SECTION_STACK}>
      <ApiLoadBanner
        loadFailed={loadFailed && !allowMockFallback()}
        message="Không tải danh sách yêu cầu tài sản từ XBOS API."
      />
      <div className={`border border-xevn-border bg-xevn-surface p-5 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-xevn-textPrimary">Yêu cầu tài sản (KT 5 bước)</h3>
            <p className="text-sm text-xevn-textSecondary">Scoped theo JWT · companyId={companyId}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-lg border border-xevn-border px-3 py-2 text-sm ${SETTINGS_CONTROL_TEXT}`}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={RAIL_STROKE} />
              Tải lại
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen((o) => !o)}
              className={`inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-3 py-2 text-sm text-white ${SETTINGS_CONTROL_TEXT}`}
            >
              <Plus className="h-4 w-4" strokeWidth={RAIL_STROKE} />
              Tạo yêu cầu
            </button>
          </div>
        </div>

        {createOpen ? (
          <div className="mb-4 grid gap-3 rounded-lg border border-dashed border-xevn-border p-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className={SETTINGS_LABEL_CLASS}>Mã yêu cầu</span>
              <input
                className={`mt-1 w-full border border-xevn-border px-3 py-2 ${SETTINGS_RADIUS_INPUT}`}
                value={form.requestCode}
                onChange={(e) => setForm((s) => ({ ...s, requestCode: e.target.value }))}
                placeholder="AR-2026-001"
              />
            </label>
            <label className="block text-sm">
              <span className={SETTINGS_LABEL_CLASS}>Asset ID (tuỳ chọn)</span>
              <input
                className={`mt-1 w-full border border-xevn-border px-3 py-2 ${SETTINGS_RADIUS_INPUT}`}
                value={form.assetId}
                onChange={(e) => setForm((s) => ({ ...s, assetId: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className={SETTINGS_LABEL_CLASS}>Người yêu cầu</span>
              <input
                className={`mt-1 w-full border border-xevn-border px-3 py-2 ${SETTINGS_RADIUS_INPUT}`}
                value={form.requestedBy}
                onChange={(e) => setForm((s) => ({ ...s, requestedBy: e.target.value }))}
              />
            </label>
            <div className="sm:col-span-3">
              <button
                type="button"
                disabled={busyId === 'create'}
                onClick={() => void onCreate()}
                className="rounded-lg bg-xevn-primary px-4 py-2 text-sm text-white disabled:opacity-60"
              >
                {busyId === 'create' ? 'Đang lưu…' : 'Lưu yêu cầu'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-xevn-border text-left text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Người yêu cầu</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-xevn-textSecondary">
                    {loading ? 'Đang tải…' : 'Chưa có yêu cầu tài sản trong phạm vi.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const next = resolveAssetRequestNextStatus(row.status);
                  const statusKey = row.status ?? 'draft';
                  return (
                    <tr key={row.id} className="border-b border-xevn-border/60">
                      <td className="px-3 py-2 font-medium">{row.request_code ?? row.id.slice(0, 8)}</td>
                      <td className="px-3 py-2">
                        {ASSET_REQUEST_STATUS_LABELS[statusKey] ?? statusKey}
                      </td>
                      <td className="px-3 py-2">{row.requested_by ?? '—'}</td>
                      <td className="px-3 py-2">
                        {next ? (
                          <button
                            type="button"
                            disabled={busyId === row.id}
                            onClick={() => void onAdvance(row)}
                            className="rounded-lg border border-xevn-border px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                          >
                            → {ASSET_REQUEST_STATUS_LABELS[next] ?? next}
                          </button>
                        ) : (
                          <span className="text-sm text-xevn-textSecondary">Hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
