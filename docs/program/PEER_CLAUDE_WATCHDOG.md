# Peer Claude Watchdog — kênh giám sát liên tục

**Program:** `PM-PEER-CLAUDE-WATCH-01`  
**OS doctrine:** `_vibe-team-os/24-PEER-CLI-CROSS-PLATFORM-WATCHDOG-CHANNEL.md`  
**Mục tiêu:** Cursor-PM **phát hiện** Claude im / dừng giữa chừng / không làm được → **thu hồi ngay** execution về Cursor.

---

## 1. Ba tín hiệu (SoT máy)

| Tín hiệu | File / nguồn | Ai ghi |
|----------|----------------|--------|
| **Ping** | `.cursor/team/inbox/peer-pm.jsonl` | Cursor ↔ Claude |
| **Heartbeat** | `.cursor/team/inbox/peer-claude-heartbeat.json` | **Claude CLI bắt buộc** khi đang làm |
| **Evidence** | `docs/qa/evidence/claude-*.md` mtime | Claude khi có output |

Watchdog đọc cả `docs/program/PEER_PM_COLLAB.md` §5 (entry CLAUDE gần nhất).

---

## 2. Trạng thái & ngưỡng (mặc định)

| State | Ý nghĩa | Hành động PM |
|-------|---------|--------------|
| **ACTIVE** | Hoạt động trong cửa sổ | Không làm gì |
| **NUDGE** | >30 phút không heartbeat/evidence | Ping Claude (peer jsonl) |
| **STALL** | Heartbeat `IN_PROGRESS` >45 phút | **AUTO-RECLAIM** |
| **STALE** | Dispatch >2h không phản hồi Claude | **AUTO-RECLAIM** |
| **BLOCKED** | Heartbeat `BLOCKED` / `BLOCKED-CLI` | **AUTO-RECLAIM** ngay |

Env override:

```bash
PEER_CLAUDE_STALE_MS=7200000   # 2h
PEER_CLAUDE_STALL_MS=2700000   # 45m
PEER_CLAUDE_NUDGE_MS=1800000   # 30m
```

---

## 3. Lệnh PM (chạy mỗi lượt / hook)

```bash
pnpm run pm:peer-claude:watch          # auto-reclaim nếu vi phạm
pnpm run pm:peer-claude:watch --json     # artifact đầy đủ
pnpm run pm:peer-claude:watch --no-reclaim  # chỉ báo, không ghi reclaim
```

**Tích hợp:** `pnpm run pm:idle:check` gọi watchdog **trước** backlog scan — exit **2** nếu reclaim.

**Artifact:** `.cursor/team/inbox/peer-claude-watchdog-state.json`

---

## 4. Claude CLI — protocol heartbeat (bắt buộc)

Mỗi **15 phút** hoặc sau mỗi bước lớn, ghi đè:

`.cursor/team/inbox/peer-claude-heartbeat.json`

```json
{
  "updated_at": "2026-08-01T12:15:00+07:00",
  "from": "CLAUDE-CLI",
  "work_item_id": "CLAUDE-CLI-GOV-AUTH-COMMIT-01",
  "phase": "git-stage",
  "status": "IN_PROGRESS",
  "progress_pct": 60,
  "evidence_path": "docs/qa/evidence/claude-gov-auth-commit-01-20260801.md",
  "note": "6/8 files staged"
}
```

| status | Khi nào |
|--------|---------|
| `IN_PROGRESS` | Đang làm |
| `DONE` | Xong WI — kèm ping `CLOSED` peer-pm.jsonl |
| `BLOCKED` | Không làm được — Cursor reclaim ngay |

Copy mẫu: `peer-claude-heartbeat.example.json`

---

## 5. AUTO-RECLAIM (watchdog ghi tự động)

1. APPEND `PEER_PM_COLLAB.md` — block `AUTO-RECLAIM`
2. APPEND `peer-pm.jsonl` — `ack_status: STALE-RECLAIM`
3. UPDATE `peer-claude-delegation.json` — `status: RECLAIMED`
4. `pm:idle:check` exit **2** → Cursor dispatch BF-ORCH owner

**Sponsor không cần nhắc** — PM chạy watch mỗi phiên (hook `sessionStart` + `stop`).

---

## 6. Hook Cursor (L2)

| Hook | Script |
|------|--------|
| `sessionStart` | `peer-claude-watchdog-check.mjs` → followup nếu reclaim |
| `stop` (PM orchestration) | cùng script sau peer-pm-check |

`PEER_PM_AUTO=RUN` — peer ping Claude→Cursor vẫn hoạt động song song.

---

## 7. Checklist PM mỗi phiên

- [ ] `pnpm run pm:peer-claude:watch` exit 0?
- [ ] Nếu exit 2 → đọc `peer-claude-watchdog-state.json` → dispatch Cursor, **cấm** chờ Claude
- [ ] `peer-claude-heartbeat.json` còn `IN_PROGRESS` quá 45m? → reclaim
- [ ] Delegation OPEN trong jsonl mà 0 `claude-*` evidence? → reclaim

---

## 8. Phân việc sau reclaim

| Claude (chỉ khi ACK + heartbeat) | Cursor (execution) |
|-----------------------------------|---------------------|
| gov commit · HDSD rebuild · BF-MAP docs | BF-ORCH Đ0–Đ5 · qa-device · dev-fe |

**Map máy (2026-08-01):** `.cursor/team/inbox/peer-claude-reclaim-dispatch.json`  
**Parent WI:** `CLAUDE-CLI-AUTONOMOUS-ORCH-01` — reclaim → Cursor Task theo `map[]` · ưu tiên sub-WI đang `IN_PROGRESS` trong heartbeat.

### Sponsor lock (2026-08-01)

Claude **im quá lâu** → Cursor **tự thu hồi**, không hỏi sponsor:

| Ngưỡng | Hành động |
|--------|-----------|
| **>30 phút** không heartbeat/evidence | NUDGE (ping jsonl) |
| **>45 phút** heartbeat `IN_PROGRESS` cũ | **AUTO-RECLAIM** |
| **>2 giờ** dispatch không phản hồi | **AUTO-RECLAIM** |
| Heartbeat `BLOCKED` | **RECLAIM ngay** |

PM chạy `pnpm run pm:peer-claude:watch` mỗi phiên + hook session/stop. Exit **2** → dispatch Cursor ngay.

SoT division: `CLAUDE_CLI_HDSD_RESUME_PACKET.md` §2 v1.1
