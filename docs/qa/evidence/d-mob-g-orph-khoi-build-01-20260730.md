# D-MOB-G-ORPH-KHOI-BUILD-01 — qa-device APK (Plane A label fix)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-MOB-G-ORPH-KHOI-BUILD-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-30 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **HOLD_DEPLOY** | yes — local Hermes/APK only; no store / VPS / :8088 |
| **NOT** | Phase1 DONE / PROD-READY |
| **source wave** | `docs/qa/evidence/d-mob-g-orph-khoi-01-20260730.md` |
| **git HEAD (build tree)** | `45208ed7ca34f1511cfcd9c7cda728fe251bf4cf` (`45208ed`) |

---

## Why rebuild

qa-device R1 (`QA-MOB-G-ORPH-KHOI-01-R1`) installed APK SHA `B9DCC6BC…` built **2026-07-28** — bundle lacked `D-MOB-G-ORPH-KHOI-01` resolver symbols (`isPilotKhoiFictionLabel`, `PLANE_A_COMPANY_LABELS`, `resolveCompanyDisplayVi`). Source fix merged 2026-07-30; fresh binary required before AC-MOB-LABEL-01..07 device retest.

| Wave | Must be in binary |
|------|-------------------|
| **D-MOB-G-ORPH-KHOI-01** | `isPilotKhoiFictionLabel` · `PLANE_A_COMPANY_LABELS_FALLBACK` · `sanitizeOperatingUnitDisplayLabel` · `resolveCompanyDisplayVi` §5.3 |
| **must_keep** | JWT scope wire · Plane B′ UUID map · leave-bal/doc/directory markers from prior combo APK |

---

## APK publish (canonical)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (**same SHA**) |
| **Gradle output** | `…\android\app\build\outputs\apk\release\app-release.apk` → copied to dist |
| **Repo-relative** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Bytes** | `71596189` (68.28 MiB) |
| **SHA-256** | `5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895` |
| **mtime** | 2026-07-30 17:09:31 (+07) |
| **BUILD_TARGET** | `qa-device` (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| **ABI** | multi (`arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64`) |
| **Supersedes** | LEAVE combo BUILD `B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31` (2026-07-28) |

### Binary newer than prior

| Check | Result |
|-------|--------|
| SHA ≠ `B9DCC6BC…4A31` | **PASS** (`5119B959…8895`) |
| mtime 2026-07-30 ~17:09 | **PASS** |
| Bytes ≠ prior `71594803` | **PASS** (`71596189`) |

---

## Bundle audit (Hermes + APK assets)

| Marker | Staged bundle | APK `assets/index.android.bundle` |
|--------|---------------|-----------------------------------|
| `isPilotKhoiFictionLabel` | **True** | **True** |
| `PLANE_A_COMPANY_LABELS` | **True** | **True** |
| `resolveCompanyDisplayVi` | **True** | **True** |
| `sanitizeOperatingUnitDisplayLabel` | **True** | **True** |

Hermes bundle: `5,244,204` B · mtime 2026-07-30 17:07:18 (+07).

Prior stale APK (R1): grep **no matches** for above symbols — **fixed in this build**.

---

## Pre-build verification

```text
cd apps/mobile/hrm-mobile
pnpm exec vitest run \
  src/utils/__tests__/companyDisplayVi.test.ts \
  src/utils/__tests__/scopeScreenCopy.test.ts \
  src/integrations/__tests__/hrmOperatingUnits.test.ts
# → 3 files, 28 tests passed
```

---

## Build notes

| Item | Status |
|------|--------|
| Junction `C:\xevn-ecosystem` | Present → OneDrive repo |
| Junction `C:\rn74` | Present → react-native 0.74.5 |
| `GRADLE_PATH_RN_DIR` | `C:\rn74` |
| `GRADLE_USE_SUBST` | `1` |
| Command | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem\apps\mobile\hrm-mobile` |
| Result | **BUILD SUCCESSFUL in 2m 24s** · exit 0 · 57 executed / 1030 up-to-date |

---

## Install (qa-device)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# MUST equal 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895
# MUST ≠ B9DCC6BC948A26F1B35FEADE01F84BB184CE5B333E35DBBEB6C66E100A644A31

adb devices
adb install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb shell pm clear vn.xevn.hrm.mobile
```

Login (U65 zero-seed): `ceo@xe.vn` / `Xevn@2026` when auth unblocked · or `uat.nv0001@xe.vn` / `xevn-uat-2026` @ pilot API.

**Pre-requisite:** `D-BE-MOB-AUTH-CEO-HASH-01` — mobile login must return **200** post tenant-master reset before label ACs can run.

---

## completion_report

**Closed:**

- Fresh qa-device APK built from tree containing `D-MOB-G-ORPH-KHOI-01`.
- Published to `dist/` + `C:\xevn-apk\` twin (same SHA).
- Bundle audit confirms resolver symbols embedded in APK (R1 stale-bundle gap closed).
- Vitest 28/28 scoped pre-build; HOLD_DEPLOY respected.

**Residual:**

- **Auth blocker (BE):** R1 documented `HRM-AUTH-401` for `ceo@xe.vn` post-reset — qa-device R2 still needs BE fix before U65 Scope/Settings/Home paths.
- **BE OU source:** If live `GET /operating-units` returns Khối fiction, mobile sanitizes on normalize; BE cleanup remains optional (`D-HRM-EMP-COL-BE`).

---

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: QA-MOB-G-ORPH-KHOI-01-R2
from_role: pm
to_role: qa-device
entry_criteria: APK SHA 5119B9592EAAE3998EDF52DC16500B2A741D89C130E7F36E278EBA7EFE6B8895 installed (C:\xevn-apk\hrm-mobile-qa-device.apk); emulator-5554 or physical device; L0 qc:dev-stack PASS; mobile login 200 for in-scope persona (ceo@xe.vn or uat.nv0001@xe.vn) — if still 401 dispatch BE first, do not fake PASS
exit_criteria: U65 FE path Scope → Settings → Home → Payslip; grep UI dumps / screenshots — zero «Khối … X.E» on company-semantics surfaces (AC-MOB-LABEL-01..07 per docs/qa/evidence/ba-mob-orph-khoi-label-01-20260730.md §7); bundle already verified — device UI is gate; ack_status PASS_TO_PM or FAIL_TO_PM with evidence
cấm: pnpm seed:* · probe-only UF 🟢
evidence_path: docs/qa/evidence/qa-mob-g-orph-khoi-01-r2-20260730.md
HOLD_DEPLOY · no prod
```

## evidence_path

`docs/qa/evidence/d-mob-g-orph-khoi-build-01-20260730.md`
