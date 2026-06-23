# PCOMP-W4-DO-AVT-WEB-01 — Deploy HRM web avatar FE bundle (pilot nip.io)

**work_item_id:** `PCOMP-W4-DO-AVT-WEB-01`  
**Date:** 2026-06-07  
**Owner:** DevOps  
**Environment:** VPS `14.225.217.232` · pilot `https://14-225-217-232.nip.io`  
**ack_status:** `READY_FOR_QA`  
**Upstream:** QA FAIL `D-W4-AVT-DISPLAY-01` — `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-20260607.md`

---

## Scope

Deploy W4 HRM web FE avatar display mapping to pilot VPS:

- `resolveEmployeeAvatarUrl` / `mapHrmEmployeeRecord` (`useEmployee.ts`, `useEmployees.ts`)
- `EmployeeProfile.tsx` / `Employees.tsx` `AvatarImage`
- `EmployeeAvatarUpload.tsx`

Stabilize `xevn-hrm-be-dev` (intermittent nip.io **502** during Nest cold start after recreate).

---

## Deploy steps executed

1. **pscp** 5 FE files → `/opt/xevn-ecosystem/apps/web/hrm/src/...`  
   Script: `scripts/tmp-vps-pscp-avt-web-01-20260607.ps1`
2. **SSH** `scripts/tmp-vps-deploy-avt-web-01-20260607.sh`:
   - `merge-vps-port-env.mjs --apply-canonical`
   - `docker compose up -d --force-recreate hrm-be hrm-fe portal-fe`
   - wait 70s boot

**Non-xevn containers:** not touched (no `compose down`).

---

## L0 — Stack / proxy smoke

| Check | Result |
|-------|--------|
| VPS localhost `:3001/api/hrm/metrics` | **200** |
| VPS localhost `:3001/api/hrm/` | **200** |
| VPS `:8088/` portal-fe | **200** |
| VPS `:8080/hr/` hrm-fe | **200** |
| nip.io `/api/hrm/metrics` (post-boot ~90s) | **200** |
| `pnpm run qc:fe-be-health:pilot` | exit **0** — 8/8 health + **13/13** pilot flows |
| `node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs` | exit **0** — 6/6 PASS |

**502 note:** Immediately after `hrm-be` recreate, Nest watch compile (~60–90s) caused transient nginx **502** on `/api/hrm/*`. After healthy boot, all proxy checks **200**. QA should allow ~90s after any hrm-be restart before L0.

---

## FE bundle verification (DevOps)

| Check | Result |
|-------|--------|
| VPS disk `useEmployee.ts` contains `resolveEmployeeAvatarUrl` | **PASS** |
| VPS disk `Employees.tsx` / `EmployeeProfile.tsx` `AvatarImage src={...avatar_url}` | **PASS** |
| hrm-fe Vite serves module with `resolveEmployeeAvatarUrl` | **PASS** (`curl :8080/hr/@fs/app/.../useEmployee.ts`) |
| Containers `xevn-hrm-be-dev` / `xevn-hrm-fe-dev` / `xevn-portal-fe-dev` | **Up** (hrm-be **healthy**) |

---

## API avatar subject (pre-QA display)

**Employee:** `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de` (TCN-0954 — Đặng Xuân Hà)

| Probe | Result |
|-------|--------|
| GET `/api/hrm/employees/{id}?company_id=main` | **200** — `avatar_url=/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png` |
| GET file via nip.io | **200** `image/png` |

**J-AVT-01 visible `<img>` on profile/list:** not verified by DevOps (browser DOM) — **QA R2** mandatory.

---

## Exit criteria matrix

| Criterion | Status |
|-----------|--------|
| HRM web FE avatar code on pilot VPS | **CLOSED** |
| `hrm-fe` + `portal-fe` recreated | **CLOSED** |
| `xevn-hrm-be-dev` healthy, no sustained 502 | **CLOSED** (transient during boot only) |
| L0 pilot health exit 0 | **CLOSED** |
| Visible img on profile (J-AVT-01 DISPLAY) | **OPEN** → QA R2 |

---

## Residual

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| D-W4-AVT-DISPLAY-01 | P0 | DOM display — needs QA browser retest after FE deploy | `qa` |
| D-W4-AVT-HRM-502 | P1 | Transient 502 during hrm-be cold start; document 90s wait | `qa` / `devops` |

---

## Commands run

```powershell
powershell -File scripts/tmp-vps-pscp-avt-web-01-20260607.ps1
$env:PORTAL_DEV_URL="https://14-225-217-232.nip.io"; pnpm run qc:fe-be-health:pilot
$env:PORTAL_DEV_URL="https://14-225-217-232.nip.io"; node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs
```

---

**completion_report:** Synced 5 HRM web FE avatar files to VPS; force-recreated `xevn-hrm-be-dev`, `xevn-hrm-fe-dev`, `xevn-portal-fe-dev`. L0 pilot **ALL PASS** (8/8 + 13/13). API file smoke 6/6 PASS. FE source + Vite module confirm `resolveEmployeeAvatarUrl` live. Test employee `ecde82b7-…` has `avatar_url` + file GET 200. Transient 502 during hrm-be boot resolved after ~90s. J-AVT-01 **visible img** not DevOps-verified — QA R2 required.

**next_owner:** `qa`

**next_dispatch_prompt:** Retest `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R2` on `https://14-225-217-232.nip.io` — J-AVT-01: after login `ceo@xe.vn`, open employees list + profile `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main`; assert visible `<img src="/api/hrm/files/holding/*">` (not Radix initials) on list row TCN-0954 and profile; L0 `qc:fe-be-health:pilot` exit 0 first (wait 90s if hrm-be recently restarted); evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r2-20260607.md`.

**evidence_path:** `docs/qa/evidence/pcomp-w4-do-avt-web-01-20260607.md`

**ack_status:** `READY_FOR_QA`
