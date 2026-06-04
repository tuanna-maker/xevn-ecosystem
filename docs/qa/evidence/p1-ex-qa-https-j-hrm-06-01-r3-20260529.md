# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01-R3

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01-R3` |
| from_role | `devops` |
| to_role | `qa` → `pm` |
| execution_time_utc | `2026-05-29T02:30Z` (approx) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| entry_evidence | `docs/ops/evidence/p1-ex-do-deploy-https-j-hrm-06-scope-02-20260529.md` (container `2026-05-29T00:19:31Z`) |
| prior_fail | `docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r2-20260529.md` (`deploy_partial` — `waitForPortalAccessToken`) |
| ack_status | **FAIL_TO_PM** |

## Scope

1. **J-HRM-06** — L2.5 attendance → employee profile (`company_id=main`), CC iframe + direct embed + deep link.
2. **P-CC-07** — L2: `fallback54321=0`, sync CONNECTED observable, attendance list API **200**.
3. No **PAGEERROR** on `portalAuthBridge` / missing `waitForPortalAccessToken` export (R2 blocker).

## Method

- Cursor browser MCP + CDP `Runtime.evaluate` on live HTTPS pilot (hard refresh / cache-bust `&_cb=r3*`).
- Portal login `ceo@xe.vn` → Command Center + direct `/hr/*` embed.
- API probe: `node scripts/tmp-p1-ex-qa-https-01-probe.mjs` (`PORTAL_DEV_URL=https://14-225-217-232.nip.io`).

---

## Deploy precondition (R2 `deploy_partial` closed)

| Check | R2 | R3 | Verdict |
|-------|----|----|---------|
| `GET /hr/src/lib/portalAuthBridge.ts` len | 11018 | **14195** | **PASS** |
| `waitForPortalAccessToken` in source | **0** | **true** | **PASS** |
| PAGEERROR `waitForPortalAccessToken` on boot | **yes** (all `/hr/*`) | **no** (employee route mounts) | **PASS** |
| Container / deploy ref | scope-01 | scope-02 `2026-05-29T00:19:31Z` | **PASS** |

**R2 `deploy_partial` for `portalAuthBridge.ts` is closed.**

---

## P-CC-07 — L2 matrix (attendance)

| Check | CC `/command-center/hrm/attendance?companyId=main` | Direct `/hr/attendance?portal=1&companyId=main` | Verdict |
|-------|-----------------------------------------------------|--------------------------------------------------|---------|
| Route HTTP | Parent **200**; iframe src present | **200** | **PASS** |
| `fallback54321` (parent + embed) | **0** | **0** | **PASS** |
| `GET /api/hrm/attendance/records?company_id=main` | **200** `HRM-ATT-200`, `total=299` | **200** `HRM-ATT-200`, `total=299` | **PASS** |
| HRM sync banner CONNECTED | **Not observable** — iframe `#root` **0** children, body empty | **Not observable** — `#root` **0** children after 15–30s wait | **FAIL** |
| HRM SPA content (overview / records) | iframe `bodyLen=0` after 25s | `bodyLen=0`, `rootChildren=0` | **FAIL** |
| `tmp-p1-ex-qa-https-01-probe.mjs` P-CC-07 | **PASS** (API) | — | **PASS** (API) |

**P-CC-07:** API + fallback gate **PASS**; **UI sync CONNECTED / attendance surface FAIL** (attendance route does not mount; employee profile route does).

---

## J-HRM-06 — L2.5 list → detail

### API layer

| Probe | Result |
|-------|--------|
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000021?company_id=main` | **200** `HRM-EMP-200`, `Nguyen NhanSu0021` |
| `GET /api/hrm/attendance/records?company_id=main` | **200** `HRM-ATT-200`, `total=299` |
| `tmp-p1-ex-qa-https-01-probe.mjs` **J-HRM-06** | **PASS** |

### UI layer — scope parity (primary regression)

| Path | Expected | Observed | Verdict |
|------|----------|----------|---------|
| Direct deep link `/hr/employees/{id}?portal=1&companyId=main` | Profile visible; no «Không tìm thấy nhân viên» | **Nguyen NhanSu0021**, NV0021, tabs; sync **CONNECTED**; `rootChildren=4` | **PASS** |
| CC iframe → same employee URL | Profile in iframe | **Nguyen NhanSu0021**; sync **CONNECTED**; `bodyLen=1167` | **PASS** |
| Direct `/hr/attendance` list → click → profile | List then profile | **Not executable** — attendance SPA blank (`#root` empty) | **FAIL** |
| CC iframe default `/hr/attendance` | Overview / list | **Not executable** — iframe blank | **FAIL** |

**J-HRM-06 `scope_parity` (API 200 + UI not-found): CLOSED** on profile deep link + CC iframe profile.

**J-HRM-06 list→detail from attendance surface: FAIL** — tag `attendance_route_blank` (distinct from prior `scope_parity` / R2 `deploy_partial`).

---

## Console / network excerpt (sanitized)

```text
portalAuthBridge.ts: status=200 len=14195 hasWaitForPortalAccessToken=true
PAGEERROR waitForPortalAccessToken: none observed (employee route boots)
API: GET attendance/records?company_id=main → 200 HRM-ATT-200 total=299
API: GET employees/…0021?company_id=main → 200 HRM-EMP-200 Nguyen NhanSu0021
UI profile: /hr/employees/…0021?portal=1&companyId=main → Nguyen NhanSu0021 (no not-found)
UI attendance: /hr/attendance?portal=1&companyId=main → #root children=0 bodyLen=0 (30s wait)
CC iframe attendance: bodyLen=0; CC iframe employee URL → profile PASS CONNECTED
fallback54321=0 (CC parent + direct paths)
probe: J-HRM-06 PASS; P-CC-07 PASS (API)
```

---

## Verdict summary

| Gate | Result |
|------|--------|
| R2 `deploy_partial` (`portalAuthBridge`) | **PASS** |
| J-HRM-06 `scope_parity` (profile when API 200) | **PASS** |
| J-HRM-06 L2.5 list→detail via attendance UI | **FAIL** (`attendance_route_blank`) |
| P-CC-07 API + `fallback54321=0` | **PASS** |
| P-CC-07 UI sync CONNECTED on attendance routes | **FAIL** |
| **Overall** | **FAIL_TO_PM** |

---

## completion_report

- **Closed:** QA R2 `deploy_partial` — pilot `portalAuthBridge.ts` includes `waitForPortalAccessToken`; no module export PAGEERROR on employee routes; **J-HRM-06 `scope_parity` fixed** — deep link and CC iframe profile show **Nguyen NhanSu0021** when `GET employees/:id` returns **200** (no «Không tìm thấy nhân viên»).
- **Open / FAIL:** `/hr/attendance` (and CC iframe default attendance) — HRM `#root` does not mount after extended wait; **P-CC-07** sync CONNECTED not observable on attendance paths; list→detail from attendance table **not executable** this run.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-FE-HTTPS-J-HRM-06-ATTENDANCE-BLANK-01
from_role: qa
to_role: dev-fe
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md — R3 closed scope_parity + portalAuthBridge; FAIL attendance_route_blank (/hr/attendance #root empty while /hr/employees/:id mounts with CONNECTED on https://14-225-217-232.nip.io)
exit_criteria: Attendance embed + CC iframe /command-center/hrm/attendance render overview/records; sync CONNECTED visible; list→profile or documented row click path; then PM dispatch P1-EX-QA-HTTPS-J-HRM-06-01-R4 for full J-HRM-06 + P-CC-07 UI PASS
evidence_path: docs/qa/evidence/p1-ex-fe-https-j-hrm-06-attendance-blank-01-20260529.md
ack_status: READY_FOR_QA
pm_dispatch_hint: P1-EX-FE-HTTPS-J-HRM-06-ATTENDANCE-BLANK-01 — Attendance.tsx boot on pilot; employee profile OK post scope-02
```

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01-R3
from_role: qa
to_role: pm
ack_status: FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r3-20260529.md
summary: R2 deploy_partial closed; J-HRM-06 scope_parity PASS on profile deep link + CC iframe; FAIL attendance SPA blank (P-CC-07 UI sync not observable on /hr/attendance).
pm_dispatch_hint: P1-EX-FE-HTTPS-J-HRM-06-ATTENDANCE-BLANK-01 then R4 QA retest
```
