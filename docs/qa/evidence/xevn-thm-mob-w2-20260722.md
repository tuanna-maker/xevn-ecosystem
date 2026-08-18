# Evidence — XEVN-THM-MOB-W2 (2026-07-22)

| Field | Value |
|-------|-------|
| **work_item_id** | `XEVN-THM-MOB-W2` |
| **from_role** | dev-mobile |
| **to_role** | qa |
| **program** | `P1-XEVN-THEME-REMASTER` |
| **ack_status** | `READY_FOR_QA` |
| **runtime_SoT** | `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` (**Accepted**) §4.1–4.4 |
| **inventory** | `docs/program/XEVN_THEME_SCREEN_INVENTORY.md` § MOB-W2 |
| **entry** | MOB-00 QA PASS `docs/qa/evidence/xevn-thm-mob-00-qa-20260722.md` |
| **U65** | N/A — theme remaster only; no seed / no API |

## spec_read_ack

- **adr:** `docs/architecture/ADR-XEVN-THEME-SHARP-OPS-20260722.md` §4.1 Color · §4.3 Typography · §4.4 L-OPS
- **inventory:** `docs/program/XEVN_THEME_SCREEN_INVENTORY.md` §3 MOB-W2 (26 screens + splash)
- **brand:** `docs/program/XEVN_BRAND_UIUX_PROPOSAL.md` §3
- **change_mode:** REPLACE (hardcoded pale / AS-IS hex → `colors.text` / `textSecondary` / `textMuted` + `statusToneColor`)

## Exit criteria map

| AC | Result |
|----|--------|
| Remaster ALL MOB-W2 inventory screens to text tokens | **PASS** — screen styles + shared UI consumers |
| Fix UndoSnackbar `#1F2937` | **PASS** → `backgroundColor: colors.text`; undo → `colors.primaryDisabled`; touch ≥44 |
| No pale hex for readable text | **PASS** — gate test bans `#1F2937` / `#9CA3AF` / `#6B7280` color assignments |
| Touch ≥44 kept | **PASS** — FormField / type chips / LeaveBalanceChip / UndoSnackbar |
| Ops-first (demote clutter) | **PASS** — section titles → `colors.text`; placeholders → `textMuted`; step labels ≥ caption 12; status banners via `statusToneColor` |
| ThemeProvider wire | **PASS** — `App.tsx` wraps tree |

## Inventory remaster matrix (MOB-W2)

| screen_id | Surface | Remaster | Notes |
|-----------|---------|----------|-------|
| MOB-SPLASH | `SplashIntro` | ✅ | `colors.brandShell` + `splashGlow` |
| MOB-LOGIN | `LoginScreen` | ✅ | labels subhead; placeholder `textMuted` |
| MOB-SCOPE | `ScopeScreen` | ✅ | section title `colors.text` |
| MOB-HOME | `DashboardScreen` | ✅ | existing tokens + PendingApprovalsStrip tone |
| MOB-TAB-TEAM | Attendance stack root | ✅ | via TeamDirectory |
| MOB-TAB-PAY | Payslip stack | ✅ | PayslipList + shared |
| MOB-TAB-PROFILE | Profile stack | ✅ | Profile + shared |
| MOB-TEAM-DIR | `TeamDirectoryScreen` | ✅ | placeholder `textMuted`; row meta muted |
| MOB-TEAM-DET | `TeamColleagueDetailScreen` | ✅ | shared IconDetailRow / tokens |
| MOB-CHECKIN | `CheckInScreen` | ✅ | warn → `statusToneColor('warning')` |
| MOB-ATT-HIST | `AttendanceHistoryScreen` | ✅ | error → statusTone |
| MOB-LEAVE-LIST | `LeaveRequestsListScreen` | ✅ | + LeaveBalanceHeader tones |
| MOB-LEAVE-CREATE | `CreateLeaveRequestScreen` | ✅ | step label ≥12; warn tones |
| MOB-LEAVE-DET | `LeaveRequestDetailScreen` | ✅ | `textSecondary` timestamps |
| MOB-UPD-LIST | `UpdateRequestsScreen` | ✅ | statusTone error |
| MOB-UPD-CREATE | `CreateUpdateRequestScreen` | ✅ | FormField tokens |
| MOB-UPD-DET | `UpdateRequestDetailScreen` | ✅ | DetailRow / shared |
| MOB-APPR | `ManagerApprovalsScreen` | ✅ | placeholder `textMuted` |
| MOB-PAY-LIST | `PayslipListScreen` | ✅ | statusTone error |
| MOB-PAY-DET | `PayslipDetailScreen` | ✅ | shared SurfaceCard/DetailRow |
| MOB-PAY-SUM | `PayrollSummaryScreen` | ✅ | statusTone error |
| MOB-CTR | `ContractsScreen` | ✅ | statusTone error |
| MOB-OPS | `OperationsScreen` | ✅ | statusTone error |
| MOB-PROFILE | `ProfileScreen` | ✅ | emptyHint `textSecondary` |
| MOB-NOTIF | `InAppNotificationsScreen` | ✅ | EssRichListRow tokens |
| MOB-SETTINGS | `SettingsScreen` | ✅ | section title sharp |
| MOB-JOURNEY | `JourneyScreen` | ✅ | existing text tokens |

**Shared chrome (cross-cutting):** UndoSnackbar · FormField · ListRow · EssRichListRow · AppScreenLayout · OfflineBanner · DetailNoteBlock · ConfirmActionModal · LeaveBalanceHeader/Chip · fabPrimaryActions · leaveTypes.

## Verify

```text
cwd: apps/mobile/hrm-mobile
pnpm exec vitest run src/theme/__tests__/mobW2Remaster.test.ts \
  src/theme/__tests__/tokens.test.ts \
  src/theme/__tests__/Theme.test.ts \
  src/components/ui/__tests__/leaveBalanceChip.test.ts --reporter=dot
→ Test Files  4 passed (4)
→ Tests      20 passed (20)
→ exit 0
```

Gate file: `src/theme/__tests__/mobW2Remaster.test.ts`

## Residual / not promoted

| Item | Severity | Owner |
|------|----------|-------|
| Device visual matrix sample (J-MOB / QA-device) | P1 QA | qa |
| DNA leave-type accent hex outside core palette (`#EC4899` …) for chip icons | P2 cosmetic | defer — status DNA; text still tokens |
| Fresh release APK for device smoke | P1 | devops / qa-device after QA PASS |
| Full monorepo `pnpm test:hrm-mobile` not re-run this wave (scoped theme + chip) | P2 | qa may expand |

**No residual screen_id left un-remastered** for MOB-W2 inventory.

## Forbidden check

- No API changes
- No seed
- No Phase 1 DONE claim

## Handoff

- **next_owner:** qa
- **ack_status:** `READY_FOR_QA`
- **pm_dispatch_hint:** Dispatch QA visual/token gate on P0 MOB screens (login → home → leave → approvals → payslip); confirm UndoSnackbar fill ≠ `#1F2937`; spot-check touch ≥44.
