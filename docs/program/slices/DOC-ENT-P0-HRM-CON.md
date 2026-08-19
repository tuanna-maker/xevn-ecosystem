# Slice — DOC-ENT-P0-HRM-CON

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-HRM-CON |
| **Epic / lane** | DOC-ENT P0 · Contracts + Insurance |
| **Owner** | W1-B Team Claude → Cursor review |
| **UC / FR** | **FR-UC-HRM-25** · UC-HRM-25 |
| **AC** | Diễn biến #2–4 · **AC-HRM-EMBED-03** · Q-INS-01 list BH chuyên biệt |
| **Flow test** | Embed tab HĐ + tab/list BH · create contract/insurance · F5 |
| **change_mode** | UPGRADE |
| **work_item_id** | OS-STD-W1-A-SLICE-01 |
| **status** | DRAFT |
| **W1-B priority** | **P0-7** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_NEW.md v1.1 §3.2 · FR-UC-HRM-25 · AC-HRM-EMBED-03
- tech_spec: TECH_SPEC_NEW.md v1.1
- db_design: DB_DESIGN_NEW.md §4.6–4.7 — employee_contracts, employee_insurance_records
- api_design: API_CONTRACT_NEW.md v1.1 §6
- slice: docs/program/slices/DOC-ENT-P0-HRM-CON.md
- change_mode: UPGRADE
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| API §6 · DB contracts/insurance | READ | SoT |
| This slice | ADD | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed)

| Layer | Path | Neo tag | must_keep | Owner |
| --- | --- | --- | --- | --- |
| BE | `apps/api/hrm-api/src/contracts-insurance/**` | @CODE-MEMORY | scope_parity list/get; insurance SoT table — không proxy giả từ HĐ khi AC yêu cầu list BH | dev-be |
| FE HĐ | `apps/web/hrm/src/pages/Contracts.tsx` · `hooks/useContracts*.ts` · `components/contract/**` | @CODE-MEMORY | mutate FE→API 2xx + F5 | dev-fe |
| FE BH | `apps/web/hrm/src/pages/Insurance.tsx` · `components/insurance/**` | @CODE-MEMORY | list chuyên biệt Q-INS-01 | dev-fe |
| Mobile (optional read) | `apps/mobile/hrm-mobile/src/features/contracts/**` | @CODE-MEMORY | không orphan employee | dev-mobile |

### API endpoints

| Method | Path |
| --- | --- |
| GET | `/api/hrm/contracts-insurance/contracts` |
| GET | `/api/hrm/contracts-insurance/contracts/:contractId` |
| POST | `/api/hrm/contracts-insurance/contracts` |
| GET | `/api/hrm/contracts-insurance/insurance` |
| POST | `/api/hrm/contracts-insurance/insurance` |

### Tables

`employee_contracts` · `employee_insurance_records`

## C. Ops

| Path | Neo | Note |
| --- | --- | --- |
| — | — | U65 |

## D. Forbidden

- Claim BH DONE khi chỉ proxy từ contracts
- Orphan `employee_id` ngoài scope
- apps/** ngoài B · rewrite NEW docs

## E. Residual

| id | Mô tả | ack |
| --- | --- | --- |
| Q-INS-01 | FE list BH chuyên biệt vs table đã có | OPEN product |

## F. Verify (W1-B)

- [ ] AC-HRM-EMBED-03
- [ ] Create HĐ + BH · list scope · detail parity
- [ ] diff ⊆ slice

## Team Claude note

```text
BE display-ready contract/insurance rows (employee_name snapshot OK per DB).
Do not expand compensation package epic unless in allowed_paths explicitly.
28 DISPLAY-READY override until C-OS-29-NAME-01.
```
