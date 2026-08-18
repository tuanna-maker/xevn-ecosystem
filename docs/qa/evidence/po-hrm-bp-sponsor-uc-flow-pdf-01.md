# Evidence — PO-HRM-BP-SPONSOR-UC-FLOW-PDF-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | PO-HRM-BP-SPONSOR-UC-FLOW-PDF-01 |
| from_role | ba-docs |
| to_role | pm |
| ack_status | **PASS_TO_PM** |
| lane | governance |
| ngày | 2026-08-05 |

## completion_report

### Đã đóng

1. **PDF gói chốt luồng UC:** `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UC_FLOW_CHOT.pdf`
   - **29 trang** · **45/45** mã `UC-BP-*` (inventory 0.3.3)
   - Cover: mục đích chốt + cách đọc với `SPONSOR_CHOT_REMAINING.xlsx` sheet 03
   - **Phần A — 16 UC Ưu tiên:** diễn biến đầy đủ (bảng 4 cột) trích từ `SRS_HRM_ENTERPRISE.md` FR 7 mục
   - **Phần B — 29 UC Lịch:** khung ngắn gắn nhãn «khung — cần EXPAND» (skeleton từ §3.A / mục đích · luồng)
   - Tiếng Việt đơn giản; không prompt-echo; không invent câu trả lời Q-* từ phiếu fill
2. **Generator:** `docs/client-delivery/hrm-enterprise-blueprint/_build_sponsor_uc_flow_pdf.py`  
   Rebuild: `python _build_sponsor_uc_flow_pdf.py`
3. **Pointer:** cập nhật `SPONSOR_CHOT_REMAINING_README.md` + `W3_PAPER_PACKET_SPONSOR.md` §2 / §5 → PDF mới
4. **Không** wipe / đè `SRS_HRM_ENTERPRISE.md`; **không** đụng `apps/**`

### Kiểm chứng nội bộ

| Check | Kết quả |
|-------|---------|
| Inventory parse | 45 UC |
| Ưu tiên có bước diễn biến | 16/16 (0 empty) |
| Lịch có khung bước | 29/29 (0 empty) |
| PDF build | exit 0 · pages=29 |

### Residual / không làm trong seat

- Không nâng 29 Lịch lên đủ 7 mục FR (đúng phạm vi: khung chốt sheet 03).
- Không rebuild `SRS_HRM_ENTERPRISE_KHACH.pdf` (đã có sẵn; gói này là bản tập trung luồng).

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-SPONSOR-UC-FLOW-HANDOFF-01
role: pm
Gửi sponsor: SPONSOR_CHOT_REMAINING.xlsx + SPONSOR_UC_FLOW_CHOT.pdf (29 trang).
Nhắc đọc PDF Phần B trước khi điền sheet 03 (EXPAND/GĐ2/OUT/WAIVER).
Không hỏi lại 34 dòng đã fill. Sau sponsor trả sheet 03 → ba-docs EXPAND theo quyết định.
```

## evidence_path

`docs/qa/evidence/po-hrm-bp-sponsor-uc-flow-pdf-01.md`

## Deliverable paths

| Artifact | Path |
|----------|------|
| PDF | `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UC_FLOW_CHOT.pdf` |
| Generator | `docs/client-delivery/hrm-enterprise-blueprint/_build_sponsor_uc_flow_pdf.py` |
| README | `docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_CHOT_REMAINING_README.md` |
| W3 packet | `docs/client-delivery/hrm-enterprise-blueprint/W3_PAPER_PACKET_SPONSOR.md` |

**Page count:** 29  
**ack_status:** PASS_TO_PM
