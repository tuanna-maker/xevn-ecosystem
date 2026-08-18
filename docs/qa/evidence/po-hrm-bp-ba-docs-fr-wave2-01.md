# Evidence — PO-HRM-BP-BA-DOCS-FR-WAVE2-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-BA-DOCS-FR-WAVE2-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **srs_path** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (v0.4) |

## Wave-2A — đóng

Sáu FR stub ưu tiên đã đủ 7 mục (thông tin chung · đầu vào · luồng chính · quy tắc · trường hợp đặc biệt · sequenceDiagram · Diễn biến 4 cột):

1. FR-UC-BP-REC-01b — REQ_REC_003 · BR-BP-HC-04  
2. FR-UC-BP-REC-02 — REQ_REC_001 · BR-BP-HC-05 · Q-REC-HEADCOUNT chờ chốt  
3. FR-UC-BP-REC-02b — REQ_REC_001 · BR-BP-HC-06 · Q-REC-HEADCOUNT chờ chốt (đề xuất chặn đến BOD)  
4. FR-UC-BP-ATT-02 — TIME-002 · BR-BP-SHF-02  
5. FR-UC-BP-ATT-09 — REQ_NP_003; REQ_NP_006 · BR-BP-LV-06/05 · Q-LEAVE-UNIT chờ chốt  
6. FR-UC-BP-CORE-08 — HR-005 · BR-BP-RD-01  

## Không làm / giữ

- Không rewrite 10 FR đủ 7 mục đợt trước.  
- Không Wave-2B (ATT-03b, ATT-04, ATT-04b, REC-06…) trong phiên này.  
- Không giả Decision đã chốt khách.  
- CLEAN meta: xem `po-hrm-bp-docs-ba-clean-01.md`.

## next_dispatch_prompt

QC docs re-spot-check sau wave-2 (CLEAN + 6 FR) — hoặc ba-docs wave-3 Lịch nếu QC GO.
