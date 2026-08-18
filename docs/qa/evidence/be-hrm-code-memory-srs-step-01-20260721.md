# Evidence — BE-HRM-CODE-MEMORY-SRS-STEP-01

**work_item_id:** `BE-HRM-CODE-MEMORY-SRS-STEP-01`  
**from_role:** `dev-be`  
**date:** 2026-07-21  
**change_mode:** ADD (doc-in-code only — **no** business logic / AC change)

## Scope (W1 spine)

| Module | FR (khách) | TechSpec `ref_srs` | Controllers / key services |
|--------|------------|--------------------|----------------------------|
| employees | FR-HRM-EM-01 | §14.1 | `employees.controller.ts` · `employees.service.ts` |
| contracts-insurance | FR-HRM-CI-01 · CI-02 | §14.2 · §14.3 | `contracts-insurance.controller.ts` · `contracts-insurance.service.ts` |
| attendance sheets+records+leave | FR-HRM-AT-14 · AT-10 · AT-01 | §14.4 · §14.5 | `attendance.controller.ts` · `attendance-catalog.service.ts` · `attendance.service.ts` · `leave-requests.service.ts` |
| payroll payslips | FR-HRM-PR-05 | §14.6 | `payroll.controller.ts` · `payroll.service.ts` |
| recruitment requisitions (+ headcount proposals note) | FR-HRM-RC-01 | §14.7 · G-RC-01 | `recruitment.controller.ts` · `recruitment.service.ts` |
| settings-catalogs | FR-HRM-SC-01 | §14.8 | `settings-catalogs.controller.ts` · `settings-catalogs.service.ts` |

## Spec SoT

- SRS: `docs/client-delivery/hrm/SRS_HRM_KHACH.md` — **Diễn biến #n** per FR
- TechSpec: `docs/hrm/TECHSPEC.md` §14 / §16 `ref_srs`
- Template: `~/.cursor/templates/CODE_MEMORY_BLOCK.md` · `_vibe-team-os/14`
- Lock: `docs/program/HRM_SPEC_TRACE_DB_API_CODE_LOCK.md`

## Files touched

```
apps/api/hrm-api/src/employees/employees.controller.ts
apps/api/hrm-api/src/employees/employees.service.ts
apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts
apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts
apps/api/hrm-api/src/attendance/attendance.controller.ts
apps/api/hrm-api/src/attendance/attendance.service.ts
apps/api/hrm-api/src/attendance/attendance-catalog.service.ts
apps/api/hrm-api/src/attendance/leave-requests.service.ts
apps/api/hrm-api/src/payroll/payroll.controller.ts
apps/api/hrm-api/src/payroll/payroll.service.ts
apps/api/hrm-api/src/recruitment/recruitment.controller.ts
apps/api/hrm-api/src/recruitment/recruitment.service.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.controller.ts
apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts
docs/qa/evidence/be-hrm-code-memory-srs-step-01-20260721.md
```

## What was added (per method)

- File-level `@CODE-MEMORY` (or `@CODE-MEMORY-CHANGE`) with:
  - `SRS: docs/client-delivery/hrm/SRS_HRM_KHACH.md §… · FR-…`
  - **`SRS bước: Diễn biến #n — mô tả Việt`**
  - `TechSpec: docs/hrm/TECHSPEC.md §14.x (ref_srs: FR-…)`
  - Purpose / Impact / must_keep tiếng Việt
- Method-level `@CODE-MEMORY method` on public spine handlers + key service methods
- Short Vietnamese comments on then/chốt branches (auth, duplicate, date reject, empty honesty, G-RC-01 headcount)

## must_keep (unchanged behavior)

- **AC-ATT-SHEET-01..06** — sheet create does **not** fabricate attendance records; empty list honesty
- **G-RC-01** — `job_requisitions.headcount` ≥1; not `job_postings` / proposals
- Leave-workflow bridge / F5 compensation / employee cursor-summary routes untouched in logic

## QA sample grep (expected PASS)

```bash
rg -n "SRS bước: Diễn biến" apps/api/hrm-api/src/{employees,contracts-insurance,attendance,payroll,recruitment,settings-catalogs} --glob "*.ts"
rg -n "ref_srs: FR-HRM-(EM-01|CI-01|CI-02|AT-14|AT-10|PR-05|RC-01|SC-01)" apps/api/hrm-api/src --glob "*.ts"
rg -n "@CODE-MEMORY" apps/api/hrm-api/src/{employees,contracts-insurance,attendance,payroll,recruitment,settings-catalogs} --glob "*controller.ts" --glob "*service.ts" -l
```

### Dev-BE self-check 2026-07-21

- All 14 spine files list `@CODE-MEMORY`.
- Smoke jest: `payroll.controller.spec` + `contracts-insurance.controller.spec` + `d-hrm-set-item-persist-01` → **3 suites / 20 tests PASS** (comments-only wave).
- must_keep AC-ATT-SHEET / G-RC-01: no logic edits in sheet create / headcount insert paths beyond Vietnamese comments.

## ack

- `ack_status`: **READY_FOR_QA**
- `next_owner`: `qa`
- Residual: W2+ FR outside spine (AT-02/03 approve paths, PR periods mutate, recruitment candidates) — out of this wave; optional follow-up CODE-MEMORY wave.

---

### completion_report

Closed: W1 spine modules annotated with SRS Diễn biến + TechSpec `ref_srs` CODE-MEMORY; no business logic diffs intended.  
Open: QA sample grep + spot-check AC-ATT-SHEET / G-RC-01 still green.

### next_dispatch_prompt

```
work_item_id: QA-HRM-CODE-MEMORY-SRS-STEP-01
from_role: pm
to_role: qa
lane: execution
priority: P1

entry_criteria: BE-HRM-CODE-MEMORY-SRS-STEP-01 READY_FOR_QA; evidence docs/qa/evidence/be-hrm-code-memory-srs-step-01-20260721.md
exit_criteria:
  1) Sample grep: every W1 spine controller/service file has @CODE-MEMORY + "SRS bước: Diễn biến" + TechSpec §14 ref_srs FR-HRM-EM-01|CI-01|CI-02|AT-14|AT-10|PR-05|RC-01|SC-01
  2) Spot-check must_keep: no unintended logic change — optional jest smoke employees|contracts-insurance|recruitment|payroll listPayslips|attendance (do NOT seed; U65)
  3) Update matrix note if needed; PASS_TO_PM with evidence path
cấm: seed · claim Phase1 DONE · rewrite business logic
```
