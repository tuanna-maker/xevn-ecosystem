# PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03 — J-AVT-02 upload scope fix

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **pm_dispatch_hint** | `qa-device` J-AVT-02 full E2E retest on new APK |

---

## Executive verdict

**READY_FOR_QA** — Root cause fixed: `ProfileScreen.uploadAndPatchAvatar` used `getAttendanceCompanyId()` (legal UUID) for upload `company_id` query → **HRM-FILE-409**. Now uses `resolveAvatarUploadCompanyId()` → rollup slug `holding` on query; `x-company-id` header remains legal UUID via `resolveHrmWriteHeaderId` (ADR-HRM-RBAC-SCOPE-LADDER / WHOS-OUT-02 pattern). Picker fix (`hrmImagePicker.ts`) **unchanged**.

---

## Root cause (JAVT-02-QA FAIL)

| Layer | Finding |
|-------|---------|
| QA FAIL | After photo pick + crop, Alert *Resource company_id is outside token scope* |
| Wrong wire | `auth.getAttendanceCompanyId()` → UUID `6efaa5d6-…4013` in `POST /files/upload?company_id=` |
| Correct wire | `company_id=holding` + `x-company-id=6efaa5d6-…4013` → **201 HRM-FILE-201** |
| Picker | **PASS** — Android Photo Picker unchanged from JAVT-02 |

---

## Fixes delivered

| File | Change |
|------|--------|
| `src/integrations/companyWireScope.ts` | `resolveAvatarUploadQueryCompanyId()` — delegates to `resolveHomeSummaryQueryCompanyId` (WHOS-OUT-02 membership slug recovery) |
| `src/integrations/hrmFileUpload.ts` | `resolveAvatarUploadCompanyId()` uses slug resolver; `buildAvatarUploadUrl()` for testability; header still `resolveHrmWriteHeaderId` |
| `src/features/profile/ProfileScreen.tsx` | `uploadAndPatchAvatar` uses `resolveAvatarUploadCompanyId(cfg)` instead of `getAttendanceCompanyId()` |
| `src/integrations/__tests__/hrmFileUpload.test.ts` | **New** — query slug vs header UUID split tests |
| `src/integrations/__tests__/companyWireScope.test.ts` | JAVT-03 avatar upload scope test |
| `scripts/tmp-pcomp-w4-javt-03-avatar-upload-probe.mjs` | nip.io scope probe (UUID 409, holding 201) |

**Not changed:** `hrmImagePicker.ts`, `AvatarUploadField.tsx`, `index.ts` boot fix.

---

## Verification

| Check | Command / action | Result |
|-------|------------------|--------|
| Vitest | `pnpm --filter hrm-mobile test` | **198/198 PASS** |
| TypeScript | `pnpm --filter hrm-mobile type-check` | **PASS** |
| nip.io scope probe | `node scripts/tmp-pcomp-w4-javt-03-avatar-upload-probe.mjs` | **PASS** — UUID query 409; holding+UUID header 201 |
| Gradle qa-device APK | `GRADLE_USE_SUBST=1 pnpm run android:apk:qa-device` @ junction | **BUILD SUCCESSFUL** 2m 12s |
| APK artifact | `dist/hrm-mobile-qa-device.apk` | **71,783,351 B** (68.46 MiB) |
| SHA-256 | — | `075DB8E4AC8EA5109977E56E83D419795170DB791C1B709F7E609D4F788EF732` |

### nip.io probe detail (`uat.nv0001@xe.vn`)

```
PASS  mobile login — HTTP 201
PASS  UUID query rejected (HRM-FILE-409) — HTTP 409 HRM-FILE-409
PASS  holding query + UUID header → 201 — HTTP 201 HRM-FILE-201
PASS  upload url present — /api/hrm/files/holding/employee-avatar-…png
```

---

## QA retest scope (J-AVT-02 full journey)

1. Install APK above (SHA `075DB8E4…`); `adb shell pm clear vn.xevn.hrm.mobile` before retest.
2. Login `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io`.
3. More → Hồ sơ → tap avatar → picker opens (regression: `com.google.android.providers.media.module`).
4. Select photo → crop → save → **no scope error**; PATCH `avatar_url` set; profile + Home greeting show photo.
5. Update `PROGRAM_JOURNEY_MAP.md` J-AVT-02 if PASS.

---

## completion_report

- **Closed:** J-AVT-02 upload HRM-FILE-409 — `company_id` query now uses holding rollup slug; `x-company-id` header legal UUID; aligned with WHOS-OUT-02 scope ladder.
- **Closed:** Unit tests for upload URL params (5 tests in `hrmFileUpload.test.ts`); vitest 198/198 + tsc PASS.
- **Closed:** nip.io probe confirms UUID 409 / holding 201; fresh Gradle qa-device APK built.
- **Preserved:** JAVT-02 picker fix (`hrmImagePicker.ts`) untouched.
- **Open (QA):** Device E2E — pick → upload → PATCH → display on Profile + Home greeting.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: PCOMP-W4-PROFILE-AVATAR-MOB-JAVT-03-QA
from_role: qa-device
to_role: pm
lane: execution
entry_criteria: dev-mobile READY_FOR_QA — install apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk SHA 075DB8E4AC8EA5109977E56E83D419795170DB791C1B709F7E609D4F788EF732 on emulator-5554 @ nip.io; adb pm clear before retest
action:
1. J-AVT-02 full E2E: Login uat.nv0001@xe.vn → More → Hồ sơ → tap avatar → picker visible
2. Select photo → crop → save → verify no HRM-FILE-409; avatar_url PATCH; profile + Home greeting display
3. Regression: picker still opens (com.google.android.providers.media.module)
4. Update PROGRAM_JOURNEY_MAP J-AVT-02 if PASS
exit_criteria: evidence docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-03-qa-20260609.md; ack_status PASS_TO_PM or FAIL with layer
evidence_path: docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-03-qa-20260609.md
pm_dispatch_hint: if PASS → promote J-AVT-02 on journey map; if FAIL → dev-mobile residual with layer
```

## evidence_path

`docs/qa/evidence/pcomp-w4-profile-avatar-mob-javt-03-20260609.md`
