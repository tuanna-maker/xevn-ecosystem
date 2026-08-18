# PO-UC-TC-W4-QA-E1-P1-INB-CV — Inbox approve + Canvas save (P1)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E1-P1-INB-CV` |
| **role** | qa |
| **executed_at** | 2026-08-04 |
| **prior** | `docs/qa/evidence/po-uc-tc-w4-qa-e1-xbos-rollup.md` (PARTIAL inbox/canvas) |
| **L0 restore** | `docs/qa/evidence/po-uc-tc-w4-stack-restore-01.md` |
| **locks** | U65 zero-seed · U76 HDSD · **uat_done: false** · cấm invent Leave L2 · cấm seed inbox · DEPT FD **CLOSED** (not reopened) |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · AU `du-lich.ceo@xe.vn` |
| **machine_log** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e1-p1-inb-cv-browser.json` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-e1-p1-inb-cv-browser.mjs` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e1-p1-inb-cv/` |
| **ack_status** | **PASS_TO_PM** |
| **seat overall** | **PARTIAL** (P1 HP approve+save closed; L2/self depth open) |

---

## L0

| Check | Result |
|-------|--------|
| `GET /api/hrm` | **200** |
| `GET /api/xbos` | **200** |
| portal `:5173` | **200** |

---

## HDSD inventory (U76)

1. Login portal (`ceo@xe.vn`) — clear session first
2. Cài đặt → **Hệ thống quy trình** (`?settings=workflow`) → **Chỉnh sửa** → **Lưu quy trình** → reload list (F5 path)
3. **Hộp thư** `/command-center/inbox` → **Mở chi tiết** → **Duyệt** (FE-origin `hrm_leave`)
4. AU API member `du-lich.ceo@xe.vn` definitions/tasks scope

**Cấm đã tuân:** không `pnpm seed:*` · không API seed inbox · không invent Leave L2 PASS · không claim full UAT · không reopen DEPT FD.

---

## Completion — target UCs

| UC | execution | P1 focus | Note |
|----|-----------|----------|------|
| `UC-CC-P0-06` | **PARTIAL** | LIST+DET+APPR **PASS** · L2/self/reject **BLOCKED** | FE-spawn `hrm_leave` approve **201** `XBOS-WF-200`; toast «Đã hoàn thành» |
| `UC-XBOS-CC-06` | **PARTIAL** | OPEN+SAVE+F5 **PASS** · L2/self **BLOCKED** | PUT definitions **200** `XBOS-WF-201` · `x-company-id=main` · sticky reload |

---

## U78 test execution log

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-UC-TC-W4-QA-E1-P1-INB-CV` |
| **tester** | qa · Playwright Chromium |
| **started_at** | 2026-08-04T02:40:51Z (R2 effective) |
| **ended_at** | 2026-08-04T02:41:26Z |
| **hdsd_sot** | UF-XBOS-08 · by-uc UC-CC-P0-06 / UC-XBOS-CC-06 |
| **spec_ref** | `docs/qa/professional/by-uc/UC-CC-P0-06.md` · `UC-XBOS-CC-06.md` |

### Chronological

| seq | action (HDSD) | expected | actual | network | result |
|-----|---------------|----------|--------|---------|--------|
| 1 | L0 health | 200×3 | hrm/xbos/portal 200 | — | pass |
| 2 | Login CEO | CC | `XBOS-AUTH-200` | POST login **201** | pass |
| 3 | `?settings=workflow` list | Hệ thống quy trình | listOk · GET defs **200** `XBOS-WF-200` | GET definitions | pass |
| 4 | Chỉnh sửa TDIT → patch tên ·QA-P1-* | detail + Lưu | «Lưu quy trình» visible · canvasDots tab not opened | — | pass (config detail) |
| 5 | Lưu quy trình | 2xx + code | PUT `.../definitions/{id}` **200** `XBOS-WF-201` · **x-company-id=main** | PUT | **pass** |
| 6 | Reload settings=workflow | sticky | list reload · stamp stickyHint=true | GET defs 200 | **pass** |
| 7 | Member POST definitions | 403/409 | **409** `SCOPE_CONTEXT_MISMATCH` | POST | pass AU |
| 8 | Inbox list | tasks FE | **49** cards · GET tasks **200** `XBOS-WF-203` | GET | pass |
| 9 | Mở chi tiết leave | detail 2xx | GET detail **200** `XBOS-WF-204` · kind=`hrm_leave` | GET | pass |
| 10 | Duyệt leave FE-spawn | complete 2xx | POST `.../tasks/{id}/complete` **201** `XBOS-WF-200` · FE toast «Đã hoàn thành» | POST | **pass** |
| 11 | F5 inbox | list still ok | reload OK · remaining cards | GET | pass UX |
| 12 | L2 / self-approve | evidence | **not forced** — BLOCKED honest (cấm invent Leave L2) | — | blocked |
| 13 | Member GET tasks | scope ok | **200** `XBOS-WF-203` | GET | pass AU |

### R1 harness note (superseded by R2)

First pass mis-clicked «Quy trình» onto Action Cards (false menu match). R2 forced `?settings=workflow` deeplink — **do not** treat R1 screens as canvas evidence.

---

## TC stamps (this wave)

### UC-CC-P0-06

| TC-ID | Verdict |
|-------|---------|
| TC-CC-P0-06-INB-LIST-HP-001 | **PASS** |
| TC-CC-P0-06-INB-LIST-UX-001 | **PASS** |
| TC-CC-P0-06-INB-DET-HP-001 | **PASS** |
| TC-CC-P0-06-INB-APPR-HP-001 | **PASS** |
| TC-CC-P0-06-INB-SCOPE-AU-001 | **PASS** |
| TC-CC-P0-06-INB-L2-HP-001 | **BLOCKED** |
| TC-CC-P0-06-INB-SELF-FD-001 | **BLOCKED** |
| TC-CC-P0-06-INB-REJ-HP-001 | **BLOCKED** |

### UC-XBOS-CC-06

| TC-ID | Verdict |
|-------|---------|
| TC-DM-CC-06-CV-OPEN-HP-001 | **PASS** |
| TC-DM-CC-06-CV-SAVE-HP-001 | **PASS** |
| TC-DM-CC-06-CV-SAVE-UX-001 | **PASS** |
| TC-DM-CC-06-CV-SCOPE-AU-001 | **PASS** |
| TC-DM-CC-06-CV-L2-HP-001 | **BLOCKED** |
| TC-DM-CC-06-CV-L2-FD-001 | **BLOCKED** |
| TC-DM-CC-06-CV-SELF-FD-001 | **BLOCKED** |
| TC-DM-CC-06-CV-SAVE-FD-001 | **PARTIAL** (empty-graph FD not forced) |

---

## Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| `R-W4E1-CV-L2-SELF` | P1 | qa → after FE | 2-level graph edit (tab «Sơ đồ luồng») + FE spawn + self-approve FD still open; **Leave L2 not invented** |
| `R-W4E1-INB-X-COMPANY` | P2 | dev-fe | Canvas PUT definitions sent `x-company-id=main`; inbox GET tasks / POST complete captured **null** header in Playwright (JWT may still scope). Confirm FE always sets header on complete for scope parity. |
| `R-W4E1-CV-GRAPH-TAB` | P2 | qa | Save done from «Cấu hình bước» detail; visual `.bg-workflow-canvas-dots` tab not exercised this seat |

**Closed vs prior E1:** `R-W4E1-INB-SPAWN` (approve deferred) → **CLOSED** for APPR HP via FE-origin leave; `R-W4E1-CV-DEPTH` (save control) → **CLOSED** on R2 deeplink+Chỉnh sửa+Lưu.

**DEPT:** not in scope — FD remains CLOSED per `po-uc-tc-w4-qa-dept-val-ret-01.md`.

---

## pm_dispatch_hint

1. **P1 depth (optional same program):** FE/QA wave open workflow tab **Sơ đồ luồng** → configure 2 approver steps → FE business submit (not seed) → inbox L2 + self-approve FD (`R-W4E1-CV-L2-SELF`).
2. **P2:** `dev-fe` confirm `x-company-id` on inbox `tasks/:id/complete` (`R-W4E1-INB-X-COMPANY`).
3. Do **not** seed inbox · do **not** invent Leave L2 · do **not** claim full UAT.

---

## completion_report

| Closed | Open |
|--------|------|
| L0; UC-CC-P0-06 LIST/DET/APPR/AU; UC-XBOS-CC-06 OPEN/SAVE/F5/AU; U65 no seed; DEPT untouched | L2 + self-approve (inbox+canvas); canvas graph-tab visual; inbox complete header x-company-id capture; `uat_done` false |

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E1-P1-L2-SELF
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
ack_status_target: PASS_TO_PM

CONTEXT: P1-INB-CV closed approve+canvas save. Residual R-W4E1-CV-L2-SELF.
evidence: docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md

MISSION:
1) FE path only: settings=workflow → Chỉnh sửa → tab Sơ đồ luồng / 2-level steps → Lưu 2xx+F5
2) Spawn instance from FE business submit (not seed) → inbox L2 approve path
3) Self-approve FD when submitter=approver — expect BR-WF-04 block
4) CẤM: seed inbox · invent Leave L2 PASS · reopen DEPT

OPTIONAL parallel P2:
work_item_id: PO-UC-TC-W4-DEV-FE-INB-X-COMPANY-01
to_role: dev-fe
MISSION: Ensure POST /workflow-engine/tasks/:id/complete sends x-company-id (parity with definitions PUT).
```

## ack_status

**PASS_TO_PM**
