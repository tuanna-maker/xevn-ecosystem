# Evidence — W1-B-02-EMP-QC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-02-EMP-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | L3 gate — EMP browser (J-HRM-02 + case A/B/C after RET4) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/employees?portal=1&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `w1b-02-emp-qa-ret4.md` PASS_TO_PM · test-log md+json · FE-PROFILE-01 READY parent |
| **spec_ref** | FR-UC-H01 · FR-UC-HRM-21 · J-HRM-02 · HDSD Nhân viên |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY |

---

## Verdict summary

**GO WITH CONDITIONS** — EMP browser wave after QA RET4. Independent QC audit confirms **J-HRM-02** list→profile, Cases **A/B/C**, PATCH **200** `HRM-EMP-202` via FE **Cập nhật** + F5 persistence, U65 zero-seed, U76 HDSD inventory, U78 world-standard test-log md+json. **D-HRM-EMP-PROFILE-PERM-FALLBACK-01 CLOSED**. **D-HRM-EMP-PROFILE-TABGROUPS-01 CLOSED**. Do **not** reopen AUTH-FE chip/Vite residuals (CLOSED on AUTH wave).

**Condition (allowed):** **R-EMP-UI-STAFF-RAW** P2 — list CHỨC VỤ may show raw catalog code `STAFF` for some rows; **defer**; does **not** block J-HRM-02 core. **NOT** Phase 1 / product UAT DONE from this EMP gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/w1b-02-emp-fe-profile-01.md` | READY_FOR_QA; PermissionFallback + tabGroups + transitive restore; profile mount | **ACCEPT** |
| `docs/qa/evidence/w1b-02-emp-qa-ret4.md` | PASS_TO_PM; AC1–5 🟢; J-HRM-02; A/B/C; PATCH+F5; U65 | **ACCEPT** |
| `…-qa-ret4-test-log.md` | 11 chronological steps · verdict pass | **ACCEPT** (U78) |
| `…-qa-ret4-test-log.json` | `schema: xevn-test-log/v1` · 11 steps · 3 cases · summary pass | **ACCEPT** (U78 / OS 31) |
| `…/_tmp-w1b-02-emp-qa-ret4-browser.json` | click_log 24 · ac[] · case_matrix · network PATCH 200 | **ACCEPT** |
| Screens `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/` | **9** PNG on disk | **ACCEPT** (spot visual) |

---

## Independent spot-check (QC)

### EC1 — AC1 list + L0

| Check | Result |
|-------|--------|
| List UI | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/01-employees-list.png` — «Quản lý nhân viên» · **43** rows · status «Đang làm việc» |
| Network | GET `/api/hrm/employees?company_id=main…` **200** total 43 (runtime) |
| Residual visual | Row `UAT-0201` CHỨC VỤ shows **STAFF** → supports **R-EMP-UI-STAFF-RAW** P2 OPEN (CONDITION) |

**PASS** (list AC)

### EC2 — Case A fail_deep

| Check | Result |
|-------|--------|
| Runtime | `A_fail` · validationUi=**true** · noSuccessMutate=**true** · mutateCalls=[] |
| Screen | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/03-case-a-fail.png` — dialog «Thêm nhân viên» + validation UI visible |
| Network | No create POST/PATCH 2xx during Case A |

**PASS** — AC intent (block silent success) met. Note: create dialog may show English Zod copy / dual field chrome — **process/hygiene OBS only**; not invent new FAIL AC beyond QA pack.

### EC3 — Case B / J-HRM-02 + PATCH + F5

| Check | Result |
|-------|--------|
| List→profile | Click SoftDel/holding row → `/hr/employees/4315dade-…` · tabs Chung/Công việc/Hợp đồng/Lương |
| Detail GET | `?company_id=main` **200** · row `company_id=holding` · `HRM-EMP-200` |
| Screen detail | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/04-case-b-detail.png` — profile mounts · name QA SoftDel SD8EZ1HE |
| PATCH via FE | PATCH **200** `HRM-EMP-202` · `display_name=QA SoftDel SD8EZ1HE ·RET4` |
| After patch UI | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/05-case-b-after-patch.png` — name with RET4 suffix |
| F5 | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/06-case-b-f5.png` · GET by id **200** · name persists |

**PASS** — **J-HRM-02 PASS** · **D-HRM-EMP-PROFILE-PERM-FALLBACK-01 CLOSED**

### EC4 — Case C logic_br

| Check | Result |
|-------|--------|
| Scope | Re-open same id under query `company_id=main` → detail `holding` **200** |
| Snake UI | runtime `snakeUiFiltered=[]` · profile `job_title_label=null` OK |
| Screen | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/07-case-c-reopen.png` |

**PASS**

### EC5 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-W1B-02-EMP-QA-RET4-20260803` |
| steps | **11** chronological · all `pass` |
| cases | A_fail · B_success · C_logic (U76 matrix) |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| summary | passed=11 failed=0 · verdict=pass · ack PASS_TO_PM |
| attachments | 9 PNG + runtime — **all exist on disk** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs EMP RET4 | QC |
|---------|-------------------|-----|
| **J-HRM-02** Nhân sự list → Hồ sơ | In-scope (Cases B/C + PATCH/F5) | **PASS** (browser RET4) |
| Other J-HRM-* / J-CC-* / mobile | Out of this WI | **not claimed** |

Mandatory in-scope journey for this EMP gate: **J-HRM-02 PASS**. No untested mandatory J-* claimed PASS.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | J-HRM-02 + A/B/C **PASS** · profile mount defects **CLOSED** · PATCH+F5 via FE |
| **PROCESS** | QA narrative pack `verify:qc:evidence-pack` **7/8** missing `command_table` only — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | QA residual: post-run portal `:5173` may poll DOWN — **not** product NO-GO (run-time L0/portal **200** during RET4) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote EMP close.

---

## Residual

| Id | Status | Sev | Owner | Blocks EMP GO? |
|----|--------|-----|-------|----------------|
| **D-HRM-EMP-PROFILE-PERM-FALLBACK-01** | **CLOSED** | — | — | No — do not reopen without regression |
| **D-HRM-EMP-PROFILE-TABGROUPS-01** | **CLOSED** | — | — | No |
| **R-EMP-UI-STAFF-RAW** | **OPEN — CONDITION** | P2 | PM triage / display wave | **No** (defer OK per residual policy) |
| AUTH-FE chip / Vite | **CLOSED** (AUTH wave) | — | — | No — **cấm reopen** this EMP gate |
| **C-EMP-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table on next QA MD |

---

## Conditions (explicit)

1. **R-EMP-UI-STAFF-RAW** — list sample `job_title_label: "STAFF"` (catalog code) for some rows — **deferred P2**; J-HRM-02 profile AC (null / no snake) **PASS**.
2. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this EMP GWC alone.
3. Do **not** reopen **D-HRM-EMP-PROFILE-PERM-FALLBACK-01** / AUTH-FE chip residuals without new browser regression evidence.
4. Portal post-run DOWN (if observed) = **ENV** — stack recovery, not product demote of RET4 evidence.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-02-emp-qa-ret4.md
→ FAIL 1/8 — command_table
```

**PROCESS GWC** — product J-HRM-02 + A/B/C independently verified; does not demote EMP close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-02-emp-qc-01.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-02-emp-qc-01.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-02-emp-qa-ret4.md` | **FAIL** exit **1** · **7/8** missing command_table (process) |
| `node -e` schema/chrono/allPass on `w1b-02-emp-qa-ret4-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=11 · chrono=true · allPass=true · png=9 missing=[] |
| Disk check 9 PNG under `screens/w1b-02-emp-qa-ret4-20260803/` | **PASS** · all present |
| Runtime cross-check `_tmp-w1b-02-emp-qa-ret4-browser.json` | **PASS** · click_log=24 · PATCH 200 · ac A/B/C 🟢 · J-HRM-02 PASS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-02-emp-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-02-emp-qc-01.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| AC1 list | `#root` + rows · GET main 200 | **PASS** | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/01-employees-list.png` |
| **A** fail_deep | empty/invalid + Lưu · no success mutate | **PASS** | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/03-case-a-fail.png` · runtime mutateCalls=[] |
| **B** success_hdsd | list→detail→PATCH→F5 | **PASS** | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/04-case-b-detail.png` · `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/05-case-b-after-patch.png` · `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/06-case-b-f5.png` · PATCH 200 |
| **C** logic_br | main rollup detail + no snake label | **PASS** | `docs/qa/evidence/screens/w1b-02-emp-qa-ret4-20260803/07-case-c-reopen.png` · snakeUi=[] |
| **J-HRM-02** L2.5 | list → hồ sơ | **PASS** | RET4 Cases B/C · GET/PATCH Network |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not reopen AUTH-FE chip / Vite CLOSED residuals
- Did not invent new AC beyond QA evidence
- Did not NO-GO solely on P2 **R-EMP-UI-STAFF-RAW**

---

## completion_report

**Closed:** L3 QC gate `W1-B-02-EMP-QC-01` on EMP browser after QA RET4. Spot-check list/profile screens + runtime Network + U78 test-log credible. **J-HRM-02 PASS**. Cases A/B/C **PASS**. PATCH via FE **200** + F5. **D-HRM-EMP-PROFILE-PERM-FALLBACK-01 CLOSED**. U65 zero-seed honored.

**Residual / conditions:** **R-EMP-UI-STAFF-RAW** P2 defer (CONDITION); QA pack command_table P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-02-emp-qc-01.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-02-EMP-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/w1b-02-emp-qc-01.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - D-HRM-EMP-PROFILE-PERM-FALLBACK-01 CLOSED — do not reopen without regression
  - J-HRM-02 PASS (EMP local :5173 / :8080)
  - R-EMP-UI-STAFF-RAW P2 CONDITION defer OK
action:
  1) Bus INTAKE W1-B-02-EMP-QC-01 PASS_TO_PM + promote EMP profile residuals CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open W1-B / PM_OPEN_BACKLOG item (do not idle)
  3) Defer R-EMP-UI-STAFF-RAW to a display-ready list wave only when that UF enters scope — not EMP J-HRM-02 reopen
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this EMP GWC
  5) Do NOT reopen AUTH-FE chip/Vite CLOSED residuals
cấm: seed · invent UAT DONE · reopen profile PermissionFallback without new defect
```

---

## pm_dispatch_hint

`W1-B-02-EMP-PM-CLOSE` — promote EMP profile CLOSED; GWC R-EMP-UI-STAFF-RAW P2 defer; next backlog; no UAT/Phase1 DONE claim; no AUTH-FE reopen.
