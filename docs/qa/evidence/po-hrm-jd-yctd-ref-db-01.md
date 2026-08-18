# Evidence — PO-HRM-JD-YCTD-REF-DB-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-JD-YCTD-REF-DB-01` |
| role | ba-data |
| lane | governance |
| change_mode | ADD · **NO CODE** `apps/**` · no migrate |
| date | 2026-08-06 |
| db_delta_sot | `docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md` |
| client_pointer | `docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md` §2.3 + DOC-DELTA + DV-21..25 |
| ref_techspec | `PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` §5 |
| ref_arch | `PO-HRM-JD-DYNAMIC-ARCH-02.md` §3.5 · §3.7 |
| ref_srs | `SRS_HRM_ENTERPRISE.md` v0.10 FR-UC-BP-REC-02/02b Diễn biến 1a–1d |
| ack_status | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `PO-HRM-JD-YCTD-REF-DB-01.md` | **ADD** — ONE physical soft FK confirm; snapshot semantics; status/bindable; FORBIDDEN; VAL DV-YCTD-JD-*; trace |
| `DB_DESIGN_HRM_ENTERPRISE.md` | **DOC-DELTA** §2.3 alias + snapshot cols + DV-21..25 + §8 forbidden + footer DOC-DELTA — **no wipe** stubs |
| `apps/**` | **Not touched** |

---

## 2. Confirmations (audit)

| Lock | Status |
|------|--------|
| ONE physical `job_requisitions.job_template_id` | PASS |
| Logical `job_description_id` = alias only | PASS |
| No dual physical FK invent | PASS |
| Snapshot `job_description`/`requirements` ≠ `values_json` SoT | PASS |
| Retire JD ≠ CASCADE delete YCTD | PASS |
| Bindable = Hiệu lực only; history keeps Ngừng ref | PASS |
| `job_postings` / REC-03 / campaign GĐ1 as JD SoT | FORBIDDEN documented |
| Dev HOLD until API-01 | PASS |
| No `jd_dynamic_done` claim | PASS |

---

## 3. Alias map (SoT)

| Logical | Physical |
|---------|----------|
| `rec_recruitment_request.job_description_id` | `job_requisitions.job_template_id` |
| `rec_job_description` | `job_description_templates` (+ JSONB dynamic SoT) |

---

## 4. Residual

| ID | Item | Owner |
|----|------|-------|
| R-YCTD-JD-API | F.1 API_DESIGN delta F-REC-YCTD / F-YCTD-JD-01..05 + error codes | **sa** `PO-HRM-JD-YCTD-REF-API-01` |
| R-YCTD-JD-DEV | apps/** wire | HOLD until DB+API confirm |

---

## 5. Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | DB_DESIGN delta CONFIRMED: ONE soft FK physical `job_template_id` ↔ logical `job_description_id` (alias); optional YCTD snapshot text one-way; status/bindable + no CASCADE; FORBIDDEN dual FK / job_postings / REC-03 GĐ1. Client DOC-DELTA. No apps/**. |
| next_owner | **sa** |
| next_dispatch_prompt | (xem §6) |
| evidence_path | `docs/qa/evidence/po-hrm-jd-yctd-ref-db-01.md` |
| ack_status | **PASS_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-YCTD-REF-API-01
role: sa
lane: governance
change_mode: ADD · NO CODE apps/**

entry_criteria:
- DB delta CONFIRMED: docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md
- TechSpec: docs/program/specs/PO-HRM-JD-YCTD-REF-TECHSPEC-01.md §2 F-YCTD-JD-01..05 + §4 errors
- Client API: docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-REC-YCTD-* stubs
- evidence DB: docs/qa/evidence/po-hrm-jd-yctd-ref-db-01.md

task:
1. API_DESIGN delta — map F-YCTD-JD-01..05 onto F-REC-YCTD-01/02 (or family) with F.1:
   Mục đích · Nghiệp vụ · Tham chiếu bước SRS 1a–1d · Request/Response→DB · lỗi
2. DTO alias: job_description_id ↔ job_template_id (ONE physical; cấm dual column)
3. Lock error codes: HRM-JD-YCTD-STATUS · REQUIRED · NOT-FOUND; empty library 200[]
4. Preview contract ≠ persist full values_json on YCTD; optional snapshot text fields
5. FORBIDDEN job_postings dual-write · REC-03 campaign GĐ1 unlock
6. DOC-DELTA pointer in API_DESIGN_HRM_ENTERPRISE.md — no wipe stubs
7. Prefer SoT file docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md if cleaner
8. evidence_path: docs/qa/evidence/po-hrm-jd-yctd-ref-api-01.md
9. next_dispatch_prompt for qa PO-HRM-JD-YCTD-REF-QA-PLAN-01 (or PM cascade)
10. ack_status: PASS_TO_PM · Append bus brief
11. Dev HOLD until this API-01 confirm (with DB-01 already confirmed)

cấm: apps/** · seed · jd_dynamic_done · invent dual FK · open campaign/job_postings SoT
```
