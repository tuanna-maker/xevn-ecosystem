# QA-DEVICE-HDSD-FIG-CH12-01 — HDSD Ch.12 mobile FIG capture (C-R2-02)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-DEVICE-HDSD-FIG-CH12-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **C-R2-02** client-final |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-08-01 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (sdk_gphone64_x86_64 · API 14) |
| **APK** | `hrm-mobile-qa-device.apk` SHA-256 `24CDF95FD1F295200BE1D622FC8AE1BC26F90E1D4F732A0E3C8B50F50CD6C55F` |
| **API** | `http://14.225.217.232:3001` |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` (+ `uat.nv0002@xe.vn` for §12.6) |
| **script** | `scripts/tmp-qa-hdsd-mob-ch12-r4-device.mjs` |
| **runtime** | `docs/qa/evidence/screenshots/hdsd-uat-mobile-ch12-r4-20260731/qa-result.json` |
| **U65** | zero-seed · QA deep-link login only · no placeholder PNG |

---

## Executive verdict

**PASS_TO_PM** — **C-R2-02 CLOSED:** **8/8** mobile Chapter 12 FIG assets captured on pilot `:3001` emulator and stored at `docs/client-delivery/hdsd/assets/hrm/hrm-12-{1..8}.png`. Ready for **ba-docs** HDSD client rebuild / `hdsd:build`.

| Exit criterion | Verdict | Notes |
|----------------|---------|-------|
| 8× `hrm-12-*.png` per HDSD spec | 🟢 **PASS** | All files on disk · sizes 130–429 KB (real device screencaps) |
| Client delivery path | 🟢 **PASS** | `docs/client-delivery/hdsd/assets/hrm/` |
| U65 zero-seed | 🟢 **Honored** | Deep-link auth only; no seed / DB fake |
| Pilot auth | 🟢 **PASS** | nv0001/nv0002 → **201** `HRM-AUTH-200` |
| Emulator | 🟢 **PASS** | `emulator-5554 device` |

---

## FIG asset matrix (C-R2-02)

| Asset | HDSD § | Caption (source MD) | Source shot | Size (bytes) | Status |
|-------|--------|---------------------|-------------|--------------|--------|
| `hrm-12-1.png` | 12.1 | Màn đăng nhập HRM Mobile | `fig-login.png` | 360,892 | 🟢 |
| `hrm-12-2.png` | 12.2 | Trang chủ + FAB Chấm công | `fig-home.png` | 214,736 | 🟢 |
| `hrm-12-3.png` | 12.3 | Đội nhóm + Check-in | `fig-team.png` | 254,310 | 🟢 |
| `hrm-12-4.png` | 12.4 | Danh sách đơn nghỉ phép | `fig-leave.png` | 132,347 | 🟢 |
| `hrm-12-5.png` | 12.5 | Phiếu lương | `fig-payslip.png` | 247,969 | 🟢 |
| `hrm-12-6.png` | 12.6 | Phê duyệt quản lý | `fig-approvals.png` | 129,845 | 🟢 |
| `hrm-12-7.png` | 12.7 | Hồ sơ cá nhân | `fig-profile.png` | 429,194 | 🟢 |
| `hrm-12-8.png` | 12.8 | Trung tâm thông báo | `fig-notifications.png` | 214,869 | 🟢 |

**Glob verify:** `docs/client-delivery/hdsd/assets/hrm/hrm-12-*.png` → **8 files** (exit 0 from capture script `png_capture_count=8`).

---

## API preconditions (probe — U65)

| Persona | login | company | leave total | payslip total | pendingAtt | pendingLeave |
|---------|-------|---------|-------------|---------------|------------|--------------|
| `uat.nv0001@xe.vn` | 201 | holding | 27 | 1 | 0 | 0 |
| `uat.nv0002@xe.vn` | 201 | trsport | 1 | 0 | 1 | 1 |

Manager pending ≥1 satisfied for §12.6 approvals screen with **Duyệt** (J-MOB-05 PASS during capture run).

---

## Device commands

```powershell
adb devices
# emulator-5554 device

Get-FileHash -Algorithm SHA256 C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
# 24CDF95FD1F295200BE1D622FC8AE1BC26F90E1D4F732A0E3C8B50F50CD6C55F

adb -s emulator-5554 install -r -g C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk
# Success

$env:HRM_API_BASE='http://14.225.217.232:3001'
$env:ADB_SERIAL='emulator-5554'
node scripts/tmp-qa-hdsd-mob-ch12-r4-device.mjs
# exit 0 · png_capture_count=8
```

---

## Capture flow (FE screens)

1. **12.1** — Cold start login screen (`uat.nv0001` not logged in)
2. **12.2–12.5, 12.7–12.8** — QA deep-link `xevn://qa-login` @ `uat.nv0001` → Home → tab/tile navigation
3. **12.6** — QA deep-link @ `uat.nv0002` (manager) → Profile → Phê duyệt → pending list (+ **Duyệt** exercised)

Screenshot artifacts: `docs/qa/evidence/screenshots/hdsd-uat-mobile-ch12-r4-20260731/`

---

## Side notes (out of FIG exit scope)

| Item | Verdict | Note |
|------|---------|------|
| J-MOB-03 leave detail tap | 🔴 FAIL | Row tap did not open detail — does **not** block FIG deliverable |
| J-MOB-04 payslip detail | 🟢 PASS | List → detail during same run |
| J-MOB-05 manager Duyệt | 🟢 PASS | `pendingAtt=1` · `pendingLeave=1` on trsport |

---

## completion_report

**Closed:** QC R5 condition **C-R2-02** / **C-P2-R3-FIG** — eight mobile HDSD Chapter 12 figures captured from live pilot app on `emulator-5554`, copied to client delivery assets path. No seed, no placeholder PNG. Glob was **0 files** before run; **8/8** after.

**Open (not this WI):** J-MOB-03 leave list→detail regression; optional `hdsd:build` + QC client-final gate for ba-docs.

---

## next_owner

`pm` → **`ba-docs`** (client HDSD rebuild lane)

---

## next_dispatch_prompt

```text
work_item_id: BA-HDSD-CLIENT-REBUILD-CH12-FIG-01
from_role: pm
to_role: ba-docs
program: P-HDSD-ECOSYSTEM-03 · C-R2-02 client-final
entry_criteria:
- QA-DEVICE-HDSD-FIG-CH12-01 PASS — 8/8 hrm-12-*.png at docs/client-delivery/hdsd/assets/hrm/
- evidence: docs/qa/evidence/qa-device-hdsd-fig-ch12-01-20260801.md
exit_criteria:
- Rebuild HDSD HTML/PDF (pnpm run hdsd:build) — confirm [[FIG:…hrm-12-N…]] placeholders resolved (0 "ảnh chưa có")
- Update client artifact HDSD_XEVN_ECOSYSTEM_v1.html + PDF for sponsor review
- ack_status READY_FOR_QC or PASS_TO_PM with rebuild evidence path
cấm: placeholder Phase 2 · false FIG wiring
```

**evidence_path:** `docs/qa/evidence/qa-device-hdsd-fig-ch12-01-20260801.md`

**ack_status:** **PASS_TO_PM**
