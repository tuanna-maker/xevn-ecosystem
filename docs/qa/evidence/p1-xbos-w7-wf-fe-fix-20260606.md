# P1-XBOS-W7-WF-FIX — Dev-FE evidence (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W7-WF-FIX` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **ack_status** | `READY_FOR_QA` |
| **source_audit** | `docs/qa/evidence/p1-xbos-w7-wf-audit-20260606.md` |

## Defects closed

| ID | Symptom | Root cause | Fix |
|----|---------|------------|-----|
| **D-W7-INBOX-DRAWER-01** | CC Action Card **Mở chi tiết** no-op on `/command-center` | `WorkflowTaskDetailDrawer` mounted only inside `renderSettingsWorkspacePanel()` — absent on CC home branch | Hoist drawer to page root (always mounted); `openInboxTaskDetail` syncs `?wfInstanceId=` deep link; home deep-link `useEffect` hydrates drawer |
| **D-W7-KPI-ROLLUP-01** | Red banner *Không tải KPI rollup (JWT companyId=main)* when rollup API **200** `series:[]` | `ApiLoadBanner` received unconditional `message` prop — renders even when `loadFailed=false` (regression vs D-8088-KPI-01 hook fix) | Gate KPI `message` on `kpiRail.loadFailed && !allowMockFallback()` |

## Files changed

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/modules/hrm/commandCenterUrl.ts`
- `apps/web/web-portal/src/modules/hrm/commandCenterUrl.test.ts`

## Verification

```bash
pnpm --filter web-portal exec vitest run   # 174/174 PASS
pnpm --filter web-portal build             # exit 0
```

**Regression tests added:**
- `commandCenterInboxInstanceDeepLink` — `/command-center?wfInstanceId=` without `settings=`

## QA retest (L2.5 — J-XBOS-01 + collateral)

**Account:** `ceo@xe.vn` / `Xevn@2026` · stack `:5173` + xbos `:28002`

1. `/command-center` — KPI widget: **no** red rollup error banner when `GET …/kpi-engine/rollup` **200** `series:[]`; headline `—`, empty sparkline OK.
2. Action Cards — click **Mở chi tiết** on first pending card:
   - Drawer/dialog visible (`role="dialog"`, title *Chi tiết nhiệm vụ*)
   - URL updates `?wfInstanceId={instanceId}`
   - `GET …/workflow-engine/instances/{id}/detail` **200** `XBOS-WF-204`
   - **Hoàn thành** / **Từ chối** controls present
3. Close drawer — URL clears `wfInstanceId`; reload with `?wfInstanceId={id}` reopens drawer (deep link).
4. **Xử lý nhanh** still works (regression).

## Residual

- **D-W7-WF-GET-ID-01** (P3) — `GET definitions/{id}` 404 — **dev-be** scope
- **D-W7-WF-FORM-AUTO-01** (P3) — automation DOM `.value` vs React state — not FE blocker

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed D-W7-INBOX-DRAWER-01 + D-W7-KPI-ROLLUP-01; drawer mount + deep link + KPI banner gating |
| **next_owner** | `qa` |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w7-wf-fe-fix-20260606.md` |
| **ack_status** | `READY_FOR_QA` |

### next_dispatch_prompt

```
work_item_id: P1-XBOS-W7-WF-FIX
from_role: pm
to_role: qa
lane: execution

Dev-FE READY_FOR_QA docs/qa/evidence/p1-xbos-w7-wf-fe-fix-20260606.md. Retest J-XBOS-01 on localhost:5173: (1) CC home KPI no error banner on empty rollup 200; (2) Action Card Mở chi tiết opens WorkflowTaskDetailDrawer + ?wfInstanceId= URL + detail API 200; (3) Hoàn thành/Từ chối in drawer; (4) Xử lý nhanh regression. Update p1-xbos-w7-wf-audit-20260606.md defect rows D-W7-INBOX-DRAWER-01 / D-W7-KPI-ROLLUP-01 if PASS.
```
