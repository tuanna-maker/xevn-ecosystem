# MOB-UX-12-APK-FREEZE — Canonical qa-device APK (SET G merged)

**work_item_id:** `MOB-UX-12-APK-FREEZE`  
**date:** 2026-06-09  
**owner:** dev-mobile  
**ack_status:** `READY_FOR_QA`  
**spec:** `docs/program/MOBILE_ESS_SECONDARY_SCREEN_POLISH.md` SET G-1..G-4  
**trigger:** Parallel waves 12a/12b/12c/12d produced divergent `dist/hrm-mobile-qa-device.apk` SHA during QA (MOB-UX-12c-QA entry gate FAIL — product PASS, SHA drift).

## Summary

Single **canonical** qa-device APK built from working tree containing **all** MOB-UX-12a + 12b + 12c + 12d code. QA must pin **this** SHA for every SET G retest; dev-mobile **must not** rebuild after QA pins.

## Merged waves (code in tree)

| Wave | SET | Scope | Prior per-wave SHA (superseded) |
|------|-----|-------|----------------------------------|
| MOB-UX-12a | G-1 | `TeamColleagueDetailScreen` hero + sections | `5398508E…3281A8` |
| MOB-UX-12b | G-2 | `TeamDirectoryScreen` rich cards + dept sections | `40C37661…FD474` |
| MOB-UX-12c | G-3 | Profile F-3 hero / metric grid / quick actions / doc cards | `6F2C471C…B88850` |
| MOB-UX-12d | G-4 | Manager/leave/contracts/operations inbox polish | `EE92E718…5CFFEF` |

## Verification gates

| Gate | Command | Result |
|------|---------|--------|
| Unit tests | `pnpm test:hrm-mobile` | **295/295** PASS (55 files) |
| Type-check | `pnpm --filter hrm-mobile run type-check` | exit **0** |
| qa-device APK | `pnpm run android:apk:qa-device` @ `C:\xevn-ecosystem`, `GRADLE_USE_SUBST=1` | BUILD SUCCESSFUL in 2m 3s |
| Cold boot smoke | `node scripts/qa-mobile-login-intent.mjs` | `home_reached: true`; `fatal_logcat: true` (known non-blocking font/push class — same as MOB-UX-12d) |

## Canonical APK artifact (PIN THIS)

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | **68,938,359** bytes (**65.74** MiB) |
| SHA-256 | **`B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA`** |
| BUILD_TARGET | qa-device (`EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1`, `EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1`) |
| Hermes bundle | 5,118,216 B |
| Build host | Windows junction `C:\xevn-ecosystem` → repo root |
| Built UTC | 2026-06-08T14:16:59Z |

### Bundle markers (all SET G present)

Verified strings in `index.android.bundle`:

- `EmployeeHeroCard`, `EmployeeAvatarRing`, `team-colleague-quick-actions` (12a)
- `TeamDirectoryRow`, `team-directory-section` (12b)
- `StatusMetricGrid`, `ProfileQuickActionGrid` (12c)
- `ElevatedCard`, `EssRichListRow`, `ManagerAttendanceCard` (12d)

## QA install / SHA gate

1. `adb install -r apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk`
2. Before device run: `Get-FileHash -Algorithm SHA256 dist/hrm-mobile-qa-device.apk` **must equal** pin above.
3. If SHA mismatch → **STOP** — do not test; request PM (artifact drift).
4. After QA pins SHA → **no dev-mobile rebuild** until next explicit wave.

## Journeys (SET G scope)

| Journey | Screen / flow |
|---------|----------------|
| J-MOB-30 ext | Team directory rich cards → colleague detail hero |
| J-MOB-17 ext | Profile tabs F-3 hero / grid / quick actions / docs |
| J-MOB-23..29 | Manager inbox + leave list elevated rows (12d) |
| J-AVT-02 | Profile avatar upload (12c hero) |

## Residual

- `qa-mobile-login-intent` reports `fatal_logcat: true` (pre-existing; not boot-blocking — `home_reached: true`).
- Team directory flaky under marathon runs noted in MOB-UX-12c-QA — not G-3 blocker.

## completion_report

Closed: unified SET G qa-device APK with 295/295 vitest + tsc PASS; canonical SHA `B8F73859…F3EA` recorded; all 12a–12d bundle markers verified. Residual: known `fatal_logcat` on smoke script only.

## next_owner

`qa` + `qa-device`

## next_dispatch_prompt

QA MOB-UX-12-FREEZE-QA: Install **only** `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` and verify SHA-256 `B8F738596F9D11AFFFE9BD3AE1F92A6E759BE844717B5D617D026DB5D297F3EA` before any SET G device run. Retest J-MOB-30 ext (12a+12b), J-MOB-17 ext (12c), J-MOB-23..29 + manager/contracts/operations (12d) @ `uat.nv0001@xe.vn` / `uat.nv0002@xe.vn` on nip.io. Entry gate: SHA match required; product slices already PASS on drifted builds — confirm no regression on frozen artifact. Do not accept alternate SHA without PM dispatch.

## evidence_path

`docs/qa/evidence/mob-ux-12-apk-freeze-20260609.md`
