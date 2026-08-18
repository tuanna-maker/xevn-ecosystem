# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01` |
| **role** | sa · governance |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-4 |
| **date** | 2026-08-09 |
| **spec** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` |
| **depends_on** | BA-01 O1–O10 **CONFIRMED** · SA-01 Option **A LOCKED** |
| **ref_ba_evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-ba-01.md` |
| **uc_ids** | `UC-BP-REC-06a` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **change_mode** | Docs + client DOC-DELTA pointer · **NO** `apps/**` · **no seed** |
| **ba-data** | **NOT REQUIRED** |
| **SPEC_LEN** | 24355 NFD |
| **EVID_LEN** | 4924 NFD |

---

## 1. Read-first checklist

| # | Artifact | Result |
|---|----------|--------|
| 1 | BA-01 O1–O10 · AC-REC-IV-* · VAL · Diễn biến FE | **CONFIRMED** — residual cancel/complete/reschedule/no_show |
| 2 | SA-01 Option A · OPEN-Q1..Q4 CLOSED · F.1 disposition | **LOCKED** — ACCEPT_AS_IS_UPGRADE spine |
| 3 | Nest LIVE | `POST …/interviews` + `PATCH …/status` · **no** PATCH `:id` datetime · DTO **no** `no_show` |
| 4 | Spine columns | `scheduled_at`/`status`/`interviewer` **present** · CHECK lacks `no_show` · `cancel_reason` **absent** → ensureSchema ADD (not greenfield) |
| 5 | Soft-gate / 409 / badge | **RETAIN** LIVE · ≠ merge codes |
| 6 | Paper `/rec/interviews*` | **alias only** |

---

## 2. F.1 physical lock summary

| F-id | Physical METHOD/path | Status |
|------|----------------------|--------|
| **F-REC-IV-01** | `POST /api/hrm/recruitment/interviews` | **RETAIN** (+ PAST VAL) |
| **F-REC-IV-02** | `PATCH …/interviews/:id/status` | **UPGRADE** — `no_show` · cancel CFG · INVALID-TRANSITION |
| **F-REC-IV-03** | `PATCH …/interviews/:id` | **UNLOCK ADD** R-A `scheduled_at` |
| **F-REC-IV-04** | `GET …/candidates*` `active_interview` | **RETAIN** |
| **F-REC-IV-SCHED-SOFT** | overlay on POST | **RETAIN** |
| **F-REC-IV-05** | GET list interviews | **P2 HOLD** |
| Paper `/api/hrm/rec/interviews*` | — | **alias only** · DENY Nest invent dual |

---

## 3. Error tokens minted / stabilized

| Token | HTTP | Source |
|-------|------|--------|
| `HRM-REC-IV-409-ACTIVE` | 409 | RETAIN |
| `HRM-REC-IV-400-STAGE-DISALLOW` | 400 | RETAIN |
| `HRM-REC-IV-400-INVALID-TRANSITION` | 400 | STABILIZE (status + R-A) |
| **`HRM-REC-IV-400-PAST-DATETIME`** | 400 | **MINT** O7 |
| **`HRM-REC-IV-400-CANCEL-REASON`** | 400 | **MINT** O6 |

---

## 4. DTO ↔ spine

| Domain | Physical |
|--------|----------|
| Create / R-A | `recruitment_interviews.scheduled_at` · `interviewer` |
| Status | `status` CHECK + **`no_show`** |
| Cancel audit | **`cancel_reason` TEXT NULL** (ensureSchema ADD) |
| Badge | ACTIVE projection on candidates list |
| **NOT SoT** | `public.interviews` (Lane B) · Nest `/rec` dual |

---

## 5. ba-data

| Question | Answer |
|----------|--------|
| Missing sealed-spine **table**? | **No** |
| Column gap blocking unlock? | **No** — R-A uses existing `scheduled_at`; `no_show` = CHECK UPGRADE; `cancel_reason` = ensureSchema ADD COLUMN (prior IV pattern) |
| ba-data required? | **NOT REQUIRED** |
| Optional P2 | Sync `DB_DESIGN_HRM_RECRUITMENT.md` §3 CHECK + cancel_reason — non-blocking |

---

## 6. DENY / must_keep audit

| Lock | Stamp |
|------|-------|
| Option A | **CONFIRMED** |
| Lane A SoT · 409 ACTIVE · badge · soft-gate ≠ 409 · W1–W3 · prior IV GWC | **must_keep** |
| Dual Nest `/rec` · Lane B SoT · UV×YCTD · REC-03 · seed · honesty flip · greenfield table · reopen REC-01/02/08 | **DENY** |
| `recruitment_uat_ready` | **false** |
| C-SLICE | **true** |

---

## 7. Client API_DESIGN pointer

| Action | Path |
|--------|------|
| ADD F-REC-IV-01..04 + MINT errors · RETAIN SCHED-SOFT | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` |
| Registry DOC-DELTA | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01` |
| Team SoT | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` |

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
| **next_owner** | **dev-be** + **dev-fe** (same session unlock · rule 26) |
| **completion_report** | F.1 residual CONFIRMED: IV-02 `no_show`+cancel CFG; IV-03 R-A PATCH; RETAIN IV-01/04/SCHED-SOFT physical `/recruitment/interviews*`; mint PAST/CANCEL-REASON; DTO↔spine; ba-data NOT REQUIRED; DENY dual/Lane B/UV×YCTD/REC-03/seed/honesty/greenfield. |

### next_dispatch_prompt

See spec § **next_dispatch_prompt** — both **BE-01** and **FE-01** copy-ready blocks.
