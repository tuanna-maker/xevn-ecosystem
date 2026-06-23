# MOB-UX-14-UNIFIED-QA-R6 — Device retest (14d matrix @ R6 APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-14-UNIFIED-QA-R6` |
| **parent** | `MOB-UX-14-R6` |
| **from_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **FAIL** (SE improved; Pro Max / Pixel 4a still FAIL) |

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| APK bytes | 69,129,062 |
| SHA-256 | `2C62C82F1D45B3917A639006C4995A6D7415CEC3E9A0B08A351F5A4F18626C2F` ✅ PIN match |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |

---

## Commands (exit codes)

| Command | Exit | Note |
|---------|------|------|
| `adb -s emulator-5554 install -r hrm-mobile-qa-device.apk` | **0** | R6 APK |
| `adb shell pm clear vn.xevn.hrm.mobile` | **0** | Fresh session |
| `node scripts/qa-mobile-login-intent.mjs` | **0** | `home_reached=true` |
| `node scripts/qa-mobile-home-responsive-matrix.mjs` | **1** | Matrix overall FAIL |
| `pnpm run verify:mobile:layout` | **1** | Regex false-positive on `HomeSectionKey[]` — see ILA scorecard |

---

## 14d matrix results (R6 SHA)

| Device class | WxH | scrollDepth | displayName | Verdict |
|--------------|-----|-------------|-------------|---------|
| iPhone SE 3 | 375×667 | **PASS** (3 sections) | PASS | **PASS** ✅ R6 fix |
| iPhone 14 Pro Max | 430×932 | **FAIL** (0 sections) | **FAIL** | **FAIL** |
| Pixel 4a | 393×851 | **FAIL** (0 sections) | **FAIL** | **FAIL** |
| Pixel 7 | 412×915 | PASS (5 sections) | PASS | **PASS** |
| iPad Mini portrait | 744×1133 | FAIL (0 sections) | FAIL | **GWC** |

**R6 delta vs R5:** SE `scrollDepth` **FAIL→PASS** (`home-ess-stat-rows` + `home-actions-carousel` visible without 6+ swipes). Pro Max / Pixel 4a **still FAIL** after `wm size` — `sectionsVisible=[]`, `displayName=false` (hydrate/a11y tree drop on resize).

---

## Screenshots

| Viewport | Above-fold | Scroll probe |
|----------|------------|--------------|
| iPhone SE 3 | `docs/qa/evidence/mob-ux-14d-screens/iphone-se-home-top.png` | `docs/qa/evidence/mob-ux-14d-screens/iphone-se-scroll-1.png` |
| iPhone 14 Pro Max | `docs/qa/evidence/mob-ux-14d-screens/iphone-14-pro-max-home-top.png` | `docs/qa/evidence/mob-ux-14d-screens/iphone-14-pro-max-scroll-1.png` |
| Pixel 7 (412dp regression guard) | `docs/qa/evidence/mob-ux-14d-screens/pixel-7-home-top.png` | `docs/qa/evidence/mob-ux-14d-screens/pixel-7-scroll-1.png` |

Machine JSON: `docs/qa/evidence/mob-ux-14d-matrix-20260609.json` (apk_sha256 updated to R6).

---

## Residual → dev-mobile

1. **Pro Max 430×932** — `useForceHomeTabOnResize` not restoring home markers in a11y tree post-resize; `scrollDepth` + `displayName` false-negative.
2. **Pixel 4a 393×851** — same resize/hydrate class as Pro Max.
3. **iPad Mini** — GWC acceptable; optional follow-up.

---

## Handoff

```yaml
completion_report: |
  MOB-UX-14-UNIFIED-QA-R6 device retest on APK SHA 2C62C82F…: iPhone SE scrollDepth PASS (R6 closed);
  Pixel 7 PASS; Pro Max + Pixel 4a scrollDepth/displayName FAIL; overall matrix exit 1.
next_owner: dev-mobile
next_dispatch_prompt: |
  work_item_id MOB-UX-14-R7 — fix Pro Max 430×932 + Pixel 4a 393×851 scrollDepth/displayName after wm resize
  (a11y tree empty post-resize); re-run qa-mobile-home-responsive-matrix.mjs; target phonesPass=true.
evidence_path: docs/qa/evidence/mob-ux-14-r6-device-20260609.md
ack_status: FAIL
pm_dispatch_hint: dev-mobile MOB-UX-14-R7 — ProMax/4a ILA-08 blockers from R6 QA.
```
