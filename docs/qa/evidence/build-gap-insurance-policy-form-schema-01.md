# BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01 — evidence

**work_item_id:** BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01  
**role:** dev-fe  
**date:** 2026-08-03  
**ack_status:** READY_FOR_QA  

## Problem

HRM `vite build` / Insurance embed failed with missing module `@/lib/insurancePolicyFormSchema` imported by `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx` (`createInsurancePolicyFormSchema`, `InsurancePolicyFormValues`). Transitive import from `insurancePolicyPayload.ts`.

## Fix (restore from git `43c479a`)

| File | Action |
|------|--------|
| `apps/web/hrm/src/lib/insurancePolicyFormSchema.ts` | `git checkout 43c479a --` + `@CODE-MEMORY-CHANGE` BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01 |
| `apps/web/hrm/src/lib/insurancePolicyFormSchema.test.ts` | Restored from `43c479a` (UTF-8 via git checkout) |

**Import site (unchanged):** `InsurancePolicyMasterPanel.tsx` ~61–64 `@/lib/insurancePolicyFormSchema`; `insurancePolicyPayload.ts` type import.

**must_keep honored:** MD panel · `decisionListUi` · `performanceFormSchema` · Contracts/Payroll · Leave — no Insurance panel rewrite.

## Verification

### Vitest

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/insurancePolicyFormSchema.test.ts src/lib/insurancePolicyPayload.test.ts --reporter=dot
```

- `insurancePolicyFormSchema.test.ts`: 2 tests PASS  
- `insurancePolicyPayload.test.ts`: 4 tests PASS  
- **Total:** 6/6 PASS  

### Vite build (Insurance / schema path)

```text
cd apps/web/hrm && pnpm exec vite build
```

- **Before (prior wave):** build failed ENOENT `insurancePolicyFormSchema` (`InsurancePolicyMasterPanel.tsx` / payload chain).  
- **After:** **exit 0** · `✓ built in ~31s` · chunk `Insurance-*.js` emitted (~76 kB gzip ~20 kB).  
- **No** `insurancePolicyFormSchema` / `InsurancePolicyMasterPanel` ENOENT in log.

### Vite residual (program note)

- **Prior build-gap chain:** after `decisionListUi` restore, next documented blocker was `@/lib/metadataWorkflowLabel` (`MetadataQueueTab.tsx`).  
- **This run:** full HRM `pnpm exec vite build` **green** — no unresolved import in rollup output.  
- **Non-blocking:** Rollup chunk size warnings (>500 kB) on `index` / pdf / face modules — NFR split, not mount blockers.  
- **If QA sees Vite 500 on another route:** treat as separate BUILD-GAP restore (grep `Failed to resolve import` in DevTools / build log).

## QA entry (PM dispatch)

- **URL:** portal embed `/hr/insurance` (persona `ceo@xe.vn` / `Xevn@2026`, `company_id=main`)  
- **UF:** L2 load — no Vite 500 / no «Failed to resolve import insurancePolicyFormSchema»  
- **L2.5:** policy master panel mount; empty+CTA when catalogs empty (U65, no seed); form validation VI messages from `POLICY_MSG`  
- **Regression:** Decisions · Performance · MD panel · Contracts · Payroll · Leave untouched  

## Residual (not this wave)

- Browser UAT for Insurance CRUD/SM (AC-INS) — QA only; **cấm** claim UAT DONE from vitest/build alone (U65 FE flow).  
- Chunk-size / code-split NFR — devops/TM if prod bundle budget required.

## spec_read_ack

- srs: `docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md` §3.4 · FR-HRM-INS-DEPTH-E3-01  
- tech_spec: `docs/hrm/API_DESIGN_HRM_ERP_E3.md` §7/§9  
- change_mode: FIX / restore on disk (no InsurancePolicyMasterPanel logic change)

---

**next_owner:** qa  
**next_dispatch:** Browser smoke `/hr/insurance` L2 + policy master panel mount; U65 zero-seed; grep DevTools for `insurancePolicyFormSchema` resolve.

---

## QA verdict (2026-08-03) — BUILD-GAP-INSURANCE-POLICY-FORM-SCHEMA-01-QA

| Field | Value |
|-------|-------|
| ack_status | **PASS_TO_PM** |
| evidence_path | `docs/qa/evidence/build-gap-insurance-policy-form-schema-01-qa.md` |
| L0 | `qc:dev-stack` HTTP 200 · `qc:fe-be-health` ALL PASS |
| Vitest re-run | **6/6 PASS** |
| Browser | `/hr/insurance` L2 — no Vite resolve fail; `insurancePolicyFormSchema.ts` **200/304**; panel + CTA + list (7); F5 OK; **0×54321** |
| Regression | decisions · performance · contracts · payroll · company — all mount OK |
| Residual Vite gap | **none** observed on in-scope routes |
| Non-claim | Insurance CRUD/UAT · Phase1 DONE |
