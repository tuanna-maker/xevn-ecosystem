# Evidence — PO-HRM-AMIS-PARITY-PAY-TPL-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-BE-01` |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-DATA-01` PASS · `PO-HRM-AMIS-PARITY-PAY-TPL-API-01` CONFIRMED |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | ADD |
| **honesty** | `payroll_e2e_ready=false` · **cấm** invent LIVE evaluator · **cấm** merge pack into mẫu |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md` | F.1 LIST/UPSERT/LINES/ARCHIVE · PERIOD bind · OV-C · errors |
| 2 | `docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md` §2–§3 | DDL columns · UQ/IX · OV-C · soft-delete |
| 3 | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-api-01.md` | Unlock gate · path locks |
| 4 | Nest `payroll.service` salary-templates | **READ only** — pack stays enroll-only |
| 5 | Peer `pay-formula.service` | Soft assert OV-C definition_id under same scope |

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | ensureSchema + CRUD + bind snapshot |
| `apps/api/hrm-api/src/payroll/pay-sheet-template.constants.ts` | Error taxonomy |
| `apps/api/hrm-api/src/payroll/dto/pay-sheet-template.dto.ts` | LIST/UPSERT/LINES/ARCHIVE/BIND DTOs |
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.spec.ts` | scope_parity · VAL · archive · immutability |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | `/pay-sheet-templates*` + `periods/:id/bind-sheet-template` + create period optional bind |
| `apps/api/hrm-api/src/payroll/dto/create-payroll-period.dto.ts` | optional `paySheetTemplateId` |
| `apps/api/hrm-api/src/app.module.ts` | `PaySheetTemplateService` provider |

**Không đụng:** deepen `salary_templates` pack SoT · invent evaluator AST · FE net · U65 seed.

---

## 3. Schema (ensureSchema)

| Object | Detail |
|--------|--------|
| `pay_sheet_templates` | header · soft `archived_at` · UQ `(company_id, lower(code)) WHERE archived_at IS NULL` |
| `pay_sheet_template_lines` | OV-C `formula_override_definition_id` + optional `formula_override_json` · UQ active `(template_id, component_id)` |
| `payroll_periods` EXPAND | nullable `pay_sheet_template_id` + `sheet_template_snapshot_json` |
| Open catalog | **FORBIDDEN** `CHECK (code IN (...))` |
| Soft SM | status CHK `draft\|active\|retired` only (not business codes) |

---

## 4. HTTP surface

| Cap | METHOD / path |
|-----|----------------|
| LIST | `GET /api/hrm/payroll/pay-sheet-templates` |
| GET | `GET /api/hrm/payroll/pay-sheet-templates/:id` |
| UPSERT | `POST` / `PATCH …/pay-sheet-templates` |
| LINES | `GET` / `PUT …/:id/lines` (replace-set + soft-archive removed) |
| ARCHIVE | `POST …/:id/archive` · `POST …/:id/lines/:lineId/archive` |
| BIND | `POST …/periods/:periodId/bind-sheet-template` · create period optional `paySheetTemplateId` |
| PACK (unchanged) | `/api/hrm/payroll/salary-templates*` |

---

## 5. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=pay-sheet-template.service.spec --testPathPatterns=payroll.controller.spec --no-coverage --runInBand
→ Test Suites: 2 passed · Tests: 21 passed
```

Covered: ensureSchema · scope_parity main↔holding · duplicate code/line · unknown component · OV-C bind · archive hide · snapshot immutability · 412 inactive template · controller wiring.

---

## 6. Honesty / residual

| Item | Status |
|------|--------|
| `payroll_e2e_ready` | **false** |
| PROCESS SRC full fidelity | Staged (formula EVAL + period-input) — not claimed |
| Require-mẫu on process | Optional policy not forced (default off) — VAL-05 when product policy flips |
| Browser UF | After FE Settings mẫu |

---

## 7. completion_report

### Closed

1. **ensureSchema** ADD `pay_sheet_templates` + `pay_sheet_template_lines` + period snapshot cols.  
2. Nest CRUD **F-PAY-SHEET-TPL-*** under `/pay-sheet-templates*` with soft-delete `archived_at`.  
3. **OV-C:** soft assert `formula_override_definition_id` in company/rollup; jsonb allowed on save (preview); definition_id preferred.  
4. **scope_parity** list↔get via `expandPayrollPeriodCompanyIds` + `assertResourceInHrmScope`.  
5. Period **bind** + create optional `paySheetTemplateId` → immutable snapshot; refuse after process.  
6. Pack `salary_templates` **unchanged** (enroll-only).  
7. Jest 12 service + controller regression PASS · U65 no seed.

### Residual

| ID | Item | Owner |
|----|------|-------|
| R-PAY-TPL-QA-L1 | L1 smoke list/create/lines/archive (+ optional bind) on live stack | **qa** |
| R-PAY-TPL-FE | Settings mẫu GĐ1 form | **dev-fe** after L1 |
| R-PAY-SRC-PROCESS | PROCESS SRC resolver + FORMULA-412 jsonb-only gate | formula/process wave |
| Honesty | Module UAT | deny ready flip |

### Explicit non-claims

- No LIVE payroll e2e / AMIS parity DONE.  
- No merge pack into mẫu.  
- No invent evaluator AST.

---

## 8. next_owner / next_dispatch_prompt

**next_owner:** **qa** L1 smoke

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P0
depends_on: PO-HRM-AMIS-PARITY-PAY-TPL-BE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; browser-optional for L1 API
exit_criteria: L1 smoke PASS — GET/POST/PATCH pay-sheet-templates; PUT lines; ARCHIVE hide; bind draft period snapshot; scope_parity main↔holding; pack salary-templates regression smoke unchanged
cấm: seed UF; claim payroll_e2e_ready; treat pack as mẫu
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-01.md
honesty: payroll_e2e_ready=false
```

---

## 9. Handoff fields

| Field | Value |
|-------|--------|
| **completion_report** | §7 |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | §8 |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-be-01.md` |
| **ack_status** | `READY_FOR_QA` |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-PAY-TPL-QA-01` L1 smoke |
