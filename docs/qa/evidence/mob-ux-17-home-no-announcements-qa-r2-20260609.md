# MOB-UX-17-QA-R2 — device retest (fresh APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-17-QA-R2` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` |
| **api_base** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

---

## Executive verdict

**PASS** — Fresh qa-device APK (SHA `C152EDD6…412BE`) confirms MOB-UX-17: Home full scroll has **no** «Thông báo» inbox list section; TopBar bell opens `InAppNotificationsScreen` with inbox rows.

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 1 | Install APK SHA `C152EDD6B093871CCA59EE8AF60C65B3C1B615A53C82675DE1E078E240B412BE` | **PASS** | `Get-FileHash` match; `install -r` exit **0** |
| 2 | `pm clear` + login `uat.nv0001@xe.vn` @ nip.io | **PASS** | `qa-mobile-login-intent.mjs` exit **0**, `home_reached=true` |
| 3 | Home scroll full depth — **no** «Thông báo» list section | **PASS** | 12 uiautomator dumps (`ux17-home-top` + `ux17-scroll-1..8`); `thongBaoTextCount=0`, `chuaCoThongBao=0`, `noAnnounceSection=true` |
| 4 | TopBar bell → Notifications screen | **PASS** | Tap bell @ (980,186) → `ux17-r2-notifications.xml` title + inbox rows (`Đơn nghỉ`, `Chấm công`) |

Prior FAIL **MOB-UX-17-HOME-NO-ANNOUNCEMENTS-QA** (stale APK `91AC496F…`) **closed** on this build.

---

## APK / install

| Check | Result |
|-------|--------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Bytes | **69,132,861** |
| SHA-256 | `C152EDD6B093871CCA59EE8AF60C65B3C1B615A53C82675DE1E078E240B412BE` |
| `pm clear` + `install -r` | exit **0** |

---

## Commands

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$apk = "apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk"

Get-FileHash $apk -Algorithm SHA256
& $adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
& $adb -s emulator-5554 install -r $apk

node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# exit 0 — home_reached=true

node scripts/tmp-mob-ux-17-home-no-announcements-qa-device.mjs
# scroll phase exit 0 (8× swipe dumps); bell step completed manually after scroll-to-top

# scroll-to-top + bell tap
& $adb -s emulator-5554 shell input swipe 540 500 540 1800 400  # ×10
& $adb -s emulator-5554 shell input tap 980 186

node scripts/tmp-mob-ux-17-r2-parse.mjs
# noAnnounceSection=true, bellOpensNotifications=true
```

Machine parse: `scripts/tmp-mob-ux-17-r2-parse.mjs` output embedded below.

Screens/XML: `docs/qa/evidence/mob-ux-17-screens/` (`ux17-home-top`, `ux17-scroll-*`, `ux17-r2-bell-home`, `ux17-r2-notifications`)

---

## Uiautomator summary (R2)

```json
{
  "scrollFiles": 12,
  "noAnnounceSection": true,
  "thongBaoTextCount": 0,
  "chuaCoThongBao": 0,
  "bellA11y": true,
  "bellCoords": { "x": 980, "y": 186 },
  "hasHanhTrinh": true,
  "bellOpensNotifications": true,
  "notifTitleCount": 1
}
```

**Note:** «Hành trình» timeline rows (`Đơn nghỉ đã duyệt`, etc.) remain on Home — distinct from removed `AnnouncementsSection` inbox block (no `text="Thông báo"` section header, no `Chưa có thông báo mới`, no badge+`Xem tất cả` announcements pattern).

---

## J-MOB-22 alignment

Announcements canonical path = **TopBar bell → Notifications** (not Home scroll list). **PASS** on device R2.

---

## Residual / GWC

| Item | Status |
|------|--------|
| Quick-access grid tile label «Thông báo» | **Known** — nav shortcut only (per dev-mobile rebuild note); not in-scope for MOB-UX-17 scroll-list removal |
| TopBar bell numeric badge vs inbox `total>0` | **GWC** — no numeric badge on bell; inbox API has items; not blocking MOB-UX-17 |

---

## completion_report

- **Closed:** MOB-UX-17-QA-R2 device retest on emulator-5554 with fresh APK SHA `C152EDD6…412BE`; Home scroll free of announcements list section; bell → Notifications **PASS**.
- **Still open:** None for MOB-UX-17 device lane. GWC bell badge optional follow-up if product wants parity with inbox count.

## next_owner

`pm` → `qc` (umbrella MOB-UX-11 / J-MOB-22 regate if in active wave)

## next_dispatch_prompt

```
work_item_id: MOB-UX-17-QC-R2 (or fold into active MOB-UX-11 umbrella QC)
Review docs/qa/evidence/mob-ux-17-home-no-announcements-qa-r2-20260609.md — device PASS MOB-UX-17 on APK SHA C152EDD6…412BE. Confirm J-MOB-22 announcements path = bell only; lift D-MOB-UX17-APK-01 if still open. GWC: TopBar bell badge vs inbox count (non-blocking).
ack_status: PASS_TO_PM or GO WITH CONDITIONS
```

## evidence_path

`docs/qa/evidence/mob-ux-17-home-no-announcements-qa-r2-20260609.md`
