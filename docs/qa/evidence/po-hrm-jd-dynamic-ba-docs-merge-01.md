# Evidence — PO-HRM-JD-DYNAMIC-BA-DOCS-MERGE-01

**Role:** ba-docs · **lane:** governance  
**Date:** 2026-08-06  
**ack_status:** PASS_TO_PM  
**next_owner:** pm

## completion_report

### Closed
- ADD-only merge FR-UC-BP-REC-00a · 00b · 00c vào `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md`
- EXPAND nhẹ FR-UC-BP-REC-00 (đầu vào · BR · mục đích) — **không wipe** 7 mục spine; giữ liên kết YCTD
- Inventory §3.A: +0a · 0b · 0c; khóa **50** UC; phiên bản tài liệu **0.9**
- Thuật ngữ khách: Catalog trường JD · Bố cục JD (L1 mặc định pháp nhân + ảnh bố cục khi lưu bản JD)
- Phản ánh chốt Option A / Q1 / Q6 **trong prose nghiệp vụ** (không stamp mã câu hỏi):
  - Catalog ở Cài đặt; kéo bố cục tại Thư viện JD
  - Bố cục mặc định pháp nhân + giữ ảnh bố cục khi Lưu JD
  - Form động + xem phân tầng; YCTD chỉ gắn mã JD hiệu lực
- Mỗi FR mới đủ 7 mục (thông tin chung · đầu vào · luồng · BR · đặc biệt · sequence · diễn biến)
- `no_prompt_echo: true` — không work_item / Option A / Q* trong câu văn khách
- HTML rebuild: **không bắt buộc** wave này (markdown SRS delta đủ theo exit)
- **Cấm** `apps/**` — không đụng code

### Residual
- HTML `pnpm docs:srs:html` / audit 373: ngoài phạm vi blueprint enterprise path lần này — PM quyết định khi promote gói HTML khách tổng
- Q2 nguồn danh sách chọn (catalog XBOS): vẫn mở cho ba-data / sa — không chặn merge giấy
- TechSpec / DB_DESIGN / API_DESIGN deepen: owner sa / ba-data sau confirm giấy

## Verify (spot-check)

| Check | Result |
|-------|--------|
| FR-UC-BP-REC-00 còn nguyên khối + ADD liên kết 00a/b/c | PASS |
| FR-UC-BP-REC-00a / 00b / 00c có trong SRS | PASS |
| YCTD gắn mã / chặn JD ngừng còn trong REC-00 và 00c | PASS |
| Không wipe stub REC-00 | PASS |
| Không prompt-echo / work_item trong thân FR khách | PASS |
| apps/** untouched | PASS |

## Files

| Path | Role |
|------|------|
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | SoT khách — merge ADD |
| `docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md` | Nguồn delta process |
| `docs/qa/evidence/po-hrm-jd-dynamic-ba-docs-merge-01.md` | Evidence wave này |

## next_dispatch_prompt

```text
work_item_id: PO-HRM-JD-DYNAMIC-BA-DOCS-MERGE-01 — closed
next_owner: pm
read_evidence: docs/qa/evidence/po-hrm-jd-dynamic-ba-docs-merge-01.md
suggested_next:
  - Intake PASS_TO_PM ba-docs merge
  - Nếu DATA+ARCH đã READY: unlock TechSpec deepen / slice Dev theo gate G2–G3
  - QA J-HRM-JD-01..03 chỉ sau Dev READY_FOR_QA (U65 FE-only)
  - Không claim HTML 02_SRS rebuild trừ khi PM mở wave docs:srs
```
