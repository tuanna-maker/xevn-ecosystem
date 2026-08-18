# Evidence — PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R2 (HRM-NT-02 device retest)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R2` |
| **uc_id** | `HRM-NT-02` |
| **from_role** | qa-device |
| **to_role** | pm / qc |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **u65_zero_seed** | true |
| **prior_fail** | `docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r1.md` (FCM / 0× POST) |
| **dev_handoff** | `docs/qa/evidence/po-uc-tc-w4-dev-mob-nt02-fcm-qa-device-01.md` |
| **persona** | `uat.nv0007@xe.vn` / `xevn-uat-2026` · company **trsport** |
| **device** | `emulator-5554` · API 34 x86_64 |
| **APK** | `C:\xevn-apk\hrm-mobile-qa-device.apk` · 71,602,809 B · SHA256 `4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1` (**≠** R1 `50C8F7…389F`) |

> **U65:** no seed · device logcat POST proof required · **uat_done** false (UC matrix not full-closed; outbound FCM delivery still Option A / Phase 2).

---

## Verdict

| AC / TC | Result | Layer |
|---------|--------|-------|
| **TC-HRM-NT-02-ACT-HP-001** — login → push POST **2xx** + `HRM-NOTIF-201` | **PASS** | Device / API |
| Fresh APK SHA ≠ R1 | **PASS** | `4963D5FA…BBB1` |
| Deep-link login `uat.nv0007` · **trsport** | **PASS** | UI home + inbox GET |
| `POST_NOTIFICATIONS` granted | **PASS** | `pm grant` **after** `pm clear` |
| Logcat `push-token-source` | **PASS** | `qa-device-fallback` (accepted) |
| Logcat `POST …/notifications/push-tokens` + `HRM-NOTIF-201` | **PASS** | see § Logcat |
| `x-company-id` ≠ `main` | **PASS** | UUID `32a3cdcb-c534-4e47-80f9-d2f156e65094` |

**Seat verdict:** **PASS** (device ACT-HP). **uat_done** remains **false**. Phase 1 **not** DONE.

---

## L0 / environment

| Check | Result |
|-------|--------|
| `adb devices` | `emulator-5554` **device** |
| APK install | `adb install -r` **Success** · exit **0** |
| SHA256 verify | `4963D5FA8C165C987929475B35775659018E3353B34B7AEAD3644EE265A4BBB1` |
| Bundle strings | `qa-device-fallback` · `push-token-source` present in `assets/index.android.bundle` |
| Pilot API | `GET http://14.225.217.232:3001/api/hrm/` → **200** |
| Pilot mobile login | `POST …/auth/mobile/login` → session **trsport** |

---

## Device steps (U65)

| # | Action | Exit | Observation |
|---|--------|------|-------------|
| 1 | Install APK SHA `4963D5FA…` | 0 | Fresh vs R1 |
| 2 | `pm clear` then **`pm grant POST_NOTIFICATIONS`** | 0 | Grant **after** clear (clear wipes runtime permission) |
| 3 | `logcat -c` | 0 | Clean buffer |
| 4 | Host login on **pilot** `:3001` + `xevn://qa-login?…` | 0 | Home: Chào / Hồ sơ |
| 5 | Wait ≤10s for push chain | — | Fallback + POST |
| 6 | Logcat audit | — | **`HRM-NOTIF-201`** |

**Screenshots**

- `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-home.png` — permission dialog (pre-fix grant-after-clear)
- `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-after-grant.png` — after grant (local JWT 401 path)
- `docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2/nt02-r2-pilot-jwt.png` — PASS seat home

---

## Logcat proof (PASS)

```
08-04 13:16:30.753  … I ReactNativeJS: [HRM-MOB] push-token-expo-fail Call to function 'ExpoPushTokenManager.getDevicePushTokenAsync' has been rejected.
08-04 13:16:30.754  … I ReactNativeJS: [HRM-MOB] push-token-source=qa-device-fallback
08-04 13:16:30.755  … I ReactNativeJS: [HRM-MOB] POST http://14.225.217.232:3001/api/hrm/notifications/push-tokens x-company-id=32a3cdcb-c534-4e47-80f9-d2f156e65094 Authorization=Bearer …
08-04 13:16:31.090  … I ReactNativeJS: [HRM-MOB] push-tokens POST ok=true code=HRM-NOTIF-201 http=
```

(Second RealtimeContext registration ~1s later also `ok=true code=HRM-NOTIF-201`.)

| Signal | Present |
|--------|---------|
| `push-token-source=qa-device-fallback` | **Yes** |
| `[HRM-MOB] POST …/notifications/push-tokens` | **Yes** |
| `HRM-NOTIF-201` | **Yes** |
| FirebaseApp init fail (expected without google-services) | **Yes** (non-blocking; fallback used) |

---

## Delta vs R1

| Finding | R1 | R2 |
|---------|----|----|
| APK SHA | `50C8F7…389F` | `4963D5FA…BBB1` |
| `QA_PUSH_FALLBACK` | N/A | **1** → fallback token |
| Logcat `push-tokens` | Absent | **Present** |
| `HRM-NOTIF-201` | No | **Yes** |
| Permission | Grant then clear → dialog block risk | Grant **after** clear |

---

## Pitfalls observed (for QA script / PM)

1. **`pm clear` resets `POST_NOTIFICATIONS`** — must `pm grant` after clear or chain blocks on system dialog (no POST).
2. **JWT origin must match app API** — local `:28001` login + app pilot `:3001` → `HRM-AUTH-001` **401** on push-tokens (fallback still POSTs). Mint token on pilot for this seat.
3. Real Expo/FCM token still needs sponsor `google-services.json` (Option A) — R2 accepts `qa-device-fallback` per dispatch.

---

## Residual

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-W4-B3-NT02-FCM-REAL-TOKEN** | P2 | devops / sponsor + dev-mobile | Option A real `google-services.json` for outbound push delivery (U47 Phase 2) |
| **R-W4-B3-NT02-BASE-URL-DEEPLINK** | P2 | dev-mobile | Deep-link `base_url` still not overriding pilot default in all paths |
| Full UC `HRM-NT-02` (22 TC) | — | qa | Device ACT-HP closed; matrix uat_done stays false |

---

## Handoff

```
ack_status: PASS_TO_PM
work_item_id: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R2
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md
uat_done: false
tc_p0_act_hp: PASS
push_token_source: qa-device-fallback
next_owner: qc
by_uc: HRM-NT-02 execution stamp updated §9
```

### completion_report

R2 on **emulator-5554** with APK SHA **4963D5FA…BBB1** (≠ R1). After `pm clear` + re-grant `POST_NOTIFICATIONS`, deep-link login **uat.nv0007** / **trsport** (pilot JWT). Logcat shows `push-token-source=qa-device-fallback`, `POST …/notifications/push-tokens`, and **`HRM-NOTIF-201`** (`ok=true`). No seed. **uat_done** false. Phase 1 not claimed DONE.

### next_owner

**qc**

### next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QC-B3-HRM-NT-02-DEVICE-R2
from_role: pm
to_role: qc
lane: governance
priority: P0
entry_criteria: PO-UC-TC-W4-QA-B3-HRM-NT-MOB-R2 PASS_TO_PM; evidence docs/qa/evidence/po-uc-tc-w4-qa-b3-hrm-nt-mob-01-r2.md — logcat POST push-tokens + HRM-NOTIF-201; source qa-device-fallback; APK SHA 4963D5FA… ≠ R1
exit_criteria: QC GO or GWC on device ACT-HP for HRM-NT-02; residual real-FCM Option A documented; uat_done remains false until full UC; no Phase1 DONE claim
cấm: seed; promote uat_done without full matrix
```
