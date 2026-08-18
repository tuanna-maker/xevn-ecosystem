# PO-UC-TC-W4-QA-INB-X-COMPANY-01 — Inbox complete `x-company-id` header smoke

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-INB-X-COMPANY-01` |
| **role** | qa |
| **executed_at** | 2026-08-04 |
| **prior_dev** | `docs/qa/evidence/po-uc-tc-w4-dev-fe-inb-x-company-01.md` |
| **prior_qa** | `docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md` residual `R-W4E1-INB-X-COMPANY` |
| **locks** | U65 zero-seed · header smoke only · cấm invent Leave L2 · cấm reopen DEPT · **uat_done: false** |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos `:28002` · commit `dc930c5` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **harness** | `scripts/qa/_tmp-po-uc-tc-w4-qa-inb-x-company-01-browser.mjs` |
| **machine_log** | `docs/qa/evidence/_tmp-po-uc-tc-w4-qa-inb-x-company-01-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-uc-tc-w4-qa-inb-x-company-01/` |
| **ack_status** | **PASS_TO_PM** |
| **seat overall** | **PASS** |

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
2. **Hộp thư** `/command-center/inbox`
3. FE-origin leave card (`data-business-type=hrm_leave`) → **Duyệt**
4. DevTools/Playwright: assert `POST …/tasks/:id/complete` header `x-company-id=main` + response 2xx `XBOS-WF-200`

**Cấm đã tuân:** không `pnpm seed:*` · không invent Leave L2 · không reopen DEPT · không claim full UAT.

---

## Mission results

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Inbox has FE-origin leave task (no seed) | **PASS** — 46 cards; clicked `hrm_leave` | LIST + CLICK_INBOX_APPROVE |
| 2 | POST complete request header `x-company-id=main` | **PASS** | `xCompanyId=main` on complete |
| 3 | Response 2xx `XBOS-WF-200` | **PASS** — **201** `XBOS-WF-200` | task `a7408588-ac8f-4699-9466-397b62eda2a0` |
| 4 | Optional GET tasks header | **PASS** — `x-company-id=main` · GET **200** `XBOS-WF-203` | list parity |

### Capture (Playwright)

```text
GET  /api/xbos/workflow-engine/tasks?… → 200 XBOS-WF-203 · x-company-id=main
POST /api/xbos/workflow-engine/tasks/a7408588-ac8f-4699-9466-397b62eda2a0/complete
     → 201 XBOS-WF-200 · x-company-id=main
```

Prior P1 wave captured complete header as **null** (`x-company-id=n/a`). This retest closes residual **`R-W4E1-INB-X-COMPANY`**.

---

## U78 test execution log

| Field | Value |
|-------|--------|
| **log_id** | `TEL-PO-UC-TC-W4-QA-INB-X-COMPANY-01` |
| **tester** | qa · Playwright Chromium |
| **started_at** | 2026-08-04T02:51:56Z |
| **ended_at** | 2026-08-04T02:52:08Z |
| **spec_ref** | residual `R-W4E1-INB-X-COMPANY` · UC-CC-P0-06 approve path must_keep |

| seq | action | expected | actual | result |
|-----|--------|----------|--------|--------|
| 1 | L0 | 200×3 | hrm/xbos/portal 200 | pass |
| 2 | Login CEO | AUTH 2xx | POST login **201** `XBOS-AUTH-200` | pass |
| 3 | Inbox list | tasks + header main | 46 cards · GET **200** · **x-company-id=main** | pass |
| 4 | Duyệt hrm_leave | complete header main + WF-200 | POST **201** `XBOS-WF-200` · **x-company-id=main** | pass |

---

## Residuals

| ID | Sev | Status | Note |
|----|-----|--------|------|
| `R-W4E1-INB-X-COMPANY` | P2 | **CLOSED** | complete/list now send `x-company-id=main` (parity definitions PUT) |
| `R-W4E1-CV-L2-SELF` | P1 | OPEN (out of scope) | Leave L2 / self-approve — not this mission |
| `R-W4E1-CV-GRAPH-TAB` | P2 | OPEN (out of scope) | canvas graph tab — not this mission |

---

## completion_report

| Closed | Residual / open |
|--------|-----------------|
| Header smoke PASS: GET tasks + POST complete both `x-company-id=main`; approve still **201** `XBOS-WF-200`; U65 no seed; DEPT untouched; Leave L2 not invented; `R-W4E1-INB-X-COMPANY` **CLOSED** | L2/self + canvas graph tab still open elsewhere; `uat_done` false |

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-INB-X-COMPANY-01
from_role: qa
to_role: pm
lane: execution
ack_status: PASS_TO_PM

INTAKE: Inbox x-company-id header smoke PASS after Dev-FE FIX.
evidence: docs/qa/evidence/po-uc-tc-w4-qa-inb-x-company-01.md
machine: docs/qa/evidence/_tmp-po-uc-tc-w4-qa-inb-x-company-01-browser.json

CLOSED: R-W4E1-INB-X-COMPANY — POST …/tasks/:id/complete x-company-id=main + 201 XBOS-WF-200; GET tasks also main.
OUT_OF_SCOPE still open: R-W4E1-CV-L2-SELF (P1) · R-W4E1-CV-GRAPH-TAB (P2).
CẤM: seed · invent Leave L2 · reopen DEPT.

PM: mark residual CLOSED on bus; continue W4 backlog (L2/self or next P0) — no QC needed for this header-only P2 unless wave gate requires.
```

## ack_status

**PASS_TO_PM**
