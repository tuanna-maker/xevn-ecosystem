# Evidence — PO-HRM-REC-UV-YCTD-TECH-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-UV-YCTD-TECH-01` |
| from_role | sa |
| to_role | pm |
| lane | governance |
| change_mode | ADD |
| date | 2026-08-06 |
| SoT program | `docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md` |
| ref_srs | `SRS_HRM_ENTERPRISE.md` **v0.11** · FR-UC-BP-REC-05a · 06b |
| client pointer | `TECHSPEC_HRM_ENTERPRISE.md` DOC-DELTA (matrix + residual) |
| touched `apps/**` | **false** |
| ack_status | **PASS_TO_PM** |

## Honesty locks

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| FORBIDDEN `job_postings` as JD / compare / UV SoT | **true** |
| REC-03 OUT GĐ1 | **true** |
| U65 zero-seed | **true** |
| Dev `apps/**` | **HOLD** until DB-01 + API-01 |

## What closed

1. **TechSpec F.1 family ADD**
   - `F-REC-UV-YCTD-01..05` — picker YCTD receivable · derive position · create/link UV (overlay F-REC-APP-01) · list/get display-ready
   - `F-REC-CMP-01..02` — applications+evals by YCTD · compare matrix ≤ N
2. **Trace Diễn biến → API**
   - 05a #1–#6 + Thành công → UV-YCTD F-ids + AC-REC-UV-01..04
   - 06b #1–#6 + Thành công → CMP F-ids + AC-REC-CMP-01..05
3. **Soft FK reuse** (JD-YCTD pattern): ONE physical `requisition_id` ↔ logical `recruitment_request_id`; position_key derived; no dual-write postings
4. **Error taxonomy:** `HRM-REC-UV-YCTD-REQUIRED|STATUS|NOT-FOUND` · `POSITION-MISMATCH` · `HRM-REC-CMP-MAX-N|YCTD-MIX`
5. **Client TECHSPEC** DOC-DELTA rows 05a/06b + residual R-BP-REC-UV-YCTD-* — **no wipe** F-REC-APP stubs

## Options

| Option | Verdict |
|--------|---------|
| A — Overlay F-REC-APP-01 + ADD UV/CMP families on YCTD/applications | **CHOSEN** |
| B — New microservice / warehouse | Reject |
| C — Bind via `job_postings` | **FORBIDDEN** |

## Residual (cascade — not closed)

| Residual | Owner next |
|----------|------------|
| Physical alias confirm ONE `requisition_id`; deprecate free-text `position` SoT | **ba-data** `PO-HRM-REC-UV-YCTD-DB-01` |
| API_DESIGN overlay F.1 + codes on client `API_DESIGN_HRM_ENTERPRISE.md` | **sa** `PO-HRM-REC-UV-YCTD-API-01` |
| FE free-text / compare stub / Dev | **HOLD** until DB+API |

## Completion contract

- `completion_report`: Docs-only TechSpec ADD for Thêm UV (YCTD bắt buộc, position derived) + So sánh theo YCTD; F.1 + matrix + error codes; soft FK reuse; REC-03/job_postings FORBIDDEN; Dev HOLD; honesty false. No apps/**.
- `next_owner`: **ba-data** (DB-01) → then **sa** (API-01)
- `next_dispatch_prompt`: copy-ready below
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-rec-uv-yctd-tech-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-UV-YCTD-DB-01
from_role: pm
to_role: ba-data
lane: governance
change_mode: ADD
ack_target: PASS_TO_PM

read_first:
  - docs/program/specs/PO-HRM-REC-UV-YCTD-TECH-01.md §7 DB intents + §2–§3 F.1
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.11 — FR-UC-BP-REC-05a · 06b
  - docs/client-delivery/hrm-enterprise-blueprint/DB_DESIGN_HRM_ENTERPRISE.md §2.4–2.5 · §2.3 soft FK pattern
  - docs/program/specs/PO-HRM-JD-YCTD-REF-DB-01.md (ONE physical soft FK — reuse, no dual column)

task:
  - CONFIRM ONE physical soft FK application→YCTD: requisition_id ↔ logical recruitment_request_id (alias only)
  - Lock position_key derived from YCTD; deprecate free-text candidates.position as SoT
  - DOC-DELTA DB_DESIGN_HRM_ENTERPRISE.md — no wipe; FORBIDDEN job_postings / REC-03
  - honesty: recruitment_uat_ready=false · jd_dynamic_done=false
  - NO apps/** · no migrate

evidence_path: docs/qa/evidence/po-hrm-rec-uv-yctd-db-01.md
Also write: docs/program/specs/PO-HRM-REC-UV-YCTD-DB-01.md
exit: completion_report + next_dispatch_prompt (sa PO-HRM-REC-UV-YCTD-API-01) + PASS_TO_PM
```
