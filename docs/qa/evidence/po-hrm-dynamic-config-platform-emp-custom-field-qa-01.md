# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-QA-01` |
| **from_role** | `qa` |
| **to_role** | `pm` → **`qc`** |
| **lane** | execution · **L1 phụ retest** (≠ UF 🟢) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01` **READY_FOR_QA** · prior GAP **`EMPCFCNSGAP-MSJCUBJB`** |
| **Date** | 2026-08-08 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · header `x-company-id=main` · employees mutate `holding` |
| **Stamp** | **`EMPCFQA-MSK14LUH`** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no invent density · L1 probe only — **DENIED** UF 🟢 / module EMP UAT / Phase1 |
| **Retain** | MergeToken EMP EXT QC **`EMPTOKEXTQA-MSJ57PE1`** · **`R-EMP-TOK-EXT` SEALED** — **cấm reopen** · ATT / SI / CTR / DOC/ET **SEAL RETAIN** |
| **Honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · `contracts_printable_ready=false` **LOCKED** · **`C-SLICE-≠-MODULE`** |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | hrm `:28001` **200** · xbos `:28002` **200** · portal `:5173` **200** (APIs restarted mid-session after transient down) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-qa-01.json` |
| BE evidence | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-be-01.md` |
| GAP closed | `EMPCFCNSGAP-MSJCUBJB` (was invent → **200** `HRM-EMP-202`) |
| EXT seal cite | `EMPTOKEXTQA-MSJ57PE1` — **not reopened** |

**Seed:** none. **Flip honesty / module EMP UAT / Phase1 / Nest field-def:** none. **Reopen EXT/ATT/SI/CTR:** none.

---

## 2. Source / dist gate

| Artifact | Result |
|----------|--------|
| `emp-custom-field-consumer-assert.ts` · `HRM-EMP-CUSTOM-FIELD-KEY` | **PRESENT** |
| `employees.service.ts` wires assert helper | **PRESENT** |
| `dist/employees/emp-custom-field-consumer-assert.js` KEY | **PRESENT** |
| Nest `emp_custom_field` table/service | **ABSENT** (Option A RETAIN) |

---

## 3. VAL-EMP-CF-CNS-01 retest (AC-PLT-EMP-CUSTOM-01c)

### 3.1 EFF baseline

| Signal | Result |
|--------|--------|
| Settings picker allow-list active codes | **11** (MD+ext merge — informational) |
| Runtime invent SoT | DB `hrm_catalog_extension_items` active (BE assert) — **EFF>0** proven by KEY reject |

Admin CREATE **not** required for invent assert (live EFF already >0). Incidental earlier dry-run may have left `hr_emp_cf_msk101up` pending/active in picker — **not** used as seed invent.

### 3.2 Invent unknown extension code

```text
Login ceo@xe.vn → GET /api/hrm/employees?company_id=holding&page_size=5
  → employee id=0500220b-f289-40df-b07e-86316285439b code=UAT-0100
PATCH /api/hrm/employees/{id}
  body.custom_fields += { "zz_invent_emp_cf_msk14luh": "invent-qa01-…" }
  x-company-id=holding
```

| Expect (BA AC-01c) | Actual | Verdict |
|--------------------|--------|---------|
| **4xx** `HRM-EMP-CUSTOM-FIELD-KEY` · no invent accept | **422** `HRM-EMP-CUSTOM-FIELD-KEY` | **PASS** |
| Not **200** `HRM-EMP-202` (GAP) | Not 200 | **PASS** (closes `EMPCFCNSGAP-MSJCUBJB`) |
| No invent persist (list refetch) | `persisted=false` | **PASS** |

### 3.3 Valid code ∈ EFF → 2xx retain

| Step | Result |
|------|--------|
| Code | `pers_01` (live personal-fields allow-list / DB EFF) |
| PATCH `custom_fields.pers_01=qa_retain_*` | **200** `HRM-EMP-202` |
| List refetch persist | **yes** (`pers_01` present) |
| Restore prior `custom_fields` | **200** `HRM-EMP-202` · key removed |

**Verdict:** **PASS**

### 3.4 VAL stamp

| ID | Expect | Actual | Verdict |
|----|--------|--------|---------|
| **VAL-EMP-CF-CNS-01** | EFF>0 invent → 4xx KEY | **422** KEY · no persist | **PASS** |
| **VAL-EMP-CF-CNS-01-VALID** | valid ∈ EFF → 2xx retain | `pers_01` **200** + persist + restore | **PASS** |
| **VAL-EMP-CF-CNS-02** | Empty EFF skip | Not forced (EFF>0) | SPOT / defer |
| **EXT-04c RETAIN** | value≠register · seal | `orphan_value_msj57pe1` still on employee · seal cite only | **RETAIN** |

---

## 4. EXT seal spot (cấm reopen)

| Check | Result |
|-------|--------|
| Seal `EMPTOKEXTQA-MSJ57PE1` | Cited in EXT QC + CNS-GAP + BE evidence |
| EXT suite re-executed | **NO** |
| Employee still has `orphan_value_msj57pe1` | **YES** (value-only EXT cite) |
| F-EMP-TOK-03 / admin CREATE must_keep | Not wiped |

---

## 5. FE spot (optional R-EMP-CF-FE-01 P2)

| Check | Result |
|-------|--------|
| `EmployeeFormDialog.tsx` | yes |
| Binds Settings MD EMP field catalogs | yes |
| Dynamic extension fields from catalog | yes |
| `emptyHint` / `CatalogSearchPicker` | yes (dept/pos class) |
| Client invent KEY assert | **no** |
| Nest `emp_custom_field`/effective | **no** — Option A OK |

**Residual P2 `R-EMP-CF-FE-01` HOLD** — empty-EFF CTA / extension picker deepen after CNS; **do not** invent FE without PM. **DENIED** UF 🟢 from this L1 seat.

---

## 6. Honesty / seals / non-claims

| Lock | Status |
|------|--------|
| `hrm_personnel_uat_ready` | **false** LOCKED |
| `employees_e2e_linkage_ready` | **false** LOCKED |
| `contracts_printable_ready` | **false** LOCKED |
| MergeToken EMP EXT · `EMPTOKEXTQA-MSJ57PE1` | **SEAL RETAIN** |
| ATT / SI / CTR / DOC/ET | **SEAL RETAIN** |
| Nest `emp_custom_field` / mega-EAV | **DENIED** |
| Module EMP UAT / Phase1 / UF 🟢 from L1 alone | **DENIED** |
| `C-SLICE-≠-MODULE` | retained |
| Seed | **none** |

---

## 7. Defect / residual register

| ID | Severity | Owner | Status | Summary |
|----|----------|-------|--------|---------|
| **R-EMP-CF-CNS-01** | P1 | dev-be | **CLOSED** | Invent KEY live — GAP `EMPCFCNSGAP-MSJCUBJB` closed by BE-01 |
| **R-EMP-CF-FE-01** | P2 | dev-fe | **HOLD** | Empty EFF CTA / extension picker deepen — note only |

---

## 8. completion_report

**Closed:** L1 retest VAL-EMP-CF-CNS-01 after BE-01. Stamp **`EMPCFQA-MSK14LUH`**. L0 PASS. Src/dist KEY present. EFF>0 invent `zz_invent_emp_cf_msk14luh` → **422** `HRM-EMP-CUSTOM-FIELD-KEY` (not 200 `HRM-EMP-202`) · no persist — **closes GAP `EMPCFCNSGAP-MSJCUBJB`**. Valid EFF code `pers_01` → **200** `HRM-EMP-202` + list persist + restore. EXT seal **`EMPTOKEXTQA-MSJ57PE1` RETAIN** (orphan value still on employee; suite not reopened). FE spot note **R-EMP-CF-FE-01** P2 HOLD. Honesty false · C-SLICE-≠-MODULE · zero-seed · **DENIED** UF 🟢 / module EMP UAT / Phase1 / Nest field-def / reopen peers.

**Residual:** QC narrow GWC for EMP-CUSTOM-FIELD CNS L1 only. FE P2 hold until PM unlocks.

**Forbidden claims:** UF 🟢 · module EMP UAT · Phase1 DONE · personnel flip · reopen EXT/ATT/SI/CTR.

---

## 9. next_owner / next_dispatch_prompt

**next_owner:** **qc**

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-QA-01 PASS_TO_PM stamp EMPCFQA-MSK14LUH

## entry_criteria
- Read: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md
- Cite GAP closed: EMPCFCNSGAP-MSJCUBJB → invent 422 HRM-EMP-CUSTOM-FIELD-KEY
- Retain: MERGE-TOKEN-EMP-EXT EMPTOKEXTQA-MSJ57PE1 — cấm reopen EXT
- Honesty false · C-SLICE-≠-MODULE · U65 · DENY UF 🟢 / module EMP UAT

## task
Narrow QC GWC on EMP custom-field CNS L1 only:
1) Audit VAL-EMP-CF-CNS-01 invent KEY + valid pers_01 2xx retain evidence
2) Confirm EXT seal not reopened · Nest emp_custom_field absent · honesty locks
3) Condition: R-EMP-CF-FE-01 P2 HOLD (empty CTA) — no FE invent required for this GWC
4) Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qc-01.md

## cấm
seed · flip personnel · reopen EXT/ATT/SI/CTR · Nest emp_custom_field · module EMP UAT · Phase1 DONE · claim UF 🟢 from L1 alone

## exit
GO | GO WITH CONDITIONS | NO-GO + completion_report + next_dispatch_prompt
```

---

## 10. evidence_path / ack_status

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-emp-custom-field-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-emp-custom-field-qa-01.json` |
| **stamp** | **`EMPCFQA-MSK14LUH`** |
| **overall** | **PASS** |
| **ack_status** | **PASS_TO_PM** |
