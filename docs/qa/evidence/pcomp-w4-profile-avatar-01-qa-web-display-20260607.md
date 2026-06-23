# PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY — J-AVT-01 display retest (nip.io)

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY`  
**Date:** 2026-06-07  
**Owner:** QA  
**Environment:** Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** `FAIL_TO_PM`  
**Journey:** J-AVT-01 (web — visible avatar image on list + profile after upload/PATCH)

**Upstream:** `PCOMP-W4-DO-AVT-FILE-01-R1` READY_FOR_QA — `docs/qa/evidence/pcomp-w4-do-avt-file-01-20260607.md`

---

## L0 — Stack health (pilot)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
```

| Run | Time (local) | Result |
|-----|--------------|--------|
| **Pre-display test** | 2026-06-07 session start | exit **0** — 8/8 health + **13/13** pilot flows PASS |
| **Post-display test** | 2026-06-07 session end | exit **1** — HRM proxy **502** on P-CC-03..08 (hrm-be intermittent) |

**Entry criterion L0 @ start:** **CLOSED** (exit 0 before browser/display phase).

---

## L1 — API / file-serve (GWC-AVT-01/02 closure verify)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs
```

**Result:** exit **0** — **6/6** PASS (session start)

| Step | HTTP | Verdict |
|------|------|---------|
| Login `ceo@xe.vn` | 201 | PASS |
| POST `/files/upload?feature=employee-avatar` | 201 | PASS |
| PATCH top-level `avatar_url` | 200 HRM-EMP-202 | PASS |
| GET `/api/hrm/files/holding/{file}` via nip.io | **200** `image/png` | PASS |
| GET employee top-level `avatar_url` | matches upload URL | PASS |

**Test subject (profile deep link):** `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de` — Đặng Xuân Hà / TCN-0954

| Probe | Result |
|-------|--------|
| GET detail `avatar_url` (after PATCH) | `/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png` |
| GET file URL | **200** `image/png` (9681 bytes) |
| Iframe-context `fetch(fileUrl)` | **200**; `Image()` load **147×108** OK |

**GWC-AVT-01 (file-serve 404):** **CLOSED** on nip.io at test time.  
**GWC-AVT-02 (top-level PATCH 400):** **CLOSED** on nip.io at test time.

---

## L2.5 — J-AVT-01 DISPLAY (browser — mandatory)

**Account:** `ceo@xe.vn`  
**Click path:**

1. `/login` → Command Center (PASS)
2. `/command-center/hrm/employees?companyId=main` — employees list (PASS, no sync ERROR)
3. `/command-center/hrm/employees/ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main` — EmployeeProfile (PASS load)

### Profile avatar DOM (iframe `hr/employees/{id}?portal=1`)

| Check | Expected | Observed | Verdict |
|-------|----------|----------|---------|
| Visible `<img>` with `/api/hrm/files/holding/*` src | Yes | **0** `img` nodes; Radix `AvatarFallback` text **"H"** only | **FAIL** |
| Not initials fallback | Yes | **"H"** in `rounded-full` avatar span (98×98px) | **FAIL** |
| Network GET file from iframe | 200 image | **200** `image/png` (verified via iframe `fetch` + `Image()`) | PASS |
| API detail `avatar_url` in iframe session | set | **200** HRM-EMP-200 with top-level + `custom_fields.avatar_url` | PASS |

### List avatar DOM

| Check | Expected | Observed | Verdict |
|-------|----------|----------|---------|
| Row for TCN-0954 shows uploaded image | Yes | Search/filter did not isolate row; visible rows (HLD-0061, VTH-0057, …) all show initials **"A"** | **FAIL** |
| Any list row `<img src*="holding">` | ≥1 when API has `avatar_url` | **0** holding imgs in list iframe | **FAIL** |

**Console on profile load:** no 409; no 500 while HRM up (session window).

**UI upload E2E:** CDP cannot trigger hidden `<input type=file>` in embed (known GWC-AVT-03); display verdict based on API-persisted URL + refresh (per prior QA web evidence).

---

## Scope closure vs exit criteria

| Exit criterion | Status |
|----------------|--------|
| L0 `qc:fe-be-health:pilot` exit 0 **first** | **CLOSED** @ session start |
| Upload → PATCH persists URL | **CLOSED** (API) |
| **Visible img** on profile (not initials) after refresh | **FAIL** |
| **Visible img** on list after refresh | **FAIL** |
| Network `GET /api/hrm/files/holding/*` **200** image | **CLOSED** |
| J-AVT-01 DISPLAY end-to-end | **FAIL** |

---

## Root cause (QA assessment)

| Layer | Status | Note |
|-------|--------|------|
| BE file-serve + `avatar_url` DTO | PASS | DO smoke + iframe API confirm |
| FE render (`AvatarImage` / `resolveEmployeeAvatarUrl`) | **FAIL** | API returns URL; image bytes load; DOM renders **AvatarFallback only** — pilot HRM **web FE bundle likely not redeployed** with W4 avatar display mapping (`apps/web/hrm` `mapHrmEmployeeRecord` / `Employees.tsx` `AvatarImage`) |

**Defect:** `D-W4-AVT-DISPLAY-01` — scope_parity/display: API+file OK, UI initials fallback persists.

---

## Residual / PM dispatch

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| D-W4-AVT-DISPLAY-01 | **P0** | Profile+list show initials despite `avatar_url` + file GET 200 | `devops` (redeploy `hrm-web`/`web-portal` pilot) + `dev-fe` verify |
| D-W4-AVT-HRM-502 | P1 | End-of-session HRM proxy **502** on employees/catalog routes | `devops` stabilize `xevn-hrm-be-dev` |
| GWC-AVT-03 | P3 | CDP file-input upload E2E deferred | `qa-device` mobile wave |

**not promoted:** J-AVT-01 DISPLAY row; mobile J-AVT-02/03.

---

## Commands run

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot          # 0 then 1
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs  # 0
# Browser CDP: nip.io login → employees list → profile ecde82b7-… — DOM + iframe fetch probes
```

---

**completion_report:** GWC-AVT-01/02 **CLOSED** (file GET 200, top-level PATCH 200). J-AVT-01 **DISPLAY FAIL** — profile shows Radix initials **"H"**, list rows initials **"A"**, zero `<img src="/api/hrm/files/holding/*">` despite API `avatar_url` set and image bytes loading. L0 PASS at start; HRM **502** at session end.

**next_owner:** `devops` → `dev-fe` → `qa`

**next_dispatch_prompt:** Deploy pilot HRM web bundle with W4 avatar FE (`resolveEmployeeAvatarUrl`, `EmployeeProfile`/`Employees` `AvatarImage`) to `https://14-225-217-232.nip.io`; restart `xevn-hrm-be-dev` if 502; then dispatch **qa** retest `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R2` — J-AVT-01 visible img on list+profile after refresh, `GET /api/hrm/files/holding/*` 200; evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r2-YYYYMMDD.md`.

**evidence_path:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-20260607.md`

**ack_status:** `FAIL_TO_PM`
