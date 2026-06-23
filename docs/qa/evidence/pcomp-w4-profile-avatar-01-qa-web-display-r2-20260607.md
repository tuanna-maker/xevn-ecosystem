# PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R2 — J-AVT-01 display retest (nip.io)

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R2`  
**Date:** 2026-06-07  
**Owner:** QA  
**Environment:** Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** `FAIL_TO_PM`  
**Journey:** J-AVT-01 (web — visible `<img src="/api/hrm/files/holding/*">` on list row TCN-0954 + profile, not Radix initials)

**Upstream:** DevOps `PCOMP-W4-DO-AVT-WEB-01` READY_FOR_QA — `docs/qa/evidence/pcomp-w4-do-avt-web-01-20260607.md`  
**Closes attempt:** prior FAIL `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY` / `D-W4-AVT-DISPLAY-01` — **NOT CLOSED**

---

## L0 — Stack health (pilot)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
```

| Check | Result |
|-------|--------|
| Script exit | **1** — local `:28001` ECONNREFUSED (dev machine; expected when testing remote pilot only) |
| Portal + proxy HRM | **PASS** — `portal-proxy-hrm-employees` 200, `portal-proxy-hrm-catalog` 200 |
| `test:pilot:flows` | **13/13 PASS** |

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs
```

| Step | Result |
|------|--------|
| DO avatar file smoke | exit **0** — **6/6 PASS** (login, upload, PATCH, file GET 200, employee `avatar_url` parity) |

**Entry L0 (pilot proxy + flows):** **PASS** for nip.io UAT slice. Local direct `:28001` checks N/A on QA workstation.

---

## L1 — API subject (ecde82b7 / TCN-0954)

**Employee:** `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de` — Đặng Xuân Hà / **TCN-0954**

| Probe | Result |
|-------|--------|
| GET detail `?company_id=main` (Bearer portal token) | **200** — `avatar_url=/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png` |
| GET file via nip.io | **200** `image/png` |
| `custom_fields.avatar_url` | same holding path |

**GWC-AVT-01/02 (file-serve + top-level DTO):** remain **CLOSED** on API layer.

---

## L2.5 — J-AVT-01 DISPLAY (browser — mandatory)

**Account:** `ceo@xe.vn`  
**Click path attempted:**

1. `/login` → Command Center (**PASS** — session `xevn.portal.accessToken` present)
2. `/command-center/hrm/employees?companyId=main` — embed iframe loads but **blank** (0 React children)
3. `/command-center/hrm/employees/ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main` — same **blank iframe**
4. Direct `/hr/employees/...?portal=1&tenantId=xevn&companyId=main` — **blank** after 60s poll

### DOM / module probes (CDP)

| Check | Expected | Observed | Verdict |
|-------|----------|----------|---------|
| `#root` child count after 20–60s | >0 | **0** (empty `<div id="root"></div>`) | **FAIL** |
| Visible `<img src*="holding">` on profile | ≥1 | **0** | **FAIL** |
| Visible `<img src*="holding">` on list / TCN-0954 | ≥1 | **0** (list never rendered) | **FAIL** |
| Radix `AvatarFallback` initials only | No | N/A — app did not mount | **FAIL** |
| `import('/hr/src/pages/EmployeeProfile.tsx')` | OK | **SyntaxError:** `hrmListScope.ts` missing export `normalizeHrmApiListCompanyId` | **FAIL** |
| `GET /hr/src/pages/Employees.tsx` (Vite transform) | 200 | **500** | **FAIL** |
| `GET /hr/src/lib/hrmListScope.ts` on pilot | includes `normalizeHrmApiListCompanyId` | **200** len=3088, **export absent** | **FAIL** |
| `GET /hr/src/hooks/useEmployee.ts` on pilot | includes `resolveEmployeeAvatarUrl` | **200** — present (**DevOps sync OK**) | PASS |

**Screenshots (session):** blank white HRM iframe / profile shell — CDP captures `page-2026-06-07T11-43-20-527Z.png`, `page-2026-06-07T11-45-09-005Z.png`, `page-2026-06-07T11-49-06-253Z.png` (local temp).

**Console class:** Vite dynamic import failure — incomplete FE dependency tree on VPS after partial avatar file sync.

---

## Root cause (QA assessment)

| Layer | Status | Note |
|-------|--------|------|
| BE file-serve + `avatar_url` DTO | **PASS** | smoke 6/6 + detail GET |
| FE avatar mapping files (`useEmployee`, `EmployeeProfile` AvatarImage) | **Deployed** on disk/Vite | DevOps evidence confirmed |
| FE **dependency parity** on pilot | **FAIL** | `hrmListScope.ts` on VPS **stale** — missing `normalizeHrmApiListCompanyId` required by `useEmployee` / `hrmApi` / profile route |
| `Employees.tsx` Vite compile | **FAIL** | HTTP **500** — blocks list route |
| J-AVT-01 visible image | **BLOCKED** | React embed never mounts → cannot assert `<img>` vs initials |

**Defect (continues):** `D-W4-AVT-DISPLAY-01` — display blocked by **partial pilot FE deploy** (avatar files without `hrmListScope.ts` + list page compile failure).

**New sub-finding:** `D-W4-AVT-FE-SCOPE-SYNC-01` — pilot `hrmListScope.ts` drift vs repo; Vite module graph broken.

---

## Exit criteria matrix

| Criterion | Status |
|-----------|--------|
| L0 `qc:fe-be-health:pilot` first | **PASS** pilot proxy + 13/13 (script exit 1 local only) |
| Browser J-AVT-01 on nip.io | **FAIL** — blank embed |
| Visible holding `<img>` list TCN-0954 + profile | **FAIL** |
| Not Radix initials fallback | **FAIL** (app did not render) |
| Closes `D-W4-AVT-DISPLAY-01` | **NO** |

---

## Residual / PM dispatch

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| D-W4-AVT-DISPLAY-01 | **P0** | J-AVT-01 display still blocked — iframe blank | `devops` + `dev-fe` |
| D-W4-AVT-FE-SCOPE-SYNC-01 | **P0** | Pilot missing `normalizeHrmApiListCompanyId`; `Employees.tsx` Vite 500 | `devops` sync `hrmListScope.ts` + verify full module graph |
| D-W4-AVT-HRM-BLANK-01 | P1 | HRM embed `#root` empty after DO deploy | `devops` recreate hrm-fe after full FE sync |

**not promoted:** J-AVT-01 DISPLAY row; mobile J-AVT-02/03.

---

## Commands run

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot          # exit 1 local; 13/13 pilot PASS
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs  # 0
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-qa-avatar-list-field-check.mjs     # detail avatar_url OK
# Browser CDP: login → CC → employees list → profile ecde82b7 — DOM + dynamic import probes
# PowerShell: GET pilot /hr/src/lib/hrmListScope.ts — normalizeHrmApiListCompanyId absent
```

---

**completion_report:** DevOps avatar FE sync **insufficient** for runtime. API + file GET **PASS** (6/6 smoke, TCN-0954 `avatar_url` holding path 200). Browser J-AVT-01 DISPLAY **FAIL** — HRM iframe never mounts (`#root` empty); `EmployeeProfile` dynamic import fails on missing `normalizeHrmApiListCompanyId` in pilot `hrmListScope.ts`; `Employees.tsx` Vite **500**. **`D-W4-AVT-DISPLAY-01` NOT CLOSED.**

**next_owner:** `devops`

**next_dispatch_prompt:** Sync full HRM web FE dependency set to pilot VPS — minimum `apps/web/hrm/src/lib/hrmListScope.ts` (must export `normalizeHrmApiListCompanyId`) plus verify `Employees.tsx` Vite transform **200** (`curl /hr/src/pages/Employees.tsx`); force-recreate `xevn-hrm-fe-dev`; wait 90s; then dispatch **qa** retest `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R3` — J-AVT-01 visible `<img src="/api/hrm/files/holding/*">` on list row TCN-0954 + profile `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de?companyId=main`; evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r3-YYYYMMDD.md`.

**evidence_path:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r2-20260607.md`

**ack_status:** `FAIL_TO_PM`
