# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-02 AC O1–O12 only** · **no** `apps/**` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-11 · board #13) |
| **depends_on** | SA-01 Option A **CONFIRMED** · `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md` · peer CORE-01 **SEALED** `CORE01QC1-MSL6WMS7` |
| **uc_ids** | `UC-BP-CORE-02` |
| **Verdict** | **O1–O12 CONFIRMED** |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-02 · AC-CORE-CB-01/02 · BR-BP-SEC-02 |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` F-CORE-EMP-02 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.2 · §3.6 · §3.3 consumer |
| **U65** | zero-seed · **cấm code** until DATA + API CONFIRMED |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **DENY** CORE-01 public = C&B DONE |

---

## O1–O12 lock (summary)

| # | Topic | BA |
|---|-------|-----|
| O1 | Physical packages + employee-insurances; paper `/core/…/compensation` alias | **CONFIRMED** |
| O2 | C&B field matrix (salary/PC/bank/MST/SI) — not public | **CONFIRMED** |
| O3 | Public CB-403 RETAIN · AC-CORE-CB-01/02 F5 | **CONFIRMED** |
| O4 | AuthZ C&B + access audit | **CONFIRMED** |
| O5 | Version revise · no silent overwrite · 409 overlap | **CONFIRMED** |
| O6 | Bank/MST on C&B SoT — **ba-data REQUIRED** | **CONFIRMED** |
| O7 | GTCG consume ONE `employee_dependents` | **CONFIRMED** |
| O8 | CORE-02b / PAY / CORE-01a / CORE-09/10 OUT | **CONFIRMED** |
| O9 | must_keep CORE-01 · DENY claim = C&B DONE · DENY reopen J-CORE-01 | **CONFIRMED** |
| O10 | Honesty false · C-SLICE | **CONFIRMED** |
| O11 | Display-ready · no FE payslip SoT | **CONFIRMED** |
| O12 | J-HRM-CORE-02-01..04 DRAFT | **CONFIRMED** |

---

## AC / VAL inventory

| Class | IDs |
|-------|-----|
| Happy | AC-CORE-02-01..10 |
| Alternate | AC-CORE-02-ALT-01..05 |
| Exception | AC-CORE-02-EX-01..16 |
| Validation | VAL-CORE-CB-01..24 |
| Journeys | J-HRM-CORE-02-01..04 **DRAFT** |
| SRS AC | AC-CORE-CB-01 · AC-CORE-CB-02 **LOCKED** |

---

## Honesty locks (mandatory)

| Flag / claim | Value | BA |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module CORE / personnel UAT** | **DENIED** | Slice ≠ module |
| **Claim CORE-01 public = C&B DONE** | **DENIED** | Public ≠ mật |
| **Nest `/core` dual** | **DENIED** | RETAIN QC seal |
| **Second compensation / deps SoT** | **DENIED** | packages + `employee_dependents` ONE |
| **Reopen J-HRM-CORE-01-01..04** | **DENIED** | without regression |
| **Seed** | **DENIED** | U65 |
| **`apps/**` this seat** | **DENIED** | docs-only |
| **CORE-02b / PAY process invent** | **DENIED** | OUT O8 |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md · peer CORE-01 SEALED CORE01QC1-MSL6WMS7
spec_ref: DB §3.2 hrm_employee_compensation · §3.6 rate period · LIVE employee_compensation_packages · F-CORE-EMP-02 · BR-BP-SEC-02 · bank/MST · AC-CORE-CB-01/02

MISSION — Physical DATA lock (docs-only):
1) ADD bank_* / tax_id home on LIVE compensation package header OR ONE C&B extension bound to packages SoT — DENY public employees cols/CF as bank/MST SoT
2) SI rate timeline: ADD append-only period table IF overwrite gap on employee_insurances; else document RETAIN enrollment-only + residual
3) RETAIN packages|lines|history ONE SoT · employee_dependents ONE (GTCG consumer) · public strip map · HRM-CORE-CB-403
4) DENY Nest /core dual · second compensation/deps SoT · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip · apps/**
5) Unlock sa API-01 F-CORE-EMP-02 UPGRADE + SI residual — not Dev

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md · PASS_TO_PM · next sa API-01
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | O1–O12 **CONFIRMED** for UC-BP-CORE-02: C&B on LIVE packages + employee-insurances; paper `/core/…/compensation` alias; AuthZ+audit; bank/MST **ba-data REQUIRED**; AC-CORE-CB-01/02 + CB-403 RETAIN; GTCG ONE deps; J-02 DRAFT; DENY Nest dual · CORE-01=C&B DONE · reopen J-01 · honesty · seed · apps/** · CORE-02b/PAY. |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-ba-01.md` |
| **ba-data** | **REQUIRED** |
