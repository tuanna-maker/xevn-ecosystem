# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-03

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-03` |
| **prior** | QA-02-R2 **PASS** · residual **OBS-PLT-SI-INS-EMPTY-DATE** P2 |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** (narrow — empty-date 4xx) |
| **date** | 2026-08-08 |
| **change_mode** | **FIX** — empty `start_date`/`end_date` `""` → **400 `HRM-VAL-001`** (not 500 SYS) |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **DENIED** SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 zero-seed |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| QA-02-R2 | §5 **OBS-PLT-SI-INS-EMPTY-DATE** — blank `""` → 500 `HRM-SYS-001` `invalid input syntax for type date: ""` |
| BA-01 | AC-PLT-SI-INS-01-ENROLLMENT · AC-PLT-SI-INS-01b invent KEY |
| BE-02 | DTO-ISIN open `type` **RETAIN** |
| EMP-BE-02 | ONE enrollment SoT · F-CORE-SI-03 **RETAIN** |

**Defect class:** Default dialog Lưu with ViDateField empty posts `start_date`/`end_date` = `""`. `@IsOptional()` + `@IsString()` accepted blank → `$n::date` → PG 500 (masked earlier by VAL-001 closed IsIn).

---

## 2. Deliverable (allowed_paths only)

| Path | Change |
|------|--------|
| `dto/create-employee-insurance.dto.ts` | `start_date`/`end_date` → `@IsDateString()` + CODE-MEMORY-CHANGE BE-03 |
| `dto/update-employee-insurance.dto.ts` | Same + CODE-MEMORY-CHANGE BE-03 |
| `employee-insurances.service.ts` | `optionalEnrollmentDate` — `""`/invalid → **400 `HRM-VAL-001`** before INSERT/UPDATE |
| `employee-insurances.service.spec.ts` | DTO empty fail · create/update empty → `HRM-VAL-001` · invent KEY + F-CORE-SI-03 retain |

**Untouched:** enrollment schema · type open KEY assert · CTR legal-print · seed · L1 seal wording · broad rewrite.

---

## 3. Behavior stamps

| Case | Expected | Implementation |
|------|----------|----------------|
| `start_date`/`end_date` = `""` (DTO) | class-validator **≥1 error** | `@IsDateString()` |
| create with `""` (service) | **400 `HRM-VAL-001`** · no INSERT | `optionalEnrollmentDate` |
| update with `end_date: ""` | **400 `HRM-VAL-001`** · no UPDATE | same |
| omit / null dates | still allowed → SQL null | `raw == null` → null |
| invent type when EFF>0 | **400 `HRM-INS-TYPE-KEY`** | RETAIN BE-02 |
| Open key ∈ EFF + valid ISO dates | create 2xx | RETAIN |

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=employee-insurances.service.spec \
  --testPathPatterns=po-hrm-e2e-link-emp-be-02 --no-coverage
→ Test Suites: 2 passed · Tests: 16 passed
```

New coverage: DTO empty `""` fail · DTO valid ISO pass · create empty → `HRM-VAL-001` · update empty → `HRM-VAL-001`. Retain: open type · invent KEY · F-CORE-SI-03 close · EMP-BE-02 bridge suite.

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** — DENIED flip |
| `hrm_personnel_uat_ready` | **false** — DENIED flip |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 ONE SoT | **SEAL RETAIN** |
| DTO-ISIN open type / invent KEY | **RETAIN** |
| L1 QA-01 `SIINSQA-MSJA2Z7H` · QC-01 GWC L1 | **RETAIN** — not reopened |
| Module SI / CTR UAT | **DENIED** |
| Seed | **none** |

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-03.md` |
| **next_owner** | **qa** (narrow spot — empty-date 4xx; may absorb into QC-02 Condition close) |
| **completion_report** | See §7 |
| **next_dispatch_prompt** | See §8 |

---

## 7. completion_report

**Closed:** OBS-PLT-SI-INS-EMPTY-DATE — Create/Update enrollment empty string dates `""` now fail **DTO `@IsDateString`** and service **`optionalEnrollmentDate` → 400 `HRM-VAL-001`** before PG `::date` (no more 500 `HRM-SYS-001`). Jest 16 PASS. Retained: DTO-ISIN open type · invent `HRM-INS-TYPE-KEY` · ONE SoT · F-CORE-SI-03 · L1/CTR seals · honesty false · U65 zero-seed. No schema rewrite · no ready flip · no module UAT claim.

**Residual:** FE may still send `""` from blank ViDateField — now deterministic 4xx (UX toast = FE optional polish). QC Condition may close OBS without reopen L1.

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-03
from_role: pm
to_role: qa
lane: execution
priority: P2
program: PO-HRM-CONTINUOUS-W8-20260807
prior: SI-INS-CATALOG-BE-03 READY_FOR_QA · OBS-PLT-SI-INS-EMPTY-DATE fix
retain: DTO-ISIN · invent KEY · L1 SIINSQA-MSJA2Z7H · QC-01 GWC L1 · CTR · EMP-BE-02 ONE SoT

entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-03.md
  - U65 zero-seed · honesty printable/personnel=false · C-SLICE-≠-MODULE

task (narrow spot):
  - Browser or API: POST /employee-insurances with start_date="" and/or end_date="" → 400 HRM-VAL-001 (not 500 HRM-SYS-001)
  - Retain smoke: open key ∈ EFF + valid dates → 201; invent → HRM-INS-TYPE-KEY
  - Do NOT reopen L1; may note OBS closed for QC-02 Condition

exit_criteria:
  - evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-03.md
  - ack_status PASS_TO_PM (or absorb stamp into QC-02)
  - DENY module SI/CTR UAT · no seed

cấm: seed · flip ready · reopen L1 · claim module UAT
```
