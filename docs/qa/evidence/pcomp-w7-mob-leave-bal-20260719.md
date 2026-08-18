# PCOMP-W7-MOB-LEAVE-BAL — Leave balance widget (W7-4)

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W7-MOB-LEAVE-BAL |
| role | dev-mobile |
| date | 2026-07-19 |
| ack_status | **READY_FOR_QA** |
| journeys | J-MOB-25 (My Leaves header) · J-MOB-28 (create leave wizard chip) · UC-HRM-MOB-06c |
| prior BE | `pcomp-w7-mob-leave-bal-20260608.md` · QA R2 API PASS `pcomp-w7-mob-leave-bal-qa-r2-20260608.md` |

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| SRS | `docs/hrm/MOBILE_W7_SRS_DELTA.md` **§4.3 UC-HRM-MOB-06c** — chip copy, B1–B4, BR-LEAVE-BAL-01/02, AC-LEAVE-BAL-01/02 |
| TechSpec | `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` **§3.6** GET leave-balance · **§4.2** `LeaveBalanceChip` |
| Data | `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` **§4** leave_balance field matrix · VAL-W7-LBAL-* |

**spec says / code does (before → after):**

| Spec | Before | After |
|------|--------|-------|
| «Còn lại: R / E ngày phép năm Y» | Wizard: only «Còn lại X ngày» | `formatLeaveBalanceChipText` + `LeaveBalanceChip` |
| Fetch on wizard mount (step 0) | Fetch only when `step >= 1` | Fetch on mount when scope+employee ready |
| B1 404 → «Chưa có số dư — liên hệ HR» | «Liên hệ HR để tra cứu số dư» | `LEAVE_BALANCE_MISSING_HR_MSG` |
| B2/B3 warn, BR-LEAVE-BAL-02 no block | Missing | Yellow/red banners + confirm dialog copy; submit still allowed |
| TechSpec `LeaveBalanceChip` | Inline balanceBox | Shared component `minHeight: 44` |

## Scope closed

1. **`LeaveBalanceChip`** — presentational widget (≥44px), wired on Create Leave steps **0** and **1**.
2. **Helpers** in `hrmLeaveBalance.ts`: chip format, not-configured detection, warn level / banner text.
3. **My Leaves** `LeaveBalanceHeader` — B1 error copy aligned to SRS (no invent numbers).
4. **@CODE-MEMORY** on chip, integration, create screen, header.
5. **Tests:** `leaveBalanceChip.test.ts` (5) + `hrmLeaveBalance.test.ts` (9) — **14/14 PASS**.

## Verification

```bash
pnpm test:hrm-mobile -- leaveBalanceChip hrmLeaveBalance
# Test Files  2 passed | Tests  14 passed
```

## Files

- `apps/mobile/hrm-mobile/src/components/ui/LeaveBalanceChip.tsx` (**new**)
- `apps/mobile/hrm-mobile/src/components/ui/__tests__/leaveBalanceChip.test.ts` (**new**)
- `apps/mobile/hrm-mobile/src/integrations/hrmLeaveBalance.ts`
- `apps/mobile/hrm-mobile/src/integrations/__tests__/hrmLeaveBalance.test.ts`
- `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx`
- `apps/mobile/hrm-mobile/src/components/ui/LeaveBalanceHeader.tsx`

## QA device matrix (U65 zero-seed — browser/device FE)

| # | Persona | Path | Expect |
|---|---------|------|--------|
| 1 | `uat.nv0001@xe.vn` | My Leaves | `LeaveBalanceHeader` Còn lại **≠ —** when API 200 (seeded 8/3 if env has balance row) |
| 2 | same | Tạo đơn nghỉ step 1–2 | Chip text `Còn lại: {R} / {E} ngày phép năm {Y}` |
| 3 | same | Chọn range > remaining | Yellow warn; confirm mentions vượt số dư; **vẫn gửi được** |
| 4 | (optional) API 404 | Chip | «Chưa có số dư — liên hệ HR»; không chặn submit |

**AC-LEAVE-BAL-02** (after approve, balance drops): device refresh wizard after manager approve — assert remaining decreased.

## Residual

- Home `leave_balance_preview` chip — **optional** per SRS/DATA §4; not in this slice (Dashboard still navigates to My Leaves).
- HR `block_submit=true` when depleted — **not invent**; pilot BR-LEAVE-BAL-02 warn-only.

## Handoff

- **next_owner:** qa-device (preferred) or qa
- **ack_status:** READY_FOR_QA
- **pm_dispatch_hint:** Device retest J-MOB-25/28 + AC-LEAVE-BAL-01/02; U65 no seed in evidence
