# MOB-UX-10-P0-QA — ZenHR FAB action sheet + pending strip device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-10-P0-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **upstream** | `docs/qa/evidence/mob-ux-10-p0-20260609.md` (READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — MOB-UX-10-P0 verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. Center FAB opens «Thao tác nhanh» sheet (Chấm công, Tạo đơn nghỉ, Duyệt đơn for manager); manager Home shows `home-pending-approvals-strip` above carousel with tap → approvals; MOB-UX-08 scroll regression PASS with strip-before-carousel; J-MOB-06..15, J-MOB-23/25/28, J-AVT-02, 4-tab lock PASS. UUID scope clean (no `main` slug in logcat).

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 71,800,926 B |
| SHA-256 | `9091AB195E85C08EBB0EBCAA03AB5EBB86877F454AC77C9400A0001C654DC6E8` |
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
| `node scripts/tmp-mob-ux-10-p0-qa-device.mjs` | **0** | All checks PASS |

---

## MOB-UX-10 primary checks

| ID | Journey / AC | Result | Evidence |
|----|--------------|--------|----------|
| **J-MOB-33** | Center FAB on Home + Đơn công → tap → sheet «Thao tác nhanh» → Chấm công → CheckIn; Tạo đơn nghỉ → create wizard; manager + «Duyệt đơn»; tab count **4** | **PASS** | `ux10-fab-sheet.xml`, `ux10-checkin.xml`, `ux10-create-leave.xml` |
| **J-MOB-31** | Manager pending strip `home-pending-approvals-strip` above fold; «Xem tất cả» tap → approvals list | **PASS** | `ux10-pending-strip.xml`, `ux10-manager-approvals.xml` |
| **4-TAB-LOCK** | Tab bar: Trang chủ / Chấm công / Đơn công / Thêm only | **PASS** | `ux10-4tab-check.xml` — `tabCount=4` |
| **MOB-UX-08-REGRESSION** | Scroll order portal→hub→ESS preserved; strip before carousel | **PASS** | `ux10-scroll-top.xml` + scroll frames |

**testIDs confirmed:** `check-in-fab`, `fab-primary-action-sheet`, `fab-action-check-in`, `fab-action-create-leave`, `fab-action-manager-approvals`, `home-pending-approvals-strip`

---

## Regression spot (J-*)

| Journey | Result | Note |
|---------|--------|------|
| J-MOB-06 | **PASS** | «Việc hôm nay» on scroll |
| J-MOB-07 | **PASS** | «Cần duyệt» strip / manager card |
| J-MOB-08 | **PASS** | «Sinh nhật hôm nay» |
| J-MOB-09 | **PASS** | «Ai nghỉ hôm nay» |
| J-MOB-11 | **PASS** | Top bar bell `Thông báo` |
| J-MOB-12 | **PASS** | Hero carousel «Chúc mừng…» |
| J-MOB-13 | **PASS** | Quick access grid |
| J-MOB-14 | **PASS** | Payslip feed «Bảng lương» |
| J-MOB-15 | **PASS** | Composite scroll order |
| J-MOB-23 | **PASS** | Leave list + balance on Đơn công |
| J-MOB-25 | **PASS** | Balance **8** remaining / **3** used |
| J-MOB-28 | **PASS** | Leave tabs + `Còn lại` chip |
| J-AVT-02 | **PASS** | Profile → `profile-avatar-pick` → native Photos picker |

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
| `docs/qa/evidence/mob-ux-10-p0-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/mob-ux-10-p0-screens/` | UI XML dumps + PNG captures |
| `scripts/tmp-mob-ux-10-p0-qa-device.mjs` | Repro automation |

---

## Residual

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-UX-10-01 | Strip row tap opens inbox list (not per-row detail) — per dev residual AC-ZEN-31-01 | INFO | qa-device confirm — **tap «Xem tất cả» → approvals PASS** |
| R-UX-10-API | `GET /tasks` returns `pending_api=0` while dashboard strip shows manager pending (hub poll) — UI source ≠ tasks total | INFO | PM / dev-be |
| R-PERSONA-01 | `uat.nv0001@xe.vn` resolves manager on pilot (Duyệt FAB row, pending strip) | INFO | prior waves |

No product P0/P1 blockers for MOB-UX-10-P0 promotion.

---

## Handoff

**completion_report:** MOB-UX-10-P0 device QA closed — FAB action sheet J-MOB-33 (sheet + CheckIn + create leave + Duyệt đơn), pending approvals strip J-MOB-31 (`home-pending-approvals-strip`, tap nav), MOB-UX-08 scroll regression, J-MOB-06..15 + J-MOB-23/25/28 + J-AVT-02 + 4-tab lock PASS @ nip.io; SHA/install/deep-link verified.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake `MOB-UX-10-P0-QA` PASS_TO_PM → dispatch **`qc`** scoped mobile gate on MOB-UX-10 (J-MOB-31/33 + regression matrix); update `PROGRAM_JOURNEY_MAP.md` J-MOB-31..35 rows from ⏳ to ✅ for 31/33; advance MOB-UX-10a (J-MOB-32 grid) per sprint backlog if PM priority.

**evidence_path:** `docs/qa/evidence/mob-ux-10-p0-qa-device-20260609.md`

**ack_status:** `PASS_TO_PM`
