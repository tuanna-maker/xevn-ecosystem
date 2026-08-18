# D-OPS-HRM-API-RESTART-01 — HRM API restart fresh build (:28001)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-30 |
| **Role** | devops |
| **work_item_id** | `D-OPS-HRM-API-RESTART-01` |
| **Upstream** | `D-HDSD-MUTATE-BE-01` (READY_FOR_QA) · `D-HRM-API-DIST-CRASH-01` class |
| **Env** | Local dev · HRM `:28001` · XBOS `:28002` · Portal `:5173` |

---

## 1. Actions

| Step | Command / action | Result |
|------|------------------|--------|
| Stop stale :28001 | Killed PID **13464** (`node dist/main` old) · PID **22772** (`dist-uat-w6/main.js` freeze) | Port freed |
| Build | `Remove-Item -Recurse dist` then `pnpm --filter hrm-api run build` | **exit 0** |
| dist/main probe | `node dist/main.js` after **clean** rebuild | Nest started; health **200** briefly |
| dist crash (pre-clean) | Partial `dist/` (`nest-cli deleteOutDir: false`) | `MODULE_NOT_FOUND` `./spreadsheet-template.service` · `./common/http-exception.filter` |
| **Runtime (stable)** | `HRM_BE_PORT=28001 pnpm run start:dev` in `apps/api/hrm-api` | PID **33136** listening `:28001` |
| Health | `GET /api/hrm/` | **200** |
| Summary | `GET /api/hrm/employees/summary?company_id=main` (xbos token) | **200** |
| Employees | `GET /api/hrm/employees?page_size=5&company_id=main` | **200** |
| L0 gate | `pnpm run qc:fe-be-health` | **exit 0 — ALL PASS** |

---

## 2. qc:fe-be-health output

```
PASS  hrm-api-health  HTTP 200  http://127.0.0.1:28001/api/hrm/
PASS  xbos-api-health  HTTP 200  http://127.0.0.1:28002/api/xbos
PASS  web-portal  HTTP 200  http://127.0.0.1:5173
PASS  portal-login  token ok
PASS  hrm-employees-direct  HTTP 200
PASS  hrm-catalog-sync-direct  HTTP 200
PASS  portal-proxy-hrm-employees  HTTP 200
PASS  portal-proxy-hrm-catalog  HTTP 200
=== Summary: ALL PASS ===
```

---

## 3. Residual / notes

| Item | Owner | Notes |
|------|-------|-------|
| `node dist/main.js` without clean dist | dev-be | `nest-cli.json` `deleteOutDir: false` leaves corrupt partial output — **always rm dist before build** for prod-like start |
| `dist-uat-w6` freeze | devops | Do not restart from freeze when BE handoff requires fresh src (lazy leave pull + insurance fix) |
| Runtime mode | devops | `start:dev` used (includes D-HDSD-MUTATE-BE-01 src); acceptable per exit criteria alt `dev:hrm-api` |

---

## 4. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` → dispatch `QA-HDSD-MUTATE-RET-01`
- **evidence_path:** `docs/qa/evidence/d-ops-hrm-api-restart-01-20260730.md`

### completion_report

**Closed:** Stale hrm-api on :28001 stopped; clean `pnpm --filter hrm-api build` exit 0; hrm-api stable on :28001 (PID 33136, `start:dev`); health + employees/summary + qc:fe-be-health ALL PASS.

**Open:** Recommend dev-be set `deleteOutDir: true` or document clean-dist SOP to prevent D-HRM-API-DIST-CRASH recurrence.

### next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-01
from_role: devops
to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: D-OPS-HRM-API-RESTART-01 PASS; hrm-api :28001 200; qc:fe-be-health exit 0; ceo@xe.vn; U65 zero-seed
exit_criteria:
- TC-HDSD-08-02-01 UF-HRM-09: POST leave-requests 2xx LVT_01 + F5 persist (cold env, no manual catalog pull)
- TC-HDSD-06-03-01: insurance tab Network all 200; no chk_contract_date_range 500
- evidence: docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md
ack_status: PASS_TO_PM
read_first: docs/qa/evidence/d-hdsd-mutate-be-01-20260730.md · docs/qa/evidence/d-ops-hrm-api-restart-01-20260730.md
cấm: seed · :8088 without sponsor
```
