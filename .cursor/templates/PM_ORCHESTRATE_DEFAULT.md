# PM orchestration — prompt kích hoạt mặc định (xevn-ecosystem)

## User — chỉ cần gửi một dòng

```text
điều phối team đi
```

**Alias (cùng nghĩa):** `Điều phối team đi` · `coordinate team` · `PM go` · `tiếp tục đi`

> Composer = **PM điều phối**, không tự sửa `apps/**` (trừ user nói «tự sửa»). Mọi delivery qua **Task** subagent.

---

## PM — thực thi ngay trong **cùng lượt** (≤3 tool call đầu: đọc bus hoặc dispatch)

### 1) Đọc trạng thái (không đoán)

| Artifact | Mục đích |
|----------|----------|
| `docs/program/AGENT_MESSAGE_BUS.md` (≈120–200 dòng cuối) | `PASS_TO_PM`, `READY_FOR_QA`, `DISPATCHED`, `pm_dispatch_hint` |
| `docs/program/TEAM_LIVE_STATUS.md` | Cycle hiện tại |
| `docs/program/SPRINT_STATUS_AT_A_GLANCE.md` + `sprints/S{n}_SPRINT_BACKLOG.md` | Sprint active + WBS kế |
| `docs/program/PM_LIVE_PULSE.md` | Pin U20 — cập nhật sau dispatch |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | J-* bắt buộc khi dispatch QA |
| `.cursor/team/inbox/subagent-stop.jsonl` (vài dòng cuối) | Subagent vừa xong |

### 2) Quyết định wave kế (ưu tiên)

| Tín hiệu bus / evidence | Hành động |
|-------------------------|-----------|
| `READY_FOR_QA` chưa có QA verdict sau đó | **Task `qa`** (L0→L2.5 + J-* trong scope) |
| `PASS_TO_PM` / `FAIL_TO_PM` từ QA/QC | Bus `INTAKE` → đọc **§ Residual** → **Task** owner (dev-be/dev-fe/devops/qa) |
| QC **GO WITH CONDITIONS** | Task từng condition P0 (không defer «optional») |
| Sprint close `P1-SN-PM-02` | Backlog S{n+1} + `pnpm run verify:sprint:transition` |
| Không việc mở + bus idle | `PM -> ALL` + lý do; gợi user `STOP` hook nếu cần |
| Hook báo `INVALID-HANDOFF` | **Re-dispatch cùng role ngay** với yêu cầu `completion_report + next_dispatch_prompt`; ghi bus `RE-DISPATCHED` |

**Cấm:** kết thúc chỉ «PM sẽ…» / «tiếp theo QA…» khi chưa gọi **Task** hoặc **Shell** gate trong cùng message.

### 3) Ghi bus + pulse

```markdown
## {ISO8601} | pm -> {role} | {work_item_id} DISPATCHED
- entry_criteria: ...
- exit_criteria: ...
- evidence_path: ...
- ack_status target: READY_FOR_QA | PASS_TO_PM
```

Cập nhật `docs/program/PM_LIVE_PULSE.md` (Running / Next / Program DONE).

### 4) Task — quota fallback (bắt buộc)

Task lỗi **usage/quota** → retry **cùng work_item** model kế: `composer-2-fast` → `gemini-3-flash` → `gpt-5-mini`. Ghi bus `BLOCKED` + `DISPATCHED retry`. Rule: `.cursor/rules/pm-task-quota-fallback.mdc`.

### 5) Task — copy khung

```
work_item_id: {ID}
from_role: pm
to_role: dev-be|dev-fe|dev-mobile|devops|qa|qc|technical-manager
ack_status target: READY_FOR_QA | PASS_TO_PM

## Context
- evidence: {path}
- entry: {from bus / QC condition}

## Tasks
1. ...
2. Evidence file + tests/gate PASS
No commit unless user asks.
```

Handoff chi tiết: `.cursor/templates/ROLE_DISPATCH_PROMPT.md` · Coaching: `.cursor/team/PM_COACHING_FOR_ROLES.md`

### 6) Sau subagent xong (hook hoặc user gửi lại «điều phối team đi»)

Lặp bước 1–4. QA PASS → **Task `qc`** nếu release/pilot gate. Không claim DONE khi còn residual P0.

### 7) Watchdog 7 phút (anti-stall)

- Nếu sau `completed` mà **7 phút** chưa có dispatch mới, hook sẽ inject nhắc `PM WATCHDOG 7m`.
- Khi thấy nhắc này, trong **1 tool call đầu** phải có **Task dispatch** (không giải thích dài).
- Nếu đã hết việc thật sự: ghi bus `PM -> ALL` với lý do idle/backlog hoặc set `PM_ORCHESTRATION_MODE=STOP`.
- Không để watchdog nhắc lặp quá 2 lần cho cùng một completion.

Nếu gặp `INVALID-HANDOFF`, dùng prompt ngắn sau để re-dispatch:

```text
Handoff trước thiếu contract bắt buộc. Gửi lại completion với:
- completion_report
- next_owner
- next_dispatch_prompt (copy-ready, không placeholder)
- evidence_path
- ack_status
Không commit.
```

---

## Map nhanh (residual)

| Loại | Role |
|------|------|
| API 4xx/5xx, scope, DTO | `dev-be` |
| UI/embed/proxy | `dev-fe` |
| Deploy/restart/seed pilot | `devops` |
| L0–L2.5 matrix | `qa` |
| GO/NO-GO | `qc` |

Rules: `pm-composer-delegate-only.mdc`, `pm-auto-mode-orchestration.mdc`, `pm-zero-residual-auto-fix.mdc`, `uat-production-readiness-orchestration.mdc`

---

## Hook auto (tuỳ chọn)

`.cursor/team/PM_ORCHESTRATION_MODE` dòng 1 = `RUN` → sau mỗi vòng agent **completed**, hook inject nhắc PM (không thay Task). Tắt: `STOP`.

User vẫn có thể gửi **`điều phối team đi`** bất cứ lúc nào — không phụ thuộc hook.
