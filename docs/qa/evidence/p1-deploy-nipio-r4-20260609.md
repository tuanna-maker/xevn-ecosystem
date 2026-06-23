# P1-DEPLOY-NIPIO-R4 — hrm-api nip.io deploy smoke

**work_item_id:** P1-DEPLOY-NIPIO-R4  
**generatedAt:** 2026-06-09T12:18:44.170Z  
**pilot:** https://14-225-217-232.nip.io  
**scope:** P1-G6-FIELD-02 (MP-14 `request_type`) + PCOMP-W7-BE-LEAVE-DOC (`attachment_url`)  
**verdict:** PASS

## Deploy

| Check | Result |
|-------|--------|
| VPS container `xevn-hrm-be-dev` | force-recreate + healthy |
| `GET https://…/api/hrm/metrics` | 200 |
| Sync | 9 files via PSCP (operations MP-14 + leave attachment_url) |

## MP-14 — service-requests `request_type`

| Probe | HTTP | Code | Pass | Sample |
|-------|------|------|------|--------|
| MP-14 list | 200 | HRM-SVC-200 | PASS | {"request_type":"vehicle","service_type":"vehicle","status":"rejected"} |

## Leave POST — `attachment_url`

| Probe | HTTP | Code | Pass | Notes |
|-------|------|------|------|-------|
| LEAVE-ATTACH | 201 | HRM-LEAVE-201 | PASS | sent=`/api/hrm/files/holding/leave_attachment-1781007523945-giay-bac-si.pdf` echo=`/api/hrm/files/holding/leave_attachment-1781007523945-giay-bac-si.pdf` id=3ae697f4-812e-42b6-80c8-86ac744b1204 |

## Residual

- QA MOB-PARITY-01-R4 + J-MOB-11 device retest after this deploy.
- MP-14 empty list passes when HTTP 200 (fieldsOk rule).

**ack_status:** PASS_TO_PM
