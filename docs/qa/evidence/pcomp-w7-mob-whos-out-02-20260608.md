# PCOMP-W7-MOB-WHOS-OUT-02 — whosOut device-empty fix (J-MOB-09)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-MOB-WHOS-OUT-02` |
| **from_role** | dev-mobile |
| **to_role** | qa-device |
| **date** | 2026-06-08 |
| **ack_status** | `READY_FOR_QA` |
| **upstream** | QA FAIL [`pcomp-w7-qa-hub-r3-03-r2-20260608.md`](pcomp-w7-qa-hub-r3-03-r2-20260608.md) — API `who_total=1` @ nip.io holding; device ESS «Nghỉ hôm nay, 0»; hub «Ai nghỉ hôm nay» absent post WHOS-OUT-01 bundle inject |

---

## Root cause

| Layer | Finding |
|-------|---------|
| **WHOS-OUT-01 gap** | `resolveHomeSummaryQueryCompanyId` returned **legal UUID** when `auth.companyId` / SecureStore was backfilled to `6efaa5d6-…` (wire scope) instead of rollup slug `holding`. `GET /home/summary?company_id=<uuid>` returns empty `whos_out` / 404 viewer — same class as pre-01 bug. |
| **Dashboard call site** | `loadHomeCelebrateSections(cfg, cid, eid)` passed `cid = getAttendanceCompanyId()` (UUID). When `auth.companyId` was empty or UUID-shaped, summary query used UUID. |
| **ESS stat card** | `offWorkCount: whosOut.length` — empty aggregate → «Nghỉ hôm nay, 0» on first paint. |
| **Hub section** | `shouldShowWhosOutSection(snap.whosOut)` false when `whosOut[]` empty — section + `testID="home-whos-out-section"` never mount. |
| **API parity (QA run)** | Probe `who_total=1` @ `company_id=holding` — device mismatch was client scope, not BE. |

**Not the bug:** `parseWhosOutItems` / tap navigation — probe item shape matches parser; `goLeaveDetail(row.leave_request_id)` already wired.

---

## Fix

| File | Change |
|------|--------|
| `integrations/companyWireScope.ts` | `resolveHomeSummaryQueryCompanyId` recovers rollup slug from **membership `company_id`** and **JWT `company_id`** before falling back to wire UUID; `WireMembership.company_id` optional field |
| `integrations/hrmHomeSummary.ts` | **`composeHomeSummaryParams(auth, employeeId)`** — single SoT for `/home/summary` query; `loadHomeCelebrateSections(auth, employeeId)` drops wire-UUID `companyId` param |
| `integrations/types.ts` | `HrmAuthConfig` carries `employeeId` + `memberships` for scope helpers |
| `context/AuthContext.tsx` | `buildHrmAuthConfig` passes memberships/employeeId; **`getHomeSummaryQueryCompanyId()`** for callers |
| `features/dashboard/DashboardScreen.tsx` | `loadHomeCelebrateSections(cfg, eid)` — no attendance UUID in summary path |
| `vitest.config.ts` | Ionicons.ttf alias → mock (unblocks full suite on Windows OneDrive) |

**J-MOB-06/07:** unchanged — manager/inbox paths still use attendance UUID `cid` where appropriate.

---

## Verification (agent-run)

```text
cd apps/mobile/hrm-mobile
pnpm test        → 34 files, 183 tests PASS, exit 0
pnpm type-check  → exit 0
```

**New / updated tests:**

- `integrations/__tests__/companyWireScope.test.ts` — UUID `companyId` + membership `holding` → `holding`
- `integrations/__tests__/hrmHomeSummary.test.ts` — `composeHomeSummaryParams` + aggregate parse when SecureStore UUID (PCOMP-W7-MOB-WHOS-OUT-02)

---

## nip.io verification steps (qa-device / manual)

**Persona:** `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io`

### 1) API probe (pre-login / curl)

```powershell
$BASE = "https://14-225-217-232.nip.io"
$login = Invoke-RestMethod -Uri "$BASE/api/hrm/auth/mobile/login" -Method POST -ContentType "application/json" -Body '{"email":"uat.nv0001@xe.vn","password":"xevn-uat-2026"}'
$emp = $login.data.employee.id
$hdr = @{ Authorization = "Bearer $($login.data.access_token)"; "x-tenant-id" = "xevn"; "x-company-id" = "holding" }
$summary = Invoke-RestMethod -Uri "$BASE/api/hrm/home/summary?company_id=holding&employee_id=$emp&include=celebrations,whos_out" -Headers $hdr
# PASS when: $summary.data.whos_out.total_count -ge 1 (seed date-dependent)
```

**Scope parity check:** login returns `default_company_id: holding`, `company_uuid: 6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`. Mobile must query **`company_id=holding`**, not UUID.

### 2) Fresh APK / bundle

```powershell
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
pnpm run android:apk:qa-device
# or Metro inject into hub04b shell per QA runbook
```

**Pre-requis:** `adb shell pm clear vn.xevn.hrm.mobile` after install (scope SecureStore).

### 3) Device J-MOB-09

1. ADBKeyboard login → Home ≤60s (`adbkeyboard_email_testid`).
2. Scroll in-app (8× swipe) past ESS stat row + «Sinh nhật hôm nay».
3. Expect **`testID="home-whos-out-section"`** and text **«Ai nghỉ hôm nay (n)»** with `n ≥ 1` when API probe `who_total ≥ 1`.
4. Tap first row → **`LeaveRequestDetail`** opens (`goLeaveDetail(leave_request_id)`).
5. ESS card **«Nghỉ hôm nay, n»** matches API `who_total` on first home paint after load.

### 4) Regression

- **J-MOB-06/07** — «Việc cần làm» + «Cần duyệt (n)» mgr parity (unchanged).
- **J-MOB-08** — «Sinh nhật hôm nay» when `cel_total ≥ 1` (same scope fix benefits aggregate path).

---

## completion_report

- **Closed:** Device-empty `whosOut[]` when SecureStore/JWT used legal UUID — membership-aware `resolveHomeSummaryQueryCompanyId`; `composeHomeSummaryParams`; Dashboard uses auth-only summary path; 183 vitest + tsc PASS.
- **Open:** nip.io `who_total` is seed/date-dependent (probe 2026-06-08 AM may show 0 leaves covering today); qa-device must refresh APK + `pm clear` before J-MOB-09 retest.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-QA-HUB-R3-04
from_role: pm
to_role: qa-device
entry_criteria: dev-mobile PCOMP-W7-MOB-WHOS-OUT-02 READY_FOR_QA — composeHomeSummaryParams + membership holding slug recovery; evidence docs/qa/evidence/pcomp-w7-mob-whos-out-02-20260608.md
exit_criteria: emulator-5554 @ nip.io uat.nv0001; fresh qa-device APK or bundle inject; adb pm clear; J-MOB-09 «Ai nghỉ hôm nay (n≥1)» + tap→LeaveRequestDetail when API who_total≥1; J-MOB-06/07/08 regression; ADBKeyboard login
evidence_path: docs/qa/evidence/pcomp-w7-qa-hub-r3-04-20260608.md
ack_status: PASS_TO_PM or FAIL with layer (scope/parse/scroll/APK)
```

## evidence_path

`docs/qa/evidence/pcomp-w7-mob-whos-out-02-20260608.md`
