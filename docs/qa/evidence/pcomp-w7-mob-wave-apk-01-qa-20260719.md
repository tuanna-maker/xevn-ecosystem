# PCOMP-W7-MOB-WAVE-APK-01-QA — Device L2.5 (consolidated wave APK)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-WAVE-APK-01-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-07-19 |
| **ack_status** | **PASS_TO_PM** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake |
| **prior Dev** | `docs/qa/evidence/pcomp-w7-mob-wave-apk-01-20260719.md` |
| **closes INVALID-HANDOFF** | prior qa-device Task without completion_report |

---

## Executive verdict

**PASS_TO_PM** — Wave APK SHA gate matched; device L2.5 closed for leave-doc, leave-bal, profile ESS, and directory on one install.

| Suite | Result |
|-------|--------|
| leave-doc AC-LEAVE-DOC-01..03 | **PASS** |
| leave-bal J-MOB-25/28 + AC-LEAVE-BAL-01 | **PASS** |
| profile J-MOB-12 (+ phone Lưu) | **PASS** |
| directory J-MOB-16/30 + AC-DIR-01/02 + R1/R2 | **PASS** |
| AC-LEAVE-BAL-02 (approve→refresh drop) | **NOT_TESTED** — residual (needs manager approve path) |

**cấm observed:** no seed; SHA cited; not Phase1/PROD claim.

---

## APK SHA gate

```text
Get-FileHash -Algorithm SHA256 C:\xevn-apk\hrm-mobile-qa-device.apk
SHA-256 = 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79
Bytes   = 66182369

Installed package vn.xevn.hrm.mobile
  versionName=1.0.0
  lastUpdateTime=2026-07-19 15:57:21
  pulled base.apk SHA-256 = same as above
```

Dev SoT: `docs/qa/evidence/pcomp-w7-mob-wave-apk-01-20260719.md`.

---

## Matrix

### 1) leave-doc AC-LEAVE-DOC-01..03

| AC | Expect | Result | Evidence |
|----|--------|--------|----------|
| **AC-LEAVE-DOC-01** | Sick → Tiếp tục without attach stays Bước 2 | **PASS** | `LT-sick` / `LT-block`: `leave-attachment-picker` + Bắt buộc; `leave-create-next` **enabled=false**; stayed Bước 2; alert copy present |
| **AC-LEAVE-DOC-02** | Annual → Tiếp tục OK without attach | **PASS** | `LT-annual` → `LT-annual-next`: advanced (Bước 3 / confirm path); no medical Bắt buộc gate |
| **AC-LEAVE-DOC-03** | List → sick detail → Xem/tải | **PASS** | `K-detail`: `leave-attachment-open` + «Xem / tải giấy tờ»; tap → hierarchy collapse `K-open-after` (external open) |

Click path: Home → Nghỉ phép → FAB Thao tác nhanh → Tạo đơn nghỉ → Bước 1 Tiếp tục → Nghỉ ốm → (blocked) → Nghỉ phép năm → Tiếp tục; then list → Nghỉ ốm row → open attachment.

### 2) leave-bal J-MOB-25/28

| ID | Expect | Result | Evidence |
|----|--------|--------|----------|
| **J-MOB-25** | My Leaves balance header | **PASS** | `LT-list`: `leave-balance-header` · Kỳ nghỉ **2026** · Còn lại **8** · Đã dùng **3** |
| **J-MOB-28** | Wizard LeaveBalanceChip SRS copy | **PASS** | `LT-wizard`: `leave-balance-chip` · **«Còn lại: 8 / 12 ngày phép năm 2026»** |
| **AC-LEAVE-BAL-01** | Chip ≠ «—» when API 200 | **PASS** | Same chip copy |
| **AC-LEAVE-BAL-02** | After approve remaining drops | **NOT_TESTED** | Residual — manager approve + refresh not in this wave |

### 3) profile J-MOB-12

| Step | Result | Evidence |
|------|--------|----------|
| Hồ sơ → Thông tin → `dynamic-profile-form` | **PASS** | `K-pinfo` / `F-edit`: `dynamic-profile-form`; Mã nhân sự **HLD-0001** readonly section |
| Cập nhật liên hệ → SĐT → Lưu | **PASS** | `F-after-type` → `profile-ess-save` → `F-saved` / `R2a`: Alert **«Thành công»** · **«Đã cập nhật thông tin liên hệ.»** |
| Phone PATCH 403 (pre-R1) | **CLOSED** on device | Self-patch Option A / R1 BE — device expects 2xx; observed success toast |

### 4) directory J-MOB-16/30

| ID | Result | Evidence |
|----|--------|----------|
| **J-MOB-16** list | **PASS** | Team tab · Ban Điều hành · rows |
| **J-MOB-30** row→detail | **PASS** | `K-dir-detail` / row HLD-0091 · Email/Liên hệ/Công việc fields |
| **AC-DIR-01** search Nguyễn | **PASS** | `K-dir-search` |
| **AC-DIR-02** detail | **PASS** | row→detail |
| **R1** 1-char | **PASS** | `K-dir-r1` list still populated |
| **R2** empty copy | **PASS** | `R2f`: query `ZzzNoMatch999` · `team-directory-empty` · **«Không tìm thấy nhân viên»** · Tất cả **(0)** |

---

## Device / commands (summary)

```powershell
Get-FileHash -Algorithm SHA256 C:\xevn-apk\hrm-mobile-qa-device.apk
# = 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79

adb -s emulator-5554 install -r C:\xevn-apk\hrm-mobile-qa-device.apk
adb -s emulator-5554 shell pm grant vn.xevn.hrm.mobile android.permission.ACCESS_FINE_LOCATION
# + COARSE / POST_NOTIFICATIONS / CAMERA / READ_MEDIA_IMAGES

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true (ignore RN IllegalViewOperationException logcat noise)

node scripts/tmp-wave-apk-leave-retest.mjs
node scripts/tmp-wave-apk-compact.mjs   # profile+dir portion
node scripts/tmp-wave-apk-final-pr.mjs  # phone Lưu
node scripts/tmp-wave-apk-r2-only.mjs   # R2 empty copy
```

Screens / XML / JSON: `docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qa-20260719-screens/`  
Key keepers: `LT-list*`, `LT-wizard*`, `LT-sick*`, `LT-block*`, `LT-annual*`, `K-detail*`, `K-pinfo*`, `F-saved*`, `R2f*`, `leave-retest.json`, `r2-final.json`.

---

## Residual

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **AC-LEAVE-BAL-02** | P2 | qa-device (optional) | Approve 3d leave → refresh remaining — not exercised this wave |
| **D-MOB-REQUIRE-CYCLE-TOAST** | P2 | dev-mobile | Require-cycle toast overlays FAB until dismissed — flaky automation only |
| **uiautomator flakiness** | P3 | qa-device | Occasional dump OOM on API33 — compressed dump + retries used |

---

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-WAVE-APK-01-QA PASS_TO_PM. Closed INVALID-HANDOFF with full evidence md.
  SHA-256 9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79 verified on C:\xevn-apk and installed base.apk.
  Device uat.nv0001@xe.vn @ nip.io (U65 zero-seed):
  - AC-LEAVE-DOC-01..03 PASS (sick block + annual OK + attachment open)
  - J-MOB-25/28 + AC-LEAVE-BAL-01 PASS (header 8/3; chip «Còn lại: 8 / 12 ngày phép năm 2026»)
  - J-MOB-12 PASS (dynamic-profile-form + phone Lưu success toast — BE R1 self-patch CLOSED on device)
  - J-MOB-16/30 + AC-DIR-01/02 + R1/R2 PASS (empty «Không tìm thấy nhân viên»)
  Residual: AC-LEAVE-BAL-02 NOT_TESTED; require-cycle toast P2.
  No seed. No Phase1/PROD claim.
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qa-20260719.md
next_dispatch_prompt: |
  work_item_id: PCOMP-W7-MOB-WAVE-APK-01-QC
  Operate as qc.
  entry: qa-device PASS_TO_PM evidence docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qa-20260719.md
  exit: GO or GWC; cite SHA; audit leave-doc/bal/profile/dir matrices; residual AC-LEAVE-BAL-02 optional
  cấm: seed; Phase1/PROD claim without program gate
pm_dispatch_hint: Task qc PCOMP-W7-MOB-WAVE-APK-01-QC — scoped GO/GWC on wave APK SHA
```
