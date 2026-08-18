# PCOMP-W7-MOB-LEAVE-COMBO-BUILD — qa-device APK (LEAVE-BAL-02 + LEAVE-DOC-02)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-COMBO-BUILD` (covers `…-LEAVE-BAL-02-BUILD` + `…-LEAVE-DOC-02-BUILD`) |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-28 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — local Hermes/APK only; no store / VPS / :8088 |
| **NOT** | Phase1 DONE / PROD-READY |
| **source waves** | `pcomp-w7-mob-leave-bal-02-20260728.md` · `pcomp-w7-mob-leave-doc-02-20260728.md` |
| **git HEAD (build tree)** | `45208ed7ca34f1511cfcd9c7cda728fe251bf4cf` (`45208ed`) |

---

## Why one APK

LEAVE-DOC-02 landed READY_FOR_QA mid-wave with BAL-02 already READY. Single rebuild from current tree so device QA does not install twice / race stale binary.

| Wave | Must be in binary |
|------|-------------------|
| **LEAVE-BAL-02** | `LeaveBalanceChip` · `testID leave-balance-chip` · `formatLeaveBalanceChipText` · Plane B leave-balance |
| **LEAVE-DOC-02** | `leaveCreateStep1NextBlocked` · `isValidLeaveAttachmentUploadedUrl` · `leaveAttachmentSubmitBlocked` |
| **must_keep** | directory/profile `resolveDirectoryQueryCompanyId` · toast cycle hygiene · leave attach picker |

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (**same SHA**) |
| **Gradle output** | `…\android\app\build\outputs\apk\release\app-release.apk` → copied to dist |
| **Repo-relative** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Bytes** | `71594803` (68.28 MiB) |
| **SHA-256** | `B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31` |
| **mtime** | 2026-07-28 12:05:57 (+07) |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | multi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) |
| **Supersedes** | Profile BUILD `5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184` |

### Binary newer than prior

| Check | Result |
|-------|--------|
| SHA ≠ `5A5F627D…` | **PASS** (`B9DCC6BC…4A31`) |
| mtime 2026-07-28 ~12:05 | **PASS** |
| Bytes ≠ prior `71594850` | **PASS** (`71594803`) |

---

## Bundle audit (Hermes + APK assets)

| Marker | Staged bundle | APK `assets/index.android.bundle` |
|--------|---------------|-----------------------------------|
| `leave-balance-chip` | **True** | **True** |
| `formatLeaveBalanceChipText` | **True** | **True** |
| `LeaveBalanceChip` | **True** | **True** |
| `leaveCreateStep1NextBlocked` | **True** | **True** |
| `isValidLeaveAttachmentUploadedUrl` | **True** | **True** |
| `leaveAttachmentSubmitBlocked` | **True** | **True** |
| `LeaveAttachmentPicker` | **True** | **True** |
| `resolveDirectoryQueryCompanyId` | **True** | **True** |

Hermes bundle: `5,242,488` B · mtime 2026-07-28 12:01:27 (+07).

---

## Build notes

| Item | Status |
|------|--------|
| Junction `C:\xevn-ecosystem` | Present → OneDrive repo |
| Junction `C:\rn74` | Present → react-native 0.74.5 |
| `GRADLE_PATH_RN_DIR` | `C:\rn74` |
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| Result | **BUILD SUCCESSFUL in 4m 41s** · exit 0 · 150 executed / 937 up-to-date |
| Rebuild reason | DOC-02 READY after BAL-02 — prefer one combo binary |

---

## Install (qa-device)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# MUST equal B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31
# MUST ≠ 5A5F627D53C5A4386BBA1A2499F82122F0AA5AF9BDF79214760EFDAD37A89184

adb devices
adb install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb shell pm clear vn.xevn.hrm.mobile
```

Login: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ pilot API (U65 zero-seed).

---

## QA device matrix (U65) — two waves or one session

### A) `PCOMP-W7-MOB-LEAVE-BAL-02-QA` — J-MOB-25 / J-MOB-28

1. My Leaves (J-MOB-25) → FAB **Tạo đơn nghỉ**
2. Wizard **step 0**: assert `leave-balance-chip` text «Còn lại: R / E ngày phép năm Y» (AC-LEAVE-BAL-01) — not «—» on API 200
3. Touch target ≥44px; Network leave-balance `company_id=` slug/main (Plane B)
4. Evidence: `docs/qa/evidence/pcomp-w7-mob-leave-bal-02-qa-20260728.md`

### B) `PCOMP-W7-MOB-LEAVE-DOC-02-QA` — AC-LEAVE-DOC-01..03

1. **AC-LEAVE-DOC-01:** Nghỉ ốm → Bước 2 → Tiếp tục **without** attach → stay Bước 2; `leave-create-next` disabled; Alert đính kèm; then attach PDF/ảnh → Gửi → list→detail → open
2. **AC-LEAVE-DOC-02:** Annual → Tiếp tục/Gửi OK without attachment
3. **AC-LEAVE-DOC-03:** List → detail → `leave-attachment-open`
4. Evidence: `docs/qa/evidence/pcomp-w7-mob-leave-doc-02-qa-20260728.md`

**cấm:** seed; claim on June/stale/`5A5F627D…` APK; Phase1/PROD.

---

## Handoff

```yaml
work_item_id: PCOMP-W7-MOB-LEAVE-COMBO-BUILD
from_role: dev-mobile
to_role: qa-device
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/pcomp-w7-mob-leave-combo-build-20260728.md
apk_path: C:\xevn-apk\hrm-mobile-qa-device.apk
sha256: B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31
completion_report: |
  Rebuilt single qa-device APK from tree with LEAVE-BAL-02 + LEAVE-DOC-02.
  SHA B9DCC6BC… supersedes Profile 5A5F627D….
  Bundle/APK markers True: leave-balance-chip, formatLeaveBalanceChipText,
  leaveCreateStep1NextBlocked, isValidLeaveAttachmentUploadedUrl,
  leaveAttachmentSubmitBlocked, resolveDirectoryQueryCompanyId.
  HOLD_DEPLOY · U65 · NOT Phase1/PROD.
residual: |
  Device L2.5 required for BAL-02 (J-MOB-25/28) and DOC-02 (AC-LEAVE-DOC-01..03)
  before TODO [x]. Same APK for both waves.
next_owner: qa-device
next_dispatch_prompt: |
  Combined leave APK READY. Install C:\xevn-apk\hrm-mobile-qa-device.apk
  SHA-256 B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31
  (must ≠ 5A5F627D…). U65 zero-seed; HOLD_DEPLOY; NOT Phase1/PROD.
  Wave 1 PCOMP-W7-MOB-LEAVE-BAL-02-QA: J-MOB-25/28 — login uat.nv0001@xe.vn →
  My Leaves → FAB Tạo đơn nghỉ → step 0 leave-balance-chip «Còn lại: R / E ngày
  phép năm Y» (AC-LEAVE-BAL-01); evidence
  docs/qa/evidence/pcomp-w7-mob-leave-bal-02-qa-20260728.md.
  Wave 2 PCOMP-W7-MOB-LEAVE-DOC-02-QA: AC-LEAVE-DOC-01..03 — sick block next
  without valid /api/hrm/files/… upload; annual OK without attach; detail open
  attachment; evidence docs/qa/evidence/pcomp-w7-mob-leave-doc-02-qa-20260728.md.
  Or one session covering both. PASS_TO_PM or FAIL + screenshot + pm_dispatch_hint.
```
