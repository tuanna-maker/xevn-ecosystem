# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BE-02` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01` |
| **Date** | 2026-08-07 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `payroll_e2e_ready=false` · no UAT flip |

---

## 1. Defects closed (vs QA-01 FAIL)

| ID | Fix |
|----|-----|
| **D-PAY-CAT-QA-02** | `pnpm --filter hrm-api build` **exit 0** (source already clean on this branch; re-verified after BE-02 delta) |
| **D-PAY-CAT-QA-01** | Restarted `hrm-api` `:28001` from **fresh dist**; live GET list + GET-by-id return `formula_sot=deprecated` |
| **D-PAY-CAT-QA-03** | Open-catalog bootstrap `ensureStarterPayTypes` when picker empty → `pay_types` total **≥ 1** (live **3**: `luong`, `thue`, `cham_cong`) |

---

## 2. Code delta (BE-02)

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/payroll/payroll-catalog.constants.ts` | ADD `PAY_TYPES_STARTER_ROWS` (open catalog — not closed enum) |
| `apps/api/hrm-api/src/payroll/payroll-catalog.service.ts` | ADD `ensureStarterPayTypes`; call on `listSalaryComponents` before starters |
| `apps/api/hrm-api/src/payroll/payroll-catalog.service.spec.ts` | +2 tests (empty → append; non-empty → skip) |

**Alternate UF path (U65, no seed script):** Settings → Danh mục nghiệp vụ → `POST /api/hrm/settings-catalogs/items` with `category_key=pay_types` (`item_key`/`item_name`) — FE already links *«Mở Cài đặt → Danh mục nghiệp vụ (pay_types)»*.

---

## 3. Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/payroll/payroll-catalog.service.spec.ts --no-cache
# Test Suites: 1 passed · Tests: 15 passed

pnpm --filter hrm-api build
# nest build + verify-dist PASS

# restart :28001
pnpm --filter hrm-api run start:prod
```

### Live probes (`ceo@xe.vn` group scope JWT · `company_id=main`)

| Check | Result |
|-------|--------|
| L0 `GET /api/hrm` | **200** |
| `GET /payroll/salary-components?company_id=main` | **200** · `formula_sot=deprecated` · rows include holding |
| `GET /payroll/salary-components/:id?company_id=main` | **200** · same id · `formula_sot=deprecated` |
| `GET /settings-catalogs/pay_types/items?company_id=main` | **200** · **total=3** (`cham_cong`,`luong`,`thue`) |
| `GET /payroll/formulas?company_id=main` | **200** (published formula list) |
| `GET /payroll/pay-formulas?...` | **404** — route name is **`/payroll/formulas`** (QA note) |
| `payroll_e2e_ready` | **false** (unchanged) |

Sample list/detail fields present: `formula_sot`, `formula_legacy_hint`, `default_formula_definition_id`.

---

## 4. FE Settings create path (document)

1. Login `ceo@xe.vn` / `Xevn@2026`
2. **Cài đặt** → Danh mục nghiệp vụ → catalog **pay_types** (aliases: component_types / pay_natures)
3. Thêm mục → `POST /api/hrm/settings-catalogs/items` (`category_key=pay_types`, `item_key`, `item_name`, `company_id` partition main→holding)
4. Or rely on payroll tab list load → BE open-catalog bootstrap when total=0
5. Return **Lương → Thành phần lương** → picker has codes → UF create `CUSTOM_TP_09`

---

## 5. completion_report

**Closed:** Nest build green; `:28001` redeployed with PAY-CATALOG deepen; GET-by-id scope parity live; `formula_sot=deprecated` live; pay_types path ≥1 via open-catalog bootstrap + documented Settings items UF.

**Residual:** Browser UF create/F5/DELETE still for **QA retest**; draft formula FK 422 uses `/payroll/formulas` (not `pay-formulas`); `payroll_e2e_ready=false`.

---

## 6. Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-02.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-01
priority: P0

entry_criteria:
- BE-02 READY: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-02.md
- L0 hrm-api :28001 up with fresh dist (formula_sot + GET-by-id live)
- U65 browser-only · zero-seed · account ceo@xe.vn / Xevn@2026 · company_id=main

read_first:
- docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-02.md
- docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-01.md
- docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-API-01.md

exit_criteria:
- UF: /hr/payroll → Thành phần lương → + Thêm → CUSTOM_TP_09 + chọn pay_types (luong/thue/cham_cong) → Lưu 2xx → FE row → F5 còn
- GET list row formula_sot=deprecated; list id → GET by id 200 same scope
- DELETE soft-archive; include_archived=true still sees row
- Bind draft formula: use GET/POST /api/hrm/payroll/formulas (NOT pay-formulas) — expect 422 HRM-PAY-COMP-FORMULA-412 if draft FK
- pay_types/items total ≥ 1 (bootstrap or Settings path)
- evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-qa-01.md (retest supersede)
- ack_status PASS_TO_PM or FAIL with defect IDs

cấm: seed · API-only UF 🟢 · flip payroll_e2e_ready
honesty: payroll_e2e_ready=false
```
