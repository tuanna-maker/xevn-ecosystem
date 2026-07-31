# QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-02 — SoftDel + BH enroll retest · Dev8088

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-02` |
| **program** | `P-HDSD-ECOSYSTEM-03` · post redeploy unblock · Cursor sole |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **hrm_embed** | `http://14.225.217.232:8080` (+ portal `/hr/*`) |
| **entry** | `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-01` READY_FOR_QA · VPS HEAD **`3920df3`** · `docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-01-20260801.md` |
| **prior FAIL** | `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-01` · `docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-01-20260801.md` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no** API-only PASS · **cấm** demote local matrix 🟢 |
| **ack_status** | **FAIL_TO_PM** |
| **harness** | `scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` + `qa-hdsd-bf-03-bh-ret-02-browser.mjs` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · `HRM_API_URL=http://14.225.217.232:3001` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-bh-8088-smoke-02-softdel-runtime.json` · `…-bh-runtime.json` · vite probe `…-vite-probe.json` |
| **local greens** | TC-025 / TC-049 on `:5173` — **not demoted** |

## Executive verdict

**FAIL_TO_PM** — Redeploy closed **prior** Vite deps + policies **404**, but SoftDel/BH **mutate** still unreachable on Dev8088 due to **next allow-list gap**.

| Prior residual (SMOKE-01) | Status after REDEPLOY + SMOKE-02 |
|---------------------------|----------------------------------|
| **R-8088-FE-SOFTDEL-IMPORT-01** `employeeCompanyDisplayName` | **CLOSED** — `/hr/src/lib/employeeCompanyDisplayName.ts` Vite **200** (real module, not SPA shell) |
| **R-8088-FE-BH-IMPORT-01** `useSettingsCatalogsOverview` | **CLOSED** — `/hr/src/hooks/useSettingsCatalogsOverview.ts` Vite **200** |
| **R-8088-BE-INS-POL-404-01** policies route | **CLOSED** — auth GET **200** `HRM-INS-POL-200` · total **7** · active **3** (not 404) |

| TC | Dev8088 | Why |
|----|---------|-----|
| **TC-HRM-HDSD-025** SoftDel | 🔴 **BLOCKED** | Vite **500** — `Employees.tsx` cannot resolve `@/lib/hdsdMutateTestIds` (file **absent** in container; GET returns SPA HTML shell **200** false-positive) |
| **TC-HRM-HDSD-025** row→profile | 🔴 **BLOCKED** | Same Employees module fail → **0 rows** |
| **TC-HRM-HDSD-049** Thêm BH | 🔴 **BLOCKED** | Vite **500** — `AddInsuranceDialog.tsx` (+ `InsurancePolicyMasterPanel`) cannot resolve `@/components/common/CatalogSearchPicker` → Insurance lazy path fails → dialog miss · **0** POST participants |
| Local matrix TC-025 / TC-049 🟢 | **preserved** | No promote/demote of `HDSD_SRS_TESTCASE_MATRIX.md` |

**Root cause class:** incomplete allow-list round 2 — SoftDel/BH importers committed on `main` (`3920df3` / `0148d13`) without `hdsdMutateTestIds` + `CatalogSearchPicker` modules. DevOps L0 curl of missing `.ts` can return **200 SPA shell** — must assert **Vite transform body** (not HTML) or import-analysis **500** from importer.

**HEAD note:** Entry asked ≥ `8a8a359` (docs commit on top of `3920df3`). VPS product HEAD = **`3920df3`** (parent). Gap is **missing files**, not docs SHA alone.

---

## L0 / unblock probes (workstation → VPS)

| Probe | Result |
|-------|--------|
| `GET :8088/` | **200** |
| `GET :8080/` | **302**/SPA OK |
| `GET :3001/api/hrm/metrics` | **200** |
| Policies unauth | **401** (route exists — not 404) |
| Policies auth (harness login) | **200** `HRM-INS-POL-200` · total 7 · active 3 |
| `/hr/src/lib/employeeCompanyDisplayName.ts` | **200** real module |
| `/hr/src/hooks/useSettingsCatalogsOverview.ts` | **200** real module |
| `/hr/src/lib/hdsdMutateTestIds.ts` | **200 SPA HTML shell** (`isHtmlShell=true`, len≈1358) — **file missing** |
| `/hr/src/pages/Employees.tsx` | **500** resolve `@/lib/hdsdMutateTestIds` |
| `/hr/src/pages/Insurance.tsx` | **200** (page compiles) |
| `/hr/src/components/insurance/AddInsuranceDialog.tsx` | **500** resolve `@/components/common/CatalogSearchPicker` |
| `/hr/src/components/insurance/InsurancePolicyMasterPanel.tsx` | **500** same `CatalogSearchPicker` |

---

## TC-025 SoftDel — click path (attempted)

1. Login session `ceo@xe.vn` → `http://14.225.217.232:8088/hr/employees?portal=1&tenantId=xevn&companyId=main`.
2. **Observed:** PageError `Failed to fetch dynamically imported module: …/Employees.tsx`.
3. Vite: `Failed to resolve import "@/lib/hdsdMutateTestIds" from "src/pages/Employees.tsx"`.
4. UI: **no table rows**, **no** «Thêm nhân viên» → cannot ⋯ → Xóa → AlertDialog → archive.
5. Network: **0** POST `/employees/*/archive` (honest — no false 🟢).
6. stamp `SD8KPU9O`.

**Verdict TC-025 Dev8088:** 🔴 BLOCKED — **not** SoftDel AlertDialog regression (local `:5173` still 🟢 must_keep).

---

## TC-049 Thêm BH — click path (attempted)

1. Preflight API (auth via harness):
   - `GET …/contracts-insurance/insurance-policies?company_id=main` → **200** `HRM-INS-POL-200` (total 7, active 3) — **prior 404 CLOSED**.
   - participants / insurance list **200**.
2. Browser → `/hr/insurance`:
   - PageError: `Failed to fetch dynamically imported module: …/Insurance.tsx` (lazy child `AddInsuranceDialog` 500).
   - Dialog **not open** → **0** POST participants (no false 🟢).
3. Create-policy path skipped (active≥1) but enroll unreachable.

**Verdict TC-049 Dev8088:** 🔴 BLOCKED — dialog unreachable; BE policies OK.

---

## Spec says / code does (Dev8088)

| Layer | Spec / DoD | Observed on `:8088` @ `3920df3` |
|-------|------------|----------------------------------|
| SoftDel FE | ⋯ → Xóa → AlertDialog → POST archive 2xx → F5 | **BLOCKED** — Employees 500 (`hdsdMutateTestIds`) |
| BH picker | policy_id → POST participants 201 → F5 | **BLOCKED** — AddInsuranceDialog 500 (`CatalogSearchPicker`) |
| BE policies | list active policies | **PASS** — 200 + active≥1 |
| Prior Vite deps | employeeCompanyDisplayName + useSettingsCatalogsOverview | **PASS** |
| Local SoftDel/BH | already 🟢 on `:5173` | **unchanged** — must_keep |

---

## Residual (P0 — block UAT SoftDel/BH on Dev8088)

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| **R-8088-FE-SOFTDEL-TESTIDS-01** | Commit + redeploy `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` (+ any sibling test) so `Employees.tsx` Vite resolves; verify GET is **module** not SPA shell | **P0** | **devops** (+ track on `main`) |
| **R-8088-FE-BH-CATALOG-PICKER-01** | Commit + redeploy `apps/web/hrm/src/components/common/CatalogSearchPicker` (and deps) so `AddInsuranceDialog` + `InsurancePolicyMasterPanel` resolve | **P0** | **devops** / **dev-fe** |
| ~~R-8088-FE-SOFTDEL-IMPORT-01~~ | employeeCompanyDisplayName | — | **CLOSED** |
| ~~R-8088-FE-BH-IMPORT-01~~ | useSettingsCatalogsOverview | — | **CLOSED** |
| ~~R-8088-BE-INS-POL-404-01~~ | insurance-policies 404 | — | **CLOSED** |
| R-INS-POL-CREATE-LABEL-01 / SM company_id | Master DTO (local) | P2 | deferred — waived this smoke |

**Local greens:** TC-025 / TC-049 — **not demoted**.

**QA note for DevOps smoke:** assert importer transform **500→200** (`Employees.tsx`, `AddInsuranceDialog.tsx`) OR file body starts with TS/JS (not `<!doctype html>`).

---

## Matrix / Dev8088 note

- `HDSD_SRS_TESTCASE_MATRIX.md`: **no row mutate** (cấm demote local 🟢).
- `USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-*: **no verdict change**. Evidence-only: SoftDel/BH mutate on Dev8088 still **BLOCKED** until residuals closed.

---

## Command table

| Command / check | Result |
|-----------------|--------|
| Public L0 curl portal/hrm | **200** |
| Policies auth harness | **200** `HRM-INS-POL-200` |
| `PORTAL_DEV_URL=…:8088 node scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` | exit **2** · TC-025 🔴 · stamp `SD8KPU9O` |
| `PORTAL_DEV_URL=…:8088 HRM_API_URL=…:3001 node scripts/qa/qa-hdsd-bf-03-bh-ret-02-browser.mjs` | exit **0** harness · ack_hint **FAIL_TO_PM** · TC-049 🔴 · stamp `BH2…` |
| Vite Employees | **500** missing `hdsdMutateTestIds` |
| Vite AddInsuranceDialog | **500** missing `CatalogSearchPicker` |
| Seed | **none** (U65) |

---

## Handoff

**completion_report:** Post-redeploy SoftDel+BH smoke on `:8088` after `3920df3` **FAIL**. Prior SMOKE-01 residuals (employeeCompanyDisplayName, useSettingsCatalogsOverview, policies 404) **CLOSED**. TC-025/049 still unreachable: missing `hdsdMutateTestIds` + `CatalogSearchPicker` (SPA-shell 200 trap). U65 browser-only; **0** false archive/participants 2xx. Local matrix SoftDel/BH 🟢 **not demoted**.

**next_owner:** `pm` → **devops** (redeploy allow-list gap #2) then **qa** SMOKE-03

**next_dispatch_prompt:**

```text
work_item_id: DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02
from_role: pm | to_role: devops
program: P-HDSD-ECOSYSTEM-03 · residual R-8088-FE-SOFTDEL-TESTIDS-01 + R-8088-FE-BH-CATALOG-PICKER-01
entry_criteria:
- QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-02 FAIL_TO_PM
- evidence docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-02-20260801.md
- prior CLOSED: employeeCompanyDisplayName · useSettingsCatalogsOverview · insurance-policies 200
exit_criteria:
- Commit track + push: apps/web/hrm/src/lib/hdsdMutateTestIds.ts (+ test if needed)
- Commit track + push: apps/web/hrm/src/components/common/CatalogSearchPicker* (and transitive FE deps AddInsuranceDialog/MasterPanel need)
- Redeploy server-dev HRM FE (portal :8088 / :8080)
- Smoke MUST prove: GET /hr/src/pages/Employees.tsx → 200 (not 500); GET /hr/src/components/insurance/AddInsuranceDialog.tsx → 200
- Smoke MUST prove: GET /hr/src/lib/hdsdMutateTestIds.ts body is module (NOT <!doctype html> SPA shell)
- PASS_TO_PM → re-dispatch QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03 (TC-025 archive 2xx + TC-049 participants 201)
cấm: seed · demote local TC-025/049 greens · claim SoftDel/BH UAT without browser retest · trust bare 200 on missing path without body check
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-02-20260801.md`

**ack_status:** **FAIL_TO_PM**
