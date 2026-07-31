import React, { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import {
  approveCatalogTask,
  fetchCatalogApprovalDetail,
  fetchCatalogApprovalInbox,
  rejectCatalogTask,
  seedXeDuLichCatalogWorkflow,
  type CatalogApprovalTask,
} from '../../integrations/catalogGovernanceApi';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_LABEL_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_GRID,
  SETTINGS_SECTION_STACK,
} from './settings-form-pattern';
import { fetchHrmEffectiveCatalogStats, type HrmCatalogEffectiveStats } from '../../integrations/hrmCatalogStats';
import { MutationButton } from '../../components/common/MutationButton';
import { useConfirmDialog } from '../../components/common/useConfirmDialog';
import {
  resolveCatalogKeyDisplayLabel,
  resolveHatKeyDisplayLabel,
  shortenUuidForDisplay,
} from '../../utils/catalogDisplayLabels';
import { shouldShowWorkflowDevSeedControls } from '../../utils/workflowDisplayLabels';

const RAIL_STROKE = 1.5;
const REVIEWER = import.meta.env.VITE_DEV_USER_ID?.trim() || 'ceo@xe.vn';

export type CatalogGovernancePanelProps = {
  onStatusMessage?: (message: string | null) => void;
};

export const CatalogGovernancePanel: React.FC<CatalogGovernancePanelProps> = ({ onStatusMessage }) => {
  const { isMasterContext } = useTenantScope();
  const { requestConfirm, confirmDialog, confirming } = useConfirmDialog();
  const [tasks, setTasks] = useState<CatalogApprovalTask[]>([]);
  const [selected, setSelected] = useState<CatalogApprovalTask | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchCatalogApprovalDetail>> | null>(null);
  const [note, setNote] = useState('');
  const [inboxLoading, setInboxLoading] = useState(false);
  const [decisionPending, setDecisionPending] = useState(false);
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  const [catalogStats, setCatalogStats] = useState<HrmCatalogEffectiveStats | null>(null);
  const mutationBusy = decisionPending || confirming;

  const notify = useCallback(
    (message: string | null) => {
      setLocalMsg(message);
      onStatusMessage?.(message);
    },
    [onStatusMessage],
  );

  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    notify(null);
    try {
      const rows = await fetchCatalogApprovalInbox(REVIEWER);
      setTasks(rows);
      setSelected((prev) => {
        if (prev && rows.some((r) => r.id === prev.id)) return prev;
        return rows[0] ?? null;
      });
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Không tải được hộp thư duyệt');
    } finally {
      setInboxLoading(false);
    }
  }, [notify]);

  const loadCatalogStats = useCallback(async () => {
    const stats = await fetchHrmEffectiveCatalogStats();
    setCatalogStats(stats);
  }, []);

  useEffect(() => {
    if (isMasterContext) {
      void loadInbox();
      void loadCatalogStats();
    }
  }, [isMasterContext, loadInbox, loadCatalogStats]);

  useEffect(() => {
    if (!selected?.instance_id) {
      setDetail(null);
      return;
    }
    void fetchCatalogApprovalDetail(selected.instance_id)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [selected?.instance_id]);

  const executeDecision = async (decision: 'approve' | 'reject') => {
    if (!selected) return;
    setDecisionPending(true);
    try {
      if (decision === 'approve') {
        await approveCatalogTask(selected.id, REVIEWER, note);
        notify('Đã phê duyệt — danh mục được ghi vào HRM.');
      } else {
        await rejectCatalogTask(selected.id, REVIEWER, note);
        notify('Đã từ chối yêu cầu.');
      }
      setSelected(null);
      setDetail(null);
      setNote('');
      await loadInbox();
      await loadCatalogStats();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Thao tác thất bại');
    } finally {
      setDecisionPending(false);
    }
  };

  const promptApprove = () => {
    if (!selected || mutationBusy) return;
    const itemCount = detail?.batchDetail?.items?.length ?? 0;
    requestConfirm({
      title: 'Phê duyệt yêu cầu danh mục',
      description:
        itemCount > 0
          ? `Xác nhận phê duyệt ${itemCount} mục danh mục từ công ty thành viên? Danh mục sẽ được ghi vào HRM sau khi duyệt.`
          : 'Xác nhận phê duyệt yêu cầu bổ sung danh mục? Danh mục sẽ được ghi vào HRM sau khi duyệt.',
      confirmLabel: 'Phê duyệt',
      onConfirm: () => executeDecision('approve'),
    });
  };

  const promptReject = () => {
    if (!selected || mutationBusy) return;
    requestConfirm({
      title: 'Từ chối yêu cầu danh mục',
      description:
        'Xác nhận từ chối yêu cầu bổ sung danh mục này? Hành động không thể hoàn tác.',
      confirmLabel: 'Từ chối',
      destructive: true,
      onConfirm: () => executeDecision('reject'),
    });
  };

  if (!isMasterContext) {
    return (
      <p className={`${SETTINGS_CONTROL_TEXT} text-xevn-textSecondary`}>
        Chuyển tenant sang <strong className="font-semibold text-xevn-text">Tập đoàn (xevn)</strong> để duyệt yêu
        cầu bổ sung danh mục từ công ty thành viên.
      </p>
    );
  }

  return (
    <div className={SETTINGS_SECTION_STACK}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={inboxLoading || mutationBusy}
          onClick={() => void loadInbox()}
          className={`inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 font-medium text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 ${SETTINGS_CONTROL_TEXT}`}
        >
          <RefreshCw className="h-4 w-4" strokeWidth={RAIL_STROKE} aria-hidden />
          Làm mới
        </button>
        {shouldShowWorkflowDevSeedControls() ? (
          <button
            type="button"
            onClick={() => {
              void seedXeDuLichCatalogWorkflow()
                .then(() => notify('Đã seed quy trình phê duyệt danh mục (dev).'))
                .catch((e) => notify(e instanceof Error ? e.message : 'Seed quy trình thất bại'));
            }}
            className={`inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-3 py-2 font-medium text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
          >
            Seed quy trình (dev)
          </button>
        ) : null}
        <span className={`ml-auto text-sm text-xevn-textSecondary ${SETTINGS_CONTROL_TEXT}`}>
          Quy trình: Phê duyệt bổ sung danh mục — CT Du lịch → Tập đoàn
          {catalogStats ? (
            <>
              {' '}
              · Danh mục HRM hiệu lực:{' '}
              <strong className="tabular-nums text-xevn-text">
                {catalogStats.catalogCount}
              </strong>{' '}
              nhóm /{' '}
              <strong className="tabular-nums text-xevn-text">
                {catalogStats.effectiveItemCount}
              </strong>{' '}
              mục
            </>
          ) : (
            <span className="text-xs"> · Đang đọc số danh mục HRM…</span>
          )}
        </span>
      </div>

      {localMsg ? (
        <p className={`rounded-lg border border-xevn-border bg-slate-50 px-4 py-2 text-sm text-slate-700 ${SETTINGS_CONTROL_TEXT}`}>
          {localMsg}
        </p>
      ) : null}

      <div className={`${SETTINGS_SECTION_GRID} gap-6`}>
        <div className="col-span-12 space-y-2 lg:col-span-4">
          <h4 className={`${SETTINGS_LABEL_CLASS} text-slate-500`}>Hộp thư ({tasks.length})</h4>
          {tasks.length === 0 ? (
            <p className={`text-sm text-xevn-textSecondary ${SETTINGS_CONTROL_TEXT}`}>Không có tác vụ chờ duyệt.</p>
          ) : (
            tasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelected(t)}
                className={`w-full rounded-xl border p-4 text-left transition active:scale-[0.99] ${
                  selected?.id === t.id
                    ? 'border-xevn-primary bg-xevn-primary/5 shadow-sm'
                    : 'border-xevn-border bg-white hover:bg-slate-50'
                }`}
              >
                <p className={`font-medium text-xevn-text ${SETTINGS_CONTROL_TEXT}`}>{t.workflow_name}</p>
                <p
                  className="mt-1 text-sm text-xevn-textSecondary"
                  title={t.business_id}
                >
                  Mã lô: {shortenUuidForDisplay(t.business_id)}
                </p>
                <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  {resolveHatKeyDisplayLabel(t.hat_key)}
                </span>
              </button>
            ))
          )}
        </div>

        <div
          className={`col-span-12 border border-xevn-border bg-white p-6 shadow-soft lg:col-span-8 ${SETTINGS_RADIUS_CARD}`}
        >
          {!selected ? (
            <p className={`text-xevn-textSecondary ${SETTINGS_CONTROL_TEXT}`}>
              Chọn một yêu cầu để xem chi tiết và phê duyệt.
            </p>
          ) : (
            <>
              <h4 className={`text-lg font-semibold text-xevn-text ${SETTINGS_CONTROL_TEXT}`}>Chi tiết yêu cầu</h4>
              <p className={`mt-1 text-sm text-xevn-textSecondary ${SETTINGS_CONTROL_TEXT}`}>
                Tenant nguồn:{' '}
                <span className="font-mono text-xevn-text">
                  {String((detail?.instance?.context as Record<string, unknown>)?.memberTenantId ?? 'xe-du-lich')}
                </span>
              </p>
              <div className={`mt-4 max-h-80 overflow-auto border border-xevn-border ${SETTINGS_RADIUS_INPUT}`}>
                <table className={`min-w-full ${SETTINGS_CONTROL_TEXT}`}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Danh mục</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Mã</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-slate-500">Nhãn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detail?.batchDetail?.items ?? []).map((row) => (
                      <tr key={String(row.id)} className="border-t border-xevn-border">
                        <td className="px-3 py-2 text-sm">
                          {resolveCatalogKeyDisplayLabel(String(row.catalog_key ?? ''))}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{String(row.code)}</td>
                        <td className="px-3 py-2">{String(row.label)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <label className="mt-4 block">
                <span className={SETTINGS_LABEL_CLASS}>Ghi chú duyệt</span>
                <textarea
                  className={`mt-1 w-full border border-xevn-border p-3 text-sm ${SETTINGS_RADIUS_INPUT}`}
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ý kiến phê duyệt / từ chối"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <MutationButton
                  pending={mutationBusy}
                  disabled={!selected || inboxLoading}
                  onClick={promptApprove}
                  className={`inline-flex items-center gap-2 rounded-input border-0 bg-xevn-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:opacity-90 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
                >
                  <Check className="h-4 w-4" strokeWidth={RAIL_STROKE} aria-hidden />
                  Phê duyệt
                </MutationButton>
                <MutationButton
                  pending={mutationBusy}
                  disabled={!selected || inboxLoading}
                  onClick={promptReject}
                  className={`inline-flex items-center gap-2 rounded-input border border-xevn-border bg-white px-4 py-2 font-semibold text-xevn-text shadow-soft transition hover:bg-slate-50 active:scale-95 ${SETTINGS_CONTROL_TEXT}`}
                >
                  <X className="h-4 w-4" strokeWidth={RAIL_STROKE} aria-hidden />
                  Từ chối
                </MutationButton>
              </div>
            </>
          )}
        </div>
      </div>
      {confirmDialog}
    </div>
  );
};

/** Số tác vụ chờ — dùng widget GROUP Command Center */
export async function fetchCatalogGovernancePendingCount(): Promise<number> {
  try {
    const rows = await fetchCatalogApprovalInbox(REVIEWER);
    return rows.length;
  } catch {
    return 0;
  }
};
