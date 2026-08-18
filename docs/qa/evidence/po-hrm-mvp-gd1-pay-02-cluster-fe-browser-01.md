# Evidence — PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution · residual J-HRM-PAY-02-01..04 browser |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 · PAY02QC1 GWC) |
| **date** | 2026-08-10 |
| **depends_on** | FE-01 · QC-01 Residual J-01..04 · must_keep `PAY02QC1-MSMC4GWC1` · `PAY01QC1-MSMBGWC1` |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **C-SLICE** · **≠ PAY-02 / FR-UC-BP-PAY-02 module DONE** · **≠ PAY module UAT** |
| **U65** | zero-seed · browser FE only |

---

## 1. Closed scope

| # | Fix | Status |
|---|-----|--------|
| 1 | **cmdk / CatalogSearchPicker** — `onPointerDown` select · `catalog-picker-search` / `{testid}-search` | **ADD** |
| 2 | **J-02 COMP-01** — `alignGd1EvalLinesToNestCatalog` on seed (BASE gợi ý → Nest code thật) | **ADD** |
| 3 | **SalaryComponentsTab** — `hdsd-pay-salary-component-*` · name input testid | **ADD** |
| 4 | **Payroll** — explicit `payroll-tab-components` | **ADD** |
| 5 | PAY02 FE-01 seals (dual publish · preview lines · assertComp01) | **RETAIN** |

### Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx` | cmdk QA interaction |
| `apps/web/hrm/src/lib/payFormulaCatalog.ts` | `alignGd1EvalLinesToNestCatalog` |
| `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | seed align Nest |
| `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | dialog testids |
| `apps/web/hrm/src/pages/Payroll.tsx` | tab testId |
| `apps/web/hrm/src/lib/payFormulaCatalog.test.ts` | align unit test |
| `apps/web/hrm/src/lib/poHrmMvpGd1Pay02ClusterFeBrowser01.source.test.ts` | source lock |

**Cấm / not done:** flip `payroll_e2e_ready` · claim PAY-02 DONE · seed · demote PAY01QC1.

---

## 2. Route + click path (QA — cite FE-01 §3)

| J-* | Harness notes |
|-----|----------------|
| **J-HRM-PAY-02-01** | `payroll-tab-components` · `hdsd-pay-salary-component-add` · `hdsd-pay-salary-component-type` + `catalog-picker-option-*` |
| **J-HRM-PAY-02-02** | Seed lines → Nest-aligned codes · `hdsd-pay-formula-line-code-{n}` + cmdk · POST draft 2xx |
| **J-HRM-PAY-02-03** | Depends J-02 draft |
| **J-HRM-PAY-02-04** | Preview after draft · `hdsd-pay-formula-preview` |

**Regression:** J-HRM-PAY-01-* · PAY01QC1 RETAIN.

---

## 3. Verify (agent)

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/payFormulaCatalog.test.ts \
  src/lib/salaryComponentCatalog.test.ts \
  src/lib/poHrmMvpGd1Pay02ClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Pay02ClusterFeBrowser01.source.test.ts
# → exit 0 · 4 files · 24 PASS
```

---

## 4. completion_report

- **Closed:** Browser blockers for cmdk picker + salary component dialog testids; seed lines align to Nest catalog so AC-PAY-COMP-01 no longer blocks draft POST on gợi ý `BASE`; PAY02 C-SLICE logic RETAIN.
- **Residual:** QA U65 browser J-HRM-PAY-02-01..04 matrix; `payroll_e2e_ready=false`; ≠ PAY-02 DONE.

## 5. next_owner

`qa`

---

## Footer — honesty

> **honesty:** `payroll_e2e_ready=false` · **C-SLICE** · **≠ PAY-02 module DONE** · **≠ PAY module UAT**  
> must_keep **PAY01QC1-MSMBGWC1** · **PAY02QC1-MSMC4GWC1** · no seed

---

## QA retest — `QA-PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01` (2026-08-10)

| Field | Value |
|-------|--------|
| **stamp** | `PAY02FEBQA1-MSMCDUNG` |
| **ack_status** | **PASS_TO_PM** |
| **J-01..04** | **PASS** (U65 browser) |
| **regression** | vs `PAY02QA1-MSMC9D0I` — **confirm** |
| **evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-pay-02-cluster-fe-browser-01-qa.md` |
