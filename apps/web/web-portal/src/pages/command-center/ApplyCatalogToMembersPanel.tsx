/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cài đặt → Áp dụng danh mục HRM (ĐVTV)
 * UC:         XBOS-DM-HRM-07
 * BR:         G-BM-REC-01 · BM-06 apply catalog to members · BR-XBOS-COPY-01
 * SRS:        docs/hrm/DANH_MUC_XBOS_CHO_HRM.md §14 · docs/xbos/SRS_FIELD_DISPLAY.md F-XBOS-10 / AC-F-XBOS-10
 * TechSpec:   docs/qa/evidence/bm-be-cfg-apply-members-01-20260722.md
 * Purpose:    Wizard chọn catalog allow-list + ĐVTV → POST apply-to-members; hiện appliedCount/checksum.
 *             Tóm tắt nguồn hiển thị «tập đoàn» — không lộ wire companyId `holding` (U72).
 * WorkItem:   BM-FE-CFG-APPLY-MEMBERS-01 · D-XBOS-U72-F10-HOLDING-PATH-01
 * Coded:      2026-07-22
 * Callers:    CommandCenterPage settings menu hrm_catalog_apply_members
 * Callees:    configSyncApplyMembers · fetchGroupMemberUnitsForCommandCenter
 * FEActions:  Chọn key → Tải nguồn → Chọn ĐVTV → Áp dụng → toast appliedCount → F5 giữ nguồn tập đoàn
 * must_keep:  JD-only YCTD · hire title · U65 no seed · allow-list only · API companyId wire giữ `holding`
 * LastVerified: apps/web/web-portal/src/pages/command-center/ApplyCatalogToMembersPanel.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BM-FE-CFG-APPLY-MEMBERS-01
 * change_mode: ADD
 * What: Panel Áp dụng danh mục HRM → ĐVTV (job_titles / recruitment_channels / job_grades)
 * Why: QA R2 documented FE UX ABSENT; BE XBOS-CFG-204 READY
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-XBOS-U72-F10-HOLDING-PATH-01
 * change_mode: FIX
 * What: formatApplyCatalogSourceScopeDisplay — companyId holding/main → «tập đoàn»; tóm tắt nguồn không còn xevn/holding
 * Why: QA AC-F-XBOS-10 FAIL — user-facing copy cấm EN holding (BR-XBOS-COPY-01 / display-label-no-raw-key)
 * SRS: docs/xbos/SRS_FIELD_DISPLAY.md F-XBOS-10 · AC-F-XBOS-10 · BR-XBOS-COPY-01
 * must_keep: POST body / GET snapshot companyId wire; F-XBOS-01..09,11; ENTITY_LEVEL_LABELS
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-FE-U72-SOFT-P2-01
 * change_mode: FIX
 * What: Dropdown + confirm description chỉ nhãn VI — bỏ `(job_titles)` paren slug
 * Why: QC C-XBOS-U72-P2 soft — Apply panel `Chức danh (job_titles)`
 * SRS: docs/xbos/SRS_FIELD_DISPLAY.md · BR-XBOS-COPY-01 · U72
 * must_keep: select value= catalogKey wire; F-XBOS-10 CLOSED; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-29 D-FE-XBOS-CTRL-G1-ALLOWLIST-01
 * change_mode: ADD
 * What: Dropdown P0∪P1 từ APPLY_TO_MEMBERS_CATALOG_KEYS; apply writeKey = source.catalogKey (DEC)
 * Why: Mirror BE G1 allow-list — departments/leave_types/P1 + SA-DEC-WRITE-01
 * SRS: BA_ERP_XBOS_CTRL_SPEC §2.1–2.2 · FR-XBOS-CTRL-01
 * must_keep: U72 VI labels · holding wire companyId · U65 no seed · P2 không hiện dropdown
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckSquare, RefreshCw, Square } from 'lucide-react';
import type { Company } from '../../data/mock-data';
import { MutationButton } from '../../components/common/MutationButton';
import { useConfirmDialog } from '../../components/common/useConfirmDialog';
import { getStoredUser } from '../../integrations/authSession';
import {
  APPLY_TO_MEMBERS_CATALOG_KEYS,
  APPLY_TO_MEMBERS_CATALOG_LABELS,
  MEMBER_SCOPE_409_NOTE,
  applyCatalogToMembers,
  buildApplyCatalogToMembersBody,
  fetchConfigCatalogForHrm,
  listApplyMemberCandidates,
  type ApplyCatalogToMembersResult,
  type ApplyToMembersCatalogKey,
  type ConfigCatalogSnapshot,
} from '../../integrations/configSyncApplyMembers';
import {
  GROUP_HOLDING_ROOT_ID,
  fetchGroupMemberUnitsForCommandCenter,
} from '../../integrations/tenantScopeApi';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_LABEL_CLASS,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_STACK,
  SETTINGS_SECTION_TITLE_CLASS,
} from './settings-form-pattern';

const RAIL_STROKE = 1.5;

export type ApplyCatalogToMembersPanelProps = {
  onStatusMessage?: (message: string | null) => void;
  /** Optional inject for tests / parent already-loaded members. */
  members?: Company[] | null;
};

function companyLabel(row: Company): string {
  const short = row.shortName?.trim() || row.code?.trim();
  const name = row.name?.trim();
  if (short && name && short !== name) return `${short} — ${name}`;
  return name || short || row.id;
}

/**
 * User-facing scope for Apply Catalog source summary (F-XBOS-10).
 * Wire/API still use companyId=`holding`; never echo that token in UI copy.
 */
export function formatApplyCatalogSourceScopeDisplay(
  tenantId: string,
  companyId: string,
): string {
  const cid = companyId.trim().toLowerCase();
  // Map holding / main slug → VI business label (BR-XBOS-COPY-01).
  if (cid === 'holding' || cid === 'main') {
    return 'tập đoàn';
  }
  const tid = tenantId.trim();
  const rawCompany = companyId.trim();
  if (!tid && !rawCompany) return '—';
  if (!rawCompany) return tid;
  if (!tid) return rawCompany;
  return `${tid}/${rawCompany}`;
}

export const ApplyCatalogToMembersPanel: React.FC<ApplyCatalogToMembersPanelProps> = ({
  onStatusMessage,
  members: membersProp,
}) => {
  const { requestConfirm, confirmDialog, confirming } = useConfirmDialog();
  const [catalogKey, setCatalogKey] = useState<ApplyToMembersCatalogKey>('job_titles');
  const [members, setMembers] = useState<Company[]>(membersProp ?? []);
  const [membersLoading, setMembersLoading] = useState(!membersProp);
  const [membersNotice, setMembersNotice] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [source, setSource] = useState<ConfigCatalogSnapshot | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [applyPending, setApplyPending] = useState(false);
  const [lastResult, setLastResult] = useState<ApplyCatalogToMembersResult | null>(null);
  const [localMsg, setLocalMsg] = useState<string | null>(null);

  const notify = useCallback(
    (message: string | null) => {
      setLocalMsg(message);
      onStatusMessage?.(message);
    },
    [onStatusMessage],
  );

  const candidates = useMemo(() => listApplyMemberCandidates(members), [members]);

  const loadMembers = useCallback(async () => {
    if (membersProp) {
      setMembers(membersProp);
      setMembersLoading(false);
      return;
    }
    setMembersLoading(true);
    setMembersNotice(null);
    try {
      const rows = await fetchGroupMemberUnitsForCommandCenter();
      setMembers(rows);
      setSelectedIds((prev) => {
        const next = new Set<string>();
        for (const id of prev) {
          if (rows.some((r) => r.id === id && r.id !== GROUP_HOLDING_ROOT_ID)) next.add(id);
        }
        return next;
      });
    } catch (e) {
      setMembers([]);
      setMembersNotice(e instanceof Error ? e.message : 'Không tải được đơn vị thành viên');
    } finally {
      setMembersLoading(false);
    }
  }, [membersProp]);

  const loadSource = useCallback(async () => {
    setSourceLoading(true);
    setSourceError(null);
    try {
      const snap = await fetchConfigCatalogForHrm(catalogKey);
      setSource(snap);
    } catch (e) {
      setSource(null);
      setSourceError(e instanceof Error ? e.message : 'Không tải được danh mục nguồn tập đoàn');
    } finally {
      setSourceLoading(false);
    }
  }, [catalogKey]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    void loadSource();
  }, [loadSource]);

  useEffect(() => {
    if (membersProp) setMembers(membersProp);
  }, [membersProp]);

  const selectedMembers = useMemo(
    () => candidates.filter((row) => selectedIds.has(row.id)),
    [candidates, selectedIds],
  );

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(candidates.map((c) => c.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const executeApply = async () => {
    if (selectedMembers.length === 0) {
      notify('Chọn ít nhất một đơn vị thành viên.');
      return;
    }
    const catalogLabel = APPLY_TO_MEMBERS_CATALOG_LABELS[catalogKey];
    setApplyPending(true);
    notify(null);
    setLastResult(null);
    try {
      const user = getStoredUser();
      const actor = user?.userId?.trim() || user?.displayName?.trim() || 'portal-group-ceo';
      const body = buildApplyCatalogToMembersBody({
        selectedMembers,
        actor,
      });
      // DEC: POST path = source L0 key (hr_decision_types) when dual-read loaded that sibling.
      const result = await applyCatalogToMembers(catalogKey, body, {
        writeKey: source?.catalogKey,
      });
      setLastResult(result);
      const checksumShort = result.source.checksum?.slice(0, 18) ?? '—';
      notify(
        `Đã áp dụng ${catalogLabel}: appliedCount=${result.appliedCount} · nguồn ${result.source.itemCount} mục · ${checksumShort}…`,
      );
      // F5 contract: reload group source snapshot — must still show source items.
      await loadSource();
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Áp dụng danh mục thất bại');
    } finally {
      setApplyPending(false);
    }
  };

  const promptApply = () => {
    if (selectedMembers.length === 0) {
      notify('Chọn ít nhất một đơn vị thành viên.');
      return;
    }
    if (!source) {
      notify('Chưa tải được catalog nguồn tập đoàn — bấm «Tải lại nguồn tập đoàn».');
      return;
    }
    const catalogLabel = APPLY_TO_MEMBERS_CATALOG_LABELS[catalogKey];
    requestConfirm({
      title: 'Áp dụng danh mục sang ĐVTV',
      description: `Sao chép «${catalogLabel}» từ tập đoàn sang ${selectedMembers.length} đơn vị thành viên đã chọn? Mỗi ĐVTV nhận snapshot (version/checksum) giống publish đơn lẻ.`,
      confirmLabel: 'Áp dụng',
      onConfirm: () => executeApply(),
    });
  };

  const busy = applyPending || confirming || sourceLoading || membersLoading;

  return (
    <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`} data-testid="apply-catalog-to-members-panel">
      {confirmDialog}
      <div>
        <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Áp dụng danh mục HRM sang ĐVTV</h3>
        <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
          XBOS-DM-HRM-07 — sao chép danh mục tập đoàn (allow-list P0+P1: chức danh, phòng ban, loại nghỉ,
          loại HĐ, ca làm việc, loại quyết định, …) sang đơn vị thành viên đã chọn. Không thay publish đơn lẻ.
        </p>
      </div>

      <div className={`space-y-4 border border-xevn-border bg-white p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="apply-catalog-key" className={SETTINGS_LABEL_CLASS}>
              Danh mục nguồn (allow-list)
            </label>
            <select
              id="apply-catalog-key"
              className={`w-full border border-xevn-border bg-white px-3 py-2 text-[15px] ${SETTINGS_RADIUS_INPUT}`}
              value={catalogKey}
              disabled={busy}
              onChange={(e) => {
                setCatalogKey(e.target.value as ApplyToMembersCatalogKey);
                setLastResult(null);
              }}
            >
              {APPLY_TO_MEMBERS_CATALOG_KEYS.map((key) => (
                <option key={key} value={key}>
                  {APPLY_TO_MEMBERS_CATALOG_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-8 flex flex-wrap items-end gap-2">
            <MutationButton
              type="button"
              variant="neutral"
              pending={sourceLoading}
              disabled={busy && !sourceLoading}
              onClick={() => void loadSource()}
            >
              <RefreshCw className="h-4 w-4" strokeWidth={RAIL_STROKE} />
              Tải lại nguồn tập đoàn
            </MutationButton>
            <MutationButton
              type="button"
              variant="neutral"
              pending={membersLoading}
              disabled={busy && !membersLoading}
              onClick={() => void loadMembers()}
            >
              <RefreshCw className="h-4 w-4" strokeWidth={RAIL_STROKE} />
              Làm mới ĐVTV
            </MutationButton>
          </div>
        </div>

        <div className={`rounded-input border border-slate-200 bg-slate-50/80 px-3 py-3 ${SETTINGS_CONTROL_TEXT}`}>
          {sourceLoading ? (
            <p className="text-slate-500">Đang tải catalog nguồn…</p>
          ) : sourceError ? (
            <p className="text-rose-700" role="alert">
              {sourceError}
            </p>
          ) : source ? (
            <div className="space-y-1 text-slate-700" data-testid="apply-catalog-source-summary">
              <p>
                <span className="font-semibold text-xevn-text">Nguồn tập đoàn:</span>{' '}
                {formatApplyCatalogSourceScopeDisplay(source.tenantId, source.companyId)} · version{' '}
                {source.version} · {source.items.length} mục
              </p>
              <p className="font-mono text-xs text-slate-500 break-all">checksum: {source.checksum}</p>
            </div>
          ) : (
            <p className="text-slate-500">Chưa có snapshot nguồn.</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={SETTINGS_LABEL_CLASS}>Đơn vị thành viên đích</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="text-sm font-medium text-xevn-primary hover:underline disabled:opacity-50"
                disabled={busy || candidates.length === 0}
                onClick={selectAll}
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                className="text-sm font-medium text-slate-600 hover:underline disabled:opacity-50"
                disabled={busy || selectedIds.size === 0}
                onClick={clearSelection}
              >
                Bỏ chọn
              </button>
            </div>
          </div>
          {membersNotice ? (
            <p className="text-sm text-rose-700" role="alert">
              {membersNotice}
            </p>
          ) : null}
          {membersLoading ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>Đang tải danh sách ĐVTV…</p>
          ) : candidates.length === 0 ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
              Không có đơn vị thành viên để áp dụng (cần quyền Group CEO + group-member-units).
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-input border border-xevn-border p-2">
              {candidates.map((row) => {
                const checked = selectedIds.has(row.id);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-input px-3 py-2 text-left text-[15px] transition hover:bg-slate-50 ${
                        checked ? 'bg-blue-50/80' : ''
                      }`}
                      onClick={() => toggleMember(row.id)}
                      disabled={busy}
                      aria-pressed={checked}
                      data-testid={`apply-member-${row.id}`}
                    >
                      {checked ? (
                        <CheckSquare className="h-5 w-5 shrink-0 text-xevn-primary" strokeWidth={RAIL_STROKE} />
                      ) : (
                        <Square className="h-5 w-5 shrink-0 text-xevn-textMuted" strokeWidth={RAIL_STROKE} />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-xevn-text">{companyLabel(row)}</span>
                        <span className="block text-xs text-slate-500">
                          tenant {row.tenantId ?? '—'} · id {row.id}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MutationButton
            type="button"
            variant="success"
            pending={applyPending || confirming}
            disabled={busy || selectedMembers.length === 0 || !source}
            onClick={promptApply}
            data-testid="apply-catalog-submit"
          >
            Áp dụng cho {selectedMembers.length || 0} ĐVTV
          </MutationButton>
          <span className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
            POST …/catalog/{'{key}'}/apply-to-members → XBOS-CFG-204
          </span>
        </div>

        {localMsg ? (
          <p
            className="rounded-input border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
            data-testid="apply-catalog-status"
          >
            {localMsg}
          </p>
        ) : null}

        {lastResult ? (
          <div
            className="rounded-input border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
            data-testid="apply-catalog-result"
          >
            <p className="font-semibold text-xevn-text">
              Kết quả: appliedCount = {lastResult.appliedCount}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500 break-all">
              source checksum: {lastResult.source.checksum}
            </p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-slate-600">
              {lastResult.applied.map((row) => (
                <li key={`${row.tenantId}/${row.companyId}`}>
                  {formatApplyCatalogSourceScopeDisplay(row.tenantId, row.companyId)} · v
                  {row.version} · {row.checksum.slice(0, 18)}…
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <aside
          className="rounded-input border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm text-amber-950"
          data-testid="apply-catalog-member-scope-note"
        >
          <p className="font-semibold">Lưu ý phạm vi Group CEO</p>
          <p className="mt-1 leading-snug">{MEMBER_SCOPE_409_NOTE}</p>
        </aside>
      </div>
    </div>
  );
};

export default ApplyCatalogToMembersPanel;
