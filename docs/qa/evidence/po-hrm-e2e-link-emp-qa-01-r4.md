# Evidence — PO-HRM-E2E-LINK-EMP-QA-01 R4

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QA-01` |
| **round** | **R4** |
| **role** | qa |
| **lane** | execution · U65 zero-seed · browser-first |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **env** | portal `http://127.0.0.1:5173` · hrm `:28001` · xbos via portal proxy |
| **parent** | FE-04 `READY_FOR_QA` (`docs/qa/evidence/po-hrm-e2e-link-emp-fe-04.md`) · FE-03 mount · BE-03 |
| **prior** | R3 FAIL `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r3.md` · residual **R-EMP-SI-ACTION-COMPANY-ID-BODY** |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-01-r4.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-01-r4/` |
| **harness** | `scripts/qa/_tmp-po-hrm-e2e-link-emp-qa-01.mjs` (R4 · body `company_id` assert + hard refresh) |
| **honesty** | `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` · **DENIED** module UAT · **DENIED** seed |
| **ack_status** | **PASS_TO_PM** |

---

## 0. L0 / honesty

| Check | Result |
|-------|--------|
| `pnpm run qc:fe-be-health` | **ALL PASS** (hrm/xbos/portal/proxy) |
| Portal `:5173` · HRM `:28001` | **200** |
| Seed | **DENIED** (U65) |
| API-only D5 PASS | **DENIED** — browser POST only |
| Hard refresh on `?tab=insurance` | Applied before action click (FE-04 bundle) |

---

## 1. Verdict matrix (R4)

| Case | R3 | R4 | Evidence highlight |
|------|----|----|-------------------|
| **L0** | 🟢 | 🟢 | Stack healthy |
| **D1 QSĐ→WH** | 🟢 | 🟢 | HRD_01 effective → POST **201** `HRM-DEC-201` · `work_history_id=1f93a01d-…` · WH F5 neo + badge «QSĐ QD-EMPQA-HNWYL0» · HRD_03 no invent |
| **D2 WH picker** | 🟢 | 🟢 | CatalogSearchPicker · POST work-timeline **201** · F5 |
| **D5 SI timeline** | 🔴 body 400 | 🟢 | `suspend` → POST **201** `HRM-EINS-200` · **JSON body `"company_id":"main"`** · periods F5 visible |
| **D6 HTP-05** | 🟢 | 🟢 | Banner `blocked` · GET **200** `HRM-HTP-200` · no invent ready |
| **J-HRM-01** | 🟢 | 🟢 | Contracts → employee profile |
| **J-HRM-02** | 🟢 | 🟢 | Employees list → detail GET **200** |
| **J-HRM-03** | 🟡 | 🟡 PARTIAL | Eye dialog not opened (carry P2) |
| **J-HRM-04** | 🟢 | 🟢 | Insurance → employee GET **200** |
| Process gate | 🟢 | 🟢 | pageErrors=0 · no Uncaught/drag-handle |

**Overall:** **PASS** (slice). Honesty flags remain **false** — narrow D1/D2/D5/D6/J PASS ≠ personnel module UAT.

---

## 2. Closed residuals

| ID | Status | Proof |
|----|--------|-------|
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | **CLOSED** | Browser Network: POST `…/employee-insurances/bbbbbbbb-…/actions?company_id=main` body `{ company_id: "main", action: "suspend", … }` → **201** (not 400 `HRM-VAL-001`) |

---

## 3. UF evidence blocks

### D5 — SI timeline action mutate (focus R4) 🟢
- Persona / URL: `/hr/employees/22222222-2222-4222-8222-222222222222?companyId=main&tab=insurance`
- Mount: `hdsd-insurance-enrollments-root` **true** · `hdsd-insurance-timeline-root` **true** (hard reload)
- Action: click `hdsd-insurance-action-suspend-bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2` → dialog → Lưu (`hdsd-insurance-action-submit`)
- Network: `POST /api/hrm/employee-insurances/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2/actions?company_id=main`
  - **Request JSON body includes** `"company_id":"main"` (string) — **not query-only**
  - Also: `action=suspend`, `effective_from=2026-08-06`, `suspend_reason=QA R4 suspend EMPQA-HNWYL0`
  - Response: **201** `HRM-EINS-200` «Employee insurance action applied»
- FE sau 2xx + F5: `hdsd-insurance-periods-list` visible · timeline root still mounted
- Verdict: 🟢
- Screens: `10`–`13`
- spec_ref: F-CORE-SI-03 · FE-04 · InsuranceActionDto

### D1 — QSĐ HRD_01 → WH neo (smoke) 🟢
- POST decisions **201** · `work_history_id=1f93a01d-95d8-4a91-8a08-35b4a23b81da` · badge F5 · HRD_03 no invent
- Verdict: 🟢 (R3 still green + reconfirmed)

### D2 — WH CatalogSearchPicker (smoke) 🟢
- POST work-timeline **201** · `position_key=CEO` · F5
- Verdict: 🟢

### D6 — HTP-05 (smoke) 🟢
- `data-htp05-state=blocked` · blocker `HRM-HTP-NO-ACTIVE-CONTRACT` · invent=false
- Verdict: 🟢

### J-HRM-01..04
| J-ID | Verdict | Notes |
|------|---------|-------|
| J-HRM-01 | 🟢 | contracts → `/employees/:id` |
| J-HRM-02 | 🟢 | list → detail scope 200 |
| J-HRM-03 | 🟡 | dialog open flaky (P2 carry) |
| J-HRM-04 | 🟢 | insurance → employee GET 200 |

---

## 4. Honesty stamp (mandatory)

| Claim | Value |
|-------|--------|
| `hrm_personnel_uat_ready` | **false** |
| `employees_e2e_linkage_ready` | **false** |
| Module personnel UAT / product GO | **DENIED** |
| Seed used | **DENIED** (U65) |
| Narrow flags | D1+D2+D5+D6+J PASS — **not** module ready |

---

## 5. Residuals (carry — non-blocking for D5)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| R-J03-DIALOG | P2 | qa (later) | Contract Eye dialog open flaky |
| OBS | P2 | — | FE hint `hdsd-decisions-effective-wh-hint` still false for HRD_01 (cosmetic; neo works) |

**P0 residuals for this WI:** none.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | R4 U65 browser after FE-04: **D5 PASS** — POST SI actions JSON body includes `company_id=main` → **201** `HRM-EINS-200` (R-EMP-SI-ACTION-COMPANY-ID-BODY **CLOSED**); smoke **D1/D2/D6 PASS**; J-01/02/04 PASS · J-03 PARTIAL; honesty false; no seed; **no** personnel UAT claim. |
| **next_owner** | **qc** (wave gate on EMP linkage D1/D2/D5/D6 slice) |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r4.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-EMP-QA-01 R4 PASS_TO_PM
u65: zero-seed
honesty: hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false

entry_criteria:
  - evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r4.md
  - machine docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-01-r4.FINAL.json
  - D5 CLOSED: body company_id + POST 201; D1/D2/D6 smoke PASS

task:
  - Audit browser evidence vs exit criteria (D5 body company_id not query-only; FE after 2xx+F5)
  - Confirm no seed / no personnel UAT promotion on narrow PASS
  - GO WITH CONDITIONS OK for slice; residual P2 R-J03-DIALOG only
  - cấm claim hrm_personnel_uat_ready / employees_e2e_linkage_ready = true

exit: GO | GO WITH CONDITIONS | NO-GO
evidence: docs/qa/evidence/po-hrm-e2e-link-emp-qc-01.md
```
