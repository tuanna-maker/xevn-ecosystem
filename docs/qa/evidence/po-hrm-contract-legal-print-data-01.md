# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-06 |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** migrate · **no** seed |
| **honesty (team only)** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` — **không** claim printable UAT |

---

## 1. spec_read_ack

| Artifact | Đọc / dùng |
|----------|------------|
| TechSpec | `PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` §2–§10 |
| TECH evidence | `po-hrm-contract-legal-print-tech-01.md` |
| Program | `PO_HRM_CONTRACT_LEGAL_PRINT_PROGRAM.md` |
| DB AS-IS / logical | `DB_DESIGN_HRM_ENTERPRISE.md` §3.4 (pre-delta stub) |
| Nest AS-IS (read-only) | `contracts-insurance.service.ts` `ensureSchema` → `employee_contracts` (registry cols; **no** pack/template/print) |
| API stub | `API_DESIGN` **F-CORE-CTR-01** + TECH DOC-DELTA pointer |
| SRS | v0.18 FR-UC-BP-CORE-09 · 09a · 09b · 09c |

---

## 2. Paths touched (list)

| Path | Change |
|------|--------|
| [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md) | **ADD** SoT CONFIRMED — alias · tables · VAL · F.1 |
| [`docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md) | DOC-DELTA §3.4 EXPAND + §3.4a–d · footer CONFIRMED · trace row |
| [`docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md`](../../client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md) | DOC-DELTA F.1 TPL/CL/PACK/PREV/VER/PDF + CTR-01 overlay · §7.3 · footer |
| [`docs/program/PO_HRM_CONTRACT_LEGAL_PRINT_PROGRAM.md`](../../program/PO_HRM_CONTRACT_LEGAL_PRINT_PROGRAM.md) | Wave status DATA-01 CLOSED |
| [`docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md`](../../program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md) | Status pointer cascade DATA CONFIRMED |

**Không đụng:** `apps/**` · `packages/**` · wipe F-CORE-CTR-01 stub body · wipe CORE-09 FR · seed.

---

## 3. Verdict — **CONFIRMED**

| Topic | Stamp |
|-------|--------|
| Registry SoT | **`public.employee_contracts`** ↔ `hrm_contract` |
| ADD tables | `hrm_contract_templates` · `hrm_contract_clauses` · `hrm_contract_print_versions` · `hrm_contract_pack_rules` |
| EXPAND contract | pack_code · template_id soft FK · term_type · work_location* · probation* · DRIVER fields · archived_at |
| C&B | F5 `compensation_package_id` must_keep; print snapshot **only** on print_version; salary off body |
| Pack rules | Separate table; pattern reuse JD; **≠** dual-write `rec_jd_pack_rule` |
| UQ/IX/soft-delete | Partial UQ templates/clauses; print UQ `(contract_id, version_no)`; `archived_at` |
| API F.1 | All TPL/CL/PACK/PREV/VER/PDF + CTR-01 overlay; paths `/contracts-insurance`; `HRM-CTR-*`; scope_parity |
| Dev | **HOLD** — sponsor CONFIRM docs pack first |
| Honesty | **false** |

---

## 4. completion_report

**Closed:** DB physical Option A + alias map + VAL-CTR-01..14; API F.1 physicalized for F-CORE-CTR family with Mục đích · Nghiệp vụ · bước SRS 09a/09b/09c; client DB/API DOC-DELTA CONFIRMED; honesty false; no apps/**.

**Residual:** Sponsor CONFIRM → PM unlock BE/FE; Q-CTR-01/02/03 open; Nest soft-delete switch for registry DELETE; company-master employer legal columns if missing (Q-CTR-04b).

---

## 5. next_owner / next_dispatch_prompt

**next_owner:** **pm** (sponsor CONFIRM before Dev)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-SPONSOR-CONFIRM-01
from_role: pm
to_role: pm (sponsor gate)
lane: governance
read_first:
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09 · 09a · 09b · 09c (v0.18)
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md
  - docs/qa/evidence/po-hrm-contract-legal-print-data-01.md
task: |
  Present docs pack to sponsor for CONFIRM (SPEC + SRS v0.18 + TechSpec + DB_DESIGN §3.4/3.4a–d + API F-CORE-CTR-* F.1).
  On CONFIRM: unlock Dev wave BE then FE (print spine); honesty remains contracts_printable_ready=false until QA U65.
  Do NOT dispatch BE/FE before sponsor CONFIRM.
forbidden: apps/** before CONFIRM · seed · claim printable UAT
exit: sponsor CONFIRM recorded on bus · then DISPATCHED PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
```

---

## 6. ack_status

**PASS_TO_PM**
