# D-MOB-W7-5-DIRECTORY-DEPLOY-01 — nip.io hrm-api view=directory deploy

| Field | Value |
|-------|-------|
| **work_item_id** | D-MOB-W7-5-DIRECTORY-DEPLOY-01 |
| **from_role** | devops |
| **to_role** | pm |
| **upstream** | MOB-W7-5-DIRECTORY-QA PASS (`mob-w7-5-directory-qa-20260609.md`) |
| **target** | `https://14-225-217-232.nip.io` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |

---

## Summary

Deployed `view=directory` employee module to pilot VPS via pscp (9 source files) + `docker compose up -d --build --force-recreate hrm-be`. Pre-deploy nip.io returned **HRM-VAL-001**; post-deploy returns **HRM-EMP-DIR-200** / **HRM-EMP-200**. Directory probe **exit 0** for `uat.nv0001@xe.vn` (holding) and `uat.nv0002@xe.vn` (trsport). Non-xevn containers (tasmos_*) remain Up.

---

## Deploy steps

| Step | Command / action | Result |
|------|------------------|--------|
| 1 | `scripts/tmp-vps-pscp-directory-20260609.ps1` — 9 employees module files | **PASS** |
| 2 | `scripts/tmp-vps-deploy-hrm-be-directory-20260609.sh` on VPS | **PASS** |
| 3 | `merge-vps-port-env.mjs --apply-canonical` | Ports unchanged (HRM_BE=3001) |
| 4 | `docker compose --env-file .env up -d --build --force-recreate hrm-be` | **xevn-hrm-be-dev** healthy |
| 5 | Wait 45s Nest boot | — |

**VPS git HEAD after deploy:** `68ec457` (directory sources applied via pscp + stash/pop overlay).

---

## L0 smoke (VPS)

| Check | HTTP | Verdict |
|-------|------|---------|
| `http://127.0.0.1:3001/api/hrm/metrics` | 200 | **PASS** |
| `https://14-225-217-232.nip.io/api/hrm/metrics` | 200 | **PASS** |
| Internal GET `.../employees?company_id=holding&view=directory&page_size=3&include_attendance_today=true` | 200 `HRM-EMP-DIR-200` total=213 | **PASS** |

---

## Directory probe (nip.io)

```bash
node scripts/tmp-mob-w7-5-directory-probe.mjs
# exit 0 — probe PASS
```

### uat.nv0001@xe.vn (holding slug)

| Step | HTTP | Code | Notes |
|------|------|------|-------|
| Mobile login | 200 | — | `company_id=holding` |
| List `view=directory&include_attendance_today=true` | 200 | HRM-EMP-DIR-200 | total=**213**, sample=10 |
| Detail first row | 200 | HRM-EMP-200 | list→detail **PASS** |
| Search `q=uat` | 200 | HRM-EMP-DIR-200 | total=188 |

### uat.nv0002@xe.vn (trsport slug)

| Step | HTTP | Code | Notes |
|------|------|------|-------|
| List | 200 | HRM-EMP-DIR-200 | total=**207** |
| Detail | 200 | HRM-EMP-200 | **PASS** |
| Search | 200 | HRM-EMP-DIR-200 | total=189 |

**Pre-deploy residual closed:** HRM-VAL-001 (`property view should not exist`) no longer returned on nip.io.

**Probe note:** `tmp-mob-w7-5-directory-probe.mjs` updated to use `active_membership.company_id` (slug) before `company_uuid` — matches QA VAL-W7-DIR-01 mobile path.

---

## Non-xevn safety check

```
tasmos_ngrok_dev, tasmos_web_dev, tasmos_backend_dev, tasmos_postgres_dev, tasmos_redis_dev — Up
```

No `docker compose down`; only `hrm-be` force-recreated.

---

## Files synced (pscp manifest)

- `employees/employee-directory.ts`, `employee-directory.types.ts`
- `employees/employees.service.ts`, `employees.controller.ts`
- `employees/dto/list-employees.query.dto.ts`, `get-employee.query.dto.ts`
- `employees/*.spec.ts` (regression on VPS build context)

Deploy scripts: `scripts/tmp-vps-pscp-directory-20260609.ps1`, `tmp-vps-deploy-hrm-be-directory-20260609.sh`, `tmp-run-vps-directory-deploy-20260609.ps1`

---

## Handoff

```yaml
completion_report: |
  D-MOB-W7-5-DIRECTORY-DEPLOY-01 closed. hrm-be on 14-225-217-232.nip.io serves GET /employees?view=directory
  with HRM-EMP-DIR-200 (holding total=213, trsport total=207). HRM-VAL-001 resolved. Probe exit 0 for
  uat.nv0001 and uat.nv0002. L0 metrics 200. Non-xevn tasmos stack unaffected.

next_owner: pm

next_dispatch_prompt: |
  work_item_id: MOB-W7-5-DIRECTORY-QA-DEVICE
  from_role: pm
  to_role: qa-device
  lane: execution
  entry_criteria: d-mob-w7-5-directory-deploy-20260609.md PASS_TO_PM; nip.io probe exit 0
  action: J-MOB-30 L2.5 on pilot — Team tab with uat.nv0002@xe.vn (trsport slug); verify directory list
    non-empty, colleague detail tap, search debounce; evidence mob-w7-5-directory-nipio-device-YYYYMMDD.md
  exit_criteria: J-MOB-30 PASS on device or FAIL with screenshot + pm_dispatch_hint

evidence_path: docs/qa/evidence/d-mob-w7-5-directory-deploy-20260609.md
ack_status: PASS_TO_PM
```
