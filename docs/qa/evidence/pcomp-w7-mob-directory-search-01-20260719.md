# PCOMP-W7-MOB-DIRECTORY-SEARCH-01 — Directory search AC-DIR-01 / R2

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-MOB-DIRECTORY-SEARCH-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-07-19 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **Prior FAIL** | `docs/qa/evidence/pcomp-w7-mob-wave-apk-01-qa-20260719.md` (SHA `9C346CA3…5C79`) |

---

## Root cause

`TeamDirectoryScreen` passed `''` into `applyTeamDirectoryFilters` (comment: «server already applied `q`») and relied on `useFocusEffect` alone to reload. On device, typing ≥2 chars updated the TextInput but **list rows + chip «Tất cả (213)» stayed unchanged**, and `ZzzNoMatch999` never showed `team-directory-empty` / «Không tìm thấy nhân viên».

---

## Fix (source)

| File | Change |
|------|--------|
| `apps/mobile/hrm-mobile/src/utils/teamDirectory.ts` | `foldDirectorySearchText` (NFD strip) — ASCII `Nguyen` matches `Nguyễn`; used by `filterTeamDirectoryBySearch` |
| `apps/mobile/hrm-mobile/src/features/team/TeamDirectoryScreen.tsx` | Client filter: `applyTeamDirectoryFilters(members, filter, debouncedSearch)`; chip counts from search-filtered set; dedicated `useEffect` reload on `debouncedSearch`; `@CODE-MEMORY-CHANGE` |
| Tests | `teamDirectory.test.ts` AC-DIR-01 fold + R2 empty; `teamDirectoryUx.test.ts` asserts `debouncedSearch` wired |

**must_keep (untouched):** leave-doc attach gate, leave-bal chip, J-MOB-12 profile, list→detail J-MOB-16/30 navigation.

---

## Unit verify

```text
pnpm --filter hrm-mobile exec vitest run \
  src/utils/__tests__/teamDirectory.test.ts \
  src/components/ui/__tests__/teamDirectoryUx.test.ts \
  src/integrations/__tests__/hrmTeamDirectory.test.ts
→ 3 files / 23 tests PASS
```

---

## APK publish (REQUIRED — new SHA)

| Field | Value |
|-------|-------|
| **Absolute path (junction)** | `C:\xevn-ecosystem\apps\mobile\hrm-mobile\dist\hrm-mobile-qa-device.apk` |
| **Absolute path (ASCII twin)** | `C:\xevn-apk\hrm-mobile-qa-device.apk` (**same SHA**) |
| **Repo-relative** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| **Bytes** | `71591235` (68.27 MiB) |
| **SHA-256** | `D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201` |
| **mtime** | 2026-07-19 (rebuild after focus/search race polish) |
| **BUILD_TARGET** | `qa-device` |
| **Supersedes** | FAIL SHA `9C346CA333BBF9770125A620EB702CF4D89DFF7C7EEEE1F6A67558BEC4715C79`; interim rebuild `D70A2AFE…4763` |

### Bundle markers (Hermes string table / ASCII identifiers)

| Marker | Present |
|--------|---------|
| `foldDirectorySearchText` | **True** |
| `applyTeamDirectoryFilters` | **True** |
| `loadTeamDirectoryWithAttendance` | **True** |
| `leave-balance-chip` / `LeaveBalanceChip` / `leaveAttachmentSubmitBlocked` | **True** (must_keep) |
| `dynamic-profile-form` | **True** (must_keep) |

### Install (qa-device)

```powershell
Get-FileHash -Algorithm SHA256 "C:\xevn-apk\hrm-mobile-qa-device.apk"
# MUST equal D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201

adb -s emulator-5554 uninstall vn.xevn.hrm.mobile
adb -s emulator-5554 install -r -g "C:\xevn-apk\hrm-mobile-qa-device.apk"
adb -s emulator-5554 shell pm clear vn.xevn.hrm.mobile
```

Login: `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io` (U65 zero-seed).

---

## QA scope (AC-DIR-01 / R2 only)

| ID | Pass when |
|----|-----------|
| **AC-DIR-01** | Type ≥2 chars (e.g. `Nguyen` / `HLD-0091`) → chip total **changes** from baseline; visible rows filter |
| **R2** | `ZzzNoMatch999` → `testID=team-directory-empty` + copy «Không tìm thấy nhân viên» |
| **Regression smoke** | Optional 30s: one list→detail tap still opens colleague (must_keep J-MOB-30) — not full leave/profile retest |

**cấm:** seed; PASS on old SHA `9C346CA3…` or interim `D70A2AFE…`; Phase1/PROD claim.

---

## completion_report

- **Closed:** AC-DIR-01/R2 source fix (client accent-fold filter + search `useEffect` reload + focus/search race polish); vitest 23/23 scoped; qa-device APK rebuilt and published with **new SHA** `D1E095F3…E201` (twins dist + `C:\xevn-apk`).
- **Residual:** Device L2.5 AC-DIR-01/R2 still required on new SHA; leave-doc/bal/profile already PASS on prior install — do not re-fail those unless regression observed.
- **APK rebuild:** **Required** — prior FAIL SHA must not be retested.

## next_owner

`qa-device`

## next_dispatch_prompt

```text
work_item_id: PCOMP-W7-MOB-DIRECTORY-SEARCH-01-QA
Operate as qa-device.
entry: U65 zero-seed; install NEW APK only
  SHA256 D1E095F32F737617D2FD0A347B91E6BDADCDD708A4DAB2A378F5933A9AAFE201
  path C:\xevn-apk\hrm-mobile-qa-device.apk
  account uat.nv0001@xe.vn @ https://14-225-217-232.nip.io
  pm clear after install
exit (AC-DIR-01 / R2 only):
  1) Search ≥2 chars (Nguyen or HLD-0091) → chip/total + rows change vs baseline
  2) ZzzNoMatch999 → team-directory-empty + «Không tìm thấy nhân viên»
  3) Optional smoke: one list→detail still opens (J-MOB-30 must_keep)
cấm: seed; retest old SHA 9C346CA3…; full leave/profile re-suite unless regression
evidence_path: docs/qa/evidence/pcomp-w7-mob-directory-search-01-qa-20260719.md
```
