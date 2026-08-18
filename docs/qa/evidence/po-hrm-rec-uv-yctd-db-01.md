# Evidence — PO-HRM-REC-UV-YCTD-DB-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-UV-YCTD-DB-01` |
| from_role | ba-data |
| to_role | pm |
| lane | governance |
| change_mode | ADD · **NO CODE** `apps/**` · no migrate |
| date | 2026-08-06 |
| db_delta_sot | `docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md` |
| client_pointer | `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` §2.4–§2.5 + DOC-DELTA + DV-26..31 |
| ref_techspec | `PO-HRM-REC-UV-YCTD-TECH-01.md` §7 · §2–§3 |
| ref_pattern | `PO-HRM-JD-YCTD-REF-DB-01.md` (ONE physical soft FK reuse) |
| ref_srs | `SRS_HRM_ENTERPRISE.md` v0.11 FR-UC-BP-REC-05a · 06b |
| touched `apps/**` | **false** |
| migrate | **false** |
| ack_status | **PASS_TO_PM** |

---

## Honesty locks

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| FORBIDDEN `job_postings` as UV / compare SoT | **true** |
| REC-03 OUT GĐ1 | **true** |
| U65 zero-seed | **true** |
| Dev `apps/**` | **HOLD** until API-01 |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `PO-HRM-REC-UV-YCTD-DB-01.md` | **ADD** — ONE physical soft FK confirm; position_key SoT; deprecate free-text; FORBIDDEN; VAL DV-UV-YCTD-*; trace |
| `DB_DESIGN_HRM_ENTERPRISE.md` | **DOC-DELTA** §2.4–§2.5 alias + denorm note + DV-26..31 + §8 forbidden + footer — **no wipe** stubs |
| `apps/**` | **Not touched** |

---

## 2. Confirmations (audit)

| Lock | Status |
|------|--------|
| ONE physical soft FK name `requisition_id` | **PASS** |
| Logical `recruitment_request_id` = alias only | **PASS** |
| No dual physical FK invent | **PASS** |
| Target = `job_requisitions` / `rec_recruitment_request` | **PASS** |
| Position SoT = YCTD.`position_key` (derived) | **PASS** |
| Free-text `candidates.position` deprecated as SoT | **PASS** |
| Optional denorm `position_key` on application ≠ second SoT | **PASS** |
| Eval / compare neo `application_id` + filter YCTD | **PASS** |
| No CASCADE YCTD → applications | **PASS** |
| `job_postings` / `job_posting_id` / REC-03 as UV SoT | **FORBIDDEN** documented |
| Dev HOLD until API-01 | **PASS** |
| Honesty flags false | **PASS** |

---

## 3. Alias map (SoT)

| Logical | Physical |
|---------|----------|
| `rec_candidate_application.recruitment_request_id` | **`requisition_id`** |
| `rec_recruitment_request.id` | `job_requisitions.id` |
| Position display SoT | YCTD.`position_key` (+ catalog name) — never free-text person SoT |

**AS-IS note (honesty):** Lane A `recruitment_candidates.requisition_id` validates the physical name; Lane B `candidate_applications.job_posting_id` remains **out of SoT** for FR-05a/06b. Enterprise N–N home = application with same `requisition_id` column name when physicalized — API-01 chốt write path.

---

## 4. Residual (cascade — not closed)

| Residual | Owner next |
|----------|------------|
| API_DESIGN overlay F-REC-UV-YCTD-* / F-REC-CMP-* + DTO alias + error codes | **sa** `PO-HRM-REC-UV-YCTD-API-01` |
| Write-path chốt (Lane A vs N–N application table) | **sa** API-01 (DB name locked; path not invent second FK) |
| FE free-text / compare stub / Dev | **HOLD** until DB+API |

---

## 5. Completion contract

- `completion_report`: DB_DESIGN delta CONFIRMED — ONE soft FK physical `requisition_id` ↔ logical `recruitment_request_id` (alias); position_key from YCTD; free-text `candidates.position` deprecated as SoT; FORBIDDEN dual FK / job_postings / REC-03 / CASCADE. Client DOC-DELTA. No apps/** · no migrate. Honesty false.
- `next_owner`: **sa**
- `next_dispatch_prompt`: copy-ready below
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-rec-uv-yctd-db-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-API-01
from_role: pm
to_role: sa
lane: governance
change_mode: ADD
ack_target: PASS_TO_PM

read_first:
  - docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md (CONFIRMED — ONE requisition_id alias)
  - docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §2–§3 F.1 + §6 errors
  - docs/qa/evidence/po-hrm-rec-uv-yctd-db-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-REC-APP-* stubs
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 FR-UC-BP-REC-05a · 06b

task:
  1. API_DESIGN delta — overlay deepen F-REC-APP-01 + ADD F-REC-UV-YCTD-01..05 + F-REC-CMP-01..02 with full F.1
     (Mục đích · Nghiệp vụ · Tham chiếu bước SRS · Request/Response→DB · lỗi)
  2. DTO alias: recruitment_request_id ↔ requisition_id (ONE physical; cấm dual column)
  3. Lock write path: create UV+application with YCTD required; chốt Lane A vs N–N without inventing second FK name
  4. Position: derive from YCTD; reject free-text SoT / POSITION-MISMATCH
  5. Error codes: HRM-REC-UV-YCTD-REQUIRED|STATUS|NOT-FOUND · POSITION-MISMATCH · HRM-REC-CMP-MAX-N|YCTD-MIX
  6. Empty receivable / 0 UV = 200 []; FORBIDDEN job_postings / REC-03
  7. DOC-DELTA pointer in API_DESIGN_HRM_ENTERPRISE.md — no wipe F-REC-APP stubs
  8. Prefer SoT file docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md
  9. honesty: recruitment_uat_ready=false · jd_dynamic_done=false · NO apps/**
  10. evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md
  11. next_dispatch_prompt for qa PO-HRM-REC-UV-YCTD-QA-PLAN-01 (or PM cascade after API confirm)
  12. ack_status: PASS_TO_PM

exit: completion_report + next_dispatch_prompt + PASS_TO_PM
```
