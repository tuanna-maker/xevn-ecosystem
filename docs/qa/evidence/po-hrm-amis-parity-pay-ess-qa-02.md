# Evidence — `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-ESS-QA-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **U65 browser** ESS payslip confirm (zero-seed) |
| **date** | 2026-08-07 |
| **priority** | P1 |
| **parent** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-ESS-FE-02` `READY_FOR_QA` |
| **closes_defect** | **`D-PAY-ESS-FE-SCOPE-COERCE`** — **CLOSED** |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC5 U65 browser (retest after FE-02) |
| **stamp** | `PAYESSQA2-IZE9S5` (+ AC5 hardened `PAYESSQA2-AC5R-ZLJ9L`) |
| **retest_of** | `PAYESSQA2-IYX8SJ` (prior FAIL coerce→main 409) |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-ess-qa-02-browser.json`](./_tmp-po-hrm-amis-parity-pay-ess-qa-02-browser.json) · [`_tmp-…-retest-rollup.json`](./_tmp-po-hrm-amis-parity-pay-ess-qa-02-retest-rollup.json) · [`_tmp-…-ac5-retest.json`](./_tmp-po-hrm-amis-parity-pay-ess-qa-02-ac5-retest.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-ess-qa-02.mjs` · AC5 `…-qa-02-ac5.mjs` |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-ess-qa-02/` |
| **spec_ref** | API_DESIGN **F-PAY-PAYSLIP-01** · SRS **FR-UC-BP-PAY-08** · FE `po-hrm-amis-parity-pay-ess-fe-02.md` |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll?portal=1` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip |
| **AMIS DONE / J-HRM-07 / module UAT** | **DENIED** | Slice browser ESS only |
| **Seed** | **DENIED** | U65 — used existing slip `e1ac365a-…` (was pending; now confirmed) |
| **API-only PASS** | **DENIED** | Browser FE Network + screens |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM / XBOS / portal **200** (portal briefly down mid-AC5 → restarted `dev:web-only`; retest AC5 after 200) |
| `qc:fe-be-health` | **ALL PASS** |
| ESS persona | `uat.nv0001@xe.vn` / `xevn-uat-2026` · JWT `companyId=holding` · `employee_id=3796d949-…` |
| CEO persona | `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` · `employee_id=null` |
| Precondition API | `GET me/payslips?company_id=holding` → **200** total=**2** · pending=**1** (`e1ac365a`) before confirm |
| Control API | `GET me/payslips?company_id=main` + holding JWT → **409** `SCOPE_CONTEXT_MISMATCH` |

---

## Retest section — stamp `PAYESSQA2-IZE9S5` (2026-08-07)

**Prior FAIL:** FE sent `company_id=main` → **409** (defect `D-PAY-ESS-FE-SCOPE-COERCE`).  
**FE-02:** `resolveEssPayslipCompanyId` + JWT normalize → ESS query **`holding`**.

### Click path (HDSD · U65)

**Happy:** portal → HRM → **Tiền lương** → tab **Phiếu của tôi** (`hdsd-pay-ess-tab`)

| Step | UI | Network / FE observed | Verdict |
|------|-----|----------------------|---------|
| 1 | ESS JWT + `/hr/payroll?portal=1&companyId=holding` → `hdsd-pay-ess-tab` | **GET** `…/me/payslips?company_id=**holding**` → **200** `HRM-PAY-200` total=**2** · FE rows=**2** · no 403 hint | **AC1 PASS** |
| 2 | Open `hdsd-pay-ess-open-e1ac365a-…` | **GET** by id **200** · `ess_confirmed=false` · `company_id=holding` | **AC2 PASS** |
| 3 | Confirm `hdsd-pay-ess-confirm` | **POST** **201** `HRM-PAY-204-ESS` · CTA hidden · shot **04** green **Đã xác nhận** + toast «Đã xác nhận phiếu lương» | **AC3 PASS** |
| 4 | F5 → reopen detail | **GET** **200** `ess_confirmed=true` · CTA hidden · shot **05** badge **Đã xác nhận** | **AC4 PASS** |
| 5 | CEO → same tab (hardened wait for panel) | **GET** `company_id=main` → **403** `HRM-PAY-403-ESS` · `ess-payslips-403-hint` visible · **0** rows · shot **06b** | **AC5 PASS** |

### AC matrix (retest)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **AC1** | GET `company_id=holding` **200** own rows · NOT main / NOT 409 | Network `holding` **200** · FE 2 rows | **PASS** |
| **AC2** | Detail GET **200** · `ess_confirmed` present | **200** · `ess_confirmed=false` then true after confirm | **PASS** |
| **AC3** | POST confirm 2xx · FE badge Đã xác nhận | POST **201** `HRM-PAY-204-ESS` · CTA hidden · badge on shot 04 (harness `isVisible` raced — overridden by screen) | **PASS** |
| **AC4** | F5 still confirmed · CTA hidden | F5 GET `ess_confirmed=true` · CTA hidden · shot 05 | **PASS** |
| **AC5** | CEO **403** `HRM-PAY-403-ESS` · honest banner · no invent | Hardened: banner **true** · hint text CEO/employee_id · rows=**0** · stamp `PAYESSQA2-AC5R-ZLJ9L` | **PASS** |

### Defect closure

| ID | Prior | Retest | Status |
|----|-------|--------|--------|
| **D-PAY-ESS-FE-SCOPE-COERCE** | Browser GET `company_id=main` → **409** | Browser GET `company_id=holding` → **200** | **CLOSED** |

### OBS (non-blocking)

| ID | Note |
|----|------|
| Harness AC3 badge testid | First-pass `ess-payslip-confirmed-badge` `isVisible=false` while shot 04 shows badge — assert timing; product OK |
| First-pass AC5 shot 06 | Landed mid-tab on Tính lương; Network already 403 — hardened AC5 after portal restart proves banner |

---

## Prior FAIL (kept) — stamp `PAYESSQA2-IYX8SJ`

| AC | Verdict then |
|----|--------------|
| AC1 | **FAIL** — FE `company_id=main` → 409 |
| AC2–AC4 | BLOCKED |
| AC5 | Network 403 OK · banner assert race |

Root cause then: `coerceHrmListCompanyId(holding→main)` on ESS path — fixed in FE-02.

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **D-PAY-ESS-FE-SCOPE-COERCE** | P1 | — | **CLOSED** | Retest AC1 holding 200 |
| Harness badge wait polish | P3 | qa (optional) | OBS | Does not block product PASS |
| `payroll_e2e_ready` | honesty | pm | **LOCKED false** | |
| AMIS / J-HRM-07 / module UAT | — | — | **DENIED** | |

---

## completion_report

### Closed
1. U65 browser retest after FE-02 — **AC1–AC5 PASS** (zero-seed · no ready flip).  
2. **CLOSED** `D-PAY-ESS-FE-SCOPE-COERCE`: Network `company_id=holding` **200** (was main→409).  
3. Confirm path: POST **201** `HRM-PAY-204-ESS` → badge Đã xác nhận → F5 persist · CTA hidden.  
4. CEO negative: **403** `HRM-PAY-403-ESS` · honest banner · **0** invent rows.  
5. Evidence MD + JSON rollup + screens 01–05 + 06b; honesty locks retained.

### Residual
- None P0/P1 product. Optional harness assert wait polish (P3 OBS).  
- **DENIED** `payroll_e2e_ready` / AMIS DONE / J-HRM-07 / module UAT.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md` |
| **ack_status** | **`PASS_TO_PM`** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-ESS-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P1
prior: PO-HRM-AMIS-PARITY-PAY-ESS-QA-02 PASS_TO_PM (stamp PAYESSQA2-IZE9S5 · AC5 PAYESSQA2-AC5R-ZLJ9L)
closes_defect: D-PAY-ESS-FE-SCOPE-COERCE (QA CLOSED)
program: PO-HRM-CONTINUOUS-W7-20260807

## Mission
QC gate ESS Phiếu của tôi browser slice after FE-02 scope fix + QA-02 retest PASS.

## Audit checklist
1. Confirm D-PAY-ESS-FE-SCOPE-COERCE CLOSED: Network company_id=holding 200 (not main/409) — evidence QA-02 retest + FE-02
2. AC1–AC5 browser evidence: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md · screens 01–05 + 06b
3. Confirm honesty: payroll_e2e_ready=false · no seed · DENIED AMIS DONE / J-HRM-07 / module UAT
4. L1 ESS QC-01 SEAL retained — no BE reopen
5. must_keep: CEO 403 HRM-PAY-403-ESS honest banner · F5 after confirm · no invent rows

## entry_criteria
- QA evidence PASS: docs/qa/evidence/po-hrm-amis-parity-pay-ess-qa-02.md
- FE-02: docs/qa/evidence/po-hrm-amis-parity-pay-ess-fe-02.md
- rollup JSON: docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-ess-qa-02-retest-rollup.json

## exit_criteria
- evidence docs/qa/evidence/po-hrm-amis-parity-pay-ess-qc-02.md
- GO or GO WITH CONDITIONS · residual P0/P1 listed or none
- ack_status PASS_TO_PM

## cấm
seed · flip payroll_e2e_ready · claim AMIS DONE / J-HRM-07 / module UAT · reopen L1 BE
```
