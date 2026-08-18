# Evidence — PO-HRM-BP-SRS-PDF-KHACH-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | PO-HRM-BP-SRS-PDF-KHACH-01 |
| from_role | ba-docs |
| to_role | pm |
| ack_status | **PASS_TO_PM** |
| Ngày | 2026-08-04 |

## completion_report

### Đã đóng

1. **Đọc Excel MOI** — `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` sheet `03_Tinh_huong_nghiep_vu` (44 tình huống) + `03b_Dien_bien_chi_tiet` (**260** bước).
2. **SRS markdown ADD-only** — `SRS_HRM_ENTERPRISE.md` **v0.5**:
   - Giữ nguyên **16** FR ưu tiên đủ 7 mục.
   - Bổ sung **28** UC (§3.A): mục đích · tác nhân · diễn biến (từ 03b) · quy tắc · đạt/không đạt.
   - Tổng **44/44** header `FR-UC-BP-*` trong file.
3. **PDF khách** — `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_KHACH.pdf`
   - Tool: **fpdf2** + font Segoe UI (Unicode tiếng Việt).
   - ~**62** trang · mục lục · ~273 KB.
4. **README** — `README_SPONSOR_REVIEW.md` trỏ PDF là mục đọc ưu tiên #0.
5. Script tái sinh: `_extract_excel_uc.py` · `_build_srs_pdf_khach.py`.

### Cấm đã tuân

- Không invent Q-* mới; không TechSpec/DB/API depth; không `apps/**`; không seed.
- Body khách: không work_item / pipeline meta; diễn biến 03b đã lọc gợi ý lane kỹ thuật.

### Residual / mở

- 28 UC bổ sung **chưa** đủ 7 mục kỹ thuật (đúng scope wave — đủ khung đọc).
- Quyết định Q-* vẫn chờ chữ ký khách (không đổi gói).
- Spot QC tùy chọn trước khi gửi (banned phrases / 2 FR ưu tiên + 2 UC §3.A).

## Deliverable paths

| Artifact | Path |
|----------|------|
| PDF gửi khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_KHACH.pdf` |
| SRS markdown | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (v0.5) |
| README gói | `docs/client-delivery/hrm-enterprise-blueprint/README_SPONSOR_REVIEW.md` |

## next_owner

**pm** — gửi khách / cover note; hoặc **qc** spot-check PDF nếu cần gate trước gửi.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DOCS-SPONSOR-SEND-01
from_role: pm
to_role: pm (cover) hoặc qc (spot)
entry_criteria: PDF SRS_HRM_ENTERPRISE_KHACH.pdf v0.5 tồn tại; README trỏ PDF
exit_criteria: Cover gửi khách kèm PDF + Excel MOI; hoặc QC spot PASS_TO_PM
cấm: invent Q-*; claim SRS đã xác nhận khách; mở TechSpec depth
evidence_path: docs/qa/evidence/po-hrm-bp-srs-pdf-khach-01.md
```
