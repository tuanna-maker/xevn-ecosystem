# R-SPINE-AT-NAV-01-QA — AT-01 HDSD nav retest (device)

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-AT-NAV-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **priority** | P1 |
| **source** | `docs/qa/evidence/r-spine-at-nav-01.md` (READY_FOR_QA) · prior BLOCKED `po-e2e-spine-02-03-mob-qa-w1.md` § AT-01 |
| **device** | `emulator-5554` (sdk_gphone64_x86_64) |
| **package** | `vn.xevn.hrm.mobile` v1.0.0 · `lastUpdateTime=2026-08-03 22:18:23` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` · 71,602,307 B · SHA256 `ab93da36b9b44776764268f994873ffb2e77a1e1f2b9c1701610c5a65433f5ab` |
| **build** | `pnpm run android:apk:qa-device` via junction `C:\xevn-ecosystem` · bundle contains `fab-action-create-update-request` / `attendance-stat-late` / `settings-create-update-request` / `fab-action-create-leave` |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` · company `holding` · UUID `10000000-0000-4000-8000-000000000001` (**not** `main`) |
| **API** | Host `http://127.0.0.1:28001` · Emulator `http://10.0.2.2:28001` · mobile login **201** |
| **U65** | **honored** — no seed; FE deep-link login + UI taps only |
| **hdsd_align** | FAB «Tạo đơn công» · hub «Đi muộn» · Settings «Đơn công» · must_keep «Tạo đơn nghỉ» |
| **test_log** | [`r-spine-at-nav-01-qa-test-log.md`](r-spine-at-nav-01-qa-test-log.md) · [`.json`](r-spine-at-nav-01-qa-test-log.json) |
| **screens** | `docs/qa/evidence/screens/r-spine-at-nav-01-qa/` |

---

## Executive verdict

**PASS_TO_PM** — AT-01 **nav discoverability** closed on fresh qa-device APK. All three HDSD entries open `CreateUpdateRequest` (title **Đơn công**, fields Loại điều chỉnh / Lý do, CTA **Gửi đơn**). **must_keep** FAB «Tạo đơn nghỉ» still present beside «Tạo đơn công». **No** full submit/approve chain claimed; **no UAT DONE**.

| Path | HDSD | Verdict | Evidence |
|------|------|---------|----------|
| 1 | FAB → «Tạo đơn công» | 🟢 | `r2-fab-sheet` (leave+update) → `r2-p1-form` / `p1-create-form` |
| 1b | must_keep «Tạo đơn nghỉ» | 🟢 | same FAB sheet texts |
| 2 | Home hub «Đi muộn» (`attendance-stat-late`) | 🟢 | scroll until late above FAB → `p2b-after` form |
| 3 | Settings → Điều hướng nhanh → «Đơn công» | 🟢 | `p3-settings` → `p3-create-form` |

---

## HDSD inventory (U76)

| # | HDSD surface | Found | Used |
|---|--------------|-------|------|
| 1 | Trang chủ | Yes | Login home |
| 2 | FAB «Thao tác nhanh» (`check-in-fab`) | Yes | Path 1 |
| 3 | «Tạo đơn nghỉ» (`fab-action-create-leave`) | Yes | must_keep assert |
| 4 | «Tạo đơn công» (`fab-action-create-update-request`) | Yes | Path 1 → CreateUpdateRequest |
| 5 | Hub «Đi muộn» (`attendance-stat-late`) | Yes | Path 2 |
| 6 | Settings «Đơn công» (`settings-create-update-request`) | Yes | Path 3 |
| 7 | Create form «Đơn công» / «Gửi đơn» | Yes | All paths |

---

## Click paths

### Path 1 — FAB (🟢)

1. Deep-link login `uat.nv0001@xe.vn` → Trang chủ  
2. Tap `check-in-fab` → sheet «Thao tác nhanh»  
3. Confirm rows: **Tạo đơn nghỉ** + **Tạo đơn công**  
4. Tap «Tạo đơn công» → form **Đơn công** (HLD-0001 / Nguyễn Văn An / Loại điều chỉnh / Gửi đơn)

Screens: `r2-fab-sheet.png` · `r2-p1-form.png` · `p1-create-form.png`

### Path 2 — Hub Đi muộn (🟢)

1. Home → scroll until `attendance-stat-late` **above** FAB (`late.y2 < fab.y1`)  
2. Tap resource-id `attendance-stat-late` center  
3. Form **Đơn công** opens (`p2b-after.png`)

**Note (GWC layout):** When stats sit under the floating FAB (default end-of-scroll), `input tap` on «Đi muộn» hits FAB z-order first and opens «Thao tác nhanh» instead. After a short scroll so the late cell clears the FAB, pressable works. Residual polish for `dev-mobile` (FAB vs stats overlap) — **not** a missing-entry regression.

### Path 3 — Settings (🟢)

1. Tab **Hồ sơ** → **Cài đặt**  
2. Điều hướng nhanh → **Đơn công**  
3. Form **Đơn công** opens

Screens: `p3-settings.png` · `p3-create-form.png`

---

## Commands (adb)

```text
cd C:\xevn-ecosystem\apps\mobile\hrm-mobile
pnpm run android:apk:qa-device
→ BUILD SUCCESSFUL · dist/hrm-mobile-qa-device.apk (68.29 MB)

adb -s emulator-5554 install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
→ Success

adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
node scripts/_tmp-po-spine-login.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
→ home_marker Trang chủ · company_uuid holding

# Device walk scripts (anti-idle)
node scripts/_tmp-r-spine-at-nav-01-qa.mjs
node scripts/_tmp-r-spine-at-nav-p12.mjs
node scripts/_tmp-p2-late-tap.mjs   # PATH2 confirm exit 0
```

---

## Residuals

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **R-SPINE-AT-NAV-FAB-OVERLAP** | P2 | dev-mobile | Home `attendance-stat-late` can sit under `check-in-fab`; recommend raise stats or FAB inset so late tap never opens sheet |
| AT-01 submit/API approve chain | — | out of scope | Nav-only wave; optional submit not executed |
| R-SPINE-MGR-HIER-01 | P0 | (parallel) | Unrelated manager approve hierarchy |

---

## completion_report

Closed: rebuild+install qa-device APK with R-SPINE-AT-NAV-01 bundle; AT-01 three HDSD entries (FAB / hub Đi muộn / Settings) → CreateUpdateRequest; leave FAB must_keep preserved; U65/U76/U78 evidence.  
Open: P2 FAB↔stats overlap polish; full AT-01 submit not in this wave.

**ack_status:** PASS_TO_PM  
**next_owner:** pm  
**evidence_path:** `docs/qa/evidence/r-spine-at-nav-01-qa.md`

### next_dispatch_prompt

```text
work_item_id: R-SPINE-AT-NAV-01-QC (optional) or resume spine residuals
role: pm
priority: P1
intake: R-SPINE-AT-NAV-01-QA PASS_TO_PM — AT-01 nav 🟢 FAB+hub+Settings on emulator-5554
evidence: docs/qa/evidence/r-spine-at-nav-01-qa.md · *-test-log.md/.json
matrix: promote AT-01 nav discoverability; do NOT claim UAT DONE / submit chain
residual P2: Task dev-mobile R-SPINE-AT-NAV-FAB-OVERLAP (stats under FAB z-order) when capacity
parallel P0: continue R-SPINE-MGR-HIER / J-MOB-05 per BA persona pair
cấm: seed · claim Phase1/UAT DONE from nav-only
```
