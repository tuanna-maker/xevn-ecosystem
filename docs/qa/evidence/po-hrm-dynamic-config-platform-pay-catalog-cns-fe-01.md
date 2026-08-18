# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01` CONFIRMED Option **B** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-BE-01` |
| **ref_ba** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-BA-01.md) |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-SA-01.md) |
| **change_mode** | ADD |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · browser AC for QA |
| **Honesty** | `payroll_e2e_ready=false` · DENY formula LIVE · `C-SLICE-≠-MODULE` · seals RETAIN |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| BA-01 | §4 S-PAY-CNS-01..05 · AC-PLT-PAY-01/01b/01c/01H · AC-PAY-COMP-01 · L-PAY-AC-01 admin≠consumer |
| SA-01 | Option **B** LOCKED · F-PLT-PAY-COMP-01 Nest SoT · Settings REJECT sole SoT |
| API-01 | `GET /api/hrm/payroll/salary-components` |
| Peer FE | DEC/EMP/ATT `use*Effective` + CatalogSearchPicker |

---

## 2. Deliverable

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/salaryComponentCatalog.ts` | Nest → picker helpers · empty hint · soft warn · honesty=false |
| `apps/web/hrm/src/lib/salaryComponentCatalog.test.ts` | **4 PASS** |
| `apps/web/hrm/src/hooks/useSalaryComponentsEffective.ts` | RQ cache F-PLT-PAY-COMP-01 |
| `apps/web/hrm/src/hooks/useSalaryComponents.ts` | `listCompanyId` scope + invalidate effective pickers after admin mutate |
| `SalaryComponentsTab.tsx` | **Admin CREATE open free-text N+1** — removed Settings catalog ceiling |
| `EmployeeCompensationPanel.tsx` | Nest `component_code` CatalogSearchPicker · empty Nest VI · invent gate |
| `PayFormulaAuthorPanel.tsx` | Nest picker soft (VAL-PAY-CNS-07) · DENY LIVE |
| `PaySheetTemplateSettingsPanel.tsx` | Empty Nest VI on line picker |
| `SalaryTemplatesTab.tsx` | Empty Nest VI on add-component |
| `catalogSearchPicker.ts` | Settings `salaryComponentOptionsFromCatalog` **deprecated** as sole SoT |
| `salaryComponentFormSchema.ts` (+ test) | Admin passes `[]` allowed codes; consumer helper retained |

---

## 3. Surface matrix (FE)

| Surf | Before | After |
|------|--------|-------|
| **S-PAY-ADM-01** | Settings CatalogSearchPicker when Settings density >0 | Open Input N+1 (AC-PLT-PAY-01c) · pay_types REF kept |
| **S-PAY-CNS-01** Template | Nest via `listSalaryComponents` / `useSalaryComponents` | Nest retained + empty VI AC-PLT-PAY-01b |
| **S-PAY-CNS-02** Period pack | Template FK Nest (period form) | Unchanged; spot empty Nest on tpl lines |
| **S-PAY-CNS-03** Compensation | Hardcoded `phu_cap_*` invent | Nest picker + membership gate |
| **S-PAY-CNS-04** History | Read-only | Unchanged (must_keep) |
| **S-PAY-CNS-05** Formula | Free-text Input | Nest CatalogSearchPicker soft |
| **S-PAY-REF-01** Settings | Was false SoT | Deprecated as sole picker SoT |

---

## 4. Vitest

```text
salaryComponentCatalog.test.ts — 4 PASS
salaryComponentFormSchema.test.ts — 11 PASS
compensationLines.test.ts — 9 PASS
# catalogSearchPicker.test.ts — suite FAIL preload @/lib/employeeCompanyDisplayName (pre-existing; not this seat)
```

Command:

```bash
pnpm exec vitest run hrm/src/lib/salaryComponentCatalog.test.ts hrm/src/components/payroll/__tests__/salaryComponentFormSchema.test.ts hrm/src/lib/compensationLines.test.ts
```

---

## 5. Honesty / must_keep

| Flag / seal | Value |
|-------------|-------|
| `payroll_e2e_ready` | **false** — DENIED flip |
| Formula LIVE | **DENIED** — soft picker only |
| J-HRM-07 / LIST-TOTALS / ESS | **RETAIN** — not touched |
| PAY-CATALOG / EXT / EMP / DEC / CTR | **SEAL RETAIN** |
| Seed | **DENIED** |
| `C-SLICE-≠-MODULE` | Catalog consumer rebind ≠ module PAY UAT |

---

## 6. QA browser plan (U65)

1. **AC-PLT-PAY-01c** — Payroll → Thành phần → Thêm mã N+1 free-text → 201 → F5 (admin open).
2. **AC-PLT-PAY-01** — Nest ≥1 → Mẫu phiếu / Settings mẫu → Thêm dòng → Network GET `salary-components` → pick Nest → Lưu 2xx → F5.
3. **AC-PLT-PAY-01b** — Nest=0 → picker empty + VI; no fake rows.
4. **AC-PAY-COMP-01** — Đãi ngộ: invent blocked on FE when Nest >0; BE CNS assert peer.
5. **VAL-PAY-CNS-07** — Formula: Nest picker; no LIVE claim.
6. **AC-PLT-PAY-01H** — Evidence honesty false.

Persona: `ceo@xe.vn` · browser-only · zero-seed.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |
| **next_dispatch_prompt** | See completion_report below |
| **residual** | catalogSearchPicker.test preload miss (pre-existing); CNS-BE parallel assert; browser U65 |
