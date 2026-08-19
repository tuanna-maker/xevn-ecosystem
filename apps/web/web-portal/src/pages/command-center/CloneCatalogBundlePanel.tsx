/**
 * @CODE-MEMORY
 * Screen:     Command Center → Cài đặt → Sao chép bộ danh mục LOG
 * UC:         XBOS-DM-LOG-09
 * BR:         BR-XBOS-COPY-01 · AU group_* only
 * SRS:        docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md STT local 9 · PHASE1 STT 106
 * TechSpec:   docs/logistics/TECHSPEC_M03_DM_LOG_P1.md §2 · by-uc XBOS-DM-LOG-09
 * Purpose:    Wizard chọn CT đích → POST catalogs/clone-bundle domains=['logistics'];
 *             hiện XBOS-CFG-205 / CFG-009; F5 liệt kê khóa đích.
 * WorkItem:   PO-UC-TC-W3-FE-LOG09
 * Coded:      2026-08-04
 * Callers:    CommandCenterPage settings menu log_catalog_clone_bundle
 * Callees:    configSyncCloneBundle · fetchGroupMemberUnitsForCommandCenter · isGroupCeoOnMasterTenant
 * FEActions:  Chọn đích → Xác nhận → Sao chép bộ → toast CFG-205 → Tải lại khóa đích
 * must_keep:  ApplyCatalogToMembersPanel (DM-HRM-07) · DM-09 single-key clone · Leave L2 · U65
 * LastVerified: apps/web/web-portal/src/pages/command-center/CloneCatalogBundlePanel.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-LOG09
 * change_mode: ADD
 * What: Panel «Sao chép bộ danh mục» LOG spoke — wire clone-bundle + HDSD testids
 * Why: QA W3 LOG-09 FE GAP after API CFG-205/009/AUTH PASS
 * must_keep: ≠ apply-to-members; ≠ POST catalog/{key}/clone; domains logistics only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { Company } from '../../data/mock-data';
import { MutationButton } from '../../components/common/MutationButton';
import { useConfirmDialog } from '../../components/common/useConfirmDialog';
import { getStoredUser } from '../../integrations/authSession';
import { isGroupCeoOnMasterTenant } from '../../integrations/commandCenterScope';
import {
  CLONE_BUNDLE_LOGISTICS_DOMAINS,
  buildCloneCatalogBundleBody,
  cloneCatalogBundle,
  ensureLogisticsCloneDestOption,
  fetchCloneBundleDestKeySnapshots,
  formatCloneBundleSuccessMessage,
  listCloneBundleDestCandidates,
  resolveCloneBundleDestScope,
  type CloneBundleConflictPolicy,
  type CloneCatalogBundleResponse,
  type ConfigCatalogListRow,
} from '../../integrations/configSyncCloneBundle';
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

const ON_CONFLICT_LABELS: Record<CloneBundleConflictPolicy, string> = {
  fail: 'Chặn khi đích đã có khóa (fail)',
  skip: 'Bỏ qua khóa trùng (skip)',
  overwrite: 'Ghi đè khóa trùng (overwrite)',
};

export type CloneCatalogBundlePanelProps = {
  onStatusMessage?: (message: string | null) => void;
  members?: Company[] | null;
};

function companyLabel(row: Company): string {
  const short = row.shortName?.trim() || row.code?.trim();
  const name = row.name?.trim();
  if (short && name && short !== name) return `${short} — ${name}`;
  return name || short || row.id;
}

export const CloneCatalogBundlePanel: React.FC<CloneCatalogBundlePanelProps> = ({
  onStatusMessage,
  members: membersProp,
}) => {
  const { requestConfirm, confirmDialog, confirming } = useConfirmDialog();
  const groupAllowed = isGroupCeoOnMasterTenant();
  const [members, setMembers] = useState<Company[]>(membersProp ?? []);
  const [membersLoading, setMembersLoading] = useState(!membersProp);
  const [membersNotice, setMembersNotice] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [onConflict, setOnConflict] = useState<CloneBundleConflictPolicy>('fail');
  const [keyPrefix, setKeyPrefix] = useState('log_dm_');
  const [clonePending, setClonePending] = useState(false);
  const [lastResponse, setLastResponse] = useState<CloneCatalogBundleResponse | null>(null);
  const [destKeys, setDestKeys] = useState<ConfigCatalogListRow[] | null>(null);
  const [destKeysLoading, setDestKeysLoading] = useState(false);
  const [destKeysError, setDestKeysError] = useState<string | null>(null);
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  const [isErrorStatus, setIsErrorStatus] = useState(false);

  const notify = useCallback(
    (message: string | null, isError = false) => {
      setLocalMsg(message);
      setIsErrorStatus(isError);
      onStatusMessage?.(message);
    },
    [onStatusMessage],
  );

  const candidates = useMemo(
    () => ensureLogisticsCloneDestOption(listCloneBundleDestCandidates(members)),
    [members],
  );

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
    } catch (e) {
      setMembers([]);
      setMembersNotice(e instanceof Error ? e.message : 'Không tải được đơn vị thành viên');
    } finally {
      setMembersLoading(false);
    }
  }, [membersProp]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (membersProp) setMembers(membersProp);
  }, [membersProp]);

  useEffect(() => {
    if (selectedId && candidates.some((c) => c.id === selectedId)) return;
    const logistics = candidates.find((c) => resolveCloneBundleDestScope(c).companyId === 'logistics');
    setSelectedId(logistics?.id ?? candidates[0]?.id ?? null);
  }, [candidates, selectedId]);

  const reloadDestKeys = useCallback(
    async (tenantId: string, companyId: string, catalogKeys: string[]) => {
      setDestKeysLoading(true);
      setDestKeysError(null);
      try {
        // Spot GET by key (QA LOG-09) — avoids list CFG-004 checksum storm on unrelated rows.
        const sampleKeys = catalogKeys.slice(0, 12);
        const rows = await fetchCloneBundleDestKeySnapshots(
          tenantId,
          companyId,
          sampleKeys,
          'xbos',
        );
        if (rows.length === 0) {
          throw new Error(
            'Không xác nhận được khóa đích trên partition (GET catalog theo key trống).',
          );
        }
        setDestKeys(rows);
      } catch (e) {
        setDestKeys(null);
        setDestKeysError(e instanceof Error ? e.message : 'Không tải được danh mục đích');
      } finally {
        setDestKeysLoading(false);
      }
    },
    [],
  );

  const executeClone = async () => {
    if (!selectedMember) {
      notify('Chọn công ty đích.', true);
      return;
    }
    setClonePending(true);
    notify(null);
    setLastResponse(null);
    setDestKeys(null);
    setDestKeysError(null);
    try {
      const user = getStoredUser();
      const actor = user?.userId?.trim() || user?.displayName?.trim() || 'portal-group-ceo';
      const body = buildCloneCatalogBundleBody({
        destMember: selectedMember,
        actor,
        onConflict,
        keyPrefix: keyPrefix.trim() || undefined,
        domains: CLONE_BUNDLE_LOGISTICS_DOMAINS,
      });
      const response = await cloneCatalogBundle(body);
      setLastResponse(response);
      notify(formatCloneBundleSuccessMessage(response), false);
      await reloadDestKeys(
        response.data.dest.tenantId,
        response.data.dest.companyId,
        response.data.copied.map((row) => row.catalogKey),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sao chép bộ danh mục thất bại';
      notify(msg, true);
    } finally {
      setClonePending(false);
    }
  };

  const promptClone = () => {
    if (!groupAllowed) {
      notify('Chỉ CEO tập đoàn / Catalog Admin nhóm mới được sao chép bộ danh mục (XBOS-AUTH-003).', true);
      return;
    }
    if (!selectedMember) {
      notify('Chọn công ty đích.', true);
      return;
    }
    const dest = resolveCloneBundleDestScope(selectedMember);
    requestConfirm({
      title: 'Sao chép bộ danh mục Logistics',
      description: `Sao chép bộ DM domain «logistics» từ tập đoàn sang «${companyLabel(selectedMember)}» (wire ${dest.companyId}) với chính sách ${ON_CONFLICT_LABELS[onConflict]}? Nguồn không đổi.`,
      confirmLabel: 'Sao chép bộ',
      onConfirm: () => executeClone(),
    });
  };

  const busy = clonePending || confirming || membersLoading || destKeysLoading;

  return (
    <div
      className={`${SETTINGS_SECTION_STACK} min-h-[min(480px,65vh)]`}
      data-testid="clone-catalog-bundle-panel"
      data-hdsd="sao-chep-bo-danh-muc-log"
    >
      {confirmDialog}
      <div>
        <h3 className={SETTINGS_SECTION_TITLE_CLASS}>Sao chép bộ danh mục Logistics</h3>
        <p className={`mt-1 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
          XBOS-DM-LOG-09 — sao chép nguyên bộ danh mục domain logistics từ tập đoàn sang công ty đích
          (onboarding). Không phải Áp dụng danh mục HRM (DM-HRM-07) và không phải sao chép một khóa
          (DM-09).
        </p>
      </div>

      {!groupAllowed ? (
        <aside
          className="rounded-input border border-rose-200 bg-rose-50/80 px-3 py-3 text-sm text-rose-900"
          role="alert"
          data-testid="clone-bundle-au-block"
        >
          Thao tác chỉ dành cho CEO tập đoàn / vai trò group_* trên tenant master. Thành viên công ty
          sẽ nhận XBOS-AUTH-003 nếu gọi API.
        </aside>
      ) : null}

      <div className={`space-y-4 border border-xevn-border bg-white p-4 shadow-soft ${SETTINGS_RADIUS_CARD}`}>
        <div className={`rounded-input border border-slate-200 bg-slate-50/80 px-3 py-3 ${SETTINGS_CONTROL_TEXT}`}>
          <p className="text-slate-700" data-testid="clone-bundle-source-summary">
            <span className="font-semibold text-xevn-text">Nguồn:</span>{' '}
            {formatApplyCatalogSourceScopeDisplay('xevn', 'holding')} · domains = logistics
            {keyPrefix.trim() ? ` · tiền tố ${keyPrefix.trim()}` : ''}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="clone-bundle-on-conflict" className={SETTINGS_LABEL_CLASS}>
              Khi đích đã có khóa
            </label>
            <select
              id="clone-bundle-on-conflict"
              className={`w-full border border-xevn-border bg-white px-3 py-2 text-[15px] ${SETTINGS_RADIUS_INPUT}`}
              value={onConflict}
              disabled={busy || !groupAllowed}
              onChange={(e) => setOnConflict(e.target.value as CloneBundleConflictPolicy)}
              data-testid="clone-bundle-on-conflict"
              data-hdsd="clone-bundle-on-conflict"
            >
              {(Object.keys(ON_CONFLICT_LABELS) as CloneBundleConflictPolicy[]).map((key) => (
                <option key={key} value={key}>
                  {ON_CONFLICT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 space-y-2">
            <label htmlFor="clone-bundle-key-prefix" className={SETTINGS_LABEL_CLASS}>
              Tiền tố khóa (tuỳ chọn)
            </label>
            <input
              id="clone-bundle-key-prefix"
              className={`w-full border border-xevn-border bg-white px-3 py-2 text-[15px] ${SETTINGS_RADIUS_INPUT}`}
              value={keyPrefix}
              disabled={busy || !groupAllowed}
              onChange={(e) => setKeyPrefix(e.target.value)}
              placeholder="log_dm_"
              data-testid="clone-bundle-key-prefix"
            />
          </div>
          <div className="md:col-span-4 flex flex-wrap items-end gap-2">
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

        <div className="space-y-2">
          <p className={SETTINGS_LABEL_CLASS}>Công ty đích</p>
          {membersNotice ? (
            <p className="text-sm text-rose-700" role="alert">
              {membersNotice}
            </p>
          ) : null}
          {membersLoading ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>Đang tải danh sách ĐVTV…</p>
          ) : candidates.length === 0 ? (
            <p className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
              Không có công ty đích (cần quyền Group CEO + group-member-units).
            </p>
          ) : (
            <ul
              className="max-h-64 space-y-1 overflow-y-auto rounded-input border border-xevn-border p-2"
              data-testid="clone-bundle-dest-list"
              data-hdsd="clone-bundle-dest-list"
            >
              {candidates.map((row) => {
                const checked = selectedId === row.id;
                const wire = resolveCloneBundleDestScope(row);
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-input px-3 py-2 text-left text-[15px] transition hover:bg-slate-50 ${
                        checked ? 'bg-blue-50/80' : ''
                      }`}
                      onClick={() => setSelectedId(row.id)}
                      disabled={busy || !groupAllowed}
                      aria-pressed={checked}
                      data-testid={`clone-bundle-dest-${row.id}`}
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
                          đích wire {wire.tenantId}/{wire.companyId}
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
            disabled={busy || !selectedMember || !groupAllowed}
            onClick={promptClone}
            data-testid="clone-bundle-submit"
            data-hdsd="sao-chep-bo-danh-muc"
          >
            Sao chép bộ danh mục
          </MutationButton>
          <span className={`${SETTINGS_CONTROL_TEXT} text-slate-500`}>
            POST …/catalogs/clone-bundle → XBOS-CFG-205
          </span>
        </div>

        {localMsg ? (
          <p
            className={`rounded-input border px-3 py-2 text-sm ${
              isErrorStatus
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
            role={isErrorStatus ? 'alert' : 'status'}
            data-testid="clone-bundle-status"
          >
            {localMsg}
          </p>
        ) : null}

        {lastResponse ? (
          <div
            className="rounded-input border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
            data-testid="clone-bundle-result"
          >
            <p className="font-semibold text-xevn-text">
              {lastResponse.code}: copiedCount = {lastResponse.data.copiedCount} · matched ={' '}
              {lastResponse.data.matchedCount} · skipped = {lastResponse.data.skippedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Nguồn {formatApplyCatalogSourceScopeDisplay(
                lastResponse.data.source.tenantId,
                lastResponse.data.source.companyId,
              )}{' '}
              → đích {lastResponse.data.dest.companyId} · onConflict={lastResponse.data.onConflict}
            </p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto font-mono text-xs text-slate-600">
              {lastResponse.data.copied.slice(0, 12).map((row) => (
                <li key={row.catalogKey}>
                  {row.catalogKey} · v{row.version} · {row.domain}
                </li>
              ))}
              {lastResponse.data.copiedCount > 12 ? (
                <li>… +{lastResponse.data.copiedCount - 12} khóa khác</li>
              ) : null}
            </ul>
            <div className="mt-3">
              <MutationButton
                type="button"
                variant="neutral"
                pending={destKeysLoading}
                disabled={busy && !destKeysLoading}
                onClick={() =>
                  void reloadDestKeys(
                    lastResponse.data.dest.tenantId,
                    lastResponse.data.dest.companyId,
                    lastResponse.data.copied.map((row) => row.catalogKey),
                  )
                }
                data-testid="clone-bundle-reload-dest"
                data-hdsd="tai-lai-khoa-dich"
              >
                <RefreshCw className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                Tải lại khóa đích (F5)
              </MutationButton>
            </div>
          </div>
        ) : null}

        {destKeysError ? (
          <p className="text-sm text-rose-700" role="alert" data-testid="clone-bundle-dest-keys-error">
            {destKeysError}
          </p>
        ) : null}

        {destKeys ? (
          <div
            className="rounded-input border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-700"
            data-testid="clone-bundle-dest-keys"
          >
            <p className="font-semibold text-xevn-text">
              Khóa trên đích sau sao chép: {destKeys.length}
            </p>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-xs text-slate-600">
              {destKeys.slice(0, 20).map((row) => (
                <li key={row.catalogKey}>
                  {row.catalogKey}
                  {row.version != null ? ` · v${row.version}` : ''}
                  {row.domain ? ` · ${row.domain}` : ''}
                </li>
              ))}
              {destKeys.length > 20 ? <li>… +{destKeys.length - 20} khóa khác</li> : null}
            </ul>
          </div>
        ) : null}

        <aside
          className="rounded-input border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm text-amber-950"
          data-testid="clone-bundle-policy-note"
        >
          <p className="font-semibold">Chính sách xung đột</p>
          <p className="mt-1 leading-snug">
            Mặc định <span className="font-mono">onConflict=fail</span> → XBOS-CFG-009 khi đích đã có
            khóa (không half-copy). Chọn overwrite chỉ khi chủ đích chấp nhận ghi đè (QA CFG-205 path).
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CloneCatalogBundlePanel;
