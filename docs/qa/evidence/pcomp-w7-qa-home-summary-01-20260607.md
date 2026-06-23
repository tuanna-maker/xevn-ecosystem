# PCOMP-W7-QA-HOME-SUMMARY-01-R1 — nip.io home/summary retest (J-MOB-06/08/09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-QA-HOME-SUMMARY-01-R1` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **generated** | 2026-06-07 |
| **upstream** | `PCOMP-W7-DO-HOME-SUMMARY-01-R1` · `pcomp-w7-do-home-summary-01-20260607.md` |
| **defect opened** | **D-W7-HOME-TASKS-SLUG-01** |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **target** | `https://14-225-217-232.nip.io` |

---

## Verdict

| Gate | Result |
|------|--------|
| L0 `pnpm run qc:fe-be-health:pilot` | **PASS** exit 0 — 8/8 stack + 13/13 pilot flows |
| Exit #1 `tmp-pcomp-w7-qa-hub-04b-probe.mjs` @ nip.io | **FAIL** exit 2 — `apiOk=false` (full include hits tasks path) |
| Exit #2 celebrations ≥2, whos_out ≥1, no `birth_year` | **PASS** on `include=celebrations,whos_out` + `company_id=holding` |
| J-MOB-08 API (celebrations holding) | **PASS** |
| J-MOB-09 API (whos_out holding) | **PASS** |
| J-MOB-06 API (tasks holding) | **FAIL** — HTTP 500 `HRM-SYS-001` uuid cast `"holding"` |

**Overall: FAIL_TO_PM** — MOB-UX-04b celebrations/whos_out deploy **confirmed** on nip.io; **J-MOB-06 blocked** and hub-04b probe script **cannot PASS** until `buildTasks` scope accepts holding slug (same class as prior D-W7-HOME-WHOS-SLUG-01, different code path).

---

## Environment

| Item | Value |
|------|--------|
| VPS | `https://14-225-217-232.nip.io` |
| employee_id (login) | `3796d949-4513-45c0-88fa-33030a062b17` |
| company_uuid (login) | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Query company_id (required) | **`holding`** (slug) |
| Local regression | `http://127.0.0.1:28001` — tasks include **same 500** (not deploy-only) |

---

## L0 — Stack health

```bash
pnpm run qc:fe-be-health:pilot
# exit 0 — ALL PASS
```

---

## Exit #1 — hub-04b probe script

```bash
node scripts/tmp-pcomp-w7-qa-hub-04b-probe.mjs
# exit 2
```

| Check | Result |
|-------|--------|
| Login | 201 `HRM-AUTH-200` |
| `company_id` sent | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` (script uses `companyUuid \|\| scopeCompany`) |
| include | `tasks,manager_pending,celebrations,whos_out` |
| HTTP | **500** `HRM-SYS-001` |
| celebrations / whos_out in response | 0 (error body) |

**Note:** Script does not force `company_id=holding` per exit criteria; manual holding-slug probes below are authoritative for J-MOB-*.

---

## Live API — holding slug + employee_id (authoritative)

**Auth headers:** `x-tenant-id: xevn`, `x-company-id: holding`, Bearer from mobile login.

### J-MOB-08/09 — `include=celebrations,whos_out`

```http
GET /api/hrm/home/summary?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&include=celebrations,whos_out
```

| Check | Result |
|-------|--------|
| HTTP | **200** `HRM-HOME-200` |
| celebrations.total_count | **5** (≥2) |
| whos_out items | **1** (≥1) |
| Privacy grep | **PASS** — no `birth_year`, no `date_of_birth` YYYY-MM-DD |
| Sample celebration | `Bùi Văn An` · `month_day=06-07` · `display_date=07/06` |
| Sample whos_out | `Huỳnh Văn An` · `leave_type=annual` · `leave_request_id` present |

### J-MOB-06 — `include=tasks`

```http
GET /api/hrm/home/summary?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&include=tasks
```

| Check | Result |
|-------|--------|
| HTTP | **500** `HRM-SYS-001` |
| Message | `invalid input syntax for type uuid: "holding"` |
| Root cause class | `buildTasks` → `listLeaveRequests` / `listUpdateRequests` / `listInbox` pass slug `holding` into UUID-cast SQL (scope parity gap vs `buildWhosOut` / celebrations fix) |

### Default + full hub include (mobile client path)

| include | HTTP | code |
|---------|------|------|
| *(default — tasks+manager_pending)* | 500 | `HRM-SYS-001` |
| `tasks,manager_pending,celebrations,whos_out` | 500 | `HRM-SYS-001` |
| `celebrations,whos_out` only | 200 | `HRM-HOME-200` |

**Impact:** Mobile Smart Hub default `home/summary` call (includes tasks) **fails on nip.io** even though 04b blocks work in isolation.

---

## Journey map (API layer)

| Journey | API verdict | Notes |
|---------|-------------|-------|
| J-MOB-06 | **FAIL** | tasks block 500 holding slug |
| J-MOB-08 | **PASS** | celebrations 5, privacy clean |
| J-MOB-09 | **PASS** | whos_out 1, approved leave shape |

---

## Defect

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-W7-HOME-TASKS-SLUG-01** | P0 | `GET /home/summary` with `company_id=holding` + `include=tasks` (or default) → 500 uuid cast; blocks J-MOB-06 and hub-04b probe | dev-be |

**pm_dispatch_hint:** `PCOMP-W7-BE-TASKS-SLUG-01` — apply `pushWorkforceEmployeeScopeFilter` / slug IN-subquery parity to `buildTasks` downstream queries (inbox, leave-requests, update-requests), mirror `buildWhosOut` R2 fix.

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| D-W7-HOME-TASKS-SLUG-01 | dev-be | Local `:28001` reproduces — not VPS-only |
| `tmp-pcomp-w7-qa-hub-04b-probe.mjs` | dev-be/qa | Should use `company_id=holding` explicitly; split include probes or skip tasks until fix |
| Device UI J-MOB-06/08/09 | qa-device | Blocked for full hub until tasks slug fix; 08/09 API slice promotable with GWC |
| C-W7QC-DEVICE-01 | qa-device | Open — UI walk after BE fix |

---

## Handoff

```yaml
completion_report: |
  Retested PCOMP-W7-DO-HOME-SUMMARY-01-R1 on nip.io with uat.nv0001 holding slug.
  J-MOB-08 PASS (celebrations=5, privacy clean) and J-MOB-09 PASS (whos_out=1) on
  include=celebrations,whos_out. J-MOB-06 FAIL — tasks/default/full include 500 uuid cast holding.
  hub-04b probe script exit 2. Opened D-W7-HOME-TASKS-SLUG-01 (local BE same failure).
  L0 qc:fe-be-health:pilot exit 0.

next_owner: pm

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-BE-TASKS-SLUG-01
  from_role: pm
  to_role: dev-be
  entry_criteria: QA FAIL PCOMP-W7-QA-HOME-SUMMARY-01-R1 —
  docs/qa/evidence/pcomp-w7-qa-home-summary-01-20260607.md; D-W7-HOME-TASKS-SLUG-01.
  GET /home/summary?company_id=holding&include=tasks (and default) returns 500 HRM-SYS-001
  invalid input syntax for type uuid "holding"; celebrations+whos_out alone PASS 200.
  exit_criteria: buildTasks path uses same slug scope resolver as buildWhosOut R2;
  nip.io + local jest home.service.spec.ts PASS; probe script exit 0; READY_FOR_QA J-MOB-06.
  evidence_path: docs/qa/evidence/pcomp-w7-be-tasks-slug-01-YYYYMMDD.md

evidence_path: docs/qa/evidence/pcomp-w7-qa-home-summary-01-20260607.md
ack_status: FAIL_TO_PM
```
