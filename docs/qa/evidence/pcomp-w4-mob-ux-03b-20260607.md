# PCOMP-W4-MOB-UX-03b — Manager inbox unified + thumb-zone approve

**work_item_id:** `PCOMP-W4-MOB-UX-03b`  
**date:** 2026-06-07  
**owner:** dev-mobile  
**spec:** `docs/program/MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §5.1, §6.3, §7 (manager inbox)  
**ack_status:** `READY_FOR_QA`

## Scope closed

| AC | Implementation |
|----|----------------|
| Unified manager inbox | Single scroll list; filter chips **Tất cả / Chỉnh sửa CC / Nghỉ phép** with pending counts |
| Filter chips DS §6.3 | New `FilterChipRow` — 36pt pill, horizontal scroll, primary active fill + white label |
| Thumb-zone approve/deny §5.1 | Row tap selects item; **Duyệt / Từ chối** in `StickyFooter` (48pt) above safe area — no inline row buttons |
| Selection UX | Selected row `primaryMuted` border; tap again deselects; filter change clears selection |
| API unchanged | Same approve/reject endpoints + offline guard + `formatHrmSuccess` |

## Files touched

- `src/components/ui/FilterChipRow.tsx` (new)
- `src/components/ui/__tests__/managerInboxUx.test.ts` (new)
- `src/features/attendance/ManagerApprovalsScreen.tsx` — unified inbox + footer actions

## Verification

```bash
cd apps/mobile/hrm-mobile
pnpm test    # exit 0 — 86/86
pnpm run build  # tsc --noEmit exit 0
```

## QA focus (J-MOB-05 device)

1. **More → Duyệt** — filter chips scroll horizontally; counts match API pending
2. Tap row → footer **Duyệt / Từ chối** visible in bottom 40% (thumb reach)
3. **Duyệt** → `Thành công` (no raw `HRM-ATT-REQ-203`); list refresh
4. **Từ chối** → modal reason → success; selection cleared
5. Offline → alert before write (unchanged)
6. Account: manager persona with pending seed (`uat.nv####@xe.vn` or pilot manager)

## Residual / not promoted

- Swipe-to-approve row gesture — deferred (§5.2 future)
- Migrate `LeaveRequestsListScreen` / `UpdateRequestsScreen` to `FilterChipRow` — optional polish wave
- APK rebuild for device QA — dispatch if MUX-03b requires fresh artifact

## pm_dispatch_hint

QA-Device retest **J-MOB-05** with thumb-zone footer flow; screenshot filter chips + sticky approve bar per `MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md` §5.1.
