# PM orchestration mode

**Playbook:** `docs/program/PM_ORCHESTRATION_PLAYBOOK.md`  
**Prompt kích hoạt mặc định (user):** gửi một dòng → **`điều phối team đi`** (chi tiết: `.cursor/templates/PM_ORCHESTRATE_DEFAULT.md`)  
**Global (mọi dự án):** `~/.cursor/hooks.json`, `~/.cursor/rules/pm-pass-to-pm-auto-dispatch.mdc`, `~/.cursor/agents/`

| File | Meaning |
|------|---------|
| `PM_ORCHESTRATION_MODE` line 1 = `STOP` | Manual mode — PM only runs when explicitly triggered |
| `RUN` | Inject followup prompt on `stop` / `subagentStop` (project + user hooks; bounded by `loop_limit`) |

Current policy (U24): run in **`RUN`** so PM proactively orchestrates without user trigger.

Optional env: `PM_STOP_LOOP_MAX=3` (default in hook; raise only if you need more auto-loops).

## U25/U27 — Prompt tiếng Việt + lệnh cụ thể (tránh đứng >10 phút)

Hooks dùng `.cursor/hooks/pm-dispatch-hint.mjs` để sinh prompt **100% tiếng Việt**, có:

- `work_item_id` gợi ý (vd. `P1-EX-QA-HTTPS-RESIDUAL-03-R4`)
- `subagent_type` kế tiếp (vd. `qa` sau `devops` deploy)
- **Bước 1 bắt buộc:** `Task(...)` — không “đọc bus rồi suy nghĩ”
- **Bước 2:** ghi `DISPATCHED` trên bus
- Điều kiện **xong** rõ ràng

Ví dụ prompt sau khi `devops` deploy xong:

```text
[PM Điều phối — lệnh cụ thể, làm ngay]
Vừa xong: devops — Deploy residual R4 patch
Bước 1 (tool đầu tiên, bắt buộc): Task — subagent_type="qa", work_item_id="P1-EX-QA-HTTPS-RESIDUAL-03-R4"
Việc cần làm trong Task: QA smoke sau deploy trên pilot HTTPS...
```

| Hook | `loop_limit` | Behavior |
|------|--------------|----------|
| `subagentStop` | 6 | Prompt tiếng Việt + work_item + role |
| `stop` | 10 | Watchdog 7 phút; bỏ qua nếu đã DISPATCHED trong 5 phút |

Tắt auto: `PM_ORCHESTRATION_MODE=STOP`

**RUN does not run Task for you** — true execution = PM agent calls **Task** + **Shell** in the same chat turn.

## U31 — Kiểm tra subagent có treo không

Cursor **không** có API «subagent đang chạy» trực tiếp. Repo dùng **3 lớp tín hiệu**:

| Lớp | Nguồn | Phát hiện |
|-----|--------|-----------|
| **In-flight** | Hook `subagentStart` → `.cursor/team/inbox/subagent-start.jsonl` đối chiếu `subagent-stop.jsonl` | Start > 7 phút, chưa có stop cùng `task_id` → **stale_in_flight** |
| **Bus stale** | `docs/program/AGENT_MESSAGE_BUS.md` | `PM -> qa DISPATCHED` > 7 phút, chưa `PASS_TO_PM` → **bus_dispatch_stale** |
| **Zombie** | `subagentStop` = completed + thiếu file evidence | **zombie_completed** (INVALID-HANDOFF — đúng case M-CC-11/12) |
| **Transcript** | `~/.cursor/projects/.../agent-transcripts/**/subagents/*.jsonl` | ≤2 dòng + không cập nhật 5 phút → **stuck_at_start**; `lastTool=browser_cdp` → **possible_cdp_hang** |

### Lệnh (agent hoặc bạn gõ một dòng)

```bash
pnpm run pm:subagent:status
pnpm run pm:subagent:status -- --json
pnpm run pm:subagent:status -- --watch 30
```

- Exit **0** = không phát hiện treo/zombie.
- Exit **2** = có issue — PM re-dispatch hoặc interrupt + retry.
- Ngưỡng mặc định **7 phút** (`PM_SUBAGENT_STALE_MS`, `PM_WATCHDOG_STALE_MS` trên hook `stop`).

Hook mới: `.cursor/hooks/subagent-start.mjs` (đã thêm vào `.cursor/hooks.json`). **Chỉ ghi từ lần Task kế** — trước đó vẫn dùng transcript + bus.

## U30 — PM tự quét phạm vi (không chờ user)

| Thành phần | Path |
|------------|------|
| Rule cố định (always apply) | `.cursor/rules/pm-self-directed-scope-orchestration.mdc` |
| Charter ưu tiên / run-until-done | `docs/program/PM_AUTONOMOUS_CHARTER.md` |
| User lock | `docs/program/TEAM_USER_REQUIREMENTS.md` **U30** |
| Trạng thái 1 trang | `docs/program/TEAM_WORKING_NOW.md` |

PM **không** cần câu «điều phối team đi» nếu `PM_ORCHESTRATION_MODE=RUN` và subagent vừa xong — vẫn **bắt buộc** gọi **Task** trong lượt Composer (hook chỉ nhắc).
