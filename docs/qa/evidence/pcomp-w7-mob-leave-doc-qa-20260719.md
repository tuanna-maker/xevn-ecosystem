# PCOMP-W7-MOB-LEAVE-DOC — QA-device retest AC-LEAVE-DOC-01..03

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-LEAVE-DOC` |
| **from_role** | `qa-device` |
| **to_role** | `pm` / `dev-mobile` |
| **date** | 2026-07-19 |
| **ack_status** | **FAIL** |
| **device** | `emulator-5554` (`sdk_gphone64_x86_64` / AVD `xevn_hrm_api33`) |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **API** | `https://14-225-217-232.nip.io` (mobile login **201** `HRM-AUTH-200`) |
| **U65** | zero-seed — no `pnpm seed:*`; no DB fake |

---

## Executive verdict

**FAIL → dev-mobile** — Cannot promote AC-LEAVE-DOC-01..03 for the **2026-07-19** wave.

1. **No wave release APK** — `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` **missing**; Dev-mobile READY_FOR_QA did not publish APK path/SHA.
2. **Installed binary stale** — `vn.xevn.hrm.mobile` `lastUpdateTime=2026-06-16 14:20:01` / `versionName=1.0.0` — predates July leave-doc source delta.
3. On that stale binary: attachment **picker UI** and **detail open** work, but **step-next without attach is not blocked** (advances to Bước 3), contradicting July source `goNext` + D2 claim.

Vitest leave-doc suite (source) **16/16 PASS** — **not** a substitute for device L2.5.

---

## Unit verify (source — not device PASS)

```text
pnpm test:hrm-mobile -- --run src/utils/__tests__/leaveAttachment.test.ts \
  src/integrations/__tests__/hrmFileUpload.test.ts \
  src/components/ui/__tests__/leaveDocUx.test.ts
→ 3 files / 16 tests PASS (2026-07-19 qa-device re-run)
```

---

## Device setup

```powershell
adb devices -l
# emulator-5554 device

adb -s emulator-5554 shell dumpsys package vn.xevn.hrm.mobile
# versionName=1.0.0 · lastUpdateTime=2026-06-16 14:20:01

Test-Path apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk
# False

$env:HRM_API_BASE="https://14-225-217-232.nip.io"
$env:ADB_SERIAL="emulator-5554"
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
# home_reached=true · pass=true · exit 0
```

Screens / XML: `docs/qa/evidence/pcomp-w7-mob-leave-doc-qa-20260719-screens/`

Helper (session): `scripts/tmp-pcomp-w7-leave-doc-device.mjs`

---

## AC matrix (device)

| AC | Requirement | Result | Evidence |
|----|-------------|--------|----------|
| **AC-LEAVE-DOC-01** | Sick → attach PDF/ảnh → Gửi → list→detail → Xem/tải | **FAIL** | Picker **visible** (`leave-attachment-picker`, copy «Bắt buộc…10 MB», `+ Đính kèm ảnh/PDF`) — `w2-sick-selected.xml`. **Tiếp tục without upload advanced to Bước 3** — `bn1-after-next.xml` (`step3:true`). Full multipart upload + Gửi **not executed** (no wave APK; file picker not automated). |
| **AC-LEAVE-DOC-02** | Annual → submit OK without attachment | **INCOMPLETE** | Annual chip path not closed after PDF viewer / uiautomator dump flakiness (`ann0`/`annual-path` errors). |
| **AC-LEAVE-DOC-03** | List → detail → open attachment | **PASS** (stale APK) | Existing Nghỉ ốm row → `d3-detail.xml`: `leave-attachment-open` + **«Xem / tải giấy tờ»**. Tap → hierarchy collapse `08-after-open.xml` **3156 B** (external open). |

### Notes

- Metro **Require cycle** toast (`teamDirectory` ↔ `teamDirectoryDetail`) overlays FAB until dismissed — blocked FAB until tap close.
- Journey map **J-MOB-11** = home portal; leave-doc path = UC-HRM-MOB-06b / SRS J-MOB-11 alias per Dev handoff.

---

## Spec vs device (installed APK)

| Topic | July source / Dev claim | Device (2026-06-16 APK) |
|-------|-------------------------|-------------------------|
| Picker on sick | `LeaveAttachmentPicker` step 2 | **PASS** — picker + required copy |
| Step-next block without URL | `goNext` step===1 → `leaveAttachmentSubmitBlocked` | **FAIL** — advanced to Bước 3 |
| Detail open | `testID=leave-attachment-open` | **PASS** |
| Wave APK | READY_FOR_QA handoff | **MISSING** |

---

## Residual / blockers

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **D-MOB-LEAVE-DOC-APK-01** | P0 | dev-mobile | Build/publish **qa-device release APK** from 2026-07-19 leave-doc tree; path + SHA-256 in evidence; install on emulator |
| **D-MOB-LEAVE-DOC-BLOCK-01** | P0 | qa-device (retest) | After APK: assert Tiếp tục on sick **without** upload stays on Bước 2 + Alert «Đơn nghỉ y tế cần đính kèm…» |
| **D-MOB-LEAVE-DOC-E2E-01** | P1 | qa-device (retest) | Sick: attach image/PDF → Gửi → list→detail → Xem/tải; Annual: Tiếp tục/Gửi without picker |
| **D-MOB-LEAVE-DOC-TOAST-01** | P2 | dev-mobile (optional) | Require-cycle toast blocks FAB; fix cycle or suppress in qa-device builds |

**cấm:** seed; Phase1/PROD claim.

---

## Handoff

```yaml
completion_report: |
  PCOMP-W7-MOB-LEAVE-DOC qa-device FAIL. Vitest leave-doc 16/16 PASS (source only).
  No wave APK in dist/; installed app lastUpdate 2026-06-16.
  On stale APK: sick picker UI PASS; step-next without attach FAIL (reached Bước 3);
  detail «Xem / tải giấy tờ» + leave-attachment-open PASS; annual path INCOMPLETE.
  Cannot PASS_TO_PM / claim AC-LEAVE-DOC-01..03 for July wave.
next_owner: dev-mobile
ack_status: FAIL
evidence_path: docs/qa/evidence/pcomp-w7-mob-leave-doc-qa-20260719.md
next_dispatch_prompt: |
  work_item_id: PCOMP-W7-MOB-LEAVE-DOC-APK
  Operate as dev-mobile.
  entry: U65; source leave-doc READY_FOR_QA already in tree (CreateLeaveRequestScreen goNext block + LeaveAttachmentPicker).
  exit:
    1) BUILD_TARGET=qa-device → apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk + SHA-256
    2) Confirm goNext step-1 blocks without uploadedUrl (jest already covers; no behavior regress)
    3) Hand evidence path + APK path to qa-device for AC-LEAVE-DOC-01..03 full device retest
  evidence_path: docs/qa/evidence/pcomp-w7-mob-leave-doc-apk-20260719.md
  cấm: seed; Phase1/PROD claim
```
