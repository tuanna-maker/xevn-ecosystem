# Slice — DOC-ENT-P0-HRM-PAY

| Field | Value |
| --- | --- |
| **Story** | DOC-ENT-P0-HRM-PAY |
| **Epic / lane** | DOC-ENT P0 · Payroll periods / payslips |
| **Owner** | W1-B Team Claude → Cursor review |
| **UC / FR** | **FR-UC-H04** · UC-H04 |
| **AC** | Diễn biến #1/#2/#5/#6 · closed ≈ LOCKED · **honesty:** DB 3-status only |
| **Flow test** | Open period → process → close → list payslips · mobile read payslip |
| **change_mode** | UPGRADE |
| **work_item_id** | OS-STD-W1-A-SLICE-01 |
| **status** | DRAFT |
| **W1-B priority** | **P0-8** |

## spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_NEW.md v1.1 §3.2 · FR-UC-H04
- tech_spec: TECH_SPEC_NEW.md v1.1 · payroll SM honesty
- db_design: DB_DESIGN_NEW.md — payroll_periods, payroll_payslips (CHECK draft|processed|closed)
- api_design: API_CONTRACT_NEW.md v1.1 §5
- slice: docs/program/slices/DOC-ENT-P0-HRM-PAY.md
- change_mode: UPGRADE
```

## A. Spec / docs

| Path | Delta | Neo |
| --- | --- | --- |
| API §5 · DB payroll | READ | 3-status honesty |
| This slice | ADD | DOC-DELTA 2026-08-03 |

## B. Code paths (proposed)

| Layer | Path | Neo tag | must_keep | Owner |
| --- | --- | --- | --- | --- |
| BE | `apps/api/hrm-api/src/payroll/payroll.controller.ts` · `payroll.service.ts` · DTOs period/payslip/process/close | @CODE-MEMORY | reject mutate khi closed; **không** bịa 6-state SM trên DB | dev-be |
| FE | `apps/web/hrm/src/pages/Payroll.tsx` · `components/payroll/PayrollBatchesTab.tsx` · `PayrollPayslipsApiTab.tsx` (period/payslip only) | @CODE-MEMORY | wire API; FE không tự tính net từ components graph (`28`) | dev-fe |
| Mobile | `apps/mobile/hrm-mobile/src/features/payroll/**` | @CODE-MEMORY | list/detail phiếu; số thực lĩnh từ BE | dev-mobile |

### API endpoints

| Method | Path |
| --- | --- |
| POST | `/api/hrm/payroll/periods` |
| POST | `/api/hrm/payroll/periods/:periodId/process` |
| POST | `/api/hrm/payroll/periods/:periodId/close` |
| GET | `/api/hrm/payroll/payslips` |
| GET | `/api/hrm/payroll/periods` |

### Tables

`payroll_periods` · `payroll_payslips`

## C. Ops

| Path | Neo | Note |
| --- | --- | --- |
| — | — | Không seed kỳ lương cho UF |

## D. Forbidden

- Invent 6 cột SM payroll trên DB P0
- FE payroll formulas / nested write DTO (`28` / OS `25`§3.1)
- Expand advance/bonus/template tabs ngoài story trừ Touch-only-if
- apps/** ngoài B · rewrite NEW docs

## E. Residual

| id | Mô tả | ack |
| --- | --- | --- |
| R-PAY-HR-FIN-WF | Bước duyệt HR/Finance nếu có = service/WF — không đổi CHECK 3-status | OPEN honesty |
| R-PAY-HIRE-SPINE | Hire Active → enroll/process → payslip list (AC-PAY-HIRE-01..05 · Enterprise PAY-06 v0.16) | TECH DRAFT — `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01` Option B; docs FE MERGED (`PO-HRM-PAY-ENROLL-DOCS-01`); next ba-data DB-01 → BE/FE · `payroll_e2e_ready=false` |

### E2. DOC-DELTA Hire-to-Pay (ADD `PO-HRM-E2E-LINK-PAY-CFG-DOCS-01` · 2026-08-06)

| Trace | Content |
| --- | --- |
| Enterprise | `SRS_HRM_ENTERPRISE` FR-UC-BP-PAY-06 Diễn biến + AC-PAY-HIRE-01..03; PAY-02 AC-PAY-COMP-01 |
| Team | `docs/hrm/SRS.md` UC-HRM-24 · §16.2 dual SoT · §16.8 O4 picker |
| Journey proposed | **J-HRM-07b** Hire Active → kỳ/đợt → payslip · F5 |
| Honesty | `payroll_e2e_ready=false` |

### E3. DOC-DELTA FE enroll Diễn biến (ADD `PO-HRM-PAY-ENROLL-DOCS-01` · 2026-08-06)

| Trace | Content |
| --- | --- |
| Enterprise | PAY-06 v**0.16** Diễn biến màn Lương #1–#7 + AC-PAY-HIRE-04/05; PAY-01 sheet chốt; PAY-02 dual-SoT xref (tip file may be v0.17+ PROC) |
| Team | UC-HRM-24 AC-PAY-HIRE-04/05 |
| Tech | PAY-HIRE TECH DRAFT Option B — **not** product seal; preserve PAY TechSpec v0.3.x meeting depth |
| Honesty | `payroll_e2e_ready=false` · no UAT claim |

## F. Verify (W1-B)

- [ ] draft→processed→closed · mutate sau close FAIL
- [ ] Payslip list display-ready · mobile read
- [ ] diff ⊆ slice

## Team Claude note

```text
Honor API gap: 3 statuses only. BE computes amounts; FE binds.
28 DISPLAY-READY override until C-OS-29-NAME-01.
```
