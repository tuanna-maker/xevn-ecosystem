# Evidence — PO-HRM-REC-UV-YCTD-API-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-UV-YCTD-API-01` |
| from_role | sa |
| to_role | pm |
| lane | governance |
| change_mode | ADD · **NO CODE** `apps/**` · no migrate |
| date | 2026-08-06 |
| api_delta_sot | `docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md` |
| client_pointer | `docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md` F-REC-APP-01 + F-REC-UV-YCTD-* / F-REC-CMP-* + DOC-DELTA |
| ref_techspec | `PO-HRM-REC-UV-YCTD-TECH-01.md` §2–§3 · §6 |
| ref_db | `PO-HRM-REC-UV-YCTD-DB-01.md` **CONFIRMED** |
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
| Dev unlock this seat | **false** (cascade complete → QA plan → PM unlock) |

---

## 1. Deliverables

| Artifact | Action |
|----------|--------|
| `PO-HRM-REC-UV-YCTD-API-01.md` | **ADD CONFIRMED** — F.1 F-REC-UV-YCTD-01..05 + F-REC-CMP-01..02 overlay F-REC-APP-01; alias; write path; position; errors; FORBIDDEN |
| `API_DESIGN_HRM_ENTERPRISE.md` | **DOC-DELTA** — deepen F-REC-APP-01; ADD pointer table; §7.3; footer — **no wipe** APP-02/03/MAIL/HIRE |
| `apps/**` | **Not touched** |

---

## 2. Confirmations (audit)

| Lock | Status |
|------|--------|
| F-REC-UV-YCTD-01..05 each has F.1 (Mục đích · Nghiệp vụ · SRS 05a · Req/Res→DB · lỗi) | **PASS** |
| F-REC-CMP-01..02 each has F.1 (SRS 06b) | **PASS** |
| Overlay F-REC-APP-01 without wipe APP-02/03 | **PASS** |
| DTO alias `recruitment_request_id` ↔ `requisition_id` ONE physical | **PASS** |
| Write path: Lane A create YCTD required + N–N same FK name; no silent Lane B | **PASS** |
| Position derived; POSITION-MISMATCH / reject free-text SoT | **PASS** |
| Errors REQUIRED · STATUS · NOT-FOUND · MISMATCH · MAX-N · YCTD-MIX | **PASS** |
| Empty receivable / 0 UV = 200 `[]` | **PASS** |
| FORBIDDEN job_postings / REC-03 | **PASS** |
| No second FK invent | **PASS** |
| No Dev unlock claim / honesty false | **PASS** |
| **DB-01 + API-01 CONFIRMED** → cascade complete for QA plan | **PASS** |

---

## 3. Alias + write path (API)

| Logical DTO | Physical DTO / column |
|-------------|----------------------|
| `recruitment_request_id` | `requisition_id` → Lane A `recruitment_candidates.requisition_id` and/or application.`requisition_id` |
| Response alias echo | MUST equal physical id |

| Create path | Rule |
|-------------|------|
| MVP FR-05a | `POST …/candidates` **requires** YCTD id (either alias name) |
| Missing YCTD | **400** `HRM-REC-UV-YCTD-REQUIRED` — **not** Lane B pool success |
| N–N add | `POST …/candidates/:id/applications` same `requisition_id` FK name |
| Compare | Filter SoT = YCTD only; scores on application/eval |

---

## 4. Residual (cascade — not closed)

| Residual | Owner next |
|----------|------------|
| Unit/integration + browser U65 test plan AC-REC-UV-* / AC-REC-CMP-* | **qa** `PO-HRM-REC-UV-YCTD-QA-PLAN-01` |
| Dev BE/FE implement narrow | **pm** unlock after QA plan — **not** this seat |

---

## 5. Completion contract

- `completion_report`: API_DESIGN delta CONFIRMED — F-REC-UV-YCTD-01..05 + F-REC-CMP-01..02 F.1 overlay F-REC-APP-01; alias ONE physical `requisition_id`; write path Lane A + N–N; position derived; errors locked; empty 200[]; FORBIDDEN job_postings/REC-03. Client DOC-DELTA no wipe. Cascade DB+API complete → QA plan next. No apps/** · no migrate · no Dev unlock. Honesty false.
- `next_owner`: **pm** → **qa**
- `next_dispatch_prompt`: copy-ready below
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-QA-PLAN-01
from_role: pm
to_role: qa
lane: governance (test design)
change_mode: ADD
ack_target: PASS_TO_PM

read_first:
  - docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md (CONFIRMED)
  - docs/program/specs/PO-HRM-REC-UV-YCTD-API-01.md (CONFIRMED)
  - docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §2–§3 · §6 · §9
  - docs/qa/evidence/po-hrm-rec-uv-yctd-api-01.md
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 FR-UC-BP-REC-05a · 06b (AC-REC-UV-* · AC-REC-CMP-*)

entry_criteria:
  - DB-01 + API-01 both CONFIRMED
  - U65 zero-seed; recruitment_uat_ready=false; jd_dynamic_done=false
  - NO apps/** unless PM splits Dev later

task:
  1. Unit/integration + browser U65 test plan mapping AC-REC-UV-01..04 + AC-REC-CMP-01..05 + Diễn biến 05a #1–#6 / 06b #1–#6
  2. Cases: receivable empty 200[] · STATUS non-receivable · REQUIRED missing YCTD · NOT-FOUND · POSITION-MISMATCH / no free-text SoT · alias either name same id · FORBIDDEN job_postings/REC-03 path · CMP empty 0 UV · MAX-N · YCTD-MIX · F5 list still shows YCTD+position
  3. Journeys J-HRM-REC-UV-01 · J-HRM-REC-CMP-01 click path; persona; scope_parity list↔get
  4. Write path note: Lane A create requires requisition_id; no silent Lane B pool as FR-05a PASS
  5. evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md
  6. next_dispatch_prompt: PM unlock Dev-BE/FE PO-HRM-REC-UV-YCTD-BE-01 / FE-01 (+ CMP-FE) narrow only after plan
  7. ack_status: PASS_TO_PM
  8. DENIED: seed · claim recruitment_uat_ready · REC-03 unlock · invent second FK · Dev code this seat

exit: completion_report + next_owner + next_dispatch_prompt + PASS_TO_PM
```
