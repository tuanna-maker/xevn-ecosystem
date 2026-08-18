# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01` **FAIL_GAP** `EMPCFCNSGAP-MSJCUBJB` · BA-01 CONFIRMED · SA-01 Option **A** LOCKED |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **ADD** (F-EMP-CF-CNS-01 only) |
| **U65** | zero-seed · no invent density |
| **Retain** | MergeToken EMP EXT **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — **cấm reopen** · ATT / SI / CTR / DOC/ET **SEAL RETAIN** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · **`C-SLICE-≠-MODULE`** |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs / BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md` · **AC-PLT-EMP-CUSTOM-01c/01d/01e** · **VAL-EMP-CF-CNS-01/02/03/06** · BR-PLT-EMP-CF-03/04 |
| **tech_spec / SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-SA-01.md` Option **A** · **L-EMP-CF-05/06** · **F-EMP-CF-CNS-01** |
| **db_design** | ba-data **HOLD** — SoT = LIVE `hrm_catalog_extension_items` allow-list · **FORBIDDEN** Nest `emp_custom_field` |
| **api_design** | F-EMP-CF-CNS-01 on Employees create/update `custom_fields` · error **`HRM-EMP-CUSTOM-FIELD-KEY`** |
| **gap** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.md` stamp **`EMPCFCNSGAP-MSJCUBJB`** |
| **must_keep** | F-EMP-TOK-03 / Settings extension-items admin CREATE / EXT-04c value≠register |

---

## 2. Implementation summary

| Item | Detail |
|------|--------|
| **Helper** | `apps/api/hrm-api/src/employees/emp-custom-field-consumer-assert.ts` |
| **Wire** | `employees.service.ts` `createEmployee` + `updateEmployee` (after ESS merge; history retain via `previousCustomFields`) |
| **EFF SoT** | Active (`status=active`) rows on EMP allow-list catalogs (`hrm_employee_{basic\|personal\|work\|finance}_fields` + aliases) |
| **Scope** | `resolveHrmListScope` + `expandHrmTextCompanyIds` + `resolveHrmSettingsCatalogCompanyId` + group `main`/`holding` (U19) |
| **EFF=0** | Invent assert **skip** (AC-01d) |
| **EFF>0 invent** | New non-builtin extension key ∉ EFF → **422** `HRM-EMP-CUSTOM-FIELD-KEY` · **no persist** |
| **Soft-retire** | `status≠active` excluded from EFF → retired invent KEY (CNS-03); history key re-save retained |
| **No register** | Assert path never touches `hrm_merge_tokens` (EXT-04c) |
| **No Nest field-def** | No `emp_custom_field` table/service |
| **CODE-MEMORY** | APPEND on assert helper + `employees.service.ts` |

---

## 3. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns="emp-custom-field-consumer-assert|employees.service.spec" --no-coverage
Test Suites: 2 passed, 2 total
Tests:       43 passed, 43 total
```

| VAL | Result |
|-----|--------|
| **VAL-EMP-CF-CNS-01** | invent → `HRM-EMP-CUSTOM-FIELD-KEY` · service path no UPDATE |
| **VAL-EMP-CF-CNS-02** | empty EFF skip |
| **VAL-EMP-CF-CNS-03** | retired draft → KEY; history retain OK |
| **VAL-EMP-CF-CNS-06** | group vs member tenant isolation (scope_parity) |
| **EXT-04c must_keep** | no `hrm_merge_tokens` SQL in assert |
| **employees.service.spec** | regression PASS (EFF=0 soft / builtin early-exit) |

---

## 4. Honesty / seals / non-claims

| Lock | Status |
|------|--------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| MergeToken EMP EXT `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — not reopened |
| Nest `emp_custom_field` / mega-EAV | **DENIED** |
| Module EMP UAT / Phase1 / UF 🟢 | **DENIED** |
| Seed | **none** |
| `C-SLICE-≠-MODULE` | retained |

---

## 5. completion_report

**Closed:** F-EMP-CF-CNS-01 narrow — Employees create/update invent gate against Settings EMP extension EFF. EFF>0 unknown extension code → **`HRM-EMP-CUSTOM-FIELD-KEY`** (no persist). EFF=0 soft skip. Soft-retire align (draft excluded + history retain). must_keep F-EMP-TOK-03 / admin CREATE / EXT-04c. Jest VAL-EMP-CF-CNS-01/02/03/06 + employees.service regression **43 PASS**. Honesty false · C-SLICE · zero-seed · no Nest field-def · no EXT reopen.

**Residual:** QA L1 retest VAL-EMP-CF-CNS-01 against live stack (cite GAP stamp). FE empty-CTA **R-EMP-CF-FE-01** P2 hold. ba-data HOLD.

---

## 6. next_owner / next_dispatch_prompt

**next_owner:** **qa**

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01 READY_FOR_QA

## entry_criteria
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-be-01.md
- Cite GAP stamp EMPCFCNSGAP-MSJCUBJB closed by BE
- Retain: MERGE-TOKEN-EMP-EXT EMPTOKEXTQA-MSJ57PE1 — cấm reopen EXT suite
- U65 zero-seed · honesty false · C-SLICE-≠-MODULE

## task
Retest VAL-EMP-CF-CNS-01 (L1 + FE spot if surface):
1) EFF>0 (live allow-list) → PATCH/create invent extension code → expect 4xx HRM-EMP-CUSTOM-FIELD-KEY · no invent persist after F5
2) Spot VAL-EMP-CF-CNS-02 empty skip only if EFF can be observed empty without seed
3) Cite EXT-04c retain (value≠register) — do not reopen EXT suite
4) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md · PASS_TO_PM or FAIL

## cấm
seed · reopen EXT BE · Nest emp_custom_field · flip personnel · module EMP UAT · Phase1 DONE · UF 🟢 from probe alone without FE path when claiming browser UF

## exit
ack_status PASS_TO_PM | FAIL_TO_PM + completion_report + next_dispatch_prompt
```

**ack_status:** **READY_FOR_QA**
