# Sprint transition checklist (PM — bắt buộc mỗi lần đóng sprint)

**Gate:** `pnpm run verify:sprint:transition` → exit **0**

## A. Đóng sprint N (`P1-SN-PM-02`)

- [ ] `sprints/SN_RETRO.md`
- [ ] `PHASE1_MASTER_TODO.md` — mọi hàng SN `[x]` hoặc waiver
- [ ] Bus `PM -> ALL` PASS_TO_PM unlock S(N+1)
- [ ] Runner: `sprints.SN.status = done`

## B. Mở sprint N+1 (cùng phiên — không để user thấy “im lặng”)

- [ ] `sprints/S{N+1}_SPRINT_BACKLOG.md` (waves, work items, lệnh gate)
- [ ] `SPRINT_STATUS_AT_A_GLANCE.md` updated
- [ ] `SPRINT_ROADMAP_S0-S5.md` — “bạn ở đây”
- [ ] `PHASE1_PMP_PROJECT_PLAN.md` §9 queue refreshed
- [ ] Runner `next_dispatch` — **xóa** id sprint cũ; **≥1** `dispatched`
- [ ] **Task** W0 (thường SA hoặc BA) — đã gọi trong cùng phiên PM
- [ ] `verify:sprint:transition` PASS

## C. Sau đó (W1+)

PM tiếp tục dispatch theo backlog — không dừng sau QA verdict (rule `pm-auto-mode-orchestration.mdc`).
