# QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET — SoftDel Dev8088 retest

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET` |
| **program** | `P-HDSD-ECOSYSTEM-03` · `R-8088-FE-SOFTDEL-METADATA-EXPORT-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **hrm_embed** | `http://14.225.217.232:8080` (+ portal `/hr/*`) |
| **entry** | `DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A` READY_FOR_QA · VPS HEAD **`08c166b`** · `docs/ops/evidence/do-hdsd-mutate-softdel-redeploy-03a-20260801.md` |
| **prior FAIL** | `docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-20260801.md` |
| **policy** | U65 zero-seed · browser-only · U76 HDSD menu Nhân viên · **no seed** · **no** probe-only PASS · **cấm** demote local TC-025 · **BH out of scope** |
| **ack_status** | **FAIL_TO_PM** |
| **harness** | `scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` · `PORTAL_DEV_URL=http://14.225.217.232:8088` · exit **2** · stamp `SD8MBFIJ` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret-runtime.json` |
| **vite_probe** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret-vite-probe.json` |
| **diag** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-ret-diag.json` |
| **screens** | `docs/qa/evidence/screens/hdsd-softdel-8088-smoke-03a-ret-20260801/` |
| **local greens** | TC-025 on `:5173` — **not demoted** |
| **BH / TC-049** | **out of scope** — not exercised; not FAIL criterion |

## Executive verdict

**FAIL_TO_PM** — Prior blocker **`resolveHrmCompanySlugForDisplay` missing export is CLOSED** on Dev8088 (`hrmMetadataCompany.ts` body has export; **0** SyntaxError). SoftDel **mutate still unreachable**: Employees mount crashes in **`EmployeeFormDialog`** (`TypeError: … reading 'map'` at Vite line **381** = `departments.map(...)` when `departments` is **undefined**). Page root empty → **0** table rows → no ⋯ → Xóa → archive.

| Exit criterion | Result |
|----------------|--------|
| Employees loads **without** SyntaxError missing `resolveHrmCompanySlugForDisplay` | 🟢 **PASS** (prior residual closed) |
| TC-025: ⋯ → Xóa → AlertDialog → POST …/archive **2xx** → F5 | 🔴 **BLOCKED** — 0 archive POST |
| Plain row click → profile (must_keep) | 🔴 **BLOCKED** — 0 table rows (page crash) |
| Probe: `hrmMetadataCompany.ts` body still has export (not SPA shell) | 🟢 **PASS** |
| BH / ViMoney | ⚪ **OUT OF SCOPE** |

**False-green guard:** `GET :8088/api/hrm/employees?company_id=main` auth **200** `HRM-EMP-200` total **42** — list API healthy; UI empty due to FE crash. **No** SoftDel PASS from API alone.

---

## Entry criteria check

| Check | Result |
|-------|--------|
| DO REDEPLOY-03A READY_FOR_QA | ✅ cited |
| VPS HEAD ≥ `08c166b` | ✅ claimed in ops evidence |
| U65 zero-seed browser | ✅ harness + diag only |
| BH ignored | ✅ |

### Vite / module body probes (workstation → VPS)

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8088/` | **200** | yes | SPA | L0 OK |
| `:8088/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | `resolveHrmCompanySlugForDisplay` present | **PASS** (closes R-8088-FE-SOFTDEL-METADATA-EXPORT-01) |
| `:8080/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | same | **PASS** |
| `:8088/hr/src/lib/employeeCompanyDisplayName.ts` | **200** | **false** | imports slug helper | aligned |
| `:8088/hr/src/pages/Employees.tsx` | **200** | **false** | Vite transform | transform OK |
| `:8088/hr/src/components/employee/EmployeeFormDialog.tsx` | **200** | **false** | still has `departments.map((d)=>d.name)` | **STALE vs local** |

---

## Browser SoftDel click path (U65 · U76)

**HDSD inventory:** Portal → HRM embed → menu **Nhân viên** (`/hr/employees?portal=1&tenantId=xevn&companyId=main`) · SoftDel path ⋯ → **Xóa** (not attempted — blocked before list).

1. Login API `POST /api/xbos/auth/login` → **201** `XBOS-AUTH-200` · inject portal token · navigate Employees.
2. **PageError (×N):** `TypeError: Cannot read properties of undefined (reading 'map')`  
   Stack: `EmployeeFormDialog.tsx:381` → `useMemo` → `departments.map((d)=>d.name)` (VPS transform).  
   Console: React boundary under `PermissionRoute` → Lazy `Employees` → `EmployeeFormDialog`.
3. **Closed vs prior:** **no** `SyntaxError: … does not provide an export named 'resolveHrmCompanySlugForDisplay'`.
4. UI: `#root` children **0** · body text empty · **0** `table tbody tr` · **0** «Thêm nhân viên» / create testid.
5. Network (browser): `GET operating-units` **200**, `company-subscription` **200**, `auth/me` **200** — **0** `GET /api/hrm/employees` from crashed page · **0** POST `/employees/*/archive`.
6. Harness stamp `SD8MBFIJ`: TC-025-ROWCLICK 🔴 `no rows` · TC-025 🔴 `create failed … click miss: Thêm nhân viên`.

**Verdict TC-025 Dev8088:** 🔴 BLOCKED — not SoftDel AlertDialog regression on local `:5173` (must_keep).

**Verdict row→profile must_keep Dev8088:** 🔴 BLOCKED — same crash.

---

## Spec says / code does (Dev8088 @ `08c166b`)

| Layer | Spec / DoD | Observed |
|-------|------------|----------|
| Metadata export | `resolveHrmCompanySlugForDisplay` on VPS | **PASS** — module body export live |
| SoftDel FE | ⋯ → Xóa → AlertDialog → POST archive 2xx → F5 | **BLOCKED** — Employees crash before list |
| Row click | plain td → profile | **BLOCKED** — 0 rows |
| `EmployeeFormDialog` VPS | must not throw on mount (`open=false`) | **FAIL** — `departments` undefined `.map` |
| Local tree | `departmentOptionsFromCatalog(catalogs)` (safe) | **not deployed** on VPS dialog body |
| Local SoftDel | already 🟢 on `:5173` | **unchanged** — must_keep |
| BH / ViMoney | | **out of scope** |

**Root cause class:** allow-list / tree skew wave-2 — REDEPLOY-03A fixed metadata export only; VPS `EmployeeFormDialog.tsx` still contains legacy `departments.map` path while `Employees` mounts the dialog always and does **not** pass `departments`.

---

## Residual (PM dispatch)

| ID | Owner | Action |
|----|-------|--------|
| **R-8088-FE-SOFTDEL-METADATA-EXPORT-01** | — | **CLOSED** on VPS (export + no SyntaxError) |
| **R-8088-FE-SOFTDEL-EMP-FORM-MAP-01** | `dev-fe` | Ship `EmployeeFormDialog` aligned with local: remove unsafe `departments.map`; use `departmentOptionsFromCatalog(catalogs ?? [])` (or `departments?.map ?? []`); ensure dialog mount with `open=false` never throws; unit/regression |
| **DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03B** | `devops` | Allow-list push `EmployeeFormDialog.tsx` (+ deps if any) + recreate `hrm-fe`/`portal-fe`; prove VPS body **lacks** bare `departments.map` / has `departmentOptionsFromCatalog` |
| **QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET2** | `qa` | Retest SoftDel-only after FE+redeploy: no pageError · TC-025 archive 2xx + F5 · row→profile; still ignore BH |

**BH residual** `R-8088-FE-BH-VIMONEY-01` — **unchanged / not FAIL** for this WI.

---

## Explicit non-claims

- Did **not** claim TC-025 SoftDel PASS on Dev8088.
- Did **not** demote local matrix TC-025 🟢.
- Did **not** run seed / API archive as PASS substitute.
- Did **not** claim BH / TC-049.
- Did **not** FAIL WI for ViMoney / insurance.

---

## Handoff

```yaml
work_item_id: QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret-20260801.md
pm_dispatch_hint: R-8088-FE-SOFTDEL-EMP-FORM-MAP-01 — EmployeeFormDialog VPS departments.map undefined; metadata export CLOSED
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HDSD-MUTATE-SOFTDEL-EMP-FORM-MAP-01
from_role: pm | to_role: dev-fe
program: P-HDSD-ECOSYSTEM-03 · R-8088-FE-SOFTDEL-EMP-FORM-MAP-01
priority: P0
entry_criteria: QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET FAIL_TO_PM · docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-ret-20260801.md
spec_ref: HDSD Nhân viên SoftDel TC-025 · local EmployeeFormDialog uses departmentOptionsFromCatalog
change_mode: FIX
allowed_paths:
  - apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx
  - apps/web/hrm/src/lib/catalogSearchPicker.ts (only if needed)
  - related unit test under apps/web/hrm/**
must_keep: SoftDel AlertDialog path · row→profile · no BH/ViMoney scope · local TC-025 green
exit_criteria:
  - Remove/guard VPS crash site departments.map(undefined)
  - Dialog mounts with open=false without throw
  - READY_FOR_QA + evidence; then PM → DO redeploy-03B → QA RET2 SoftDel-only on :8088
cấm: seed · touch BH/ViMoney · demote local SoftDel greens
```
