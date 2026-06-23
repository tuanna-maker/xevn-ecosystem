# P1-DEPLOY-NIPIO-R5 — hrm-api nip.io deploy + UAT_MOB_SEQ=2 reseed

**work_item_id:** P1-DEPLOY-NIPIO-R5  
**generatedAt:** 2026-06-09T14:11:27.819Z  
**pilot:** https://14-225-217-232.nip.io  
**scope:** P1-G3-JMOB-05-PERSONA-NV2-FIX (manager JWT + seed persona nv0002)  
**verdict:** PASS

## Deploy

| Check | Result |
|-------|--------|
| VPS container `xevn-hrm-be-dev` | force-recreate + healthy |
| `GET https://…/api/hrm/metrics` | 200 |
| Sync | 2 files (mobile-auth.service.ts + seed-hrm-uat-mob-pilot-qual.mjs) |
| Reseed | `UAT_MOB_SEQ=2` — trsport COO / mgr persona |

## uat.nv0002@xe.vn — manager persona gate

| Probe | Result | Pass |
|-------|--------|------|
| login success | true | PASS |
| `roles` includes `manager` | ["employee","manager"] | PASS |
| login `is_manager` | true | PASS |
| `job_title_key` | COO | info |
| home/summary `viewer.is_manager` | true | PASS |
| manager_pending total | 3 | info |

## Residual

- QA-device strict R4 (`P1-G3-JMOB-05-STRICT-R4`) — emulator Duyệt tap + nv0001 leave balance device retest.

**ack_status:** PASS_TO_PM
