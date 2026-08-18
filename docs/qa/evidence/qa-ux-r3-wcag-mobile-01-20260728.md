# QA-UX-R3-WCAG-MOBILE-01 — Device WCAG 2.4.12 sample (4 screens)

| Field | Value |
|-------|-------|
| **Date** | 2026-07-28 |
| **work_item_id** | `QA-UX-R3-WCAG-MOBILE-01` |
| **from_role** | qa-device |
| **to_role** | pm |
| **Dev handoff** | `docs/qa/evidence/d-ux-r3-wcag-mobile-01-20260728.md` READY_FOR_QA |
| **Device** | `emulator-5554` · AVD `xevn_api34` · density **420** · `minTouchPx = ceil(44×420/160) = 116` (1px RN density rounding tolerated) |
| **Account** | `du-lich.ceo@xe.vn` / `xevn-pilot` (deep-link; U65 zero-seed) |
| **API** | `https://14-225-217-232.nip.io` · `POST /api/hrm/auth/mobile/login` → 201 |
| **Locks** | U65 zero-seed · HOLD_DEPLOY · no web hrm · no Phase1/PROD claim |
| **ack_status** | **PASS_TO_PM** |

## Build

| Item | Value |
|------|-------|
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Built | 2026-07-28 13:59:57 (rebuild from current source — prior 12:05 APK was stale vs WCAG FIX) |
| Size | 71,595,174 B |
| **SHA256** | `12F9CB959A1883AE1382B0582DA97BF9F2D28E5D5C8A37E7CE681892CFDC9D9F` |
| Install | `adb -s emulator-5554 install -r …` → **Success** |
| Login | `node scripts/qa-mobile-login-intent.mjs --email du-lich.ceo@xe.vn --password xevn-pilot` → `home_reached: true` |

## Vitest (reconfirm)

```text
pnpm exec vitest run \
  src/theme/__tests__/wcag2412Sample.test.ts \
  src/theme/__tests__/layoutInsets.test.ts \
  src/theme/__tests__/mobUx16d.test.ts \
  src/components/profile/__tests__/dynamicProfileFormUx.test.ts
```

**Result:** 4 files · **21/21 PASS**

## Screen verdicts (uiautomator bounds)

### 1) CheckIn — `check-in-submit` above tab / home indicator

| Control | Bounds (px) | Size | Clearance |
|---------|-------------|------|-----------|
| `check-in-submit` | y1=1778 → **y2=1904** · h=126 | ≥44dp | **y2 1904 < tabTop 2148** (gap **244** px) |
| `check-in-history` | y2=2051 · h=126 | ≥44dp | clears tab |
| `check-in-sticky-footer` | y2=2114 | — | above tab chrome |
| Tab content top | **2148** | — | |
| `tab-bar-safe-zone` | 2274–2337 | — | |
| Nav bar | 2337–2400 | — | |

**Verdict: PASS**

Screenshot: `docs/qa/evidence/screenshots/qa-ux-r3-wcag-mobile-01-20260728/03-checkin-wcag.png`  
JSON: `…/checkin-final.json`

### 2) FabPrimaryActionSheet — rows + Đóng clear tab; touch ≥44

Persona = **leader** (`du-lich.ceo`) → FAB rows = leave + approvals only (**no** `fab-action-check-in` by design BR-PERS-02 / `resolveFabPrimaryActions`).

| Control | Bounds | Size | Clearance |
|---------|--------|------|-----------|
| `fab-primary-action-sheet` | y2=**2124** | — | **≤ tabTop 2148** (`sheetClearsTab: true`) |
| `fab-action-create-leave` | h=**157** | PASS | above tab |
| `fab-action-manager-approvals` | h=**157** | PASS | above tab |
| Đóng | h=**126** · y2=2080 | PASS | above tab |
| Nav bar | y1=2337 | — | sheet clears nav |

**Verdict: PASS**

Screenshot: `docs/qa/evidence/screenshots/qa-ux-r3-wcag-mobile-01-20260728/02-fab-sheet-wcag.png`  
JSON: `…/fab-measures.json`

### 3) Home — avatar + notify ≥44; no status-bar clip

| Control | Bounds | Size | Notes |
|---------|--------|------|-------|
| `home-top-bar-avatar` | **116×116** · y1=**128** | PASS (≥116) | below status / inset |
| Thông báo (iconButton) | **115×116** · y1=128 | PASS (44dp; −1px density rounding) | `content-desc="Thông báo"` |
| Status-bar clear | avatar.y1=128 ≥ 60 | PASS | `paddingTop: insets.top` |

**Verdict: PASS**

Screenshot: `docs/qa/evidence/screenshots/qa-ux-r3-wcag-mobile-01-20260728/01-home-wcag.png`  
JSON: `…/home-measures.json`

### 4) Profile ESS — segments ≥44; `profile-ess-save` clear of tab

| Control | Bounds | Size | Clearance |
|---------|--------|------|-----------|
| Segment **Thông tin** | **323×116** | PASS | |
| Segment **Công việc** | **324×116** | PASS | |
| Segment **Tài liệu** | **323×116** | PASS | |
| `profile-ess-save` | **906×115** · y2=**1243** | PASS (44dp rounding) | **tabTop 2148** · gap **905** px |

**Verdict: PASS** (scroll to save; CTA fully above tab / home indicator)

Screenshot: `docs/qa/evidence/screenshots/qa-ux-r3-wcag-mobile-01-20260728/04-profile-ess-save-wcag.png`  
JSON: `…/profile-final.json`

## Summary

| # | Screen | Verdict |
|---|--------|---------|
| 1 | CheckIn | **PASS** |
| 2 | FabPrimaryActionSheet | **PASS** |
| 3 | Home | **PASS** |
| 4 | Profile ESS | **PASS** |
| — | Vitest 21/21 | **PASS** |

**Overall: PASS_TO_PM**

## Residual / notes

| Note | Severity |
|------|----------|
| Stale APK at 12:05 would have missed WCAG FIX — rebuilt & SHA recorded | closed |
| Location permission dialog appears on CheckIn entry — dismissed (Don't allow) before measure; not a WCAG layout fail | info |
| Leader persona omits FAB check-in row (spec) — rows present still clear chrome | info |
| HOLD_DEPLOY — no deploy / Phase1 claim | lock |

## Commands (repro)

```bash
adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
HRM_API_BASE=https://14-225-217-232.nip.io node scripts/qa-mobile-login-intent.mjs --email du-lich.ceo@xe.vn --password xevn-pilot
# then navigate: Home → FAB sheet → Home tile Chấm công → (dismiss location) → Hồ sơ → scroll to Lưu
adb -s emulator-5554 shell uiautomator dump /sdcard/ui.xml
```

## Handoff

### completion_report

Closed device QA for WCAG 2.4.12 mobile sample (4 screens) on rebuilt qa-device APK SHA `12F9CB95…`. Emulator bounds confirm CheckIn submit, FAB sheet, Home avatar/notify, and Profile segments + ESS save clear tab/home-indicator chrome with touch ≥44dp. Vitest 21/21 reconfirmed. No seed; HOLD_DEPLOY.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PM-UX-R3-WCAG-MOBILE-INTAKE-01
from_role: qa-device
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-ux-r3-wcag-mobile-01-20260728.md
entry: QA-UX-R3-WCAG-MOBILE-01 PASS (4/4 screens + vitest 21/21)
action: INTAKE → update UX residual synthesis / peer plan; next UX R3 WI or QC only if sponsor gate requires; HOLD_DEPLOY
cấm: seed · web hrm · deploy claim
```

### evidence_path

`docs/qa/evidence/qa-ux-r3-wcag-mobile-01-20260728.md`

### ack_status

**PASS_TO_PM**
