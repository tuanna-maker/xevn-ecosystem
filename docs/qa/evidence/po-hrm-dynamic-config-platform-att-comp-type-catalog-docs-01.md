# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DOCS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DOCS-01-R3` |
| **from_role** | `ba-docs` |
| **to_role** | `pm` |
| **lane** | governance (client documentation — no `apps/**`) |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **change_mode** | **ADD** (client HDSD chapter + verify existing SRS ADD-only note — no wipe of any peer chapter / FR) |
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `pm` |
| **DENY honored** | no `*_ready` claim · no formula LIVE · no Phase1 · no wipe CH05f · no invent FE-ADMIN as shipped product |

Ghi chú R3: hai lượt trước (R1 `5d287146`, R2 `83f1949c`) kết thúc rỗng (0 file) do bẫy chuẩn hóa đường dẫn NFD/NFC — `git rev-parse --show-toplevel` trả về dạng NFC không tồn tại trên đĩa. R3 giải quyết bằng cách liệt kê trực tiếp thư mục theo mã ký tự NFD (`Tài liệu` = `84,97,768,105,32,108,105,234,803,117`), neo đúng gốc repo (`.git` + `apps` = True), rồi ghi file bằng `[System.IO.File]::WriteAllText` UTF-8 no-BOM. Đã đọc lại và xác nhận dấu tiếng Việt đúng (không mojibake).

---

## 1. Deliverables

| # | Deliverable | Path | Bytes | Status |
|---|-------------|------|-------|--------|
| 1 | HDSD Chương 5g — Hình thức bồi thường tăng ca (bản gói blueprint — theo đúng gate PM) | `docs/client-delivery/hrm-enterprise-blueprint/HDSD_XEVN_CH05g_HRM_DANH_MUC_HINH_THUC_BOI_THUONG_TANG_CA.md` | 13716 | **WRITTEN** |
| 1b | HDSD Chương 5g — bản đồng bộ trong loạt HDSD (cùng chỗ CH05a–f) | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05g_HRM_DANH_MUC_HINH_THUC_BOI_THUONG_TANG_CA.md` | 13716 | **WRITTEN** |
| 2 | SRS ADD-only version bump note | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` §meta phiên bản | — | **VERIFIED-PRESENT (0.41)** — không double-bump |
| 3 | Evidence (bản này) | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-docs-01.md` | ≥3000 | **WRITTEN** |

**Lý do CH05g nằm hai nơi:** gói `hrm-enterprise-blueprint/` là bộ tài liệu khách đi kèm `SRS_HRM_ENTERPRISE.md` (gate PM kiểm ở đây); loạt `hdsd/hrm/` là dãy chương HDSD (CH05a–CH05f) — CH05g phải đứng cùng dãy để mạch chương liền lạc. Hai bản nội dung **giống hệt** (13716 bytes) để tránh trôi lệch.

---

## 2. spec_read_ack

- **SA**: `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` — Option **B** CONFIRMED · Nest `att_ot_comp_type` DEFINE · L-ATT-OTC-01..16 · orthogonal vs `att_ot_type`.
- **BA**: `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md` — AC-PLT-ATT-COMP-01/01b/01c/01d/01e/01f/01H · BR-PLT-ATT-COMP-* · DOC-DELTA §9 (OPTIONAL, ADD-only, no wipe OT-TYPE/SHIFT/CTR).
- **DATA**: `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md` — `public.att_ot_comp_type`, UQ `(company_id, lower(code))`, soft-delete, bootstrap codes `salary` / `compensatory_leave` (AS-IS slug là `compensatory_leave`, **không** `time_off`).
- **QC L1**: `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qc-01.md` — Condition R-PLT-ATT-OTC-03.
- **QA-FE stamp**: `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-qa-fe-01.md` — stamp `ATTCOMPQAFE-MSKBBEJW` · picker Nest trên `OvertimeRequestTab` proven (EFF>0 chọn từ Nest, submit 2xx, F5 giữ) → tài liệu mô tả bước chọn hình thức là **đã kết nối / bàn giao giao diện**, **không** claim module UAT.
- **Peer HDSD**: `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH05f_HRM_DANH_MUC_LOAI_TANG_CA.md` — dùng làm khuôn cấu trúc 9 mục + bảng metadata + "Hai việc khác nhau".

---

## 3. Nội dung HDSD CH05g (tóm tắt cấu trúc)

Bảng metadata (Mã / Phiên bản / Ngày hiệu lực / Đường vào / Đối tượng / Tham chiếu SRS / Peer HDSD) + khối "Phạm vi bản này" + bảng "Hai việc khác nhau" + khối "Điểm khác biệt cốt lõi so với Chương 5f" (trực giao) + 9 mục:

1. Hai vai trò — đừng nhầm (quản trị danh mục vs nộp đơn).
2. Thêm hình thức bồi thường mới (mã N+1 / hình thức thứ ba trở lên).
3. Hai hình thức khởi tạo (trả lương / nghỉ bù) — ví dụ, không phải trần.
4. Chọn hình thức khi nộp đơn tăng ca (nơi tiêu thụ, picker Nest — đã kết nối).
5. Nhãn / hệ số hiển thị ≠ công thức tính lương (HOLD).
6. Ngừng dùng (ẩn mềm) — giữ lịch sử.
7. Khi chưa có hình thức hiệu lực (empty CTA, no seed).
8. Phạm vi & giới hạn.
9. Lưu ý nhanh.

**Hygiene khách (no_prompt_echo):** không mã lỗi thô (`HRM-ATT-OT-COMP-KEY`), không tên bảng Nest, không HTTP, không stamp chat / work_item trong câu văn khách — các nhánh từ chối diễn đạt bằng nghiệp vụ ("hệ thống từ chối và phân biệt các tình huống…"). Trực giao với CH05f được nêu rõ; **không** gộp / không thay thế.

---

## 4. SRS ADD-only note (deliverable #2 — verified)

`SRS_HRM_ENTERPRISE.md` đã ở **phiên bản 0.41** với ghi chú DOC-DELTA đúng phạm vi: *EXPAND FR-UC-BP-PLT-01 → FR-UC-BP-ATT-06 — SoT Nest danh mục hình thức bồi thường tăng ca (Cài đặt = tham chiếu hợp nhất chỉ đọc); quản trị mở mã N+1 / hình thức thứ ba trở lên; hai hình thức khởi tạo (trả lương / nghỉ bù) chỉ là ví dụ ≠ trần; nộp đơn tăng ca chọn hình thức từ danh mục khi có hình thức hiệu lực; nhãn / hệ số hiển thị = gợi ý ≠ công thức lương tăng ca; ngừng dùng = ẩn mềm; empty CTA; trực giao danh mục loại tăng ca — không gộp; picker đơn tăng ca đang bàn giao giao diện; AC-PLT-ATT-COMP-01\**. Giữ 0.40 loại tăng ca ← 0.39 mẫu HĐ ← 0.38 điều khoản ← 0.37 quỹ phép … **Không** claim nghiệm thu module.*

→ Ghi chú **đã hiện diện, đúng ADD-only, không wipe FR nào**. R3 **không** sửa lại để tránh double-bump / regression. Nếu PM muốn nâng lên 0.42 gắn mã chương HDSD CH05g, ba-docs làm ở lượt kế theo chỉ đạo — đây là hành vi giữ nguyên có chủ đích.

---

## 5. Honesty / non-claims / seals (RETAIN)

| Flag / seal | Trạng thái |
|-------------|-----------|
| `attendance_uat_ready` | **false** — không flip |
| `payroll_e2e_ready` | **false** — không flip |
| `contracts_printable_ready` | **false** — không flip |
| Formula LIVE (công thức lương tăng ca) | **HOLD** — HDSD nêu rõ nhãn / hệ số ≠ công thức |
| OT-TYPE KEY / `att_ot_type` (Chương 5f) | **SEAL RETAIN** — không reopen, không fold, nêu trực giao |
| CTR KEY / clause | **SEAL RETAIN** |
| ATT-CODE / WS / SHIFT / leave L1 | **SEAL RETAIN** |
| FE-ADMIN hình thức bồi thường | **không** claim là sản phẩm đã ship; chỉ mô tả picker consumer đã bàn giao giao diện (QA-FE proven) |
| `C-SLICE-≠-MODULE` | Danh mục hình thức bồi thường = slice; ≠ module ATT/PAY GO |
| Seed | **DENIED** (U65) — HDSD hướng dẫn tạo qua Cài đặt, cấm giả lập |

---

## 6. Verify commands (PM copy-ready)

```powershell
$od='C:\Users\ADMIN\OneDrive'
$target=@(84,97,768,105,32,108,105,234,803,117)
$dir = Get-ChildItem -LiteralPath $od -Directory | Where-Object { $c=@($_.Name.ToCharArray()|%{[int][char]$_}); ($c.Count -eq $target.Count) -and (-not (Compare-Object $c $target)) }
$repo = Join-Path $dir.FullName 'Vibe Coding\projects\xevn-ecosystem'
(Get-Item -LiteralPath (Join-Path $repo 'docs\qa\evidence\po-hrm-dynamic-config-platform-att-comp-type-catalog-docs-01.md')).Length
(Get-Item -LiteralPath (Join-Path $repo 'docs\client-delivery\hrm-enterprise-blueprint\HDSD_XEVN_CH05g_HRM_DANH_MUC_HINH_THUC_BOI_THUONG_TANG_CA.md')).Length
(Get-Item -LiteralPath (Join-Path $repo 'docs\client-delivery\hdsd\hrm\HDSD_XEVN_CH05g_HRM_DANH_MUC_HINH_THUC_BOI_THUONG_TANG_CA.md')).Length
```

---

## 7. Completion / handoff

| Field | Value |
|-------|--------|
| **completion_report** | HDSD CH05g khách (13716 bytes, hai bản đồng bộ) viết xong theo khuôn CH05f, hygiene no_prompt_echo, trực giao CH05f, honesty giữ nguyên; SRS ADD-only note 0.41 xác nhận hiện diện đúng phạm vi (không double-bump); evidence này ≥3000 bytes. |
| **residual** | (tùy chọn) J-HRM-ATT-COMP-* promote vào `PILOT_BUSINESS_FLOW_BA_TRACE.md` chỉ sau khi Nest consumer LIVE + QA browser stamp — không claim từ seat docs này. |
| **next_owner** | `pm` |
| **next_dispatch_prompt** | PM seal DOCS seat; nếu tiếp tục pipeline W8: dispatch `sa` / `ba-process` cho vertical kế (peer ATT→REC→EMP→QSĐ) hoặc gắn mã HDSD CH05g vào SRS 0.42 ADD-only nếu muốn neo chương. Không reopen OT-TYPE/CTR/ATT L1, không flip ready. |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-docs-01.md` |
| **ack_status** | **PASS_TO_PM** |