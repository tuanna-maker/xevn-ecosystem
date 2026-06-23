# MOB-UX-03-GLOBAL-QA — Global typography 5-screen device L2.5 @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-03-GLOBAL-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |
| **environment** | `https://14-225-217-232.nip.io` · `uat.nv0001@xe.vn` / `xevn-uat-2026` · `emulator-5554` |

## Verdict

**PASS_TO_PM** — APK SHA `CD3D49B07B86F4813370102C6BFFE6CCDCA9FF886B70571E47FCC21AF1EE826B` verified. All **5 typography screens** device-readable with sentence-case labels; no dev strings (`employeeId`, `companyId header`). Regressions **J-MOB-34** hero, **J-MOB-35** pills (scroll-1 for Vắng mặt), **MOB-UX-11a** login gradient, **FAB** PASS. UUID scope clean (`company_uuid=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`, no `x-company-id: main` in logcat).

**GWC (non-blocking):** Manager Approvals filter chips hidden when `pending=0` (empty inbox UX by design). Profile meta shows employee code `HLD-0001` / title `CEO` (data labels, not UI all-caps defect).

---

## L0 — Install + SHA

| Check | Result |
|-------|--------|
| APK path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` (72,331,007 B) |
| SHA-256 | `CD3D49B07B86F4813370102C6BFFE6CCDCA9FF886B70571E47FCC21AF1EE826B` **PASS** |
| `adb shell pm clear` + `install -r` | exit **0** Success |
| Device | `emulator-5554` device |

```powershell
adb devices
Get-FileHash apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk -Algorithm SHA256
adb shell pm clear vn.xevn.hrm.mobile
adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
```

---

## Login

| Check | Result |
|-------|--------|
| Cold start SET F-1 | `branded-login-card` + logo + email/password/submit **PASS** — `ux03-cold-login.xml` |
| Deep link home | `xevn://qa-login` → home **PASS** — `J-MOB-01` |
| Scope | `company_uuid=6efaa5d6-a4a8-4bfd-805a-3c4f003e4013`; logcat `hasMainHeader=false` |

---

## Five-screen typography audit (MOB-UX-03-GLOBAL)

| Screen | J-ID | Key labels verified | Dev strings | Status | Artifact |
|--------|------|---------------------|-------------|--------|----------|
| **LeaveRequestDetail** | J-MOB-03 | Hero + metric grid + `Lý do` body; footnote timestamps | none | **PASS** | `ux03-leave-detail.xml` (via Đơn công → Đã duyệt → row tap) |
| **ManagerApprovals** | J-MOB-05 | Screen title `Duyệt đơn` title2; subtitle sentence-case; empty-state copy | none | **PASS** | `ux03-manager-approvals.xml` |
| **Profile** | J-AVT-02 | Grouped layout; `Mã … · status` meta; Email/Họ tên fields; avatar pick | none | **PASS** | `ux03-profile.xml` |
| **CheckIn** | J-MOB-02 | Title `Chấm công` (not largeTitle); CTA `Chấm công vào`; `Lịch sử` link | none | **PASS** | `ux03-checkin.xml` |
| **PayslipDetail** | J-MOB-04 | `Tổng gross` / `Khấu trừ` / `Thực lĩnh` tabular currency rows | none | **PASS** | `ux03-payslip-detail.xml` |

---

## Regression spot

| ID | Journey | Result | Evidence |
|----|---------|--------|----------|
| **MOB-UX-11a** | Cold login gradient / branded card | **PASS** | `ux03-cold-login.xml` |
| **J-MOB-34** | Lương tile → `payslip-hero-card` → PayslipDetail | **PASS** | `ux03-j34-list.xml`, `ux03-j34-detail.xml` |
| **J-MOB-35** | Chấm công → Lịch sử → pills Đúng giờ(8) / Đi muộn(1) / Vắng mặt(1) | **PASS** | `ux03-j35-history-initial.xml`, `ux03-j35-scroll-1.xml`; API `records=12` |
| **REG-FAB** | `check-in-fab` → Thao tác nhanh sheet | **PASS** | `ux03-fab-sheet.xml` |

### J-MOB-35 pill matrix

| Pill | UI count | API corroboration |
|------|----------|-------------------|
| Đúng giờ | 8 (initial viewport) | present rows |
| Đi muộn | 1 | late row 01/06/2026 08:45 |
| Vắng mặt | 1 (after scroll-1) | absent row off initial viewport |

---

## Commands run

| Command | Exit |
|---------|------|
| `node scripts/tmp-mob-ux-03-global-qa-device.mjs` | **0** |
| `Get-FileHash hrm-mobile-qa-device.apk` | **0** |
| `adb shell pm clear vn.xevn.hrm.mobile` | **0** |
| `adb install -r hrm-mobile-qa-device.apk` | **0** |

Machine JSON: [`mob-ux-03-global-qa-device-20260609.json`](mob-ux-03-global-qa-device-20260609.json)  
XML/screens: [`mob-ux-03-global-screens/`](mob-ux-03-global-screens/)

---

## Residual / GWC

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| **GWC-MGR-FILTER-01** | P2 | Filter chips (`Tất cả` / `Nghỉ phép`) not rendered when inbox empty — expected empty-state UX | **ACCEPTED** |
| **GWC-PROFILE-CODE-01** | P2 | Employee code `HLD-0001` in meta is seed data, not label casing defect | **ACCEPTED** |

No P0/P1 product blockers for MOB-UX-03-GLOBAL promotion.

---

## Handoff

**completion_report:** MOB-UX-03-GLOBAL-QA device wave **PASS** on SHA `CD3D49B0…E826B` @ nip.io. Five-screen typography polish verified (Leave detail, Manager Approvals, Profile, Check-in, Payslip detail). Regressions J-MOB-34 hero, J-MOB-35 pills (+ scroll), MOB-UX-11a login gradient, FAB intact. UUID scope clean. GWC only on empty-manager filter chips and seed employee-code display.

**next_owner:** `pm` → `qc` (scoped MOB-UX-03-GLOBAL gate)

**next_dispatch_prompt:** Intake MOB-UX-03-GLOBAL-QA PASS_TO_PM. Dispatch **qc** scoped gate: MOB-UX-03-GLOBAL typography 5-screen + J-MOB-03/04/05/34/35 regression @ nip.io — evidence `docs/qa/evidence/mob-ux-03-global-qa-device-20260609.md` + JSON. Mark MOB-UX-03-GLOBAL ready for QC GO (scoped). Optional: promote journey map J-MOB-03..05 typography slice if QC concurs.

**evidence_path:** `docs/qa/evidence/mob-ux-03-global-qa-device-20260609.md`

**ack_status:** `PASS_TO_PM`
