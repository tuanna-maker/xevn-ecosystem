# Evidence — PO-HRM-E2E-LINK-PAY-CFG-QA-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-CFG-QA-03` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01` |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **u65** | zero-seed · browser-only · FE after 2xx + F5 |
| **hdsd_align** | Cài đặt → Danh mục (`salary_components`) → Thêm · Lương → Thành phần lương → Thêm (picker) |
| **honesty** | `payroll_e2e_ready=false` · **no seed** |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **stamp** | `PAYCFGQA03-MSIS9HM9` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-cfg-qa-03-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-03/` |
| **script** | `scripts/qa/_tmp-po-hrm-e2e-link-pay-cfg-qa-03.mjs` |

---

## 0. Spec / prior read ack

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md` | O4 Option A synthesize empty `salary_components` overview |
| `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md` | Prior PASS_WITH_BLOCKED — key absent / picker BLOCKED |
| Spec AC | AC-PAY-COMP-01 · CatalogSearchPicker + invent-code negative |

---

## 1. Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| vitest AC-PAY-COMP-01 | **41/41 PASS** — `catalogSearchPicker.test.ts` + `salaryComponentFormSchema.test.ts` |
| Seed | **Not run** (U65) |

---

## 2. Probes (read-only + after FE)

| Probe | Result |
|-------|--------|
| GET `/api/hrm/settings-catalogs` `catalogKey=salary_components` | **PASS** — key present (O4 closed) |
| Settings Select label | **PASS** — «Thành phần lương (danh mục)» |
| After FE create + F5 | **PASS** — `effectiveItems=3` codes include `QA_SC_IS9HM9`, `QA_SB_IS9HM9` (+ prior `QA_SC_IS7453` from R1) |
| Overview `name` when extension exists | OBS — API may show storage key `salary_components`; Select still VI label |

---

## 3. Browser UF matrix (U65)

**Portal:** `http://127.0.0.1:5173/hr/settings-catalogs?portal=1&companyId=main` → `/hr/payroll` tab Thành phần lương  
**Click path:** Login (token inject) → Settings Select `salary_components` → Thêm extension → F5 → Lương → Thành phần lương → Thêm → picker / invent / save → F5 → Thêm again.

### A. Settings O4 key + FE density

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| Overview includes `salary_components` | Key present | Present | 🟢 |
| Select shows VI label | «Thành phần lương (danh mục)» | Hit in Select options | 🟢 |
| FE create extension | POST 2xx | POST **201** `QA_SC_IS9HM9` + `QA_SB_IS9HM9` | 🟢 |
| F5 density | `effectiveItems>0` | **eff=3** | 🟢 |

### B. AC-PAY-COMP-01 CatalogSearchPicker + invent

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| Thêm — Mã when SC>0 | CatalogSearchPicker · no free-text | `pay-salary-component-catalog-picker` visible · free-text hidden | 🟢 |
| Invent negative | No invent POST 2xx | `INVENT_IS9HM9` not posted successfully | 🟢 |
| Pick catalog + pay_types → Lưu | POST 2xx | POST **201** `QA_SC_IS9HM9` | 🟢 |
| F5 instance | Row còn | Row `QA_SC_IS9HM9` visible | 🟢 |
| Thêm again | Picker still bound | Remaining `QA_SB_IS9HM9` pickable | 🟢 |

### C. Honesty / console

| Check | Verdict |
|-------|---------|
| CONSOLE-GATE | 🟢 No Uncaught ReferenceError/TypeError |
| `payroll_e2e_ready` | 🟢 DENIED false |

**R1 note:** First run FAIL only on `AC-PAY-COMP-01-PICKER-AGAIN` when sole catalog code was consumed → empty-options catalogBound UI (not free-text). R2 creates two Settings codes so remaining option stays pickable.

---

## 4. AC summary

| AC / Layer | Verdict | Notes |
|------------|---------|-------|
| API overview `salary_components` key | 🟢 PASS | O4-SC-KEY-BE-01 live |
| Settings Select VI label | 🟢 PASS | |
| FE create → eff>0 + F5 | 🟢 PASS | |
| AC-PAY-COMP-01 CatalogSearchPicker | 🟢 PASS | |
| AC-PAY-COMP-01 invent-code negative | 🟢 PASS | |
| Unit Zod/picker | 🟢 PASS | 41/41 |
| Honesty no e2e_ready | 🟢 PASS | |

---

## 5. Residual (not promoted)

| ID | Severity | Symptom | Owner |
|----|----------|---------|-------|
| OBS-SC-OVERVIEW-NAME | P3 | When extension exists, overview `name` may be raw `salary_components` vs synthesized VI; Select label OK | optional ba/fe polish |
| XBOS `salary_components` / `pay_types` 404 | P2 HOLD | Carry from QA-02 — not this wave | devops/XBOS |
| Dual SoT starters ≠ Settings picker | P2 | Documented honesty — unchanged | ba/sa narrow |
| P0-PAY / J-HRM-07 / module UAT | — | Out of slice | program |

**Does NOT promote:** `payroll_e2e_ready` · `settings_catalog_e2e_ready` · module UAT · J-HRM-07

---

## 6. QA verdict

**PASS → PASS_TO_PM**

Closed O4 residual from QA-02: Settings key + FE density + CatalogSearchPicker positive + invent negative under U65. Stamp `PAYCFGQA03-MSIS9HM9`.

---

## completion_report

**Closed:** L0; vitest 41/41; U65 browser — GET overview `salary_components`; Select «Thành phần lương (danh mục)»; FE create extension 201 → F5 eff>0; Thêm → CatalogSearchPicker; invent blocked; instance POST 201 `QA_SC_IS9HM9` + F5; picker again with remaining code; honesty `payroll_e2e_ready=false`.

**Residual:** OBS overview name raw key (P3); XBOS 404 P2 HOLD; no e2e_ready / J-HRM-07 flip.

## next_owner

**pm** → dispatch **qc** narrow gate on PAY-CFG O4+QA-03 slice (or close residual program carry).

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-QC-03
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-PAY-CFG-QA-03
priority: P1

## Mission
QC GWC/GO on PAY-CFG O4 Settings salary_components key + AC-PAY-COMP-01 picker slice.

## Evidence pack
- docs/qa/evidence/po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md (READY_FOR_QA)
- docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-03.md (PASS stamp PAYCFGQA03-MSIS9HM9)
- docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-cfg-qa-03-browser.json
- screens: docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-03/

## Must verify
- O4 key + FE create + F5 eff>0
- AC-PAY-COMP-01 picker + invent negative PASS
- U65 zero-seed · cấm promote payroll_e2e_ready / J-HRM-07 / module UAT
- Residual OBS-SC-OVERVIEW-NAME P3 + XBOS 404 P2 HOLD only

evidence: docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qc-03.md
```

## evidence_path

`docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-03.md`
