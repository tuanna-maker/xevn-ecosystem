# Evidence — OS-STD-W1-A-SLICE-01

| Field | Value |
|-------|--------|
| **work_item_id** | OS-STD-W1-A-SLICE-01 |
| **role** | sa |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **scope** | Docs-only feature slice maps for 11 DOC-ENT P0 FR |

## entry_criteria (met)

- [x] Read `SRS_NEW.md` v1.1 §3.2 P0 FR set
- [x] Read `API_CONTRACT_NEW.md` v1.1 §1–9 endpoints
- [x] Read `DB_DESIGN_NEW.md` v1.1 tables / soft-delete / scope_parity
- [x] Read `_vibe-team-os/22` + slice template; `28` display-ready; `29` Team Claude control plane
- [x] Read `OS_STD_AND_CODING_ACTION_PLAN.md` W1-A row
- [x] Survey monorepo `apps/` tree (read-only) for proposed `allowed_paths`

## deliverables

| Artifact | Path | Notes |
|----------|------|-------|
| Index | `docs/program/slices/DOC-ENT-P0-INDEX.md` | W1-B priority 1→9 |
| Auth | `docs/program/slices/DOC-ENT-P0-AUTH-M01.md` | FR-UC-M01 |
| Catalog | `docs/program/slices/DOC-ENT-P0-XBOS-CAT.md` | FR-UC-B04 |
| Employees | `docs/program/slices/DOC-ENT-P0-HRM-EMP.md` | FR-UC-H01 + HRM-21 |
| Workflow | `docs/program/slices/DOC-ENT-P0-XBOS-WF.md` | FR-UC-B03 |
| Leave | `docs/program/slices/DOC-ENT-P0-HRM-LEAVE.md` | FR-UC-H03 + M03 |
| Offline | `docs/program/slices/DOC-ENT-P0-MOB-M06.md` | FR-UC-M06 |
| Contracts | `docs/program/slices/DOC-ENT-P0-HRM-CON.md` | FR-UC-HRM-25 |
| Payroll | `docs/program/slices/DOC-ENT-P0-HRM-PAY.md` | FR-UC-H04 |
| Decisions | `docs/program/slices/DOC-ENT-P0-HRM-DEC.md` | FR-UC-HRM-27 |
| Plan row | `docs/program/OS_STD_AND_CODING_ACTION_PLAN.md` | W1-A status only |

## FR coverage check

| FR | Slice | API § | Tables |
|----|-------|-------|--------|
| B03 | XBOS-WF | §1 | workflow definition/instance/step_task |
| B04 | XBOS-CAT | §2 | config_catalogs/items · synced_catalogs |
| H01 | HRM-EMP | §3 | employees |
| H03 | HRM-LEAVE | §4 | leave_requests · balances |
| H04 | HRM-PAY | §5 | payroll_periods · payslips |
| HRM-21 | HRM-EMP (group) | §3 | employees + summary |
| HRM-25 | HRM-CON | §6 | contracts · insurance_records |
| HRM-27 | HRM-DEC | §7 | hr_decisions |
| M01 | AUTH-M01 | §8 | tenant · portal_user · membership |
| M03 | HRM-LEAVE (group) | §4 | leave_* |
| M06 | MOB-M06 | §9 | no new P0 table |

**11/11 FR mapped.**

## Monorepo path grounding (read-only)

Confirmed packages/dirs exist:

- `apps/api/xbos-api/src/{auth,workflow-engine,config-sync}`
- `apps/api/hrm-api/src/{auth,employees,attendance,payroll,contracts-insurance,decisions,catalog-sync,common/idempotency.middleware.ts}`
- `apps/web/web-portal/src/{pages/auth,pages/command-center/Workflow*,integrations/workflowEngineApi*,modules/hrm}`
- `apps/web/hrm/src/{pages/Employees,EmployeeProfile,Attendance,Payroll,Contracts,Insurance,Decisions,…}`
- `apps/mobile/hrm-mobile/src/{features/auth,attendance,payroll,contracts,integrations/offlineQueue,…}`

**No `apps/**` edits in this work item.**

## Architecture notes (SA)

1. **Grouping:** H01+HRM-21 and H03+M03 share API/table spine — one slice each reduces W1-B thrash.
2. **Dependency:** Auth → Catalog → EMP → WF → Leave → M06 → CON → PAY → DEC.
3. **`28` SoC:** Every slice forbids FE deep join / payroll formulas; BE owns display-ready.
4. **`29` gate:** Team Claude draft OK only after Cursor `REVIEW_ACCEPT`. **C-OS-29-NAME-01 CLOSED** during this session (`29` → `28-…DISPLAY-READY.md` LANDED) — W1-B unblocked on slice maps.
5. **Honesty residuals preserved:** payroll 3-status; M06 header-only; decisions no mock; Q-INS-01; D-DEC-SOFT-01.

## Options considered

| Option | Summary | Decision |
|--------|---------|----------|
| A — 11 files (1 FR = 1 slice) | Max clarity, more PM overhead | Rejected — verbose |
| B — 9 grouped slices (this) | Logical API/table cohesion | **Selected** |
| C — 3 mega-slices (XBOS/HRM/MOB) | Too wide for `allowed_paths` DoD | Rejected — blast radius |

## Residual / next

| id | Owner | Note |
|----|-------|------|
| C-OS-29-NAME-01 | — | **CLOSED** (evidence `os-std-c-os-29-name-01.md`) |
| C-OS-INDEX-01 | pm | SUBAGENT_READ_MAP / MANIFEST 28/29 pointers (P3) |
| W1-B first code | pm → Team Claude + Cursor review | Start **DOC-ENT-P0-AUTH-M01** (or EMP if auth green) |

## completion_report

- **Closed:** W1-A slice maps + index + evidence; action plan W1-A marked ready for W1-B gate.
- **Open:** No product code yet; W1-B ready to dispatch (name fix CLOSED).
- **Not claimed:** Phase 1 DONE / UAT / PROD.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: OS-STD-W1-B-AUTH-M01
role: team-claude (draft) → Cursor review (dev-be/dev-fe) → qa
entry: W1-A READY · C-OS-29-NAME-01 CLOSED · slice DOC-ENT-P0-AUTH-M01
slice_path: docs/program/slices/DOC-ENT-P0-AUTH-M01.md
read_first: AGENTS · 25 · 26 · 28-FE-BE-SEPARATION-DISPLAY-READY.md · 22 · SRS FR-UC-M01 · TECH_SPEC · DB_DESIGN §3.1–3.3 · API_CONTRACT §8
allowed_paths: from slice §B only
forbidden: apps/** outside slice · rewrite NEW docs · seed for UF · merge main without REVIEW_ACCEPT
exit: DRAFT_READY_FOR_REVIEW → Cursor REVIEW_ACCEPT → qa U65 login+membership UF
evidence_path: docs/qa/evidence/os-std-w1-b-auth-m01.md
ack_target: PASS_TO_PM after Cursor review accept
```

## ack_status

**PASS_TO_PM**
