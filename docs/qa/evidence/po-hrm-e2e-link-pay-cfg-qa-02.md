# Evidence — PO-HRM-E2E-LINK-PAY-CFG-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-CFG-QA-02` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-E2E-LINK-PAY-CFG-QA-01` |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **u65** | zero-seed · browser-only · FE after 2xx + F5 |
| **hdsd_align** | Lương → Thành phần lương → Thêm · Cài đặt → Danh mục (pay_types) |
| **honesty** | `payroll_e2e_ready=false` · **no seed** · TDZ residual **SUPERSEDED** (not re-dispatched) |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS_WITH_BLOCKED** (O4 Settings `salary_components` density still 0) |
| **commit** | `dc930c5` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-cfg-qa-02-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-02/` |

---

## 0. Spec / prior read ack

| Artifact | Use |
|----------|-----|
| `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-01.md` | Prior PASS_WITH_BLOCKED — catalog density 0 |
| `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-exec-fe-01.md` | CatalogSearchPicker when Settings `salary_components` >0 |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-pay-catalog-be-01.md` | Starter rows `LUONG_CO_BAN` / `THUE_TNCN_HT` / `SO_NGAY_NGHI_BU` |
| Spec AC | AC-PAY-COMP-01 · P0-PAY-03 |

---

## 1. Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| `qc:fe-be-health` | ALL PASS (earlier same session) |
| vitest AC-PAY-COMP-01 | **41/41 PASS** — `catalogSearchPicker.test.ts` + `salaryComponentFormSchema.test.ts` |

---

## 2. Probes (read-only)

| Probe | Result |
|-------|--------|
| Payroll `GET /salary-components` starters | **PASS** — `LUONG_CO_BAN`, `THUE_TNCN_HT`, `SO_NGAY_NGHI_BU` (`is_system=true`) |
| Settings overview `salary_components` key | **ABSENT** (`settingsHasSalaryComponentsKey=false`, eff=0) |
| Settings overview `pay_types` key | **PRESENT** (eff ≥3 → 4+ after FE create) |
| XBOS `GET config-sync/catalog/pay_types` | **404** `XBOS-CFG-001` Catalog not found |
| XBOS `GET …/salary_components` | **404** `XBOS-CFG-001` (P2 HOLD apply) |

**Honesty note:** Payroll starter rows ≠ Settings picker SoT. `catalogBound` in FE uses Settings `salary_components` / `payroll_components` only — starters do **not** flip CatalogSearchPicker.

---

## 3. Browser UF matrix (U65)

**Portal:** `http://127.0.0.1:5173/hr/payroll?portal=1&companyId=main`  
**Click path:** Login → Settings catalogs (sync + add pay_types) → Lương → tab **Thành phần lương** (`payroll-tab-components`) → **Thêm mới** → free-text mã + pick pay_types → submit → F5 → Thêm lại.

### A. Settings density bootstrap (product FE)

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| Sync from XBOS | POST 2xx | POST `/settings-catalogs/sync-from-xbos` **201** | 🟢 |
| Select key `pay_types` | Available | Label «Bản chất / loại TP lương» in Select | 🟢 |
| Add pay_types item | POST 2xx | POST `/settings-catalogs/items` **201** | 🟢 |
| Select key `salary_components` | Available for HRM extension | **Missing from Select** (key never in overview) | 🟡 BLOCKED O4 |
| FE create Settings `salary_components` item | Possible | **Impossible** without key in Select (chicken-egg vs XBOS P2 HOLD) | 🟡 |

### B. Thành phần lương — empty Settings catalog path

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| Tab Thành phần lương | Load, starters visible | Starters on list; no ERROR banner | 🟢 |
| Thêm — Mã when Settings SC=0 | Free-text Input | Free-text `xevn-field-code` · **no** `pay-salary-component-catalog-picker` | 🟢 AC empty branch |
| Pick `pay_types` | CatalogSearchPicker options | Picked option → form completable | 🟢 |
| Lưu / Thêm → POST | 2xx | POST `/payroll/salary-components` **201** `QA_TP_IRUZ2O` | 🟢 |
| F5 | Row còn | Row `QA_TP_IRUZ2O` visible | 🟢 |
| Thêm again → picker | CatalogSearchPicker when SC>0 | Settings SC still **0** → free-text again | 🟡 AC-PAY-COMP-01 positive BLOCKED |
| Invent code when SC>0 | Zod/picker block | **Not exercised** — catalogBound false | 🟡 |

### C. Console / honesty

| Check | Verdict |
|-------|---------|
| CONSOLE-GATE (no Uncaught ReferenceError/TypeError) | 🟢 |
| TDZ residual re-dispatch | 🟢 SKIP — SUPERSEDED per PM |
| `payroll_e2e_ready` claim | 🟢 DENIED false |

---

## 4. AC summary

| AC / Layer | Verdict | Notes |
|------------|---------|-------|
| L2 payroll / components tab | 🟢 PASS | |
| Starter rows (PAY-CATALOG-BE) | 🟢 PASS | Present; **do not** bind Settings picker |
| AC-PAY-COMP-01 empty free-text | 🟢 PASS | |
| pay_types FE create + pick | 🟢 PASS | Unblocks instance create |
| UF mutate + F5 (free-text instance) | 🟢 PASS | `QA_TP_IRUZ2O` |
| AC-PAY-COMP-01 CatalogSearchPicker | 🟡 **BLOCKED** | Settings `salary_components` eff=0 · key absent |
| AC-PAY-COMP-01 invent-code negative | 🟡 **BLOCKED** | Requires catalogBound |
| Unit Zod/picker | 🟢 PASS | 41/41 |
| O4 XBOS pay_types SoT | 🟡 BLOCKED | XBOS catalog 404; HRM extensions work locally |

---

## 5. Residual (not promoted)

| ID | Severity | Symptom | Owner |
|----|----------|---------|-------|
| **O4-CATALOG-DENSITY-01** (carry) | P1 | Settings key `salary_components` never appears in overview Select → cannot FE-bootstrap picker density; XBOS catalog 404 + P2 HOLD | **dev-be** (synthesize overview key / open HRM extension without prior sync) **and/or** **devops/XBOS** publish `pay_types` SoT + decide P2 `salary_components` path |
| Dual SoT honesty | P2 | Payroll starters vs Settings catalog — document in BA/FE if starters should feed picker | ba-process / sa (narrow) |
| P0-PAY-01 / payroll E2E | P0 | Out of slice | program |
| D-PAY-BATCHES-TDZ-01 | — | **SUPERSEDED** — do not re-dispatch | closed by sibling wave |

**Does NOT promote:** `payroll_e2e_ready` · `settings_catalog_e2e_ready` · module UAT · J-HRM-07

---

## 6. QA verdict

**PASS_WITH_BLOCKED → PASS_TO_PM**

Closed vs QA-01: honest FE bootstrap of **pay_types** + free-text salary **instance** create **201 + F5**. Positive **CatalogSearchPicker** (AC-PAY-COMP-01 when Settings `salary_components` >0) and invent-code negative remain **blocked** by O4 key/density — not by TDZ.

---

## completion_report

**Closed:** L0; vitest 41/41; U65 browser — Settings FE create `pay_types`; Lương → Thành phần lương → Thêm free-text + pay_types pick → POST 201 `QA_TP_IRUZ2O` → F5 persist; starter rows confirmed; empty-catalog fallback; TDZ not re-opened; honesty `payroll_e2e_ready=false`.

**Residual:** O4 Settings `salary_components` key absent → CatalogSearchPicker + invent AC still BLOCKED.

## next_owner

**pm** → dispatch **dev-be** (preferred) to expose/synthesize Settings overview key `salary_components` for HRM extension create without XBOS publish (or unlock P2 path) → then **qa** retest AC-PAY-COMP-01 picker + invent.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01
from_role: pm
to_role: dev-be
lane: execution
parent: PO-HRM-E2E-LINK-PAY-CFG-QA-02
priority: P1

## Mission
Unblock Settings FE density for storageKey `salary_components` (AC-PAY-COMP-01 picker SoT).

## Context (QA-02)
- pay_types: HRM Settings FE create works; XBOS config-sync catalog still 404
- salary_components: key ABSENT from GET /settings-catalogs overview → Select cannot add extension items
- Payroll PAY-CATALOG-BE starters (LUONG_CO_BAN…) exist but do NOT drive CatalogSearchPicker
- XBOS apply-to-members: salary_components is P2 HOLD
- U65: no seed; cấm flip payroll_e2e_ready

## Options (pick + implement minimal)
A) Synthesize empty overview row for salary_components (like allowance_deduction_types) so Settings Select can FE-append extension items
B) On payroll starter ensure, also register Settings effective items for same codes (dual-write — only if ADR/SA allows)
C) Document + SA ADR if starters should become picker SoT — then FE salaryComponentOptionsFromCatalog merge

## exit
- Settings Select shows «Thành phần lương (danh mục)»
- FE can POST extension item → effectiveItems > 0
- evidence: docs/qa/evidence/po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md
- READY_FOR_QA → PO-HRM-E2E-LINK-PAY-CFG-QA-03 (picker + invent + F5)
```

## evidence_path

`docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md`
