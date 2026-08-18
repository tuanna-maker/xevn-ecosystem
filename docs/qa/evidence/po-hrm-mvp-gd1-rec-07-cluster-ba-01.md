# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01` |
| **lane** | governance · ba-process |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9) |
| **uc_ids** | `UC-BP-REC-07` |
| **depends_on** | SA-01 Option A **CONFIRMED** · Wave-8 REC-06 **SEALED** stamp **`REC06QC1-MSL4CU2G`** |
| **Date** | 2026-08-09 |
| **ack_status** | **PASS_TO_PM** · O1–O12 **CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · U65 zero-seed |
| **apps/**** | **NOT touched** |
| **ba-data** | **REQUIRED** (UV→EMP field map · soft stamp · optional accept-audit) |
| **SPEC_LEN** | **33485** NFD |
| **EVID_LEN** | **5650** NFD |

---

## 1. Mission closure

| Exit criteria | Result |
|---------------|--------|
| CONFIRM O1–O12 vs SA Option A | **PASS** — all CONFIRMED |
| AC pack FR-UC-BP-REC-07 accept-offer create+prefill | **PASS** — AC-REC-07-01..08 · ALT · EX · Diễn biến #1–#2 U65 |
| APP-02 hired-outcome only · HTP-05 · CORE handoff · mint HIRE-* | **PASS** — VAL-REC-HIRE-01..24 · O6/O8/O11 |
| J-* DRAFT | **PASS** — J-HRM-REC-07-01..04 DRAFT · BA_TRACE + journey map |
| ba-data REQUIRED field map | **PASS** — O4+O7 §1.1 |
| Unlock ba-data then sa API · cấm invent beyond SRS | **PASS** — no apps/** |
| DENY Nest `/rec` dual · second hire SoT · PAY · mail=hire · seed · honesty · reopen sealed J-06 | **PASS** |

---

## 2. Evidence basis (read, not invented)

| Artifact | Use |
|----------|-----|
| `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-07 · Diễn biến #1–#5 · AC-HTP-05 · special cancel/missing/no-contract | AC / Diễn biến FE |
| `UC_BR_MATRIX_DEPTH.md` UC-BP-REC-07 · BR-BP-LC-01 · no re-key | VAL · BR reconcile with SRS BR-BP-ONB-01 |
| `DB_DESIGN` §2.4 employee_id soft · §2.5 application · §2.4a is_hired_outcome | O4/O7 dictionary |
| `API_DESIGN` F-REC-HIRE-01 · F-REC-APP-02 · F-CORE-HTP-05 · F-REC-MAIL-01 ≠ hire | Path + alias |
| `PO-HRM-MVP-GD1-REC-07-CLUSTER-SA-01` Option A LOCKED | O1–O12 targets |
| Peer BA REC-06 · QC stamp `REC06QC1-MSL4CU2G` | Style + must_keep seals · mail≠hire |

---

## 3. O1–O12 CONFIRM summary

| # | BA verdict |
|---|------------|
| O1 | Physical `/recruitment/*` · primary `POST …/applications/:id/accept-offer` · paper `/rec` alias |
| O2 | Offer-ready gate · cancel → no new emp · mint OFFER-INVALID / CANCELLED |
| O3 | Prefer CREATE+prefill · LINK if reverse · DENY empty re-key primary |
| O4 | Prefill UV+YCTD map · **ba-data REQUIRED** · chờ hoàn thiện if missing CORE |
| O5 | Idempotent **2xx** same emp · 409 DUP only true conflict |
| O6 | Hired-outcome **only** via APP-02 + history |
| O7 | Soft stamp Lane A (+ mirror) · no hard FK · RETAIN HIRE-400/409 |
| O8 | CORE contract/SI/checklist handoff · HTP-05 RETAIN · DENY payroll claim |
| O9 | Peers RETAIN · mail≠hire · OUT REC-03/06b · DENY reopen J-06 |
| O10 | Honesty false · C-SLICE |
| O11 | Emit `offer.accepted` · PAY → 403 |
| O12 | Display-ready DTO · no FE invent / no mail-derived hire |

---

## 4. Cấm verified

| Cấm | Status |
|-----|--------|
| Nest `/rec` dual | **DENY** |
| Second hire SoT | **DENY** |
| PAY invent | **DENY** |
| REC-06 mail `offer` = hire | **DENY** |
| Pool/Kanban hired alone = FR-07 DONE | **DENY** |
| Campaign / REC-03 | **DENY** |
| Seed | **DENY** |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **HOLD false** |
| Module REC UAT | **DENY** |
| Reopen sealed J-HRM-REC-06-01..04 | **DENY** |
| `apps/**` this seat | **NONE** |

---

## 5. Journey DRAFT (U19)

| J-ID | Status |
|------|--------|
| J-HRM-REC-07-01 | ⬜ DRAFT — accept+create+prefill+APP-02 |
| J-HRM-REC-07-02 | ⬜ DRAFT — idempotent re-accept |
| J-HRM-REC-07-03 | ⬜ DRAFT — HTP no-contract blocker |
| J-HRM-REC-07-04 | ⬜ DRAFT — scope / PAY deny |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed BA AC O1–O12 for UC-BP-REC-07. Residual: ba-data field map → sa API F-REC-HIRE-01. Honesty false · C-SLICE · no apps/**. |
| **next_owner** | **ba-data** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01
lane: governance · ba-data
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: BA-01 O1–O12 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-BA-01.md · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-ba-01.md · SA-01 Option A LOCKED · peer REC06QC1-MSL4CU2G
spec_ref: BA §1.1 prefill map · O4/O7 · DB_DESIGN §2.4/2.5 · G-DB-01/02 · F-REC-HIRE-01
MISSION: Physical UV→EMP field map + soft employee_id stamp (Lane A + pool mirror) + optional accept-audit cols; ONE soft hire link; DENY hard FK · second hire SoT · PAY columns · Nest /rec dual; unlock sa API F.1 next — not Dev
cấm: Nest /rec dual · second hire SoT · PAY invent · seed · honesty flip · claim REC-06 mail=hire · reopen sealed J-06 · apps/**
exit: docs/program/specs/PO-HRM-MVP-GD1-REC-07-CLUSTER-DATA-01.md · docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-data-01.md · PASS_TO_PM · next sa API
```
