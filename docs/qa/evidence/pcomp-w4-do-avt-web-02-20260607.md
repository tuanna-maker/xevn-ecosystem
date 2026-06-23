# PCOMP-W4-DO-AVT-WEB-02-R1 — hrmListScope sync + HRM FE recreate (pilot)

**work_item_id:** `PCOMP-W4-DO-AVT-WEB-02-R1`  
**Date:** 2026-06-07  
**Owner:** DevOps  
**Environment:** VPS `14.225.217.232` · pilot `https://14-225-217-232.nip.io`  
**ack_status:** `READY_FOR_QA`  
**Upstream:** QA FAIL `D-W4-AVT-DISPLAY-01` / `D-W4-AVT-FE-SCOPE-SYNC-01` — `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r2-20260607.md`

---

## Scope

RE-DISPATCH (INVALID-HANDOFF closure): sync missing `normalizeHrmApiListCompanyId` export and full avatar FE dependency chain to pilot; force-recreate `xevn-hrm-fe-dev` + `xevn-portal-fe-dev`; verify Vite transform **200** (not 500) for `Employees.tsx`.

---

## Deploy steps executed

1. **pscp** 11 FE files → `/opt/xevn-ecosystem/apps/web/hrm/src/...`  
   Script: `scripts/tmp-vps-pscp-avt-web-02-20260607.ps1`

   | File | Purpose |
   |------|---------|
   | `lib/hrmListScope.ts` | `normalizeHrmApiListCompanyId` export (root fix) |
   | `lib/hrmOperatingUnits.ts` | scope filter deps |
   | `lib/hrmDepartmentCatalog.ts` | list scope deps |
   | `lib/hrmPortalMode.ts` | embed mode |
   | `lib/hrmSpreadsheetScope.ts` | spreadsheet scope |
   | `contexts/HrmOperatingUnitFilterContext.tsx` | operating-unit filter |
   | `hooks/useEmployee.ts` | `resolveEmployeeAvatarUrl` + scope imports |
   | `hooks/useEmployees.ts` | list map + avatar |
   | `pages/Employees.tsx` | list `AvatarImage` |
   | `pages/EmployeeProfile.tsx` | profile `AvatarImage` |
   | `components/employee/EmployeeAvatarUpload.tsx` | upload UI |

2. **SSH** `scripts/tmp-vps-deploy-avt-web-02-20260607.sh`:
   - Audit: `grep -c normalizeHrmApiListCompanyId` on disk → **4**
   - `merge-vps-port-env.mjs --apply-canonical`
   - `docker compose up -d --force-recreate hrm-fe portal-fe`
   - wait **90s** Vite boot

**Non-xevn containers:** not touched (no `compose down`).

---

## Exit criteria matrix

| # | Criterion | Result |
|---|-----------|--------|
| 1 | PSCP `hrmListScope.ts` + avatar FE chain to VPS | **PASS** — 11 files copied |
| 2 | `normalizeHrmApiListCompanyId` on pilot disk | **PASS** — `grep -c` → **4** |
| 3 | `curl https://14-225-217-232.nip.io/hr/src/pages/Employees.tsx` | **HTTP 200** (was 500) |
| 4 | Recreate hrm-fe + portal-fe; `qc:fe-be-health:pilot` | **PASS** — exit **0**, 8/8 + 13/13 |
| 5 | Evidence file `READY_FOR_QA` | **PASS** (this file) |

---

## Verification detail

### Disk + Vite (VPS localhost)

| Check | Result |
|-------|--------|
| Disk `hrmListScope.ts` `normalizeHrmApiListCompanyId` count | **4** |
| `:8080/hr/src/pages/Employees.tsx` Vite transform | **HTTP 200** |
| `:8080/hr/src/lib/hrmListScope.ts` includes export | **PASS** |
| `:8088/` portal-fe | **HTTP 200** |
| `:8080/hr/` hrm-fe | **HTTP 200** |

### nip.io (external)

| Check | Result |
|-------|--------|
| `GET /hr/src/pages/Employees.tsx` | **HTTP 200** |
| `GET /hr/src/lib/hrmListScope.ts` body | includes `normalizeHrmApiListCompanyId` |
| Containers `xevn-hrm-fe-dev` / `xevn-portal-fe-dev` | **Up** (~1 min after recreate) |

### L0 — `pnpm run qc:fe-be-health:pilot`

```
=== Summary: ALL PASS ===  (8/8 health)
=== Summary: 13/13 PASS ===  (pilot flows)
exit 0
```

---

## Defect status (DevOps layer)

| Defect | Prior | After this deploy |
|--------|-------|-------------------|
| `D-W4-AVT-FE-SCOPE-SYNC-01` | P0 — missing export on pilot | **CLOSED** (disk + Vite + nip.io) |
| `D-W4-AVT-DISPLAY-01` | P0 — iframe blank, Employees Vite 500 | **UNBLOCKED** — Vite 200; J-AVT-01 DOM → **QA R3** |
| `D-W4-AVT-HRM-BLANK-01` | P1 — `#root` empty | **LIKELY CLOSED** — module graph fixed; QA confirms mount |

---

## QA dispatch (mandatory next)

**pm_dispatch_hint:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R3`

- **Journey:** J-AVT-01 — visible `<img src="/api/hrm/files/holding/*">` on list row **TCN-0954** + profile `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main`
- **Account:** `ceo@xe.vn` / `Xevn@2026`
- **Pre-check:** L0 `qc:fe-be-health:pilot` exit 0 (already PASS this cycle)
- **Evidence:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r3-20260607.md`

---

## Handoff packet

**completion_report:** Synced `hrmListScope.ts` (with `normalizeHrmApiListCompanyId`) and 10 avatar/scope FE dependencies to pilot VPS; force-recreated `xevn-hrm-fe-dev` + `xevn-portal-fe-dev`; 90s boot wait. `Employees.tsx` Vite transform **200** on localhost and nip.io (was **500**). `qc:fe-be-health:pilot` exit **0** (8/8 + 13/13). `D-W4-AVT-FE-SCOPE-SYNC-01` closed at DevOps layer. J-AVT-01 visible `<img>` not DevOps-verified — **QA R3** required.

**next_owner:** `qa`

**next_dispatch_prompt:** Retest `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R3` on `https://14-225-217-232.nip.io` — J-AVT-01: login `ceo@xe.vn`, open employees list + profile `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main`; assert visible `<img src="/api/hrm/files/holding/*">` (not Radix initials) on list row TCN-0954 and profile; confirm HRM iframe `#root` mounts (no blank embed); L0 `pnpm run qc:fe-be-health:pilot` exit 0 first; evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r3-20260607.md` with `PASS_TO_PM` or FAIL + defect id.

**evidence_path:** `docs/qa/evidence/pcomp-w4-do-avt-web-02-20260607.md`

**ack_status:** `READY_FOR_QA`
