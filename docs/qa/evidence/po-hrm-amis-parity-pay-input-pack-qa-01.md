# Evidence — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01` READY_FOR_QA |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution — **L1 API smoke** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **stamp** | `PAYINPQA-MSIRS9L7` (FINAL) |
| **ack_status** | **`FAIL_TO_PM`** |
| **verdict** | **FAIL** — 0/3 exit AC PASS |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-input-pack-qa-01.mjs` |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | L1 slice ≠ module UAT |
| **Seed** | **DENIED** | U65 zero-seed · no `pnpm seed:*` |
| **Browser Step4 UF / J-HRM-07** | **DENIED** | FE packs residual on BE handoff |
| **AMIS DONE / ready flip** | **DENIED** | |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assert noise after PASS) |
| Dist `pay-period-input-pack.service.js` | **present** |
| Stale-dist probe (unauth) | `GET …/timesheet-binds` → **401** `HRM-AUTH-001` · `GET …/input-lines` → **401** (routes live) |
| Auth | XBOS/portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` · JWT `sub=ceo@xe.vn` |

### Fixture IDs (FINAL)

| Key | Value |
|-----|--------|
| periodId | `9a5ec612-a4cb-4408-bdd8-f92306bf64f7` (Jul 2026 draft, reused on overlap) |
| closedSheetId | `642a4713-b0ee-4802-a1d9-2fe650cbc17f` (Jul closed · holding) |
| bindInserted | **true** (DUP `HRM-PAY-INP-409-DUP`) |
| inputLineId | `a85e5a21-8aa1-4426-9939-3e55b4468db8` (`other_income` · 750000) |
| tplId | `2c8fe542-69c2-4ef8-8634-63b816922712` |

---

## AC matrix (L1)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC-AMIS-ATT-XFER-01** | draft period → POST timesheet-binds (closed) → list **display-ready** → process eligibility OK (not ATT-412) | Open sheet bind → **412** `HRM-PAY-ATT-412` ✅ · Closed bind **INSERT ok** (409 DUP on retry) · **GET/LIST binds → 500 `HRM-SYS-001` `column s.code does not exist`** ❌ · process after bind → **409** `HRM-PAY-ENROLL-REQUIRED` (not ATT-412) | **FAIL** |
| **AC-PAY-SRC-03** | POST input-lines (`other_income`) → process → payslip line `source_tier=period_input` | POST input-line **201** `HRM-PAY-INP-201` · list display-ready (`employeeDisplayName=Nguyễn Văn An`, `componentDisplayLabel=other_income`, `sourceKind=other_income`, amount **750000**) ✅ · enroll explicit/auto → **400** `HRM-PAY-ENROLL-EMPTY` · eligibility `eligible_count=0` items=[] · process → **409** `HRM-PAY-ENROLL-REQUIRED` · **0** payslip `period_input` lines | **FAIL** |
| **VAL-INP-ADV-01** | mark-paid + `payrollPeriodId` → input line `source_kind=advance` | Nest **no** POST advance-request employees (FE throws «API thêm NV chưa có») · 0 advance rows in env · mark-paid without `payrollPeriodId` → **400** `HRM-VAL-001` ✅ EXPAND required · mark-paid with period + empty emps → **201** `bridgedInputLineIds=[]` · **no** `source_kind=advance` line | **FAIL** |
| Honesty | no ready flip / no seed | locked | **PASS** |

---

## Defect triage (P0)

| ID | Layer | Evidence | Owner |
|----|-------|----------|-------|
| **R-PAY-INP-BIND-SHEET-CODE-COL** | App BE | `pay-period-input-pack.service.ts` `bindSelectSql` selects `s.code AS timesheet_code` but `attendance_sheets` DDL has **no** `code` column (name/status/dates only) → LIST/GET timesheet-binds **500** after successful INSERT. Blocks display-ready AC. | **dev-be** |
| **R-PAY-SRC-03-PROCESS** | App BE / data | Input CRUD PASS; process blocked — eligibility empty (`require_closed_timesheet=true`, `eligible_count=0`) → enroll EMPTY → process ENROLL-REQUIRED. May cascade from bind/display ATT-closed preference. | **dev-be** |
| **R-PAY-ADV-EMP-API-ABSENT** | App BE | No Nest API to INSERT `advance_request_employees`; FE documents gap. U65 cannot product-path populate advance lines without seed. | **dev-be** |
| **R-VAL-INP-ADV-01-NO-EMP-ROWS** | App BE | mark-paid EXPAND `payrollPeriodId` enforced; empty-employee bridge returns `bridgedInputLineIds=[]` — cannot assert `source_kind=advance` / `source_ref=advance_request_employee:{id}` | **dev-be** |

### What DID work (not promoted as AC PASS)

| Slice | Result |
|-------|--------|
| Routes live (401 unauth) | timesheet-binds · input-lines |
| VAL-INP-BIND-01 open sheet | **412** `HRM-PAY-ATT-412` |
| Closed bind INSERT | UQ / DUP proves row written |
| F-PAY-PERIOD-INPUT-01 CRUD | POST/GET input-lines **201/200** display-ready |
| Catalog ensure | `other_income` + `tam_ung` created via salary-components (`component_type=luong`/`thue`) |
| mark-paid EXPAND contract | `payrollPeriodId` required (400 without) |

---

## Residual / not promoted

- Browser Step4 UF packs — **dev-fe** after BE fix + QA retest  
- Module UAT / `payroll_e2e_ready` — **DENIED**  
- Process `source_tier=period_input` end-to-end — blocked until enroll/eligibility + bind display fix  

### Explicit non-claims

- Did **not** claim AMIS parity DONE / payroll e2e ready / J-HRM-07 process UAT.  
- Did **not** use seed or flip `payroll_e2e_ready`.  
- Did **not** run browser UF (FE Step4 residual).  

---

## completion_report

### Closed

1. L0 + live-dist probe for input-pack routes (401 not 404).  
2. L1 execution of all three exit ACs with reproducible FINAL JSON.  
3. Isolated P0 BE defect: `attendance_sheets.code` missing vs bind SELECT.  
4. Proved input-line CRUD + mark-paid `payrollPeriodId` validation under U65.  

### Residual

All three exit ACs **FAIL** — dispatch **dev-be** fix pack below; then QA retest same work_item suffix `-02`.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **dev-be** (P0 bind SQL + enroll/adv emp) → **qa** retest |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-01.md` |
| **ack_status** | **`FAIL_TO_PM`** |
| **pm_dispatch_hint** | `PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02` — fix `s.code` · unlock enroll · advance emp API — **cấm** flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-02
from_role: pm
to_role: dev-be
lane: execution
priority: P0
parent: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-QA-01
prior: FAIL_TO_PM stamp PAYINPQA-MSIRS9L7

entry_criteria:
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-qa-01.md
- residual R-PAY-INP-BIND-SHEET-CODE-COL · R-PAY-SRC-03-PROCESS · R-PAY-ADV-EMP-API-ABSENT

exit_criteria:
1) FIX bindSelectSql — do NOT select attendance_sheets.code (column ABSENT); use name (and optional future sheet_code ADD only if DATA confirms). GET/LIST timesheet-binds 200 with timesheetDisplayLabel from name · timesheetStatus=closed.
2) After bind, GET periods/:id/eligibility returns employees (not empty items[]) when closed sheet bound; enroll explicit NV002/HLD-0001 can succeed OR honest ineligible reasons (not silent empty).
3) ADD product-path POST advance-request employees (or document + implement minimal Nest create-employee-line) so mark-paid+payrollPeriodId can upsert source_kind=advance without seed.
4) Jest regression: bind list with sheet lacking code · VAL-INP-ADV-01 bridge with emp row.
5) evidence: docs/qa/evidence/po-hrm-amis-parity-pay-input-pack-be-02.md
6) honesty: payroll_e2e_ready=false · U65 zero-seed
7) ack_status READY_FOR_QA

cấm: pnpm seed:* · payroll_e2e_ready flip · claim AC PASS without QA retest
```
