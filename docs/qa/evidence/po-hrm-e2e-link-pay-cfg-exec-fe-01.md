# Evidence — PO-HRM-E2E-LINK-PAY-CFG-EXEC-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-CFG-EXEC-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **parent** | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| **date** | 2026-08-07 |
| **priority** | P1 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · `settings_catalog_e2e_ready=false` (O4 partial) · U65 zero-seed |

---

## 0. Spec read ack

| Artifact | § / AC |
|----------|--------|
| `docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` | A2.1 key lock `salary_components` · P0-PAY-03 · AC-PAY-COMP-01 |
| `docs/qa/evidence/po-hrm-amis-parity-ba-01.md` | PAY Step2 orphan catalog · bind picker P0 |

---

## 1. Scope closed (FE)

| Gap class | Fix |
|-----------|-----|
| **C-ORPHAN-FIELD** P0-PAY-03 | Add dialog: khi Settings `salary_components` có `effectiveItems > 0` → **CatalogSearchPicker** thay Input mã/tên tự do |
| **Dual SoT** | Mã + tên snapshot lấy từ catalog; Zod `getAllowedCatalogCodes` reject invent code |
| **pay_types** (existing) | Giữ CatalogSearchPicker `componentType` — không regression |

### Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | `salaryComponentOptionsFromCatalog` · `resolveSalaryComponentLabel` · `buildSalaryComponentCatalogFields` |
| `apps/web/hrm/src/components/payroll/salaryComponentFormSchema.ts` | Catalog-bound code validation (AC-PAY-COMP-01); free-text path khi catalog rỗng |
| `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | Add dialog catalog picker + auto-fill name; filter mã đã tồn tại; list label U72 |
| `apps/web/hrm/src/lib/catalogSearchPicker.test.ts` | +2 cases AC-PAY-COMP-01 |
| `apps/web/hrm/src/components/payroll/__tests__/salaryComponentFormSchema.test.ts` | +3 cases catalog vs free-text |

---

## 2. Behavior (U65 browser QA path)

### UF-HRM-MENU-12 / tab Thành phần lương — Thêm mới

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → Lương → Thành phần lương → **Thêm mới** | Dialog mở |
| Settings đã có `salary_components` items (sau pull/sync FE) | Field **Mã** = `CatalogSearchPicker` (`data-testid=pay-salary-component-catalog-picker`); **Tên** read-only, auto từ nhãn catalog |
| Chọn mã + bản chất `pay_types` + Lưu | POST 2xx → row list có mã catalog; F5 còn |
| Catalog rỗng | Fallback Input mã/tên (honest empty + CTA Settings) |
| Gõ mã ngoài catalog khi items > 0 | Zod block submit — không POST invent |

### J-* / journey

| Journey | Status |
|---------|--------|
| J-HRM-07 payslip detail | **Out of scope** — không claim |
| J-XBOS-CTRL-01..03 O4 sync→picker | QA spot: sau sync, picker có options (CAT-01) |

---

## 3. Automated verify (agent)

```text
pnpm exec vitest run \
  src/lib/catalogSearchPicker.test.ts \
  src/components/payroll/__tests__/salaryComponentFormSchema.test.ts
→ 41 passed · exit 0
```

---

## 4. Residual (honest — not promoted)

| ID | Item | Owner |
|----|------|-------|
| P0-PAY-01 | Hire→period→payslip spine break | dev-be + fe (separate wave) |
| P0-PAY-04 | `updateBatch` fake success toast | dev-fe narrow (not this slice) |
| P0-PROC-01 | Processes hard-empty vs §55–58 | PO-HRM-E2E-LINK-PROC-BIND-01 |
| Formula / 0₫ process | AMIS parity PAY Step5 | formula engine wave |
| **payroll_e2e_ready** | **false** | program lock |

---

## 5. QA dispatch matrix

| Layer | Check |
|-------|-------|
| L0 | Stack up |
| L2 | `/payroll` tab Thành phần lương load |
| L2.5 | Add → catalog picker → Lưu → F5 (U65, no seed) |
| Negative | Invent code blocked when catalog has items |
| O4 | Settings sync → picker options match key `salary_components` |

**Account:** `ceo@xe.vn` / `Xevn@2026`  
**hdsd_align:** Lương → Thành phần lương → Thêm mới

---

## completion_report

**Closed:** Catalog-bound salary component create path — kill free-text mã/tên SoT when Settings `salary_components` has items; Zod + vitest; pay_types picker preserved.

**Open:** Full payroll E2E, hire→payslip, fake batch toast, processes bind, formula engine.

## next_owner

**qa**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-QA-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-ALL-MENU-E2E-LINK-01
priority: P1

## Mission
Browser retest PAY catalog picker slice per docs/qa/evidence/po-hrm-e2e-link-pay-cfg-exec-fe-01.md §2–§5.

## entry_criteria
- L0 stack PASS
- Dev FE ack READY_FOR_QA · evidence path above

## exit_criteria
- UF: Lương → Thành phần lương → Thêm — catalog picker when salary_components items exist
- AC-PAY-COMP-01: no free-text invent code POST when catalog > 0
- U65: login → menu → click → Lưu → F5; cấm seed
- honesty: payroll_e2e_ready=false
- ack_status PASS_TO_PM or FAIL with defect + spec_ref

## J-*
- Spot J-XBOS-CTRL-01 (sync catalog) before PAY add if O4 items needed
- J-HRM-07 out of scope this slice

## evidence_path
docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-01.md
```

## evidence_path

`docs/qa/evidence/po-hrm-e2e-link-pay-cfg-exec-fe-01.md`
