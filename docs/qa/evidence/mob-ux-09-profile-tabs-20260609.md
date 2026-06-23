# MOB-UX-09-PROFILE-TABS — Profile segmented tabs (ZenHR Z-P05/P06)

| Field | Value |
|-------|-------|
| work_item_id | MOB-UX-09-PROFILE-TABS |
| date | 2026-06-09 |
| owner | dev-mobile |
| ack_status | **READY_FOR_QA** |
| spec | `docs/program/MOBILE_HRM_ESS_UX_BENCHMARK.md` SET E §4.5, Z-P06 |
| journey | J-MOB-17 (ESS profile) |
| persona | uat.nv0001@xe.vn |
| api_base | https://14-225-217-232.nip.io |
| prior_baseline_sha | `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED` (R-DIR-DETAIL-01) |

## Scope closed

| AC | Result |
|----|--------|
| Segmented tabs **Thông tin / Công việc / Tài liệu** | **PASS** — `SegmentedTabBar` + `PROFILE_TAB_OPTIONS` |
| Grouped list sections per tab | **PASS** — `SurfaceCard` + `DetailRow` sections |
| No raw ISO/seed codes on UI | **PASS** — `sanitizeProfileDisplay`, `formatHrmDate`, `resolveRoleSubtitle`, `statusLabel` |
| Profile current task card (progress + priority) | **PASS** — `ProfileTaskCard` from pending leave/update |
| Avatar upload preserved (J-AVT-02) | **PASS** — unchanged upload path on Thông tin tab |
| Vitest + tsc | **PASS** 258/258, tsc exit 0 |
| qa-device APK rebuild + cold boot smoke | **PASS** |

## Implementation

| File | Change |
|------|--------|
| `src/utils/profileTabs.ts` | Tab keys, section builders, display sanitizers |
| `src/utils/profileTask.ts` | Current task resolver from pending leave/update |
| `src/components/profile/ProfileTaskCard.tsx` | Progress bar + priority badge card |
| `src/features/profile/ProfileScreen.tsx` | Segmented tabs, hero name/role, tab-specific grouped content |
| `src/utils/__tests__/profileTabs.test.ts` | 13 unit tests |

## Tab content map

| Tab | Sections |
|-----|----------|
| **Thông tin** | Avatar upload, Liên hệ (email, mã NV), Cập nhật hồ sơ (họ tên, chức danh) |
| **Công việc** | Nhiệm vụ hiện tại (task card), Thông tin công việc (chức danh, phòng ban, trạng thái, ngày vào) |
| **Tài liệu** | Phiếu lương gần đây, Hợp đồng lao động (formatted dates + status) |

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test` @ `apps/mobile/hrm-mobile` | **258/258** PASS |
| Type-check | `pnpm run type-check` | exit **0** |
| qa-device APK | `GRADLE_USE_SUBST=1 pnpm run android:apk:qa-device` (junction `C:\xevn-ecosystem`) | BUILD SUCCESSFUL |
| Cold boot smoke | `node scripts/qa-mobile-login-intent.mjs` | `home_reached: true`, `fatal_logcat: false`, exit **0** |

### APK artifact

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 68,862,131 bytes (~65.7 MiB) |
| SHA-256 | `667E4E9B009B91E499FA8A0565D1AE3D88EA031BDE6D09DAA0AEEF766D761D8B` |
| BUILD_TARGET | qa-device (`QA_DEV_LOGIN=1`, `QA_DEEP_LINK=1`) |

## QA focus (device)

1. Tab **Hồ sơ** → segmented control visible with 3 tabs.
2. **Thông tin** — avatar tap/upload (J-AVT-02 regression), email read-only, save họ tên.
3. **Công việc** — task card if pending leave/update; job fields show Vietnamese labels (not `engineer` / `active`).
4. **Tài liệu** — payslip rows with VND format; contract dates `dd/MM/yyyy` not ISO.
5. `testID`: `profile-tab-bar`, `profile-tab-info`, `profile-tab-work`, `profile-tab-documents`, `profile-task-card`.

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| MOB-UX-09 tab IA relabel (Phiếu lương tab root) | dev-mobile backlog | Separate work item if not yet dispatched |
| Documents tab deep link → PayslipDetail | optional polish | Rows display-only in this wave |
| Manager persona task card | QA | uat.nv0001 employee slice primary |

## Handoff

- **next_owner:** qa-device
- **ack_status:** READY_FOR_QA
