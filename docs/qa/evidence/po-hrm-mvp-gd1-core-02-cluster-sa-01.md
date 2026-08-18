# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01` |
| **from_role** | `sa` |
| **to_role** | `pm` |
| **date** | 2026-08-09 |
| **lane** | governance — **UC-BP-CORE-02 Option/F.1 only** · **no** `apps/**` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-11 · board #13) |
| **depends_on** | QC-01 GWC CORE-01 **SEALED** stamp **`CORE01QC1-MSL6WMS7`** · `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qc-01.md` |
| **uc_ids** | `UC-BP-CORE-02` |
| **Verdict** | **Option A CONFIRMED** |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | [`PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md`](../../program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md) |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-CORE-02 · AC-CORE-CB-01/02 · BR-BP-SEC-02 |
| **ref_paper_api** | `API_DESIGN_HRM_ENTERPRISE.md` F-CORE-EMP-02 |
| **ref_paper_db** | `DB_DESIGN_HRM_ENTERPRISE.md` §3.2 · §3.6 · §3.3 consumer |
| **U65** | zero-seed · **cấm code** until BA (+ DATA) + API CONFIRMED |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` |

---

## Decision (locked)

| Item | Value |
|------|-------|
| **Selected** | **Option A** — ACCEPT_AS_IS_UPGRADE |
| **Physical SoT (salary/PC)** | `/api/hrm/contracts-insurance/compensation-packages*` (+ revise/history/active) on `employee_compensation_packages\|lines\|history` |
| **Physical SoT (SI)** | `/api/hrm/employee-insurances*` on `employee_insurances` |
| **Paper alias** | `/api/hrm/core/employees/{id}/compensation` — **DENY** Nest dual SoT |
| **UPGRADE** | F-CORE-EMP-02 AuthZ/audit + bank/MST residual on C&B SoT |
| **RETAIN must_keep** | CORE-01 public strip · **`HRM-CORE-CB-403`** · dependents ONE SoT · Nest `/core` DENY · U19 |
| **REJECT** | **B** Nest `/core` dual / second compensation table · **C** HOLD / CORE-01=C&B DONE / honesty flip |
| **OUT** | CORE-02b · CORE-01a · CORE-09/10 invent deep · PAY process |

---

## Honesty locks (mandatory)

| Flag / claim | Value | SA |
|--------------|-------|-----|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** flip |
| **`jd_dynamic_done`** | **`false`** | **DENIED** flip |
| **Module CORE / personnel UAT** | **DENIED** | Slice ≠ module |
| **Claim CORE-01 public ring = C&B DONE** | **DENIED** | Public ≠ mật |
| **Nest `/core` dual** | **DENIED** | RETAIN QC seal |
| **Second compensation / deps SoT** | **DENIED** | packages + `employee_dependents` ONE |
| **Reopen J-HRM-CORE-01-01..04** | **DENIED** | without regression |
| **Seed** | **DENIED** | U65 |
| **`apps/**` this seat** | **DENIED** | docs-only |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md · peer CORE-01 SEALED CORE01QC1-MSL6WMS7
spec_ref: SRS FR-UC-BP-CORE-02 · AC-CORE-CB-01/02 · BR-BP-SEC-02 · F-CORE-EMP-02 · F-CORE-EMP-01 must_keep · HRM-CORE-CB-403 · dependents ONE SoT

MISSION — BA AC pack (O1–O12):
1) Lock AC for C&B mutate on physical /contracts-insurance/compensation-packages* (+ employee-insurances*); paper /core/…/compensation = alias only
2) AuthZ C&B + access audit · versioned salary/PC · bank/MST home (ba-data REQUIRED flag) · SI timeline boundary
3) After C&B save: public CORE-01 F5 still no leak (AC-CORE-CB-02) · public PATCH C&B → HRM-CORE-CB-403 RETAIN
4) Dependents GTCG = consumer of ONE employee_dependents — DENY second deps
5) DRAFT J-HRM-CORE-02-01..04 · DENY Nest /core dual · claim CORE-01=C&B DONE · reopen sealed J-CORE-01 · honesty flip · seed · apps/** · CORE-02b/PAY process invent

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md · PASS_TO_PM · next ba-data or sa API-01
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Option A LOCKED — C&B on LIVE packages + insurances; CORE-01 boundary must_keep; unlock ba-process BA-01; no apps/** |
| **next_owner** | **ba-process** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-SA-01.md` |
| **qa_evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-sa-01.md` |
