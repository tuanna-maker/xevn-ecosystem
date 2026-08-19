# Slice — DOC-ENT-P0-HRM-DEC

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-HRM-DEC |
| **Epic / lane** | DOC-ENT P0 · HR decisions (honesty) |
| **Owner** | W1-B Team Claude → Cursor review |
| **UC / FR** | **FR-UC-HRM-27** · UC-HRM-27 · BR-DEC-01..06 |
| **AC** | AC-DEC-01..04 · **AC-HRM-EMBED-05** live-empty / no mock |
| **Flow test** | Embed decisions list empty trung thực hoặc data thật · create → detail → F5 |
| **change_mode** | UPGRADE |
| **work_item_id** | OS-STD-W1-A-SLICE-01 |
| **status** | DRAFT |
| **W1-B priority** | **P0-9** (cuối spine — không claim module DONE) |

## spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_NEW.md v1.1 §3.2 · FR-UC-HRM-27 · AC-HRM-EMBED-05 · AC-DEC-*
- tech_spec: TECH_SPEC_NEW.md v1.1
- db_design: DB_DESIGN_NEW.md §4.8 — hr_decisions
- api_design: API_CONTRACT_NEW.md v1.1 §7
- slice: docs/program/slices/DOC-ENT-P0-HRM-DEC.md
- change_mode: UPGRADE
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| API §7 · DB hr_decisions | READ | SoT |
| This slice | ADD | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed)

| Layer | Path | Neo tag | must_keep | Owner |
| --- | --- | --- | --- | --- |
| BE | `apps/api/hrm-api/src/decisions/**` | @CODE-MEMORY | live-empty OK; **cấm** mock live; scope_parity; employee_name snapshot bắt buộc | dev-be |
| FE | `apps/web/hrm/src/pages/Decisions.tsx` · `hooks/useDecisions.ts` | @CODE-MEMORY | không inject fake rows; empty state trung thực | dev-fe |

### API endpoints

| Method | Path |
| --- | --- |
| GET | `/api/hrm/decisions` |
| POST | `/api/hrm/decisions` |
| GET | `/api/hrm/decisions/:decisionId` |
| PATCH | `/api/hrm/decisions/:decisionId` |
| DELETE | `/api/hrm/decisions/:decisionId` |
| POST | `/api/hrm/decisions/:decisionId/files` (phụ) |

### Tables

`hr_decisions`

## C. Ops

| Path | Neo | Note |
| --- | --- | --- |
| — | — | Không seed quyết định mẫu live |

## D. Forbidden

- Mock quyết định live để «có data»
- Claim module DONE (BR-DEC-06)
- apps/** ngoài B · rewrite NEW docs

## E. Residual

| id | Mô tả | ack |
| --- | --- | --- |
| D-DEC-SOFT-01 | DELETE chưa `deleted_at` — runtime xóa hàng hoặc qua status | OPEN |

## F. Verify (W1-B)

- [ ] Empty list trung thực khi total=0
- [ ] Create thật → detail scope parity · F5
- [ ] Không mock · không claim DONE
- [ ] diff ⊆ slice

## Team Claude note

```text
Honesty-first slice. Prefer empty UI over fake density.
28 DISPLAY-READY override until C-OS-29-NAME-01. DRAFT_READY_FOR_REVIEW only.
```
