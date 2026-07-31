# D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01 — EmployeeFormDialog departments.map guard

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-EMP-FORM-MAP-01` |
| **from_role** | `dev-fe` |
| **to_role** | `devops` (then QA SoftDel RET2) |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **change_mode** | `FIX` |
| **priority** | P0 |
| **ack_status** | **READY_FOR_QA** |
| **entry** | `QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET` FAIL_TO_PM · `docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret-20260801.md` |

## spec_read_ack

| Layer | Cite |
|-------|------|
| **SRS** | `docs/hrm/SRS.md` §15.2 · FR-HRM-SC-MD-02 (phòng ban catalog SoT) |
| **HDSD / SoftDel** | HDSD menu **Nhân viên** · SoftDel TC-025: ⋯ → **Xóa** → AlertDialog → archive (must_keep; not touched) |
| **QA crash** | VPS `EmployeeFormDialog.tsx` Vite L381: `departments.map((d)=>d.name)` when `departments` **undefined** (Employees mounts dialog always, does not pass prop) |
| **CODE-MEMORY** | Existing file block + APPEND `D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01` |
| **Prior local fix** | Working tree already removed required `departments` prop → `departmentOptionsFromCatalog`; this WI hardens `?? []` + regression test for redeploy allow-list |

## Root cause (spec says / code does)

| Spec / DoD | Observed on Dev8088 @ redeploy-03A |
|------------|-------------------------------------|
| Dialog `open=false` must never throw | **FAIL** — `TypeError: … reading 'map'` on mount |
| SoftDel ⋯ → Xóa reachable | **BLOCKED** — `#root` empty, 0 table rows |
| GET employees 200 total 42 | **PASS** API — FE crash only |
| Metadata export residual | **CLOSED** prior wave |

**Class:** allow-list / tree skew — VPS still had legacy `fromProps = departments.map(...)` while call site omitted `departments`.

## Fix (allowed_paths only)

1. **`EmployeeFormDialog.tsx`**
   - No required `departments` prop; no `departments.map`
   - `departmentOptionsFromCatalog(catalogs ?? [])`
   - `findCatalog` nullish-safe: `(catalogs ?? []).find(...)`
   - CODE-MEMORY APPEND for this WI
2. **`EmployeeFormDialog.mount-guard.test.ts`** (new)
   - Source asserts: no `departments.map`; has `departmentOptionsFromCatalog(catalogs ?? [])`
   - Runtime: nullish `?? []` never throws; empty → `[]`

### must_keep (untouched)

- SoftDel AlertDialog / archive API path
- Plain row click → profile
- BH / ViMoney / insurance dialogs
- Local TC-025 greens not demoted

## Verify

```text
pnpm --filter vite_react_shadcn_ts exec vitest run \
  src/components/employee/EmployeeFormDialog.mount-guard.test.ts \
  src/lib/catalogSearchPicker.test.ts
→ 2 files · 34 tests PASS
```

## Residual for next owners

| ID | Owner | Action |
|----|-------|--------|
| **DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B** | `devops` | Allow-list commit+push `EmployeeFormDialog.tsx` (+ mount-guard test if desired); VPS pull; recreate `hrm-fe`+`portal-fe`; prove module body **lacks** `departments.map` / has `departmentOptionsFromCatalog(catalogs ?? [])` · HTTP 200 |
| **QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2** | `qa` | SoftDel retest: no pageError · rows visible · TC-025 archive 2xx + F5 · row→profile; ignore BH |

## Explicit non-claims

- Did **not** claim SoftDel PASS on Dev8088 (needs redeploy + QA).
- Did **not** touch SoftDel AlertDialog / archive.
- Did **not** seed / demote TC-025.
- Did **not** `git add .` / commit / push (PM/devops allow-list).

## Handoff

- **completion_report:** Mount crash class closed in local tree; vitest mount-guard 5/5 + catalog picker 29/29 PASS; SoftDel path must_keep.
- **next_owner:** `devops`
- **ack_status:** `READY_FOR_QA` (after redeploy-03B module body proof)

### next_dispatch_prompt (copy-ready)

```text
work_item_id: DO-HDSD-MUTATE-SOFTDEL-EMP-FORM-REDEPLOY-03B
from_role: pm | to_role: devops
program: P-HDSD-ECOSYSTEM-03 · R-8088-FE-SOFTDEL-EMP-FORM-MAP-01
priority: P0

entry_criteria:
- D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01 READY_FOR_QA
- evidence: docs/qa/evidence/d-hdsd-mutate-softdel-emp-form-map-01-20260801.md
- Local fix: EmployeeFormDialog — no departments.map; departmentOptionsFromCatalog(catalogs ?? [])

allowed_paths (strict allow-list — cấm git add .):
- apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
- apps/web/hrm/src/components/employee/EmployeeFormDialog.mount-guard.test.ts (optional with dialog)

exit_criteria:
1. Commit+push allow-list only (EmployeeFormDialog ± mount-guard test)
2. VPS pull; recreate hrm-fe + portal-fe
3. Prove module body 200 on :8088 and/or :8080:
   - EmployeeFormDialog.tsx transform/body LACKS bare departments.map(
   - HAS departmentOptionsFromCatalog(catalogs ?? [])
4. evidence_path: docs/ops/evidence/do-hdsd-mutate-softdel-emp-form-redeploy-03b-20260801.md
5. ack_status READY_FOR_QA → dispatch QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2
   (SoftDel TC-025: no pageError, rows>0, ⋯→Xóa→AlertDialog→archive 2xx+F5, row→profile; U65 no seed; BH out of scope)

must_keep: SoftDel AlertDialog path · metadata export already CLOSED · no BH/ViMoney scope
```
