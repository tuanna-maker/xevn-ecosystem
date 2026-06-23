# QA Runtime Evidence — P1-EX-QA-HTTPS-J-HRM-06-01

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-HTTPS-J-HRM-06-01` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_utc | `2026-05-28T~16:35–16:50Z` |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` (portal session; `tokenLen=311`) |
| entry_evidence | `docs/qa/evidence/p1-ex-qc-https-residual-03-r5-r1-20260528.md` (GWC C-RES03R5R1-02/03) |
| ack_status | **FAIL_TO_PM** |

## Scope

1. **J-HRM-06** — P-CC-07 attendance list → detail on HTTPS pilot (`company_id=main`).
2. **P-CC-07** — L2 row: zero `127.0.0.1:54321` on attendance routes.
3. Paths: **Command Center embed** `/command-center/hrm/attendance?companyId=main` **and** direct embed `/hr/attendance?portal=1&companyId=main`.

## Method

- Browser MCP + CDP on live HTTPS pilot (post R5 deploy; residual-03 attendance fallback gate already PASS).
- In-session API probes with portal transport (`x-access-token`, `x-portal-access-token`, `x-company-id: main`).
- `performance` resource scan for `127.0.0.1:54321` before/after **Kiểm tra lại**.
- UI: sidebar **Chấm công → Dữ liệu chấm công**, date **27/05/2026**, table row click; iframe deep-link to `/hr/employees/:id`.

---

## P-CC-07 — L2 matrix (attendance)

| Check | CC embed `/command-center/hrm/attendance` | Direct embed `/hr/attendance?portal=1&companyId=main` | Verdict |
|-------|----------------------------------------|--------------------------------------------------------|---------|
| Route HTTP | Parent **200**; iframe `…/hr/attendance?portal=1&companyId=main` | **200** | **PASS** |
| HRM sync banner | `HRM API Sync CONNECTED` | `CONNECTED` (after **Kiểm tra lại**) | **PASS** |
| Sync ERROR | Absent | Absent | **PASS** |
| `GET /api/hrm/attendance/records?company_id=main` | **200** `HRM-ATT-200`, `total=299` | **200** `HRM-ATT-200`, `total=299` | **PASS** |
| `localhost:54321` (`fallback54321`) | **0** (before/after nav) | **0** (after **Kiểm tra lại**) | **PASS** |
| Rules load error | Not observed this run | Not observed | **PASS** |

**P-CC-07 L2:** **PASS** (both paths; zero 54321).

---

## J-HRM-06 — L2.5 list → detail

### A) Command Center embed

| Step | Action | Result |
|------|--------|--------|
| 1 | Load `…/command-center/hrm/attendance?companyId=main` | Iframe attendance overview; **CONNECTED** |
| 2 | List surface | Overview **Danh sách đi muộn, về sớm** shows employee IDs (e.g. `…000002`); API list **299** rows |
| 3 | Click late-list row | Click registered; **no route change** to detail |
| 4 | Deep-link detail | Iframe navigated to `…/hr/employees/00000000-0000-4000-8000-000000000021?portal=1&companyId=main` |
| 5 | Detail API (in iframe) | `GET …/employees/…?company_id=main` → **200** `HRM-EMP-200` |
| 6 | Detail UI | **FAIL** — `Không tìm thấy nhân viên` + **Quay lại danh sách** |

### B) Direct embed `/hr/attendance`

| Step | Action | Result |
|------|--------|--------|
| 1 | Menu **Chấm công → Dữ liệu chấm công** | Records view loaded |
| 2 | Date filter **27/05/2026** | Table **19** data rows (present/check-in/out) |
| 3 | Click first table row | Row selected; **no employee profile route** from row (UI not link-wired) |
| 4 | Navigate `…/hr/employees/{employee_id}?portal=1&companyId=main` | **FAIL** UI — `Không tìm thấy nhân viên` |
| 5 | Detail API (parent session) | **200** `HRM-EMP-200` (e.g. `Nguyen NhanSu0021`) |

### Scope parity (blocker)

| Signal | Value |
|--------|-------|
| List API | **200** / `HRM-ATT-200` / `total=299` |
| Detail API | **200** / `HRM-EMP-200` for same `employee_id` from list row |
| Detail UI | **404-equivalent UX** — «Không tìm thấy nhân viên» |
| Tag | **`scope_parity`** — list/detail API vs embed profile loader (`useEmployee` / portal `memberships`) |

**J-HRM-06 L2.5:** **FAIL** on both required paths.

---

## Console / network excerpt (sanitized)

```text
CC: iframeSrc=…/hr/attendance?portal=1&companyId=main sync=CONNECTED fallback54321=0
API: GET attendance/records?company_id=main → 200 HRM-ATT-200 total=299
API: GET employees/00000000-0000-4000-8000-000000000021?company_id=main → 200 HRM-EMP-200
UI:  /hr/employees/…0021?portal=1&companyId=main → "Không tìm thấy nhân viên"
EMBED: records table rows=19 @ 27/05/2026; detail UI same FAIL pattern
```

---

## Verdict summary

| Gate | Result |
|------|--------|
| P-CC-07 L2 (no 54321, sync, list API) | **PASS** |
| J-HRM-06 L2.5 (list→detail on HTTPS) | **FAIL** (`scope_parity`) |
| **Overall** | **FAIL_TO_PM** |

Residual-03 attendance fallback-zero remains **closed** (not regressed; `fallback54321=0`).

---

## completion_report

- **closed_scope:** HTTPS P-CC-07 L2 re-smoke on CC + embed attendance; zero `54321`; sync CONNECTED; attendance list API green with seeded data (`total=299`); records table populated on embed for **27/05/2026** (19 rows).
- **open / FAIL:** J-HRM-06 list→detail — employee profile detail UI fails on HTTPS embed despite **200** detail API (`scope_parity`); late-list row not wired to profile; attendance table row has no profile link.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: P1-EX-FE-HTTPS-J-HRM-06-SCOPE-01
from_role: qa
to_role: dev-fe
entry_criteria: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-20260529.md — J-HRM-06 FAIL scope_parity on HTTPS: GET /api/hrm/employees/:id?company_id=main returns 200 HRM-EMP-200 but embed UI shows "Không tìm thấy nhân viên" for ceo@xe.vn / companyId=main (CC iframe + /hr/attendance). P-CC-07 L2 PASS (fallback54321=0).
exit_criteria: From attendance list (records table or documented click path), navigate to employee profile without not-found; READY_FOR_QA with same URLs + employee_id evidence.
evidence_path: docs/qa/evidence/p1-ex-fe-https-j-hrm-06-scope-01-YYYYMMDD.md
ack_status: READY_FOR_QA
```

Optional parallel: `technical-manager` advisory on `useEmployee` / portal `memberships` vs `company_id=main` rollup.

## Handoff packet

```yaml
work_item_id: P1-EX-QA-HTTPS-J-HRM-06-01
from_role: qa
to_role: pm
evidence_path: docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-20260529.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: P1-EX-FE-HTTPS-J-HRM-06-SCOPE-01 — fix embed employee profile after attendance list (scope_parity); then re-run P1-EX-QA-HTTPS-J-HRM-06-01
```
