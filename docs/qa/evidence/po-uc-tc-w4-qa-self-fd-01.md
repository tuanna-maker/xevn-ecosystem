# PO-UC-TC-W4-QA-SELF-FD-01 — Browser BR-WF-04 self-approve FD

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-SELF-FD-01` |
| **role** | qa |
| **executed_at** | 2026-08-04 |
| **prior BE** | `docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-01.md` (READY_FOR_QA · Jest 17/17) |
| **prior residual** | `R-W4E1-SELF-FD-EVIDENCE` (`po-uc-tc-w4-qa-e1-p1-l2-self.md`) |
| **locks** | U65 zero-seed · U76 HDSD · **uat_done: false** · **cấm invent Leave L2** · cấm seed inbox |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **machine_log** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-self-fd-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-self-fd-01-browser.mjs` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-self-fd-01/` |
| **ack_status** | **PASS_TO_PM** |
| **seat overall** | **FAIL** (self FD live miss; control non-self PASS; BE unit PASS cited) |
| **commit** | `dc930c5` |

---

## L0

| Check | Result |
|-------|--------|
| `GET /api/hrm` | **200** |
| `GET /api/xbos` | **200** |
| portal `:5173` | **200** |

(`qc:dev-stack` all green; Node UV assert on script teardown ignored — health 200×3.)

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
| **taskId** | `13e7f948-dcab-42ce-acf1-44c8674733d8` |
| **instanceId** | `15bc3761-a21a-4de4-afe2-9f7099f85248` |
| **businessType** | `hrm_candidate` |
| **submitter.userId** | `ceo@xe.vn` (GET detail **200** `XBOS-WF-204` · `data.instance.context.submitter`) |
| **assignee** | `ceo@xe.vn` |
| **FE POST body** | `userId=ceo@xe.vn` (Playwright request capture) |
| **Network** | `POST /api/xbos/workflow-engine/tasks/13e7f948-…/complete` → **201** `XBOS-WF-200` «Task completed» |
| **Expected** | **422** `XBOS-WF-422` · message BR-WF-04 · task NOT completed |
| **F5** | Task completed (card left pending queue) — opposite of FD expect |
| **Verdict** | **FAIL** |

---

## Control non-self (mission §3)

| Field | Value |
|-------|--------|
| **taskId** | `110ba586-c380-4248-9c65-bd7a1c3a0810` |
| **businessType** | `hrm_catalog_extension` |
| **submitter** | `null` (≠ actor) |
| **assignee** | `ceo@xe.vn` |
| **Network** | `POST …/complete` → **201** `XBOS-WF-200` |
| **Verdict** | **PASS** (non-self path still works) |

---

## BE unit vs live

| Layer | Result |
|-------|--------|
| Jest `workflow-engine.service.spec` | **17/17 PASS** (reconfirmed this seat) — mocked row `context.submitter` → `XBOS-WF-422` |
| Jest `resolver-registry` | prior **11/11** (assign-time guard; must_keep) |
| Live Nest `:28002` + browser | proven self + `userId` in body → **201** (guard not effective at runtime) |
| Dist source | `dist/workflow-engine/workflow-engine.service.js` **contains** Self-approve / `XBOS-WF-422` (mtime 2026-08-04 09:56) |

**Hypothesis for BE (not fixed this seat):** `completeStepTask` reads `parseGraphObject(task.context)` from `SELECT t.*, i.context` — verify runtime row actually carries instance submitter (alias `i.context AS instance_context`); and/or Nest `--watch` process not serving the rebuilt dist. Unit mocks inject `context` on the row so Jest stays green while live fails.

---

## U78 test execution log

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-UC-TC-W4-QA-SELF-FD-01` |
| **tester** | qa · Playwright Chromium |
| **started_at** | 2026-08-04T03:10:14Z (R2 authoritative) |
| **ended_at** | 2026-08-04T03:10:48Z |
| **hdsd_sot** | UF-XBOS-08 · by-uc UC-CC-P0-06 / UC-XBOS-CC-06 |
| **spec_ref** | BR-WF-04 · `ENTERPRISE_HRM_XBOS_DOMAIN_NOTES_20260804.md` §3.1 |

| seq | action (HDSD) | expected | actual | network | result |
|-----|---------------|----------|--------|---------|--------|
| 1 | L0 health | 200×3 | hrm/xbos/portal 200 | — | pass |
| 2 | Login CEO | CC | `XBOS-AUTH-200` | POST login **201** | pass |
| 3 | Inbox list | cards | **43** cards | GET tasks **200** `XBOS-WF-203` | pass |
| 4 | Detail self candidate | submitter=ceo | `submitterUserId=ceo@xe.vn` | GET detail **200** `XBOS-WF-204` | pass (proven) |
| 5 | Duyệt self | **422** `XBOS-WF-422` | **201** `XBOS-WF-200` · body.userId=ceo | POST complete | **fail** |
| 6 | F5 after self | still pending | completed / removed from pending | GET | fail UX |
| 7 | Duyệt control catalog | **201** non-self | **201** `XBOS-WF-200` | POST complete | **pass** |

**R1 superseded:** first harness pass used wrong detail path (`data.context` vs `data.instance.context`) → false BLOCKED; R2 fixed path + proven self.

---

## TC stamps

### UC-CC-P0-06

| TC-ID | Verdict |
|-------|---------|
| TC-CC-P0-06-INB-SELF-FD-001 | **FAIL** |
| TC-CC-P0-06-INB-SELF-HP-001 | **PASS** (control non-self 201) |

Prior LIST/DET/APPR/AU from E1-P1 seats: unchanged (not re-run full suite).

### UC-XBOS-CC-06

| TC-ID | Verdict |
|-------|---------|
| TC-DM-CC-06-CV-SELF-FD-001 | **FAIL** (same inbox self path; canvas OPEN/SAVE prior PASS kept) |

---

## Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| `R-W4E1-SELF-FD-EVIDENCE` | P1 | qa | **CLOSED→escalated** | Evidence obtained; defect is live BR miss not missing FE spawn |
| `R-W4E1-SELF-BR-WF-04` | **P0** | **dev-be** | **OPEN** | Browser+API: submitter=actor + userId body → complete **201**; expect **422** `XBOS-WF-422` |
| Leave L2 UAT | — | — | **SPEC_GAP** | **Not invented** |
| AUTH-003 | — | — | **untouched** | — |

---

## Screens

| File | Meaning |
|------|---------|
| `01-inbox.png` | Hộp thư list |
| `02-self-detail.png` | Detail self probe |
| `03-self-card.png` / `03-self-after.png` | Before/after Duyệt self |
| `04-self-f5.png` | F5 after self complete |
| `05-control-*.png` / `06-control-f5.png` | Non-self control |

---

## completion_report

| Closed | Open |
|--------|------|
| L0; HDSD inbox path; **proven** submitter=approver browser case; control non-self **201** `XBOS-WF-200`; by-uc SELF-FD stamps updated; U65 no seed; Leave L2 not invented; BE Jest 17/17 cited | **P0** live BR-WF-04 on `completeStepTask` not enforced (201 vs 422); `uat_done` false; Leave L2 SPEC_GAP |

## next_owner

`pm` → dispatch **dev-be** (P0 live guard)

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-BE-WF-SELF-FD-02
from_role: pm
to_role: dev-be
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: READY_FOR_QA

CONTEXT: QA FAIL PO-UC-TC-W4-QA-SELF-FD-01.
Browser proven: instance.context.submitter.userId=ceo@xe.vn · FE POST complete body.userId=ceo@xe.vn → 201 XBOS-WF-200 (expected 422 XBOS-WF-422).
Control non-self catalog still 201 OK. Jest workflow-engine 17/17 PASS — unit/live skew.
evidence: docs/qa/evidence/po-uc-tc-w4-qa-self-fd-01.md

MISSION:
1) Fix completeStepTask so live JOIN row exposes instance submitter (prefer i.context AS instance_context; do not rely on ambiguous t.*/i.context name collision).
2) Confirm running nest process loads rebuilt dist (restart if watch stale).
3) Regression: Jest keep 17/17 + READY_FOR_QA for QA browser retest same self path.
4) CẤM: seed inbox · invent Leave L2 · weaken AUTH-003 · break non-self 201 XBOS-WF-200.
```

## ack_status

**PASS_TO_PM**
