# QA — D-MOB-DIR-TOAST-01 (unit / source gate) — 2026-07-28

| Field | Value |
|-------|-------|
| work_item_id | D-MOB-DIR-TOAST-01 / QA-D-MOB-DIR-TOAST-01 |
| from_role | qa |
| to_role | pm |
| ack_status | **PASS_TO_PM** |
| locks | U65 · HOLD_DEPLOY · must_keep directory/profile GWC · NOT Phase1/PROD |
| Dev evidence | `docs/qa/evidence/d-mob-dir-toast-01-20260728.md` |
| Device | **Deferred** — APK not rebuilt this wave; LogBox confirm = next `android:apk:qa-device` |

## Scope

Independent retest of Metro require-cycle FIX (list↔detail + tabs↔ESS via sanitize leaf). Unit PASS is sufficient per PM dispatch; qa-device optional post-APK.

## Vitest (independent re-run)

```text
pnpm exec vitest run \
  src/utils/__tests__/profileDisplaySanitize.test.ts \
  src/utils/__tests__/teamDirectory.test.ts \
  src/utils/__tests__/teamDirectoryDetail.test.ts \
  src/utils/__tests__/profileTabs.test.ts \
  src/utils/__tests__/profileEssFields.test.ts \
  src/integrations/__tests__/companyWireScope.test.ts \
  src/components/ui/__tests__/teamDirectoryUx.test.ts \
  src/features/profile/__tests__/profileScreenPlaneB.test.ts
```

| Metric | Result |
|--------|--------|
| Files | 8 passed |
| Tests | **70/70 PASS** |
| Duration | ~1.0s |
| Host | `apps/mobile/hrm-mobile` · Vitest 2.1.9 · 2026-07-28 ~11:56 +07 |

Cycle hygiene cases in `profileDisplaySanitize.test.ts` (3) + sanitize (1) all green.

## Source spot-check (no value-cycle)

| Pair | Expected | Observed |
|------|----------|----------|
| `teamDirectory` → `teamDirectoryDetail` | **No** import | PASS — list imports only `hrmEmployees` type + `dashboardEss`; owns `resolveColleagueHeroSubtitle` |
| `teamDirectoryDetail` → `teamDirectory` | One-way OK | PASS — imports `resolveColleagueHeroSubtitle`, `TEAM_CHECK_IN_BADGE` from list; no local hero-subtitle export |
| `profileEssFields` → `profileTabs` | **No** import | PASS — ESS imports leaf `./profileDisplaySanitize` only |
| `profileTabs` → leaf / ESS | Tabs may use leaf + ESS | PASS — tabs import sanitize leaf + `buildProfilePersonalSections` from ESS (acyclic: tabs→ess, not reverse) |
| LogBoxIgnore / ignoreLogs | Absent | PASS — no `LogBox.ignore` / `Require cycle` swallow in `src/` |

## must_keep (regression via suite)

| Guard | Evidence |
|-------|----------|
| Plane B directory / `resolveDirectoryQueryCompanyId` | `companyWireScope` 18 + `teamDirectory` / UX tests green |
| Profile ESS / Plane B | `profileEssFields` + `profileTabs` + `profileScreenPlaneB` green |
| Hub empty hide | Not in this FIX path; not re-opened (U65) |

## Residual

| Item | Severity | Notes |
|------|----------|-------|
| Device cold-start LogBox confirm | P3 optional | Needs next APK rebuild; current binary may still ship pre-FIX cycle |
| Phase1 / PROD claim | — | Out of scope · HOLD_DEPLOY |

## Verdict

**PASS_TO_PM** — unit + static import-graph gate closed. Device LogBox confirm deferred to next APK (qa-device optional).

## Handoff

- `completion_report`: Vitest 70/70 independent; no list↔detail / tabs↔ess value cycles; no LogBoxIgnore cheat; device deferred.
- `next_owner`: pm
- `next_dispatch_prompt`: see bus / completion contract below
- `ack_status`: PASS_TO_PM
