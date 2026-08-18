# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01` |
| **role** | ba-process · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` |
| **depends_on** | SA-01 Option A CONFIRMED — `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md` |
| **ref_sa_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-sa-01.md` |
| **uc_ids** | `UC-BP-REC-08` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs-only · **NO** `apps/**` · **no seed** |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | SA-01 Option A | LOCKED — Nest on-the-fly · physical `/recruitment/dashboard*` · D-S1..D-S10 |
| 2 | REC-02 BA-01 style | AC/VAL/Diễn biến/O-numbering mirrored |
| 3 | SRS FR-UC-BP-REC-08 | 7-mục · KH vs TT · funnel · drill YCTD · empty guide · no C&B · stop at onboard |
| 4 | REQ_REC_005 / WBS-REC-06 | «Khi nào đủ người» |
| 5 | Honesty / must_keep | REC-01/02 seals · C-SLICE · REC-03 OUT · no FE aggregate |

---

## 2. O1–O10 CONFIRM stamp

| ID | Verdict | Normative one-liner |
|----|---------|---------------------|
| **O1** | **CONFIRMED** | Physical `/api/hrm/recruitment/dashboard*` · paper `/rec/dashboard` alias only · DENY dual Nest `/rec` SoT · DENY Option B MVP |
| **O2** | **CONFIRMED** | KH = plan approved ∧ cell `need_hire_approved` ∧ `need_hire≥1` ∧ period · EXCLUDE unlock-not-approved cells · ≠ job_postings |
| **O3** | **CONFIRMED** | filled = onboard(+hired map) on YCTD · pipeline = non-reject non-onboard · stop KPI at onboard · probation exit default no auto-decrement |
| **O4** | **CONFIRMED** | Funnel keys always: cv, screening, interview, offer, onboard · catalog map · missing=0 · VI labels |
| **O5** | **CONFIRMED** | ETA = earliest open YCTD `target_month` with remaining>0 · BE only + VI label |
| **O6** | **CONFIRMED** | out_of_plan in TT/funnel/drill · does **not** inflate KH |
| **O7** | **CONFIRMED** | Legacy mode NULL: read+warn · no silent in_plan cell credit · cite REC-02 O4 |
| **O8** | **CONFIRMED** | Reports align same Nest contract/subset · no second formula |
| **O9** | **CONFIRMED** | planned_need=0 → completion_pct null + no_plan/empty_guide · ETA null semantics sealed |
| **O10** | **CONFIRMED** | Cost charts **OUT** · omit invent VND / C&B |

---

## 3. Deliverables inventory

| Artifact | Status |
|----------|--------|
| AC-REC-08-01..10 | **CONFIRMED** (+ ALT/EX) |
| VAL-REC-DASH-01..19 | **CONFIRMED** |
| Metric formulas §2.1 | BE ownership locked |
| Diễn biến FE load/filter/drill | §3.4 |
| J-HRM-REC-DASH-01 / 02 | **DRAFT** |
| UF-HRM-REC-DASH-08 | **DRAFT** |
| BA TRACE §28 | Updated |
| PROGRAM_JOURNEY_MAP rows | Updated |

---

## 4. ba-data necessity

| Question | Answer |
|----------|--------|
| New physical SoT / migration required? | **No** — Option A read-only on-the-fly aggregate |
| ba-data unlock this wave? | **NOT REQUIRED** (HOLD/skip) |
| When ba-data needed? | Only if API F.1 finds **missing column** on sealed REC-01/02 spine (unexpected) — not assumed |

---

## 5. Honesty / C-SLICE footer

```text
recruitment_uat_ready=false
C-SLICE ≠ module REC UAT
U65 zero-seed
product_go=false (program)
UC-BP-REC-03 OUT
no dual Nest /rec dashboard SoT
no FE domain aggregation for KH/TT/%
no Option B materialize
REC-01/02 seals RETAIN
cost charts OUT
```

---

## 6. Spec size

| Artifact | Path |
|----------|------|
| Spec | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md` |
| Evidence | this file |

---

## completion_report

- **Closed:** O1–O10 CONFIRMED; AC-REC-08-01..10 + ALT/EX; VAL-REC-DASH-01..19; deterministic BE formulas (planned_need/filled/gap/completion_pct/ETA/status/funnel); Diễn biến FE U65; J-HRM-REC-DASH-01/02 DRAFT; Reports align; cost OUT; scope ladder U19; ba-data **not required**; DENY REC-03 / FE aggregate / Nest dual / seed / honesty flip / Option B.
- **Residual:** SA API F.1 DOC-DELTA (funnel catalog map + open_yctd status set); Dev after API; QA browser after wire.

## next_owner

**sa** (API F.1 DOC-DELTA) — **ba-data skip** (Option A read-only)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-08
depends_on: BA-01 CONFIRMED — docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-BA-01.md
ref_evidence: docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-ba-01.md
ref_sa_option: docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-SA-01.md

MISSION: API F.1 DOC-DELTA for F-REC-DASH-01 + F-REC-DASH-02 against Option A.
- Physical paths: GET /api/hrm/recruitment/dashboard · GET …/dashboard/yctd (or ?include=yctd)
- Paper alias ONLY: GET /api/hrm/rec/dashboard — DENY Nest /rec dual SoT
- Each function: Mục đích · Nghiệp vụ xử lý · Tham chiếu bước SRS FR-08 #1–#3
- DTO↔source columns from sealed recruitment_plans.months_data + job_requisitions + applications (NO new SoT table)
- Seal: funnel catalog→bucket map; open_yctd status set; error tokens VAL-REC-DASH-*; empty_guide; C&B omit
- Cite BA O1–O10 formulas; display-ready fields; U19 resolveHrmListScope parity summary=drill
- ba-data: NOT REQUIRED unless you discover missing sealed-spine columns (document if none)

must_keep: REC-01/02 seals · honesty false · C-SLICE · REC-03 OUT · no seed · no FE aggregate · no Option B
DENY: invent Campaign drill · reopen REC-02 · module REC UAT · unlock materialize rollup

EXIT: ack_status PASS_TO_PM CONFIRMED · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-api-01.md · next_owner dev-be (after API) · next_dispatch_prompt copy-ready · Append bus
```

## ack_status

**PASS_TO_PM CONFIRMED**
