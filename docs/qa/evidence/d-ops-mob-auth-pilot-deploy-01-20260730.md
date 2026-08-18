# D-OPS-MOB-AUTH-PILOT-DEPLOY-01 — hrm-api UAT mobile auth pilot deploy (2026-07-30)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-OPS-MOB-AUTH-PILOT-DEPLOY-01` |
| **parent** | `D-HDSD-MOB-UAT-AUTH-01` |
| **from_role** | `devops` |
| **to_role** | `qa-device` |
| **date** | 2026-07-30 (ICT) |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Scope executed

| Step | Action | Result |
|------|--------|--------|
| 1 | SCP auth slice to VPS (`uat-mobile-auth-ensure*` + `mobile-auth.service*`) | **PASS** |
| 2 | Append pilot env flags on VPS `.env` (`HRM_PILOT_UAT_AUTH_ENABLED=true`, `HRM_MOBILE_UAT_PASSWORD=xevn-uat-2026`) | **PASS** (idempotent) |
| 3 | `docker exec xevn-hrm-be-dev … pnpm run build` in `/app/apps/api/hrm-api` | **PASS** exit 0 |
| 4 | `docker compose restart hrm-be hrm-be-2 hrm-be-3` | **PASS** — metrics :3001 → 200 |
| 5 | Local `:28001` — `build:clean` + restart (nest watch PID on 28001) | **PASS** |
| 6 | Local `:28002` xbos-api health restored | **PASS** |
| 7 | `pnpm run qc:dev-stack` | **PASS** exit 0 |

---

## 2. Mobile login verification (post-deploy)

### Pilot `:3001` (`14.225.217.232`)

| Persona | HTTP | code | employee_code | company |
|---------|------|------|---------------|---------|
| `uat.nv0001@xe.vn` / `xevn-uat-2026` | 201 | HRM-AUTH-200 | HLD-0001 | holding |
| `uat.nv0002@xe.vn` / `xevn-uat-2026` | 201 | HRM-AUTH-200 | VTH-0002 | trsport (is_manager=true) |

### Local `:28001`

| Persona | HTTP | code | employee_code |
|---------|------|------|---------------|
| `uat.nv0001@xe.vn` | 200 | HRM-AUTH-200 | HLD-0001 |
| `uat.nv0002@xe.vn` | 200 | HRM-AUTH-200 | VTH-0002 |

Pre-deploy pilot probe (from dev-be evidence): uat.nv0001 → **401**; post-deploy → **201**.

---

## 3. L0 gate

```
pnpm run qc:dev-stack
✓ hrm-api: HTTP 200 ← http://127.0.0.1:28001/api/hrm
✓ xbos-api: HTTP 200 ← http://127.0.0.1:28002/api/xbos
✓ web-portal (optional): HTTP 200 ← http://127.0.0.1:5173
exit 0
```

---

## 4. VPS audit (unchanged non-xevn)

Containers Up: `xevn-hrm-be-dev` (:3001), `xevn-hrm-be-2-dev` (:3011), `xevn-hrm-be-3-dev` (:3012), `xevn-xbos-be-dev`, portal/hrm-fe. No `docker compose down`.

---

## 5. Residual / notes

- Auth source files deployed via **pscp** (not yet on `origin/main` git); VPS build uses live volume mount — OK for pilot.
- `hrm-be-4` not present on VPS (only 3 replicas restarted).
- Payslip/leave/approval transactional data for J-MOB-03/04/05 **not in scope** (auth-only; U65 zero-seed).
- Recommend PM schedule git commit + `deploy:dev-server` for durable SoT when sponsor approves.

---

## 6. completion_report

**Closed:** Pilot hrm-api rebuilt with `uat-mobile-auth-ensure`; env flags set; replicas restarted; pilot + local mobile login 201/200 for nv0001/nv0002; `qc:dev-stack` PASS.

**Open:** QA-device HDSD CH12 device matrix (J-MOB-03/04/05); git commit of auth slice for reproducible deploy.

---

## 7. next_owner

`qa-device` — `QA-HDSD-MOB-CH12-01-R2`

---

## 8. next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R2
from_role: pm
to_role: qa-device
entry_criteria:
- D-OPS-MOB-AUTH-PILOT-DEPLOY-01 PASS — pilot :3001 uat.nv0001/0002 → HRM-AUTH-200
- Local :28001 same personas PASS
- qc:dev-stack exit 0
- APK SHA 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895
- U65 zero-seed · device/browser only
exit_criteria:
- HDSD CH12 J-MOB-03/04/05 device PASS (leave list→detail, payslip list→detail, manager Duyệt)
- Update docs/qa/evidence/hdsd-uat-mobile-20260730.md
- ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/hdsd-uat-mobile-ch12-r2-20260730.md
spec_ref: HDSD CH12 · TC-MOB-003..025 · J-MOB-03/04/05
```
