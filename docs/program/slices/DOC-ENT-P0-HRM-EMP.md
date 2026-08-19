# Slice — DOC-ENT-P0-HRM-EMP (ACTIVE)

| Field | Value |
|-------|--------|
| **StoryID** | `DOC-ENT-P0-HRM-EMP` |
| **work_item_id** | `W1-B-02-EMP` |
| **ref_srs** | FR-UC-H01 · FR-UC-HRM-21 |
| **ref_api** | API_CONTRACT_NEW §3 |
| **status** | ACTIVE |

## Goal

Employees list/detail/patch display-ready + scope parity list↔get-by-id↔patch; CODE-MEMORY; no FE join for name/dept (OS 28).

## allowed_paths

- `apps/api/hrm-api/src/employees/**`
- `docs/qa/evidence/w1b-02-emp.md`
- `docs/program/slices/DOC-ENT-P0-HRM-EMP.md`

## forbidden

- web/mobile · migrations · seed · leave module · rewrite NEW docs

## DoD

- [x] display-ready on list/get/create/patch responses
- [x] scope parity list↔get↔patch (`resolveHrmListScope` + `scopeContext`)
- [x] jest touched
- [x] CODE-MEMORY APPEND
- [x] evidence `docs/qa/evidence/w1b-02-emp.md`
