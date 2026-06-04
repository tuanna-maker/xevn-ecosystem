# Role dispatch prompt (copy → Task tool hoặc bus)

Mọi role **có thể** tạo handoff cho role khác bằng **một block chuẩn** dưới đây. PM đọc `docs/program/AGENT_MESSAGE_BUS.md` (đuôi file) + `ack_status` để tự dispatch.

## Khi nào dùng

| `ack_status` | Ai nhận | Hành động |
|--------------|---------|-----------|
| `READY_FOR_QA` | QA | Retest + promote matrix |
| `PASS_TO_PM` | PM | Phân tích gap → dispatch Dev/QA |
| `READY_FOR_QC` | QC | Go/No-Go program |
| `BLOCKED` | PM + owner | Escalate / waiver |

## Template (điền vào bus + evidence)

```markdown
## {ISO8601} | {from_role} -> {to_role} | {work_item_id}
- work_item_id: {WORK_ITEM_ID}
- from_role: {qa|dev-be|dev-fe|pm|...}
- to_role: {pm|qa|dev-be|dev-fe}
- lane: execution|governance
- entry_criteria: {điều kiện vào}
- exit_criteria: {điều kiện ra — ví dụ G2 104/104, jest 182/182}
- evidence_path: docs/qa/evidence/{file}.md
- needed_by: {deadline hoặc gate name}
- ack_status: **READY_FOR_QA** | **PASS_TO_PM** | **READY_FOR_QC**
- summary: {1–3 câu: PASS/FAIL, số UC, blocker P0}
- pm_dispatch_hint: {optional — gợi ý work_item_id tiếp theo, ví dụ P1-CLOSE-BE-W5}
```

## Prompt cho Cursor Task (PM paste)

```
work_item_id: {WORK_ITEM_ID}
from_role: pm
to_role: {dev-be|dev-fe|qa|qc}
ack_status target: READY_FOR_QA

## Context
- baseline: G1 {x}/245, G2 {y}/104
- blocker: {mô tả ngắn}
- evidence: {path}

## Tasks
1. ...
2. jest/live probes PASS
3. evidence: docs/qa/evidence/{file}.md
No commit unless user asks.
```

## PM tự nhận việc (checklist 60s)

1. Đọc **120 dòng cuối** `docs/program/AGENT_MESSAGE_BUS.md` — tìm `PASS_TO_PM` / `READY_FOR_QA` chưa có `PM ->` dispatch sau đó.
2. Mở `evidence_path` — mục **PM dispatch** / **not promoted**.
3. `pnpm phase1:gate` nếu cần số UC mới.
4. Gọi Task **ngay** (không chờ user nhắc).
5. Ghi bus `PM -> role | DISPATCHED`.
