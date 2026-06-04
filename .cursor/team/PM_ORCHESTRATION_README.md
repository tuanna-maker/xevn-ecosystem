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
