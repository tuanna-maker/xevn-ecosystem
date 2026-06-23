# PCOMP-W7-DO-PILOT-RESTORE-01 — Pilot VPS restore (hrm-be 502 + home/summary 04b)

**work_item_id:** `PCOMP-W7-DO-PILOT-RESTORE-01`  
**Date:** 2026-06-07  
**Owner:** DevOps  
**Environment:** VPS `14.225.217.232` · pilot `https://14-225-217-232.nip.io`  
**ack_status:** `READY_FOR_QA`  
**Upstream:** PM consolidated blockers — hub R2 FAIL d99751ac (nip.io 502 health/login), GET `/home/summary` 404, avatar display QA FAIL hrm 502; prior `PCOMP-W7-DO-HOME-SUMMARY` R1/R2 + `PCOMP-W4-DO-AVT-WEB-01` INVALID (no evidence).

---

## Root cause (DevOps)

| Symptom | Cause |
|---------|-------|
| nip.io **502** on `/api/hrm/*` | `xevn-hrm-be-dev` cold start / crash loop after partial recreate; nginx upstream unavailable |
| GET `/api/hrm/home/summary` **404** | Home module sources not built into running container (git main lag + no `--build` after pscp) |
| Avatar FE 502 class | Same hrm-be instability; hrm-fe/portal-fe needed recreate after BE healthy |

---

## Deploy steps executed

1. **Audit** VPS — `docker ps`, `ss -tlnp` (ports 3001/8080/8088 bound).
2. **pscp** 14 hrm-api files (home/summary 04b + scope/operating-units) → `/opt/xevn-ecosystem/`  
   Script: `scripts/tmp-vps-pscp-home-summary-20260607.ps1`
3. **SSH rebuild** `hrm-be` with `--build --force-recreate` (Nest compile + route registration).
4. **SSH recreate** `hrm-fe` + `portal-fe` (W4 avatar FE bundle already on disk from prior wave).
5. Scripts added for repeatability: `scripts/tmp-vps-deploy-pilot-restore-20260607.sh`, `scripts/tmp-run-vps-pilot-restore-20260607.ps1`

**Non-xevn containers:** not touched (no `compose down`).

**VPS git HEAD at smoke:** `68ec457`

---

## L0 — Stack / proxy smoke

| Check | Result |
|-------|--------|
| Pre-fix nip.io `/api/hrm/metrics` | **502** |
| Pre-fix nip.io `/api/hrm/home/summary?...` | **502** |
| Post-fix VPS localhost `:3001/api/hrm/metrics` | **200** |
| Post-fix VPS localhost `:3001/api/hrm/home/summary` (no auth) | **400** `HRM-VAL-001` (route exists — not 404/502) |
| Post-fix nip.io `/api/hrm/metrics` | **200** |
| Post-fix nip.io `/api/hrm/home/summary` (no auth) | **400** (validation — requires `employee_id` + JWT) |
| VPS `:8088/` portal-fe | **200** |
| VPS `:8080/hr/` hrm-fe | **200** |
| `xevn-hrm-be-dev` | **Up (healthy)** |
| `xevn-hrm-fe-dev` / `xevn-portal-fe-dev` | **Up** |

---

## Home/summary 04b (authenticated — exit criteria)

**URL:** `GET /api/hrm/home/summary?company_id=holding&include=celebrations,whos_out`  
**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` (mobile JWT)  
**Note:** API requires `employee_id` UUID query param per DTO; bare URL without auth returns **400**, not 404.

| Probe | Result |
|-------|--------|
| Mobile login `@ nip.io` | **201** `HRM-AUTH-200` |
| Home summary + `employee_id` + `include=celebrations,whos_out` | **200** `HRM-HOME-200` |
| `celebrations.total_count` | **5** |
| `whos_out` items | **≥ 1** (seed present) |

Command (workstation, no secrets in output):

```powershell
$env:PORTAL_DEV_URL="https://14-225-217-232.nip.io"
$env:HRM_HEALTH_URL="https://14-225-217-232.nip.io/api/hrm"
$env:XBOS_HEALTH_URL="https://14-225-217-232.nip.io/api/xbos"
pnpm run qc:fe-be-health:pilot
```

**Result:** exit **0** — 8/8 health checks + **13/13** `test:pilot:flows` PASS.

---

## Exit criteria matrix

| Criterion | Status |
|-----------|--------|
| `xevn-hrm-be-dev` healthy (no 502 on metrics/employees) | **PASS** |
| Deploy home/summary 04b module | **PASS** (pscp + `--build` recreate) |
| Optional HRM web FE avatar bundle | **PASS** (hrm-fe + portal-fe recreated; sources on disk per W4) |
| `pnpm run qc:fe-be-health:pilot` exit 0 | **PASS** |
| GET home/summary celebrations+whos_out HTTP 200 @ nip.io (auth) | **PASS** |

---

## Residual (not DevOps closure)

| Item | Owner | Note |
|------|-------|------|
| Hub probe `PCOMP-W7-QA-HUB-04b` uses `company_id=<uuid>` in query → **404** `HRM-HOME-404` | QA / dev-be | Use slug `holding` in query or fix resolver; celebrations seed OK when slug used |
| `leave-requests?company_id=holding` → **500** uuid cast | dev-be | Logged on VPS during hub traffic; out of DO scope |
| Browser avatar `<img>` DOM (J-AVT-01) | QA | API file 200; FE bundle deployed — needs R2 display retest |
| Mobile native avatar (AVT-NATIVE) | dev-mobile | PM next dispatch |

---

## completion_report

- **Closed:** Pilot nip.io L0 restored — hrm-be **healthy**, no 502 on metrics/login proxy; home/summary 04b route live with authenticated **200** + seed data; `qc:fe-be-health:pilot` **exit 0** (8/8 + 13/13); hrm-fe + portal-fe recreated for avatar FE path.
- **Open:** QA hub R3 with corrected `company_id=holding` query; dev-mobile AVT-NATIVE; dev-be leave-requests uuid scope if hub journey hits that path.

---

## Handoff

**next_owner:** `qa` (+ `dev-mobile` parallel per PM charter)

**next_dispatch_prompt:**

```
work_item_id: PCOMP-W7-QA-HUB-R3-01 + PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R2
from_role: pm
to_role: qa (+ qa-device for hub)
entry_criteria: DevOps READY_FOR_QA docs/qa/evidence/pcomp-w7-do-pilot-restore-01-20260607.md — nip.io L0 PASS, home/summary 200 with holding slug + employee_id, qc:fe-be-health:pilot exit 0.
exit_criteria: (1) Hub R3: mobile login uat.nv0001@xe.vn on https://14-225-217-232.nip.io — GET /api/hrm/home/summary?company_id=holding&employee_id={id}&include=celebrations,whos_out → 200 HRM-HOME-200, celebrations≥2, whos_out≥1, no birth_year leak; evidence docs/qa/evidence/pcomp-w7-qa-hub-r3-20260607.md PASS_TO_PM. (2) Avatar display R2: ceo@xe.vn employees list + profile ecde82b7-a85f-4183-8e1a-bb3f4bcef3de — visible img src /api/hrm/files/holding/* not initials; evidence pcomp-w4-profile-avatar-01-qa-web-display-r2-20260607.md. Wait 90s after any hrm-be restart before L0.
pm_dispatch_hint: dev-mobile PCOMP-W4-MOB-AVT-NATIVE-01 after QA hub PASS — native avatar picker/display on device.
```

**evidence_path:** `docs/qa/evidence/pcomp-w7-do-pilot-restore-01-20260607.md`
