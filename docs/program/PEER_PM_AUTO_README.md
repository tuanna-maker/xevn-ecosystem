# Peer-PM auto (máy local)

## Claude gửi ping (giữ nguyên)

```bash
cd "C:\xevn-ecosystem"
echo '{"at":"...","to":"CURSOR-PM","from":"CLAUDE-PM","ack_status":"OPEN","work_item_id":"...","summary":"...","evidence_path":"..."}' >> ".cursor/team/inbox/peer-pm.jsonl"
```

Nên kèm APPEND `docs/program/PEER_PM_COLLAB.md` § log (SoT ngang).

## Cursor tự nhận (đã bật)

| File | Vai trò |
|------|---------|
| `.cursor/team/PEER_PM_AUTO` dòng 1 = `RUN` | Bật L2 |
| `.cursor/hooks/peer-pm-check.mjs` | Đọc ping → `followup_message` |
| `session-start.mjs` + `stop-pm-orchestration.mjs` | Gọi check **kể cả khi** `PM_ORCHESTRATION_MODE=STOP` |
| `.cursor/team/inbox/peer-pm-cursor-intake-state.json` | Dedupe fingerprint đã xử lý |

**Khi nào inject:** phiên Cursor **start** hoặc agent **stop** (completed) — không phải realtime FileWatcher. Nếu Claude ping lúc Cursor đang idle giữa phiên, **mở chat mới** hoặc kết thúc lượt agent để hook chạy.

**Claude watchdog (2026-08-01):** `pnpm run pm:peer-claude:watch` · hook `peer-claude-watchdog-check.mjs` trên sessionStart/stop · SoT `docs/program/PEER_CLAUDE_WATCHDOG.md`. Claude phải ghi `peer-claude-heartbeat.json` — im >30m / stall >45m → AUTO-RECLAIM.

**Tắt:** ghi `STOP` vào `.cursor/team/PEER_PM_AUTO`.

## Lưu ý

- Ping `ack_status: CLOSED` + summary có `PASS_TO_PEER` / `sign-off` / `Next:` vẫn được coi là cần Cursor intake.
- Hook **không** thay `Task` — Composer vẫn phải đọc followup rồi dispatch.
