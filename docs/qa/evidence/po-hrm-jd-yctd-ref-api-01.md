# Evidence — PO-HRM-JD-YCTD-REF-API-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-JD-YCTD-REF-API-01` |
| role | sa |
| lane | governance |
| change_mode | ADD · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| api_delta_sot | `docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md` |
| client_pointer | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` F-REC-YCTD-* + F-YCTD-JD-* + DOC-DELTA |
| ref_techspec | `PO-HRM-JD-YCTD-REF-TECHSPEC-01.md` §2 · §4 |
| ref_db | `PO-HRM-JD-YCTD-REF-DB-01.md` **CONFIRMED** |
| ref_srs | `SRS_HRM_ENTERPRISE.md` v0.10 FR-UC-BP-REC-02/02b Diễn biến 1a–1d |
| ack_status | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `PO-HRM-JD-YCTD-REF-API-01.md` | **ADD CONFIRMED** — F.1 F-YCTD-JD-01..05 overlay F-REC-YCTD-01/02; alias; errors; preview; FORBIDDEN |
| `API_DESIGN_HRM_ENTERPRISE.md` | **DOC-DELTA** — UPGRADE F-REC-YCTD-01/02 stubs; ADD F-YCTD-JD-01/02/04/05 pointer table; §7.3; footer DOC-DELTA — **no wipe** |
| `apps/**` | **Not touched** |

---

## 2. Confirmations (audit)

| Lock | Status |
|------|--------|
| F-YCTD-JD-01..05 each has F.1 (Mục đích · Nghiệp vụ · SRS 1a–1d · Req/Res→DB · lỗi) | PASS |
| Overlay F-REC-YCTD-01/02 without wipe plan_cell / out_of_plan | PASS |
| DTO alias `job_description_id` ↔ `job_template_id` ONE physical | PASS |
| Errors STATUS · REQUIRED · NOT-FOUND | PASS |
| Empty bindable library 200 `[]` | PASS |
| Preview ≠ persist full `values_json` on YCTD | PASS |
| Optional snapshot text one-way | PASS |
| FORBIDDEN `job_postings` dual-write · REC-03 / campaign GĐ1 | PASS |
| F-REC-CAMPAIGN-* remain HOLD GĐ2 | PASS |
| No `jd_dynamic_done` claim | PASS |
| **DB-01 CONFIRMED + API-01 CONFIRMED** → Dev HOLD **lifts** for narrow bindable/status/alias only | PASS (cascade complete) |

---

## 3. Alias map (API)

| Logical DTO | Physical DTO / column |
|-------------|----------------------|
| `job_description_id` | `job_template_id` → `job_requisitions.job_template_id` |
| Preview `job_description_id?` echo | MUST equal `job_template_id` |

---

## 4. Residual

| ID | Item | Owner |
|----|------|-------|
| R-YCTD-JD-QA | Unit/integration test plan map AC-YCTD-JD-* + J-HRM-JD-YCTD-01 | **qa** `PO-HRM-JD-YCTD-REF-QA-PLAN-01` |
| R-YCTD-JD-DEV | `apps/**` bindable-list + status-gate + alias DTO | **pm** unlock after QA plan (or parallel if PM chooses) — **narrow only** |

---

## 5. Completion / handoff

| Field | Value |
|-------|--------|
| completion_report | API_DESIGN delta CONFIRMED: F-YCTD-JD-01..05 F.1 overlay F-REC-YCTD-01/02; alias ONE physical; STATUS/REQUIRED/NOT-FOUND; empty 200[]; preview ≠ values_json; FORBIDDEN job_postings/REC-03 GĐ1. Client DOC-DELTA no wipe. Cascade DB-01+API-01 complete — Dev HOLD lifts for bindable-list/status-gate/alias only. No apps/**. |
| next_owner | **pm** |
| next_dispatch_prompt | (xem §6) |
| evidence_path | `docs/qa/evidence/po-hrm-jd-yctd-ref-api-01.md` |
| ack_status | **PASS_TO_PM** |

---

## 6. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-YCTD-REF-QA-PLAN-01
role: qa
lane: governance (test design) · NO CODE apps/** unless PM splits Dev
change_mode: ADD

entry_criteria:
- DB-01 CONFIRMED: docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md
- API-01 CONFIRMED: docs/program/specs/PO-HRM-JD-YCTD-REF-API-01.md
- TechSpec: PO-HRM-JD-YCTD-REF-TECHSPEC-01.md §2–§4
- evidence API: docs/qa/evidence/po-hrm-jd-yctd-ref-api-01.md
- cascade: DB+API both CONFIRMED — Dev HOLD lifts for bindable-list / status-gate / alias DTO only

task:
1. Unit/integration + browser U65 test plan mapping AC-YCTD-JD-01..06 + Diễn biến 1a–1d
2. Cases: bindable Hiệu lực · empty 200[] · STATUS Ngừng · REQUIRED missing · NOT-FOUND · preview ≠ values_json persist · F5 jd_code/title · FORBIDDEN job_postings path
3. Journey J-HRM-JD-YCTD-01 click path; persona; scope_parity list↔get
4. evidence_path: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md
5. next_dispatch_prompt: PM unlock Dev-BE/FE PO-HRM-JD-YCTD-REF-BE-01 / FE-01 (narrow) citing cascade complete
6. ack_status: PASS_TO_PM
7. DENIED: jd_dynamic_done · campaign/job_postings SoT · seed for evidence

ALTERNATE (if PM skips QA-plan seat): unlock Dev only after citing
  DB-01 + API-01 CONFIRMED + allowed_paths bindable-list/status-gate/alias only
```
