# Evidence — PO-HRM-BP-DOCS-BA-CLEAN-01 (+ Wave-2A FR)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-DOCS-BA-CLEAN-01` (fold FR `PO-HRM-BP-BA-DOCS-FR-WAVE2-01`) |
| **from_role** | ba-docs |
| **to_role** | pm |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | true |

## Part A — CLEAN (R-QC-01 · R-QC-02)

| Condition | Action | Result |
|-----------|--------|--------|
| R-QC-01 README | Stamp **v0.4** (sau Wave-2A) · **44** UC · **16** FR đủ 7 mục | PASS |
| R-QC-02 meta | Strip `work_item*` khỏi WBS · UC_INVENTORY · SRS · UC_BR_MATRIX · PARTNER catalog | PASS — grep `work_item`/`PO-HRM` trên 6 file gửi README = 0 |
| ADR / DATA_OWNERSHIP / API_BOUNDARY | **Bỏ khỏi** danh sách README gửi khách (giữ file nội bộ) | PASS |
| Q-PAY-FORMULA | Không giả confirm — README + Decision packet vẫn «chưa xác nhận / chờ chữ ký» | PASS |
| HOLD TechSpec/DB/API | Giữ HOLD trên README + SRS | PASS |

**Packet gửi khách (README):** WBS · UC_INVENTORY · SRS · DECISION_PACKET_Q_PAY_FORMULA · UC_BR_MATRIX_DEPTH · PARTNER_REQ_CATALOG.

## Part B — Wave-2A FR (6 stub → đủ 7 mục)

| FR | partner_req_id | BR | Decision mở |
|----|----------------|-----|-------------|
| FR-UC-BP-REC-01b | REQ_REC_003 | BR-BP-HC-04 | — |
| FR-UC-BP-REC-02 | REQ_REC_001 | BR-BP-HC-05 | Q-REC-HEADCOUNT chờ chốt |
| FR-UC-BP-REC-02b | REQ_REC_001 | BR-BP-HC-06 | Q-REC-HEADCOUNT chờ chốt (đề xuất: chặn đến BOD) |
| FR-UC-BP-ATT-02 | TIME-002 | BR-BP-SHF-02 | — |
| FR-UC-BP-ATT-09 | REQ_NP_003; REQ_NP_006 | BR-BP-LV-06 · LV-05 | Q-LEAVE-UNIT chờ chốt |
| FR-UC-BP-CORE-08 | HR-005 | BR-BP-RD-01 | — |

**Kiểm nhanh SRS:** `sequenceDiagram` = **16** (= 16 FR ưu tiên) · nhãn `*(stub P0)*` = **0** · `work_item` trong SRS = **0** · phiên bản **0.4**.

**Giữ nguyên:** 10 FR đã đủ 7 mục trước wave (REC-01, REC-08, CORE-01/02, ATT-08/10/11, PAY-01/02/04) — không rewrite thân.

**Chưa làm Wave-2B** (ATT-03b, ATT-04/04b, REC-06…) — còn trong `FR_BACKLOG_REMAINING.md`.

## Paths

- `docs/client-delivery/hrm-enterprise-blueprint/README_SPONSOR_REVIEW.md`
- `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (v0.4)
- `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE.md`
- `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md`
- Chi tiết FR wave: `docs/qa/evidence/po-hrm-bp-ba-docs-fr-wave2-01.md`

## completion_report

- **Đóng:** CLEAN R-QC-01/02; Wave-2A 6 FR đủ 7 mục; packet README không còn ADR/DATA/API meta echo.
- **Mở:** Wave-2B Lịch P0; Decision Q-* chờ khách; QC re-spot-check.
- **Không claim:** Q-PAY-FORMULA đã chốt · TechSpec/DB/API mở · implement DONE.

## next_owner

`pm` → **qc** re-spot-check CLEAN + 6 FR Wave-2A

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DOCS-QC-02
from_role: pm
to_role: qc
lane: governance
priority: P0
no_prompt_echo: true
entry_criteria: docs/qa/evidence/po-hrm-bp-docs-ba-clean-01.md · SRS v0.4 · README packet
exit_criteria:
  1) Spot-check README v0.4 / 44 UC / 16 FR; không work_item trên packet gửi
  2) Spot ≥1 FR Wave-2A / module (REC-01b hoặc 02/02b · CORE-08 · ATT-02 hoặc 09) đủ 7 mục + sequence + Diễn biến
  3) Xác nhận 10 FR cũ không bị rewrite; Decision mở vẫn «chờ chốt»
  4) Không mở TechSpec/DB/API; không giả confirm Q-PAY
evidence_path: docs/qa/evidence/po-hrm-bp-docs-qc-02.md
ack_status target: PASS_TO_PM
```
