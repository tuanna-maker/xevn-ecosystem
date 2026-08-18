# BUILD-GAP-HRM-COMPANY-EMP-COUNT-01-QA — Company NV column + Tổng NV card

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-HRM-COMPANY-EMP-COUNT-01-QA |
| from_role | qa |
| dev_handoff | BUILD-GAP-HRM-COMPANY-EMP-COUNT-01 · `docs/qa/evidence/build-gap-hrm-company-emp-count-01.md` |
| date | 2026-08-03 |
| ack_status | **PASS_TO_PM** |
| u65_zero_seed | true |
| spec_ref | UC-HRM-03 · BR-INT-05 · `/hr/company` · `hrmCompanyEmployeeCount` restore |

## L0 / L1 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | HRM :28001 · XBOS :28002 · portal :5173 **200** (Node UV assert on process exit — HTTP checks passed) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Vitest `hrmCompanyEmployeeCount.test.ts` | **5/5 PASS** (QA re-run) |

## UF — BUILD_GAP L2 `/hr/company` (not UC-HRM-03 DONE / not UAT DONE)

- **Persona / URL:** `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5173/hr/company?portal=1&tenantId=xevn&companyId=main`
- **Click path:** API login → portal storage inject (U65) → embed URL → observe cards + table → **F5**
- **Trước mutate:** 5 companies listed; no seed in this run
- **Action:** load only — no create/edit company
- **Network:**
  - `GET /api/xbos/tenant-scope/group-member-units` → **200** (initial + F5)
  - `GET /api/hrm/employees/summary?company_id=main` → **200** (initial + F5)
  - `GET /hr/src/lib/hrmCompanyEmployeeCount.ts` → **200** / **304** (no Vite 500 / no resolve failure)
  - `GET /hr/src/components/company/CompanyManagement.tsx` → **200** / **304**
- **FE sau load (SRS / AC scope):**
  - Card **«Tổng nhân viên»** = **47** (sumKnown from live summary — not blank banner)
  - Cột **«Số nhân viên»**: per-row counts **43**, **4**, **0**, **0** (valid numbers; `—` path covered by unit tests when count null)
  - **No** Vite overlay; **no** HRM API Sync ERROR banner
- **Console:** 0 `pageerror`; 0 console `error`
- **F5:** same card/table values; summary + group-member-units **200** again; module still resolves
- **Verdict:** 🟢 **PASS**
- **spec_gap:** none for BUILD_GAP restore scope

## L2.5 note

Scope = **lib restore + L2 load** (parity with BUILD-GAP-DECISION-LIST-UI pattern). **J-HRM-CO-01** row→detail/back not re-run this wave; prior journey PASS (2026-07-27) unchanged. No regression signal on list load.

## Screenshots

| File | Note |
|------|------|
| `docs/qa/evidence/screens/build-gap-hrm-company-emp-count-01-qa/01-company-load.png` | First paint — cards + NV column |
| `docs/qa/evidence/screens/build-gap-hrm-company-emp-count-01-qa/02-company-after-f5.png` | After reload |

## Machine trace

- Runtime JSON: `docs/qa/evidence/_tmp-build-gap-hrm-company-emp-count-01-qa-runtime.json`
- Script: `scripts/qa/_tmp-build-gap-hrm-company-emp-count-01-qa-browser.mjs` (exit 0)

## Residual

| Item | Owner | Note |
|------|-------|------|
| Full HRM `vite build` — `insurancePolicyFormSchema` ENOENT | dev-fe (next BUILD_GAP) | Per dev handoff; **not** hit on `/hr/company` route |
| J-HRM-CO-01 row→detail + mutate flows | future QA UF | U65 FE mutate; not this work_item |
| Program UAT / Phase1 DONE | — | **cấm claim** from this evidence |

## Handoff

```
completion_report: hrmCompanyEmployeeCount restore verified — L2 /hr/company loads; hrmCompanyEmployeeCount.ts 200; GET employees/summary 200; card Tổng NV + cột Số nhân viên show valid counts; F5 stable; vitest 5/5; no full vite build green / no UAT DONE claim.
next_owner: pm
next_dispatch_prompt: PM — Close BUILD-GAP-HRM-COMPANY-EMP-COUNT-01 on bus; optional dispatch BUILD_GAP insurancePolicyFormSchema if program needs full HRM vite build; do not promote UC-HRM-03 or Phase1 UAT DONE from this evidence alone.
evidence_path: docs/qa/evidence/build-gap-hrm-company-emp-count-01-qa.md
ack_status: PASS_TO_PM
```
