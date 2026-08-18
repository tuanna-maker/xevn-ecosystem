# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01` |
| **lane** | governance · sa |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9 seat #11) |
| **uc_ids** | `UC-BP-REC-07` |
| **depends_on** | QC-01 GWC Wave-8 REC-06 **SEALED** · stamp **`REC06QC1-MSL4CU2G`** |
| **Date** | 2026-08-09 |
| **ack_status** | **PASS_TO_PM** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **apps/**** | **NOT touched** |
| **SPEC_LEN** | **23804** NFD |
| **EVID_LEN** | **4723** NFD |

---

## 1. Mission closure

| Exit criteria | Result |
|---------------|--------|
| Option A/B/C + trade-off | **PASS** — A LOCKED · B/C REJECT |
| F.1 map physical prefer | **PASS** — F-REC-HIRE-01 ADD residual · APP-02/EFF/HTP-05/MAIL RETAIN · paper `/rec` alias |
| must_keep REC-06 / 05 / 06a / 04 | **PASS** — §6.2–6.3 · mail≠hire · DENY reopen J-06 |
| DENY Nest `/rec` dual · second hire SoT · REC-03 · PAY invent | **PASS** |
| Unlock BA AC · cấm code until CONFIRMED | **PASS** — next `ba-process` |
| No honesty flip · no seed · claim REC-06 ≠ hire DONE | **PASS** |

---

## 2. Evidence basis (read, not invented)

| Artifact | Use |
|----------|-----|
| `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-07 · Diễn biến #1–#5 · AC-HTP-05 | Purpose / no re-key / contract gate |
| `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-07 · BR-BP-LC-01 · PARTIAL | Unlock BA — not DONE |
| `API_DESIGN` F-REC-HIRE-01 · F-REC-APP-02 · F-CORE-HTP-05 cite | Paper accept-offer + peers |
| `DB_DESIGN` §2.4 `employee_id` · §2.4a `is_hired_outcome` | Soft hire + catalog target |
| `PO-HRM-MVP-GD1-REC-06-CLUSTER-QC-01` stamp `REC06QC1-MSL4CU2G` | depends_on Wave-8 SEALED |
| Nest `hire-employee-link.ts` | LIVE link-only assert HIRE-400/409 — gap = create+prefill |
| Nest `employees.service.ts` `getHireReadiness` | LIVE HTP-05 RETAIN |
| Nest recruitment soft `employee_id` on candidates + recruitment_candidates | Soft stamp RETAIN |
| Peer SA REC-06 / 05 / 06a / 04 · EMP HTP | must_keep |

---

## 3. Decision summary

| Option | Verdict |
|--------|---------|
| **A — ACCEPT_AS_IS_UPGRADE** ADD accept-offer create+prefill+soft-link+APP-02 on `/recruitment/*` | **LOCKED / RECOMMENDED** |
| **B — Nest `/rec` dual + second hire SoT** | **REJECT** |
| **C — HOLD / picker-only / mail offer = hire / honesty flip** | **REJECT** |

**Weighted ≈ A 8.85 · B 3.55 · C 3.15**

---

## 4. Scope locks (copy for BA)

- **IN:** F-REC-HIRE-01 residual — accept → create/link emp from UV+YCTD without re-key · soft stamp · APP-02 hired-outcome · emit offer.accepted · HTP-05 consume
- **RETAIN:** REC-06 mail/eval · REC-05 transitions/history · REC-06a IV · REC-04 scan · hire-employee-link · EFF hired-outcome · HTP-05
- **OUT / DENY:** Nest `/rec` dual · second hire SoT · REC-03 · PAY/payslip · seed · honesty flip · reopen J-HRM-REC-06-01..04 · claim REC-06 mail `offer` = hire DONE · module REC UAT
- **ba-data:** **REQUIRED** after BA (UV→EMP field map)
- **next:** `ba-process` BA-01 O1–O12

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed SA Option A for UC-BP-REC-07. Residual: BA AC → DATA → API → Dev. Honesty false · C-SLICE · no apps/**. |
| **next_owner** | **ba-process** |
| **next_dispatch_prompt** | see §6 |
| **ack_status** | **PASS_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01
lane: governance · ba-process
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: SA-01 Option A CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-sa-01.md · REC-06 QC stamp REC06QC1-MSL4CU2G SEALED
spec_ref: SRS FR-UC-BP-REC-07 · BR-BP-LC-01 · F-REC-HIRE-01 · SA O1–O12
MISSION: BA AC pack O1–O12 — accept-offer physical /recruitment path; create+prefill no re-key; soft employee_id; APP-02 hired-outcome only; HTP-05; CORE handoff contract/SI/checklist; mint HIRE-*; J-HRM-REC-07-01..04 DRAFT; ba-data REQUIRED field map
cấm: Nest /rec dual · second hire SoT · PAY invent · seed · honesty flip · claim REC-06 mail offer = hire · reopen sealed J-06 · apps/**
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-ba-01.md · PASS_TO_PM · next ba-data
```
