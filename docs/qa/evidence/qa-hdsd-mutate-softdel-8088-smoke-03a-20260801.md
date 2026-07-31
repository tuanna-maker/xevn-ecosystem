# QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A — SoftDel-only Dev8088 smoke

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A` |
| **program** | `P-HDSD-ECOSYSTEM-03` · SoftDel-only after `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **hrm_embed** | `http://14.225.217.232:8080` (+ portal `/hr/*`) |
| **entry** | `DO-HDSD-MUTATE-SOFTDEL-BH-REDEPLOY-02` PASS · VPS HEAD **`ea2df15`** · `docs/ops/evidence/do-hdsd-mutate-softdel-bh-redeploy-02-20260801.md` |
| **policy** | U65 zero-seed · browser-only · **no seed** · **no** API-only PASS · **cấm** demote local TC-025 · **BH out of scope** (do not FAIL for ViMoney) |
| **ack_status** | **FAIL_TO_PM** |
| **harness** | `scripts/qa/qa-hdsd-bf-03-softdel-ret-01-browser.mjs` · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **runtime** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-runtime.json` |
| **vite_probe** | `docs/qa/evidence/_tmp-qa-hdsd-mutate-softdel-8088-smoke-03a-vite-probe.json` |
| **stamp** | `SD8LOZ5S` |
| **local greens** | TC-025 on `:5173` — **not demoted** |
| **TC-049** | **deferred** to SMOKE-03 after ViMoney redeploy-03 (explicit WI note) |

## Executive verdict

**FAIL_TO_PM** — SoftDel Vite allow-list from REDEPLOY-02 **closed** (`hdsdMutateTestIds` + `Employees.tsx` body **200**, not SPA shell). SoftDel **mutate still unreachable** on Dev8088 because Employees **runtime** crashes on a **stale/missing export** in `hrmMetadataCompany.ts`.

| Exit criterion | Result |
|----------------|--------|
| TC-025 SoftDel: ⋯ → Xóa → AlertDialog → POST …/archive **2xx** → F5 | 🔴 **BLOCKED** — 0 archive POST |
| Plain row click → profile (must_keep) | 🔴 **BLOCKED** — 0 table rows (page crash) |
| No Vite **500** on Employees | 🟢 **PASS** — `/hr/src/pages/Employees.tsx` Vite transform **200** |
| BH / TC-049 | ⚪ **OUT OF SCOPE** — not exercised; not FAIL criterion |

**False-green guard:** BE `GET /api/hrm/employees` via `:8088` proxy = **200** `HRM-EMP-200` total **42** — list API healthy; UI still empty due to FE module export mismatch. **No** SoftDel PASS claimed from API alone.

---

## Entry criteria check

| Check | Result |
|-------|--------|
| DO REDEPLOY-02 evidence PASS | ✅ cited |
| VPS HEAD ≥ `ea2df15` | ✅ claimed in ops evidence |
| SoftDel Vite `hdsdMutateTestIds` body 200 | ✅ re-probed |
| SoftDel Vite `Employees.tsx` body 200 | ✅ re-probed (no 500) |
| BH ViMoney | ⚪ ignored (out of scope) |

### Vite / module body probes (workstation → VPS)

| URL | HTTP | HTML shell? | Body assert | Verdict |
|-----|------|-------------|-------------|---------|
| `:8088/` | **200** | yes | SPA | L0 OK |
| `:8088/hr/src/lib/hdsdMutateTestIds.ts` | **200** | **false** | `export` + `HDSD_MUTATE` | **PASS** (REDEPLOY-02 hold) |
| `:8088/hr/src/pages/Employees.tsx` | **200** | **false** | Vite transform | **PASS** (no 500) |
| `:8088/hr/src/lib/employeeCompanyDisplayName.ts` | **200** | **false** | imports `resolveHrmCompanySlugForDisplay` | present |
| `:8088/hr/src/lib/hrmMetadataCompany.ts` | **200** | **false** | has `resolveHrmMetadataCompanyUuid` · **missing** `resolveHrmCompanySlugForDisplay` | **FAIL export** |
| `:8080` same SoftDel modules | **200** | **false** | same as 8088 | aligned |

---

## Browser SoftDel click path (attempted · U65)

1. Login session `ceo@xe.vn` → `http://14.225.217.232:8088/hr/employees?portal=1&tenantId=xevn&companyId=main`.
2. **PageError (×6):**  
   `SyntaxError: The requested module '/hr/src/lib/hrmMetadataCompany.ts' does not provide an export named 'resolveHrmCompanySlugForDisplay'`
3. Console: React error boundary under `PermissionRoute` → Lazy Employees.
4. UI: **0** `table tbody tr` · **no** «Thêm nhân viên» / create testid → cannot ⋯ → Xóa → AlertDialog.
5. Network (browser): only `GET /api/hrm/operating-units` **200** + `company-subscription` **200** — **0** employees list GET from crashed page · **0** POST `/employees/*/archive`.
6. Auxiliary (not PASS evidence): auth login **XBOS-AUTH-200**; `GET :8088/api/hrm/employees?company_id=main&page_size=5` → **200** total 42.

**Verdict TC-025 Dev8088:** 🔴 BLOCKED — not SoftDel AlertDialog regression on local `:5173` (must_keep).

**Verdict row→profile must_keep Dev8088:** 🔴 BLOCKED — same crash.

---

## Spec says / code does (Dev8088 @ `ea2df15`)

| Layer | Spec / DoD | Observed |
|-------|------------|----------|
| SoftDel FE | ⋯ → Xóa → AlertDialog → POST archive 2xx → F5 | **BLOCKED** — Employees runtime export miss |
| Row click | plain td → profile | **BLOCKED** — 0 rows |
| Vite Employees | no 500 | **PASS** — transform 200 |
| `employeeCompanyDisplayName` | uses `resolveHrmCompanySlugForDisplay` | **present** on VPS |
| `hrmMetadataCompany` | must export that symbol | **absent** on VPS / on `ea2df15` tree (37-line stub: UUID map + `resolveHrmMetadataCompanyUuid` + serialize only) |
| Local SoftDel | already 🟢 on `:5173` | **unchanged** — must_keep |
| BH / ViMoney | redeploy residual | **out of scope** this WI |

**Root cause class:** allow-list / tree skew — `employeeCompanyDisplayName` shipped requiring `resolveHrmCompanySlugForDisplay`, but `hrmMetadataCompany.ts` on `main`@`ea2df15` never exports it. Local working tree has an **uncommitted** fuller `hrmMetadataCompany.ts` with the export — **not** on VPS.

---

## Residual (PM dispatch)

| ID | Owner | Action |
|----|-------|--------|
| **R-8088-FE-SOFTDEL-METADATA-EXPORT-01** | `dev-fe` | Ship `resolveHrmCompanySlugForDisplay` (+ Plane B′ maps as needed) in `apps/web/hrm/src/lib/hrmMetadataCompany.ts` on `main` (align with `employeeCompanyDisplayName` import); unit test already exists locally (`hrmMetadataCompany.test.ts`) |
| **DO-HDSD-MUTATE-SOFTDEL-REDEPLOY-03A** (or fold into BH redeploy-03) | `devops` | Allow-list push + recreate `hrm-fe`/`portal-fe`; prove VPS module body contains `resolveHrmCompanySlugForDisplay`; no SPA-shell false 200 |
| **QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A-RET** | `qa` | Retest SoftDel-only after FE+redeploy: TC-025 archive 2xx + F5 + row→profile; still ignore BH until ViMoney |

**BH residual** `R-8088-FE-BH-VIMONEY-01` — **unchanged / not FAIL** for this WI.

---

## Explicit non-claims

- Did **not** claim TC-025 SoftDel PASS on Dev8088.
- Did **not** demote local matrix TC-025 🟢.
- Did **not** run seed / API archive as PASS substitute.
- Did **not** claim BH / TC-049 (deferred).
- Did **not** FAIL WI for ViMoney / AddInsuranceDialog 500.

---

## Handoff

```yaml
work_item_id: QA-HDSD-MUTATE-SOFTDEL-8088-SMOKE-03A
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-mutate-softdel-8088-smoke-03a-20260801.md
pm_dispatch_hint: R-8088-FE-SOFTDEL-METADATA-EXPORT-01 — hrmMetadataCompany missing resolveHrmCompanySlugForDisplay on ea2df15/VPS
```
