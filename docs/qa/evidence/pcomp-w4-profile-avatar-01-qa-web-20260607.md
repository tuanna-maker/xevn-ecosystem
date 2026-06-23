# PCOMP-W4-PROFILE-AVATAR-01-QA-WEB — J-AVT-01 web retest

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-QA-WEB`  
**Date:** 2026-06-07  
**Owner:** QA  
**Environment:** Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** `PASS_TO_PM`  
**Journey:** J-AVT-01 (web EmployeeProfile avatar upload → PATCH → list/detail parity)

---

## L0 — Stack health (pilot)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
```

**Result:** exit **0** — 8/8 health + **13/13** `test:pilot:flows` PASS (2026-06-07T~11:00Z).

| Check | Result |
|-------|--------|
| portal-login ceo@xe.vn | PASS |
| portal-proxy-hrm-employees | HTTP 200 |
| P-CC-03 employees | HTTP 200 HRM-EMP-200 |
| No 409 on rollup routes | PASS |

---

## L1 — API J-AVT-01 probe (pilot)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-qa-avatar-01-probe.mjs
```

**Result:** exit **0** — **9/9** steps PASS.

| Step | HTTP | Verdict |
|------|------|---------|
| Login ceo@xe.vn | 201 | PASS |
| POST `/files/upload?feature=employee-avatar` | 201 HRM-FILE-201 | PASS |
| PATCH employee `custom_fields.avatar_url` | 200 HRM-EMP-202 | PASS |
| GET detail after PATCH | 200 | PASS — URL matches |
| GET list after PATCH | 200 | PASS — same URL as detail |
| GET detail refresh (parity) | 200 | PASS |
| Restore prior avatar | 200 | PASS |
| 409 / 500 on happy path | — | **0** |

**Field source on pilot:** `custom_fields.avatar_url` (top-level `avatar_url` PATCH returns **400 HRM-VAL-001** — BE column DTO not deployed on nip.io yet; FE `mergeEmployeeAvatarWriteFields` interim path validated).

**Sample URL (redacted pattern):** `/api/hrm/files/holding/employee-avatar-{ts}-qa-avatar-{ts}.png`

---

## L2 — FE unit contract

```bash
cd apps/web/hrm && pnpm exec vitest run src/hooks/useEmployee.test.ts
```

**Result:** **7/7** PASS — `resolveEmployeeAvatarUrl`, `mergeEmployeeAvatarWriteFields`, `mapHrmEmployeeRecord` read/write `custom_fields` + top-level fallback.

---

## L2.5 — Browser (pilot embed)

| Step | Path | Result |
|------|------|--------|
| Login | `/login` → `/command-center` | PASS |
| Employees list | `/command-center/hrm/employees?companyId=main` | PASS — list loads, no sync ERROR banner |
| Profile deep link | `/command-center/hrm/employees/ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main` | PASS — Đặng Xuân Hà TCN-0954 |
| Camera affordance | EmployeeProfile avatar area | PASS — upload button visible (HR `employees.edit`) |
| PATCH→refresh URL in UI img | After API PATCH with real upload URL | **GWC** — API returns URL on GET but **`GET /api/hrm/files/holding/{file}` → 404** via portal; Radix Avatar falls back to initials |

**Console / HRM API on profile load:** no 409, no 500 on employees GET.

---

## Scope closure

| Exit criterion | Status |
|----------------|--------|
| L0 `qc:fe-be-health:pilot` exit 0 | **CLOSED** |
| Upload → PATCH persists URL | **CLOSED** (`custom_fields.avatar_url` on pilot) |
| List + detail same URL after refresh | **CLOSED** (API parity; both resolve via `custom_fields`) |
| No 409/500 on happy path | **CLOSED** |
| J-AVT-01 web end-to-end | **PASS** with GWC file-serve display |

---

## Residual / GWC (PM → devops / dev-be)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| GWC-AVT-01 | P1 | Pilot `GET /api/hrm/files/{company}/{filename}` returns **404** — uploaded files stored but not served through nip.io proxy; UI shows initials despite persisted URL | `devops` + `dev-be` |
| GWC-AVT-02 | P2 | Pilot BE lacks top-level `avatar_url` DTO column (PATCH 400); FE dual-write ready — redeploy hrm-api when W7-2 cuts over | `devops` |
| GWC-AVT-03 | P3 | CDP automation cannot trigger hidden `<input type=file>` in HRM iframe — manual/device upload E2E deferred to QA-Device mobile wave | `qa-device` |

**not promoted:** Mobile J-AVT-01 (`PCOMP-W4-PROFILE-AVATAR-01-MOB`), celebration avatar display (04b).

---

## completion_report

- **Closed:** J-AVT-01 web API + embed navigation + FE contract on pilot; upload→PATCH→list/detail URL parity PASS; L0 13/13; vitest 7/7; no 409/500.
- **Open (GWC):** Pilot static file serve 404 blocks visible avatar image; top-level `avatar_url` column not on pilot BE yet.

## next_owner

`qc`

## next_dispatch_prompt

QC W7-2 gate — audit `PCOMP-W4-PROFILE-AVATAR-01-QA-WEB`: read `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-20260607.md`; confirm J-AVT-01 **PASS_TO_PM** with GWC-AVT-01 file-serve 404 + GWC-AVT-02 BE column deploy on nip.io before PROD avatar display claim; cross-check BE evidence `pcomp-w4-profile-avatar-01-be-20260607.md` + FE `pcomp-w4-profile-avatar-01-fe-20260607.md`; if GWC-AVT-01 accepted for UAT, record GO WITH CONDITIONS else dispatch `devops` file-route fix first.
