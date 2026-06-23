# MOB-UX-18 — Chrome deduplication (ILA-05)

**work_item_id:** MOB-UX-18a + MOB-UX-18b + MOB-UX-18c  
**date:** 2026-06-09  
**owner:** dev-mobile  
**ack_status:** READY_FOR_QA

## Sponsor incident

Duplicate titles and primary CTAs on Leave list and Payslip tab — nav + body H1 + sticky/empty CTA stacking.

## Changes

| Screen | Rule | Fix |
|--------|------|-----|
| `LeaveRequestsListScreen` | CHROME-02 | Removed `StickyFooter` «Đăng ký nghỉ»; empty state CTA via `EmptyLeaveIllustration` only; global FAB handles create |
| `LeaveRequestsListScreen` | CHROME-03 | Stack title «Nghỉ phép của tôi» unchanged; «Kỳ nghỉ {year}» section in `LeaveBalanceHeader` |
| `PayslipListScreen` | CHROME-01/04 | Tab-root: subtitle only («Phiếu lương mới nhất và lịch sử»); period drill-in shows `periodTitle` (not `vi.payslips`) |
| `PayrollSummaryScreen` | CHROME-01 | Removed in-content `vi.payroll` H1; subtitle only |
| `ContractsScreen` | CHROME-01 | Removed in-content `vi.contracts` H1; subtitle only |
| Profile / ManagerApprovals / Notifications | — | Already `stackHeaderPresent` — no change |

## Balance (MOB-UX-18a)

Leave balance uses `getLeaveBalanceQueryCompanyId()` + `resolveLeaveBalanceDisplayDays()` from P1-LEAVE-BALANCE-DEVICE-01 — no code delta this wave.

## Verification

```text
pnpm run verify:mobile:chrome  → exit 0 PASS
pnpm run test:hrm-mobile       → 444/444 PASS
```

## QA handoff (qa-device)

- **ILA-05** spot: Leave empty tab — one «Đăng ký nghỉ» (empty illustration OR FAB, not both); no sticky footer.
- **ILA-05** spot: Payslip tab — stack «Phiếu lương» + body subtitle only (screenshot: no duplicate H1).
- **J-MOB-25:** `leave-balance-header` shows non-zero available when API 8/3 @ holding.

## Residual

- None code-side; device screenshots required for ILA-05 sign-off.
