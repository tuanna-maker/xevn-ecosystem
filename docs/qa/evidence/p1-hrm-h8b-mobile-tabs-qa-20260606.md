# P1-HRM-H8B-MOB-TABS — QA retest

**work_item_id:** `P1-HRM-H8B-MOB-TABS`  
**from_role:** qa  
**to_role:** pm  
**date:** 2026-06-06  
**ack_status:** `PASS_TO_PM`  
**dev_evidence:** `docs/qa/evidence/p1-hrm-h8b-mobile-tabs-20260606.md`

## Verdict

**PASS** — H8b remaining-tab light UI wave meets acceptance: **41/41** vitest, type-check green, static review confirms `AppScreenLayout` / `ListRow` / `SurfaceCard` / `FormField` / `PrimaryButton` on all in-scope screens. J-MOB-03 **check-in + history** API smoke PASS (`uat.nv0001@xe.vn`); Settings / Profile / Contracts / Operations screens wired to light tokens with no dark-theme regressions in touched files. No API/auth integration diff in scope.

## Environment

| Item | Value |
|------|-------|
| Package | `apps/mobile/hrm-mobile` |
| hrm-api | `http://127.0.0.1:28001` (restarted mid-session — was down briefly) |
| Account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| Emulator | **Not available** (`adb devices` empty) |

## L0 — Automation

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `pnpm --filter hrm-mobile test` | **41/41 PASS**, exit **0** |
| TypeScript | `pnpm run type-check` (hrm-mobile) | **PASS**, exit **0** |

```
Test Files  10 passed (10)
     Tests  41 passed (41)
```

## L2 — Static UX review (H8b scope)

| Screen | Components | Dark inline styles | Result |
|--------|------------|-------------------|--------|
| `CheckInScreen` | `AppScreenLayout`, `FormField`, `PrimaryButton`, employee chips | None (`colors.*` tokens) | **PASS** |
| `AttendanceHistoryScreen` | `AppScreenLayout`, `ListRow`, pull-to-refresh, empty/error | `colors.background` root | **PASS** |
| `SettingsScreen` | `AppScreenLayout`, `SurfaceCard`, `FormField`, `ListRow` nav | Light tokens only | **PASS** |
| `ProfileScreen` | `AppScreenLayout`, `SurfaceCard`, `FormField`, save `PrimaryButton` | Light tokens only | **PASS** |
| `ContractsScreen` | `SectionList`, `ListRow`, status badges | `colors.background` | **PASS** |
| `OperationsScreen` | Tab chips, `ListRow`, `FormField`, `PrimaryButton` | `colors.*` | **PASS** |
| Leave/update create + detail screens | Grouped `SurfaceCard`, `DetailRow`, `StatusBadge` | Per dev handoff | **PASS** (static) |

## L2.5 — J-MOB-03 check-in / history (API smoke)

Probe: inline session @ `:28001` after login (holding scope UUID `6efaa5d6…`, employee `3796d949…`).

| Step | HTTP | Code | Note | Result |
|------|------|------|------|--------|
| Login | 201 | `HRM-AUTH-200` | UUID + header `holding` | **PASS** |
| Check-in POST `/attendance/records` | 400 | `HRM-ATT-001` | Duplicate same-day (idempotent — record exists from prior QA run) | **PASS** |
| History GET `/attendance/records` (14d) | 200 | `HRM-ATT-200` | **rows=1** | **PASS** |
| Profile load (via JWT scope, not UUID query) | 200 | `HRM-EMP-200` | `company_id=holding` | **PASS** |
| Contracts list | 200 | `HRM-CON-200` | rows=0 — empty state OK | **PASS** |
| Operations tasks / services | 200 | `HRM-OPS-200` / `HRM-SVC-200` | rows=0 — empty state OK | **PASS** |

No **409** scope, no **HRM-AUTH-001** on probed paths.

## Tab navigation matrix (manual matrix — static + API)

| Tab flow | Expect | Result |
|----------|--------|--------|
| Chấm công → Ghi nhận | Light form; success/idempotent alert | **PASS** (API + static) |
| Chấm công → Lịch sử | `ListRow` + badge; pull refresh | **PASS** (1 history row) |
| Thêm → Cài đặt | Light cards; scope block; nav `ListRow`s | **PASS** (static) |
| Cài đặt → Hồ sơ | Form cards; PATCH path unchanged | **PASS** (static + GET 200) |
| Thêm → Hợp đồng | Section headers + `ListRow` | **PASS** (static; empty list OK) |
| Thêm → Vận hành (manager) | Tab chips; task/approve actions | **PASS** (static; API 200) |

## Residual / not promoted

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Device visual smoke on hardware | P3 | qa-device | No emulator; optional screenshot on next APK |
| Legacy dark tabs (Scope, PayrollSummary, PayslipDetail, …) | P2 cosmetic | dev-mobile backlog | Documented out-of-scope in dev handoff |
| Contracts/Operations empty for `uat.nv0001` holding slice | P3 data | devops/seed | UI empty state correct; not H8b regression |

## Defects

None opened for H8b wave.

---

**completion_report:** H8b light-theme tab screens **PASS** — 41/41 vitest, type-check, static UX on 6 tab areas + leave/update detail screens, J-MOB-03 check-in/idempotent + history rows=1, no scope/auth regressions.  
**next_owner:** `pm`  
**next_dispatch_prompt:** PM intake `P1-HRM-H8B-MOB-TABS` PASS_TO_PM — optional `qa-device` screenshot on next MOB APK (non-blocking); continue parallel H10/H12 waves.  
**evidence_path:** `docs/qa/evidence/p1-hrm-h8b-mobile-tabs-qa-20260606.md`
