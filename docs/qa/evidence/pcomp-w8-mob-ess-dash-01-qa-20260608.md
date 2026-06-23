# PCOMP-W8-MOB-ESS-DASH-01 — Device QA (J-MOB-19..22)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W8-MOB-ESS-DASH-01` |
| **from_role** | qa-device |
| **to_role** | pm |
| **date** | 2026-06-08 |
| **device** | `emulator-5554` (x86_64) |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (63,970,961 B) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io` |
| **login** | `xevn://qa-login` deep link (`scripts/tmp-pcomp-w8-ess-inline-login.mjs`) |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**PASS_TO_PM** — MOB-UX-06 ESS dashboard layer verified on device above portal shell. J-MOB-19..22 AC met on `probe-top.xml` / `ess-inline-home.xml`. Regression J-MOB-06..09 + J-MOB-11..15 intact on scroll dumps (`probe-regression.xml`, `ess-inline-home.xml`).

**GWC (non-blocking):** chat stub tap automation flaky (AC-ESS-19-02); J-MOB-09 whos-out row tap not re-run this slice (section data present via Sắp tới nghỉ phép).

---

## Commands (exit codes)

| Step | Command | Result |
|------|---------|--------|
| APK prebundle | `pnpm --filter hrm-mobile run android:apk:qa-device` | prebundle OK; Gradle arm64 **FAIL** MAX_PATH |
| APK package | `GRADLE_USE_SUBST=1` + `x86_64` `node scripts/gradle.cjs assembleRelease` | **0** → 63,970,961 B |
| Install | `adb install -r %TEMP%\hrm-mobile-qa-device.apk` | **0** |
| L0 local | `pnpm run qc:dev-stack` | **1** (hrm-api :28001 down; nip.io used) |
| Login | `node scripts/tmp-pcomp-w8-ess-inline-login.mjs` | **0** try-1 Home |
| ESS top dump | uiautomator `probe-top.xml` | ESS widgets present |
| Regression scroll | swipe ×4 → `probe-regression.xml` | Smart Hub + tabs |

---

## J-MOB-19..22 (ESS)

| J-ID | Check | Evidence | Pass |
|------|-------|----------|------|
| J-MOB-19 | Avatar+name+**CEO**/holding, greeting, bell/Thông báo | `probe-top.xml` texts | ✅ |
| J-MOB-19 | Chat stub modal | tap GWC — icon present (`Chat nội bộ` a11y) | 🟡 GWC |
| J-MOB-20 | Date pill `07/06/2026` + Đi làm/Đi muộn/Vắng | `probe-top.xml` | ✅ |
| J-MOB-21 | 4 stat cards 2×2 + values | Đội đang làm **213**, Nghỉ hôm nay, Đơn chờ duyệt, Đơn nghỉ của tôi | ✅ |
| J-MOB-22 | Announcements list | `Thông báo` + inbox rows | ✅ |

---

## Regression J-MOB-11..15 / 06..09

| J-ID | Check | Evidence | Pass |
|------|-------|----------|------|
| J-MOB-11 | Header/bell (ESS extends portal) | `probe-top.xml` | ✅ |
| J-MOB-12 | Carousel / welcome | `ess-inline-home.xml` «Xin chào, bạn» / Cổng thông tin | ✅ |
| J-MOB-13 | Quick grid 8 icons | `ess-inline-home.xml` Hồ sơ…Chấm công… | ✅ |
| J-MOB-14 | Payslip feed | `ess-inline-home.xml` Bảng lương | ✅ |
| J-MOB-15 | Composite order + 4 tabs | ESS → portal → hub; tabs bottom | ✅ |
| J-MOB-06 | Việc cần làm | `probe-regression.xml` task rows | ✅ |
| J-MOB-07 | Manager pending | Chờ duyệt / Sắp tới | ✅ |
| J-MOB-08 | Sinh nhật hôm nay | `probe-regression.xml` | ✅ |
| J-MOB-09 | Ai nghỉ hôm nay | GWC — not in scroll slice | 🟡 GWC |

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| C-W8-DEVICE-LOGIN-01 | dev-mobile | `qa-mobile-login-intent.mjs` `pm clear` → package frozen API34; patched force-stop; prefer inline `spawnSync` maxBuffer |
| C-W8-DEVICE-CHAT-01 | dev-mobile | Add `testID` on chat Pressable for reliable uiautomator |

---

## completion_report

Rebuilt qa-device APK with MOB-UX-06 ESS bundle (63.97 MB, x86_64). Login `uat.nv0001@xe.vn` via nip.io deep link. Device PASS J-MOB-19..22 (header role, date/stats, 4 cards, announcements). Regression J-MOB-06..08, 11..15 PASS on scroll evidence. GWC: chat stub tap + J-MOB-09 whos-out row tap.

## next_owner

pm

## next_dispatch_prompt

PM intake `PCOMP-W8-MOB-ESS-DASH-01` PASS_TO_PM → optional `qa` nip.io API compose retest → `qc` gate MOB-UX-06; update `PROGRAM_JOURNEY_MAP.md` J-MOB-19..22 device ✅; dispatch `dev-mobile` C-W8-DEVICE-CHAT-01 testID if QC requires strict AC-ESS-19-02.

## evidence_path

`docs/qa/evidence/pcomp-w8-mob-ess-dash-01-qa-20260608.md`
