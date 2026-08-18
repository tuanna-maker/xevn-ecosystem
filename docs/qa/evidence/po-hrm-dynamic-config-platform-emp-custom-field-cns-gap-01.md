# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · **L1 phụ gap triage** (≠ UF 🟢) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01` **CONFIRMED** · SA-01 Option **A** LOCKED |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` · employees assert `holding` |
| **Stamp** | **`EMPCFCNSGAP-MSJCUBJB`** |
| **GAP verdict** | **`FAIL_GAP`** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no invent density · L1 probe only — **DENIED** claim UF 🟢 / module EMP UAT / Phase1 |
| **Retain** | MergeToken EMP EXT QC **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — **cấm reopen** · ATT worksite · ATT-LEAVE · SI · CTR · enrollment · DOC/ET **SEAL RETAIN** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · **`C-SLICE-≠-MODULE`** |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.json` |
| BA pack | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md` |
| BA evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-ba-01.md` |
| EXT seal cite | `EMPTOKEXTQA-MSJ57PE1` — **not reopened** |

**Seed:** none. **Flip honesty / module EMP UAT / Phase1 / Nest field-def:** none. **Reopen EXT/ATT/SI/CTR:** none.

---

## 2. Source / dist gate (KEY presence)

| Artifact | `HRM-EMP-CUSTOM-FIELD-KEY` | Verdict |
|----------|----------------------------|---------|
| `apps/api/hrm-api/src/employees/employees.service.ts` | **ABSENT** | FAIL_GAP signal |
| `apps/api/hrm-api/dist/employees/**` (sample `.js`) | **ABSENT** | FAIL_GAP signal |
| Nest `emp_custom_field` table / service | **ABSENT** (Option A OK — **DENIED** invent) | RETAIN |

---

## 3. VAL-EMP-CF-CNS-01 probe (L1)

### 3.1 EFF baseline (allow-list picker items)

| Catalog | company | HTTP | active_count (sample) |
|---------|---------|------|------------------------|
| `hrm_employee_basic_fields` | `main` | **200** `HRM-SET-200` | **6** (`basic_01`… + extension-like codes) |
| `hrm_employee_personal_fields` | `main` | **200** | **4** |
| `hrm_employee_work_fields` | `main` | **200** | **0** |
| `hrm_employee_finance_fields` | `main` | **200** | **0** |

**EFF aggregate unique codes ≈ 10 → EFF>0** — invent assert **required** (AC-PLT-EMP-CUSTOM-01c · BR-PLT-EMP-CF-03).  
Admin CREATE **not** used (live EFF already >0).

### 3.2 Consumer invent

```text
Login ceo@xe.vn → GET /api/hrm/employees?company_id=holding&page_size=5
  → employee id=0500220b-f289-40df-b07e-86316285439b code=UAT-0100
PATCH /api/hrm/employees/{id}
  body.custom_fields += { "zz_invent_emp_cf_msjcubjb": "invent-gap-msjcubjb" }
  x-company-id=holding
```

| Expect (BA) | Actual | Verdict |
|-------------|--------|---------|
| **4xx** `HRM-EMP-CUSTOM-FIELD-KEY` · no invent accept | **200** `HRM-EMP-202` «Employee updated» | **FAIL_GAP** |
| Persist invent denied | Probe GET unwrap did not surface invent key (`persisted=false`); response body truncated in JSON — **2xx invent alone is enough FAIL** | FAIL |
| Cleanup | PATCH restore without invent → **200** `HRM-EMP-202` | hygiene OK |

**Aligned with sealed EXT AC-04c cite:** prior EXT QA already showed value PATCH invent codes → **200** (no token register) — this seat proves the **missing consumer KEY assert** against EFF, not reopen EXT.

### 3.3 VAL stamp

| ID | Expect | Actual | Verdict |
|----|--------|--------|---------|
| **VAL-EMP-CF-CNS-01** | EFF>0 invent → 4xx `HRM-EMP-CUSTOM-FIELD-KEY` | **200** `HRM-EMP-202` · KEY absent in src/dist | **FAIL_GAP** |
| **VAL-EMP-CF-CNS-02** | Empty EFF skip + CTA | Not forced (EFF=10); FE spot only | SPOT / defer |
| **VAL-EMP-CF-CNS-04/05** | EXT-04b/04c | **RETAIN** cite `EMPTOKEXTQA-MSJ57PE1` — **not retested as suite** | RETAIN |

---

## 4. FE spot (empty EFF CTA + picker bind)

| Check | Result |
|-------|--------|
| `EmployeeFormDialog.tsx` exists | yes |
| Binds Settings MD EMP field catalogs (`hrm_employee_basic_fields` + aliases) | **yes** — `findCatalog` / `buildDynamicFields` |
| Dynamic extension fields render from catalog | **yes** |
| `emptyHint` / `CatalogSearchPicker` | **yes** — dept/position class (not extension invent KEY) |
| Client invent KEY assert | **no** |
| Nest `emp_custom_field` /effective | **no** — Option A Settings SoT OK |

**Residual P2 `R-EMP-CF-FE-01`:** deepen empty-EFF CTA / picker bind for extension defs **after** BE CNS — **do not invent FE without PM**. Not a UF 🟢 claim.

---

## 5. Honesty / seals / non-claims

| Lock | Status |
|------|--------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| MergeToken EMP EXT · `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** — **cấm reopen** |
| ATT worksite · ATT-LEAVE · SI · CTR · enrollment · DOC/ET | **SEAL RETAIN** |
| Nest `emp_custom_field` / mega-EAV | **DENIED** |
| Module EMP UAT / Phase1 / UF 🟢 from probe | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| Seed | **none** |

---

## 6. Defect / residual register

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| **R-EMP-CF-CNS-01** | **P1** | **dev-be** | EFF>0 invent accepted **200** — missing **F-EMP-CF-CNS-01** `HRM-EMP-CUSTOM-FIELD-KEY` · unlock **EMP-CUSTOM-FIELD-BE-01** only · **must_keep F-EMP-TOK-03** · **cấm reopen EXT BE** · **cấm Nest emp_custom_field** |
| **R-EMP-CF-FE-01** | P2 | dev-fe (after BE / PM) | Empty EFF CTA + extension picker deepen — note only; no FE invent this seat |

---

## 7. completion_report

**Closed:** L1 gap probe VAL-EMP-CF-CNS-01 for EMP custom-field Option A after BA CONFIRMED. Stamp **`EMPCFCNSGAP-MSJCUBJB`**. L0 PASS. EFF allow-list ≈10 (>0). Employee invent extension code `zz_invent_emp_cf_msjcubjb` → **200 HRM-EMP-202** (not 4xx `HRM-EMP-CUSTOM-FIELD-KEY`). Src/dist employees lack KEY. **GAP verdict = FAIL_GAP** → unlock BE CNS only. FE spot: Settings MD dynamic bind present; no client KEY; empty CTA = CatalogSearchPicker-class. EXT seal **`EMPTOKEXTQA-MSJ57PE1` RETAIN**. Honesty false · C-SLICE-≠-MODULE · zero-seed · **DENIED** UF 🟢 / module EMP UAT / Phase1 / Nest field-def / reopen peers.

**Residual:** **R-EMP-CF-CNS-01** P1 → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01` (F-EMP-CF-CNS-* only). **R-EMP-CF-FE-01** P2 hold until after BE.

**Forbidden claims:** PASS_NO_GAP · UF 🟢 · reopen EXT · Nest `emp_custom_field` · personnel flip · Phase1 DONE.

---

## 8. next_owner / next_dispatch_prompt

**next_owner:** **pm** → **`dev-be`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-CNS-GAP-01 FAIL_GAP stamp EMPCFCNSGAP-MSJCUBJB · BA-01 CONFIRMED · SA-01 Option A LOCKED

## entry_criteria
- Read: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BA-01.md (AC-PLT-EMP-CUSTOM-01c · VAL-EMP-CF-CNS-01)
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.md
- Retain: MERGE-TOKEN-EMP-EXT EMPTOKEXTQA-MSJ57PE1 — cấm reopen EXT suite / F-EMP-TOK-03 wipe
- Honesty false · C-SLICE-≠-MODULE · U65 zero-seed · ba-data HOLD

## task
Implement F-EMP-CF-CNS-01 only (narrow):
1) When EFF active EMP extension defs >0, Employees create/update: unknown extension code in custom_fields → 4xx HRM-EMP-CUSTOM-FIELD-KEY · no persist invent
2) EFF=0 → invent assert skip (AC-01d) · soft-retire align CNS-03 if cheap
3) must_keep: F-EMP-TOK-03 / Settings extension-items admin CREATE / EXT-04c value≠register
4) jest VAL-EMP-CF-CNS-01 (+02/03/06 if touched) · scope_parity retain
5) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-be-01.md · READY_FOR_QA

## cấm
reopen EXT BE suite · Nest emp_custom_field / mega-EAV · seed · flip personnel · ATT/SI/CTR reopen · module EMP UAT · Phase1 DONE · widen ESS catalog

## exit
READY_FOR_QA + completion_report + next_dispatch_prompt (qa retest VAL-EMP-CF-CNS-01)
```

---

## 9. evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-cns-gap-01.json` |
| **gap_verdict** | **FAIL_GAP** |
| **ack_status** | **PASS_TO_PM** |
