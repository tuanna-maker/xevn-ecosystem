# BM-EXP-CONTRACT-COMP-01 — Inventory BM-04 / BM-AC-04-* (HĐLĐ compensation)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-EXP-CONTRACT-COMP-01` |
| **from_role** | `explore` |
| **to_role** | `pm` |
| **lane** | execution (read-only inventory) |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **priority** | P1 |
| **thoroughness** | medium |
| **executed_at** | `2026-07-22` (inventory date stamp 20260722) |
| **scope** | Code + prior evidence vs BM-04 / BM-AC-04-01..05 — **no** `apps/**` edits · **no** live browser mutate |
| **spec_ref** | `docs/program/deltas/BMINUTES_AC_MATRIX.md` § BM-04 · prior F5 `AC-CD-F5-*` · `CUSTOMER_DEMO_HRM_DELTA_20260620.md` §5 |
| **ack_status** | **PASS_TO_PM** |
| **overall_inventory** | **IMPLEMENTED** (core three customer asks present) · soft gaps below · **customer retest still required** |

---

## Executive answers (sponsor three asks)

| Ask | Inventory | Where |
|-----|-----------|--------|
| **Trial salary fields?** | **YES** | BE `line_type: 'probation'` · FE «Lương thử việc (probation)» on tab **Đãi ngộ** |
| **Allowances separated from contract?** | **YES** | Salary/allowances on `employee_compensation_*` packages — **not** required on HĐ body; tabs **HĐ / Đãi ngộ / Lịch sử** |
| **Change history?** | **YES** | Append-only `employee_compensation_history` + `POST …/revise` + FE tab **Lịch sử** |

---

## Artifact map (SoT paths)

### Backend (`apps/api/hrm-api`)

| Piece | Path | Notes |
|-------|------|--------|
| Compensation service | `src/contracts-insurance/employee-compensation.service.ts` | create / list / get / active / revise / history; schema ensure for packages+lines+history |
| Controller routes | `src/contracts-insurance/contracts-insurance.controller.ts` | `POST/GET compensation-packages`, `GET …/active`, `POST …/:id/revise`, `GET compensation-history` |
| Line DTO | `src/contracts-insurance/dto/create-compensation-package.dto.ts` | `base` \| `probation` \| `allowance`; `allowance_code` required for allowance |
| Contract DTO | `src/contracts-insurance/dto/create-contract.dto.ts` | `salary` **@deprecated / optional / ignored** (BR-CD-F5-01) |
| Contract service | `src/contracts-insurance/contracts-insurance.service.ts` | soft link `compensation_package_id`; ignores body salary |
| Jest | `src/contracts-insurance/employee-compensation.service.spec.ts` | AC-CD-F5-02 base+probation+2 allowances; reject probation if not thử việc; revise append history |

### Frontend (`apps/web/hrm`)

| Piece | Path | Notes |
|-------|------|--------|
| Contract shell tabs | `src/components/employee/EmployeeContracts.tsx` | Tabs **Hợp đồng / Đãi ngộ / Lịch sử**; form hint: lương không nhập trên HĐ |
| Đãi ngộ panel | `src/components/employee/EmployeeCompensationPanel.tsx` | base + probation + ≥2 allowances; `ViMoneyInput`; revise not in-place edit |
| History panel | `src/components/employee/EmployeeCompensationHistoryPanel.tsx` | timeline from `GET compensation-history` |
| Hook | `src/hooks/useEmployeeCompensation.ts` | create / revise / list / active / history |
| API client | `src/integrations/hrmApi.ts` | compensation-* helpers |
| Allowance codes | `src/lib/compensationAllowanceCodes.ts` | **static** DM §33 mirror (`PHU_CAP_AN` …) — not live catalog pull |
| Line builder tests | `src/lib/compensationLines.test.ts` | probation + multi-allowance |

### Prior QA/QC (do not overwrite 🟢 without retest)

| Evidence | Verdict | Relevance |
|----------|---------|-----------|
| `docs/qa/evidence/cd-fb-08-contract-qa-20260719.md` | PASS_TO_PM | U65 create/revise/history F5 |
| `docs/qa/evidence/cd-fb-08-contract-qc-20260719.md` | **GO WITH CONDITIONS** | AC-CD-F5-01/03/04/07 PASS; F5-02 **N/A** (no probation HĐ on subject) |
| `docs/qa/evidence/c-cd-fb-08-01-qc-20260719.md` | CLOSED | cold `/active` 500 fixed |

---

## PASS/FAIL matrix — BM-AC-04-* (inventory = code existence + prior evidence)

Legend: **PASS** = present and mapped · **GAP** = missing / dual-path / unverified · **N/A-COND** = code ready, browser path not proven on probation NV · Inventory ≠ customer U65 retest green.

| AC-ID | Customer intent | spec_says | code_does | Inventory | Prior browser | Residual |
|-------|-----------------|-----------|-----------|-----------|---------------|----------|
| **BM-AC-04-01** | Create HĐ without forcing salary-on-contract; compensation separate | HĐ ≠ required salary; soft package | Create form term-only; salary ignored BE; tab Đãi ngộ | **PASS** | PASS (CD-FB-08) | — |
| **BM-AC-04-02** | Persist **probation** + **base** lines when NV/HĐ thử việc | `line_type=probation` + base | FE checkbox + BE guard BR-CD-F5-02; jest covers | **PASS** (code) | **N/A-COND** — prior QA no probation subject | Need retest with probation persona |
| **BM-AC-04-03** | ≥2 distinct allowance codes; vi-VN thousand group | DM §33 multi line | Multi-row allowance + `ViMoneyInput`; codes static | **PASS** (core) | PASS codes AN+XANG | **GAP soft:** catalog not live-synced from XBOS |
| **BM-AC-04-04** | Change base twice → history ≥2 append-only | `employee_compensation_history` | `revise` closes prior + INSERT history; HistoryPanel | **PASS** | PASS v1+v2 + F5 | — |
| **BM-AC-04-05** | Embed list → employee → compensation; no 409/500 cold | FR-HRM-INT-02 | Same panels under profile; cold `/active` fixed | **PASS** | PASS P-CC-04 · J-HRM-01 · J-HRM-03 | Spot-check on :8088 for BM program |

### Three-ask rollup

| Question | Verdict |
|----------|---------|
| Trial salary fields? | **PASS** — implemented |
| Allowances separated from contract? | **PASS** — implemented |
| Change history? | **PASS** — implemented |

**BM-04 greenfield build: NOT required.** Wave = **QA customer retest** + **narrow polish** work items below.

---

## Soft gaps (not core absence)

| ID | Severity | Gap | Impact on BM-04 |
|----|----------|-----|-----------------|
| **G-BM-04-01** | P1 retest | Probation mutate path never U65-proven with real probation NV/HĐ | BM-AC-04-02 still **N/A-COND** for customer minutes |
| **G-BM-04-02** | P2 | `XBOS_ALLOWANCE_CODE_OPTIONS` static — comment: «until settings-catalog pull wired» | BM-AC-04-03 «catalog synced» wording soft-fail if customer expects live DM |
| **G-BM-04-03** | P2 UX | `EmployeeSalary.tsx` still has **local-state** phụ cấp / mock-ish payroll UX separate from F5 packages | Confuses «Lương» tab vs «Đãi ngộ» SoT |
| **G-BM-04-04** | P3 (out of BM-AC-04 list) | Payroll does **not** grep-consume `getActiveCompensation` / compensation packages (legacy **C-CD-FB-08-03** / AC-CD-F5-06) | Pay calc may ignore package lines |
| **G-BM-04-05** | P2 env triage | Prior `R-UX-VI-COMP-POST-404` (2026-07-20 format wave) — create returned 404 on that env | Re-check on current stack during QA; may be ENV |

---

## Copy-ready Dev / QA work items

### 1) QA — customer retest (dispatch first)

```text
work_item_id: BM-QA-CONTRACT-COMP-RETEST-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: P1-BMINUTES-CUST-RETEST-01
entry_criteria: L0 portal+hrm+xbos up; U65 zero-seed; persona ceo@xe.vn; prefer ≥1 NV/HĐ status probation for AC-04-02
exit_criteria: Browser evidence for BM-AC-04-01..05 with FE-after-2xx + F5; matrix Dev8088/customer column updated; PASS_TO_PM or FAIL with residual
evidence_path: docs/qa/evidence/bm-qa-contract-comp-retest-01-YYYYMMDD.md
cấm: seed · API-only PASS · claim Phase1/PROD
UF/J: UF-HRM-02 · J-HRM-01 · J-HRM-03
spec_ref: docs/program/deltas/BMINUTES_AC_MATRIX.md BM-AC-04-*
```

### 2) Dev-FE — live allowance catalog (if QA marks G-BM-04-02)

```text
work_item_id: BM-FE-ALLOWANCE-CATALOG-SYNC-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
entry_criteria: BA confirm DM §33 SoT pull path (settings-catalog / XBOS publish); BM-QA residual G-BM-04-02 open
exit_criteria: EmployeeCompensationPanel allowance picker from live catalog (fallback static OK); ≥2 codes persist; vitest; READY_FOR_QA
evidence_path: docs/qa/evidence/bm-fe-allowance-catalog-sync-01-YYYYMMDD.md
allowed_paths: apps/web/hrm/src/lib/compensationAllowanceCodes.ts · EmployeeCompensationPanel.tsx · hooks/catalog clients
forbidden_paths: apps/api/** (unless BA says BE filter needed → split BE-01)
must_keep: PHU_CAP_AN / PHU_CAP_XANG accepted; ViMoneyInput; no salary on HĐ form
```

### 3) Dev-FE — dual salary UX clarity (optional polish)

```text
work_item_id: BM-FE-SALARY-TAB-DUAL-PATH-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
entry_criteria: Sponsor/BA confirm EmployeeSalary tab must not invent local allowances as SoT
exit_criteria: EmployeeSalary clearly payslip/API-only OR deep-link to Contracts→Đãi ngộ; no local-only allowance mutate presented as persisted; READY_FOR_QA
evidence_path: docs/qa/evidence/bm-fe-salary-tab-dual-path-01-YYYYMMDD.md
must_keep: UF-HRM-06 payslip path; F5 compensation package APIs untouched regress
```

### 4) Dev-BE — payroll reads active package (deferred F5-06)

```text
work_item_id: BM-BE-PAYROLL-ACTIVE-COMP-01
from_role: pm
to_role: dev-be
lane: execution
priority: P3
entry_criteria: Closes C-CD-FB-08-03 / AC-CD-F5-06; not blocking BM-AC-04-01..05 inventory PASS
exit_criteria: Payroll consumer uses GET compensation-packages/active (or service equivalent); jest; no destructive overwrite of history; READY_FOR_QA
evidence_path: docs/qa/evidence/bm-be-payroll-active-comp-01-YYYYMMDD.md
pm_note: Out of BM-AC-04 GWT list — schedule after BM-QA retest unless payroll demo blocked
```

### 5) Dev-BE — POST 404 triage (only if QA reproduces)

```text
work_item_id: BM-BE-COMP-POST-404-TRIAGE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P2
entry_criteria: QA reproduces POST /api/hrm/contracts-insurance/compensation-packages → 404 on target env (R-UX-VI-COMP-POST-404)
exit_criteria: Create returns 201 HRM-COMP-201 on cold+warm; root cause ENV vs route; jest/smoke; READY_FOR_QA
evidence_path: docs/qa/evidence/bm-be-comp-post-404-triage-01-YYYYMMDD.md
```

---

## Recommended PM sequence

1. **Do not** dispatch greenfield BE/FE for trial salary / separate allowances / history — already in tree (CD-FB-08).
2. Dispatch **`BM-QA-CONTRACT-COMP-RETEST-01`** (U65) as Wave-1 for BM-04.
3. On FAIL residuals only: FE catalog sync · dual Salary tab · POST 404 triage.
4. Payroll active-comp (**BM-BE-PAYROLL-ACTIVE-COMP-01**) = P3 after AC-04 matrix customer PASS unless demo needs payslip bind.

---

## Handoff

```yaml
work_item_id: BM-EXP-CONTRACT-COMP-01
from_role: explore
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/bm-exp-contract-comp-01-20260722.md
completion_report: |
  BM-04 three asks IMPLEMENTED in FE+BE (probation line, compensation packages
  separated from HĐ, append-only history). BM-AC-04-01..05 inventory PASS with
  soft gaps: probation U65 N/A-COND, static allowance catalog, dual EmployeeSalary
  local allowances, deferred payroll consumer, optional POST-404 triage.
next_owner: pm → qa
next_dispatch_prompt: |
  Task qa BM-QA-CONTRACT-COMP-RETEST-01 — U65 browser BM-AC-04-01..05;
  evidence docs/qa/evidence/bm-qa-contract-comp-retest-01-YYYYMMDD.md;
  cấm seed; include probation NV for AC-04-02 if available.
pm_dispatch_hint: BM-QA-CONTRACT-COMP-RETEST-01 (P1) then residual FE/BE only if FAIL
```

**not promoted:** Phase1 DONE · PROD-READY · live :8088 customer PASS (needs QA) · payroll AC-CD-F5-06
