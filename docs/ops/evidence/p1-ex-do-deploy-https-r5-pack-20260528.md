# P1-EX-DO-DEPLOY-HTTPS-R5-PACK — BE+FE HTTPS pilot deploy evidence

| Field | Value |
|---|---|
| work_item_id | `P1-EX-DO-DEPLOY-HTTPS-R5-PACK` |
| from_role | `pm` |
| to_role | `devops` |
| date | `2026-05-28` |
| base_url | `https://14-225-217-232.nip.io` |
| handoff_be | `docs/qa/evidence/p1-ex-be-https-catalog-sync-10-20260528.md` |
| handoff_fe | `docs/qa/evidence/p1-ex-fe-https-emp-profile-10-20260528.md` |
| no_commit | `true` |

---

## Steps executed

1. Loaded mandatory runbooks and validated VPS safety constraints (`no compose down`, no non-xevn impact).
2. Audited VPS runtime (`docker ps`, `ss -tlnp`, `docker compose ps`, `.env` canonical ports).
3. Pulled latest `main` and applied `node scripts/merge-vps-port-env.mjs --apply-canonical`.
4. Redeployed target services (`hrm-be`, `hrm-fe`, `portal-fe`) via compose.
5. Synced patch files from local workspace to VPS for this pack and force-recreated target services:
   - `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.ts`
   - `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts`
   - `apps/web/hrm/src/integrations/hrmApi.ts`
6. Executed required smoke checks:
   - API deterministic contract: `GET /api/hrm/catalog-sync/status` with CEO token.
   - Browser flow: `/command-center/hrm/employees` -> click first employee -> verify no false error.
   - L0 health checks (`/api/hrm/`, `/hr/`, portal route).

---

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| VPS safety audit | PASS | xevn + non-xevn containers remained up; no destructive command used |
| Deploy/recreate targeted services | PASS | `docker compose ... up -d --build --remove-orphans hrm-be portal-fe hrm-fe` |
| L0 `/api/hrm/` | PASS | `l0_hrm_api:200` |
| L0 `/hr/` | PASS | `l0_hr_endpoint:200` |
| L0 portal `/command-center` | PASS | `l0_portal:200` |
| HRM-SYNC-203 deterministic status contract | PASS | `status_code: 200`, `code: HRM-SYNC-203` with `ceo@xe.vn` token |
| J-HRM-02 browser click journey | PASS | iframe URL changed to `/hr/employees/<employee-id>` after first-row click and `hasErr=false` for `Không thể tải thông tin nhân viên` |

---

## Required smoke outputs

### 1) Catalog sync status with CEO token

```text
login_status=201
status_code=200
code=HRM-SYNC-203
message=Catalog sync status fetched
data.companyId=main
data.status=connected
```

### 2) Browser flow `/command-center/hrm/employees` -> first employee

```text
iframe before click: https://14-225-217-232.nip.io/hr/employees?portal=1&tenantId=xevn&companyId=main
first row detected: NV0001 / Nguyen NhanSu0001
iframe after click:  https://14-225-217-232.nip.io/hr/employees/00000000-0000-4000-8000-000000000001
profile error banner "Không thể tải thông tin nhân viên": false
```

Browser artifacts:
- `p1-ex-do-r5-employees-page.png`
- `p1-ex-do-r5-j-hrm-02-after-click.png`

### 3) L0 health

```text
l0_hrm_api:200
l0_hr_endpoint:200
l0_portal:200
```

---

## completion_report

- Closed scope:
  - Deployed BE+FE fixes for `HRM-SYNC-203` and `J-HRM-02` to HTTPS pilot.
  - Verified deterministic API contract `/api/hrm/catalog-sync/status` returns 200 with expected code.
  - Verified browser employee journey click-to-profile no longer shows false profile-load error.
  - Confirmed L0 stack remained healthy after deploy.
- Residual:
  - Portal top-level still shows workspace-meta informational warning/timestamp drift (`01/01/1970`) on the host shell outside this pack scope; does not block the two requested smoke checks.

---

## Handoff packet

```yaml
work_item_id: P1-EX-DO-DEPLOY-HTTPS-R5-PACK
from_role: devops
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/ops/evidence/p1-ex-do-deploy-https-r5-pack-20260528.md
next_owner: qa
next_dispatch_prompt: >
  work_item_id: P1-EX-QA-HTTPS-BROWSER-EMP-PROFILE-R5
  from_role: pm
  to_role: qa
  ack_status target: PASS_TO_PM
  Retest on https://14-225-217-232.nip.io with ceo@xe.vn:
  (1) verify GET /api/hrm/catalog-sync/status returns 200 + HRM-SYNC-203,
  (2) open /command-center/hrm/employees and click first employee,
  (3) confirm profile renders without "Không thể tải thông tin nhân viên",
  (4) record screenshot + network evidence in docs/qa/evidence/p1-ex-qa-https-emp-profile-r5-20260528.md.
```
