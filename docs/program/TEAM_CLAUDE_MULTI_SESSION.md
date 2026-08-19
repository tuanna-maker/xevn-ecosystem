# Claude — nhiều session song song (sponsor)

## Bạn nhớ đúng: Claude Code **Agent Teams** (experimental)

Anthropic có tính năng **nhiều instance Claude Code làm một team** — teammate **nhắn nhau trực tiếp**, task list chung, lead phân việc. Khác **subagent** trong một session (chỉ báo cáo lên lead, không chat peer).

| Cách | Nói chuyện peer? | Bật thế nào |
|------|------------------|-------------|
| **2 terminal `claude` tay** | Không (trừ khi cùng đọc file) | Mở 2 cửa sổ — dùng peer bus bên dưới |
| **Agent Teams** (1 lead spawn teammates) | **Có** — messaging + shared tasks | Env `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` · doc: [Agent teams](https://code.claude.com/docs/en/agent-teams) |
| **Cross-session messaging** (doc riêng) | Có, không cần full team | Xem [cross-session messaging](https://code.claude.com/docs/en/cross-session-messaging) trên cùng site |

**Windows (máy bạn):** split-pane team thường cần **tmux/iTerm2**; **Windows Terminal / VS Code terminal** thường chỉ **in-process** teammates (vẫn chat được, UI kém hơn). Feature **tắt mặc định**, đang experimental (token cao, đôi khi teammate kẹt).

**Gợi ý XeVN:** Lead session paste roster từ `PEER_PM_COLLAB.md` §5 AUDIT+ROSTER; teammate A = catalog consumer, B = CTR U65 — **cùng canonical root** + `CLAUDE.md` marker.

```powershell
# Ví dụ bật team (session lead) — settings.json hoặc env user
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS = "1"
cd "C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem"
claude --dangerously-skip-permissions
# Trong chat lead: «Tạo agent team: 2 teammate dev-fe, WI … và …, đọc PEER_PM_COLLAB tail»
```

Khi **không** bật Agent Teams, dùng bus file (mục dưới).

---

**Fallback / song song với Cursor:** không có kênh chat tự động giữa 2 cửa sổ Claude thuần. Điều phối qua artifact (append-only):

| SoT | Mục đích |
|-----|----------|
| `docs/program/PEER_PM_COLLAB.md` §5 | Handoff · DONE · DISPATCH · **đọc tail trước mỗi Edit** |
| `docs/program/TEAM_CLAUDE_STATUS.md` | WI nào DONE / IN_PROGRESS |
| `docs/program/AGENT_MESSAGE_BUS.md` | Cursor PM · QA verdict |
| `.cursor/team/inbox/peer-pm.jsonl` | Ping (optional hook) |

## Mẫu vận hành 2 session

| Session | Vai trò gợi ý | WI |
|---------|----------------|-----|
| **A** (terminal 1) | Execution dev-fe | `PO-HRM-SETTINGS-CATALOG-CONSUMER-FE-01` |
| **B** (terminal 2) | Execution dev-fe **khác path** hoặc **PARK** nếu A đang chạy cùng WI | `HRM-CTR-U65-TPL-UV-FE-PATH-01` **sau** A commit/evidence **hoặc** narrow P2 PAY stale |

**Cấm:** hai session cùng sửa `Payroll*.tsx` + `Settings*.tsx` catalog focus cùng lúc.

## Paste vào session mới (session B)

```text
Canonical root: docs/program/PATH_CANONICAL_LOCK.md
Đọc tail PEER_PM_COLLAB §5 (entry AUDIT + ROSTER mới nhất).
Đọc TEAM_CLAUDE_MULTI_SESSION.md (file này).
Chỉ nhận 1 work_item_id chưa IN_PROGRESS trên TEAM_CLAUDE_STATUS.
Trước Edit: git status — nếu file đang M bởi session khác → PARK, append peer INFORM.
Xong: evidence + TEAM_CLAUDE_STATUS + PEER DONE.
```

Session A giữ paste từ `TEAM_CLAUDE_PASTE_INTO_TERMINAL.txt` (doc pack + guards).

## Cursor-PM

Một Composer = PM + audit + QA dispatch; **không** cần “2 Claude nói chuyện” — chỉ cần **cùng đọc peer tail**.
