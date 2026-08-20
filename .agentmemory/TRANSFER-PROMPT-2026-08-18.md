# Transfer prompt — Claude Code → Claude khác / antigravity

Dán prompt này vào Claude mới (hoặc antigravity). Đọc trước `.agentmemory/HANDOFF-2026-08-18.md` + `docs/program/TEAM_WORKING_NOW.md`.

---

```
Bạn là PM successor của dự án XeVN Ecosystem OS (multi-tenant HR/operations, NestJS + React + Prisma + Turborepo).

HÃY LÀM THEO ĐÚNG THỨ TỰ DƯỚI, KHÔNG tự sáng tạo thêm:

1. Đọc `.agentmemory/HANDOFF-2026-08-18.md` (tóm tắt handoff) → `docs/program/TEAM_WORKING_NOW.md` → `docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md` §3.
2. Canonical path = NFD `C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem`. Bash cwd thường land lên NFC mirror — resolve root bằng Python `os.scandir` tìm folder có `.git`+`apps`. **Write/Edit tool có bug ghi file mới sang NFC** — verify bằng `os.path.exists` + byte count, KHÔNG tin success message.
3. Ports đang chạy: HRM BE :28001 · HRM FE :8080 · XBOS BE :3002 · XBOS FE :5176. Persona QA `ceo@xe.vn / Xevn@2026`.

VIỆC CẦN LÀM (theo thứ tự):
A. **Audit 4 agent chết** (a0be5814 JD-BE, a4f73082 JD-FE, a5fdadd0 QA retest, a0c00f7b promote-matrix BE) — transcript 0 byte, 0 file. Quyết định: re-dispatch hay bỏ qua. Nếu re-dispatch, dùng `subagent_type: general-purpose` và ghi rõ lane role (dev-fe/dev-be/qa) trong prompt — KHÔNG có agent type dev-fe/dev-be.
B. **Next WI**: `docs/program/PHASE1_UC_CLOSURE_BACKLOG.md` fidelity P0 (~15 nhóm) — §3 rolling queue đã hết item QUEUED. Lấy work_item_id đầu tiên, dispatch 1 UC = 1 Agent = 1 lane.
C. **Git commit** theo allow_list từng work_item_id (nợ kỹ thuật từ lâu). CẤM `git add .`.

QUY TẮC BẮT BUỘC:
- Zero-residual: sau mỗi WI → audit chéo evidence → update `docs/program/AGENT_MESSAGE_BUS.md` + `docs/program/TEAM_WORKING_NOW.md` → dispatch tiếp hoặc ghi blocker. KHÔNG kết thúc bằng "sẽ…".
- `ack_status`: READY_FOR_QA / PASS_TO_PM / PASS_WITH_HOLD / FAIL_TO_PM / BLOCKED.
- U65: verify từ FE, KHÔNG seed DB. QA phải verify sống (server thật), không chỉ re-run jest.
- 1 UC = 1 Agent = 1 lane. Forbidden zones: `apps/web/hrm/src/components/payroll/policy-pack/**` · `ContractCreateStep1GeneralGrid.tsx` · `ContractCbReadOnlyCard.tsx` · `ContractCreateWizardDialog.tsx` · `apps/api/hrm-api/src/contracts-insurance/**` · `apps/api/hrm-api/src/payroll/**` · `apps/web/x-bos-core/**`.
- Dispatch packet tối thiểu: `work_item_id`, `read_first` (theo `docs/program/SUBAGENT_READ_MAP.md`), `allowed_paths`, `forbidden_paths`, `exit_criteria` (test + evidence path + ack_status).
- KHÔNG tin báo "done" từ subagent — verify bằng `os.walk` + mtime scan trước khi coi WI DONE.
```
