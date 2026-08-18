# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02` |
| **prior** | QA-02 FAIL stamp `SIINSQA2-MSJAJ04X` · defect `D-PLT-SI-INS-DTO-ISIN` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **FIX** — open enrollment DTO `type` (drop closed `@IsIn`) |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **DENIED** SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 zero-seed |
| **Git HEAD (start)** | `dc930c5` |

---

## 1. spec_read_ack

| Artifact | Sections |
|----------|----------|
| QA-02 evidence | §5 `D-PLT-SI-INS-DTO-ISIN` · Network POST enrollment `HRM-VAL-001` |
| BA-01 | AC-PLT-SI-INS-01-ENROLLMENT · AC-PLT-SI-INS-01b-ENROLLMENT · BR-PLT-SI-INS-06 |
| BE-01 | VAL-SI-CNS-02 service assert already wired |
| EMP-BE-02 | ONE enrollment SoT · F-CORE-SI-03 must_keep |

**Defect class:** Create/Update `@IsIn(['social','health','unemployment','accident','life'])` rejected Nest open key ∈ EFF (e.g. `hr_si_cat_msjaj04x`) as **`HRM-VAL-001`** before `assertEnrollmentTypeKey`.

---

## 2. Deliverable (allowed_paths only)

| Path | Change |
|------|--------|
| `dto/create-employee-insurance.dto.ts` | DROP closed `@IsIn` on `type` → `@IsString` `@MaxLength(64)` + CODE-MEMORY |
| `dto/update-employee-insurance.dto.ts` | Same open `type` + CODE-MEMORY |
| `employee-insurances.service.ts` | CODE-MEMORY-CHANGE APPEND only (assert path RETAIN) |
| `employee-insurances.service.spec.ts` | DTO validate open key · create ∈ EFF 2xx · invent KEY · F-CORE-SI-03 close |

**Untouched:** enrollment table schema · F-CORE-SI-03 action map · CTR legal-print · seed · policy consumer · L1 seal wording.

---

## 3. Behavior stamps

| Case | Expected | Implementation |
|------|----------|----------------|
| Open key ∈ EFF (DTO) | class-validator **0 errors** | no closed IsIn |
| Open key ∈ EFF (service) | create **2xx** / insert | `assertEnrollmentTypeKey` returns key |
| Invent when EFF>0 | **400** `HRM-INS-TYPE-KEY` | Nest catalog assert (RETAIN BE-01) |
| Status / actions | status IsIn + applyAction close | must_keep |

---

## 4. Jest evidence

```text
pnpm --filter hrm-api exec jest --testPathPatterns=employee-insurances.service.spec \
  --testPathPatterns=po-hrm-e2e-link-emp-be-02 --no-coverage
→ Test Suites: 2 passed · Tests: 12 passed
```

Covered: DTO open key · legacy `social` still valid · create open ∈ EFF · invent `HRM-INS-TYPE-KEY` · F-CORE-SI-03 close · EMP-BE-02 bridge applyAction suite.

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** — DENIED flip |
| `hrm_personnel_uat_ready` | **false** — DENIED flip |
| CTR legal-print / library | **SEAL RETAIN** |
| SI enrollment EMP-BE-02 ONE SoT | **SEAL RETAIN** (DTO deepen ≠ schema rewrite) |
| L1 QA-01 `SIINSQA-MSJA2Z7H` · QC-01 GWC L1 | **RETAIN** — not rewritten |
| R-PLT-SI-INS-03 (FE EFF picker) | **CLOSED** prior — not reopened |
| Module SI / CTR UAT | **DENIED** |
| Seed | **none** |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| QA-02 retest | Enrollment UF: pick open key ∈ EFF → Lưu **2xx** → F5 | **qa** |
| QC narrow | FE browser gate after QA PASS | **qc** |

`D-PLT-SI-INS-DTO-ISIN` → **FIXED** this seat (pending QA retest).

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-02.md` |
| **next_owner** | **qa** |
| **completion_report** | See §8 |
| **next_dispatch_prompt** | See §9 |

---

## 8. completion_report

**Closed:** `D-PLT-SI-INS-DTO-ISIN` — Create/UpdateEmployeeInsuranceDto `type` open (`@IsString` `@MaxLength(64)`); service `assertEnrollmentTypeKey` RETAIN (invent → `HRM-INS-TYPE-KEY` when EFF>0); jest DTO + create ∈ EFF + invent KEY + F-CORE-SI-03 close PASS (12); EMP-BE-02 ONE SoT / CTR seals / honesty false / L1 retain; no schema rewrite; no seed.

**Open:** QA-02 enrollment browser retest (then QC narrow FE).

---

## 9. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
program: PO-HRM-CONTINUOUS-W8-20260807
prior: SI-INS-CATALOG-BE-02 READY_FOR_QA · D-PLT-SI-INS-DTO-ISIN FIXED
retain: L1 SIINSQA-MSJA2Z7H · QC-01 GWC L1 · CTR legal-print · EMP-BE-02 ONE SoT · R-PLT-SI-INS-03 CLOSED

entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-02.md
  - L0 qc:dev-stack PASS
  - U65 zero-seed · browser-only enrollment UF

exit_criteria:
  - AC-PLT-SI-INS-01-ENROLLMENT: pick Nest open key ∈ EFF → Lưu POST /employee-insurances → 2xx → FE + F5
  - AC-PLT-SI-INS-01b-ENROLLMENT: invent ∉ EFF → 400 HRM-INS-TYPE-KEY (not VAL-001 for open keys)
  - honesty printable/personnel=false · C-SLICE-≠-MODULE · DENY module SI/CTR UAT
  - evidence update QA-02 (or new stamp on same path) · PASS_TO_PM then qc narrow FE browser
  - cấm: seed · reopen L1 seals wording · claim module UAT
```
