# QA-HRM-LEAVE-CREATE-8088-01 — Leave create on `:8088` (G-DB-03 + G-AT10-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-HRM-LEAVE-CREATE-8088-01` |
| **pack_polish** | `QA-HRM-LEAVE-CREATE-PACK-POLISH-01` · closes **C-LEAVE-CREATE-PACK-01** |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P1 |
| **executed_at** | 2026-07-21 ~21:18–21:24 ICT |
| **portal** | http://14.225.217.232:8088 |
| **PORTAL_DEV_URL** | `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · scope `companyId=main` (holding rollup) |
| **U65** | **PASS** — browser FE only; no seed; no API-only PASS; no DB fake |
| **covers** | TechSpec **G-DB-03** CREATE `leave_requests` · **G-AT10-01** slug/`company_id` TEXT ladder (no UUID hard-fail) |
| **entry** | DevOps `d-do-sync-8088-leave-schema-01-20260721.md` · BE `be-hrm-g-db-03-leave-create-01-20260721.md` · BE `be-hrm-g-at10-01-scope-slug-01-20260721.md` · QC GWC `qc-hrm-leave-create-8088-01-20260721.md` |
| **ack_status** | **PASS_TO_PM** |
| **phase1 / prod / G-AT10-02 sheet** | **NOT claimed** · **NOT tested** |

### command_table (Layer B / C-LEAVE-CREATE-PACK-01 polish)

| Command | Result | Classification |
|---------|--------|----------------|
| Browser U65 leave create G-DB-03 + G-AT10-01 on Dev8088 (cited; **no** product retest this polish) | **PASS** | PRODUCT — prior wave |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md` | **PASS** · exit **0** (8/8 after polish) | PROCESS — closes C-LEAVE-CREATE-PACK-01 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-leave-create-8088-01-20260721.md` | **PASS** · exit **0** (8/8) | PROCESS — QC gate cite |

**Portal:** `PORTAL_DEV_URL=http://14.225.217.232:8088` (not localhost-only).

---

## Executive summary

Browser U65 on `:8088`: login → Chấm công → **Nghỉ phép** → **Tạo yêu cầu nghỉ** for **HLD-0006** under portal/list scope **`company_id=main`** (slug).  
`POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` — **no 42P01** / relation missing. FE counters **87→88** / pending **29→30** + toast «Đã tạo đơn nghỉ phép». F5: counters **88 / 30** remain; list GET after reload still returns new row `ca24b5d2-…`.

**G-DB-03:** create path live (table exists / ensureSchema).  
**G-AT10-01:** list/query with slug `main` **200**; create under holding/`main` scope **no UUID hard-fail** (FE still maps employee `holding` → holding UUID in POST body — compatible with BE TEXT persist).

---

## L0 / entry

| Check | Result |
|-------|--------|
| Portal `:8088` login | **PASS** — `ceo@xe.vn` → Command Center |
| DevOps leave schema sync | cited PASS — hrm-be healthy |
| Seed | **none** |

---

## Click path (U65 · J-HRM leave create)

| # | Step | Evidence | Verdict |
|---|------|----------|---------|
| 1 | Login `ceo@xe.vn` | Portal session → CC | **PASS** |
| 2 | HRM Attendance leave | `…/hr/attendance?tenantId=xevn&companyId=main` → tab **Nghỉ phép** | **PASS** |
| 3 | Baseline | Tổng **87** · Chờ duyệt **29** · `GET …/leave-requests?company_id=main` **200** `HRM-LEAVE-200` | **PASS** |
| 4 | **Tạo yêu cầu nghỉ** | Dialog open; keyword `HLD-0006` | **PASS** |
| 5 | Select HLD-0006 · annual · `15/09/2026`–`16/09/2026` · reason marker | Form filled | **PASS** |
| 6 | **Gửi yêu cầu** | Network POST **201** `HRM-LEAVE-201` | **PASS** |
| 7 | No `42P01` / relation missing | Response success body | **PASS** |
| 8 | FE after 2xx | Toast «Đã tạo đơn nghỉ phép» · Tổng **88** · Chờ duyệt **30** · dialog closed | **PASS** |
| 9 | F5 / reload | Totals remain **88** / **30** | **PASS** |
| 10 | Persist row | After F5 auth list: id `ca24b5d2-9476-4761-ac50-913cc39a1252` · `HLD-0006` · `pending` · reason marker · `company_id` holding UUID | **PASS** |

### Network excerpts (no secrets)

```
GET  /api/hrm/attendance/leave-requests?company_id=main → 200 HRM-LEAVE-200 (baseline total=87)

POST /api/hrm/attendance/leave-requests → 201 HRM-LEAVE-201
  body.company_id: "10000000-0000-4000-8000-000000000001"  (FE slug→UUID map from employee.holding)
  body.employee_code: "HLD-0006"
  body.start_date: "2026-09-15"
  body.end_date: "2026-09-16"
  body.reason: "QA-HRM-LEAVE-CREATE-8088-01 G-DB-03+G-AT10-01 slug scope U65"
  response.data.id: "ca24b5d2-9476-4761-ac50-913cc39a1252"
  response.data.status: "pending"
  // no 42P01 / relation "leave_requests" does not exist

GET  /api/hrm/attendance/leave-requests?company_id=main → 200 (after create + F5) total=88
  hit id=ca24b5d2-… reason marker present
```

**Scope note (G-AT10-01):** OU filter / list use slug **`main`**. Employee API returns `company_id: "holding"` (slug). FE `buildLeaveCreatePayload` still maps to holding UUID for POST (CD-FB-07 must_keep) — **not** a UUID-only DTO hard-fail on slug scope. BE create/list accept TEXT/slug ladder per BE evidence.

---

## AC vs exit_criteria

| Exit | Result |
|------|--------|
| Login ceo@xe.vn | **PASS** |
| Tạo đơn scope slug holding/main (no UUID hard-fail) | **PASS** — `companyId=main` + list `company_id=main`; POST 201 |
| POST leave 2xx; no 42P01 | **PASS** — 201 |
| FE row / counters + F5 còn | **PASS** — 87→88 / 29→30; F5 88/30; row id persists |
| Evidence path | this file |
| cấm seed / API-only / G-AT10-02 / Phase1-PROD | **respected** |

---

## Residuals (non-blocking)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| Soft-nav Att↔Rec | P3 | Concurrent tab / embed soft-nav bounced to recruitment mid-session; dedicated tab + non-`portal=1` URL stabilized create | optional FE (known soft-nav class) |
| FE POST still UUID | P3 info | `buildLeaveCreatePayload` maps `holding`→UUID — expected CD-FB-07; raw slug POST body not exercised in this browser path | — |
| **C-LEAVE-CREATE-PACK-01** | P3 PROCESS | **CLOSED** — `command_table` + literal `PORTAL_DEV_URL=http://14.225.217.232:8088`; verify **8/8** | qa (this polish) |
| G-AT10-02 overlap/balance | out of scope | cấm | — |

---

## Pack polish note (QA-HRM-LEAVE-CREATE-PACK-POLISH-01)

| Item | Result |
|------|--------|
| Scope | Format-only — **no** product leave-create retest |
| Gap revealed? | **No** — product substance unchanged from prior PASS |
| verify:qc:evidence-pack | exit **0** (8/8) |
| C-LEAVE-CREATE-PACK-01 | **CLOSED** |
| cấm | seed · G-AT10-02 · sheet · Phase1/PROD · CD-FB-07 — **respected** |

---

## completion_report

### Closed
- Browser U65 leave create on `:8088` (prior): **G-DB-03** no relation-missing; **G-AT10-01** slug `main`; POST **201**; FE + F5 persist.
- **QA-HRM-LEAVE-CREATE-PACK-POLISH-01:** Layer B format — `command_table` with `pnpm run verify:qc:evidence-pack` exit codes + literal `PORTAL_DEV_URL=http://14.225.217.232:8088`; verify **8/8**; **C-LEAVE-CREATE-PACK-01 CLOSED**.

### Open
- Soft P3 soft-nav bounce (non-blocking / DEFER OK). G-AT10-02 / sheet **not** in scope.

### next_owner
`pm`

### next_dispatch_prompt

```text
work_item_id: QC-HRM-LEAVE-CREATE-PACK-CLOSE-01
from_role: pm
to_role: qc
lane: governance
priority: P3
entry: QA pack polish PASS_TO_PM docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md — verify:qc:evidence-pack exit 0 (8/8); C-LEAVE-CREATE-PACK-01 CLOSED; product leave create NOT retested
exit: Update docs/qa/evidence/qc-hrm-leave-create-8088-01-20260721.md — mark C-LEAVE-CREATE-PACK-01 CLOSED; confirm GWC conditions cleared for pack format; PASS_TO_PM; do NOT expand G-AT10-02 / sheet / Phase1/PROD
cấm: seed · CD-FB-07 · product retest unless QC finds format contradiction
```

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/qa-hrm-leave-create-8088-01-20260721.md`
