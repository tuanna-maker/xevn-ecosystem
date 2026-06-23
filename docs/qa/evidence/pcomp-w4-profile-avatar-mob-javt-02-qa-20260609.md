# PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02-QA — J-AVT-02 device retest

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02-QA` |
| **from_role** | `qa-device` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **device** | `emulator-5554` (Android API 33) |
| **pilot** | `https://14-225-217-232.nip.io` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **APK** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **SHA-256** | `77E6CE34D2A234F8D871A4735E6E6C0329F93F3D407F15DB5193DC7E859A0A2E` (71,782,374 B) |
| **ack_status** | **FAIL_TO_PM** |
| **pm_dispatch_hint** | `dev-mobile` — `PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03`: `ProfileScreen.uploadAndPatchAvatar` passes UUID to upload `company_id` query; nip.io probe `q=6efaa5d6-…4013` → **HRM-FILE-409** *Resource company_id is outside token scope*; must use `holding` slug for query (holding → **201**). Picker fix **PASS** — do not regress `hrmImagePicker.ts`. |

---

## Executive verdict

**FAIL_TO_PM (split)** — Android 13+ **native photo picker fix verified PASS** (wave `PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02` picker layer). **Full J-AVT-02 E2E FAIL** at upload: after photo select + crop, app shows Alert **Lỗi** — *Resource company_id is outside token scope*; `avatar_url` remains null on API; Home greeting not re-tested (blocked by error dialog).

**J-AVT-02 journey map:** **not promoted** — upload/display layer open (**C-W4QC-AVT-MOB-02**).

---

## Commands run

```bash
adb devices                                    # emulator-5554 device
adb shell pm clear vn.xevn.hrm.mobile          # exit 0
adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk  # Success
node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026  # exit 0, home_reached: true
node scripts/tmp-pcomp-w4-javt-02-qa-device.mjs  # exit 1 — upload scope FAIL
```

---

## Step results

| Step | Result | Evidence |
|------|--------|----------|
| APK SHA-256 match | **PASS** | `77E6CE34…A0A2E` |
| Deep-link login | **PASS** | `qa-mobile-login-intent.mjs` exit 0 |
| More → Hồ sơ | **PASS** | `pcomp-w4-javt-02-qa-screens/qa-more-scroll-0.xml` |
| Avatar control `profile-avatar-pick` | **PASS** | `qa-profile-before.xml` · content-desc *Chọn ảnh đại diện* |
| Android Photo Picker opens | **PASS** | `qa-picker.xml` · `package="com.google.android.providers.media.module"` · **Photos** / **Recent** |
| Select photo + crop | **PASS** (UI) | `qa-post-pick.xml` returned to app package |
| Upload + PATCH + display | **FAIL** | Alert: *Resource company_id is outside token scope* · `qa-post-crop.xml` · `qa-javt-02-scope-error.png` |
| API `avatar_url` after test | **FAIL** | before=`null` after=`null` |
| Home greeting avatar reload | **BLOCKED** | Error dialog still visible; `home_greeting` step not reached |

---

## Root cause (upload layer — not picker)

| Layer | Finding |
|-------|---------|
| Device UI | Picker opens on API 33 — **fixes prior C-W4QC-AVT-MOB-01 picker absence** |
| Upload query | `ProfileScreen` uses `auth.getAttendanceCompanyId()` → wire UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` for `POST /files/upload?company_id=` |
| API repro (nip.io, same token) | `company_id=6efaa5d6-…4013` → **409 HRM-FILE-409** *Resource company_id is outside token scope* |
| API repro (correct) | `company_id=holding` + `x-company-id=UUID` → **201 HRM-FILE-201** |
| Wrong slug | `company_id=main` → **409 SCOPE_CONTEXT_MISMATCH** (different message) |

**Classification:** PRODUCT / **dev-mobile** — upload query must use persist slug `holding` for `uat.nv0001@xe.vn` holding token, not legal-entity UUID in query param.

---

## Logcat audit

| Check | Result |
|-------|--------|
| `x-company-id: main` on outbound | **PASS** (not detected) |
| FATAL `vn.xevn.hrm.mobile` | **PASS** (none) |
| ExponentImagePicker FATAL | **PASS** (none) |

---

## Artifacts

| Path | Description |
|------|-------------|
| `docs/qa/evidence/pcomp-w4-javt-02-qa-20260609.json` | Machine verdict JSON |
| `docs/qa/evidence/pcomp-w4-javt-02-qa-screens/qa-picker.xml` | Photo Picker PASS |
| `docs/qa/evidence/pcomp-w4-javt-02-qa-screens/qa-javt-02-scope-error.png` | Upload error Alert screenshot |
| `docs/qa/evidence/pcomp-w4-javt-02-qa-screens/qa-post-crop.xml` | Error dialog XML snippet |
| `docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-02-20260609.md` | Dev READY_FOR_QA handoff |

---

## completion_report

- **Closed (picker wave):** J-AVT-02 Android 13+ permission gate bypass — Photo Picker (`com.google.android.providers.media.module`) opens from More → Hồ sơ → `profile-avatar-pick` on fresh qa-device APK.
- **Closed (install/login):** APK SHA verified; deep-link login PASS; no fatal logcat; no `main` header leak.
- **Open:** Upload → PATCH → Profile display → Home greeting — **FAIL** HRM-FILE-409 scope on `company_id` query UUID vs required `holding` slug.
- **Open:** `PROGRAM_JOURNEY_MAP.md` J-AVT-02 remains 🔴 until upload fix + device re-QA.

## next_owner

`pm` → dispatch `dev-mobile` upload query fix, then `qa-device` re-run J-AVT-02 E2E.

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03
from_role: pm
to_role: dev-mobile
lane: execution
entry_criteria: qa-device FAIL PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02-QA — upload HRM-FILE-409 when company_id query = UUID; holding slug works (API probe in evidence)
action:
1. ProfileScreen.uploadAndPatchAvatar — use holding/persist slug for upload query company_id (not resolveWireCompanyId UUID); keep resolveHrmWriteHeaderId for x-company-id header
2. Unit test: holding token + upload query holding → mocked path; UUID query rejected
3. Rebuild qa-device APK; READY_FOR_QA
exit_criteria: nip.io probe holding upload 201; qa-device J-AVT-02 full E2E PASS
evidence_path: docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-03-20260609.md
pm_dispatch_hint: qa-device retest PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-02-QA on new APK
```

## evidence_path

`docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-02-qa-20260609.md`
