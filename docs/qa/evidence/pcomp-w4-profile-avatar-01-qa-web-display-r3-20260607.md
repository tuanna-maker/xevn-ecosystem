# PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R3 — J-AVT-01 display retest (nip.io)

**work_item_id:** `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R3`  
**Date:** 2026-06-07  
**Owner:** QA  
**Environment:** Pilot `https://14-225-217-232.nip.io` · `ceo@xe.vn` / `Xevn@2026`  
**ack_status:** `FAIL_TO_PM`  
**Journey:** J-AVT-01 (web — visible `<img src="/api/hrm/files/holding/*">` on list row TCN-0954 + profile, not Radix initials)

**Upstream:** DevOps `PCOMP-W4-DO-AVT-WEB-02-R1` READY_FOR_QA — `docs/qa/evidence/pcomp-w4-do-avt-web-02-20260607.md`  
**Closes attempt:** `D-W4-AVT-DISPLAY-01` — **NOT CLOSED** (employees list route still broken)

---

## L0 — Stack health (pilot)

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot
```

| Check | Result |
|-------|--------|
| Script exit | **0** |
| Health checks | **8/8 PASS** |
| `test:pilot:flows` | **13/13 PASS** |

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs
```

| Step | Result |
|------|--------|
| DO avatar file smoke | exit **0** — **6/6 PASS** |

---

## L1 — API / module probes

**Employee:** `ecde82b7-a85f-4183-8e1a-bb3f4bcef3de` — Đặng Xuân Hà / **TCN-0954**

| Probe | Result |
|-------|--------|
| GET detail `?company_id=main` | **200** — `avatar_url=/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png` |
| GET file via nip.io | **200** `image/png` |
| `GET /hr/src/lib/hrmListScope.ts` | includes `export function normalizeHrmApiListCompanyId` — **PASS** |
| `GET /hr/src/pages/Employees.tsx` Vite | **HTTP 200** (was 500 in R2) |
| Dynamic import `Employees.tsx` / `EmployeeProfile.tsx` | **ok** (module graph fixed vs R2) |
| `D-W4-AVT-FE-SCOPE-SYNC-01` | **CLOSED** at QA layer |

---

## L2.5 — J-AVT-01 DISPLAY (browser — mandatory)

**Account:** `ceo@xe.vn` (session `xevn.portal.accessToken` present)

### Profile deep link — **PASS**

| Path | `#root` mount | TCN-0954 | Holding `<img>` | Radix initials |
|------|---------------|----------|-----------------|----------------|
| Direct `/hr/employees/ecde82b7-…?portal=1&tenantId=xevn&companyId=main` | **4** children | **yes** | **yes** — `/api/hrm/files/holding/employee-avatar-1780830092205-qa-javt01.png` **90×90** visible | **no** |
| CC embed `/command-center/hrm/employees/ecde82b7-…?companyId=main` (iframe) | **4** children | **yes** | **yes** — same holding path **90px** wide | **no** |

**Screenshot:** profile with gradient avatar image + TCN-0954 badge — `page-2026-06-07T14-10-02-559Z.png` (local temp).

### Employees list — **FAIL**

| Path | `#root` mount | TCN-0954 row | Holding `<img>` on list |
|------|---------------|--------------|-------------------------|
| Direct `/hr/employees?portal=1&tenantId=xevn&companyId=main` | **0** (blank) after 25s | N/A | **0** |
| CC embed `/command-center/hrm/employees?companyId=main` (iframe) | **0** (blank) after 25s | N/A | **0** |

**Console (CDP):**

```
Uncaught ReferenceError: companyFilter is not defined
  at Employees.tsx:93
```

**Pilot source drift:** Vite-served `Employees.tsx` references `companyFilter` in `useEffect` deps and `importSpreadsheetScope` but **does not declare** `companyFilter` state (repo `apps/web/hrm/src/pages/Employees.tsx` uses `useCanAddEmployee()` at line 93 — pilot file is **stale/mixed**).

Navigating profile → list via client-side router: `rootKids` **4 → 0** (full app crash on Employees route).

---

## Exit criteria matrix

| # | Criterion | Status |
|---|-----------|--------|
| 1 | `pnpm run qc:fe-be-health:pilot` exit 0 | **PASS** |
| 2 | Browser J-AVT-01 @ nip.io `ceo@xe.vn` | **PARTIAL** — profile PASS; list FAIL |
| 3 | HRM iframe `#root` mounts (not blank) | **PARTIAL** — profile embed PASS; **list embed blank** |
| 4 | List TCN-0954 + profile holding `<img>` not initials | **PARTIAL** — profile **PASS**; list **FAIL** (route crash) |
| 5 | Evidence + closes `D-W4-AVT-DISPLAY-01` | Evidence **yes**; defect **NOT CLOSED** |

---

## Defect status

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| `D-W4-AVT-DISPLAY-01` | **P0** | J-AVT-01 list row still blocked — Employees route runtime crash | `devops` + `dev-fe` |
| `D-W4-AVT-EMPLOYEES-CRASH-01` | **P0** | Pilot `Employees.tsx` `ReferenceError: companyFilter is not defined` @ line 93 | `devops` re-sync `Employees.tsx` from repo + recreate `hrm-fe` |
| `D-W4-AVT-FE-SCOPE-SYNC-01` | — | **CLOSED** (R3 confirms export + imports) | — |
| `D-W4-AVT-HRM-BLANK-01` | P1 | List embed blank | **OPEN** — same root cause as crash |

**Promoted:** J-AVT-01 **profile display** slice (holding img on `ecde82b7…`).  
**not promoted:** J-AVT-01 **list display** row; mobile J-AVT-02/03.

---

## Commands run

```bash
PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run qc:fe-be-health:pilot                    # exit 0
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-do-avt-file-smoke-20260607.mjs  # exit 0
PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-pcomp-w4-qa-avatar-list-field-check.mjs   # detail avatar_url OK
curl.exe -s -o NUL -w "%{http_code}" https://14-225-217-232.nip.io/hr/src/pages/Employees.tsx       # 200
# Browser CDP: login → CC profile embed → direct profile → list routes → console capture
```

---

**completion_report:** L0 **PASS** (8/8 + 13/13 nip.io). DevOps R1 fix **partially effective**: `normalizeHrmApiListCompanyId` + Vite **200** + profile route shows visible holding `<img>` 90×90 (not Radix initials) on direct + CC embed for `ecde82b7…` / TCN-0954. **FAIL:** Employees **list** route crashes `ReferenceError: companyFilter is not defined` (pilot `Employees.tsx` stale); CC list iframe blank (`#root` 0). **`D-W4-AVT-DISPLAY-01` NOT CLOSED.**

**next_owner:** `devops`

**next_dispatch_prompt:** Re-sync pilot `apps/web/hrm/src/pages/Employees.tsx` from repo HEAD (must not reference undeclared `companyFilter`; verify `useCanAddEmployee` / operating-unit filter parity); `grep -c companyFilter` on VPS should match repo or be zero with correct state vars; force-recreate `xevn-hrm-fe-dev`, wait 90s; curl `/hr/src/pages/Employees.tsx` + browser smoke list mount; then dispatch **qa** retest `PCOMP-W4-PROFILE-AVATAR-01-QA-DISPLAY-R4` — J-AVT-01 list row TCN-0954 holding `<img>` + profile parity on `https://14-225-217-232.nip.io`; evidence `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-YYYYMMDD.md`.

**evidence_path:** `docs/qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r3-20260607.md`

**ack_status:** `FAIL_TO_PM`
