# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-PAYSLIP-LINES-GET-01` READY_FOR_QA |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API R-PAY-PAYSLIP-LINES-GET** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **priority** | P2 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — GET by id + `/lines` + scope 404 |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.mjs` |
| **stamp** | `PAYSLIPGET-MSIKYBBB` |
| **spec_ref** | API_DESIGN F-PAY-PAYSLIP-01 · BE evidence BE-PAYSLIP-LINES-GET-01 |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Slice L1 only |
| **Formula LIVE** | **DENIED** | Not retested / not claimed |
| **Browser UF / J-HRM-07** | **DENIED** | L1 API only |
| **Seed** | **DENIED** | U65 — used existing processed payslip from list |
| **Module UAT / Phase1** | **DENIED** | OBS close ≠ module UAT |
| **ATT / CB-BAG / FE-EVAL** | **RETAINED CLOSED** | Not reopened |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** (Windows UV assert noise — health rows PASS) |
| Pre-test process | Stale — HRM PID started **13:10** · dist payslip GET **13:37** |
| QA recovery (R-PAY-F-STALE-DIST) | Kill `:28001` + `node dist/main` (hrm-api) → PID **29420** · health **200** |
| Dist marker | `getPayslipById` / `listPayslipLines` / `GET payslips/:payslipId(/lines)` in dist |
| Auth | Portal login · Bearer · group CEO `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` |
| Scope miss persona | `du-lich.ceo@xe.vn` · tenant `xe-du-lich` · company `main` · role `subsidiary_ceo` |

---

## AC matrix (L1 R-PAY-PAYSLIP-LINES-GET)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC-LIST** | List payslips → pick processed id | `GET /payroll/payslips?company_id=main` **200** `HRM-PAY-200` · picked `8ca0679c-…` status=`processed` · NV002 gross **9_500_000** · period `d92d3bbb-…` | **PASS** |
| **AC-GET-BY-ID** | `GET …/payslips/:id?company_id=` → 200 · components/lines | **200** `HRM-PAY-200` · `components.length=2` · `lines.length=2` (BASE 9.5M earning · DED_SAMPLE 950k deduction) | **PASS** |
| **AC-GET-LINES** | `GET …/payslips/:id/lines` → 200 · total matches | **200** `HRM-PAY-200` · `total=2` · `data.length=2` · matches by-id arrays | **PASS** |
| **AC-SCOPE-404** | Member CEO / missing → 404 `HRM-PAY-404` | Member GET id + `/lines` → **404** `HRM-PAY-404` · unknown UUID → **404** `HRM-PAY-404` | **PASS** |
| **AC-AUTH** | No JWT → 401 | **401** `HRM-AUTH-001` | **PASS** |

### Scope miss probe notes

- First attempt with mismatched headers (`x-tenant-id=xevn` on member token) → **409** `SCOPE_CONTEXT_MISMATCH` (gate, not product 404) — **not** used as AC fail after correction.
- Corrected: member claims `tenantId=xe-du-lich` + `companyId=main` → **404** `HRM-PAY-404` (no leak of holding payslip). Matches jest `getPayslipById returns 404 when payslip outside member CEO scope`.

### Baselines retained (not reopened)

| Baseline | Status |
|----------|--------|
| ATT-LINE / ATT-LINE-02/03 | RETAIN CLOSED |
| CB-BAG L1 | RETAIN CLOSED |
| FE-EVAL / EVAL | RETAIN CLOSED |

---

## Key runtime excerpts

```text
GET /payroll/payslips?company_id=main
→ 200 HRM-PAY-200 total=56 processed≥1
  pick 8ca0679c-49de-4097-8c01-3a74900df3bf NV002 processed gross=9500000

GET /payroll/payslips/8ca0679c-…?company_id=main
→ 200 HRM-PAY-200
  components[2]=lines[2] BASE/DED_SAMPLE

GET /payroll/payslips/8ca0679c-…/lines?company_id=main
→ 200 HRM-PAY-200 total=2 data.length=2

du-lich.ceo GET same id (tenant xe-du-lich, company main)
→ 404 HRM-PAY-404
GET …/lines → 404 HRM-PAY-404

GET unknown UUID → 404 HRM-PAY-404
no auth → 401 HRM-AUTH-001
```

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-PAYSLIP-LINES-GET** | Public GET by id + lines | **CLOSED** this seat (L1) |
| **`payroll_e2e_ready`** | LOCKED false | **pm** |
| ESS `GET …/me/payslips/{id}` | OUT BE seat | backlog P3 |
| Browser bind components UI | — | optional FE later · **DENIED** this wave |
| J-HRM-07 / module UAT | — | **DENIED** |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / module UAT / J-HRM-07.
- Did **not** seed (`pnpm seed:*` / DB fake).
- Did **not** reopen ATT / CB-BAG / FE-EVAL baselines.

---

## completion_report

### Closed

1. Stale-dist SOP — restarted hrm-api on fresh dist with payslip GET routes.  
2. L1 AC list → get-by-id (`components`/`lines`) → `/lines` total match **PASS**.  
3. Scope miss member CEO + unknown id → **404** `HRM-PAY-404` **PASS**.  
4. **R-PAY-PAYSLIP-LINES-GET** L1 closed.  
5. Honesty: `payroll_e2e_ready=false`.  
6. Evidence MD + FINAL JSON stamp `PAYSLIPGET-MSIKYBBB`.

### Residual

Browser/ESS payslip detail bind optional · module/browser UAT DENIED · next **qc** GWC OBS close.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC GWC close OBS R-PAY-PAYSLIP-LINES-GET · **cấm** flip `payroll_e2e_ready` / claim formula LIVE / J-HRM-07 |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-PAYSLIP-LINES-GET-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-PAYSLIP-LINES-GET-01 PASS_TO_PM (L1 R-PAY-PAYSLIP-LINES-GET)
priority: P2

## Mission
QC GWC / OBS close after BE ADD + QA L1 payslip GET lines:
1. Audit docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md + FINAL JSON stamp PAYSLIPGET-MSIKYBBB
2. Confirm: GET /payroll/payslips/:id → 200 HRM-PAY-200 components/lines; GET …/lines total matches; member CEO / missing → 404 HRM-PAY-404
3. Confirm honesty payroll_e2e_ready=false · ATT/CB/FE-EVAL retained · no LIVE / module UAT / J-HRM-07
4. Close OBS R-PAY-PAYSLIP-LINES-GET or list residual — GO WITH CONDITIONS preferred for P2 slice

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-payslip-lines-get-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-payslip-lines-get-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-03.md (prior OBS open)

evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-payslip-lines-get-01.md
honesty: payroll_e2e_ready=false
```
