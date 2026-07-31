# Evidence — D-HDSD-MUTATE-FE-DEPS-02

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MUTATE-FE-DEPS-02` |
| **from_role** | pm |
| **to_role** | dev-fe |
| **program** | P-HDSD-ECOSYSTEM-03 |
| **date** | 2026-08-01 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **preserve_default** | true |
| **prior FAIL** | `QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-02` · `docs/qa/evidence/qa-hdsd-mutate-softdel-bh-8088-smoke-02-20260801.md` |

---

## 1. Problem → fix

| Symptom (:8088) | Root cause | Fix |
|-----------------|------------|-----|
| Vite **500** `Employees.tsx` | Missing `@/lib/hdsdMutateTestIds` | Restored `hdsdMutateTestIds.ts` (+ test) with full SoftDel/HĐ/YCTD/Leave keys |
| Vite **500** `AddInsuranceDialog` / `InsurancePolicyMasterPanel` | Missing `@/components/common/CatalogSearchPicker` | Restored `CatalogSearchPicker.tsx` (+ `data-testid` forward) |
| Transitive | Missing `@/lib/catalogSearchPicker` (+ helpers insurers/types) | Restored from Cursor local history (latest E3) |
| Transitive BH page | Missing `@/lib/statusMachineE3` (MasterPanel) | Restored (+ test) |
| Bonus | `mdBucketRegistry` also absent | Restored (+ test) for Settings MD empty+CTA parity |

**Source of reconstruction:** Cursor User History (`entries.json` resource paths) + call-site keys — **not** blind `stash pop`. Stash `stash@{0}` did **not** contain these paths.

---

## 2. Files (allow-list)

| Path | Action |
|------|--------|
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | ADD reconstruct |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts` | ADD |
| `apps/web/hrm/src/components/common/CatalogSearchPicker.tsx` | ADD reconstruct + `data-testid` |
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | ADD reconstruct (transitive) |
| `apps/web/hrm/src/lib/catalogSearchPicker.test.ts` | ADD |
| `apps/web/hrm/src/lib/statusMachineE3.ts` | ADD reconstruct (BH MasterPanel) |
| `apps/web/hrm/src/lib/statusMachineE3.test.ts` | ADD |
| `apps/web/hrm/src/lib/mdBucketRegistry.ts` | ADD reconstruct (Settings MD) |
| `apps/web/hrm/src/lib/mdBucketRegistry.test.ts` | ADD |

CODE-MEMORY: APPEND on reconstructed business modules.

**must_keep verified in reconstruct:** SoftDel testids · BH insurer/type CatalogSearchPicker API · policy MasterPanel SM · TC-041 untouched · U65 no seed.

---

## 3. Verify (dev self)

```bash
cd apps/web/hrm
pnpm exec vitest run \
  src/lib/hdsdMutateTestIds.test.ts \
  src/lib/catalogSearchPicker.test.ts \
  src/lib/statusMachineE3.test.ts \
  src/lib/mdBucketRegistry.test.ts
# → 4 files / 41 tests PASS

pnpm exec tsc --noEmit -p tsconfig.json
# → exit 0
```

---

## 4. Residuals / next

| Item | Owner |
|------|--------|
| Commit + push allow-list modules to `main` | devops / PM track |
| Redeploy `:8088` HRM FE | **DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02** |
| Browser SoftDel TC-025 + BH TC-049 SMOKE-03 | qa — prove Vite module body (not SPA HTML shell) |

**Cấm:** demote local TC-025/049 matrix · seed · rewrite AddInsuranceDialog business logic.

---

## 5. Handoff

```yaml
work_item_id: D-HDSD-MUTATE-FE-DEPS-02
from_role: dev-fe
to_role: devops
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/d-hdsd-mutate-fe-deps-02-20260801.md
next_owner: devops
pm_dispatch_hint: DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02 then QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03
```

### completion_report

**Closed:** Reconstructed missing SoftDel/BH FE deps so Vite resolves `hdsdMutateTestIds` + `CatalogSearchPicker` (+ transitive `catalogSearchPicker`, `statusMachineE3`, `mdBucketRegistry`). Vitest 41 PASS · tsc 0. No AddInsuranceDialog business rewrite · no seed · SoftDel/BH must_keep preserved.

**Residual:** Modules exist only on working tree until commit/redeploy; `:8088` still broken until REDEPLOY-02.

**ack_status:** `READY_FOR_QA`

**next_owner:** `devops`

**next_dispatch_prompt:** |

```text
work_item_id: DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02
from_role: pm
to_role: devops
priority: P0
program: P-HDSD-ECOSYSTEM-03
entry_criteria: D-HDSD-MUTATE-FE-DEPS-02 READY_FOR_QA · evidence docs/qa/evidence/d-hdsd-mutate-fe-deps-02-20260801.md
exit_criteria:
  - Commit+push allow-list:
      apps/web/hrm/src/lib/hdsdMutateTestIds.ts
      apps/web/hrm/src/lib/hdsdMutateTestIds.test.ts
      apps/web/hrm/src/components/common/CatalogSearchPicker.tsx
      apps/web/hrm/src/lib/catalogSearchPicker.ts
      apps/web/hrm/src/lib/catalogSearchPicker.test.ts
      apps/web/hrm/src/lib/statusMachineE3.ts
      apps/web/hrm/src/lib/statusMachineE3.test.ts
      apps/web/hrm/src/lib/mdBucketRegistry.ts
      apps/web/hrm/src/lib/mdBucketRegistry.test.ts
  - Redeploy :8088 HRM FE
  - L0 prove GET /hr/src/lib/hdsdMutateTestIds.ts body is MODULE (NOT <!doctype html> SPA shell)
  - L0 prove GET /hr/src/components/common/CatalogSearchPicker.tsx transforms (not 500 from importer)
  - READY_FOR_QA → QA-HDSD-MUTATE-SOFTDEL-BH-8088-SMOKE-03
cấm: blind stash pop · seed · demote TC-025/049 matrix
evidence_path: docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-02-20260801.md
```
