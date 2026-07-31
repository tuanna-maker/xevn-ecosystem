# QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-01 — SoftDel + BH enroll smoke · Dev8088

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · post VPS enroll deploy · Cursor sole |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **hrm_embed** | `http://14.225.217.232:8080` (+ portal `/hr/*`) |
| **entry** | `DO-HDSD-MUTATE-SOFTDEL-BH-DEPLOY-01` PASS_TO_PM · SHA **`424ddaf`** · `docs/ops/evidence/do-hdsd-mutate-softdel-bh-deploy-01-20260801.md` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no** API-only PASS · **cấm** demote local matrix 🟢 |
| **ack_status** | **FAIL_TO_PM** |
| **harness** | reuse `qa-hdsd-bf-03-softdel-ret-01-browser.mjs` + `qa-hdsd-bf-03-bh-ret-02-browser.mjs` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · `HRM_API_URL=http://14.225.217.232:3001` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-bh-8088-smoke-01-softdel-runtime.json` · `…-bh-runtime.json` |
| **prior local** | SoftDel RET-01 🟢 · BH RET-02 🟢 (`:5173`) — **not demoted** |

## Executive verdict

**FAIL_TO_PM** — Dev8088 cannot execute TC-025 SoftDel or TC-049 Thêm BH enroll dialog after deploy `424ddaf`.

| TC | Dev8088 | Why |
|----|---------|-----|
| **TC-HRM-HDSD-025** SoftDel | 🔴 **BLOCKED** | Vite **500** — `Employees.tsx` cannot resolve `@/lib/employeeCompanyDisplayName` (file **untracked locally**, not in allow-list commit) |
| **TC-HRM-HDSD-025** row→profile | 🔴 **BLOCKED** | Same Employees module fail → **0 rows** / no UI |
| **TC-HRM-HDSD-049** Thêm BH | 🔴 **BLOCKED** | Vite **500** — `AddInsuranceDialog.tsx` cannot resolve `@/hooks/useSettingsCatalogsOverview` (also **untracked**) → Insurance page dynamic import fails → dialog miss |
| Master create / `insurer_label` DTO | **N/A** (waived) | Per dispatch: **không FAIL** for DTO master path — never reached; root cause is missing FE modules + policies API 404 |
| Local matrix TC-025 / TC-049 🟢 | **preserved** | No promote/demote of `HDSD_SRS_TESTCASE_MATRIX.md` · no UF Dev8088 demote |

**Root cause class:** incomplete allow-list deploy (FE imports committed without dependency files) + VPS HRM BE missing `insurance-policies` routes (404).

---

## L0 (public VPS)

| Probe | Result |
|-------|--------|
| `http://14.225.217.232:8088/` | **200** |
| `http://14.225.217.232:8080/` | **302**/SPA OK |
| `http://14.225.217.232:3001/api/hrm/metrics` | **200** |
| `http://14.225.217.232:28002/api/xbos/metrics` | **200** |
| XBOS login `:28002` / portal proxy `:8088` | **201** |
| Employees API `GET /api/hrm/employees?company_id=main` | **200** (total **42**) — API OK; **FE module broken** |

---

## TC-025 SoftDel — click path (attempted)

1. Login session `ceo@xe.vn` → `http://14.225.217.232:8088/hr/employees?portal=1&tenantId=xevn&companyId=main`.
2. **Observed:** page shell loads; **Employees** chunk **500**.
3. Console / Vite: `Failed to resolve import "@/lib/employeeCompanyDisplayName" from "src/pages/Employees.tsx"`.
4. PageError: `Failed to fetch dynamically imported module: …/Employees.tsx`.
5. UI: **no table rows**, **no** «Thêm nhân viên» → cannot ⋯ → Xóa → AlertDialog → archive.
6. Network: **0** POST `/employees/*/archive` (honest — no false 🟢).

**Verdict TC-025 Dev8088:** 🔴 BLOCKED (deploy incomplete) — **not** a regression of SoftDel AlertDialog isolation logic validated on `:5173`.

---

## TC-049 Thêm BH — click path (attempted)

1. Preflight API (auth):
   - `GET …/contracts-insurance/insurance-policies?company_id=main` → **404** `HRM-DATA-404` (route absent on VPS BE).
   - `GET …/insurance-policy-participants` → **200** `HRM-INS-P-200` (total 1).
   - `GET …/contracts-insurance/insurance` → **200** `HRM-CON-200` (total 1).
2. Browser → `/hr/insurance`:
   - `AddInsuranceDialog.tsx` Vite **500**: missing `@/hooks/useSettingsCatalogsOverview`.
   - PageError: `Failed to fetch dynamically imported module: …/Insurance.tsx`.
   - Dialog **not open** → **0** POST participants (no false 🟢).
3. Master panel / create policy / SM / `insurer_label`: **not exercised** (waived per note; panel inputs unreachable).

**Verdict TC-049 Dev8088:** 🔴 BLOCKED — enroll/dialog path unreachable; DTO residual **not** used as FAIL reason.

---

## Spec says / code does (Dev8088)

| Layer | Spec / DoD | Observed on `:8088` @ `424ddaf` |
|-------|------------|----------------------------------|
| SoftDel FE | ⋯ → Xóa → AlertDialog → POST archive 2xx → F5 | **BLOCKED** — Employees module 500 |
| BH picker | policy_id → POST participants 201 → F5 | **BLOCKED** — AddInsuranceDialog 500 |
| BE policies | list active policies for picker | **404** `insurance-policies` on `:3001` |
| Local SoftDel/BH | already 🟢 on `:5173` | **unchanged** — must_keep |

---

## Residual (P0 — block UAT SoftDel/BH on Dev8088)

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| **R-8088-FE-SOFTDEL-IMPORT-01** | Commit + redeploy `apps/web/hrm/src/lib/employeeCompanyDisplayName.ts` (+ `.test.ts` if pack) so `Employees.tsx` Vite resolves | **P0** | **devops** (+ verify file tracked on `main`) |
| **R-8088-FE-BH-IMPORT-01** | Commit + redeploy `apps/web/hrm/src/hooks/useSettingsCatalogsOverview.ts` so `AddInsuranceDialog` resolves | **P0** | **devops** |
| **R-8088-BE-INS-POL-404-01** | VPS HRM BE `GET/POST …/contracts-insurance/insurance-policies` returns **404** — rebuild/redeploy BE image with E3 policy routes | **P0** | **devops** / **dev-be** |
| R-INS-POL-CREATE-LABEL-01 / SM company_id | Master DTO (local residuals) | P2 | deferred — **waived** this smoke; retest after FE modules + policies API live |

**Local greens:** TC-025 / TC-049 / UF-HRM-01/03/04 Dev8088 historical list notes — **not demoted**.

---

## Matrix / Dev8088 note

- `HDSD_SRS_TESTCASE_MATRIX.md`: **no row mutate** (cấm demote local 🟢).
- `USER_FLOW_OPERABILITY_MATRIX.md` UF-HRM-*: **no verdict change**. Evidence-only: SoftDel/BH **mutate** smoke on Dev8088 **BLOCKED** until residuals closed; prior R4 list-load notes remain historical.

---

## Command table

| Command / check | Result |
|-----------------|--------|
| Public L0 curl portal/hrm/xbos | **200** / login **201** |
| `PORTAL_DEV_URL=…:8088 node scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` | exit **2** · TC-025 🔴 · stamp `SD8GSF1W` |
| `PORTAL_DEV_URL=…:8088 HRM_API_URL=…:3001 node scripts/qa/qa-hdsd-bf-03-bh-ret-02-browser.mjs` | exit **0** harness but ack_hint **FAIL_TO_PM** · TC-049 🔴 · stamp `BH28GTSRI` |
| Vite Employees import | **500** missing `employeeCompanyDisplayName` |
| Vite AddInsuranceDialog import | **500** missing `useSettingsCatalogsOverview` |
| `git status` deps (workstation) | both files **`??` untracked** — explain allow-list gap vs committed importers |

---

## Handoff

**completion_report:** Post-deploy SoftDel+BH smoke on `:8088` after `424ddaf` **FAIL**. TC-025 and TC-049 unreachable: FE Vite missing untracked deps imported by committed SoftDel/BH files; BE `insurance-policies` **404**. U65 browser-only; **0** false archive/participants 2xx. Local matrix SoftDel/BH 🟢 **not demoted**. Master `insurer_label` DTO **not** used as fail reason.

**next_owner:** `pm` → **devops** (redeploy allow-list + BE policies) then **qa** retest same WI

**next_dispatch_prompt:**

```text
work_item_id: DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-01
from_role: pm | to_role: devops
program: P-HDSD-ECOSYSTEM-03 · residual R-8088-FE-SOFTDEL-IMPORT-01 + R-8088-FE-BH-IMPORT-01 + R-8088-BE-INS-POL-404-01
entry_criteria:
- QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-01 FAIL_TO_PM
- evidence docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-01-20260801.md
exit_criteria:
- Commit track + push: apps/web/hrm/src/lib/employeeCompanyDisplayName.ts (+ test) · apps/web/hrm/src/hooks/useSettingsCatalogsOverview.ts
- Redeploy server-dev HRM FE so Vite resolves Employees + AddInsuranceDialog (no 500 on module fetch)
- Redeploy HRM BE so GET /api/hrm/contracts-insurance/insurance-policies?company_id=main returns 200 (not 404)
- Smoke: curl Employees.tsx / AddInsuranceDialog.tsx 200 JS; policies GET 200 with auth
- PASS_TO_PM → re-dispatch QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-01 (TC-025 archive 2xx + TC-049 participants 201)
cấm: seed · demote local TC-025/049 greens · claim SoftDel/BH UAT without browser retest
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-01-20260801.md`

**ack_status:** **FAIL_TO_PM**
