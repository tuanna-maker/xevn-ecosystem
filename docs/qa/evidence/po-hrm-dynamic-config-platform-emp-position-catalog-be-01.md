# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `EMP-POSITION-CATALOG-QA-01` **FAIL_TO_PM** · residual **R-PLT-EMP-POS-BE-01** |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **FIX** (GAP-only · Option A) |
| **U65** | zero-seed · no invent density |
| **Retain** | EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR · **HRM-CON-POS-KEY** peers |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · **`C-SLICE-≠-MODULE`** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs / BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BA-01.md` · **AC-PLT-EMP-01b** · **AC-PLT-EMP-01c** · VAL-EMP-POS-CNS-03 · BR-PLT-EMP-POS-02 |
| **tech_spec / SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-SA-01.md` Option **A** LOCK · **L-EMP-POS-01/04** · **F-EMP-POS-CNS-02** |
| **db_design** | ba-data **HOLD** — SoT = Settings/XBOS **`job_titles`** EFF · **FORBIDDEN** Nest `emp_position` |
| **api_design** | PATCH/POST employees `job_title_key` ∈ EFF when count>0 → **`HRM-EMP-POSITION-KEY`** (≡ **`HRM-WH-PICK-REQUIRED`** class) |
| **qa_fail** | invent free-text `job_title_key` → **200** because `EmployeesModule` lacked `SettingsCatalogsService` DI · `@Optional()` no-op |

---

## 2. Root cause (R-PLT-EMP-POS-BE-01)

| Layer | Fact |
|-------|------|
| Code path | `EmployeesService.assertJobTitleKeyInCatalog` early-returns when `!this.settingsCatalogs` |
| DI | `SettingsCatalogsService` lived only in **AppModule** providers; **EmployeesModule** is a child feature module → constructor `@Optional()` injection = **undefined** at runtime |
| Unit mask | `employees.service.spec` constructs `new EmployeesService(db)` **without** catalogs → invent soft-pass in unit; LIVE Nest had same gap |

---

## 3. Implementation summary

| Item | Detail |
|------|--------|
| **ADD** | `settings-catalogs.module.ts` — `@Global()` exports `SettingsCatalogsService` + `CatalogSyncService` + bridge · imports `CoreModule` |
| **Wire** | `EmployeesModule.imports = [SettingsCatalogsModule]` |
| **AppModule** | imports `SettingsCatalogsModule`; removes duplicate catalog/sync providers (controllers retained) |
| **Assert** | `assertJobTitleKeyInCatalog` → **`HRM-EMP-POSITION-KEY`** when EFF active **>0**; **EFF=0 soft skip** (AC-01c · no seed) |
| **Alias** | Export `HRM_EMP_POSITION_KEY_WH_ALIAS = 'HRM-WH-PICK-REQUIRED'` (BA ≡ class · WH retain) |
| **Update parity** | `updateEmployee` passes `scopeContext` into assert (tenantId) |
| **No Nest** | **No** `emp_position` table/service |
| **CODE-MEMORY** | APPEND on `employees.service.ts` · `employees.module.ts` · new module file |

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employees-module-settings-catalogs-wiring|app.module.spec|employees.service.spec" --no-coverage
Test Suites: 3 passed, 3 total
Tests:       43 passed, 43 total

pnpm --filter hrm-api exec jest --testPathPatterns="employees-module-settings-catalogs-wiring" --no-coverage
Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

| Check | Result |
|-------|--------|
| **Wiring** | `EmployeesModule` metadata contains `SettingsCatalogsModule`; compiled DI injects `SettingsCatalogsService` into `EmployeesService` |
| **VAL-EMP-POS-CNS-03 invent PATCH** | EFF>0 invent → **`HRM-EMP-POSITION-KEY`** · **no** `UPDATE public.employees` |
| **VAL invent CREATE** | EFF>0 invent → **`HRM-EMP-POSITION-KEY`** |
| **AC-01c EFF=0 soft** | invent assert **skipped** · no seed |
| **app.module.spec** | regression PASS (settings controller still registered) |
| **employees.service.spec** | regression PASS |

---

## 5. Honesty / seals / non-claims

| Lock | Status |
|------|--------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| EMP-STATUS / CUSTOM / EXT / DOC-ET / ATT / SI / CTR | **SEAL RETAIN** |
| Nest `emp_position` / mega-EAV | **DENIED** |
| Module EMP UAT / Phase1 / flip `*_ready` | **DENIED** |
| Seed | **none** |
| Peer `HRM-CON-POS-KEY` (contracts/decisions) | **RETAIN** (AppModule still resolves SettingsCatalogs via Global module) |

---

## 6. QA retest focus (copy-ready)

1. Ensure Settings `job_titles` EFF active **>0** on target company (admin path — not seed for evidence).
2. Login persona with PATCH employees rights.
3. PATCH `/api/hrm/employees/{id}` body `{ "job_title_key": "<invent-free-text-not-in-catalog>" }`.
4. Expect **4xx** with code **`HRM-EMP-POSITION-KEY`** (or documented ≡ **`HRM-WH-PICK-REQUIRED`** class) — **not** 200.
5. F5 / GET employee → invent key **not** persisted.
6. Optional: omit `job_title_key` / EFF=0 soft path still OK · no seed.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Closed R-PLT-EMP-POS-BE-01: SettingsCatalogs DI wired into EmployeesModule; invent `job_title_key` when EFF>0 → **HRM-EMP-POSITION-KEY**; EFF=0 soft skip retained; Option A SoT · no Nest emp_position; jest wiring+invent PASS; honesty flags untouched. |
| **next_owner** | `qa` |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-QA-02
from_role: pm
to_role: qa
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01 READY_FOR_QA
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-be-01.md
  - Read BA AC-PLT-EMP-01b · SA Option A LOCK
  - U65 zero-seed · honesty false · C-SLICE-≠-MODULE
  - RETAIN EMPSTQA-MSK20G7H · EMPCFQA-MSK14LUH · EMPTOKEXTQA-MSJ57PE1 · DOC/ET · ATT/SI/CTR · HRM-CON-POS-KEY
task:
  - LIVE retest: PATCH /employees/{id} invent/free-text job_title_key when EFF job_titles >0
  - Expect 4xx HRM-EMP-POSITION-KEY (≡ HRM-WH-PICK-REQUIRED class) — NOT 200
  - Confirm invent not persisted after F5/GET
  - Spot: create invent same KEY; EFF=0 soft path unchanged; no Nest emp_position
  - Do NOT flip *_ready · no seed · no reopen EMP-STATUS FE HOLD
exit: PASS_TO_PM or FAIL_TO_PM with evidence path
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-position-catalog-qa-02.md
```
