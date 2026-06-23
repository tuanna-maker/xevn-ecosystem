# MOB-UX-10a-QA — ZenHR 3×2 action carousel device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-10a-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **upstream** | `docs/qa/evidence/mob-ux-10a-20260609.md` (READY_FOR_QA) |

---

## Executive verdict

**PASS_TO_PM** — MOB-UX-10a verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. J-MOB-32: `home-actions-carousel` with colorful ZenHR tiles (Nghỉ phép / Chi phí / Giấy tờ), horizontal page-2 swipe (Khen thưởng / Chính sách / **Duyệt**), Nghỉ phép → leave list, Chi phí/Giấy tờ → Phase 2 stub modal (no crash). Manager persona: **Duyệt** tile visible on page 2 with pending strip `Cần duyệt (1)`. Regression J-MOB-31 pending strip, J-MOB-33 FAB sheet, MOB-UX-08 scroll order PASS. UUID scope clean.

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 71,804,764 B |
| SHA-256 | `C7E9E5AEB2269A8B8B6F4FE19D580649125751BBC89C0561758973FD318F4AF9` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Login | `xevn://qa-login` deep link |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `Get-FileHash hrm-mobile-qa-device.apk -Algorithm SHA256` | 0 | Matches `C7E9E5AE…F4AF9` |
| `adb shell pm clear vn.xevn.hrm.mobile` | 0 | Success |
| `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | 0 | Success |
| `node scripts/tmp-mob-ux-10a-qa-device.mjs` | **0** | All checks PASS |

---

## MOB-UX-10a primary checks

| ID | Journey / AC | Result | Evidence |
|----|--------------|--------|----------|
| **J-MOB-32** | `home-actions-carousel` 3-col colorful tiles; page dots (>6 items); swipe page 2; **Nghỉ phép** → leave list; **Chi phí** / **Giấy tờ** → `phase2-stub-modal`; **Duyệt** tile when manager pending | **PASS** | `ux10a-carousel-page2.xml`, `ux10a-nghi-phep-nav.xml`, `ux10a-chi-phi-stub.xml`, `ux10a-giay-to-stub.xml` |
| **J-MOB-31** | `home-pending-approvals-strip` above fold when pending ≥1 | **PASS** | `ux10a-pending-strip.xml` |
| **J-MOB-33** | Center FAB → «Thao tác nhanh» sheet; 4 tabs | **PASS** | `ux10a-fab-sheet.xml` |
| **MOB-UX-08-REGRESSION** | Scroll order: strip → action grid → hub → ESS | **PASS** | `ux10a-scroll-top.xml` + scroll frames |

**testIDs corroborated:** `home-actions-carousel`, `home-actions-page-dots` (implicit via 11-tile paging), `home-action-tile-time_off`, `home-action-tile-expenses`, `home-action-tile-letters`, `phase2-stub-modal`, `home-pending-approvals-strip`, `check-in-fab`

---

## J-MOB-32 detail

| Check | Result | Note |
|-------|--------|------|
| Section «Thao tác của tôi» | PASS | 3×2 grid page 1: Nghỉ phép, Chi phí, Giấy tờ, Hồ sơ, Sự nghiệp, Lương |
| Horizontal paging | PASS | Swipe → page 2: Khen thưởng, Chính sách, Chấm công (tile), **Duyệt**, Xem thêm |
| Nghỉ phép nav | PASS | Opens leave / Đơn nghỉ context |
| Chi phí stub | PASS | «Tính năng này sẽ có trong Phase 2» — no crash |
| Giấy tờ stub | PASS | Same Phase 2 modal |
| Duyệt badge (pending>0) | PASS | `effectivePending=1` (hub strip); **Duyệt** tile on page 2; manager JWT persona (`mgrUi=true`) |

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
| `docs/qa/evidence/mob-ux-10a-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/mob-ux-10a-screens/` | UI XML dumps + PNG captures |
| `scripts/tmp-mob-ux-10a-qa-device.mjs` | Repro automation |

---

## Residual

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-UX-10a-03 | `home-action-tile-tasks-badge` testID not surfaced in uiautomator XML — badge inferred via **Duyệt** tile + `Cần duyệt (1)` strip | INFO | qa-device — visual PASS; optional dev-mobile accessibility export |
| R-UX-10a-02 | J-MOB-34/35 salary hero + timeline badges | INFO | PM → MOB-UX-10c/10d |
| R-PERSONA-01 | API `is_manager=false` but JWT roles → manager UI (Duyệt label, pending strip) | INFO | prior waves — expected for `uat.nv0001@xe.vn` |

No product P0/P1 blockers for MOB-UX-10a promotion.

---

## Handoff

**completion_report:** MOB-UX-10a device QA closed — J-MOB-32 colorful 3×2 paginated action carousel (Nghỉ phép nav, Chi phí/Giấy tờ stub modal, page-2 Duyệt tile with pending context), J-MOB-31 strip + J-MOB-33 FAB regression PASS, MOB-UX-08 scroll order PASS @ nip.io; APK SHA/install/deep-link verified; scope UUID clean.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake `MOB-UX-10a-QA` PASS_TO_PM → dispatch **`qc`** scoped mobile gate on MOB-UX-10a (J-MOB-32 + J-MOB-31/33 regression); update `PROGRAM_JOURNEY_MAP.md` J-MOB-32 row from ⏳ to ✅ device CLOSED; advance MOB-UX-10c/10d (J-MOB-34/35) per sprint backlog.

**evidence_path:** `docs/qa/evidence/mob-ux-10a-qa-device-20260609.md`

**ack_status:** `PASS_TO_PM`
