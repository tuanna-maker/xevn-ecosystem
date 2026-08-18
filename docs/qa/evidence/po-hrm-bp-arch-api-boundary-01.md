# Evidence — PO-HRM-BP-ARCH-API-BOUNDARY-01 (SA)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ARCH-API-BOUNDARY-01` |
| **from_role** | sa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **Date** | 2026-08-04 |
| **apps/** | **not touched** |

## spec_read_ack / sources

| Source | Result |
|--------|--------|
| `docs/program/customer-blueprint/PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md` | **MISSING** at write time (bus INTAKE points to path; only PPTX + media present) |
| PPT slides 3, 10, 11, 14 | Read via `C:\xevn-tmp\hrm-blueprint-media\image{3,10,11,14}.png` |
| Phase 1 scope ADRs | Referenced, not rewritten |
| As-built hire link | `hire-employee-link.ts` = REC→CORE soft link (supports I-2 direction) |

## Deliverables

| File | Status |
|------|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md` | Written — Option A recommend |
| `docs/client-delivery/hrm-enterprise-blueprint/API_BOUNDARY_MAP.md` | Written — matrix + events |
| `docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md` | Written — HOLD depth |

## Decision summary

- **Option A:** modular monolith + module fences + Gateway deny-list + domain events.
- **Reject B** (4 microservices now), **Reject C** (FE/DB free-for-all).
- **Locks:** REC↛PAY sync; PAY reads **closed** timesheet only; PAY↛Leave/OT APIs; formula engine no hardcode; slide 3 REC→PAY visual ≠ API allow.

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-BP-PROGRAM-MD | Program markdown missing | pm / ba-docs |
| R-BP-SRS | SRS confirm before TechSpec/DB/API depth | ba-docs |
| R-BP-DATA | Table ownership + event payload physical | ba-data (`PO-HRM-BP-DATA-OWNERSHIP-01`) |

## completion_report

Closed: ADR Option A/B/C + recommend; API allowed/forbidden matrix; events `offer.accepted`, `employee.activated`, `timesheet.closed`, `termination.started`; TechSpec outline HOLD.  
Open: program MD file; SRS confirm; physical DB/API.

## next_owner

ba-data (ownership align) **and** ba-docs (SRS FR cite ADR invariants) — PM sequences.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DATA-OWNERSHIP-01 (ba-data) + PO-HRM-BP-WBS-SRS-01 (ba-docs)
read_first:
  - docs/client-delivery/hrm-enterprise-blueprint/ADR-HRM-4-PILLAR-API-BOUNDARY.md
  - docs/client-delivery/hrm-enterprise-blueprint/API_BOUNDARY_MAP.md
  - docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_OUTLINE_HRM_ENTERPRISE.md
ba-data: map bảng SoT theo 4 trụ; payload 4 events; cấm shared write REC↔PAY; ATT owns closed sheet snapshot.
ba-docs: WBS/SRS FR mỗi trụ; mọi UC hire→lương đi CORE; AC I-2/I-3/I-5; không prompt-echo.
cấm: apps/** · DDL/API F.1 full trước SRS confirm
ack_status target: PASS_TO_PM
```
