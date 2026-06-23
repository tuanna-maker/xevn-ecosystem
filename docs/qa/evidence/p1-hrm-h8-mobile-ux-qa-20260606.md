# P1-HRM-H8-MOB-UX — QA retest

**work_item_id:** `P1-HRM-H8-MOB-UX`  
**from_role:** qa  
**to_role:** pm  
**date:** 2026-06-06  
**ack_status:** `PASS_TO_PM`  
**dev_evidence:** `docs/qa/evidence/p1-hrm-h8-mobile-ux-20260606.md`

## Verdict

**PASS** — Mobile design-system wave meets H8 acceptance: automated suite green, static UX review confirms light tokens, branded login, KPI cards without debug/UC text, and `ListRow` on payslips / leave / approvals. No API integration edits in scope; prior J-MOB functional evidence (R4) remains valid for L2.5 behavior.

## Environment

| Item | Value |
|------|-------|
| Package | `apps/mobile/hrm-mobile` |
| Node test runner | vitest 2.1.9 |
| OS | Windows 10.0.26200 |
| Emulator | **Not available** (`adb devices` empty) |
| Pilot account (manual matrix) | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## L0 — Automation

| Check | Command | Result |
|-------|---------|--------|
| Unit tests | `pnpm test` (hrm-mobile) | **41/41 PASS**, exit **0** |
| TypeScript | `pnpm run type-check` | **PASS**, exit **0** |
| Token parity | `src/theme/__tests__/tokens.test.ts` | **4/4 PASS** — hex match web-portal `xevn.*` |

```
Test Files  10 passed (10)
     Tests  41 passed (41)
  Duration  1.16s
```

## L2 — Static UX review (H8 scope)

| Area | File(s) | Result | Notes |
|------|---------|--------|-------|
| Light theme tokens | `src/theme/tokens.ts`, `RootNavigator.tsx`, `App.tsx` | **PASS** | `colors.background` `#F9FAFB`, `surface` `#FFFFFF`, tab bar light; `DefaultTheme` aligned |
| Dashboard KPI cards | `DashboardScreen.tsx` | **PASS** | Cards: Hệ thống, Chấm công hôm nay, Phạm vi, Đơn công chờ, Nhân viên gần đây; `StatusBadge` + Vietnamese copy; **no** UC/debug/raw identifier blocks |
| Login branded | `LoginScreen.tsx` | **PASS** | Xe logo mark, `vi.appName`, light form card; dev URL/JWT fields gated `__DEV__` only |
| Payslip list | `PayslipListScreen.tsx` | **PASS** | `ListRow` + pull-to-refresh + empty/error states; subtitle `Thực lĩnh …` |
| Leave list | `LeaveRequestsListScreen.tsx` | **PASS** | Filter chips + `ListRow` + `StatusBadge`; tap → detail nav |
| Manager approvals | `ManagerApprovalsScreen.tsx` | **PASS** | `ListRow` with Duyệt/Từ chối actions; Vietnamese empty/section labels |

## L2.5 — J-MOB journeys (wave scope)

H8 is **UI polish only** — `hrmApiClient`, auth scope, payroll helpers **unchanged** per dev handoff.

| J-ID | H8 touchpoint | QA method | Result |
|------|---------------|-----------|--------|
| J-MOB-01 | Login screen | Static review + prior R4 | **PASS** (branded light login; functional login unchanged) |
| J-MOB-02 | Dashboard / home KPI | Static review | **PASS** (KPI cards; no debug text) |
| J-MOB-03 | Leave list → detail | Code: `ListRow` + `LeaveRequestDetail` nav | **PASS** (carry-forward R4 [`p1-phase1-qa-mob-jmob-20260604-r4.md`](p1-phase1-qa-mob-jmob-20260604-r4.md)) |
| J-MOB-04 | Payslip list → detail | Code: `ListRow` + `PayslipDetail` nav | **PASS** (carry-forward R4) |
| J-MOB-05 | Manager approvals → Duyệt | Code: `ListRow` + approve handlers | **PASS** (carry-forward R4) |

**Device smoke:** Deferred — no emulator/device attached this session. Recommend `qa-device` on next APK build for visual confirmation of light shell on hardware; **not blocking** H8 closure given zero integration diff + green automation.

## Residual / not promoted

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Other tabs (Chấm công, Cài đặt, …) legacy dark inline styles | P2 cosmetic | dev-mobile backlog | Documented out-of-scope in dev handoff |
| Device visual smoke (light tab bar on hardware) | P3 | qa-device | Optional follow-up when emulator/APK available |

## Defects

None opened for H8 wave.

## PM dispatch hint

- **QC:** Optional narrow gate if mobile UX is in current sprint DoD — cite this file + dev `p1-hrm-h8-mobile-ux-20260606.md`.
- **qa-device:** Next MOB APK cut — screenshot J-MOB-01/02 light theme on device (non-blocking).

---

**completion_report:** Closed P1-HRM-H8-MOB-UX QA retest — 41/41 tests PASS, type-check PASS, static UX review PASS for tokens, dashboard KPIs, branded login, ListRow screens. J-MOB L2.5 carry-forward valid (no API changes). Device smoke deferred (no adb target).

**next_owner:** pm

**next_dispatch_prompt:** PM intake P1-HRM-H8-MOB-UX QA PASS — evidence `docs/qa/evidence/p1-hrm-h8-mobile-ux-qa-20260606.md`. If sprint DoD includes mobile polish, dispatch **qc** narrow gate on H8 UX; optional **qa-device** on next APK for light-theme screenshots (non-blocking). Residual P2: legacy dark styles on non-H8 tabs — backlog only.

**evidence_path:** `docs/qa/evidence/p1-hrm-h8-mobile-ux-qa-20260606.md`
