# PCOMP-W4-DO-AVT-WEB-03-R1 — Employees.tsx selectedSlug sync + hrm-fe/portal-fe recreate (pilot)

**work_item_id:** `PCOMP-W4-DO-AVT-WEB-03-R1`  
**Date:** 2026-06-07  
**Owner:** DevOps  
**Environment:** VPS `14.225.217.232` · pilot `https://14-225-217-232.nip.io`  
**ack_status:** `READY_FOR_QA`  
**Upstream:** Dev-FE `PCOMP-W4-FE-EMPLOYEES-FILTER-01` READY — `docs/qa/evidence/pcomp-w4-fe-employees-filter-01-20260607.md`; QA R3 FAIL `D-W4-AVT-EMPLOYEES-CRASH-01` — `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r3-20260607.md`

---

## Scope

PSCP fixed `apps/web/hrm/src/pages/Employees.tsx` from repo (`selectedSlug` via `useHrmOperatingUnitFilter`; no undeclared `companyFilter`); force-recreate `xevn-hrm-fe-dev` + `xevn-portal-fe-dev`; verify list route mounts in direct HRM embed + CC iframe (no blank `#root` / ReferenceError).

---

## Deploy steps executed

1. **Local pre-check:** repo `Employees.tsx` uses `selectedSlug` (lines 66–68, 110–128); `rg companyFilter` → **0 hits**.

2. **pscp** 1 file → `/opt/xevn-ecosystem/apps/web/hrm/src/pages/Employees.tsx`  
   Script: `scripts/tmp-vps-pscp-avt-web-03-20260607.ps1`

3. **SSH** `scripts/tmp-vps-deploy-avt-web-03-20260607.sh`:
   - Audit disk: `grep -c selectedSlug` → **7**; `companyFilter` → **absent**
   - `merge-vps-port-env.mjs --apply-canonical`
   - `docker compose up -d --force-recreate hrm-fe portal-fe`
   - wait **90s** Vite boot

**Non-xevn containers:** not touched (no `compose down`).

---

## Exit criteria matrix

| # | Criterion | Result |
|---|-----------|--------|
| 1 | PSCP `Employees.tsx` to VPS; no `companyFilter` on pilot disk | **PASS** — 1 file copied; disk audit **7** `selectedSlug`, **0** `companyFilter` |
| 2 | force-recreate `xevn-hrm-fe-dev` + `xevn-portal-fe-dev`; wait 90s | **PASS** — both Up ~1 min |
| 3 | nip.io employees list embed `#root` has children (not blank ReferenceError) | **PASS** — direct **4** children; CC iframe **4** children; TCN-0954 visible; no ReferenceError banner |
| 4 | `pnpm run qc:fe-be-health:pilot` | **PASS** — exit **0**, 8/8 + 13/13 @ `PORTAL_DEV_URL=https://14-225-217-232.nip.io` |
| 5 | Evidence `READY_FOR_QA` | **PASS** (this file) |

---

## Verification detail

### Disk + Vite (VPS localhost)

| Check | Result |
|-------|--------|
| Disk `Employees.tsx` `selectedSlug` count | **7** |
| Disk `companyFilter` | **absent** |
| `:8080/hr/src/pages/Employees.tsx` Vite transform | **HTTP 200** |
| Vite body `companyFilter` | **absent** |
| `:8080/hr/` hrm-fe | **HTTP 200** |
| `:8088/` portal-fe | **HTTP 200** |

### nip.io (external)

| Check | Result |
|-------|--------|
| `GET /hr/src/pages/Employees.tsx` | **HTTP 200** |
| Vite body includes `selectedSlug`, no `companyFilter` | **PASS** |
| Containers `xevn-hrm-fe-dev` / `xevn-portal-fe-dev` | **Up** |

### Browser mount (DevOps smoke — post-deploy)

| Route | `#root` children | bodyLen | Notes |
|-------|------------------|---------|-------|
| Direct `/hr/employees?portal=1&tenantId=xevn&companyId=main` | **4** | **8740** | List UI mounted |
| CC embed `/command-center/hrm/employees?companyId=main` (iframe) | **4** | **4808** | iframe src → `/hr/employees?portal=1&…`; **TCN-0954** in body; no ReferenceError |

### L0 — `pnpm run qc:fe-be-health:pilot`

```
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
=== Summary: ALL PASS ===  (8/8 health)
=== Summary: 13/13 PASS ===  (pilot flows)
exit 0
```

---

## Defect status (DevOps layer)

| Defect | Prior | After this deploy |
|--------|-------|-------------------|
| `D-W4-AVT-EMPLOYEES-CRASH-01` | P0 — `companyFilter is not defined` | **CLOSED** (disk + Vite + browser mount) |
| `D-W4-AVT-HRM-BLANK-01` | P1 — list embed `#root` empty | **CLOSED** — iframe **4** children |
| `D-W4-AVT-DISPLAY-01` | P0 — J-AVT-01 list blocked | **UNBLOCKED** — list route mounts; visible holding `<img>` on TCN-0954 → **QA R4** |

---

## QA dispatch (mandatory next)

**pm_dispatch_hint:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R4`

- **Journey:** J-AVT-01 — visible `<img src="/api/hrm/files/holding/*">` on list row **TCN-0954** + profile `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main`
- **Account:** `ceo@xe.vn` / `Xevn@2026`
- **Pre-check:** L0 `qc:fe-be-health:pilot` exit 0 (PASS this cycle)
- **Evidence:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md`

---

## Handoff packet

**completion_report:** PSCP synced fixed `Employees.tsx` (`selectedSlug`, no `companyFilter`) to pilot VPS; force-recreated `xevn-hrm-fe-dev` + `xevn-portal-fe-dev` with 90s boot. Vite transform **200** on localhost and nip.io. Browser smoke: direct list + CC embed iframe `#root` **4** children (was **0** / crash); TCN-0954 visible in CC iframe. `qc:fe-be-health:pilot` exit **0** (8/8 + 13/13 @ nip.io). Closed `D-W4-AVT-EMPLOYEES-CRASH-01` and `D-W4-AVT-HRM-BLANK-01` at DevOps layer. J-AVT-01 list row holding `<img>` not QA-verified — **QA R4** required.

**next_owner:** `qa`

**next_dispatch_prompt:** Retest `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R4` on `https://14-225-217-232.nip.io` — J-AVT-01: login `ceo@xe.vn`, open employees list (`/command-center/hrm/employees?companyId=main` + direct `/hr/employees?portal=1&tenantId=xevn&companyId=main`) and profile `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main`; assert HRM iframe `#root` mounts (not blank); assert visible `<img src="/api/hrm/files/holding/*">` (not Radix initials) on list row TCN-0954 and profile; L0 `PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot` exit 0 first; evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md` with `PASS_TO_PM` or FAIL + defect id.

**evidence_path:** `docs/qa/evidence/pcomp-w4-do-avt-web-03-20260607.md`

**ack_status:** `READY_FOR_QA`
