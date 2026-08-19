# Manifest — Squad W1-S5-HRM-A

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W1-S5-HRM-A` |
| **squad_id** | `W1-S5-HRM-A` |
| **STT range** | 248–300 |
| **uc_count** | 53 |
| **cases_designed_total** | **1236** |
| **author** | qa |
| **design_status** | DESIGNED |
| **execution** | not started |
| **ack_status** | **READY_FOR_SYNTH** |
| **generated** | 2026-08-04 |
| **locks** | U65 · U76 · design ≠ UAT · Phase1 `uc_id` filename SoT |
| **xref_exemplars** | `UC-FR-H03_LEAVE.md` · `UC-FR-B03_RECRUITMENT_WF.md` · `UC-ATT_ESS_ADJUST.md` (neo only) |
| **menu_neo** | HRM-EMPLOYEES / HRM-RECRUITMENT packs — không đè SoT by-uc |

---

## 1. Rollup code_readiness (honest grep — không = UAT)

| code_readiness | UC count |
|----------------|---------:|
| LIKELY_IMPL | 41 |
| LIKELY_PARTIAL | 12 |
| GAP | 0 |
| UNKNOWN | 0 |
| **Σ UC** | **53** |

---

## 2. Per-UC inventory

| STT | uc_id | name_vi | kind | cases_designed | code_readiness | file |
|----:|-------|---------|------|---------------:|----------------|------|
| 248 | `XBOS-DM-HRM-01` | Xem tổng quan danh mục theo phân hệ Nhân sự | read | 15 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-01.md` |
| 249 | `XBOS-DM-HRM-02` | Cấu hình 6 nhóm trường hồ sơ nhân viên | crud | 25 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-02.md` |
| 250 | `XBOS-DM-HRM-03` | Bổ sung trường mở rộng theo công ty | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/XBOS-DM-HRM-03.md` |
| 251 | `XBOS-DM-HRM-04` | Gửi phê duyệt khi công ty con thêm hoặc xóa trường | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/XBOS-DM-HRM-04.md` |
| 252 | `XBOS-DM-HRM-05` | Phê duyệt hoặc từ chối mở rộng danh mục | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/XBOS-DM-HRM-05.md` |
| 253 | `XBOS-DM-HRM-06` | Khai bộ phòng ban và chức vụ theo từng công ty | crud | 25 | `LIKELY_IMPL` | `by-uc/XBOS-DM-HRM-06.md` |
| 254 | `XBOS-DM-HRM-07` | Sao chép thư viện chức danh sang công ty con | mutate | 23 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-07.md` |
| 255 | `XBOS-DM-HRM-08` | Gán danh mục cho phân hệ Nhân sự | crud | 25 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-08.md` |
| 256 | `XBOS-DM-HRM-09` | Phát hành phiên bản danh mục mới | mutate | 23 | `LIKELY_IMPL` | `by-uc/XBOS-DM-HRM-09.md` |
| 257 | `XBOS-DM-HRM-10` | Đồng bộ danh mục xuống HRM | mutate | 23 | `LIKELY_IMPL` | `by-uc/XBOS-DM-HRM-10.md` |
| 258 | `XBOS-DM-HRM-11` | Kiểm tra danh mục thiếu trước import nhân sự | read | 15 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-11.md` |
| 259 | `XBOS-DM-HRM-12` | Cấu hình preset biểu mẫu theo công ty (Command Center) | crud | 25 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-12.md` |
| 260 | `XBOS-DM-HRM-13` | Khai danh mục hồ sơ xe (du lịch) | crud | 25 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-13.md` |
| 261 | `XBOS-DM-HRM-14` | Gán mã quy trình cho loại đơn HRM | mutate_wf | 32 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-14.md` |
| 262 | `XBOS-DM-HRM-15` | Xem lịch sử thay đổi danh mục | read | 15 | `LIKELY_PARTIAL` | `by-uc/XBOS-DM-HRM-15.md` |
| 263 | `UC-HRM-01` | Kiểm tra trạng thái dịch vụ | health | 5 | `LIKELY_IMPL` | `by-uc/UC-HRM-01.md` |
| 264 | `UC-HRM-02` | Tạo quản trị nền tảng | mutate | 23 | `LIKELY_IMPL` | `by-uc/UC-HRM-02.md` |
| 265 | `UC-HRM-03` | Tạo hoặc cập nhật quản trị doanh nghiệp | mutate | 23 | `LIKELY_IMPL` | `by-uc/UC-HRM-03.md` |
| 266 | `UC-HRM-04` | Mời nhân viên hàng loạt | mutate | 23 | `LIKELY_PARTIAL` | `by-uc/UC-HRM-04.md` |
| 267 | `UC-HRM-05` | Cập nhật thông tin nhạy cảm tài khoản | mutate | 23 | `LIKELY_PARTIAL` | `by-uc/UC-HRM-05.md` |
| 268 | `UC-HRM-06` | Đồng bộ dữ liệu dùng chung từ XBOS | mutate | 23 | `LIKELY_IMPL` | `by-uc/UC-HRM-06.md` |
| 269 | `UC-HRM-07` | Lấy dữ liệu dùng chung theo khóa danh mục | read | 15 | `LIKELY_IMPL` | `by-uc/UC-HRM-07.md` |
| 270 | `UC-HRM-08` | Liệt kê dữ liệu dùng chung theo phân hệ | read | 15 | `LIKELY_IMPL` | `by-uc/UC-HRM-08.md` |
| 271 | `HRM-AT-01` | Ghi nhận bản ghi chấm công | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-AT-01.md` |
| 272 | `HRM-AT-02` | Xem danh sách bản ghi chấm công | read | 15 | `LIKELY_IMPL` | `by-uc/HRM-AT-02.md` |
| 273 | `HRM-AT-03` | Cập nhật trạng thái bản ghi chấm công | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-AT-03.md` |
| 274 | `HRM-AT-04` | Tạo đơn chỉnh sửa chấm công | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-AT-04.md` |
| 275 | `HRM-AT-05` | Xem danh sách đơn chỉnh sửa chấm công | read | 15 | `LIKELY_IMPL` | `by-uc/HRM-AT-05.md` |
| 276 | `HRM-AT-06` | Sửa đơn chỉnh sửa chấm công | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-AT-06.md` |
| 277 | `HRM-AT-07` | Phê duyệt đơn chỉnh sửa chấm công | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/HRM-AT-07.md` |
| 278 | `HRM-AT-08` | Từ chối đơn chỉnh sửa chấm công | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/HRM-AT-08.md` |
| 279 | `HRM-AT-09` | Xóa đơn chỉnh sửa chấm công | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-AT-09.md` |
| 280 | `HRM-AT-10` | Tạo đơn nghỉ phép | mutate | 30 | `LIKELY_IMPL` | `by-uc/HRM-AT-10.md` |
| 281 | `HRM-AT-11` | Xem danh sách đơn nghỉ phép | read | 18 | `LIKELY_IMPL` | `by-uc/HRM-AT-11.md` |
| 282 | `HRM-AT-12` | Phê duyệt đơn nghỉ phép | mutate_wf | 40 | `LIKELY_PARTIAL` | `by-uc/HRM-AT-12.md` |
| 283 | `HRM-AT-13` | Từ chối đơn nghỉ phép | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/HRM-AT-13.md` |
| 284 | `HRM-SV-01` | Tạo yêu cầu dịch vụ nội bộ | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-SV-01.md` |
| 285 | `HRM-SV-02` | Xem danh sách yêu cầu dịch vụ | read | 15 | `LIKELY_IMPL` | `by-uc/HRM-SV-02.md` |
| 286 | `HRM-SV-03` | Cập nhật yêu cầu dịch vụ | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-SV-03.md` |
| 287 | `HRM-SV-04` | Xóa yêu cầu dịch vụ | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-SV-04.md` |
| 288 | `HRM-SV-05` | Phê duyệt yêu cầu dịch vụ | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/HRM-SV-05.md` |
| 289 | `HRM-SV-06` | Từ chối yêu cầu dịch vụ | mutate_wf | 32 | `LIKELY_IMPL` | `by-uc/HRM-SV-06.md` |
| 290 | `UC-HRM-12` | Đọc hộp thư thông báo nghiệp vụ | read | 15 | `LIKELY_IMPL` | `by-uc/UC-HRM-12.md` |
| 291 | `HRM-NT-01` | Đánh dấu thông báo đã đọc | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-NT-01.md` |
| 292 | `HRM-NT-02` | Đăng ký token thông báo đẩy (mobile) | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-NT-02.md` |
| 293 | `HRM-EM-01` | Tạo hồ sơ nhân viên | mutate | 25 | `LIKELY_IMPL` | `by-uc/HRM-EM-01.md` |
| 294 | `HRM-EM-02` | Xem danh sách nhân viên | read | 18 | `LIKELY_IMPL` | `by-uc/HRM-EM-02.md` |
| 295 | `HRM-EM-03` | Cập nhật hồ sơ nhân viên | mutate | 25 | `LIKELY_IMPL` | `by-uc/HRM-EM-03.md` |
| 296 | `HRM-EM-04` | Lưu trữ (xóa mềm) nhân viên | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-EM-04.md` |
| 297 | `HRM-EM-05` | Khôi phục nhân viên đã lưu trữ | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-EM-05.md` |
| 298 | `HRM-PR-01` | Tạo kỳ lương | mutate | 23 | `LIKELY_IMPL` | `by-uc/HRM-PR-01.md` |
| 299 | `HRM-PR-02` | Xem danh sách kỳ lương | read | 15 | `LIKELY_IMPL` | `by-uc/HRM-PR-02.md` |
| 300 | `HRM-PR-03` | Xử lý tính lương theo kỳ | mutate | 29 | `LIKELY_IMPL` | `by-uc/HRM-PR-03.md` |

| | | | **TOTAL** | **1236** | | |

---

## 3. Cluster subtotals

| Cluster | STT | UC | Cases |
|---------|-----|---:|------:|
| XBOS-DM-HRM-* | 248–262 | 15 | 367 |
| UC-HRM-01..08 | 263–270 | 8 | 150 |
| HRM-AT-* | 271–283 | 13 | 329 |
| HRM-SV-* | 284–289 | 6 | 148 |
| UC-HRM-12 + NT | 290–292 | 3 | 61 |
| HRM-EM-* | 293–297 | 5 | 114 |
| HRM-PR-01..03 | 298–300 | 3 | 67 |
| **Squad total** | 248–300 | **53** | **1236** |

---

## 4. SPEC_GAP / residuals (design-time)

| ID | UC | Note |
|----|-----|------|
| SG-LEAVE-L2 | `HRM-AT-12` | Ladder L2 AS-IS gap — cite exemplar FR-H03; không invent PASS |
| SG-DM-FORM-PRESET | `XBOS-DM-HRM-12` | Form preset CC ↔ HRM mapping PARTIAL |
| SG-DM-FLEET-MAP | `XBOS-DM-HRM-13` | Catalog xe vs fleet master mapping |
| SG-INVITE-BULK | `UC-HRM-04` | Bulk invite FE vs single API invite |
| NOTE-ATT-SCOPE | `HRM-AT-07` | Approve header `x-company-id` class — design AU covers |

---

## 5. Handoff

```
ack_status: READY_FOR_SYNTH
work_item_id: PO-UC-TC-W1-S5-HRM-A
from_role: qa
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S5-HRM-A_MANIFEST.md
uc_files: 53
cases_designed_total: 1236
execution: not started
uat_done: false
```

---

*Generator: `_gen_w1_s5_hrm_a.mjs` — re-run only if regenerating design intentionally.*
