# MOB-UX-08-P0-QA — ZenHR home polish device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-08-P0-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **upstream** | `docs/qa/evidence/mob-ux-08-p0-20260609.md` (READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — MOB-UX-08-P0 ZenHR home polish verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. Scroll order portal→hub→ESS, section headers, Duyệt quick-access badge, rich whos-out/birthday cards, no chat icon; regression J-MOB-06..15, J-MOB-25, J-AVT-02 spot PASS. UUID scope header audit clean (no `main` slug in logcat).

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 71,784,199 B |
| SHA-256 | `913478ADC0B27FE686E8FFB5465B9ECEE02A2E52F9C5C3431B09EFA90522B8AB` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Login | `xevn://qa-login` deep link (`scripts/qa-mobile-login-intent.mjs` pattern) |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `adb shell pm clear vn.xevn.hrm.mobile` | 0 | Success |
| `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | 0 | Success |
| `Get-FileHash … -Algorithm SHA256` | 0 | Matches expected SHA |
| `node scripts/tmp-mob-ux-08-p0-qa-device.mjs` | **0** | All checks PASS |
| `node scripts/qa-mobile-login-intent.mjs` (spot) | 0 | `home_reached: true` |

---

## MOB-UX-08 primary checks

| ID | Requirement | Result | Evidence |
|----|-------------|--------|----------|
| **SCROLL** | Top→bottom: portal (carousel, Hành động nhanh, Bảng lương) before hub (Việc hôm nay, Sinh nhật, Ai nghỉ) before ESS (Đi làm/Vắng, stat cards) | **PASS** | yPortal=948 < yHub=1917 < yEss=2022 · XML scroll frames |
| **HEADERS** | «Hành động nhanh», «Bảng lương», «Việc hôm nay», «Sinh nhật hôm nay», «Ai nghỉ hôm nay» | **PASS** | `ux08-top.xml`, `ux08-scroll-*.xml` |
| **NO-CHAT** | Home top bar: no `Chat nội bộ` a11y/icon | **PASS** | `ux08-top.xml` — bell only |
| **BADGE** | QuickAccess Duyệt badge when pending>0 | **PASS** | `ux08-top.xml` — tile `Duyệt` + `content-desc="2 mục"` + badge text `2` |
| **RICH-CARDS** | Whos-out / birthday: avatar ImageView + date/subtitle on person rows | **PASS** | Scroll XML — `HomeHubPersonCard` rows with names + `dd/mm` range |
| **NO-DATE-PICKER** | Employee ESS: no date pill on home top (manager path deferred) | **PASS (spot)** | Top frame: no `Chọn ngày`; see Residual R-PERSONA-01 |

---

## Regression spot (J-*)

| Journey | Result | Note |
|---------|--------|------|
| J-MOB-06 | **PASS** | «Việc hôm nay» section visible on scroll |
| J-MOB-07 | **PASS** | «Cần duyệt (2)» manager card present |
| J-MOB-08 | **PASS** | «Sinh nhật hôm nay» + horizontal person cards |
| J-MOB-09 | **PASS** | «Ai nghỉ hôm nay» + rich cards, tap target present |
| J-MOB-11 | **PASS** | Top bar bell a11y `Thông báo` |
| J-MOB-12 | **PASS** | Hero carousel «Chúc mừng sinh nhật…» |
| J-MOB-13 | **PASS** | Quick access grid 8 tiles under «Hành động nhanh» |
| J-MOB-14 | **PASS** | Payslip feed «Bảng lương» + Thực lĩnh teaser |
| J-MOB-15 | **PASS** | Composite scroll order portal→hub→ESS |
| J-MOB-25 | **PASS** | Đơn công → Đơn nghỉ → balance **8** remaining / **3** used |
| J-AVT-02 | **PASS** | Hồ sơ bạn → Profile → `profile-avatar-pick` → native **Photos** picker |

---

## Logcat / scope audit

| Check | Result |
|-------|--------|
| `x-company-id: main` in outbound logcat | **false** (PASS) |
| company_uuid on session | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Fatal exception on boot/login | **false** |

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/mob-ux-08-p0-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/mob-ux-08-p0-screens/` | UI XML dumps + PNG scroll captures |
| `docs/qa/evidence/mob-ux-08-p0-screens/avt3-profile.xml` | Profile + `profile-avatar-pick` |
| `docs/qa/evidence/mob-ux-08-p0-screens/avt3-picker.xml` | Native Photos picker |
| `scripts/tmp-mob-ux-08-p0-qa-device.mjs` | Repro automation |

---

## Residual

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-PERSONA-01 | `uat.nv0001@xe.vn` resolves **CEO/manager** on pilot (Duyệt tile, ESS date pill at scroll) — employee-only `showDatePicker=false` not isolated on separate NV account this wave | INFO | qa-device / PM |
| R-UX-08-02 | 720×1280 emulator stays **4-col** quick grid (3-col only on narrow width) | INFO | — per dev residual |

No product P0/P1 blockers for MOB-UX-08-P0 promotion.

---

## Handoff

**completion_report:** MOB-UX-08-P0 device QA closed — ZenHR scroll order U53, section headers, Duyệt badge (2), rich whos-out/birthday cards, chat hidden; J-MOB-06..15 + J-MOB-25 + J-AVT-02 regression PASS @ nip.io emulator; SHA/install/deep-link login verified.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake `MOB-UX-08-P0-QA` PASS_TO_PM → dispatch **`qc`** for scoped mobile gate on MOB-UX-08 (J-MOB-06..15 spot + MOB-UX-08 delta) or advance **`MOB-UX-10`** per sprint backlog; update `PROGRAM_JOURNEY_MAP.md` J-MOB-30 if MOB-UX-08 closes team directory scope.

**evidence_path:** `docs/qa/evidence/mob-ux-08-p0-qa-device-20260609.md`

**ack_status:** `PASS_TO_PM`
