# PCOMP-W4-DO-AVT-FILE-01-R1 — Pilot avatar file serve + avatar_url deploy

**work_item_id:** `PCOMP-W4-DO-AVT-FILE-01-R1`  
**Date:** 2026-06-07  
**Owner:** DevOps  
**VPS:** `14.225.217.232` · Pilot `https://14-225-217-232.nip.io`  
**ack_status:** `READY_FOR_QA`

---

## Root cause

| GWC | Finding | Fix |
|-----|---------|-----|
| **GWC-AVT-01** | `GET /api/hrm/files/holding/{file}` → **404** on nip.io — upload persisted but no static serve route deployed | PSCP `readUploadedFile` + `GET files/:companyId/:filename` route; recreate `xevn-hrm-be-dev` |
| **GWC-AVT-02** | Top-level `avatar_url` PATCH → **400** on pilot — W4 BE column/DTO not on VPS | PSCP `employees.service.ts`, DTOs, `employee-update-policy.ts`; hrm-be restart |

**Additional incident:** `xevn-hrm-be-dev` was **down** (nip.io HRM **502**, local `:3001` **000**) before redeploy.

---

## Actions executed

1. **Audit VPS** — `docker ps`, `curl :3001`, `curl nip.io/api/hrm/metrics`
2. **PSCP** avatar/file-serve + `avatar_url` BE sources to `/opt/xevn-ecosystem`
3. **`docker compose up -d --build --force-recreate hrm-be`** — container healthy, route mapped:
   - `Mapped {/api/hrm/files/:companyId/:filename, GET}`
   - `Mapped {/api/hrm/files/upload, POST}`
4. **mkdir** `/opt/xevn-ecosystem/uploads/hrm-files/holding` (bind-mount via repo root)

### Files synced (VPS)

- `apps/api/hrm-api/src/catalog-extensions/catalog-extensions.controller.ts`
- `apps/api/hrm-api/src/catalog-extensions/catalog-extensions.service.ts`
- `apps/api/hrm-api/src/employees/employees.service.ts`
- `apps/api/hrm-api/src/employees/dto/create-employee.dto.ts`
- `apps/api/hrm-api/src/employees/dto/update-employee.dto.ts`
- `apps/api/hrm-api/src/employees/employee-update-policy.ts`

---

## Smoke — upload → PATCH → GET file (nip.io)

```bash
node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs
```

**Result:** exit **0** — **6/6** PASS (2026-06-07T~11:13Z)

| Step | HTTP | Verdict |
|------|------|---------|
| Login `ceo@xe.vn` | 201 | PASS |
| POST `/files/upload?feature=employee-avatar` | 201 HRM-FILE-201 | PASS |
| PATCH top-level `avatar_url` | 200 HRM-EMP-202 | PASS |
| GET `/api/hrm/files/holding/{uploaded-file}` via nip.io | **200** `image/png` | PASS |
| GET employee `avatar_url` top-level | matches upload URL | PASS |

**Sample file URL (pattern):** `/api/hrm/files/holding/employee-avatar-{ts}-do-smoke-{ts}.png`

---

## L0 — Stack health (post-deploy)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
```

**Result:** exit **0** — 8/8 health + **13/13** pilot flows PASS.

| Check | Result |
|-------|--------|
| hrm-api `:3001` (VPS direct) | 200 |
| nip.io portal proxy employees | 200 |
| nip.io HRM metrics | 200 |

---

## GWC closure status

| Condition | Status |
|-----------|--------|
| GWC-AVT-01 file GET 200 | **CLOSED** (smoke + route mapped) |
| GWC-AVT-02 top-level `avatar_url` PATCH | **CLOSED** (HRM-EMP-202 on pilot) |

---

## QA dispatch (J-AVT-01 display)

Retest **visible `<img>`** on employee list + profile after API PATCH with real upload URL:

- Account: `ceo@xe.vn` / `Xevn@2026`
- Path: `/command-center/hrm/employees?companyId=main` → profile deep link
- Expect: avatar image renders (not Radix initials fallback); `GET` file **200** in Network tab

---

## Residual

- Smoke restores avatar on test employee via PATCH; QA may use fresh upload for display proof.
- **GWC-AVT-03** (CDP file-input automation) unchanged — `qa-device` mobile wave.
- VPS code synced via PSCP (not `git push main`) — sponsor merge/commit when ready.

---

**completion_report:** GWC-AVT-01/02 closed on nip.io — hrm-be redeployed with `GET /api/hrm/files/:companyId/:filename` + top-level `avatar_url` DTO; upload→PATCH→GET file smoke **PASS**; L0 pilot health **PASS**.  
**next_owner:** `qa`  
**next_dispatch_prompt:** Retest J-AVT-01 display on `https://14-225-217-232.nip.io`: upload avatar on EmployeeProfile → PATCH persists → verify visible `<img>` on list + profile (not initials fallback); confirm Network `GET /api/hrm/files/holding/*` **200**; evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-20260607.md` PASS_TO_PM.
