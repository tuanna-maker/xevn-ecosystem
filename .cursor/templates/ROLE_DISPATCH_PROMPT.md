# Role dispatch prompt (global — mọi dự án)

## Bus block (paste vào AGENT_MESSAGE_BUS)

```markdown
## {ISO8601} | {from_role} -> {to_role} | {work_item_id}
- work_item_id: {ID}
- from_role: qa|dev-be|dev-fe|pm|...
- to_role: pm|qa|dev-be|...
- entry_criteria: ...
- exit_criteria: ...
- evidence_path: docs/qa/evidence/{file}.md
- needed_by: ...
- ack_status: **PASS_TO_PM** | **READY_FOR_QA**
- summary: ...
- pm_dispatch_hint: {optional — gợi ý work_item kế}
- completion_report: {required — what closed, what remains}
- next_dispatch_prompt: {required — prompt PM can paste to dispatch next owner}
```

## Cursor Task (PM gọi)

```
work_item_id: {ID}
from_role: pm
to_role: dev-be|dev-fe|qa|qc
ack_status target: READY_FOR_QA

## Context
- evidence: {path}
- blocker: ...

## Tasks
1. ...
2. Evidence file + tests PASS
No commit unless user asks.
```

## PM checklist (60s)

1. Bus tail — `PASS_TO_PM` chưa có `PM -> DISPATCHED` sau?
2. Mở evidence — not promoted / PM dispatch / **§ Residual** (kể cả lỗi nhỏ)
3. **Task ngay** mọi residual — **không hỏi user**
4. Ghi bus `PM -> role | DISPATCHED`

## Residual block (Dev/QA ghi cuối evidence)

```markdown
## Residual (PM auto-dispatch — do not wait for user)
| ID | Severity | Owner | work_item_hint |
|----|----------|-------|----------------|
| R-01 | P2 | dev-be | P1-FIX-... — mô tả 1 dòng |
```

## Member output contract (mandatory)

Every role (`dev-be`, `dev-fe`, `dev-mobile`, `devops`, `qa`, `qc`, `sa`, `ba-*`, `technical-manager`) must end handoff with:

1. `completion_report` — concise closed scope + objective status.
2. `next_dispatch_prompt` — ready-to-run prompt for the next owner (no placeholders).
3. `next_owner` + `work_item_id` hint.

If a member finishes **2 tasks in the same session/day**, this block is **still mandatory** (no confirm-only response).
