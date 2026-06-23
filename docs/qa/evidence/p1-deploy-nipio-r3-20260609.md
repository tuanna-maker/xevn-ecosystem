# P1-DEPLOY-NIPIO-R3 — hrm-api nip.io deploy smoke

**work_item_id:** P1-DEPLOY-NIPIO-R3  
**generatedAt:** 2026-06-09T09:10:06.317Z  
**pilot:** https://14-225-217-232.nip.io  
**verdict:** PASS

## Deploy

| Check | Result |
|-------|--------|
| VPS container `xevn-hrm-be-dev` | force-recreate + healthy |
| `GET /api/hrm/metrics` (direct :3001) | 200 |
| `GET https://…/api/hrm/metrics` | 200 |
| Sync | 27 files (G6 directory + leave-balance + leave-doc + inbox) + operations MP-14 alias |

## Leave-balance UUID `company_id`

| Probe | HTTP | Code | Pass |
|-------|------|------|------|
| slug_holding | 200 | HRM-LEAVE-BAL-200 | PASS |
| uuid_company_id | 200 | HRM-LEAVE-BAL-200 | PASS |

## MOB-PARITY smoke (MP-01 / MP-08 / MP-14 / MP-19)

| ID | HTTP | Code | Pass | Notes |
|----|------|------|------|-------|
| MP-01 | 200 | HRM-EMP-DIR-200 | PASS | {"full_name":"Bùi Quốc An","job_title":"DRIVER","job_title_key":"DRIVER"} |
| MP-08 | 200 | HRM-LEAVE-200 | PASS | 3 |
| MP-14 | 200 | HRM-SVC-200 | PASS | {"request_type":"vehicle","service_type":"vehicle","status":"rejected"} |
| MP-19 | 200 | HRM-NOTIF-200 | PASS | API uses limit= not page_size= (P1-G6-PROBE-01) |

## Residual

- `tmp-mob-parity-01-probe.mjs` still sends `page_size` to notifications inbox → MP-19 false FAIL until **P1-G6-PROBE-01** (QA).
- MP-14 empty list on holding scope is OK (pass when HTTP 200); `request_type` alias deployed via `operations.service.ts`.

**ack_status:** PASS_TO_PM
