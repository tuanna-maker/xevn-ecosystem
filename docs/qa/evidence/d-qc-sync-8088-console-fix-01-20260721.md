# QC Gate Decision — D-QC-SYNC-8088-CONSOLE-FIX-01 (console residual close · 2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-QC-SYNC-8088-CONSOLE-FIX-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **priority** | P1 residual close |
| **qa_evidence** | `docs/qa/evidence/d-qa-sync-8088-console-fix-01-20260721.md` (**PASS_TO_PM**) |
| **fe_att** | `docs/qa/evidence/d-hrm-att-invalid-date-01-fe-20260720.md` (**READY_FOR_QA**) |
| **fe_profile** | `docs/qa/evidence/d-hrm-emp-profile-btn-nest-01-fe-20260720.md` (**READY_FOR_QA**) |
| **devops_sync** | `docs/qa/evidence/d-do-sync-8088-console-fix-01-20260720.md` (**PASS_TO_PM**) |
| **URL** | `http://14.225.217.232:8088` (**not** localhost) |
| **executed_at** | `2026-07-21` |
| **decision** | **GO** — console wave CLOSED (ATT Invalid time + profile button-nest + salary soft + dialog/RR clean) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | U65 zero-seed · browser FE-only · no Phase1/PROD · no FE reopen without new FAIL |

---

## Executive summary

QC audited the Dev8088 console residual chain: FE fixes (2026-07-20) → DevOps VPS sync → QA browser U65 retest (2026-07-21) **PASS**. Product console classes on `:8088` are **CLOSED**:

1. **Chấm công weekly** — no white crash; **0** `RangeError: Invalid time value`; dates `dd/MM/yyyy`.
2. **Employee profile pin/DnD** — unpin = `span[role=button]`; **0** nested native `button`; **0** `validateDOMNesting`.
3. **Salary soft + dialog/RR** — Lương no Invalid time; Thêm phụ cấp title visible; **0** DialogTitle / Description / RR Future Flag warns.

**Soft residual `R-ATT-WEEKLY-EMPTY-SPINNER` (P3)** — weekly grid spinner / `Tổng số: 0` despite records API 200 — **non-blocking** for this console wave (not Invalid-time class). Defer separate UX/aggregate lane.

**Verdict: GO** — console wave residual close only. **NOT** Phase 1 DONE · **NOT** PROD-READY. **Cấm** re-open FE without new FAIL · **cấm** seed · **cấm** localhost-only claim.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-fe ATT | `d-hrm-att-invalid-date-01-fe-20260720.md` | READY_FOR_QA — `formatDisplayDate` / weekly title helpers |
| dev-fe profile | `d-hrm-emp-profile-btn-nest-01-fe-20260720.md` | READY_FOR_QA — unpin span + drag handle div |
| devops | `d-do-sync-8088-console-fix-01-20260720.md` | PASS_TO_PM — PSCP/tar sync + hrm-fe restart; markers on VPS |
| qa | `d-qa-sync-8088-console-fix-01-20260721.md` | **PASS_TO_PM** — browser :8088 AC1–AC4 PASS |
| qc (this) | `d-qc-sync-8088-console-fix-01-20260721.md` | **GO** — console wave CLOSED |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `d-qa-sync-8088-console-fix-01-20260721.md` | **1** | **4/8** fail (`command_table`, `portal_url` regex, `journey_l25`, `crud_or_matrix`) | **PROCESS only** — prose has URL `:8088`, CDP console hook, AC click paths, soft residual table. Missing formal command/J-*/matrix labels. **Not** product NO-GO (precedent: `process-pack-not-product-nogo`). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-qa-sync-8088-console-fix-01-20260721.md
# FAIL: QC evidence pack incomplete (4/8 checks)
#   - command_table
#   - portal_url
#   - journey_l25
#   - crud_or_matrix
```

**QC L2.5 mapping (adjudication — console residual slice only):**

| J-* / UF | This wave | Status |
|----------|-----------|--------|
| **J-HRM-06** (Chấm công → bản ghi / weekly) | Sheet → weekly view; no Invalid time crash | **PASS** (console class close) |
| **J-HRM-01** (employee list → detail) | Profile DVU-0005 pin/unpin path | **PASS smoke** (path used) |
| **UF-HRM-06** (Lương / phụ cấp) | Soft Invalid time + Thêm phụ cấp dialog clean | **PASS** (soft + a11y carry) |
| Full UF promote / mutate CRUD | Out of slice | **not promoted** |

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| QA pack 4/8 missing command_table / portal_url label / J-* / matrix PASS rows | P3 process | qa (optional polish) | **Noted** — not product reopen |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `:8088/` + `:8088/hr/` HTTP **200** (2026-07-21) | ENV | **PASS** — Dev8088 reachable |
| ATT weekly 0× RangeError / Invalid time | PRODUCT | **PASS** — **CLOSED** |
| Profile 0× validateDOMNesting / nested button | PRODUCT | **PASS** — **CLOSED** |
| Lương soft no Invalid time; Ngày trả `—` | PRODUCT | **PASS** — **CLOSED** |
| DialogTitle / Description / RR Future Flag 0× | PRODUCT | **PASS** — carry clean |
| `R-ATT-WEEKLY-EMPTY-SPINNER` (spinner / Tổng số 0 + records 200) | PRODUCT soft P3 | **NON-BLOCKING** — defer; not console AC |
| Seed | PROCESS U65 | **PASS** — none in QA evidence |
| evidence-pack 4/8 | PROCESS | Format note only — **not** product NO-GO |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** |

---

## L0 / Dev8088 spot (QC)

| Check | Result |
|-------|--------|
| `http://14.225.217.232:8088/` | HTTP **200** |
| `http://14.225.217.232:8088/hr/` | HTTP **200** |
| Localhost-only claim | **Rejected** — QA + QC cite `:8088` |

Concurs QA environment (Dev8088 after DevOps sync).

---

## Exit criteria adjudication

| # | Exit (PM dispatch) | QC |
|---|--------------------|-----|
| 1 | GO or GWC on console wave only (ATT Invalid time + profile nest + salary soft) | **GO** — all three CLOSED |
| 2 | Cite QA evidence 20260721 | **PASS** — cited |
| 3 | Soft `R-ATT-WEEKLY-EMPTY-SPINNER` non-blocking | **PASS** — noted defer P3 |
| 4 | no Phase1/PROD | **PASS** — **NOT claimed** |
| 5 | Evidence this file | **PASS** |
| 6 | ack_status PASS_TO_PM | **PASS** |

---

## Residuals / conditions after this gate

| ID | Severity | Item | Owner | Status |
|----|----------|------|-------|--------|
| **R-ATT-WEEKLY-EMPTY-SPINNER** | P3 soft | Weekly sheet spinner / empty aggregate UX despite records 200 | `dev-fe` / `qa` (separate lane) | **OPEN — non-blocking**; **not** console reopen |
| **C-PROCESS-PACK** | P3 process | QA pack verify 4/8 labels | `qa` (optional) | **OPEN process** — not product NO-GO |
| **C-NOT-PHASE1-PROD** | Standing | NOT Phase1 DONE · NOT PROD-READY | pm | **OPEN standing** |

**Console wave product ACs:** **CLOSED**. No FE re-open without new FAIL.

---

## Controls / cấm

| Control | Status |
|---------|--------|
| U65 zero-seed | **PASS** |
| Re-open FE without new FAIL | **FORBIDDEN** |
| Localhost-only claim | **FORBIDDEN** — Dev8088 cited |
| Phase1 / PROD DONE | **FORBIDDEN** — not claimed |
| Seed in evidence | **None** |

---

## Handoff

- **completion_report:** Closed `D-QC-SYNC-8088-CONSOLE-FIX-01` — **GO** console residual on Dev8088 (ATT Invalid time + profile button-nest + salary soft + dialog/RR). Soft `R-ATT-WEEKLY-EMPTY-SPINNER` non-blocking. Process pack 4/8 noted only. **NOT** Phase1/PROD. No FE reopen.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/d-qc-sync-8088-console-fix-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-INTAKE-D-QC-SYNC-8088-CONSOLE-FIX-01
from_role: qc
to_role: pm
lane: governance
priority: P1 closed → wave kế
entry_criteria: QC GO docs/qa/evidence/d-qc-sync-8088-console-fix-01-20260721.md; console wave CLOSED on :8088
exit_criteria: Bus INTAKE GO; update TEAM_WORKING_NOW / backlog; soft R-ATT-WEEKLY-EMPTY-SPINNER defer or separate P3 Task only if sponsor prioritizes empty-grid UX; cấm Phase1/PROD claim; cấm re-open FE console fixes without new FAIL
ack_status: PASS_TO_PM already from qc — pm owns next program dispatch
```
