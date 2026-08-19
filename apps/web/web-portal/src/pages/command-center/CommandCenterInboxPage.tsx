/**
 * @CODE-MEMORY
 * Screen: /command-center/inbox — Hộp thư phê duyệt workflow (CC)
 * UC: UF-XBOS-08 · UF-HRM-09 · TC-ECO-INT-03
 * SRS: docs/hrm/SRS.md · FR-HRM-AT-10 · FR-UC-XBOS-WF-01
 * Purpose: Tải GET workflow-engine/tasks cho user đăng nhập và hiển thị thẻ pending (hrm_leave, …).
 * WorkItem: D-HDSD-WF-INBOX-FE-01
 * Coded: 2026-07-30
 * Callers: App.tsx route command-center/inbox
 * Callees: commandCenterInboxApi · workflowEngineApi
 * must_keep: U65 zero-seed — chỉ API thật, không mock inbox
 * LastVerified: CommandCenterInboxPage.test.tsx
 *
 * @CODE-MEMORY-CHANGE
 * Date: 2026-08-03
 * WorkItem: W1-B-04-AUTH-FE-VITE-01
 * What: Khôi phục file từ transcript D-HDSD-WF-INBOX-FE-01 (177d3857) — path chưa từng vào git
 *   khiến Vite 500 trên App.tsx lazy import → /login trắng.
 * Why: Unblock FR-UC-M01 browser AC; residual R-AUTH-FE-VITE-INBOX
 * must_keep: authSession *_label · TopHeader/GlobalFilter membership display · U65 zero-seed
 *   · không strip wiring display-ready để «fix» build
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: W1-B-04-AUTH-FE-CC-CHIP-01 · 2026-08-03
 * Change: Root h-dvh → h-full min-h-0 — vừa shell ExecutiveDashboardLayout + TopHeader membership
 * must_keep: page transform 200; không đụng inbox API / U65
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: R-SPINE-WEB-APPROVE-UX-01 · 2026-08-03
 * change_mode: FIX
 * What: hrm_leave card — nút «Duyệt» (visible + aria) + data-testid; giữ Xử lý nhanh cho WF khác
 * Why: QA WEB_APPROVE BLOCKED — leave tasks FE-origin visible nhưng Duyệt not actionable
 * must_keep: U65 zero-seed; applyWorkflowInboxTaskDecision complete path; recruitment labels
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01 · 2026-08-04
 * change_mode: FIX
 * What: Duyệt truyền MEMBER_DEFAULT_COMPANY_ID → complete x-company-id parity definitions PUT
 * Why: QA R-W4E1-INB-X-COMPANY null header on POST …/tasks/:id/complete
 * must_keep: leave approve XBOS-WF-200 path; U65 zero-seed; không invent Leave L2
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A · 2026-08-05
 * change_mode: UPGRADE
 * What: Inbox shell hover → xevn-background; cite ADR-20260805 (PORT-04)
 * must_keep: U65 zero-seed; ApiLoadBanner honesty; approve wiring; TopHeader parent shell
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, RefreshCw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UnifiedTask } from '../../data/command-center-types';
import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../../constants/tenant';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { CapabilityActionButton } from '../../components/command-center/CapabilityActionButton';
import {
  fetchCommandCenterInboxTasks,
  inboxApproveActionLabelVi,
  isHrmLeaveInboxTask,
  resolveInboxAssigneeUserId,
} from '../../integrations/commandCenterInboxApi';
import { applyWorkflowInboxTaskDecision } from '../../integrations/workflowEngineApi';
import {
  INBOX_STRICT_EMPTY_HINT,
  INBOX_STRICT_LOAD_FAILED,
  resolveInboxStrictBanner,
} from '../../utils/commandCenterStrictMode';
import {
  SETTINGS_RADIUS_CARD,
  SETTINGS_SECTION_TITLE_CLASS,
  XEVN_FLUID_SHELL,
  XEVN_VIEWPORT_PADDING,
} from './settings-form-pattern';
import { CC_INBOX_PATH } from '../../modules/hrm/commandCenterUrl';

const RAIL_STROKE = 1.5;

function formatAsOf(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function priorityLabel(p: UnifiedTask['priority']): string {
  const map: Record<UnifiedTask['priority'], string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    critical: 'Khẩn cấp',
  };
  return map[p];
}

function priorityClass(p: UnifiedTask['priority']): string {
  const map: Record<UnifiedTask['priority'], string> = {
    low: 'bg-xevn-neutral/10 text-xevn-textSecondary',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-rose-100 text-rose-800',
  };
  return map[p];
}

const CommandCenterInboxPage: React.FC = () => {
  const [tasks, setTasks] = useState<UnifiedTask[]>([]);
  const [source, setSource] = useState<'loading' | 'api' | 'mock'>('loading');
  const [loadFailed, setLoadFailed] = useState(false);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reloadInbox = useCallback(async () => {
    setSource('loading');
    setLoadFailed(false);
    try {
      const rows = await fetchCommandCenterInboxTasks(
        MASTER_TENANT_ID,
        undefined,
        MEMBER_DEFAULT_COMPANY_ID,
      );
      setTasks(rows);
      setSource('api');
      setLoadFailed(false);
    } catch {
      setTasks([]);
      setSource('api');
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    document.title = 'XeVN OS | Command Center — Hộp thư';
    void reloadInbox();
  }, [reloadInbox]);

  const strict = useMemo(
    () => resolveInboxStrictBanner(source, loadFailed, tasks.length),
    [source, loadFailed, tasks.length],
  );

  const handleQuickComplete = async (task: UnifiedTask) => {
    if (source !== 'api' || actionBusyId) return;
    setActionBusyId(task.cardId);
    setNotice(null);
    try {
      await applyWorkflowInboxTaskDecision(
        { cardId: task.cardId, workflowHatKey: task.workflowHatKey },
        'approved',
        MASTER_TENANT_ID,
        resolveInboxAssigneeUserId(),
        MEMBER_DEFAULT_COMPANY_ID,
      );
      setNotice(`Đã hoàn thành: ${task.title}`);
      await reloadInbox();
    } catch {
      setNotice('Không xử lý được nhiệm vụ — thử lại hoặc mở chi tiết trên Command Center.');
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-xevn-background text-xevn-text">
      <header className="shrink-0 z-20 border-b border-xevn-border bg-xevn-surface/80 shadow-soft backdrop-blur-md">
        <div
          className={`${XEVN_FLUID_SHELL} flex w-full flex-wrap items-center justify-between gap-4 ${XEVN_VIEWPORT_PADDING} py-4`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-xevn-primary text-white shadow-soft">
              <LayoutDashboard className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h1 className="page-title text-xl font-semibold tracking-tight text-xevn-text">XeVN OS</h1>
              <p className="body-text text-sm text-xevn-textSecondary">Command Center · Hộp thư</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/command-center"
              className="rounded-lg border border-xevn-border bg-xevn-surface px-3 py-2 text-sm font-medium text-xevn-text transition hover:bg-xevn-background"
            >
              Tổng quan CC
            </Link>
            <button
              type="button"
              onClick={() => void reloadInbox()}
              className="inline-flex items-center gap-1 rounded-lg bg-xevn-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={RAIL_STROKE} />
              Tải lại
            </button>
          </div>
        </div>
      </header>

      <main className={`${XEVN_FLUID_SHELL} min-h-0 flex-1 overflow-y-auto ${XEVN_VIEWPORT_PADDING} py-6`}>
        {notice ? (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
            {notice}
          </p>
        ) : null}

        <section
          data-testid="cc-inbox-panel"
          className={`border border-xevn-border bg-xevn-surface/90 p-6 shadow-soft backdrop-blur-sm ${SETTINGS_RADIUS_CARD}`}
        >
          <ApiLoadBanner
            loadFailed={strict.loadFailed}
            usingMockFallback={strict.usingMockFallback}
            title="Hộp thư phê duyệt (workflow-engine)"
            message={
              strict.emptyStrictHint
                ? INBOX_STRICT_EMPTY_HINT
                : strict.loadFailed
                  ? INBOX_STRICT_LOAD_FAILED
                  : undefined
            }
          />

          <div className="mb-6">
            <h2 className={SETTINGS_SECTION_TITLE_CLASS}>Việc cần xử lý</h2>
            <p className="body-text text-base text-xevn-textSecondary">
              Nguồn: GET /api/xbos/workflow-engine/tasks · assignee{' '}
              {resolveInboxAssigneeUserId() ?? '(chưa xác định)'}
            </p>
          </div>

          <ul className="space-y-3" data-testid="cc-inbox-task-list">
            {source === 'loading' ? (
              <li className="rounded-xl border border-dashed border-xevn-border py-12 text-center text-xevn-textSecondary">
                Đang tải hộp thư…
              </li>
            ) : tasks.length === 0 ? (
              <li className="rounded-xl border border-dashed border-xevn-border py-12 text-center text-xevn-textSecondary">
                {strict.emptyStrictHint ? (
                  <span>{INBOX_STRICT_EMPTY_HINT}</span>
                ) : strict.loadFailed ? (
                  <span>{INBOX_STRICT_LOAD_FAILED}</span>
                ) : (
                  'Không có việc cần xử lý trong phạm vi hiện tại.'
                )}
              </li>
            ) : (
              tasks.map((task) => {
                const leaveTask = isHrmLeaveInboxTask(task);
                const approveLabel = inboxApproveActionLabelVi(task);
                return (
                <li
                  key={task.cardId}
                  data-testid="cc-inbox-task-card"
                  data-business-type={leaveTask ? 'hrm_leave' : (task.businessType ?? task.moduleCode)}
                  className="flex flex-col gap-3 rounded-xl border border-xevn-border bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-sm font-medium ${priorityClass(task.priority)}`}
                      >
                        {priorityLabel(task.priority)}
                      </span>
                      <span className="text-sm text-xevn-textSecondary">
                        {task.sourceSystem} · {task.moduleCode}
                      </span>
                    </div>
                    <p className="mt-1 font-medium text-xevn-text">{task.title}</p>
                    {task.subtitle ? (
                      <p className="body-text mt-0.5 text-base text-xevn-textSecondary">{task.subtitle}</p>
                    ) : null}
                    <p className="mt-2 text-sm text-xevn-textSecondary">
                      Người nhận: {task.assigneeName}
                      {task.dueAt ? <> · Hạn: {formatAsOf(task.dueAt)}</> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      to={`/command-center?wfInstanceId=${encodeURIComponent(task.sourceId)}&wfTaskId=${encodeURIComponent(task.cardId)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-xevn-border bg-xevn-surface px-3 py-2 text-base font-medium text-xevn-text transition hover:bg-xevn-background"
                    >
                      Mở chi tiết
                      <ChevronRight className="h-4 w-4" strokeWidth={RAIL_STROKE} />
                    </Link>
                    <CapabilityActionButton
                      capabilityCode="BTN-A1-INBOX-QUICK"
                      accessibleName={approveLabel}
                      data-testid={leaveTask ? 'hdsd-cc-leave-approve' : 'cc-inbox-task-approve'}
                      runtime={{
                        busy: actionBusyId === task.cardId,
                        blocked: source !== 'api',
                        blockedReasonVi:
                          'Chỉ phê duyệt nhiệm vụ thật từ workflow-engine — không dùng mock inbox.',
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-xevn-primary px-3 py-2 text-base font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                      onClick={() => void handleQuickComplete(task)}
                    >
                      {actionBusyId === task.cardId ? 'Đang xử lý…' : approveLabel}
                    </CapabilityActionButton>
                  </div>
                </li>
                );
              })
            )}
          </ul>
        </section>

        <p className="mt-4 text-xs text-xevn-textSecondary">
          Route: {CC_INBOX_PATH} · U65 zero-seed — thẻ hiển thị khi có task pending từ luồng FE (vd. nghỉ phép).
        </p>
      </main>
    </div>
  );
};

export default CommandCenterInboxPage;
