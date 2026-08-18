# PO-HRM-BP-UC-BR-DEPTH-01 — evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-UC-BR-DEPTH-01` |
| **role** | ba-process |
| **date** | 2026-08-04 |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `ba-docs` |
| **deliverable** | `docs/client-delivery/hrm-enterprise-blueprint/UC_BR_MATRIX_DEPTH.md` |
| **sources** | `PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md` §2–§3 · PPT media image4/5/6/7/8/9/10/11/12/13 · mindmap 27 lá / `doc-ent-hrm-mmap-01` |

## Closed

- Ma trận UC/BR/AC độ sâu edge-case (REC/CORE/ATT/PAY).
- Cover đủ: định biên 12 tháng · quét CV · mail PV · public vs C&B · OCR checklist · asset recall · shift rules · leave accrual/carry/OT/ốm · Fri–Mon working days · timesheet SoT · payroll engine · split-month · lifecycle Offer→Active→Terminate.
- Gap AS-IS vs TO-BE: PARTIAL / MISSING / CONFLICT (không sửa code).
- Câu hỏi khách chốt §4.1.

## Residual

- Program checkbox «Depth matrix» có thể đánh dấu khi PM sync program file.
- Merge WBS/UC_INVENTORY ID nếu ba-docs dùng mã khác — align synonym table trong wave merge.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-WBS-SRS-01 (merge depth)
from_role: pm
to_role: ba-docs
lane: governance
priority: P0
no_prompt_echo: true
read_first:
  - docs/client-delivery/hrm-enterprise-blueprint/UC_BR_MATRIX_DEPTH.md
  - docs/program/customer-blueprint/PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md
task: Merge UC-BP-* / BR-BP-* vào WBS_HRM_ENTERPRISE.md + UC_INVENTORY.md; ưu tiên FR SRS cho edge P0 BR-BP-LV-05 (phép T6–T2) và BR-BP-SPL-01 (split-month không thuế kép) + BR-BP-TS-03 (bảng công SoT). Không đè docs/hrm/SRS.md. Exit: PASS_TO_PM với path 3 file khách.
```
