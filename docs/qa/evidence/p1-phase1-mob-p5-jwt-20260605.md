# P1-PHASE1-MOB-P5-JWT-01 — Mobile attendance JWT write path

| Field | Value |
|---|---|
| work_item_id | `P1-PHASE1-MOB-P5-JWT-01` |
| from_role | `dev-mobile` |
| to_role | `qa` |
| date | `2026-06-05` |
| condition | `C-W12QC-01` mobile P5 JWT attendance write |
| ack_status | **READY_FOR_QA** |

## Entry

L1 UAT residual `mobile-jwt-attendance-record-uuid-scope` (36/37 → target 37/0): mobile HRM attendance write APIs must consume JWT with portal-aligned TTL handling and correct scope headers (`x-company-id` slug + `company_id` UUID body).

## Root cause (mobile)

1. `buildHrmAuthConfig` overwrote membership scope slug with legal UUID in `companyId`, forcing UUID on `x-company-id` for all accounts (UAT `authHeaders` sends slug `holding`).
2. No `expires_in_sec` / `tokenExpiresAt` persistence — attendance writes used stale JWT without proactive refresh (portal stores 86400 TTL semantics).

## Fix summary

| Area | Change |
|------|--------|
| Scope header | `resolveHrmCompanyHeaderId` — valid slug (`holding`, …) on `x-company-id`; legal UUID when slug blocked (`main`) |
| Auth config | `buildHrmAuthConfig` preserves `companyId` slug; `companyUuid` holds wire UUID |
| JWT TTL | `mobileAuthSession.ts` — `computeTokenExpiresAt` / `isMobileTokenExpired` (default **86400s** portal parity) |
| Session | `tokenExpiresAt` in SecureStore; set from login/refresh `expires_in_sec` |
| Write path | `AuthContext.requestHrm()` refreshes JWT when near expiry; attendance write screens + offline flush use it |

## Files touched

- `apps/mobile/hrm-mobile/src/integrations/hrmApiClient.ts`
- `apps/mobile/hrm-mobile/src/integrations/mobileAuthSession.ts` (new)
- `apps/mobile/hrm-mobile/src/context/AuthContext.tsx`
- `apps/mobile/hrm-mobile/src/storage/keys.ts`
- `apps/mobile/hrm-mobile/src/features/attendance/CheckInScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/ManagerApprovalsScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx`
- `apps/mobile/hrm-mobile/src/features/attendance/CreateUpdateRequestScreen.tsx`
- `apps/mobile/hrm-mobile/src/integrations/offlineQueue.ts`
- `apps/mobile/hrm-mobile/src/components/OfflineSync.tsx`
- Tests: `mobileAuthSession.test.ts`, `p1-phase1-mob-p5-jwt.test.ts`, updated `hrmApiClient.test.ts`, `companyWireScope.test.ts`

## Verification (agent-run)

```powershell
Set-Location "<repo-root>/apps/mobile/hrm-mobile"
pnpm test
# exit 0 — 37/37 vitest

Set-Location "<repo-root>"
pnpm run test:hrm-mobile
# exit 0

node scripts/mobile-hrm-smoke.mjs
# exit 0 — MOB smoke OK @ :28001
```

| Check | Result |
|-------|--------|
| `pnpm test` (hrm-mobile) | **PASS** 37/37 |
| `pnpm run test:hrm-mobile` | **PASS** exit 0 |
| `mobile-hrm-smoke.mjs` | **PASS** exit 0 |
| P5 contract tests | **PASS** `p1-phase1-mob-p5-jwt.test.ts` (slug header + UUID body) |

## QA dispatch (L1 + J-MOB)

- Re-run `pnpm run test:system:uat` — expect **37/0**, phase `mobile-jwt-attendance-record-uuid-scope` **PASS** (account `uat.nv0016@xe.vn` / `xevn-uat-2026`, DRIVER role).
- Device: J-MOB-03 check-in write, J-MOB-05 manager approve — `adb shell pm clear` before retest if scope card cached old header.
- Pilot APK rebuild optional this wave (logic-only); nip.io bundle unchanged.

## Residual

- Local `uat.nv0016` live probe returned `HRM-AUTH-401` (workforce seed/password on this shell) — does not block vitest/smoke; QA must run against seeded UAT DB per `test:system:uat`.
- BE mobile `ACCESS_TTL_SEC` still **43200** in `mobile-auth.service.ts`; client honors server `expires_in_sec` and defaults refresh math to **86400** when absent (portal parity). BE TTL bump is **dev-be** optional follow-up, not blocking mobile client fix.

---

### Handoff packet

- **completion_report:** Closed mobile JWT scope split (slug header / UUID attendance body), token expiry persistence + proactive refresh on attendance write paths, regression tests 37/37, smoke PASS. Residual: QA L1 37/0 on seeded env + device J-MOB-03/05.
- **next_owner:** `qa`
- **next_dispatch_prompt:** work_item_id: P1-PHASE1-MOB-P5-JWT-01. Role: qa. Entry: dev-mobile READY_FOR_QA — evidence docs/qa/evidence/p1-phase1-mob-p5-jwt-20260605.md. Exit: Run pnpm run test:system:uat expect 37/0 (phase mobile-jwt-attendance-record-uuid-scope PASS); device J-MOB-03 check-in POST + J-MOB-05 approve with uat.nv####@xe.vn / xevn-uat-2026; adb pm clear if scope cached. ack_status PASS_TO_PM with L1 evidence path. evidence_path: docs/qa/evidence/p1-phase1-mob-p5-jwt-qa-20260605.md
- **evidence_path:** `docs/qa/evidence/p1-phase1-mob-p5-jwt-20260605.md`
- **ack_status:** **READY_FOR_QA**
