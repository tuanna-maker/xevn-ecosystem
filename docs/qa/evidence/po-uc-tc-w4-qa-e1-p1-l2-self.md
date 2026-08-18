# PO-UC-TC-W4-QA-E1-P1-L2-SELF — Canvas L2 + self-approve FD (P1 residual)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E1-P1-L2-SELF` |
| **role** | qa |
| **executed_at** | 2026-08-04 |
| **prior** | `docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md` (`R-W4E1-CV-L2-SELF`) |
| **locks** | U65 zero-seed · U76 HDSD · **uat_done: false** · **cấm invent Leave L2** · cấm seed inbox |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **machine_log** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e1-p1-l2-self-browser.json` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e1-p1-l2-self-browser.mjs` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e1-p1-l2-self/` (11 PNG) |
| **ack_status** | **PASS_TO_PM** |
| **seat overall** | **PARTIAL** (canvas 2-level sticky **PASS**; inbox L2 + self FD **BLOCKED** honest) |
| **stamp** | `W4E1-E2B8AJ` (R2) |

---

## L0

| Check | Result |
|-------|--------|
| `GET /api/hrm` | **200** |
| `GET /api/xbos` | **200** |
| portal `:5173` | **200** |

Stack was restarted mid-session (`dev:xbos-api` + existing hrm) before browser.

---

## HDSD inventory (U76)

1. Login portal (`ceo@xe.vn`) — clear session
2. `?settings=workflow` → **Chỉnh sửa** → tab **Cấu hình bước & luồng** (≥2 bước / Thêm nút bước)
3. Tab **Sơ đồ luồng** (`.bg-workflow-canvas-dots`) → **Lưu quy trình** → reopen F5 sticky
4. FE business submit leave (attempt) → inbox L2 if present
5. Self-approve FD only when submitter=approver proven

**Cấm đã tuân:** không `pnpm seed:*` · không API seed inbox · không invent Leave L2 PASS · không claim full UAT.

---

## AS-IS product notes (honest)

| Fact | Evidence |
|------|----------|
| Tab **Sơ đồ luồng** = visual `WorkflowCanvas` | FE `CommandCenterPage` — edit steps on **Cấu hình bước & luồng** via **Thêm nút bước** |
| Definition already had **3** approve steps | R2 `stepsBefore=3` · sticky reopen `stickySteps=3` |
| Leave spawn code fixed `hrm_leave_approval` | `leave-workflow.bridge.ts` — **≠** arbitrary canvas def L2 |
| BR-WF-04 | Resolver unit (`resolver-registry.spec`) skips submitter at assign; **`completeStepTask` has no submitter≠approver guard** |
| CEO leave create CTA | Leave tab reachable (`/hr/attendance?tab=leave`) but **submit control not found** → FE-SPAWN **BLOCKED** |

---

## U78 test execution log

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-UC-TC-W4-QA-E1-P1-L2-SELF` |
| **tester** | qa · Playwright Chromium |
| **started_at** | 2026-08-04T02:52:11Z (R2 authoritative) |
| **ended_at** | 2026-08-04T02:52:35Z |
| **hdsd_sot** | UF-XBOS-08 · by-uc UC-CC-P0-06 / UC-XBOS-CC-06 |
| **spec_ref** | `docs/qa/professional/by-uc/UC-CC-P0-06.md` · `UC-XBOS-CC-06.md` · BR-WF-04 |

### Chronological (R2)

| seq | action (HDSD) | expected | actual | network | result |
|-----|---------------|----------|--------|---------|--------|
| 1 | L0 health | 200×3 | hrm/xbos/portal 200 | — | pass |
| 2 | Login CEO | CC | `XBOS-AUTH-200` | POST login **201** | pass |
| 3 | `?settings=workflow` → Chỉnh sửa | detail | graph tab open | GET defs | pass |
| 4 | Count steps / ensure ≥2 approve | 2+ steps | **3** steps already · stamp `W4E1-E2B8AJ` on L2 name | — | pass |
| 5 | Tab **Sơ đồ luồng** | canvas dots | `canvasTabOk=true` · `.bg-workflow-canvas-dots` | — | **pass** |
| 6 | Lưu quy trình | 2xx + code | PUT defs **200** `XBOS-WF-201` | PUT | **pass** |
| 7 | Reopen → sticky steps | ≥2 | `stickySteps=3` | GET | **pass** |
| 8 | FE leave submit (spawn) | POST leave/instances | Leave UI ok; **no Gửi/Lưu CTA** for CEO | — | **blocked** |
| 9 | Inbox L2 card (strict cấp 2 / level=2) | L2 pending | **0** strict L2 cards (45 cards) | — | **blocked** |
| 10 | Self-approve FD proven | BR-WF-04 4xx | submitter≠CEO not proven → **no Duyệt click** | — | **blocked** |

### R1 superseded (do not promote)

R1 harness used stamp `L2S-*` + inbox regex `/L2/` → false **INB-L2 PASS** + false **SELF FAIL**. R2 stamp `W4E1-*` + strict `cấp 2` / `data-approval-level=2` + proven-self gate. **R1 machine JSON kept for audit only; verdicts below = R2.**

---

## Completion — target UCs / TCs

### UC-XBOS-CC-06 (canvas)

| TC-ID | Verdict | Note |
|-------|---------|------|
| TC-DM-CC-06-CV-OPEN-HP-001 | **PASS** | Tab Sơ đồ luồng + canvas dots |
| TC-DM-CC-06-CV-SAVE-HP-001 | **PASS** | PUT **200** `XBOS-WF-201` |
| TC-DM-CC-06-CV-L2-HP-001 | **PASS** | ≥2 approve steps sticky after save/F5 reopen (**definition UI**, not Leave ladder) |
| TC-DM-CC-06-CV-L2-FD-001 | **BLOCKED** | Empty L2 resolver FD not forced this seat |
| TC-DM-CC-06-CV-SELF-FD-001 | **BLOCKED** | No proven submitter=approver instance |

**UC execution:** **PARTIAL**

### UC-CC-P0-06 (inbox)

| TC-ID | Verdict | Note |
|-------|---------|------|
| TC-CC-P0-06-INB-LIST-HP-001 | **PASS** | 45 cards · GET tasks ok |
| TC-CC-P0-06-INB-L2-HP-001 | **BLOCKED** | No strict L2 card; **Leave L2 = SPEC_GAP** (not invented) |
| TC-CC-P0-06-INB-SELF-FD-001 | **BLOCKED** | FE spawn blocked; submitter=approver not proven |

**UC execution:** **PARTIAL**

---

## Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| `R-W4E1-CV-L2-SELF` | P1 | split | **PARTIAL** | **Canvas/graph L2 sticky CLOSED**; inbox L2 + self FD still OPEN |
| `R-W4E1-CV-L2-GRAPH` | — | — | **CLOSED** | Tab Sơ đồ + ≥2 steps + PUT 201 + sticky (supersedes prior `R-W4E1-CV-GRAPH-TAB` for this seat) |
| `R-W4E1-INB-L2-ASIS` | P1 | ba-process → dev | **OPEN** | Canvas 2-step on settings def ≠ Leave `hrm_leave_approval` L2; SPEC_GAP until leave FE spawn yields cấp-2 task |
| `R-W4E1-SELF-FD-EVIDENCE` | P1 | qa / dev-be | **OPEN** | Need FE path submitter=assignee; optional BE: enforce BR-WF-04 on `completeStepTask` (not only resolver) |
| Leave L2 UAT | — | — | **SPEC_GAP** | **Not invented** · out of this seat claim |

**Carry from prior (unchanged this seat):** `R-W4E1-INB-X-COMPANY` (P2 header on complete).

---

## Screens (R2)

| File | Meaning |
|------|---------|
| `01-wf-list.png` | Hệ thống quy trình |
| `02-wf-detail-graph.png` | Cấu hình bước |
| `03-wf-two-steps-graph.png` | ≥2 steps |
| `04-wf-canvas-sodo.png` | Tab Sơ đồ luồng + dots |
| `05-wf-f5.png` | List after save |
| `06-wf-reopen-steps.png` | Sticky step count |
| `07-leave-ui.png` | Leave tab (no submit CTA) |
| `10-inbox.png` | Inbox list |
| `12-self-detail.png` | Detail probe (no proven self) |

---

## pm_dispatch_hint

1. **Closed this seat:** canvas tab Sơ đồ + multi-step sticky save (`TC-DM-CC-06-CV-L2-HP-001` PASS).
2. **P1 open — self FD:** `dev-be` consider BR-WF-04 on complete (not only resolver) **and/or** `qa` FE spawn as NV persona whose manager ≠ self, then CEO/manager approve vs submitter-self case.
3. **P1 open — inbox L2 / Leave:** do **not** treat canvas L2 as Leave L2; BA/Dev leave ladder = separate (`hrm_leave_approval`) — SPEC_GAP.
4. **CẤM:** seed inbox · invent Leave L2 · claim UAT DONE.

---

## completion_report

| Closed | Open |
|--------|------|
| L0; canvas **Sơ đồ luồng** exercised; WF definition **≥2 approve steps** save **200** `XBOS-WF-201` + sticky reopen; U65 no seed; Leave L2 not invented; R1 false L2/self superseded | Inbox L2 path BLOCKED; self-approve FD BLOCKED (no proven submitter=approver); CEO leave FE-SPAWN CTA missing; `uat_done` false; `R-W4E1-CV-L2-SELF` PARTIAL_OPEN |

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E1-P1-SELF-FD-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
u65_zero_seed: true

CONTEXT: QA L2-SELF PARTIAL. Canvas L2 sticky PASS. Inbox L2 + self FD BLOCKED honest.
evidence: docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-l2-self.md

MISSION:
1) Enforce BR-WF-04 on workflow-engine completeStepTask when actor userId === instance submitter.userId (resolver-only is insufficient for UI FD).
2) Unit + READY_FOR_QA; do not change Leave ladder scope.
3) CẤM: seed inbox · invent Leave L2 UAT.

OPTIONAL parallel:
work_item_id: PO-UC-TC-W4-QA-E1-P1-LEAVE-SPAWN-01
to_role: qa
MISSION: FE leave create as non-CEO NV (uat.nv / member) → inbox spawn → retest self FD + strict cấp-2 if def has 2 steps; U65; evidence append.
```

## ack_status

**PASS_TO_PM**
