# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` |
| **role** | ba-data · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs + client DOC-DELTA pointer · **NO** `apps/**` · **no seed** · **no migrate run** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | SA-01 §2 §6 §8 §9 | Option **A LOCKED** · HC-S1..S7 · D1–D4 sealed |
| 2 | BA-01 O1–O5 · VAL | **CONFIRMED** · dx→need_hire · ns→current · CFG/drift/vượt/rollup |
| 3 | Evidence sa-01 + ba-01 | Align Option A · Dev HOLD until physical |
| 4 | DB_DESIGN §2.2–2.3 | Paper logical — stamped **alias** → AS-IS upgrade |
| 5 | Nest AS-IS | `recruitment-catalog.service.ts` plans/dept/pos · `recruitment.service.ts` YCTD · WF bridge |

---

## 2. AS-IS → TO-BE physical map

| Capability | AS-IS | DATA-01 stamp |
|------------|-------|---------------|
| Plan header | `recruitment_plans` + WF cols | **UPGRADE** + optional `submitted_by_dept_key` / approve stamps |
| Dept / pos | free-text `name` | **ADD** `department_key` / `position_key` |
| Month cells | `months_data[{ns,dx}]` | **NORMALIZE** → `cell_id` · `headcount_need_hire` · `headcount_current` · `cell_status` · `lifecycle_status` |
| YCTD | `job_requisitions` no cell link | **ADD** `headcount_cell_id` · `headcount_mode` · `target_month` (+ optional plan_id/keys) |
| Spawn UQ | ABSENT | **Partial UQ** `(company_id, headcount_cell_id)` WHERE `in_plan` |
| Dual `rec_headcount_*` table | Paper only | **DENY** physical CREATE |
| proposals / REC-03 | LIVE tab / OUT | **HOLD** / **DENY** |

---

## 3. O1 migrate seal

| Legacy | Target | Normative |
|--------|--------|-----------|
| `dx` | `headcount_need_hire` | `COALESCE(dx,0)` — **dx prefer** |
| `ns` | `headcount_current` | `COALESCE(ns,0)` |
| Dual FE columns post-wave | — | **FORBIDDEN** |
| SA D1 «dx if dx>0 else ns» | — | **Superseded** by BA O1 for migrate (documented in DATA-01 §6.3) |

---

## 4. DENY / must_keep audit

| Lock | Stamp |
|------|-------|
| Option A | **CONFIRMED** |
| XBOS WF bridges | **RETAIN** |
| YCTD / JD soft FK / UF-HRM-12🟢 / J-HRM-05 | **must_keep** |
| REC-03 | **OUT** |
| Second `rec_headcount_*` SoT | **DENY** |
| Seed | **DENY** |
| `recruitment_uat_ready` | **false** |
| preserve_default | **true** |

---

## 5. Client DB_DESIGN pointer

| Action | Path |
|--------|------|
| EXPAND §2.2–§2.3 alias note | `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` |
| Registry DOC-DELTA | same file · `PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01` |
| Team SoT primary | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md` |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
no apps/** this seat
```

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **unlocks** | API F.1 physical DOC-DELTA → then Dev-BE/FE |
| **does_not_unlock** | Dev without API-01 · honesty flip · seed |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-01 · UC-BP-REC-01b

MISSION: TechSpec/API F.1 DOC-DELTA on PHYSICAL Option A paths (not paper-only).
Lock DTO↔column for recruitment-plans* + ADD POST …/recruitment-plans/:id/spawn-requests
(F-REC-HC-01..03/05); map need_hire ↔ headcount_need_hire; HC-S1..S7; error codes HRM-HC-*;
scope_parity U19; cite DATA-01 physical SoT.

READ FIRST:
1. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md (CONFIRMED)
2. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md §8–§9
3. docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md AC/VAL
4. docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-data-01.md
5. API_DESIGN_HRM_ENTERPRISE.md F-REC-HC-* (logical alias only)

DELIVER:
- docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md
- docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-api-01.md
must_keep: Option A · XBOS WF · YCTD spine · REC-03 OUT · honesty false · U65 · DENY dual rec_headcount_*
EXIT: PASS_TO_PM CONFIRMED · next_owner pm → unlock dev-be/fe after API CONFIRMED
```

---

## completion_report

- **Closed:** Physical DOC-DELTA Option A CONFIRMED — cell projection + YCTD headcount columns + spawn UQ + O1 migrate + DENY dual `rec_headcount_*`; client pointer; bus handoff.
- **Residual:** API-01 F.1 (sa) → Dev → QA U65.
