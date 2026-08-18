# D-MOB-DIR-TOAST-01 — Require-cycle LogBox P2 (2026-07-28)

| Field | Value |
|-------|-------|
| work_item_id | D-MOB-DIR-TOAST-01 |
| from_role | dev-mobile |
| to_role | qa / qa-device |
| change_mode | FIX |
| ack_status | READY_FOR_QA |
| locks | U65 · HOLD_DEPLOY · must_keep Plane B directory/profile GWC |
| NOT | Phase1 / PROD / APK rebuild (unit gate sufficient for import-graph FIX) |

## Root cause

Metro LogBox yellow toast on Home / Directory / Profile:

1. `teamDirectory.ts` ↔ `teamDirectoryDetail.ts`  
   - List imported `resolveColleagueHeroSubtitle` from detail.  
   - Detail imported `TEAM_CHECK_IN_BADGE` from list.
2. `profileTabs.ts` ↔ `profileEssFields.ts`  
   - Tabs imported `buildProfilePersonalSections`.  
   - ESS imported value `sanitizeProfileDisplay` from tabs.

Same class as prior QA residuals (`pcomp-w7-qa-hub-04b`, profile/directory device waves). Non-blocking for J-MOB-08/09 empty hide; hygiene P2.

## Fix (no silent swallow)

| Change | Path |
|--------|------|
| Own `resolveColleagueHeroSubtitle` in list module; detail → list one-way + re-export | `apps/mobile/hrm-mobile/src/utils/teamDirectory.ts` · `teamDirectoryDetail.ts` |
| New leaf `profileDisplaySanitize.ts` (sanitize + section types) | `apps/mobile/hrm-mobile/src/utils/profileDisplaySanitize.ts` |
| Tabs re-export sanitize; ESS imports leaf only (no `profileTabs`) | `profileTabs.ts` · `profileEssFields.ts` |
| Static cycle regression + sanitize unit | `utils/__tests__/profileDisplaySanitize.test.ts` |

**must_keep verified (source + tests):** `resolveDirectoryQueryCompanyId` still wired in directory/profile; ESS personal sections; hub empty hide not touched.

## Vitest

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

**Result:** 8 files · **70/70 PASS** (2026-07-28).

## Device / APK

- **Not rebuilt** this wave (HOLD_DEPLOY). Unit + static import hygiene closes LogBox class for next binary.
- qa-device optional smoke after next `android:apk:qa-device`: cold start Home → dismiss check — no «Require cycle: teamDirectory…» / «profileTabs…».

## Residual

| Item | Severity | Notes |
|------|----------|-------|
| Device re-confirm LogBox gone | P3 optional | Needs new APK; current SHA may still ship old cycle |
| Phase1 / PROD | — | Out of scope |

## Handoff

- `completion_report`: Require cycles broken; vitest 70/70; Plane B / ESS / hub empty paths untouched.
- `next_owner`: qa (unit) or qa-device (post-APK LogBox spot)
- `ack_status`: READY_FOR_QA
