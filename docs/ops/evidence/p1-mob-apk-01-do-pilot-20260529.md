# P1-MOB-APK-01-DO-PILOT — HRM BE-02 update-requests fix on pilot :3001

| Field | Value |
|---|---|
| work_item_id | `P1-MOB-APK-01-DO-PILOT` |
| upstream_fix | `P1-MOB-APK-01-BE-02` (D-MOB-QA-02) |
| from_role | `devops` |
| to_role | `qa` |
| date | `2026-05-30` |
| verified_at_utc | `2026-05-30T01:27:12Z` |
| pilot_host | `14.225.217.232` |
| pilot_api | `http://14.225.217.232:3001` |
| pilot_https | `https://14-225-217-232.nip.io` |
| fix_evidence | `docs/qa/evidence/p1-mob-apk-01-be-02-20260529.md` |
| deploy_pattern | `p1-supa-do-02` (pscp sync + targeted `--force-recreate hrm-be`) |
| commit | `none` (pscp sync, no git commit) |
| ack_status | **READY_FOR_QA** |

---

## Executive verdict

| Gate | Result | Notes |
|---|---|---|
| VPS safety (no compose down) | **PASS** | Targeted `--force-recreate hrm-be` only |
| BE-02 source on VPS | **PASS** | `pushCompanyIdFilter` count **2**; `never ::uuid compare` count **1** in `attendance.service.ts` |
| L0 `GET /api/hrm/` (local :3001) | **PASS** | HTTP **200** |
| L0 `GET /api/hrm/` (HTTPS) | **PASS** | HTTP **200** |
| **D-MOB-QA-02 probe** `GET update-requests pending (manager)` | **PASS** | HTTP **200** `HRM-ATT-REQ-200` (not 500 `HRM-SYS-001`) |
| Non-xevn containers | **PASS** | `tasmos_*`, `asms_*`, `viconnec_*` remain Up |
| Mobile J-MOB browser | **NOT RUN** (QA owner) | API probe only |

---

## Fix deployed

**Root cause (BE-02):** `listUpdateRequests` compared `attendance_update_requests.company_id` (TEXT column) with `$n::uuid` → PostgreSQL error `operator does not exist: text = uuid` → HTTP 500.

**Change:** `apps/api/hrm-api/src/attendance/attendance.service.ts` — else-branch uses `pushCompanyIdFilter` (`::text`) with `aur.` alias.

---

## Steps executed

1. Read runbooks (`devops-deploy` skill, prior deploy evidence `p1-supa-do-02`, `p1-ex-do-deploy-https-residual-03-r5`).
2. VPS audit — `xevn-hrm-be-dev` Up on `:3001`; non-xevn containers healthy.
3. Synced via `pscp` (3 files) from dev workstation → `/opt/xevn-ecosystem`:

```
apps/api/hrm-api/src/attendance/attendance.service.ts
apps/api/hrm-api/src/attendance/attendance.service.spec.ts
apps/api/hrm-api/src/common/hrm-list-scope.ts
```

4. `node scripts/merge-vps-port-env.mjs --apply-canonical` (ports unchanged: HRM_BE_PORT=3001).
5. `docker compose --env-file .env up -d --force-recreate hrm-be` (no `compose down`).
6. Waited 75s; Nest **successfully started**; VPS access log shows `update-requests` **200** for `du-lich.ceo@xe.vn`.
7. Post-deploy probe from workstation: `HRM_API_BASE_URL=http://14.225.217.232:3001 node scripts/tmp-p1-mob-apk-01-qa-r1-probe.mjs` — exit **0**.

---

## Container timestamps (UTC)

| Marker | Timestamp |
|---|---|
| `attendance.service.ts` synced (VPS mtime) | `2026-05-30T01:26:26Z` |
| `xevn-hrm-be-dev` recreated | `2026-05-30T01:26:35Z` |
| Nest application successfully started | `2026-05-30T01:26:49Z` |
| Probe completed (workstation) | `2026-05-30T01:27:12Z` (approx) |

---

## Smoke outputs

```text
pushCompanyIdFilter_count:2
never_uuid_compare_count:1
api_health:200
https_api:200
Nest application successfully started
probe_exit:0
update-requests: status=200 code=HRM-ATT-REQ-200
```

Probe row (D-MOB-QA-02 target):

```json
{
  "jId": "J-MOB-05",
  "step": "GET update-requests pending (manager)",
  "status": 200,
  "code": "HRM-ATT-REQ-200",
  "note": ""
}
```

Account: `du-lich.ceo@xe.vn` / `xevn-pilot`

Commands (no secrets):

```bash
HRM_API_BASE_URL=http://14.225.217.232:3001 node scripts/tmp-p1-mob-apk-01-qa-r1-probe.mjs
curl -so /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/hrm/
curl -sk -o /dev/null -w "%{http_code}" https://14-225-217-232.nip.io/api/hrm/
```

VPS log excerpt (post-recreate):

```text
GET /api/hrm/attendance/update-requests?company_id=7b626710-...&status=pending&manager_employee_id=c4d59b81-... status=200
```

---

## Residual

| ID | Item | Owner |
|---|---|---|
| R1 | J-MOB-02 probe uses `from`/`to` — pilot may return 400 `HRM-VAL-001` vs 200 with `from_date`/`to_date` (out of scope BE-02) | dev-be / qa |
| R2 | Full J-MOB mobile journey browser verification | qa |
| R3 | D-MOB-QA-04/05 mobile cleartext/RealtimeProvider | dev-mobile |

---

## Handoff packet

- **completion_report:** Deployed P1-MOB-APK-01-BE-02 (`listUpdateRequests` TEXT vs UUID fix) to pilot VPS `14.225.217.232`; recreated `xevn-hrm-be-dev`; L0 + D-MOB-QA-02 probe **200** `HRM-ATT-REQ-200` on `:3001` and HTTPS `/api/hrm/`.
- **next_owner:** `qa`
- **next_dispatch_prompt:** Task **qa** `P1-MOB-APK-01-QA-R2-UR`: read `docs/ops/evidence/p1-mob-apk-01-do-pilot-20260529.md` + `docs/qa/evidence/p1-mob-apk-01-be-02-20260529.md`; re-probe D-MOB-QA-02 on pilot `:3001` and HTTPS proxy with `du-lich.ceo@xe.vn` / `xevn-pilot` via `scripts/tmp-p1-mob-apk-01-qa-r1-probe.mjs`; expect `GET /attendance/update-requests?company_id={uuid}&status=pending&manager_employee_id={eid}` → **200** `HRM-ATT-REQ-200`; publish to `docs/qa/evidence/p1-mob-apk-01-qa-r2-ur-20260530.md`; `ack_status` `PASS_TO_PM` or `FAIL_TO_PM`.
- **evidence_path:** `docs/ops/evidence/p1-mob-apk-01-do-pilot-20260529.md`
- **ack_status:** `READY_FOR_QA`
