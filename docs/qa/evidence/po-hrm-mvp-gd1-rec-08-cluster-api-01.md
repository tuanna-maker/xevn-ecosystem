# Evidence — PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md` |
| **depends_on** | BA-01 CONFIRMED · SA-01 Option A LOCKED |
| **ref_ba_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-08-cluster-ba-01.md` |
| **uc_ids** | `UC-BP-REC-08` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs + client DOC-DELTA pointer · **NO** `apps/**` · **no seed** |
| **SPEC_LEN** | 28646 NFD |
| **EVID_LEN** | 4397 NFD (this file before length stamp ≈) |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | BA-01 O1–O10 · AC · VAL-01..19 | **CONFIRMED** — formulas BE · physical prefer · empty_guide · C&B OUT |
| 2 | SA-01 Option A · D-S1..D-S10 | **LOCKED** — on-the-fly Nest · DENY FE aggregate · DENY Option B MVP |
| 3 | REC-02 API-01 token family | Pattern mirrored — dashboard mints **`HRM-REC-DASH-*`** · peer `HRM-YCTD-*` RETAIN |
| 4 | Nest AS-IS recruitment | `@Controller('recruitment')` — plans/YCTD/candidates LIVE · **dashboard ABSENT** |
| 5 | Spine columns | plans `months_data` cells · YCTD Wave-2 · `recruitment_candidates.requisition_id` · pipeline catalog flags — **sufficient** |
| 6 | Paper F-REC-DASH-01 | `/rec/dashboard` stub — stamped **physical prefer** + F-REC-DASH-02 |

---

## 2. F.1 physical lock summary

| F-id | Physical METHOD/path | Status |
|------|----------------------|--------|
| **F-REC-DASH-01** | `GET /api/hrm/recruitment/dashboard` | **ADD** |
| **F-REC-DASH-02** | `GET /api/hrm/recruitment/dashboard/yctd` **or** `?include=yctd` | **ADD** |
| Paper `/api/hrm/rec/dashboard` | — | **alias only** · DENY Nest invent dual |

---

## 3. Seals stamped this seat

| Seal | Stamp |
|------|-------|
| Funnel catalog→bucket | §4.1 — hired/`is_hired_outcome`→**onboard** · 5 keys always · terminal exclude |
| `OPEN_YCTD_STATUS_SET` | `open_for_hire` · `open` · `approved` · EXCLUDE draft/pending_approval/rejected/cancelled/closed/on_hold |
| Error tokens | `HRM-REC-DASH-PERIOD-400` · `HRM-SCOPE-409` · `HRM-REC-DASH-METHOD-405` · `HRM-REC-DASH-200` · map VAL-REC-DASH-* |
| `empty_guide` | `NO_APPROVED_HEADCOUNT` when `no_plan` · null % |
| C&B omit | FORBIDDEN salary/cost/MST/bank on DTO |
| BA O1–O10 | Cited in §4.4 / function branches |
| U19 | summary = drill = list plans/YCTD |

---

## 4. DTO ↔ source (no new table)

| Domain | Physical |
|--------|----------|
| KH | `recruitment_plan_positions.months_data[]` O2 cells |
| YCTD | `job_requisitions.*` Wave-2 |
| TT/funnel | `recruitment_candidates` + `requisition_id` + stage catalog |
| **NOT SoT** | `job_postings` · `candidate_applications` (posting Lane B) |

---

## 5. ba-data

| Question | Answer |
|----------|--------|
| Missing sealed-spine column? | **No** |
| ba-data required? | **NOT REQUIRED** |

---

## 6. DENY / must_keep audit

| Lock | Stamp |
|------|-------|
| Option A | **CONFIRMED** |
| REC-01/02 seals · TARGET-MONTH CLOSED · spawn/cell/YCTD tokens | **must_keep** |
| Dual Nest `/rec` · FE aggregate · Option B · REC-03 · seed · honesty flip | **DENY** |
| `recruitment_uat_ready` | **false** |
| C-SLICE | **true** |

---

## 7. Client API_DESIGN pointer

| Action | Path |
|--------|------|
| EXPAND F-REC-DASH-01/02 physical stamp | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` |
| Registry DOC-DELTA | `PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01` |
| Team SoT | `docs/program/specs/PO-HRM-MVP-GD1-REC-08-CLUSTER-API-01.md` |

---

## 8. Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
U65 zero-seed
no apps/** this seat
```

---

## 9. Completion

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **dev-be** (+ **dev-fe** same session unlock · rule 26) |
| **completion_report** | F.1 PHYSICAL Option A locked: dashboard* + yctd drill; DTO↔sealed spine; funnel map; OPEN_YCTD set; HRM-REC-DASH-*; empty_guide; C&B omit; U19; ba-data NOT REQUIRED; DENY dual/FE aggregate/Option B/REC-03/seed/honesty. |

### next_dispatch_prompt

See spec § **next_dispatch_prompt** — both **BE-01** and **FE-01** copy-ready blocks.
