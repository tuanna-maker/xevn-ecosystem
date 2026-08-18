# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **Date** | 2026-08-07 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `payroll_e2e_ready=false` · no UAT flip · no Phase1 DONE |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **ADR** | `docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md` · Option B · L1 open catalog · L6 soft-delete |
| **TechSpec** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md` §4 PAY row |
| **BA** | `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` §2.2 |
| **SA** | `docs/qa/evidence/po-hrm-dynamic-config-platform-sa-01.md` |
| **API deepen** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §6 F-PAY-COMP-CATALOG-01 |

---

## 2. completion_report

**Closed (BE):**

- `salary_components` schema EXPAND: `default_formula_definition_id`, `archived_at`, `is_system`
- Migration: `apps/api/hrm-api/migrations/20260807_salary_components_platform_catalog.sql`
- CRUD deepen: `GET|POST|PATCH|DELETE /api/hrm/payroll/salary-components` + **new** `GET /salary-components/:id`
- FK bind: `default_formula_definition_id` → `pay_formula_definitions` with `status=active` + `archived_at IS NULL` (`HRM-PAY-COMP-FORMULA-412` if not published)
- Deprecate `formula` TEXT as runtime SoT — responses include `formula_sot: 'deprecated'`, `formula_legacy_hint`
- Soft-delete retire (UPDATE `archived_at`, `is_active=false`) — **no** hard DELETE
- Scope parity: `expandPayrollPeriodCompanyIds` + list↔get↔mutate same resolver (main↔holding)
- Starter system rows: `PAY_SALARY_COMPONENT_STARTER_ROWS` upsert on list (LUONG_CO_BAN, THUE_TNCN_HT, SO_NGAY_NGHI_BU) — bootstrap only, not closed enum
- Open catalog: code format validation only (`HRM-PAY-COMP-CODE-INVALID`); N+1 custom code **2xx** when format valid
- DTOs: `dto/salary-component.dto.ts` · constants `payroll-catalog.constants.ts`
- Pay sheet template component assert excludes archived catalog rows

**Residual (not this wave):**

- FE picker bind `default_formula_definition_id` (dev-fe PAY-CFG / catalog wave)
- SRC priority chain evaluate at process (PAY-SRC-BE)
- `payroll_e2e_ready` remains **false**
- SA API F.1 DOC-DELTA parallel seat `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01`

---

## 3. Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/payroll-catalog.service.spec.ts src/payroll/payroll.controller.spec.ts --no-cache
# Test Suites: 2 passed · Tests: 20 passed
```

| Check | Result |
|-------|--------|
| ensureSchema columns | PASS |
| scope_parity list↔get main→holding | PASS |
| member CEO 404 holding | PASS |
| FK requires active published formula | PASS |
| soft-delete (no DELETE SQL) | PASS |
| open catalog N+1 code | PASS |
| formula not engine SoT | PASS (`formula_sot: deprecated`) |
| starter rows ensure | PASS |

---

## 4. API surface (Nest live)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/hrm/payroll/salary-components?company_id=` | `include_archived`, `active_only` query |
| GET | `/api/hrm/payroll/salary-components/:id?company_id=` | **NEW** scope_parity get-by-id |
| POST | `/api/hrm/payroll/salary-components` | DTO + optional `default_formula_definition_id` |
| PATCH | `/api/hrm/payroll/salary-components/:id?company_id=` | FK bind / legacy formula hint |
| DELETE | `/api/hrm/payroll/salary-components/:id?company_id=` | Soft archive |

---

## 5. Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01

read_first:
- docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §6 F-PAY-COMP-CATALOG-01
- docs/qa/evidence/po-hrm-amis-parity-ba-01.md §2.2 AC-PAY-COMP-01

entry_criteria: L0 stack up; hrm-api :28001; browser-only U65; account ceo@xe.vn / Xevn@2026
exit_criteria:
- UF browser: Lương → Thành phần lương → Tạo mã thứ 9 (CUSTOM_TP_09) → Lưu 2xx → F5 row còn
- Bind default_formula_definition_id chỉ khi đã publish formula active (expect 422 nếu draft)
- DELETE → row ẩn khỏi list; include_archived=true vẫn thấy archived
- GET list id → GET by id same scope (main persona finds holding row)
- Network: không dùng salary_components.formula làm engine; response có formula_sot=deprecated
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qa-01.md
- ack_status: PASS_TO_PM hoặc FAIL với defect + J-* if applicable

cấm: seed · API-only UF 🟢 · flip payroll_e2e_ready · claim module UAT-ready
honesty: payroll_e2e_ready=false
```
