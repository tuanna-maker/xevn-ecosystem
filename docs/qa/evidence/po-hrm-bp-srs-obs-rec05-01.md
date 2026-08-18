# Evidence — PO-HRM-BP-SRS-OBS-REC05-01

| Mục | Nội dung |
|-----|----------|
| work_item_id | PO-HRM-BP-SRS-OBS-REC05-01 |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| priority | P2 (non-blocking OBS) |
| ack_status | **PASS_TO_PM** |
| Ngày | 2026-08-04 |
| prior_qc | `docs/qa/evidence/po-hrm-bp-srs-pdf-qc-01.md` — **R-PDF-OBS-01** |
| no_prompt_echo | true |

## completion_report

### Đã đóng

1. **R-PDF-OBS-01** — `FR-UC-BP-REC-05` **Mục đích** không còn copy nguyên văn `FR-UC-BP-REC-04`.
2. **ADD-only** — chỉ sửa khối Mục đích REC-05; thân diễn biến / BR-BP-CV-02 / đạt-không đạt giữ nguyên (đúng chủ đề lịch sử trạng thái).
3. **Nguồn extract** — cập nhật `_excel_uc_extract.json` field `Mục đích / câu hỏi giải quyết` của UC-BP-REC-05 (tránh `patch_srs` wave sau ghi đè lại bản trùng).
4. **PDF tái sinh** — `python -c "from _build_srs_pdf_khach import build_pdf_from_srs; build_pdf_from_srs()"` trong `docs/client-delivery/hrm-enterprise-blueprint/` → `SRS_HRM_ENTERPRISE_KHACH.pdf` **62** trang · ~273 KB.

### Wording sau sửa

| FR | Mục đích |
|----|----------|
| FR-UC-BP-REC-04 (giữ) | Trước khi đăng tin ngoài, tìm trong kho nội bộ; giữ lịch sử nguồn, từ chối đề nghị, mức lương mong muốn. |
| FR-UC-BP-REC-05 (**mới**) | Mỗi ứng viên lưu theo thời gian nguồn tuyển, lần từ chối đề nghị nhận việc và mức lương mong muốn — xem lại timeline trạng thái; không ghi đè mất lịch sử. |

### Verify

- MD: hai chuỗi Mục đích **khác nhau** dưới `### FR-UC-BP-REC-04` / `### FR-UC-BP-REC-05`.
- PDF extract p.~29: REC-05 Mục đích bắt đầu «Mỗi ứng viên lưu theo thời gian…»; không trùng câu mở REC-04 «Trước khi đăng tin ngoài…».
- Không invent Q-* closed · không `apps/**` · không claim SRS confirm / TechSpec mở.

### Residual / mở (không thuộc wave này)

- **R-QC-03** (EN «pipeline» trên dashboard) — vẫn OPEN non-blocking (QC PDF GWC).
- REC-04 Mục đích vẫn mang cụm lịch sử từ WBS-REC-03 gộp — ngoài scope OBS này; có thể polish riêng nếu khách yêu cầu tách câu WBS.
- Packet gửi khách READY vẫn giữ: PDF + Excel MOI + README / COVER.

## Deliverable paths

| Artifact | Path |
|----------|------|
| SRS md | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` |
| PDF khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE_KHACH.pdf` |
| Extract (anti-regress) | `docs/client-delivery/hrm-enterprise-blueprint/_excel_uc_extract.json` |
| Rebuild (PDF-only, không patch 3.A) | `cd docs/client-delivery/hrm-enterprise-blueprint && python -c "from _build_srs_pdf_khach import build_pdf_from_srs; build_pdf_from_srs()"` |
| Full rebuild (patch 3.A từ extract rồi PDF) | `python _build_srs_pdf_khach.py` |

## Handoff

- **ack_status:** PASS_TO_PM
- **next_owner:** pm
- **next_dispatch_prompt:** Đóng OBS R-PDF-OBS-01 trên QC residual; giữ READY `PO-HRM-BP-DOCS-SPONSOR-SEND-01` (PDF đã refresh Mục đích REC-05). Không invent Q-*.
