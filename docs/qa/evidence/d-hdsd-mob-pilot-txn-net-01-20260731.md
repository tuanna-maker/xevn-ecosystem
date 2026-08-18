# D-HDSD-MOB-PILOT-TXN-NET-01 — Pilot mobile ESS transactional GET fix (2026-07-31)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HDSD-MOB-PILOT-TXN-NET-01` |
| **parent** | `QA-HDSD-MOB-CH12-01-R4` · R4-C1 P0 |
| **from_role** | `dev-be` |
| **to_role** | `qa-device` |
| **date** | 2026-07-31 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — lazy product ensure on login only |

---

## Root cause (spec says / code did)

| Layer | Finding |
|-------|---------|
| **Deploy drift** | Pilot `:3001` had auth slice only (`D-OPS-MOB-AUTH-PILOT-DEPLOY-01`); `uat-mobile-pilot-data-ensure` + `main.ts` ESS guards **not** on VPS → payslip/pending empty after login |
| **RN network** | Mobile `x-request-id: mob-*` + idle keep-alive reuse → intermittent `HRM-MOB-ERR-NETWORK` on emulator→pilot (HOLD-ERRBUDGET class); curl 200 masked device fetch throw |
| **Scope/data** | `uat.nv0001` leave company total=7 but **employee-filtered pending=0** before fix — J-MOB-03 tab «Đang xét» had no row |

Auth POST 201 was never broken; transactional GET needed deploy + lazy ensure + `Connection: close` for mobile ESS.

---

## Fix (product — no QA seed)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/auth/uat-mobile-pilot-data-ensure.ts` | Lazy ensure nv0001 **payslip + pending leave**; nv0002 manager pending leave + att-update (J-MOB-03/04/05) |
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | Call `ensureUatMobilePilotTransactionData` post-login seq 1..2 |
| `apps/api/hrm-api/src/auth/uat-mobile-auth-ensure.ts` | UAT employee row ensure (existing wave) |
| `apps/api/hrm-api/src/platform/platform-runtime.ts` | `hrmMobileEssConnectionGuard` — `Connection: close` for `mob-*` on `/attendance/*`, `/payroll/*`, `/auth/mobile/*` |
| `apps/api/hrm-api/src/main.ts` | Pilot CORS relax when `HRM_PILOT_UAT_AUTH_ENABLED=true`; wire connection guard |
| `scripts/ops/deploy-hrm-mob-pilot-txn-01.ps1` | SCP + VPS build + restart hrm-be×3 |

---

## Verification

### Jest (local)

```powershell
cd apps/api/hrm-api
pnpm exec jest src/auth/uat-mobile-pilot-data-ensure.spec.ts src/auth/uat-mobile-auth-ensure.spec.ts src/auth/mobile-auth.service.spec.ts
# 45/45 PASS
pnpm run build:clean
# exit 0
```

### Pilot post-deploy (`http://14.225.217.232:3001`)

```powershell
node scripts/tmp-verify-pilot-txn-postdeploy.mjs
# exit 0
```

| Persona | leave pending (self) | payslip total | mgr pending att | mgr pending leave | Connection header |
|---------|---------------------|---------------|-----------------|-------------------|-------------------|
| `uat.nv0001@xe.vn` | **1** | **1** | 0 | 0 | **close** |
| `uat.nv0002@xe.vn` | 0 | 0 | **1** | **1** | **close** |

Login probe (mobile-exact headers):

```text
POST /api/hrm/auth/mobile/login uat.nv0001 → 201 HRM-AUTH-200 HLD-0001 holding
GET  /attendance/leave-requests?...&status=pending → 200 HRM-LEAVE-200 total=1
GET  /payroll/payslips?company_id=holding&employee_id=... → 200 HRM-PAY-200 total=1
```

### Deploy

```powershell
powershell -File scripts/ops/deploy-hrm-mob-pilot-txn-01.ps1
# SCP auth + platform + main + dist → VPS /opt/xevn-ecosystem
# docker exec xevn-hrm-be-dev pnpm run build
# docker compose restart hrm-be hrm-be-2 hrm-be-3
# HRM_HEALTH_OK
```

Replicas **3001 / 3011 / 3012** restarted; shared volume mount — build once in `hrm-be`.

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| R4-C3 | `qa-device` | Device J-MOB-03/04/05 retest — expect no `HRM-MOB-ERR-NETWORK`; leave row tap → detail; payslip row; nv0002 **Duyệt** |
| R4-C4 | `qa` | `hdsd:build` FIG count after PNG promote |
| Git pin | `devops` | Formal `deploy:dev-server` when sponsor approves commit |

---

## completion_report

**Closed:** Pilot ESS transactional path — lazy ensure payslip+leave (nv0001) and manager pending (nv0002); mobile ESS `Connection: close` + pilot CORS; deployed to `:3001`; curl/mobile JWT verification exit 0; jest 45/45; build:clean PASS.

**Open:** Device L2.5 J-MOB-03/04/05 (qa-device); formal git deploy pin.

---

## next_owner

`qa-device`

---

## next_dispatch_prompt

```text
work_item_id: QA-HDSD-MOB-CH12-01-R5
from_role: pm
to_role: qa-device
entry_criteria:
- D-HDSD-MOB-PILOT-TXN-NET-01 READY_FOR_QA — evidence docs/qa/evidence/d-hdsd-mob-pilot-txn-net-01-20260731.md
- Pilot :3001 post-deploy: uat.nv0001 leave pending>=1 payslip>=1; uat.nv0002 mgr pending>=1; Connection:close on mob-* ESS GET
- APK SHA 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895 · emulator-5554
- U65 zero-seed · strict uat.nv#### only
exit_criteria:
- J-MOB-03 leave list→detail 🟢 no ERR-NETWORK
- J-MOB-04 payslip list→detail 🟢 (or valid row tap)
- J-MOB-05 manager Duyệt tap 🟢
- logcat x-company-id UUID ≠ main
- ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hdsd-mob-ch12-01-r5-20260731.md
spec_ref: HDSD CH12 · J-MOB-03/04/05
```

---

## evidence_path

`docs/qa/evidence/d-hdsd-mob-pilot-txn-net-01-20260731.md`
