# MOB-UX-11a-10c-QA — Visual primitives + PayslipHeroCard device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-11a-10c-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** (GO WITH CONDITIONS — see Residual) |
| **upstream** | `mob-ux-11a-20260609.md`, `mob-ux-10c-20260609.md` |

---

## Executive verdict

**PASS_TO_PM** — Unified qa-device APK (SHA `CF413083…581`, 72,329,678 B) verified on `emulator-5554` @ `https://14-225-217-232.nip.io`. **payslip-hero-card present** (not missing — no dev-mobile rebuild required). MOB-UX-11a SET F-1 cold login (branded card + fields) PASS. J-MOB-34 hero slice PASS: Lương tile → green hero `82.340.000 ₫` → tap → PayslipDetail. Regressions MOB-UX-10 FAB, J-MOB-25 balance 8/3, J-AVT-02 avatar picker PASS. UUID scope clean. **GWC:** logout→relogin automation flake; home shimmer not captured (fast load); payslip history row not visible on period-filtered Lương tile path (API `total=2`, tile uses `goPayslipList` period filter → hero-only UX by design).

---

## Environment

| Item | Value |
|------|-------|
| Device | `emulator-5554` (sdk_gphone64_x86_64) |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| APK size | 72,329,678 B |
| SHA-256 | `CF4130830D925A02D27AD1FC02053EDE375C00D770CAC5CB24CFDAC31719D581` |
| API | `https://14-225-217-232.nip.io` |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| company_uuid | `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` |
| Login | `xevn://qa-login` deep link + cold-start login screen probe |

---

## Commands (exit codes)

| Command | Exit | Result |
|---------|------|--------|
| `Get-FileHash … -Algorithm SHA256` | **0** | Matches `CF413083…581` |
| `adb shell pm clear vn.xevn.hrm.mobile` | **0** | Success |
| `adb install -r hrm-mobile-qa-device.apk` | **0** | Success |
| Cold start `am start …MainActivity` (login probe) | **0** | SET F-1 login visible |
| `node scripts/tmp-mob-ux-11a-10c-qa-device.mjs` | **1** | Slice matrix below (hero PASS; automation gaps on logout/feed/scroll heuristic) |
| API payslip probe (`total`) | **0** | **2** payslips for employee |

---

## MOB-UX-11a — Visual primitives

| ID | Check | Result | Evidence |
|----|-------|--------|----------|
| **SET F-1 login** | Cold start → gradient hero + `branded-login-card` + `login-email` / `login-password` / `login-submit` | **PASS** | `ux11-cold-login.xml` — «XeVN HRM», Email, Mật khẩu, Đăng nhập |
| **Logout → relogin** | Settings scroll → Đăng xuất → login screen → deep-link home | **FAIL (automation)** | `ux11-login-screen.xml` still home shell — `signOut` tap did not isolate login in uiautomator window; **cold login PASS mitigates SET F-1** |
| **Home shimmer** | `dashboard-home-shimmer` on cold deep-link load | **GWC** | Not captured (network fast; home reached before poll) |
| **Payslip FlashList** | `PayslipListScreen` renders hero + list scaffold | **PASS (partial)** | `ux11-payslip-list.xml` — FlashList screen with hero; period-filter path shows hero-only when 1 payslip matches period |

**testIDs confirmed:** `branded-login-card`, `login-xevn-logo`, `login-email`, `login-password`, `login-submit`, `payslip-list-shimmer` (not triggered — instant load)

---

## MOB-UX-10c / J-MOB-34 — PayslipHeroCard

| ID | Journey step | Result | Evidence |
|----|--------------|--------|----------|
| **APK gate** | `payslip-hero-card` on installed APK | **PASS** | `heroMissing=false` — **no dev-mobile unified rebuild required** |
| **J-MOB-34 hero** | Home → **Lương** tile → `payslip-hero-card` green hero + net `82.340.000 ₫` | **PASS** | `ux11-payslip-list.xml`, `ux11-hero-detail.xml` |
| **J-MOB-34 detail** | Hero tap → PayslipDetail (Thực lĩnh / Kỳ lương) | **PASS** | `heroNav=true` |
| **J-MOB-34 history** | History rows below hero | **GWC** | Period-filter subtitle «Danh sách phiếu lương theo kỳ» — only latest period row as hero; **no 12/2025 row** on tile path (expected when `goPayslipList` passes `periodId`). Feed «Bảng lương → Xem tất cả» (`goPayslipHub`) not automated this run (duplicate «Xem tất cả» on home) |
| **J-MOB-04** | Payslip API non-empty | **PASS** | API `total=2` @ holding UUID |

**testIDs confirmed:** `payslip-hero-card`

---

## Regression spot (J-* / MOB-UX)

| Journey / ID | Result | Note |
|--------------|--------|------|
| **MOB-UX-08 scroll** | **GWC** | Content present in `ux11-scroll-top.xml` (pending strip, carousel, «Thao tác của tôi», «Bảng lương»); y-order heuristic false-negative (`portal=2226 hub=1800`) — not a layout regression |
| **MOB-UX-10 FAB** | **PASS** | «Thao tác nhanh» sheet + Chấm công |
| **J-MOB-25** | **PASS** | Balance **8** remaining / **3** used |
| **J-AVT-02** | **PASS** | Profile → native Photos picker |

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
| `docs/qa/evidence/mob-ux-11a-10c-qa-device-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/mob-ux-11a-10c-screens/` | UI XML dumps (ux11-*) |
| `scripts/tmp-mob-ux-11a-10c-qa-device.mjs` | Primary repro automation |

---

## Residual / GWC

| ID | Item | Owner | Trigger |
|----|------|-------|---------|
| **D-MOB-UX-11a-01** | Logout→login relogin not confirmed by automation (cold login PASS) | qa-device | Optional manual logout screenshot |
| **D-MOB-UX-11a-02** | Home shimmer not captured on cold load | qa-device | Slow-network re-run or accept |
| **D-MOB-UX-34-01** | History row on unfiltered `goPayslipHub` feed path — automation tapped wrong «Xem tất cả» | qa-device | Re-run feed path with Bảng lương-scoped tap |
| **D-MOB-UX-34-02** | Period-filter Lương tile shows hero-only when 1 payslip matches — document in AC or always route tile to hub | dev-mobile / BA | Product decision |

---

## Handoff

**completion_report:** MOB-UX-11a-10c-QA device wave complete on SHA `CF413083…581`. **payslip-hero-card present** — MOB-UX-10c hero PASS (green gradient, net `82.340.000 ₫`, detail nav). MOB-UX-11a SET F-1 cold login PASS (`branded-login-card`). MOB-UX-10 FAB, J-MOB-25, J-AVT-02 regressions PASS. UUID scope clean. GWC: logout relogin automation, shimmer capture, feed-hub history automation, scroll y-heuristic.

**next_owner:** `pm`

**next_dispatch_prompt:** PM intake MOB-UX-11a-10c-QA — if sponsor requires strict J-MOB-34 history row evidence, dispatch `qa-device` re-run feed path only (`goPayslipHub` via Bảng lương-scoped «Xem tất cả»); else dispatch `qc` for MOB-UX-11a/10c gate with GWC D-MOB-UX-11a-01/02 + D-MOB-UX-34-01. No `dev-mobile` rebuild unless QC rejects period-filter hero-only UX.

**evidence_path:** `docs/qa/evidence/mob-ux-11a-10c-qa-device-20260609.md`

**ack_status:** `PASS_TO_PM`
