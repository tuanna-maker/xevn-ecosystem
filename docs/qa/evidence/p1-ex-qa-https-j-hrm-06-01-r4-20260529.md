# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01-R4

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01-R4` |
| from_role | `devops` |
| to_role | `qa` → `pm` |
| execution_time_utc | `2026-05-29T03:15Z` (approx) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| entry_evidence | `docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-att-blank-01-20260529.md` (container `2026-05-29T01:30:12Z`) |
| prior_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md` (`attendance_route_blank`) |
| ack_status | **FAIL_TO_PM** |

## Scope

1. **J-HRM-06** — L2.5 attendance list → employee profile (CC iframe + direct embed); `#root` not empty after 30s on `/hr/attendance`.
2. **P-CC-07** — L2 full UI: `fallback54321=0`, HRM API Sync CONNECTED observable, `GET attendance/records` **200**.

## Method

- Cursor browser MCP + CDP `Runtime.evaluate` (cache-bust `&_cb=r4*`).
- Portal session `ceo@xe.vn` on Command Center (`xevn.portal.accessToken` present).
- API probe: `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs`.
- Vite module smoke: `GET /hr/src/*.tsx` HTTP status from workstation.

---

## Deploy precondition (att-blank-01)

| Check | R3 | R4 | Verdict |
|-------|----|----|---------|
| Container started | `2026-05-29T00:19:31Z` (scope-02) | `2026-05-29T01:30:12Z` (att-blank-01) | **PASS** (new deploy) |
| `AttendanceEntry.tsx` pilot source | n/a (pre-fix) | HTTP **200**, len **7979**, `hasLoading=true`, `hasBoundary=true` | **PASS** |
| `AttendanceEntry` / `RouteErrorBoundary` Vite | — | HTTP **200** | **PASS** |
| **`App.tsx` Vite transform** | HTTP **200** (R3 employee UI worked) | HTTP **500** | **FAIL** (regression) |
| `main.tsx` Vite | — | HTTP **200** | **PASS** |

**AttendanceEntry shell deploy landed on disk, but `App.tsx` no longer compiles on pilot Vite — entire HRM SPA fails to boot.**

---

## P-CC-07 — L2 matrix (attendance)

| Check | CC `/command-center/hrm/attendance?companyId=main` | Direct `/hr/attendance?portal=1&companyId=main` | Verdict |
|-------|-----------------------------------------------------|--------------------------------------------------|---------|
| Route HTTP (nginx) | Parent **200**; iframe src present | **200** | **PASS** |
| `fallback54321` | **0** | **0** | **PASS** |
| In-session API (`xevn.portal.accessToken`) | `GET attendance/records?company_id=main` → **200** `HRM-ATT-200`, `total=299` | same session | **PASS** |
| `tmp-p1-ex-qa-https-01-probe.mjs` P-CC-07 | **PASS** | — | **PASS** (API) |
| HRM sync CONNECTED (UI) | **Not observable** — iframe `#root` empty | **Not observable** — `#root` `rootChildren=0` after **30s** | **FAIL** |
| Attendance workbench / loading shell | No `attendance-entry-loading`; `bodyLen=0` | No loading marker; `innerHTML=""` | **FAIL** |
| Vite boot blocker | Parent OK | `GET /hr/src/App.tsx` → **500** | **FAIL** |

**P-CC-07:** API + fallback gate **PASS**; **full UI FAIL** — HRM SPA does not mount (broader than R3 `attendance_route_blank`).

---

## J-HRM-06 — L2.5 list → detail

### API layer

| Probe | Result |
|-------|--------|
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000021?company_id=main` (in-session) | **200** `HRM-EMP-200`, `Nguyen NhanSu0021` |
| `GET /api/hrm/attendance/records?company_id=main` | **200** `HRM-ATT-200`, `total=299` |
| `tmp-p1-ex-qa-https-01-probe.mjs` **J-HRM-06** | **PASS** |

### UI layer

| Path | Expected | Observed | Verdict |
|------|----------|----------|---------|
| CC iframe `/command-center/hrm/attendance` | Overview / records; list→profile | iframe `#root` **0** children, `bodyLen=0` (25s) | **FAIL** |
| Direct `/hr/attendance?portal=1&companyId=main` | Loading shell or workbench | `#root` empty **30s**; no `attendance-entry-loading` | **FAIL** |
| CC iframe employee profile (regression) | Profile visible (R3 **PASS**) | iframe `#root` **0** children — **not regressed at logic layer; blocked by App.tsx 500** | **FAIL** |
| Direct `/hr/employees/{id}?portal=1` | Profile (R3 **PASS**) | `#root` empty; scripts load (`main.tsx`) but React tree never mounts | **FAIL** |
| List→detail from attendance table | Click row → profile | **Not executable** — SPA blank | **FAIL** |

**R3 `attendance_route_blank`:** **NOT CLOSED** — attendance UI still blank.

**R3 `scope_parity` on profile UI:** **REGRESSED** this run — same API **200**, but UI cannot render because **`App.tsx` Vite 500** (employee route also blank).

---

## Root cause (R4)

| Signal | Value |
|--------|--------|
| `performance` resource | `App.tsx` `responseStatus=500` |
| Workstation fetch | `GET https://14-225-217-232.nip.io/hr/src/App.tsx` → **500** |
| Other modules | `AttendanceEntry.tsx` **200**, `RouteErrorBoundary.tsx` **200**, `main.tsx` **200**, `Attendance.tsx` **200** |
| Tag | `vite_app_tsx_500` / `hrm_spa_boot_fail` |

---

## Console / network excerpt (sanitized)

```text
probe: P-CC-07 PASS (HRM-ATT-200); J-HRM-06 PASS (API)
fallback54321=0 (CC + direct)
in-session: employees/…0021 → 200 HRM-EMP-200 Nguyen NhanSu0021
in-session: attendance/records → 200 HRM-ATT-200 total=299
UI CC attendance iframe: rootChildren=0 bodyLen=0 (25s)
UI direct /hr/attendance: rootChildren=0 bodyLen=0 (30s) hasLoading=false
UI direct /hr/employees/…0021: rootChildren=0 (20s) — R3 profile PASS not reproduced
Vite: GET /hr/src/App.tsx → 500
Vite: GET /hr/src/pages/AttendanceEntry.tsx → 200 hasLoading=true
deploy: container 2026-05-29T01:30:12Z (att-blank-01)
```

---

## Verdict summary

| Gate | Result |
|------|--------|
| att-blank-01 deploy + AttendanceEntry on disk | **PASS** |
| **`App.tsx` pilot Vite compile** | **FAIL** (**500**) |
| J-HRM-06 L2.5 UI (list→detail, attendance surface) | **FAIL** |
| J-HRM-06 `scope_parity` UI (profile; API 200) | **FAIL** (SPA boot blocked) |
| P-CC-07 API + `fallback54321=0` | **PASS** |
| P-CC-07 full UI (sync CONNECTED + attendance surface) | **FAIL** |
| **Overall** | **FAIL_TO_PM** |

---

## completion_report

- **Closed:** DevOps att-blank-01 sync — `AttendanceEntry` + `RouteErrorBoundary` served on pilot; L0 HTTP **200**; API probe **P-CC-07** / **J-HRM-06** **PASS**.
- **Not closed / FAIL:** Attendance blank-root fix **insufficient** — pilot **`App.tsx` returns Vite 500**, so **no HRM route mounts** (attendance + employee profile). **P-CC-07** and **J-HRM-06** **full UI** remain **FAIL**; L2.5 list→detail **not executable**.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-APP-500-01
from_role: pm
to_role: devops
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r4-20260529.md — FAIL vite_app_tsx_500; GET /hr/src/App.tsx → 500 while AttendanceEntry/RouteErrorBoundary → 200; container 2026-05-29T01:30:12Z
exit_criteria: On pilot, GET /hr/src/App.tsx HTTP 200; Vite dev log shows no transform error for App.tsx; recreate hrm-fe if needed; handoff READY_FOR_QA with container_started timestamp
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-app-500-01-20260529.md
ack_status: READY_FOR_QA

Then:
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R5
from_role: devops
to_role: qa
entry_criteria: App.tsx Vite 200 on pilot + prior att-blank markers
exit_criteria: J-HRM-06 L2.5 PASS (attendance list/row → profile CC + direct; #root not empty 30s; attendance-entry-loading or workbench) + P-CC-07 UI CONNECTED + fallback54321=0 on https://14-225-217-232.nip.io ceo@xe.vn
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r5-20260529.md
ack_status: PASS_TO_PM or FAIL_TO_PM
```

## pm_dispatch_hint

`P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-APP-500-01` — pilot `App.tsx` Vite **500** blocks all HRM UI after att-blank-01; API layer green; do not claim att-blank closed until R5 QA PASS.

---

## Bus block

```text
## 2026-05-29T03:15:00Z | qa -> pm | P1-EX-QA-HTTPS-J-HRM-06-01-R4 FAIL_TO_PM
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R4
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r4-20260529.md
summary: att-blank deploy landed AttendanceEntry on disk but App.tsx Vite 500 — entire HRM SPA blank; P-CC-07/J-HRM-06 API PASS, full UI FAIL.
pm_dispatch_hint: P1-EX-DO-DEPLOY-HTTPS-J-HRM-06-APP-500-01 then R5 QA
```
