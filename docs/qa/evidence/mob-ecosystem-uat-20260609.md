# MOB-ECOSYSTEM-UAT — Phase 1 ecosystem L0–L2.5 regression

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-ECOSYSTEM-UAT` |
| **from_role** | `pm` |
| **to_role** | `qa` → `pm` |
| **date** | 2026-06-09 |
| **environment** | Primary: `https://14-225-217-232.nip.io` · Local stack **down** (`:28001`/`:28002` ECONNREFUSED) |
| **portal account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **mobile account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` · `company_uuid=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| **device** | `emulator-5554` available; full device matrix **blocked** (APK SHA drift — see §5) |
| **ack_status** | **FAIL_TO_PM** |

---

## Executive verdict

| Layer | Command / method | Exit / result | Verdict |
|-------|------------------|---------------|---------|
| **L0 local** | `pnpm run qc:dev-stack` | **1** | **FAIL** — hrm/xbos/portal proxy upstream down |
| **L0 pilot** | nip.io health + portal + mobile login | **0** | **PASS** — HRM/XBOS/portal 200; mobile `HRM-AUTH-200` |
| **L1** | `pnpm run test:system:uat` | **1** | **FAIL** — requires local `:28001`/`:28002`; DB P1 workforce count PASS only |
| **L2** | `tmp-p1-ex-qa-https-01-probe.mjs` @ nip.io | **0** | **PASS** — P-CC-01..09 **23/23** |
| **L2.5 J-HRM** | same probe | **0** | **PASS** — **J-HRM-01..07** 7/7 scope parity |
| **L2.5 J-MOB** | API probes + prior device evidence | mixed | **FAIL** — see §4 |

**Overall: FAIL_TO_PM** — Web/CC slice promotable on nip.io; **L1 blocked** on local stack; **J-MOB** residual blockers prevent Phase 1 closure claim.

---

## 1. L0 — Stack health

### Local (`pnpm run qc:dev-stack`)

```
✗ hrm-api  http://127.0.0.1:28001/api/hrm  fetch failed
✗ xbos-api http://127.0.0.1:28002/api/xbos  fetch failed
✗ web-portal http://127.0.0.1:5173         fetch failed (prior run); portal shell up without API upstream
```

Attempted `pnpm run dev:hrm-api` → `ENOTEMPTY` dist/fleet; `dev:xbos-api` → `Cannot find module dist/main`.

**Owner:** `devops` — `P1-L0-STACK`

### Pilot nip.io (MOB-ECOSYSTEM-UAT primary target)

| Probe | HTTP | Code | Verdict |
|-------|------|------|---------|
| `GET /api/hrm/` | 200 | — | **PASS** |
| `GET /api/xbos/` | 200 | — | **PASS** |
| `GET /` | 200 | — | **PASS** |
| Portal login `ceo@xe.vn` | 201 | `XBOS-AUTH-200` | **PASS** |
| Mobile login `uat.nv0001@xe.vn` | 201 | `HRM-AUTH-200` | **PASS** |

---

## 2. L1 — `pnpm run test:system:uat`

**Exit code:** `1`

| Phase | Result |
|-------|--------|
| P0 hrm-api-health | **FAIL** fetch failed |
| P0 xbos-api-health | **FAIL** fetch failed |
| P1 db-workforce-count-roles-tenant | **PASS** |
| P2+ portal/mobile phases | **FAIL** fetch failed (runner uses `127.0.0.1:28001/28002`) |

**Note:** Historical L1 PASS on 2026-06-09 (`pcomp-program-gate-01-l1-20260609.md`, 37/37) when local stack was up. This wave cannot re-confirm L1 without `P1-L0-STACK`.

**Owner:** `devops` — restore local stack, then QA re-run L1.

---

## 3. L2 — P-CC-* (`ceo@xe.vn` / main)

**Script:** `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs`  
**Exit:** `0` · **23/23 PASS**

| ID | HTTP / note | Verdict |
|----|-------------|---------|
| P-CC-01 | login 201, JWT 86400 | **PASS** |
| P-CC-02 | group-member-units 200 | **PASS** |
| P-CC-03 | employees 200 | **PASS** |
| P-CC-04..04c | catalogs + contracts + KPI no 409 | **PASS** |
| P-CC-05..08 | insurance, recruitment, attendance, payroll 200 | **PASS** |
| P-CC-09 | catalog-governance inbox 200 | **PASS** |
| J-CC-03 | KPI rollup holding + x-company-id main | **PASS** |
| member negative | `du-lich.ceo@xe.vn` 409 scope | **PASS** (expected) |

---

## 4. L2.5 — J-HRM (mandatory 7/7)

**Exit:** **7/7 PASS** (same HTTPS probe)

| J-ID | API surrogate | Detail HTTP | Verdict |
|------|---------------|-------------|---------|
| J-HRM-01 | contracts → employee | 200 | **PASS** |
| J-HRM-02 | employees list → detail | 200 | **PASS** |
| J-HRM-03 | contract by id | 200 | **PASS** |
| J-HRM-04 | insurance → employee | 200 | **PASS** |
| J-HRM-05 | requisition detail | 200 | **PASS** |
| J-HRM-06 | attendance → employee | 200 | **PASS** |
| J-HRM-07 | payslip row (list payload) | 200 | **PASS** |

No `scope_parity` list→404 pattern on `company_id=main`.

---

## 5. L2.5 — J-MOB (mandatory rows)

### 5.1 API probes @ nip.io (`uat.nv0001@xe.vn`)

| J-ID | Probe | HTTP / code | Verdict | Owner if FAIL |
|------|-------|-------------|---------|---------------|
| **J-MOB-01** | mobile login | 201 `HRM-AUTH-200` | **PASS** | — |
| **J-MOB-02** | `attendance/records?company_id=holding` | 200 `HRM-ATT-200` total=20 | **PASS** | — |
| **J-MOB-03** | leave list `company_id=<uuid>` | 200 `HRM-LEAVE-200` total=3 | **PASS** (list) | — |
| **J-MOB-03** | leave list `company_id=holding` | **500** `HRM-SYS-001` invalid uuid "holding" | **FAIL** | **dev-be** — slug must not hit UUID SQL |
| **J-MOB-03** | `GET leave-requests/:id` | **404** `HRM-DATA-404` | **GWC** | **dev-be** if detail route required; mobile may use list row (device R4 PASS) |
| **J-MOB-04** | payslip list `company_id=<uuid>` | 200 `HRM-PAY-200` total=2 | **PASS** (list) | — |
| **J-MOB-04** | `GET payslips/:id` | **404** route missing | **GWC** | List row has gross/deduction fields; device R4 PASS (`p1-phase1-qa-mob-jmob-20260604-r4.md`) |
| **J-MOB-05** | update-requests pending | 200 `HRM-ATT-REQ-200` total=7 | **PASS** | — |
| **J-MOB-06** | home/summary tasks | 200 `HRM-HOME-200` tasks_total=**11** | **PASS** | — |
| **J-MOB-07** | manager_pending | 200 mgr_total=0 | **GWC** | Empty queue alternate; prior device PASS mgr card |
| **J-MOB-08** | celebrations | 200 celebrations_total=**0** | **GWC** | **dev-be/seed** — API empty; QC device PASS 2026-06-08 |
| **J-MOB-09** | whos_out | 200 whos_out_count=**0** | **GWC** | Prior R4 device PASS who=1 (`pcomp-w8-mob-residual-r4-01-20260609.md`) |
| **J-MOB-25** | leave-balance | 200 available=**8** used=**3** | **PASS** | — |
| **J-MOB-30** | directory list→detail | 200 total=213, detail 200 | **PASS** | — |
| **J-MOB-17** | contracts API | 200 `HRM-CON-200` | **PASS** (API) | — |
| **J-MOB-17** | device Settings→Contracts screen | screen=false | **FAIL** | **dev-mobile** — `mob-ux-12d-qa-20260609.md` |

### 5.2 Device regression (this wave)

**Script:** `tmp-pcomp-w8-mob-ui-qa-01-device.mjs`  
**Result:** **FAIL** at preflight — `shaOk: false`, `apiHealth: 404`, J-MOB-01 login not reached.

| Check | Result |
|-------|--------|
| APK expected SHA | `2759AE07…` |
| Installed / dist SHA | drift — unified qa-device APK not matching freeze |
| Emulator | `emulator-5554` device |

**Owner:** `qa-device` + `dev-mobile` — rebuild/install unified `hrm-mobile-qa-device.apk` per `pcomp-w8-mob-residual-r4-01` SHA `075DB8E4…`, then re-run `MOB-PHASE1-DEVICE-BATCH`.

### 5.3 Cross-cutting mobile product blockers (not journey-isolated)

| ID | Severity | Symptom | Owner |
|----|----------|---------|-------|
| **MOB-UX-15 P0** | P0 | `InAppNotificationsScreen` debug shell (event_type, ISO, Socket.IO) | **dev-mobile** |
| **MOB-UX-12d** | P1 | AC-G4-CONTRACTS, AC-G4-OPS, AC-SET-G-4 | **dev-mobile** |
| **MOB-UX-12d** | P1 | Home carousel page-2 tile nav to Operations | **dev-mobile** |

Evidence: `mob-ux-15-product-audit-20260609.md`, `mob-ux-12d-qa-20260609.md`

---

## 6. FAIL journey register (owners)

| J-ID / gate | Symptom | HTTP / evidence | Owner | work_item hint |
|-------------|---------|-----------------|-------|----------------|
| **L0 local** | APIs down | qc:dev-stack exit 1 | **devops** | `P1-L0-STACK` |
| **L1** | UAT runner cannot reach APIs | test:system:uat exit 1 | **devops** → **qa** retest | `P1-L0-STACK` |
| **J-MOB-03** | leave list 500 with `company_id=holding` | 500 `HRM-SYS-001` | **dev-be** | holding slug SQL guard |
| **J-MOB-17** | Contracts screen not reachable from profile/settings | device XML screen=false | **dev-mobile** | `MOB-UX-12d` carry |
| **J-MOB-08/09** | Hub API empty celebrations/whos_out today | 200 empty | **dev-be/seed** GWC | optional seed refresh |
| **MOB-UX-15** | Notifications debug UI on user path | 18× P0 grep hits | **dev-mobile** | `MOB-UX-15a/b` |
| **Device matrix** | APK SHA drift blocks full J-MOB adb walk | pcomp-w8-mob-ui-qa-01 FAIL preflight | **dev-mobile** + **qa-device** | `MOB-PHASE1-DEVICE-BATCH` |

---

## 7. PASS summary (closed this wave)

- **L0 pilot** nip.io — all health probes green
- **L2** P-CC-01..09 — 23/23 @ nip.io
- **L2.5 J-HRM** — 7/7 @ nip.io
- **J-MOB API** — 01, 02, 03 (uuid query), 04 list, 05, 06, 25, 30, 17 API
- **Prior device PASS** (not re-run this wave): J-MOB-03..05 strict R4, J-MOB-23..29, J-AVT-02, J-MOB-09 R4 — see `pcomp-w8-mob-residual-r4-01-20260609.md`

---

## 8. Commands executed

```powershell
pnpm run qc:dev-stack                                    # exit 1
pnpm run qc:fe-be-health:pilot                           # exit 1 (local upstream)
pnpm run test:system:uat                                 # exit 1
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs             # exit 0 — L2 + J-HRM
$env:HRM_API_BASE_URL='https://14-225-217-232.nip.io'
node scripts/tmp-pcomp-w7-qa-home-summary-01-probe.mjs   # J-MOB-06 PASS; 08/09 empty
node scripts/tmp-mob-w7-5-directory-probe.mjs            # J-MOB-30 PASS
node scripts/tmp-pcomp-w8-mob-ui-qa-01-device.mjs        # exit 1 — SHA preflight
# Inline nip.io mobile API probes — §5.1
```

---

## Handoff

**completion_report:** MOB-ECOSYSTEM-UAT executed against nip.io pilot. **L0 pilot + L2 + J-HRM L2.5 PASS.** **L1 FAIL** (local stack down). **J-MOB FAIL** on holding-slug leave 500, J-MOB-17 device contracts, MOB-UX-15 P0 sanitization, device matrix APK SHA drift. Phase 1 closure gate **not** met.

**next_owner:** `pm` → dispatch `devops` (L0/L1), `dev-be` (J-MOB-03 holding SQL), `dev-mobile` (MOB-UX-15/12d), `qa-device` (MOB-PHASE1-DEVICE-BATCH after APK freeze).

**next_dispatch_prompt:**

```
work_item_id: P1-L0-STACK
from_role: pm
to_role: devops
lane: execution
entry_criteria: MOB-ECOSYSTEM-UAT FAIL — qc:dev-stack exit 1; test:system:uat blocked
action: Fix hrm-api ENOTEMPTY + xbos-api dist/main; start :28001/:28002/:5173; qc:dev-stack exit 0
exit_criteria: ack_status READY_FOR_QA; evidence docs/ops/evidence/p1-l0-stack-YYYYMMDD.md
evidence_path: docs/qa/evidence/mob-ecosystem-uat-20260609.md
```

```
work_item_id: D-MOB-LEAVE-HOLDING-500-01
from_role: pm
to_role: dev-be
lane: execution
entry_criteria: MOB-ECOSYSTEM-UAT J-MOB-03 — GET leave-requests?company_id=holding → 500 HRM-SYS-001 invalid uuid "holding" on nip.io
action: Align leave list scope resolver with holding slug (same as leave-balance); jest regression; READY_FOR_QA
exit_criteria: nip.io probe company_id=holding + employee_id UUID → 200 HRM-LEAVE-200
evidence_path: docs/qa/evidence/mob-ecosystem-uat-20260609.md
```

**evidence_path:** `docs/qa/evidence/mob-ecosystem-uat-20260609.md`

**ack_status:** **FAIL_TO_PM**
