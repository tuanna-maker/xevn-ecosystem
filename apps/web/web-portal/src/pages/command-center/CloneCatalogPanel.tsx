/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cài đặt → Sao chép bộ danh mục
 * UC:         XBOS-DM-09
 * BR:         onConflict=reject → XBOS-CFG-409 · AU member → ẩn / XBOS-AUTH-003
 * SRS:        docs/qa/professional/by-uc/XBOS-DM-09.md · BANG_TONG_HOP STT 85
 * TechSpec:   OpenAPI configSyncCloneCatalog · TECHSPEC_HE §8.1
 * Purpose:    Wizard chọn catalog + một ĐVTV đích → POST …/catalog/{key}/clone;
 *             hiện XBOS-CFG-206 + dest.itemCount; conflict toast CFG-409.
 * WorkItem:   PO-UC-TC-W3-FE-DM09
 * Coded:      2026-08-04
 * Callers:    CommandCenterPage settings menu hrm_catalog_clone
 * Callees:    configSyncCloneCatalog · fetchGroupMemberUnitsForCommandCenter
 * FEActions:  Chọn key → Chọn ĐVTV → Sao chép → toast CFG-206 → F5/verify dest
 * must_keep:  ApplyCatalogToMembersPanel = DM-HRM-07 only · leave L2 · U65 no seed
 * LastVerified: apps/web/web-portal/src/pages/command-center/CloneCatalogPanel.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-DM09
 * change_mode: ADD
 * What: Panel «Sao chép bộ danh mục» → POST …/clone (not apply-to-members / clone-bundle)
 * Why: QA R-DM09-FE-WIRE — FE grep 0; API CFG-206/409/AUTH-003 live
 * SRS: XBOS-DM-09 TC-DM09-OPEN/CPY/VER
 * must_keep: DM-HRM-07 Apply panel semantics · U72 VI labels · no seed
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Company } from '../../data/mock-data';
import { MutationButton } from '../../components/common/MutationButton';
import { useConfirmDialog } from '../../components/common/useConfirmDialog';
import { getStoredUser } from '../../integrations/authSession';
import { isGroupCeoOnMasterTenant } from '../../integrations/commandCenterScope';
import type { ConfigCatalogSnapshot } from '../../integrations/configSyncApplyMembers';
import {
  CLONE_CATALOG_KEYS,
  CLONE_CATALOG_LABELS,
  buildCloneCatalogBody,
  cloneCatalog,
  fetchCloneDestCatalog,
  fetchCloneSourceCatalog,
  formatCloneCatalogUserError,
  listCloneMemberCandidates,
  type CloneCatalogKey,
  type CloneCatalogResult,
} from '../../integrations/configSyncCloneCatalog';
import { fetchGroupMemberUnitsForCommandCenter } from '../../integrations/tenantScopeApi';
import { formatApplyCatalogSourceScopeDisplay } from './ApplyCatalogToMembersPanel';
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

export type CloneCatalogPanelProps = {
  onStatusMessage?: (message: string | null) => void;
  members?: Company[] | null;
  /** Inject for tests — default reads JWT via isGroupCeoOnMasterTenant(). */
  canClone?: boolean;
};

function companyLabel(row: Company): string {
  const short = row.shortName?.trim() || row.code?.trim();
  const name = row.name?.trim();
  if (short && name && short !== name) return `${short} — ${name}`;
  return name || short || row.id;
}

export const CloneCatalogPanel: React.FC<CloneCatalogPanelProps> = ({
  onStatusMessage,
  members: membersProp,
  canClone: canCloneProp,
}) => {
  const allowed = canCloneProp ?? isGroupCeoOnMasterTenant();
  const { requestConfirm, confirmDialog, confirming } = useConfirmDialog();
  const [catalogKey, setCatalogKey] = useState<CloneCatalogKey>('job_titles');
  const [members, setMembers] = useState<Company[]>(membersProp ?? []);
  const [membersLoading, setMembersLoading] = useState(!membersProp);
  const [membersNotice, setMembersNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [source, setSource] = useState<ConfigCatalogSnapshot | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [destVerify, setDestVerify] = useState<ConfigCatalogSnapshot | null>(null);
  const [destVerifyNote, setDestVerifyNote] = useState<string | null>(null);
  const [clonePending, setClonePending] = useState(false);
  const [lastResult, setLastResult] = useState<CloneCatalogResult | null>(null);
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const notify = useCallback(
    (message: string | null) => {
      setLocalMsg(message);
      onStatusMessage?.(message);
    },
    [onStatusMessage],
  );

  const candidates = useMemo(() => listCloneMemberCandidates(members), [members]);
  const selectedMember = useMemo(
    () => candidates.find((row) => row.id === selectedId) ?? null,
    [candidates, selectedId],
  );

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
      setSelectedId((prev) => (prev && rows.some((r) => r.id === prev) ? prev : null));
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
      const snap = await fetchCloneSourceCatalog(catalogKey);
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

  const executeClone = async () => {
    if (!selectedMember) {
      notify('Chọn một đơn vị thành viên đích.');
      return;
    }
    if (!source?.items?.length) {
      notify('Nguồn trống — không sao chép được (XBOS-VAL-005).');
      return;
    }
    const catalogLabel = CLONE_CATALOG_LABELS[catalogKey];
    setClonePending(true);
    notify(null);
    setErrorMsg(null);
    setLastResult(null);
    setDestVerify(null);
    setDestVerifyNote(null);
    try {
      const user = getStoredUser();
      const actor = user?.userId?.trim() || user?.displayName?.trim() || 'portal-group-ceo';
      const body = buildCloneCatalogBody({
        destMember: selectedMember,
        actor,
        onConflict: 'reject',
      });
      const result = await cloneCatalog(catalogKey, body);
      setLastResult(result);
      notify(
        `Đã sao chép «${catalogLabel}»: XBOS-CFG-206 · đích ${result.dest.itemCount} mục · version ${result.dest.version}`,
      );
      await loadSource();
      try {
        const destSnap = await fetchCloneDestCatalog(
          catalogKey,
          result.dest.tenantId,
          result.dest.companyId,
        );
        setDestVerify(destSnap);
        setDestVerifyNote(null);
      } catch (verifyErr) {
        setDestVerify(null);
        setDestVerifyNote(
          formatCloneCatalogUserError(verifyErr) ||
            'Không tải được snapshot đích (có thể 409 phạm vi Group CEO) — dùng persona ĐVTV để F5 xác nhận.',
        );
      }
    } catch (e) {
      const text = formatCloneCatalogUserError(e);
      setErrorMsg(text);
      notify(null);
      onStatusMessage?.(text);
    } finally {
      setClonePending(false);
    }
  };

  const promptClone = () => {
    if (!allowed) {
      setErrorMsg('Chỉ CEO tập đoàn được sao chép bộ danh mục (XBOS-AUTH-003).');
      return;
    }
    if (!selectedMember) {
      notify('Chọn một đơn vị thành viên đích.');
      return;
    }
    if (!source) {
      notify('Chưa tải được catalog nguồn tập đoàn — bấm «Tải lại nguồn tập đoàn».');
      return;
    }
    if (!source.items.length) {
      notify('Nguồn trống — không sao chép được.');
      return;
    }
    const catalogLabel = CLONE_CATALOG_LABELS[catalogKey];
    requestConfirm({
      title: 'Sao chép bộ danh mục',
      description: `Sao chép «${catalogLabel}» từ tập đoàn sang «${companyLabel(selectedMember)}»? Xung đột mã trên đích sẽ bị chặn (XBOS-CFG-409). Không dùng Áp dụng ĐVTV (DM-HRM-07).`,
      confirmLabel: 'Sao chép',
      onConfirm: () => executeClone(),
    });
  };

  const busy = clonePending || confirming || sourceLoading || membersLoading;

  if (!allowed) {
    return (
      <div
        className={`${SETTINGS_SECTION_STACK} min-h-[min(240px,40vh)]`}
        data-testid="clone-catalog-panel-forbidden"
      >
        <div>
          <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Sao chép bộ danh mục</h3>
          <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>XBOS-DM-09</p>
        </div>
        <p
          className="rounded-input border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm text-amber-950"
          role="alert"
          data-testid="clone-catalog-au-blocked"
        >
          Chức năng chỉ dành cho CEO tập đoàn trên tenant master. Tài khoản công ty thành viên không
          được sao chép (API trả XBOS-AUTH-003).
        </p>
      </div>
    );
  }

  return (
    <div className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`} data-testid="clone-catalog-panel">
      {confirmDialog}
      <div>
        <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Sao chép bộ danh mục</h3>
        <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
          XBOS-DM-09 — nhân bản một bộ danh mục từ tập đoàn sang một phạm vi đích (partition). Khác «Áp
          dụng danh mục HRM» (DM-HRM-07 fan-out) và clone-bundle logistics.
        </p>
      </div>

      <div className={`space-y-4 border border-xevn-border bg-white p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="clone-catalog-key" className={SETTINGS_LABEL_CLASS}>
              Bộ danh mục nguồn
            </label>
            <select
              id="clone-catalog-key"
              className={`w-full border border-xevn-border bg-white px-3 py-2 text-[15px] ${SETTINGS_RADIUS_INPUT}`}
              value={catalogKey}
              disabled={busy}
              onChange={(e) => {
                setCatalogKey(e.target.value as CloneCatalogKey);
                setLastResult(null);
                setDestVerify(null);
                setErrorMsg(null);
              }}
              data-testid="clone-catalog-key"
            >
              {CLONE_CATALOG_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CLONE_CATALOG_LABELS[key]}
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
            <div className="space-y-1 text-slate-700" data-testid="clone-catalog-source-summary">
              <p>
                <span className="font-semibold text-xevn-text">Nguồn tập đoàn:</span>{' '}
                {formatApplyCatalogSourceScopeDisplay(source.tenantId, source.companyId)} · version{' '}
                {source.version} · {source.items.length} mục
              </p>
            </div>
          ) : (
            <p className="text-slate-500">Chưa có snapshot nguồn.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className={SETTINGS_LABEL_CLASS}>Đơn vị thành viên đích (một phạm vi)</p>
          {membersNotice ? (
            <p className="text-sm text-rose-700" role="alert">
              {membersNotice}
            </p>
          ) : null}
          {membersLoading ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>Đang tải danh sách ĐVTV…</p>
          ) : candidates.length === 0 ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
              Không có đơn vị thành viên đích (cần quyền Group CEO + group-member-units).
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-input border border-xevn-border p-2">
              {candidates.map((row) => {
                const checked = selectedId === row.id;
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-input px-3 py-2 text-left text-[15px] transition hover:bg-slate-50 ${
                        checked ? 'bg-blue-50/80' : ''
                      }`}
                      onClick={() => setSelectedId(row.id)}
                      disabled={busy}
                      aria-pressed={checked}
                      data-testid={`clone-dest-${row.id}`}
                    >
                      <span
                        className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                          checked ? 'border-xevn-primary bg-xevn-primary' : 'border-slate-300'
                        }`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-xevn-text">{companyLabel(row)}</span>
                        <span className="block text-xs text-slate-500">
                          tenant {row.tenantId ?? '—'}
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
            pending={clonePending || confirming}
            disabled={busy || !selectedMember || !source?.items?.length}
            onClick={promptClone}
            data-testid="clone-catalog-submit"
          >
            Sao chép bộ danh mục
          </MutationButton>
          <span className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
            POST …/catalog/{'{key}'}/clone → XBOS-CFG-206
          </span>
        </div>

        {errorMsg ? (
          <p
            className="rounded-input border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            role="alert"
            data-testid="clone-catalog-error"
          >
            {errorMsg}
          </p>
        ) : null}

        {localMsg ? (
          <p
            className="rounded-input border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
            data-testid="clone-catalog-status"
          >
            {localMsg}
          </p>
        ) : null}

        {lastResult ? (
          <div
            className="rounded-input border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
            data-testid="clone-catalog-result"
          >
            <p className="font-semibold text-xevn-text">Kết quả: XBOS-CFG-206</p>
            <p className="mt-1">
              Nguồn {lastResult.source.itemCount} mục → đích{' '}
              {formatApplyCatalogSourceScopeDisplay(
                lastResult.dest.tenantId,
                lastResult.dest.companyId,
              )}{' '}
              · {lastResult.dest.itemCount} mục · version {lastResult.dest.version}
            </p>
          </div>
        ) : null}

        {destVerify ? (
          <div
            className="rounded-input border border-emerald-200 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-950"
            data-testid="clone-catalog-dest-verify"
          >
            <p className="font-semibold">Xác nhận đích (sau sao chép)</p>
            <p className="mt-1">
              {formatApplyCatalogSourceScopeDisplay(destVerify.tenantId, destVerify.companyId)} ·{' '}
              {destVerify.items.length} mục · version {destVerify.version}
            </p>
          </div>
        ) : null}

        {destVerifyNote ? (
          <p className="text-sm text-amber-900" data-testid="clone-catalog-dest-verify-note">
            {destVerifyNote}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default CloneCatalogPanel;
