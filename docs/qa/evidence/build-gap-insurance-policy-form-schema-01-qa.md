# BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01-QA — Insurance L2 mount

| Field | Value |
|-------|-------|
| work_item_id | BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01-QA |
| from_role | qa |
| dev_handoff | BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01 · `docs/qa/evidence/build-gap-insurance-policy-form-schema-01.md` |
| date | 2026-08-03 |
| ack_status | **PASS_TO_PM** |
| u65_zero_seed | true |
| spec_ref | FR-HRM-INS-DEPTH-E3-01 · `/hr/insurance` · `insurancePolicyFormSchema` restore |

## L0 / L1 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | HRM :28001 · XBOS :28002 · portal :5173 **200** (Node UV assert on process exit — HTTP checks passed) |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| Vitest schema + payload | **6/6 PASS** (`insurancePolicyFormSchema.test.ts` 2 · `insurancePolicyPayload.test.ts` 4) |

## UF — BUILD_GAP L2 `/hr/insurance` (not Insurance CRUD / UAT DONE)

- **Persona / URL:** `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5173/hr/insurance?portal=1&tenantId=xevn&companyId=main`
- **Click path:** API login → portal storage inject (U65) → embed URL → observe policy master panel → **F5**
- **Trước mutate:** no seed this run; existing policy rows already in env (7) — not created by QA
- **Action:** load only — no create/edit policy
- **Network:**
  - `GET /hr/src/lib/insurancePolicyFormSchema.ts` → **200** (initial) / **304** (F5)
  - `GET /hr/src/components/insurance/InsurancePolicyMasterPanel.tsx` → **200** / **304**
  - `GET /hr/src/pages/Insurance.tsx` → **200** / **304**
  - `GET /api/hrm/contracts-insurance/insurance-policies?company_id=main` → **200** (initial + F5)
  - `GET /api/hrm/insurance-policy-participants?company_id=main` → **200** (initial + F5)
  - **0** requests to port **54321**
- **FE sau load:**
  - Panel **«Chính sách bảo hiểm (master)»** visible with form fields + CTA **«Tạo chính sách»**
  - List **«Danh sách chính sách (7)»** with SM buttons (Sửa / → Hết hạn / → Đã hủy)
  - **No** Vite overlay; **no** `Failed to resolve import … insurancePolicyFormSchema`
  - **No** HRM API Sync ERROR banner
- **Console:** 0 `pageerror`; 0 console `error`
- **F5:** panel + list still render; schema module **304**; APIs **200** again
- **Verdict:** 🟢 **PASS**
- **spec_gap:** none for BUILD_GAP restore scope

## Regression mounts (prior BUILD_GAP restores)

| Route | Vite overlay / resolve fail | Verdict |
|-------|----------------------------|---------|
| `/hr/decisions` | none | 🟢 |
| `/hr/performance` | none | 🟢 |
| `/hr/contracts` | none | 🟢 |
| `/hr/payroll` | none | 🟢 |
| `/hr/company` | none (Tổng NV still visible) | 🟢 |

## Screenshots

| File | Note |
|------|------|
| `docs/qa/evidence/screens/build-gap-insurance-policy-form-schema-01-qa/01-insurance-load.png` | First paint — master panel + list |
| `docs/qa/evidence/screens/build-gap-insurance-policy-form-schema-01-qa/02-insurance-after-f5.png` | After reload |
| `docs/qa/evidence/screens/build-gap-insurance-policy-form-schema-01-qa/03-regression-last-route.png` | After company regression mount |

## Machine trace

- Runtime JSON: `docs/qa/evidence/_tmp-build-gap-insurance-policy-form-schema-01-qa-runtime.json`
- Script: `scripts/qa/_tmp-build-gap-insurance-policy-form-schema-01-qa-browser.mjs` (exit 0)

## Residual

| Item | Owner | Note |
|------|-------|------|
| Next Vite ENOENT on these routes | — | **None observed** this run (insurance + 5 regression mounts) |
| Insurance CRUD / SM UAT (AC-INS) | future QA UF | U65 FE mutate; **not** this work_item |
| Program UAT / Phase1 DONE | — | **cấm claim** from this evidence |

## Handoff

```
completion_report: insurancePolicyFormSchema restore verified — L2 /hr/insurance mounts; schema.ts 200; policy master panel + CTA + list visible; F5 stable; no 54321; vitest 6/6; regression decisions/performance/contracts/payroll/company OK; no UAT DONE claim.
next_owner: pm
next_dispatch_prompt: PM — Close BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01 on bus; no next Vite ENOENT residual on insurance or prior BUILD_GAP routes this run; do not promote Insurance CRUD/UAT or Phase1 DONE from this evidence alone.
evidence_path: docs/qa/evidence/build-gap-insurance-policy-form-schema-01-qa.md
ack_status: PASS_TO_PM
```
