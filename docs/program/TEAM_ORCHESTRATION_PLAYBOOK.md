# Team orchestration playbook (portable)

**Áp dụng:** mọi repo; xevn bổ sung matrix/gate trong `docs/ecosystem/`.

## SoT handoff

| Artifact | Path |
|----------|------|
| Bus (ưu tiên) | `docs/program/AGENT_MESSAGE_BUS.md` |
| Bus (hook mirror) | `.cursor/team/AGENT_MESSAGE_BUS.md` |
| Subagent inbox | `.cursor/team/inbox/subagent-stop.jsonl` |
| Dispatch template | `.cursor/templates/ROLE_DISPATCH_PROMPT.md` |
| Global copy | `~/.cursor/templates/ROLE_DISPATCH_PROMPT.md` |

## ack_status → hành động PM

| Status | PM làm gì (cùng phiên) |
|--------|-------------------------|
| `PASS_TO_PM` | INTAKE bus + Task wave từ evidence gaps |
| `READY_FOR_QA` | Task `qa` nếu chưa `PM -> qa DISPATCHED` |
| `READY_FOR_QC` | Task `qc` |
| `BLOCKED` | Owner + escalation |

## Zero residual — không đợi user (bắt buộc)

- Rules: `pm-zero-residual-auto-fix.mdc` (project + `~/.cursor/rules/`)
- Mọi **Residual** / **Condition** trong evidence → **Task ngay** (409, flaky, P2…)
- **Cấm** “optional”, “báo nếu muốn”

## Cursor surfaces (user + project)

| Layer | User global | xevn project |
|-------|-------------|--------------|
| Rules | `~/.cursor/rules/pm-pass-to-pm-auto-dispatch.mdc` | `.cursor/rules/pm-auto-mode-orchestration.mdc` |
| Hooks | `~/.cursor/hooks.json` | `.cursor/hooks.json` (security + sprint) |
| Agents | `~/.cursor/agents/*.md` | `.cursor/agents/*.md` (synced) |
| Skills | `~/.cursor/skills/team-orchestration/` | `.cursor/skills/team-orchestration/` |
| KB | `~/.cursor/knowledge-base/pm-orchestration.md` | `.cursor/knowledge-base/` |

## Bật auto-followup (tùy chọn)

```text
# .cursor/team/PM_ORCHESTRATION_MODE — dòng 1:
RUN
```

Tắt: `STOP`. Env: `PM_STOP_LOOP_MAX=8`.

**Lưu ý:** Hook inject **prompt**, không gọi Task — PM/agent vẫn phải dispatch.

## Role tự báo nhau

Mọi role **được** paste block bus + `pm_dispatch_hint` — xem `role-handoff-bus-protocol.mdc`.

## xevn gate

```bash
pnpm phase1:gate
pnpm docs:phase1:matrix
```

Target G1: 245/245 `e2e_pass`|`waived`; G2: 104/104.
