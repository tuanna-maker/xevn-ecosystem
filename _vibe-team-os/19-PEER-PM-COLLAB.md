# 19 — Peer PM Collab (OS)

Khi ≥2 lead (Cursor Composer + Claude Code) cùng điều hành một repo:

1. SoT ngang hàng: `docs/program/PEER_PM_COLLAB.md` (append-only § log).
2. Ping: `.cursor/team/inbox/peer-pm.jsonl` — mỗi tin 1 JSON line, `to` rõ, `ack_status: OPEN`.
3. Vertical bus (`AGENT_MESSAGE_BUS`) chỉ cho hierarchy trong một lead — **không** ra lệnh peer qua Task.
4. L2 auto: `.cursor/team/PEER_PM_AUTO=RUN` → stop hook inject khi có OPEN tới CURSOR-PM.
5. Chia lane bằng `work_item_id` không trùng; cấm đụng cùng file đang sửa của peer.

Xem case: `docs/program/PEER_PM_CLAUDE_BOOTSTRAP.md` (xevn-ecosystem).
