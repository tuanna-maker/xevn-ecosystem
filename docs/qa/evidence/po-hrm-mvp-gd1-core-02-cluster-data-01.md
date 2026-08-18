# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-11) |
| **uc_ids** | `UC-BP-CORE-02` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A LOCKED · peer `CORE01QC1-MSL6WMS7` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | DOC-DELTA physical · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD bank_* / tax_id on LIVE package header (or ONE extension) · DENY public CF SoT | **PASS** — §4 header ADD preferred · DENY employees/CF SoT · DENY extension dual by default |
| SI rate timeline: ADD period IF overwrite gap; else RETAIN + residual | **PASS** — period **LIVE** (`hrm_insurance_rate_period` EMP-DB-01) → **RETAIN** · residual PATCH denorm vs action-append for API |
| RETAIN packages\|lines\|history ONE · deps ONE · public strip · HRM-CORE-CB-403 | **PASS** §1/§6/§7/§13 |
| DENY Nest `/core` dual · second compensation/deps · CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty · apps/** | **PASS** §1/§13 |
| Unlock sa API-01 F-CORE-EMP-02 UPGRADE + SI residual — not Dev | **PASS** §14 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1 path · O3 CB-403/F5 · O5 version · O6 bank/MST · O7 GTCG · O9 ≠ DONE · AC-CORE-02-* · VAL-CORE-CB-* |
| SA-01 | Option A LOCKED · packages + employee-insurances · paper `/core` alias · REJECT B/C |
| AS-IS Nest (read-only) | `employee-compensation.service.ts` ensureSchema packages **no** bank/tax · `employee-insurances` + `hrm_insurance_rate_period` LIVE · create DTO no bank fields |
| Paper DB | §3.2 compensation · §3.6 enrollment/period · §3.3 deps consumer · §3.1 public no C&B |
| CORE-01 DATA | Public strip + deps ONE RETAIN · ≠ C&B DONE |
| EMP-DB-01 | Rate period ADD already CONFIRMED peer |

---

## 3. Physical decisions (summary)

1. **Bank/MST:** ADD `bank_account` · `bank_name` · `tax_id` (+ optional `bank_branch`) on **`employee_compensation_packages` header** — DENY public employees/CF SoT.
2. **SI:** RETAIN enrollment + LIVE period append — **no** second period table; API residual harden PATCH vs `…/actions`.
3. **SoT:** packages\|lines\|history ONE · deps ONE GTCG · public strip + CB-403 RETAIN.
4. **Path:** physical packages* + employee-insurances* · `/core/…/compensation` alias only.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| CORE / personnel UAT | **false** |
| Claim CORE-01 = C&B DONE | **DENIED** |
| C-SLICE | GWC later ≠ module UAT |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01.md · BA O1–O12 · peer CORE01QC1-MSL6WMS7
spec_ref: F-CORE-EMP-02 UPGRADE · F-CORE-SI-* RETAIN · SI-RATE residual · BR-BP-SEC-02 · AC-CORE-CB-01/02 · DATA §4–§5

MISSION — API F.1 lock (docs-only):
1) UPGRADE F-CORE-EMP-02 physical on /api/hrm/contracts-insurance/compensation-packages* (+ revise/history/active): AuthZ+audit; ADD bank_account/bank_name/tax_id (+bank_branch?) on DTO create/revise; history snapshot MUST include bank/MST; paper /core/…/compensation = alias only; thin /employees/:id/compensation* MUST same packages SoT
2) RETAIN F-CORE-SI enrollment + hrm_insurance_rate_period append; residual harden PATCH contribution vs …/actions change_rate (fail-closed prefer); mint HRM-CORE-CB-AUTHZ-*/OVERLAP-409/VAL-400 as needed; RETAIN HRM-CORE-CB-403
3) RETAIN F-CORE-EMP-01 / F-CORE-DEP-01 · U19 list=get=revise=SI · display-ready amounts/dates
4) DENY Nest /core dual · second compensation/deps SoT · claim CORE-01=C&B DONE · reopen J-CORE-01 · seed · honesty flip · apps/** · Dev until API CONFIRMED
5) Unlock Dev-BE+FE after API CONFIRMED — not this seat

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD until CONFIRMED
```

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 **CONFIRMED**: bank/MST ADD on packages header · SI period RETAIN (no second ADD) · ONE packages+deps SoT · public strip+CB-403 · DENY Nest `/core` dual · CORE-01≠C&B DONE · unlock sa API-01 — not Dev · no apps/** · no seed. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
| **residual** | API F.1 F-CORE-EMP-02 + SI PATCH/action harden · history snapshot bank/MST · Dev HOLD · J-HRM-CORE-02-* DRAFT until QA |
