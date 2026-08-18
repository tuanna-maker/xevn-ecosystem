# PO-UC-TC-W4-QA-SELF-FD-02 — Browser BR-WF-04 self-approve FD retest

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-SELF-FD-02` |
| **role** | qa |
| **executed_at** | 2026-08-04 |
| **prior BE** | `docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-02.md` (READY_FOR_QA · live self **422** + Nest restart) |
| **prior QA FAIL** | `docs/qa/evidence/po-uc-tc-w4-qa-self-fd-01.md` (self got **201**) |
| **locks** | U65 zero-seed · U76 HDSD · **uat_done: false** · **cấm invent Leave L2** · cấm seed inbox |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **machine_log** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-self-fd-02-browser.json` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-self-fd-02-browser.mjs` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-self-fd-02/` |
| **ack_status** | **PASS_TO_PM** |
| **seat overall** | **PASS** (self FD + control non-self) |
| **commit** | `dc930c5` |

---

## L0

| Check | Result |
|-------|--------|
| `GET /api/hrm` | **200** |
| `GET /api/xbos` | **200** |
| portal `:5173` | **200** |

(`qc:dev-stack` health 200×3; Node UV assert on script teardown ignored.)

---

## HDSD inventory (U76)

1. Login portal (`ceo@xe.vn`) — clear session  
2. **Hộp thư** `/command-center/inbox` (UF-XBOS-08)  
3. **Mở chi tiết** — chứng minh `instance.context.submitter.userId === actor`  
4. **Duyệt** / POST `…/tasks/:id/complete` → expect **422** `XBOS-WF-422` BR-WF-04 · F5 still pending  
5. Control: **Duyệt** task non-self (submitter ≠ actor / null) → **201** `XBOS-WF-200`

**Cấm đã tuân:** không `pnpm seed:*` · không API seed inbox · không invent Leave L2 UAT PASS · không weaken AUTH-003 · không claim `uat_done`.

---

## Proven self case (mission §2)

| Field | Value |
|-------|--------|
| **taskId** | `3a537d82-b09e-4755-9e5e-071b2e98685f` |
| **instanceId** | `15bc3761-a21a-4de4-afe2-9f7099f85248` |
| **businessType** | `hrm_candidate` |
| **submitter.userId** | `ceo@xe.vn` (GET detail **200** `XBOS-WF-204` · `data.instance.context.submitter`) |
| **assignee** | `ceo@xe.vn` |
| **FE POST body** | `userId=ceo@xe.vn` (Playwright request capture) |
| **Network** | `POST /api/xbos/workflow-engine/tasks/3a537d82-…/complete` → **422** `XBOS-WF-422` «Self-approve forbidden: actor is instance submitter (BR-WF-04)» |
| **Expected** | **422** `XBOS-WF-422` · task NOT completed |
| **F5** | Task still in pending queue (`stillVisibleIdx=1` · cards=42) |
| **Verdict** | **PASS** |

---

## Control non-self (mission §3)

| Field | Value |
|-------|--------|
| **taskId** | `ff765983-6abc-4146-b096-f3e2e024d1a5` |
| **businessType** | `hrm_catalog_extension` |
| **submitter** | `null` (≠ actor) |
| **assignee** | `ceo@xe.vn` |
| **Network** | `POST …/complete` → **201** `XBOS-WF-200` |
| **Verdict** | **PASS** |

---

## U78 test execution log

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-UC-TC-W4-QA-SELF-FD-02` |
| **tester** | qa · Playwright Chromium |
| **started_at** | 2026-08-04T03:45:47Z |
| **ended_at** | 2026-08-04T03:46:18Z |
| **hdsd_sot** | UF-XBOS-08 · by-uc UC-CC-P0-06 / UC-XBOS-CC-06 |
| **spec_ref** | BR-WF-04 · `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §3.1 |

| seq | action (HDSD) | expected | actual | network | result |
|-----|---------------|----------|--------|---------|--------|
| 1 | L0 health | 200×3 | hrm/xbos/portal 200 | — | pass |
| 2 | Login CEO | CC | `XBOS-AUTH-200` | POST login **201** | pass |
| 3 | Inbox list | cards | **42** cards | GET tasks **200** `XBOS-WF-203` | pass |
| 4 | Detail self candidate | submitter=ceo | `submitterUserId=ceo@xe.vn` | GET detail **200** `XBOS-WF-204` | pass (proven) |
| 5 | Duyệt self | **422** `XBOS-WF-422` | **422** `XBOS-WF-422` · body.userId=ceo | POST complete | **pass** |
| 6 | F5 after self | still pending | card still visible idx=1 · cards=42 | GET | pass |
| 7 | Duyệt control catalog | **201** non-self | **201** `XBOS-WF-200` | POST complete | **pass** |

---

## TC stamps

### UC-CC-P0-06

| TC-ID | Verdict |
|-------|---------|
| TC-CC-P0-06-INB-SELF-FD-001 | **PASS** |
| TC-CC-P0-06-INB-SELF-HP-001 | **PASS** (control non-self 201) |

Prior LIST/DET/APPR/AU from E1-P1 seats: unchanged (not re-run full suite).

### UC-XBOS-CC-06

| TC-ID | Verdict |
|-------|---------|
| TC-DM-CC-06-CV-SELF-FD-001 | **PASS** (same inbox self path; canvas OPEN/SAVE prior PASS kept) |

---

## Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| `R-W4E1-SELF-FD-EVIDENCE` | P1 | qa | **CLOSED** | Browser POST → `XBOS-WF-422` proven |
| `R-W4E1-SELF-BR-WF-04` | **P0** | **dev-be** | **CLOSED** | Live BR-WF-04 enforced after `instance_context` JOIN + Nest restart; browser self **422** / non-self **201** |
| Leave L2 UAT | — | — | **SPEC_GAP** | **Not invented** |
| AUTH-003 | — | — | **untouched** | — |

---

## Screens

| File | Meaning |
|------|---------|
| `01-inbox.png` | Hộp thư list |
| `02-self-detail.png` | Detail self probe |
| `03-self-card.png` / `03-self-after.png` | Before/after Duyệt self (422) |
| `04-self-f5.png` | F5 after self — still pending |
| `05-control-*.png` / `06-control-f5.png` | Non-self control 201 |

---

## completion_report

| Closed | Open |
|--------|------|
| L0; HDSD inbox path; proven submitter=approver → **422** `XBOS-WF-422`; F5 still pending; control non-self **201** `XBOS-WF-200`; by-uc SELF-FD stamps **PASS**; `R-W4E1-SELF-BR-WF-04` **CLOSED**; U65 no seed; Leave L2 not invented | Leave L2 SPEC_GAP; `uat_done` false; full UC-CC-P0-06 suite still PARTIAL (only SELF TCs this seat) |

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-SELF-FD-02-INTAKE
from_role: qa
to_role: pm
lane: governance
priority: P0
ack_status: PASS_TO_PM

CONTEXT: QA browser retest PASS after BE SELF-FD-02.
Self Duyệt → 422 XBOS-WF-422 BR-WF-04 · F5 still pending.
Control non-self → 201 XBOS-WF-200.
Residuals R-W4E1-SELF-BR-WF-04 + R-W4E1-SELF-FD-EVIDENCE CLOSED.
by-uc TC-CC-P0-06-INB-SELF-FD-001 + TC-DM-CC-06-CV-SELF-FD-001 PASS.
evidence: docs/qa/evidence/po-uc-tc-w4-qa-self-fd-02.md
Leave L2 SPEC_GAP not invented · uat_done false.

MISSION PM:
1) INTAKE bus + close P0 self BR residual on program board.
2) Dispatch next open W4 backlog item (pm:idle:check) — do not reopen Leave L2.
```

## ack_status

**PASS_TO_PM**
