# Evidence — R-SPINE-WEB-APPROVE-UX-01

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-WEB-APPROVE-UX-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-03 |
| **lane** | execution |
| **priority** | P1 |
| **ack_status** | `READY_FOR_QA` |
| **prior** | `po-e2e-spine-02-web-qa-w1.md` residual · QC GWC condition OPEN in `po-e2e-spine-02-web-qc-w1.md` |
| **spec_ref** | FR-UC-H03 · UF-XBOS-08 · J-HRM-06 · HDSD Chấm công → Nghỉ phép / CC Việc cần xử lý |
| **U65** | honored — no seed · no inbox seed · no DB fake |
| **must_keep** | LV-03/04 attach GWC · LeaveOverviewRecentPanel mount · no invent L2 ladder / T_L1 |

---

## Root cause (reproduce prior FAIL)

| Surface | Prior FAIL | Cause |
|---------|------------|--------|
| Leave **Danh sách** tab | `APPROVE_LIST_BUTTONS` count **0** | Duyệt only on separate **Chờ duyệt** tab; list row had Eye/Trash only |
| CC inbox / drawer | Leave cards visible (FE-origin `hrm_leave`) but **Duyệt not actionable** | Primary CTA labeled **Xử lý nhanh** / drawer **Hoàn thành**; `CapabilityActionButton` `aria-label` locked to registry `Xử lý nhanh` → harness `getByRole(/Duyệt/)` miss |

Prior honesty: tasks existed from FE create — not seed. Product UX gap, not missing inbox data.

---

## Fix (ADD / FIX — preserve ladder ASSUMPTION)

### 1) Leave list — Duyệt on pending rows (`LeaveTab.tsx`)

- Requests list: pending rows show **Từ chối** + **Duyệt** (+ keep delete).
- HDSD testids: `hdsd-leave-list-approve-{id}` · shared `hdsd-leave-list-approve` on approval tab.
- Detail modal approve keeps Duyệt + per-id testid.
- **Untouched:** LeaveOverviewRecentPanel · attach LV-04 controls · leave ladder.

### 2) CC / Inbox — leave «Duyệt» (`commandCenterInboxApi` + pages + drawer)

- Map `businessType` on `UnifiedTask`.
- Helpers: `isHrmLeaveInboxTask` · `inboxApproveActionLabelVi` → **Duyệt** for `hrm_leave`.
- CC home + `/command-center/inbox` + `WorkflowTaskDetailDrawer`: leave CTA **Duyệt** (visible + `accessibleName` + `data-testid=hdsd-cc-leave-approve`).
- Non-leave: keep **Xử lý nhanh** / drawer **Hoàn thành**.
- `CapabilityActionButton`: optional `accessibleName` + `data-testid` so aria matches HDSD.

### CODE-MEMORY

APPEND on: `LeaveTab.tsx` · `hdsdMutateTestIds.ts` · `commandCenterInboxApi.ts` · `CommandCenterInboxPage.tsx` · `CommandCenterPage.tsx` · `WorkflowTaskDetailDrawer.tsx` · `CapabilityActionButton.tsx`.

---

## Unit evidence

| Suite | Result |
|-------|--------|
| `web-portal` vitest: `commandCenterInboxApi` · `WorkflowTaskDetailDrawer` · `CommandCenterInboxPage` | **15/15 PASS** |
| `apps/web/hrm` vitest: `hdsdMutateTestIds` | **2/2 PASS** |

---

## QA retest (browser-only · U65)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `companyId=main` (or documented leave approver on FE-origin task).

### Path A — Leave list HDSD

1. `/hr/attendance?portal=1&tenantId=xevn&companyId=main` → tab **Nghỉ phép** → **Danh sách**
2. Pending row → **Duyệt** (`[data-testid^=hdsd-leave-list-approve-]`)
3. Network: POST leave-requests `…/approve` **2xx** → FE status updates → **F5** still approved

### Path B — CC inbox HDSD

1. `/command-center` or `/command-center/inbox` → card `data-business-type=hrm_leave` (FE-origin)
2. **Duyệt** (`hdsd-cc-leave-approve`) or Mở chi tiết → **Duyệt**
3. Network: POST `/api/xbos/workflow-engine/tasks/:id/complete` **2xx** → F5 card gone / leave status synced

**Cấm:** seed inbox · claim UAT DONE · invent L2 ladder.

---

## completion_report

**Closed:** Leave-list Duyệt on pending rows; CC/inbox/drawer leave Duyệt (label + aria + testid); unit tests; CODE-MEMORY APPEND; must_keep honored.

**Residual:** Live browser 2xx+F5 not run in this FE wave (READY_FOR_QA). LV-02 ladder HOLD unchanged. Mobile ManagerApprovals out of scope.

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/r-spine-web-approve-ux-01.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-WEB-APPROVE-UX-01-QA
role: qa
mission: Browser-only — FE-origin leave Duyệt. Path A: ceo@xe.vn → /hr/attendance Nghỉ phép → Danh sách → Duyệt on pending → POST approve 2xx → F5. Path B: /command-center or inbox → hrm_leave card → Duyệt (hdsd-cc-leave-approve) → POST tasks/:id/complete 2xx → F5. entry: docs/qa/evidence/r-spine-web-approve-ux-01.md. must_keep: LV-03/04 attach GWC · LeaveOverviewRecentPanel. cấm: seed · invent L2 ladder · claim UAT DONE. evidence_path: docs/qa/evidence/r-spine-web-approve-ux-01-qa.md · ack PASS_TO_PM or FAIL_TO_PM.
```
