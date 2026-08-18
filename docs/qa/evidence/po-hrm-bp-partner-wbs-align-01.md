# Evidence — PO-HRM-BP-PARTNER-WBS-ALIGN-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-BP-PARTNER-WBS-ALIGN-01` |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| ack_status | **PASS_TO_PM** |
| date | 2026-08-04 |
| no_prompt_echo | true |

## Mission closed

Align WBS + UC_INVENTORY + SRS delta với `UC_BR_MATRIX_DEPTH.md` **v1.1** — mọi Task/UC có cột `partner_req_id`. Merge **APPEND** (không wipe).

## Artifacts touched (client-delivery blueprint only)

| File | Ver | Change |
|------|-----|--------|
| `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE.md` | **0.3** | Tách Task P0: REC-01b auto YCTD · REC-02/02b trong/ngoài ĐB · CORE-06 HR-005 · CORE-07 BH · ATT-05 hold+NP-003 · PAY-05 phiếu/nhóm · Phụ lục B Q-* đủ 7 · Phụ lục D coverage 30/30 |
| `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | **0.3** | 34→**44** UC; thêm REC-01b/02b, CORE-02b/08/09/10, ATT-03b/04b, PAY-08/09; ánh xạ REQ→UC 30/30; FR ưu tiên **16** |
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | **0.3** | APPEND stub P0: REC-01b, REC-02, REC-02b, CORE-08, ATT-02, ATT-09; TOC 16; giữ 10 FR đủ 7 mục (L-001/L-004 đã có) |

**Cấm đã giữ:** không đụng `docs/hrm/SRS.md` · `apps/**` · DB_DESIGN wave.

## P0 edges — trace

| Edge | partner_req_id | WBS | UC | SRS |
|------|----------------|-----|----|-----|
| REC trong ĐB | REQ_REC_001 | WBS-REC-02 | UC-BP-REC-02 | stub FR-UC-BP-REC-02 |
| REC ngoài ĐB | REQ_REC_001 | WBS-REC-02b | UC-BP-REC-02b | stub FR-UC-BP-REC-02b |
| Auto YCTD | REQ_REC_003 | WBS-REC-01b | UC-BP-REC-01b | stub FR-UC-BP-REC-01b |
| NP hold | REQ_NP_003 | WBS-ATT-05 | UC-BP-ATT-09 | stub FR-UC-BP-ATT-09 |
| NP unit / trừ ngày làm | REQ_NP_006 | WBS-ATT-05 | UC-BP-ATT-08/09 | FR đủ 7 + stub hold |
| L-001 SoT | REQ_L_001 | WBS-ATT-06 | UC-BP-ATT-10/11 · PAY-01 | FR đủ 7 mục |
| L-004 merge | REQ_L_004 | WBS-PAY-03 | UC-BP-PAY-04 | FR đủ 7 mục |
| TIME-002 | TIME-002 | WBS-ATT-01 | UC-BP-ATT-02 | stub FR-UC-BP-ATT-02 |
| HR-005→payroll | HR-005 | WBS-CORE-06 | UC-BP-CORE-08 | stub FR-UC-BP-CORE-08 |
| Q-* list | §8 matrix | Phụ lục B WBS | — | §6.1 SRS |

## Coverage check (script)

```
WBS missing REQ: 0
INV missing REQ: 0
WBS Task sections with partner_req_id: 27
Coverage Phụ lục D / inventory map: 30/30 REQ
```

Đối chiếu ma trận §4: **30/30** REQ có Task WBS + UC inventory.

## Residual / not promoted

| Item | Note |
|------|------|
| Stub P0 chưa đủ sequence + bảng diễn biến 4 cột | Cố ý — chờ Decision Q-REC-HEADCOUNT / Q-LEAVE-UNIT / danh mục KT-KL |
| FR lịch 28 UC | Đợt sau sau sponsor confirm inventory |
| HTML build pipeline | Blueprint gói giấy — chưa gắn `pnpm docs:srs:html` (373 FR hệ sinh thái) |

## completion_report

- Đã đóng: WBS 0.3 + UC inventory 0.3 + SRS 0.3 stub P0; mọi Task/UC có `partner_req_id`; 30/30 REQ; Q-* trong WBS Phụ lục B.
- Còn mở: đủ 7 mục cho 6 stub; FR lịch; xác nhận khách Decision.

## next_owner

`qc` (docs spot-check) **hoặc** PM chuẩn bị sponsor review packet.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-PARTNER-DOCS-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P0

Spot-check gói blueprint HRM enterprise sau align partner v1.1:
- docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE.md v0.3 — mọi Task có partner_req_id; Phụ lục D 30/30; Phụ lục B Q-*
- UC_INVENTORY.md v0.3 — 44 UC; không thiếu REC-01b/02b, CORE-08, ATT-09, PAY-08/09
- SRS_HRM_ENTERPRISE.md v0.3 — TOC 16; stub P0 có partner_req_id; không prompt-echo; không đụng docs/hrm/SRS.md
- evidence: docs/qa/evidence/po-hrm-bp-partner-wbs-align-01.md
exit: PASS_TO_PM GO/GWC hoặc residual list
HOẶC: PM đóng gói sponsor review (WBS+UC+SRS+matrix+Q-*) nếu bỏ qua QC docs.
```

## ack_status

**PASS_TO_PM**
