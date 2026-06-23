# PCOMP-W8-MOB-ESS-DASH-01-R3 — Device QA (scroll + bell hardening)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-ESS-DASH-01-R3` |
| **from_role** | qa-device |
| **to_role** | pm |
| **date** | 2026-06-08 |
| **device** | emulator-5554 (API 33, x86_64) |
| **APK** | existing qa-device install (67101921 B; reinstall **INSTALL_PARSE_FAILED_NO_CERTIFICATES**) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io` |
| **company_uuid** | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| **login** | `node scripts/qa-mobile-login-intent.mjs` — **PASS** (`home_reached:true`, `Chào buổi` marker) |
| **ack_status** | **FAIL** (GWC — hub scroll + payslip closed; bell inbox + whos_out open) |

---

## 1. Script hardening (exit criterion 1) — PASS

| Change | File | Result |
|--------|------|--------|
| `HOME_MARKERS` + `Chào buổi`, `Đi làm`, `Đồng nghiệp`, `Thông báo` | `scripts/qa-mobile-login-intent.mjs` | Deep-link login **stable PASS** (no false-negative) |
| Timeout 60s; returns matched marker | same | Run-2: `home_reached:true`, exit 0 |
| R3 runner: no post-login `am start`; scroll-to-top; tab back (no keyevent 4) | `scripts/tmp-pcomp-w8-mob-ess-dash-01-r3.mjs` | Session preserved on bell return |

---

## 2. Scroll evidence (exit criterion 2) — PARTIAL PASS

| J-ID | Verdict | Evidence |
|------|---------|----------|
| **J-MOB-06** | **PASS** | `Việc cần làm` in `r3-scroll-10.xml` + `r3-05-hub-scroll.png` after 10+ swipes |
| **J-MOB-09** | **FAIL** | `Ai nghỉ hôm nay` **absent** — `shouldShowWhosOutSection([])` hides section when whos_out empty (by design) |

**Commands:** `node scripts/tmp-pcomp-w8-mob-ess-dash-01-r3.mjs` exit **1**; scroll artifacts `docs/qa/evidence/pcomp-w8-mob-ess-dash-01-screens/r3-scroll-*.xml`

---

## 3. Bell → inbox (exit criterion 3) — FAIL

| Step | Result |
|------|--------|
| Header bell tap `(980,249)` `content-desc="Thông báo"` | Navigated to **Cài đặt** (Settings), not `InAppNotifications` |
| XML | `r3-bell-inbox.xml` — title `Cài đặt`, TabMore/Thêm selected |
| Session | Return via **Trang chủ** tab — **no keyevent 4**; home restored |

**Root cause:** `goNotifications()` → `TabMore/Notifications` lands on Settings stack (navigation regression). **Owner: dev-mobile**.

**Supplementary:** Login XML `qa-login-check.xml` shows bell a11y + announcements section on home (J-MOB-22 rows when API populated).

---

## 4. Payslip CTA (exit criterion 4) — PASS

| Step | Evidence |
|------|----------|
| Scroll to `Thực lĩnh` row | `r3-scroll-*.xml` |
| Tap `(540,632)` | `r3-payslip-detail.xml` + `r3-06-payslip-detail.png` |
| Detail screen | `Thực lĩnh` / payslip content **PASS** |

---

## 5. ESS regression J-MOB-19..22 (exit criterion 5) — GWC

| J-ID | Verdict | Evidence |
|------|---------|----------|
| **J-MOB-19** | **GWC** | **PASS** on login dump `qa-login-check.xml` (role+chat+bell); post-scroll `r3-top.xml` missing header (scroll position) |
| **J-MOB-20** | **PASS** | Date pill `07/06/2026` + stats row `Đi làm/Đi muộn/Vắng` |
| **J-MOB-21** | **PASS** | Quick grid `Hồ sơ/Chấm công/Vận hành` (NV persona) |
| **J-MOB-22** | **PASS** | `Thông báo` section; no 502 banner run-2 |

---

## 6. Portal regression J-MOB-11..15

| J-ID | Verdict | Note |
|------|---------|------|
| J-MOB-11 | **FAIL** | Bell → Settings not inbox |
| J-MOB-12 | **PASS** | Carousel / portal banner |
| J-MOB-13 | **PASS** | 2×4 quick grid |
| J-MOB-14 | **PASS** | Payslip CTA tap path documented |
| J-MOB-15 | **PASS** | Composite scroll ESS+portal+hub |

---

## 7. Environment

| Check | Result |
|-------|--------|
| nip.io 502 on attendance/inbox | **not reproduced** run-2 |
| ExpoAsset Ionicons redbox | P2 — dismiss tap `(996,2209)`; icons render |
| APK reinstall | **blocked** — use dev-mobile rebuild for whos_out/bell fix |

---

## pm_dispatch_hint

1. **dev-mobile** `PCOMP-W8-MOB-BELL-NAV-01` — bell `onNotificationsPress` must open `InAppNotifications`, not Settings default on TabMore.
2. **dev-mobile** / **devops** — seed whos_out ≥1 for `uat.nv0001` @ nip.io holding slug so J-MOB-09 section renders (`Ai nghỉ hôm nay (n)`).
3. **dev-mobile** — rebuild signed qa-device APK (current dist APK signature corrupt on install).

---

## completion_report

Hardened `qa-mobile-login-intent.mjs` waitForHome (**PASS** stable). Closed R1 gaps: **J-MOB-06** scroll captured, **J-MOB-14** payslip CTA tap documented, **J-MOB-15** composite PASS, **J-MOB-20..22** regression PASS. **Open:** **J-MOB-11** bell → Settings not inbox; **J-MOB-09** whos_out section hidden (empty API). **J-MOB-19** GWC (login XML PASS). No nip.io 502 this run. APK reinstall blocked — existing package used.

---

## next_owner

**pm**

---

## next_dispatch_prompt

PM intake PCOMP-W8-MOB-ESS-DASH-01-R3 **FAIL GWC** → dispatch **dev-mobile** bell navigation fix (`goNotifications` → InAppNotifications) + whos_out seed visibility; **dev-mobile** signed qa-device APK rebuild; then **qa-device** R4 for J-MOB-09/11 only. QC may promote J-MOB-06/14/15/20-22 device ✅ from this evidence.

---

## evidence_path

- `docs/qa/evidence/pcomp-w8-mob-ess-dash-01-qa-r3-20260608.md` (this file)
- `docs/qa/evidence/pcomp-w8-mob-ess-dash-01-qa-r3-20260608.json`
- `docs/qa/evidence/pcomp-w8-mob-ess-dash-01-screens/r3-*.xml` + `r3-*.png`
- Login header: `qa-login-check.xml` (repo root, J-MOB-19 supplementary)
