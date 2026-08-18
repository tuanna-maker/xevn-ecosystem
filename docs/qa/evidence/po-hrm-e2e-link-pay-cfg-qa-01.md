# Evidence — PO-HRM-E2E-LINK-PAY-CFG-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-CFG-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **u65** | zero-seed · browser-only |
| **hdsd_align** | Lương → Thành phần lương → Thêm mới |
| **honesty** | `payroll_e2e_ready=false` |
| **ack_status** | **PASS_TO_PM** (slice GWC — see blocked) |
| **overall** | **PASS_WITH_BLOCKED** |

---

## 0. Spec / dev read ack

| Artifact | Use |
|----------|-----|
| `docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` | AC-PAY-COMP-01 · P0-PAY-03 |
| `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-exec-fe-01.md` | READY_FOR_QA scope |

---

## 1. Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| `vitest` (dev unit) | 41/41 PASS — `catalogSearchPicker.test.ts` + `salaryComponentFormSchema.test.ts` |
| commit | `dc930c5` |

---

## 2. Browser UF matrix (U65)

**Account:** `ceo@xe.vn` / `Xevn@2026`  
**Portal:** `http://127.0.0.1:5173/hr/payroll?portal=1&companyId=main`

### UF-HRM-MENU-12 — Thành phần lương → Thêm mới

| Step | Expected | Actual | Verdict |
|------|----------|--------|---------|
| Login → Lương → tab **Thành phần lương** | Tab load, no ERROR banner | PASS — no sync/409 banner | 🟢 |
| O4 prep: Settings → **Đồng bộ từ XBOS** (no seed) | POST sync 2xx | POST `/settings-catalogs/sync-from-xbos` **201** | 🟢 |
| Probe `salary_components` effective items | >0 for AC-PAY-COMP-01 positive | **0** after sync (API + FE overview) | 🟡 BLOCKED |
| **Thêm mới** dialog | Opens | Dialog «Thêm mới thành phần lương» opens | 🟢 |
| Catalog **empty** → Mã field | Free-text Input (honest fallback) | Input `VD: LUONG_CO_BAN` — **no** `pay-salary-component-catalog-picker` | 🟢 AC-PAY-COMP-01 empty branch |
| Catalog **empty** → Loại (`pay_types`) | Honest empty + CTA Settings | Yellow hint + link «Mở Cài đặt — Danh mục nghiệp vụ (pay_types)» | 🟢 |
| Catalog **>0** → Mã | `CatalogSearchPicker` required | **Not exercised** — catalog count 0 | 🟡 BLOCKED |
| Invent code when catalog >0 | Zod block, no POST | **Not exercised** | 🟡 BLOCKED |
| Lưu → POST 2xx → F5 row còn | Persist instance | **BLOCKED** — `pay_types` also empty; cannot pick componentType to submit | 🟡 |

**Click path:** Login → `/hr/payroll` → (race) tab Thành phần lương → Thêm mới → observe Mã/Loại fields.

**Screenshots:** `docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-01/`

**Machine JSON:** `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-cfg-qa-01-browser.json`

---

## 3. AC summary

| AC / Layer | Verdict | Notes |
|------------|---------|-------|
| L2 payroll / components tab | 🟢 PASS | |
| AC-PAY-COMP-01 (catalog >0 picker) | 🟡 **BLOCKED** | `salary_components` effectiveItems=0 after XBOS sync 201 |
| AC-PAY-COMP-01 (empty fallback) | 🟢 PASS | Free-text Mã when catalog empty |
| AC-PAY-COMP-01 (empty honest CTA) | 🟢 PASS | `pay_types` empty CTA visible in dialog (screenshot 03-add-dialog) |
| UF mutate + F5 | 🟡 **BLOCKED** | Form incomplete — no pay_types item to select |
| CONSOLE-GATE | 🟢 PASS | No uncaught after components-tab race (see residual TDZ) |
| Unit AC-PAY-COMP-01 | 🟢 PASS | Zod rejects invent code when allowed catalog codes provided |

---

## 4. Residual / defects (not promoted)

| ID | Severity | Symptom | Owner |
|----|----------|---------|-------|
| **D-PAY-BATCHES-TDZ-01** | P1 | `PayrollBatchesTab.tsx`: `enabled: showAddDialog` **before** `useState` → `ReferenceError: Cannot access 'showAddDialog' before initialization` when bootstrap switches to tab Tính lương (live payslips >0) | dev-fe |
| **O4-CATALOG-DENSITY-01** | P1 | After FE sync 201, `salary_components` + `pay_types` still 0 for `main` — blocks positive AC-PAY-COMP-01 browser + create UF | dev-be / devops / ba (O4 publish density) |
| P0-PAY-01 | P0 | Hire→payslip spine (out of slice) | program |
| P0-PAY-04 | P2 | fake batch toast | dev-fe |

**Workaround observed:** Navigate to tab **Thành phần lương** before/alongside payslip bootstrap avoids TDZ crash on this run; **not** a user-safe fix.

---

## 5. J-* / journey

| Journey | Scope | Result |
|---------|-------|--------|
| J-XBOS-CTRL-01 | Spot — Settings sync before PAY | 🟢 sync POST 201 |
| J-HRM-07 | Payslip detail | ⚪ out of scope |
| L2.5 cross-nav list→detail | N/A this slice | — |

---

## 6. QA verdict

**Slice verdict:** **PASS_WITH_BLOCKED** — FE empty-catalog path and unit AC-PAY-COMP-01 logic verified; **positive catalog-bound picker + mutate/F5 not claimable** until O4 catalog has items on `main`.

**Does NOT promote:** `payroll_e2e_ready=false` · `settings_catalog_e2e_ready=false`

---

## completion_report

**Closed (QA):** L0 stack; browser U65 path to Thành phần lương → Thêm; empty-catalog free-text fallback + pay_types honest CTA; Settings sync-from-xbos 201 without seed; unit 41/41 AC-PAY-COMP-01.

**Blocked (honest):** Catalog-bound picker when `salary_components` >0; invent-code negative; POST+F5 create — catalog density 0 on `main` after sync.

**Open:** D-PAY-BATCHES-TDZ-01; O4 catalog density; full payroll E2E per spec residual.

## next_owner

**pm** → dispatch **dev-fe** (TDZ hotfix) + **dev-be/devops** (O4 catalog items on main) → **qa** retest positive AC-PAY-COMP-01

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-FE-TDZ-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-ALL-MENU-E2E-LINK-01
priority: P1

## Mission
Fix PayrollBatchesTab TDZ: move `const [showAddDialog,...]` above `usePaySheetTemplates({ enabled: showAddDialog })`.
Regression: vitest + browser /hr/payroll with live payslips must not white-screen.

## Then
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-QA-02
to_role: qa
entry: O4 salary_components + pay_types effectiveItems > 0 on main (after devops/BE density or XBOS publish)
exit: AC-PAY-COMP-01 picker required · invent blocked · POST 2xx · F5 persist · payroll_e2e_ready=false
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md
```

## evidence_path

`docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-01.md`
