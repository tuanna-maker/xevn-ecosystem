# Evidence — W1-B-04-AUTH-MOB-BUILD-01

| Field | Value |
| --- | --- |
| **work_item_id** | W1-B-04-AUTH-MOB-BUILD-01 |
| **role** | dev-mobile |
| **date** | 2026-08-03 |
| **window** | 20:36 → 21:08 +07:00 |
| **J-*** | **J-MOB-01** / FR-UC-M01 |
| **hdsd_align** | true — Login → Hồ sơ → Cài đặt → Phạm vi công ty |
| **U65** | **PASS** — no `pnpm seed:*`, no DB/API fake mutate |
| **persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **device** | `emulator-5554` |
| **API** | `http://10.0.2.2:28001` (adb reverse → host `:28001`) |
| **exit_option** | **B** — build+install qa-device APK with W1-B-04 sources |
| **ack_status** | **READY_FOR_QA** |

## Artifact

| Item | Value |
| --- | --- |
| APK | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Twin | `C:\xevn-apk\hrm-mobile-qa-device.apk` |
| SHA256 | `E71EC1AB2AD4F0740949CC33014D95F9DEB251CA9C81FF5734FF0BB3230A0758` |
| Size | 71 601 145 bytes (68.28 MB) |
| Installed | `vn.xevn.hrm.mobile` · `lastUpdateTime=2026-08-03 20:56:48` |
| Supersedes | QA-R2 stale APK `lastUpdateTime=2026-07-31 10:35:31` |

## Build notes (Option B)

1. Restored missing on-disk modules blocking Metro `export:embed` (junction ASCII `C:\xevn-ecosystem` + `GRADLE_PATH_RN_DIR=C:\rn74`):
   - `src/theme/Theme.tsx`
   - `src/integrations/normalizeHrmBaseUrl.ts`
   - profile/leave helpers + `res/xml/network_security_config.xml`
2. `pnpm android:apk:qa-device` → **BUILD SUCCESSFUL**
3. `adb -s emulator-5554 install -r` → Success
4. Bundle markers: `scope-active-company-label=True`, `Tenant key` present (debug meta), stale UI string `Tenant:` (colon label) **absent**

## Device verify (U65 FE flow)

Click path: Login (password) → Home → Hồ sơ → Cài đặt → scroll → **Phạm vi công ty**

### Scope «Đang dùng» (AC2)

| Line | Device text | Verdict |
| --- | --- | --- |
| Công ty | `Tập đoàn X.E` (`company_label`) | ✅ |
| Pháp nhân | `Tập đoàn XeVN` (`tenant_label`) | ✅ |
| Vai trò | `Nhân viên` (`role_label`) | ✅ |
| Chức danh | `Nhân viên` (`job_title_label`) | ✅ |
| Stale `Tenant: xevn` | **not shown** | ✅ closed vs QA-R2 |

Screenshot: `docs/qa/evidence/screenshots/w1b-04-auth-mob-build-01-scope.png`  
Labels dump: `docs/qa/evidence/screenshots/w1b-04-auth-mob-build-01-scope-labels.txt`

### Unit tests

- `membershipDisplay.test.ts` — 3/3 PASS
- `qaLoginDeepLink.test.ts` — 7/7 PASS (incl. W1-B-04 label map)

## Source deltas (this wave)

| Path | Change |
| --- | --- |
| Restored Theme / normalizeHrmBaseUrl / network_security_config / profile helpers | Unblock APK build |
| `qaLoginDeepLink.ts` + `scripts/qa-mobile-login-intent.mjs` | ADD optional `*_label` query params for QA deep-link (password path already binds via `signInWithMobileLogin`) |
| must_keep | Auth label bind from W1-B-04-AUTH-MOB (`membershipDisplay` / ScopeScreen) |

> Note: Installed APK **E71EC1AB** includes Scope four-label UI + password bind. Deep-link `*_label` query wire is in **source**; if QA-R3 uses `qa-mobile-login-intent`, prefer **password UF** on this APK, or request a follow-up APK rebuild that embeds the deep-link label params.

## Residual

| id | Note | Owner |
| --- | --- | --- |
| W1-B-04-AUTH-MOB-QA-R3 | Retest AC2–4 on emulator-5554 with this APK SHA; `test_log` md+json; anti_idle; hdsd_align | **qa-device** |
| R-M01-MULTI-PERSONA | AC1 toast / AC4 JWT switch still need multi-membership persona (U65 no seed) | pm / BA |
| DEEP-LINK-LABEL-APK | Optional rebuild if R3 insists on deep-link-only login | dev-mobile |

## completion_report

Closed: Stale 2026-07-31 APK replaced by qa-device APK **E71EC1AB…** (2026-08-03 20:56:48) on `emulator-5554`. Scope «Đang dùng» shows **Công ty / Pháp nhân / Vai trò / Chức danh** from BE labels (not raw `Tenant: xevn`). Password login UF verified. U65 honored. READY_FOR_QA.

## next_owner

**qa-device** — W1-B-04-AUTH-MOB-QA-R3

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-MOB-QA-R3
role: qa-device
priority: P0
mission: Retest W1-B-04-AUTH-MOB on emulator-5554 with APK SHA256 E71EC1AB2AD4F0740949CC33014D95F9DEB251CA9C81FF5734FF0BB3230A0758 (lastUpdateTime 2026-08-03 20:56:48). Confirm Scope «Đang dùng» shows company_label/tenant_label/role_label/job_title_label (not Tenant:xevn/holding).
entry_criteria:
  - docs/qa/evidence/w1b-04-auth-mob-build-01.md READY_FOR_QA
  - APK apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk installed (or reinstall -r)
  - emulator-5554 + hrm :28001 L0
  - U65 zero-seed; prefer password login UF (not deep-link-only)
exit_criteria:
  - case_matrix AC2 PASS with screenshots
  - test_log md+json under docs/qa/evidence/
  - anti_idle + hdsd_align true
  - ack_status PASS_TO_PM or FAIL_TO_PM
evidence_path: docs/qa/evidence/w1b-04-auth-mob-qa-r3.md
```

## ack_status

**READY_FOR_QA**
