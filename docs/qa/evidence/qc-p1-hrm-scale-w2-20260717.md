# QC Gate — P1-HRM-SCALE-QC-W2 (Scale FE W2 picker only)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-SCALE-QC-W2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | VPS Dev8088 `http://14.225.217.232:8088` · portal-fe `8088→5173` · `PORTAL_DEV_URL` Dev8088 |
| **persona** | Group CEO `ceo@xe.vn` · BOD · `companyId=main` · `tenantId=xevn` |
| **deploy HEAD** | `5d27676` (`p1-hrm-scale-fe-w2-deploy-20260717.md`) |
| **decision** | **GO WITH CONDITIONS** |
| **scope_claim** | **Scale FE W2 picker only** (insurance typeahead + company 0 dump + leave Select capped + J-HRM-02 regression) |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY; T-CONC 1000-VU unproven (W3) |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed in FE/deploy/QA/QC chain |

---

## Scope (bounded)

| In scope (this gate) | Out of scope / conditions |
|----------------------|---------------------------|
| Insurance Add dialog ≤1 employees GET page=1 + keyword typeahead; **0** `listAllEmployees` multi-page chain | Insurance **list** mount fan-out (`contracts-insurance` page=1..11) → P2 backlog |
| Company members: **0** employees dump on mount; dialogs deferred/capped | Bulk-invite per-company capped GET not exercised (`admin/companies` empty) → P3 data |
| Attendance leave Select capped (1× page_size=100); **0** page=2..N | Attendance child-tab defer polish → P3 backlog |
| **J-HRM-02** regression green (T-FANOUT, profile ×1, `_v` stable, console P0=0, no 429) | Soft-nav **rời Chấm công** stall → **COND-SCALE-W2-ATT-NAV** / `D-HRM-ATT-NAV-STALL-01` |
| Close W1 condition **`COND-SCALE-W2-PICKER`** | Reopen W1 `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` CLOSED — **forbidden** (no new FAIL) |
| | BE W2 indexes/pool · W3 T-CONC · Phase 1 / PROD |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md` | QA browser | **PASS_TO_PM** — 4/4 W2 exit criteria PASS; U65 |
| `docs/qa/evidence/p1-hrm-scale-fe-w2-deploy-20260717.md` | DevOps | HEAD `5d27676`; portal-fe + hrm-fe live; L0 `:8088` **200** |
| `docs/qa/evidence/p1-hrm-scale-fe-w2-20260717.md` | Dev-FE | `useEmployeePicker` typeahead; company deferred; `listAllEmployees` export-only |
| `docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md` | QC W1 | Prior GWC; **`COND-SCALE-W2-PICKER`** was open |
| `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` | ADR | §5.1–5.2 / §6 W2 FE picker migration |
| Screenshots | QA | typeahead + profile + **att-emp-stall** (URL employees / body Attendance Overview) |

**QC spot-check (visual):** `p1-hrm-scale-qa-w2-insurance-typeahead-20260717.png` shows keyword `NV0001` + filtered dropdown (2 rows). `p1-hrm-scale-qa-w2-att-emp-stall-20260717.png` confirms stall: sidebar **Nhân sự** + portal URL `/hrm/employees` while iframe body still Attendance **Tổng quan**.

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md
# → FAIL 1/8 (command_table only)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md
# → see Command table (this QC pack)
```

**QC adjudication:** **PROCESS GWC** on QA pack — browser L2.5 Network counts via iframe `PerformanceResourceTiming`, U65 no-seed, handoff contract complete. Script miss is **format only** (missing command table), not product FAIL. Precedent: W1 Scale QC PROCESS GWC.

### Command table (QC gate)

| Command | Result | Notes |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md` | **FAIL** exit **1** (1/8) | PROCESS GWC — `command_table` only |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md` | **PASS** exit **0** (8/8) | This gate file |
| Deploy L0 `GET http://127.0.0.1:8088/` + insurance/company/employees | **PASS** **200** | `p1-hrm-scale-fe-w2-deploy-20260717.md` |
| FE unit (carry) vitest picker / useEmployees | **PASS** | FE W2 evidence (24 tests cited) |

Portal URL: `http://14.225.217.232:8088` (VPS) · compose `portal-fe` **8088→5173** · smoke `http://127.0.0.1:8088/` · `PORTAL_DEV_URL` Dev8088.

---

## Audit checklist (PM dispatch)

| # | Criteria | QA evidence | QC verdict |
|---|----------|-------------|------------|
| 1 | Insurance typeahead ≤1 + keyword; 0 multi-page dump | Open: **1×** `page=1&page_size=50`; keyword `NV0001`: **1×**; page=2..N **0**; trunc hint 50/1107 | **PASS** |
| 2 | Company: 0 employees dump on mount; dialogs capped/deferred | Mount **0** employees GET; tabs admin only; Thêm/Mời **0** until company selected | **PASS** |
| 3 | Attendance leave Select capped | Tab Nghỉ phép: **1×** `page_size=100` + leave-requests; **0** page=2..N | **PASS** |
| 4 | J-HRM-02 regression green | Mount 1× list; profile ×1 + 0 chains; `_v` stable; employees↔contracts soft-nav OK; console P0=0; no 429 | **PASS** |
| 5 | Mark **`COND-SCALE-W2-PICKER` CLOSED** | QA + Network + deploy HEAD `5d27676` | **CLOSED** |
| 6 | NEW P1 `D-HRM-ATT-NAV-STALL-01` as GWC condition; **do not** reopen W1 profile CLOSED | Soft-nav out of Attendance stalls; J-HRM-02 / employees↔contracts still PASS; profile dedupe not retested FAIL | **PASS** (condition recorded; W1 CLOSED stays CLOSED) |

---

## Classification

| Signal | Type | QC verdict |
|--------|------|------------|
| Insurance dialog 1× capped + keyword typeahead | **PRODUCT** / COND-SCALE-W2-PICKER | **PASS** — condition **CLOSED** |
| Company mount 0 employees dump | **PRODUCT** / W2 picker | **PASS** |
| Leave Select 1× page_size=100 | **PRODUCT** / W2 smoke | **PASS** |
| J-HRM-02 T-FANOUT / detail / `_v` / console | **PRODUCT** / L2.5 regression | **PASS** |
| Soft-nav leave Attendance → view stall | **PRODUCT** / P1 nav | **CLOSED** (amendment) — `COND-SCALE-W2-ATT-NAV` via `qc-d-hrm-att-nav-stall-01-20260717.md` (does **not** reopen W1 profile) |
| Insurance list mount page=1..11 | **PRODUCT** / P2 list dump (non-picker) | **CONDITION** — non-blocking W2 picker |
| Radix DialogTitle a11y | **PRODUCT** / P3 a11y | **CONDITION** — non-blocking |
| `admin/companies` total 0 | **DATA** / P3 env | **CONDITION** — non-blocking; deferred path already PASS |
| QA pack verify 1/8 FAIL | **PROCESS** | **GWC** — format only |
| Seed used | **PROCESS** | **PASS** — none (U65) |
| T-CONC 1000 VU | **NFR** / W3 | **CONDITION** — unproven |
| Phase 1 / PROD | **PROGRAM** | **NOT CLAIMED** |
| W1 profile dedupe CLOSED | **PRODUCT** | **STAYS CLOSED** — no new FAIL |

---

## L2.5 — J-* cited (mandatory this gate)

| J-ID | Journey | QA evidence | L2.5 verdict | Promotable this slice |
|------|---------|-------------|--------------|------------------------|
| **J-HRM-02** | Nhân sự list → Hồ sơ → back; soft-nav employees↔contracts | `p1-hrm-scale-qa-w2-20260717.md` §4 | **PASS** | **YES** Dev8088 group CEO Scale FE W2 picker regression |
| Attendance soft-nav out (related to J-HRM-06 class) | Soft-nav rời Chấm công | §NEW DEFECT → closed by `qc-d-hrm-att-nav-stall-01-20260717.md` | **PASS** (CLOSED) | **YES** — condition cleared; not picker scope originally |
| Other J-HRM-* | — | Not in Scale FE W2 picker scope | **NOT RE-GATED** | — |

Read-only / NFR matrix (W2 picker):

| AC / metric | Result |
|-------------|--------|
| Insurance picker T-FANOUT ≤1 + keyword | **PASS** |
| Company mount employees dump | **0** — **PASS** |
| Leave Select capped | **PASS** |
| J-HRM-02 / T-CONSOLE-P0 / `_v` | **PASS** |
| `COND-SCALE-W2-PICKER` | **CLOSED** |

---

## Conditions (open after this gate)

| ID | Severity | Owner | Expiry / trigger | Note |
|----|----------|-------|------------------|------|
| **COND-SCALE-W2-ATT-NAV** / `D-HRM-ATT-NAV-STALL-01` | **P1** | — | — | **CLOSED 2026-07-17** — superseding QC `docs/qa/evidence/qc-d-hrm-att-nav-stall-01-20260717.md` (ENV READY + QA retest PASS @ `96651c7`); do **not** reopen without new browser counter-evidence |
| **COND-SCALE-W2-INS-LIST-FANOUT** | P2 | — | — | **CLOSED 2026-07-17** — superseding QC `docs/qa/evidence/qc-p1-hrm-scale-fe-w2-ins-list-20260717.md` (FE `bf5067b` mount capped page=1 + honest total + «Tải thêm»; QA browser retest PASS) |
| **COND-SCALE-W2-A11Y-DIALOG** | P3 | `dev-fe` | Next insurance dialog touch | Radix `DialogContent` missing `DialogTitle` |
| **COND-SCALE-W2-ADMIN-COMPANIES** | P3 | `dev-be` | Confirm intended empty vs bug | `admin/companies` total 0 blocks bulk-invite company select exercise |
| **COND-SCALE-W2-DEPT-FILTER** | P3 | `dev-fe` | Carry from W1 | Still open (not retested this wave) |
| **COND-SCALE-W3-CONC** | NFR | `devops` | ADR W3 | T-CONC 1000-VU unproven |
| **COND-SCALE-PACK-FORMAT** | Process | `qa` | Next scale QA pack | Include command table so verify exits 0 |

**CLOSED this gate:** **`COND-SCALE-W2-PICKER`** (W1 residual).  
**CLOSED later (ATT-NAV QC):** **`COND-SCALE-W2-ATT-NAV`** — see `qc-d-hrm-att-nav-stall-01-20260717.md`.  
**CLOSED later (INS-LIST QC):** **`COND-SCALE-W2-INS-LIST-FANOUT`** — see `qc-p1-hrm-scale-fe-w2-ins-list-20260717.md`.

**NOT conditions of this gate / forbidden:** reopen `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` without new browser FAIL; reopen ATT-NAV without browser stall counter-evidence.

---

## Residual risk statement

Scale FE W2 closes satellite **employee picker** full-dump on Dev8088 for group CEO (insurance typeahead, company mount, leave Select). A **new P1** soft-nav stall leaving Attendance is out of picker scope but must be fixed before claiming broader HRM soft-nav health. Insurance **list** still fans out (P2). Concurrent capacity (1000 users) remains W3. This gate does **not** promote Phase 1 DONE or PROD-READY.

---

## ADR / program status (QC update)

| Wave | Status after this gate |
|------|------------------------|
| **ADR W1 FE** | **CLOSED** (unchanged) — profile dedupe stays CLOSED |
| **ADR W2 FE picker** (`COND-SCALE-W2-PICKER`) | **CLOSED** — QC GWC 2026-07-17 |
| **ADR W2 FE residual** (att-nav stall, insurance list fan-out) | att-nav **CLOSED** (`qc-d-hrm-att-nav-stall-01-20260717.md`); insurance list fan-out **OPEN** |
| **ADR W2 BE** (indexes/pool) | Parallel lane — **not** part of this FE picker verdict |
| **ADR W3** (1000-VU) | **OPEN** |

ADR file amended: `docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md` §1.2 / §6 W2 FE status.

---

## Handoff packet

- `work_item_id`: `P1-HRM-SCALE-QC-W2`
- `from_role`: `qc`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md`
- `completion_report`: **GO WITH CONDITIONS** for **Scale FE W2 picker only**. Checklist 1–6 PASS; `COND-SCALE-W2-PICKER` **CLOSED**; J-HRM-02 PASS; U65; PROCESS GWC on QA pack format. GWC conditions = **D-HRM-ATT-NAV-STALL-01 (P1)** + insurance list fan-out P2 + a11y/admin-companies P3 + W3 T-CONC. W1 profile CLOSED **not** reopened. **NOT** Phase 1 DONE / **NOT** PROD.
- `next_owner`: `pm` → (a) ensure `dev-fe` on `D-HRM-ATT-NAV-STALL-01`; (b) optional W2 P2 insurance list / W3 or BE W2 when capacity allows
- `next_dispatch_prompt`: (copy-ready below)

### next_dispatch_prompt (P1 residual — primary)

```text
work_item_id: D-HRM-ATT-NAV-STALL-01
from_role: pm
to_role: dev-fe
subagent_type: dev-fe
entry_criteria: P1-HRM-SCALE-QC-W2 GO WITH CONDITIONS; COND-SCALE-W2-ATT-NAV open; evidence docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md + docs/qa/evidence/p1-hrm-scale-qa-w2-20260717.md §NEW DEFECT
read_first: apps/web/hrm route/nav bridge (postMessage soft-nav); Attendance* pages; screenshots p1-hrm-scale-qa-w2-att-emp-stall-20260717.png
spec_ref: FE-01 embedScopeKey soft-nav; J-HRM-06 class; ADR Scale W2 residual
symptom: soft-nav RỜI /hr/attendance → employees/contracts: iframe path changes but view stuck on Attendance Overview; 0 network; F5 recovers; into attendance OK; employees↔contracts OK
exit_criteria: attendance → employees/contracts soft-nav renders correct view; _v stable; no regress J-HRM-02 / W2 picker Network counts; jest/vitest route listener; READY_FOR_QA
evidence_path: docs/qa/evidence/d-hrm-att-nav-stall-01-20260717.md
cấm: seed; remount iframe key by path; reopen W1 profile CLOSED; Phase 1/PROD claim
```

### next_dispatch_prompt (optional parallel — W2 P2 backlog)

```text
work_item_id: P1-HRM-SCALE-FE-W2-INS-LIST
from_role: pm
to_role: dev-fe
subagent_type: dev-fe
entry_criteria: P1-HRM-SCALE-QC-W2 GWC; COND-SCALE-W2-INS-LIST-FANOUT; picker CLOSED
read_first: docs/qa/evidence/qc-p1-hrm-scale-w2-20260717.md; insurance list mount Network (page=1..11); ADR §6 W2
spec_ref: ADR T-FANOUT for insurance list (not picker)
exit_criteria: /hr/insurance mount ≤1–2 GETs for list page (no 11-page dump); vitest; READY_FOR_QA
evidence_path: docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-20260717.md
cấm: seed; regress W2 picker; Phase 1/PROD
```

### next_dispatch_prompt (W3 / capacity — when P1 stall closed or parallel BE)

```text
work_item_id: P1-HRM-SCALE-DO-W3
from_role: pm
to_role: devops
subagent_type: devops
entry_criteria: ADR-HRM-SCALE-1000-USERS §6 W3; COND-SCALE-W3-CONC open; Prefer after W2 picker CLOSED (done) + BE W2 indexes if ready
read_first: ADR §5.5 T-CONC; docs/ops/PRODUCTION_ENABLE_RUNBOOK.md
exit_criteria: 1000 concurrent staged ramp evidence; error rate <1%; list p95 budget documented; PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-scale-do-w3-20260717.md
cấm: seed; claim PROD from load test alone without QC gate
```
