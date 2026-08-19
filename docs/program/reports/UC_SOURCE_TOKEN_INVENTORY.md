# Báo cáo thống kê mã nguồn theo Use Case (UC) — ước lượng token

| Mục | Giá trị |
|-----|---------|
| **Ngày sinh báo cáo** | 2026-08-10 |
| **Phạm vi quét** | `apps/api`, `apps/web`, `apps/mobile`, `packages` (loại trừ build/dist/node_modules) |
| **Cách gắn UC** | Ưu tiên khối `@CODE-MEMORY` (trường UC/BR); fallback: mã UC trong ~4KB đầu file |
| **Ước lượng token** | `token ≈ kích_thước_file ÷ 3.5` (byte UTF-8) — dùng **so sánh chi phí đọc context AI**, không phải hóa đơn API chính thức |
| **Tổng file** | 3.424 |
| **Tổng dòng** | 677.223 |
| **Tổng token ước lượng** | **~7.504.326** |
| **File đã gắn ≥1 UC** | 822 (~24%) |
| **File chưa gắn UC (xem cuối)** | 2.602 |

## Cách đọc báo cáo (chi phí)

- **Token / UC** ≈ chi phí nếu PM/Dev/QA bắt AI **đọc toàn bộ file** thuộc UC đó trong một phiên (ví dụ refactor, review, viết test).
- Một UC có nhiều file **chia sẻ** (hook, lib, controller) — cộng dồn token trong bảng UC.
- File **nền tảng** (auth, scope, shell) có thể lặp lại nhiều UC — token thực tế khi sửa 1 UC thường **nhỏ hơn** tổng cột (chỉ đọc file đụng).
- Khuyến nghị governance: file nghiệp vụ mới **bắt buộc** `@CODE-MEMORY` + `UC:` để báo cáo này chính xác dần.

- **Tên UC:** thứ tự ưu tiên: `UC_INVENTORY.md` (50 UC-BP) → `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` → `docs/hrm/SRS.md` (UC-HRM team/API) → OpenAPI summary → bảng **alias dev** trong script → `@CODE-MEMORY` **Purpose**.

## Vì sao từng có dòng «Chưa có trong UC_INVENTORY…»?

Repo dùng **hai lớp mã UC song song**:

| Lớp | Ví dụ | Có trong 50 UC MVP (`UC_INVENTORY`)? |
|-----|--------|--------------------------------------|
| **UC-BP-*** (GD1 khách) | `UC-BP-PAY-02` | Có — đây là danh mục Phase 1 board |
| **UC-HRM-*** (SRS team / embed / API) | `UC-HRM-28`, `UC-HRM-09` | Không đầy đủ — nhiều mã chỉ trong `docs/hrm/SRS.md` |
| **Alias nhóm module** | `UC-HRM-PAY`, `UC-HRM-REC` | Không — tag gom file theo menu embed, map sang UC-BP |
| **FR-UC-*** (FR ecosystem / HRM) | `FR-UC-M01`, `FR-UC-H03` | Không — functional req, không phải dòng inventory |

Báo cáo cũ chỉ đọc **UC_INVENTORY + ma trận Phase 1** nên mọi mã chỉ xuất hiện trong code bị gán câu fallback dài. Phiên bản script mới bổ sung SRS team, alias và Purpose — cột **Nguồn tên** cho biết mã thuộc lớp nào.

---

## Tổng hợp theo UC (toàn repo đã quét)

| UC | Tên use case (tiếng Việt) | Nguồn tên | Khối nghiệp vụ | Số file | Tổng dòng | Token ước lượng | Ghi chú |
|----|---------------------------|-----------|----------------|---------|-----------|-----------------|---------|
| `UC-HRM-PAY` | Nhóm module embed Tiền lương (alias kỹ thuật → UC-BP-PAY-01..09, UC-HRM-24) | alias dev | Tiền lương (PAY) | 9 | 8.982 | ~108.477 |  |
| `UC-HRM-25` | Embed — Hợp đồng và bảo hiểm xã hội | SRS team / matrix | Embed portal HRM | 12 | 8.961 | ~104.138 |  |
| `FR-UC-BP-CORE-09` | Hợp đồng LĐ — mẫu Word keyword fill | catalog | Nhân sự / HĐLĐ (CORE) | 17 | 9.455 | ~102.601 | **50 UC MVP GD1** |
| `UC-HRM-21` | Embed — Danh sách nhân sự | SRS team / matrix | Embed portal HRM | 14 | 7.754 | ~92.304 |  |
| `UC-HRM-20` | Embed — Tổng quan HRM | SRS team / matrix | Embed portal HRM | 12 | 6.805 | ~87.238 |  |
| `UC-HRM-23` | Embed — Chấm công | SRS team / matrix | Embed portal HRM | 6 | 6.655 | ~87.161 |  |
| `UC-HRM-22` | Embed — Tuyển dụng | SRS team / matrix | Embed portal HRM | 6 | 7.139 | ~83.494 |  |
| `UC-HRM-28` | App — Cơ cấu lương NV | SRS team / matrix | Embed portal HRM | 4 | 6.461 | ~74.452 |  |
| `UC-BP-PAY-02` | Lắp ráp và chạy động cơ công thức lương | UC_INVENTORY | Tiền lương (PAY) | 9 | 6.897 | ~71.460 | **50 UC MVP GD1** |
| `FR-UC-BP-PAY-02` | Lắp ráp và chạy động cơ công thức lương | catalog | Tiền lương (PAY) | 9 | 6.897 | ~71.460 | **50 UC MVP GD1** |
| `UC-HRM-32` | App — Chấm công đầy đủ | SRS team / matrix | Embed portal HRM | 1 | 5.290 | ~70.882 |  |
| `UC-HRM-24` | Embed — Lương | SRS team / matrix | Embed portal HRM | 4 | 5.620 | ~65.086 |  |
| `UC-BP-ATT-11` | Ký chốt bảng công trước khi tính lương (workflow XBOS) | UC_INVENTORY | Chấm công & phép (ATT) | 9 | 5.208 | ~62.815 | **50 UC MVP GD1** |
| `UC-BP-REC-08` | Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người») | UC_INVENTORY | Tuyển dụng (REC) | 15 | 5.535 | ~62.794 | **50 UC MVP GD1** |
| `UC-BP-REC-07` | Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại) | UC_INVENTORY | Tuyển dụng (REC) | 13 | 4.470 | ~56.755 | **50 UC MVP GD1** |
| `UC-BP-CORE-09` | Hợp đồng LĐ — mẫu Word keyword fill | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 7 | 5.217 | ~52.805 | **50 UC MVP GD1** |
| `UC-BP-CORE-10` | BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn) | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 16 | 5.131 | ~52.446 | **50 UC MVP GD1** |
| `UC-BP-REC-06` | Gửi thư tuyển + đánh giá PV trong pipeline ứng viên | UC_INVENTORY | Tuyển dụng (REC) | 10 | 4.274 | ~50.940 | **50 UC MVP GD1** |
| `UC-BP-REC-02` | Yêu cầu tuyển trong định biên (luồng rút gọn) | UC_INVENTORY | Tuyển dụng (REC) | 7 | 4.231 | ~48.693 | **50 UC MVP GD1** |
| `UC-BP-REC-04` | Quét kho CV nội bộ trước kênh ngoài | UC_INVENTORY | Tuyển dụng (REC) | 7 | 3.882 | ~45.176 | **50 UC MVP GD1** |
| `FR-UC-BP-CORE-10` | BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn) | catalog | Nhân sự / HĐLĐ (CORE) | 15 | 4.462 | ~43.273 | **50 UC MVP GD1** |
| `UC-HRM-27` | Embed — Quyết định và báo cáo (backlog) | SRS team / matrix | Embed portal HRM | 7 | 3.562 | ~41.281 |  |
| `UC-BP-CORE-09a` | Thư viện điều khoản HĐ (Cài đặt) — ADD | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 6 | 3.182 | ~37.285 | **50 UC MVP GD1** |
| `UC-BP-ATT-04` | Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …) | UC_INVENTORY | Chấm công & phép (ATT) | 8 | 3.390 | ~36.384 | **50 UC MVP GD1** |
| `UC-BP-CORE-08` | Khen thưởng & kỷ luật — thi hành → bảng lương | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 5 | 3.217 | ~35.972 | **50 UC MVP GD1** |
| `UC-HRM-ATT-LEAVE-01` | Luồng đơn nghỉ phép embed (alias → UC-BP-ATT-09, UC-HRM-10) | alias dev | Chấm công (legacy HRM mã) | 4 | 2.857 | ~35.414 |  |
| `UC-HRM-CI-08` | Tạo gói cơ cấu lương NV (base / thử việc / phụ cấp) | alias dev | Hợp đồng & BH (CI) | 7 | 3.223 | ~33.468 |  |
| `FR-UC-BP-ATT-03` | Thu nhận điểm danh đa nguồn → giờ công thô | catalog | Chấm công & phép (ATT) | 5 | 3.042 | ~33.305 |  |
| `FR-UC-BP-CORE-08` | Khen thưởng & kỷ luật — thi hành → bảng lương | catalog | Nhân sự / HĐLĐ (CORE) | 4 | 2.832 | ~31.892 | **50 UC MVP GD1** |
| `UC-BP-REC-00a` | Thư viện mô tả công việc (JD master) — MVP | CODE-MEMORY Purpose | Tuyển dụng (REC) | 5 | 2.872 | ~31.448 |  |
| `UC-XBOS-02` | Khởi tạo hoặc cập nhật danh mục dùng chung | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 2.866 | ~31.388 |  |
| `FR-UC-M01` | Đăng nhập, phiên JWT và shell portal (FR ecosystem M01) | alias dev | Metadata / workflow (M01) | 12 | 3.269 | ~31.293 |  |
| `FR-UC-BP-ATT-04` | Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …) | catalog | Chấm công & phép (ATT) | 6 | 2.860 | ~30.819 | **50 UC MVP GD1** |
| `UC-HRM-REC` | Nhóm module embed Tuyển dụng (alias → UC-HRM-22, UC-BP-REC-*) | alias dev | Tuyển dụng (REC) | 1 | 2.254 | ~30.199 |  |
| `UC-BP-ATT-03d` | Danh mục điểm GPS chấm công (vùng hợp lệ) — ADD MVP | UC_INVENTORY | Chấm công & phép (ATT) | 7 | 2.691 | ~30.086 | **50 UC MVP GD1** |
| `UC-HRM-06` | Đồng bộ dữ liệu dùng chung từ XBOS | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 4 | 2.714 | ~28.469 |  |
| `UC-BP-PAY-06` | Tính lương kỳ khi đã Hoạt động + bảng công chốt | UC_INVENTORY | Tiền lương (PAY) | 6 | 2.695 | ~27.389 | **50 UC MVP GD1** |
| `FR-UC-BP-PAY-06` | Tính lương kỳ khi đã Hoạt động + bảng công chốt | catalog | Tiền lương (PAY) | 5 | 2.672 | ~27.231 | **50 UC MVP GD1** |
| `FR-UC-BP-CORE-01` | Hồ sơ vòng công khai (hành chính / phúc lợi) | catalog | Nhân sự / HĐLĐ (CORE) | 7 | 2.571 | ~27.212 | **50 UC MVP GD1** |
| `UC-HRM-09` | Vòng đời đơn chỉnh sửa chấm công + thông báo | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 6 | 2.184 | ~27.063 |  |
| `UC-BP-CORE-03` | Checklist giấy tờ động (bắt buộc / tùy chọn) | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 9 | 2.510 | ~25.832 | **50 UC MVP GD1** |
| `UC-HRM-MOB-12` | Xem và cập nhật hồ sơ cá nhân | SRS team / matrix | Mobile HRM | 11 | 2.393 | ~25.083 |  |
| `UC-HRM-INT-01` | Tuyển dụng → tuyển dụng thành công | SRS team / matrix | Tích hợp nội bộ | 8 | 2.260 | ~24.344 |  |
| `FR-UC-BP-CORE-03` | Checklist giấy tờ động (bắt buộc / tùy chọn) | catalog | Nhân sự / HĐLĐ (CORE) | 7 | 2.287 | ~23.824 | **50 UC MVP GD1** |
| `UC-BP-ATT-08` | Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ) | UC_INVENTORY | Chấm công & phép (ATT) | 6 | 2.199 | ~23.315 | **50 UC MVP GD1** |
| `UC-BP-CORE-05` | Cấp phát tài sản & biên bản bàn giao | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 4 | 1.929 | ~22.130 | **50 UC MVP GD1** |
| `UC-HRM-CI-01` | Hợp đồng lao động — slice CI (alias → UC-BP-PLT-*) | alias dev | Hợp đồng & BH (CI) | 3 | 1.944 | ~21.932 |  |
| `UC-BP-REC-05` | Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline) | UC_INVENTORY | Tuyển dụng (REC) | 9 | 2.060 | ~21.706 | **50 UC MVP GD1** |
| `UC-BP-PAY-01` | Ranh giới: lương chỉ đọc bảng công đã chốt | UC_INVENTORY | Tiền lương (PAY) | 5 | 1.561 | ~21.432 | **50 UC MVP GD1** |
| `UC-HRM-10` | Vòng đời đơn nghỉ phép + thông báo | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 1.989 | ~21.328 |  |
| `UC-BP-ATT-06` | Phép bù OT khi công ty bật chế độ | UC_INVENTORY | Chấm công & phép (ATT) | 6 | 1.941 | ~21.148 | **50 UC MVP GD1** |
| `UC-BP-ATT-02` | Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ) | UC_INVENTORY | Chấm công & phép (ATT) | 5 | 1.876 | ~20.384 | **50 UC MVP GD1** |
| `UC-BP-ATT-03b` | Lịch lễ / Tết (dương + âm cấu hình năm) | UC_INVENTORY | Chấm công & phép (ATT) | 3 | 1.765 | ~19.706 | **50 UC MVP GD1** |
| `UC-BP-REC-06a` | Xếp / hủy / đổi lịch PV — tối đa một lịch đang hiệu lực / ứng viên × pháp nhân; badge danh sách | UC_INVENTORY | Tuyển dụng (REC) | 6 | 1.765 | ~19.258 | **50 UC MVP GD1** |
| `UC-HRM-EMP-01` | Hồ sơ nhân viên — slice embed (alias → UC-BP-CORE-*) | alias dev | Hồ sơ nhân viên (EMP) | 1 | 1.508 | ~19.219 |  |
| `UC-XBOS-13` | Định nghĩa quy trình (workflow) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 5 | 1.723 | ~18.460 |  |
| `UC-HRM-26` | Embed — Hàng chờ duyệt metadata | SRS team / matrix | Embed portal HRM | 6 | 1.680 | ~18.366 |  |
| `UC-HRM-MOB-06b` | Touch-friendly UI to pick ≤3 medical docs (image/PDF), upload each (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Mobile HRM | 6 | 1.886 | ~17.968 |  |
| `FR-UC-BP-REC-06` | Gửi thư tuyển + đánh giá PV trong pipeline ứng viên | catalog | Tuyển dụng (REC) | 8 | 1.555 | ~17.907 | **50 UC MVP GD1** |
| `FR-UC-BP-CORE-05` | Cấp phát tài sản & biên bản bàn giao | catalog | Nhân sự / HĐLĐ (CORE) | 3 | 1.449 | ~17.170 | **50 UC MVP GD1** |
| `UC-BP-CORE-01` | Hồ sơ vòng công khai (hành chính / phúc lợi) | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 6 | 1.584 | ~16.671 | **50 UC MVP GD1** |
| `FR-UC-BP-ATT-08` | Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ) | catalog | Chấm công & phép (ATT) | 4 | 1.540 | ~16.408 | **50 UC MVP GD1** |
| `UC-BP-REC-06b` | Gửi thư tuyển + đánh giá PV trong pipeline ứng viên | CODE-MEMORY Purpose | Tuyển dụng (REC) | 6 | 1.379 | ~16.239 |  |
| `UC-HRM-ORG-COMPANY` | Phạm vi công ty / org (alias scope — UC-BP-CORE-*) | alias dev | Khác / chưa phân loại | 2 | 1.454 | ~16.068 |  |
| `FR-UC-BP-ATT-02` | Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ) | catalog | Chấm công & phép (ATT) | 4 | 1.458 | ~15.887 | **50 UC MVP GD1** |
| `UC-HRM-REC-WF-02` | Workflow tuyển dụng — bước 2 (alias lane REC) | alias dev | Tuyển dụng (REC) | 5 | 1.351 | ~15.623 |  |
| `FR-UC-BP-REC-05` | Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline) | catalog | Tuyển dụng (REC) | 4 | 1.526 | ~15.590 | **50 UC MVP GD1** |
| `UC-HRM-ATT-OT` | Tăng ca / OT embed (alias → UC-BP-ATT-*) | alias dev | Chấm công (legacy HRM mã) | 3 | 1.160 | ~15.515 |  |
| `UC-BP-CORE-07` | Kích hoạt hồ sơ Hoạt động khi checklist đủ | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 6 | 1.451 | ~15.235 | **50 UC MVP GD1** |
| `FR-UC-BP-CORE-07` | Kích hoạt hồ sơ Hoạt động khi checklist đủ | catalog | Nhân sự / HĐLĐ (CORE) | 6 | 1.451 | ~15.235 | **50 UC MVP GD1** |
| `UC-HRM-03` | Tạo hoặc cập nhật quản trị doanh nghiệp | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 4 | 1.359 | ~15.203 |  |
| `UC-BP-CORE-09b` | Chọn gói nghề và xem trước HĐLĐ — ADD | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 2 | 1.306 | ~15.074 | **50 UC MVP GD1** |
| `UC-HRM-31` | App — Kỳ lương | SRS team / matrix | Embed portal HRM | 2 | 1.305 | ~14.878 |  |
| `UC-BP-CORE-01a` | Hồ sơ vòng công khai (hành chính / phúc lợi) | CODE-MEMORY Purpose | Nhân sự / HĐLĐ (CORE) | 4 | 1.434 | ~14.792 |  |
| `UC-HRM-MOB-01` | Đăng nhập và thiết lập phiên an toàn | SRS team / matrix | Mobile HRM | 4 | 1.688 | ~14.305 |  |
| `UC-BP-ATT-10` | Tổng hợp bảng công (phễu giờ công tính lương) | UC_INVENTORY | Chấm công & phép (ATT) | 8 | 1.395 | ~14.262 | **50 UC MVP GD1** |
| `UC-HRM-MOB-16` | Avatar + name + job + dept + attendance badge; press → detail (≥44px). (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Mobile HRM | 6 | 1.340 | ~13.335 |  |
| `UC-BP-ATT-07` | Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có) | UC_INVENTORY | Chấm công & phép (ATT) | 4 | 1.262 | ~13.253 | **50 UC MVP GD1** |
| `FR-UC-BP-ATT-07` | Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có) | catalog | Chấm công & phép (ATT) | 4 | 1.262 | ~13.253 | **50 UC MVP GD1** |
| `UC-HRM-MOB-06c` | Read-only leave balance chip â€” remaining/entitled + year; (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Mobile HRM | 5 | 1.185 | ~13.245 |  |
| `UC-HRM-INT-02` | Nhân viên → Hợp đồng | SRS team / matrix | Tích hợp nội bộ | 1 | 1.249 | ~13.085 |  |
| `UC-BP-REC-00g` | Thư viện mô tả công việc (JD master) — MVP | CODE-MEMORY Purpose | Tuyển dụng (REC) | 4 | 1.158 | ~12.563 |  |
| `FR-UC-H03` | Đơn nghỉ phép — phê duyệt hai cấp (FR HRM leave ladder) | alias dev | Khác / chưa phân loại | 6 | 1.233 | ~12.319 |  |
| `FR-UC-H04` | Phiếu lương / kỳ lương NV (FR HRM payroll read) | alias dev | Khác / chưa phân loại | 4 | 1.241 | ~12.314 |  |
| `FR-UC-BP-ATT-06` | Phép bù OT khi công ty bật chế độ | catalog | Chấm công & phép (ATT) | 4 | 1.088 | ~12.143 | **50 UC MVP GD1** |
| `UC-HRM-ATT-SHIFT-CHANGE` | Đổi ca embed (alias → UC-BP-ATT-*) | alias dev | Chấm công (legacy HRM mã) | 3 | 839 | ~12.080 |  |
| `UC-BP-ATT-05b` | Panel quỹ phép khi nộp đơn — ADD MVP | UC_INVENTORY | Chấm công & phép (ATT) | 5 | 1.119 | ~12.052 | **50 UC MVP GD1** |
| `UC-BP-REC-02b` | Yêu cầu tuyển ngoài định biên (có BOD) | UC_INVENTORY | Tuyển dụng (REC) | 3 | 1.168 | ~11.929 | **50 UC MVP GD1** |
| `UC-BP-CORE-02` | Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng) | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 5 | 1.179 | ~11.805 | **50 UC MVP GD1** |
| `UC-HRM-SCOPE-03` | Resolver scope list↔detail (alias NFR — ADR scope ladder) | alias dev | Khác / chưa phân loại | 7 | 1.078 | ~11.510 |  |
| `UC-BP-REC-01` | Quản trị định biên vị trí × 12 tháng (phòng ban trình; HCNS tổng hợp) | UC_INVENTORY | Tuyển dụng (REC) | 3 | 1.094 | ~11.000 | **50 UC MVP GD1** |
| `UC-BP-REC-01b` | Auto sinh YCTD theo tháng «Cần tuyển» | UC_INVENTORY | Tuyển dụng (REC) | 3 | 1.094 | ~11.000 | **50 UC MVP GD1** |
| `UC-HRM-CI-11` | Lịch sử / phiên bản cơ cấu lương gắn HĐ | alias dev | Hợp đồng & BH (CI) | 2 | 879 | ~10.629 |  |
| `UC-BP-ATT-09` | Nộp & duyệt phép — hold quỹ khi submit | UC_INVENTORY | Chấm công & phép (ATT) | 4 | 960 | ~10.534 | **50 UC MVP GD1** |
| `UC-BP-PLT-01` | Nền tảng cấu hình động (danh mục · schema · trường trộn) — ADD | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 3 | 924 | ~10.443 | **50 UC MVP GD1** |
| `UC-BP-CORE-06` | Thu hồi tài sản khi kích hoạt nghỉ việc | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 4 | 904 | ~10.159 | **50 UC MVP GD1** |
| `FR-UC-BP-PAY-01` | Ranh giới: lương chỉ đọc bảng công đã chốt | catalog | Tiền lương (PAY) | 3 | 978 | ~10.079 | **50 UC MVP GD1** |
| `UC-HRM-02` | Tạo quản trị nền tảng | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 4 | 841 | ~9.901 |  |
| `FR-UC-BP-ATT-05` | Phép chuyển kỳ (bảo lưu theo FY tenant) | catalog | Chấm công & phép (ATT) | 3 | 875 | ~9.777 | **50 UC MVP GD1** |
| `UC-XBOS-08` | Thêm / sửa / xóa dữ liệu master theo lĩnh vực | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 868 | ~9.629 |  |
| `UC-BP-ATT-12` | Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động | UC_INVENTORY | Chấm công & phép (ATT) | 5 | 930 | ~9.624 | **50 UC MVP GD1** |
| `FR-UC-BP-ATT-12` | Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động | catalog | Chấm công & phép (ATT) | 4 | 918 | ~9.540 | **50 UC MVP GD1** |
| `UC-BP-ATT-01` | Thiết lập quy tắc ca theo bộ phận / nhóm | UC_INVENTORY | Chấm công & phép (ATT) | 4 | 825 | ~9.535 | **50 UC MVP GD1** |
| `UC-HRM-REC-WF-01` | Workflow tuyển dụng — bước 1 (alias lane REC) | alias dev | Tuyển dụng (REC) | 5 | 894 | ~9.534 |  |
| `FR-UC-BP-ATT-10` | Tổng hợp bảng công (phễu giờ công tính lương) | catalog | Chấm công & phép (ATT) | 4 | 932 | ~9.529 | **50 UC MVP GD1** |
| `UC-HRM-RC-07` | Requisition / RC slice (alias tuyển dụng) | alias dev | Khác / chưa phân loại | 2 | 819 | ~9.464 |  |
| `UC-HRM-07` | Lấy dữ liệu dùng chung theo khóa danh mục | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 937 | ~9.452 |  |
| `UC-HRM-08` | Liệt kê dữ liệu dùng chung theo phân hệ | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 937 | ~9.452 |  |
| `UC-HRM-MOB-02` | Chọn và xác nhận phạm vi công ty | SRS team / matrix | Mobile HRM | 5 | 1.009 | ~9.421 |  |
| `UC-HRM-ATT-TRIP` | Công tác embed (alias → UC-BP-ATT-*) | alias dev | Chấm công (legacy HRM mã) | 1 | 628 | ~9.346 |  |
| `UC-HRM-MOB-03` | Xem bảng điều khiển cá nhân | SRS team / matrix | Mobile HRM | 2 | 837 | ~9.277 |  |
| `UC-XBOS-11` | Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 616 | ~9.056 |  |
| `FR-UC-BP-REC-08` | Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người») | catalog | Tuyển dụng (REC) | 3 | 894 | ~8.979 | **50 UC MVP GD1** |
| `UC-HRM-ATT-LATE-EARLY` | Đi muộn / về sớm embed (alias → UC-BP-ATT-*) | alias dev | Chấm công (legacy HRM mã) | 1 | 616 | ~8.477 |  |
| `FR-UC-BP-ATT-09` | Nộp & duyệt phép — hold quỹ khi submit | catalog | Chấm công & phép (ATT) | 2 | 748 | ~8.331 | **50 UC MVP GD1** |
| `UC-HRM-CO-01` | Embed — Quản lý công ty: headcount ĐVTV (FR-HRM-CO-HC-01) + Ngành nghề (FR-HRM-CO-IND-01) | SRS team / matrix | Công ty / headcount (CO) | 1 | 715 | ~8.161 |  |
| `UC-BP-REC-05a` | Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline) | CODE-MEMORY Purpose | Tuyển dụng (REC) | 3 | 772 | ~7.917 |  |
| `UC-XBOS-AUTH-01` | Đăng nhập cổng Web Portal | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 585 | ~7.834 |  |
| `UC-HRM-SCOPE-04` | Authenticate portal users, issue HS256 service JWT with tenant/company/role claims, (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 3 | 585 | ~7.834 |  |
| `UC-HRM-MOB-05` | Xem lịch sử chấm công | SRS team / matrix | Mobile HRM | 1 | 663 | ~7.780 |  |
| `FR-UC-BP-CORE-06` | Thu hồi tài sản khi kích hoạt nghỉ việc | catalog | Nhân sự / HĐLĐ (CORE) | 2 | 692 | ~7.779 | **50 UC MVP GD1** |
| `UC-HRM-MOB-06` | Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép | SRS team / matrix | Mobile HRM | 1 | 650 | ~7.598 |  |
| `UC-XBOS-KPI-01` | Tính KPI đơn lẻ trên máy chủ | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 577 | ~7.562 |  |
| `FR-UC-BP-ATT-11` | Ký chốt bảng công trước khi tính lương (workflow XBOS) | catalog | Chấm công & phép (ATT) | 2 | 758 | ~7.479 | **50 UC MVP GD1** |
| `UC-BP-PAY-09` | Phân nhóm bảng lương (VP / KD / tài xế / vận hành) | UC_INVENTORY | Tiền lương (PAY) | 4 | 707 | ~7.361 | **50 UC MVP GD1** |
| `UC-HRM-ATT-REPORTS` | Attendance reports KPI + charts + export dialog chrome (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Chấm công (legacy HRM mã) | 1 | 580 | ~7.205 |  |
| `UC-BP-PAY-08` | Phiếu lương — preview, bảo mật, trạng thái TT | UC_INVENTORY | Tiền lương (PAY) | 4 | 662 | ~7.067 | **50 UC MVP GD1** |
| `UC-BP-REC-00` | Thư viện mô tả công việc (JD master) — MVP | UC_INVENTORY | Tuyển dụng (REC) | 3 | 646 | ~7.042 | **50 UC MVP GD1** |
| `UC-XBOS-DASH-01` | Cockpit tổng hợp KPI điều hành | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 647 | ~6.854 |  |
| `FR-UC-XBOS-DASH-01` | Cockpit tổng hợp KPI điều hành | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 647 | ~6.854 |  |
| `UC-XBOS-WF-01` | Lưu sơ đồ quy trình trên canvas | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 609 | ~6.834 |  |
| `FR-UC-BP-PAY-08` | Phiếu lương — preview, bảo mật, trạng thái TT | catalog | Tiền lương (PAY) | 3 | 620 | ~6.736 | **50 UC MVP GD1** |
| `UC-HRM-REC-WF-03` | POST /recruitment/workflow/step/terminal — internal JWT auth only. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Tuyển dụng (REC) | 4 | 618 | ~6.516 |  |
| `FR-UC-M03` | Đọc số dư phép trước/khi tạo đơn — display-ready; panel 5 loại MVP một request. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 637 | ~6.438 |  |
| `UC-BP-CORE-09c` | Lưu phiên bản và in / PDF hợp đồng — ADD | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 4 | 585 | ~6.380 | **50 UC MVP GD1** |
| `UC-HRM-MOB` | Thanh đầu Home — avatar/identity/search/chat/notify; paddingTop insets.top. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Mobile HRM | 4 | 729 | ~6.179 |  |
| `UC-BP-PAY-07` | Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối | UC_INVENTORY | Tiền lương (PAY) | 2 | 609 | ~6.083 | **50 UC MVP GD1** |
| `UC-HRM-ATT-CLOCK-QR` | QR clock channel — camera scan + confirm check-in/out dialog (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Chấm công (legacy HRM mã) | 1 | 516 | ~6.012 |  |
| `UC-BP-PAY-04` | Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép) | UC_INVENTORY | Tiền lương (PAY) | 3 | 605 | ~5.927 | **50 UC MVP GD1** |
| `UC-XBOS-CC-06` | Canvas quy trình | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 561 | ~5.796 |  |
| `FR-UC-BP-PAY-07` | Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối | catalog | Tiền lương (PAY) | 1 | 573 | ~5.735 | **50 UC MVP GD1** |
| `FR-UC-BP-PAY-09` | Phân nhóm bảng lương (VP / KD / tài xế / vận hành) | catalog | Tiền lương (PAY) | 1 | 547 | ~5.708 | **50 UC MVP GD1** |
| `UC-HRM-30` | App — Tuyển dụng đầy đủ | SRS team / matrix | Embed portal HRM | 4 | 526 | ~5.479 |  |
| `UC-HRM-12` | Đọc hộp thư thông báo nghiệp vụ | SRS team / matrix | Khác / chưa phân loại | 4 | 498 | ~5.460 |  |
| `UC-HRM-ATT-EXPORT` | Client XLSX export dialog chrome (ACCEPTED_AS_IS export path) (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Chấm công (legacy HRM mã) | 1 | 399 | ~5.011 |  |
| `UC-XBOS-06` | Truy vấn nhật ký kiểm toán | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 6 | 432 | ~4.906 |  |
| `FR-UC-H01` | Flatten nhãn VI (status / phòng ban / chức danh / tên) lên response list/get/patch (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 3 | 478 | ~4.831 |  |
| `UC-HRM-REC-WF-04` | POST /recruitment/workflow/step/terminal — internal JWT auth only. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Tuyển dụng (REC) | 3 | 465 | ~4.792 |  |
| `UC-PLT-SI-INS-01` | Settings CRUD catalog loại BH — tạo mã N+1 → F5 list → retire ẩn picker. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 442 | ~4.761 |  |
| `UC-XBOS-CC-07` | Hạ tầng — danh mục nền | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 430 | ~4.752 |  |
| `UC-XBOS-SYNC-01` | Bootstrap hệ sinh thái XEVN (danh mục nền) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 470 | ~4.584 |  |
| `UC-XBOS-04` | Liệt kê danh mục theo phân hệ đích | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 470 | ~4.584 |  |
| `UC-XBOS-05` | Phát hành phiên bản hợp đồng dữ liệu | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 470 | ~4.584 |  |
| `UC-XBOS-INF-01` | Xem và sửa cấu hình hạ tầng danh mục nền | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 387 | ~4.388 |  |
| `UC-HRM-WF-01` | Bridge leave spawn + terminal callback; resolveDirectManager reads (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 393 | ~4.359 |  |
| `UC-HRM-WF-02` | Bridge leave spawn + terminal callback; resolveDirectManager reads (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 393 | ~4.359 |  |
| `UC-BP-REC-00h` | Thư viện mô tả công việc (JD master) — MVP | CODE-MEMORY Purpose | Tuyển dụng (REC) | 2 | 440 | ~4.250 |  |
| `UC-XBOS-ORG` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 398 | ~4.191 |  |
| `UC-XBOS-CC-08` | Hệ thống phòng ban mẫu | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 398 | ~4.191 |  |
| `UC-XBOS-ORG-01` | Xem và sửa cây pháp nhân / đơn vị tổ chức | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 398 | ~4.191 |  |
| `UC-PLT-SI-INR-01` | Settings CRUD catalog nhà BH — tạo mã N+1 → F5 list → retire ẩn picker. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 395 | ~4.105 |  |
| `UC-BP-ATT-04b` | Ứng phép & thời điểm cấp / không lương bù trừ | UC_INVENTORY | Chấm công & phép (ATT) | 2 | 475 | ~4.010 | **50 UC MVP GD1** |
| `UC-XBOS-CAT` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 334 | ~3.441 |  |
| `FR-UC-BP-CORE-02` | Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng) | catalog | Nhân sự / HĐLĐ (CORE) | 2 | 309 | ~3.409 | **50 UC MVP GD1** |
| `UC-HRM-RC-08` | CRUD reusable job-description templates; feed requisition create. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 272 | ~3.139 |  |
| `FR-UC-BP-ATT-01` | Thiết lập quy tắc ca theo bộ phận / nhóm | catalog | Chấm công & phép (ATT) | 1 | 253 | ~3.094 | **50 UC MVP GD1** |
| `UC-BP-PAY-03` | Giảm trừ gia cảnh từ hồ sơ (đủ quyền) | UC_INVENTORY | Tiền lương (PAY) | 3 | 317 | ~3.078 | **50 UC MVP GD1** |
| `UC-XBOS-WF` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 287 | ~2.945 |  |
| `FR-UC-BP-PAY-03` | Giảm trừ gia cảnh từ hồ sơ (đủ quyền) | catalog | Tiền lương (PAY) | 2 | 298 | ~2.910 | **50 UC MVP GD1** |
| `UC-HRM-AT-03` | Helper thuần + React Query cache cho catalog ký hiệu công hiệu lực. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 237 | ~2.907 |  |
| `UC-HRM-EM-01` | Map HrmEmployeeRecord → Employee; dept/position từ job_title_label / custom_fields; (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 267 | ~2.810 |  |
| `UC-BP-PAY-05` | Trần bảo hiểm trên tổng hợp kỳ (kể cả split) | UC_INVENTORY | Tiền lương (PAY) | 2 | 288 | ~2.792 | **50 UC MVP GD1** |
| `UC-XBOS-MD-01` | Quản lý chức danh (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-XBOS-MD-02` | Quản lý nhà cung cấp (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-XBOS-MD-03` | Quản lý loại chi phí (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-XBOS-MD-04` | Quản lý chỉ số KPI (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-XBOS-MD-05` | Quản lý khách hàng (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-XBOS-MD-06` | Quản lý đối tác (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-XBOS-MD-07` | Quản lý loại xe / tài sản (master) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 259 | ~2.713 |  |
| `UC-BP-CORE-09d` | Chọn mẫu HĐ theo catalog mở (ví dụ khởi tạo loại × khối · không trần 8) — ADD | UC_INVENTORY | Nhân sự / HĐLĐ (CORE) | 2 | 238 | ~2.662 | **50 UC MVP GD1** |
| `UC-HRM-TASK-01` | Create/edit task; employee/department pickers deferred until dialog open. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 170 | ~2.620 |  |
| `FR-UC-BP-PAY-05` | Trần bảo hiểm trên tổng hợp kỳ (kể cả split) | catalog | Tiền lương (PAY) | 1 | 261 | ~2.574 | **50 UC MVP GD1** |
| `UC-XBOS-07` | Tiếp nhận cảnh báo từ phân hệ vệ tinh | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 5 | 223 | ~2.454 |  |
| `UC-HRM-INT-03` | Nhân viên → Phiếu lương | SRS team / matrix | Tích hợp nội bộ | 1 | 225 | ~2.435 |  |
| `UC-PLT-EMP-CF-01c` | Consumer-write membership assert for extension codes in custom_fields. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Hồ sơ nhân viên (EMP) | 1 | 230 | ~2.419 |  |
| `FR-UC-BP-REC-07` | Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại) | catalog | Tuyển dụng (REC) | 2 | 236 | ~2.375 | **50 UC MVP GD1** |
| `UC-HRM-RC-09` | Render 6-column candidate pipeline from API-derived counts (post-WF sync). (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 2 | 221 | ~2.348 |  |
| `UC-HRM-REC-WF-05` | Render 6-column candidate pipeline from API-derived counts (post-WF sync). (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Tuyển dụng (REC) | 2 | 221 | ~2.348 |  |
| `FR-UC-BP-REC-02` | Yêu cầu tuyển trong định biên (luồng rút gọn) | catalog | Tuyển dụng (REC) | 1 | 226 | ~2.247 | **50 UC MVP GD1** |
| `UC-HRM-REC-WF-06` | POST /recruitment/workflow/step/terminal — internal JWT auth only. (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Tuyển dụng (REC) | 1 | 180 | ~1.986 |  |
| `UC-XBOS-16` | Yêu cầu tài sản — quy trình xác nhận kế toán (5 … | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 180 | ~1.876 |  |
| `UC-BP-ATT-05` | Phép chuyển kỳ (bảo lưu theo FY tenant) | UC_INVENTORY | Chấm công & phép (ATT) | 1 | 140 | ~1.866 | **50 UC MVP GD1** |
| `UC-HRM-08A` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 207 | ~1.841 |  |
| `UC-XBOS-12` | Gán hoặc thu hồi quyền; kiểm tra xung đột quyền | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 163 | ~1.748 |  |
| `FR-UC-BP-PLT-01` | Nền tảng cấu hình động (danh mục · schema · trường trộn) — ADD | catalog | Nhân sự / HĐLĐ (CORE) | 1 | 142 | ~1.744 | **50 UC MVP GD1** |
| `UC-XBOS-AST` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 172 | ~1.700 |  |
| `UC-XBOS-AST-01` | Đăng ký tài sản | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 172 | ~1.700 |  |
| `UC-XBOS-AST-02` | Theo dõi vòng đời tài sản | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 172 | ~1.700 |  |
| `UC-XBOS-KPI-03` | Tổng hợp KPI đa cấp (rollup) | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 3 | 166 | ~1.688 |  |
| `UC-HRM-04` | Mời nhân viên hàng loạt | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 132 | ~1.376 |  |
| `FR-UC-B04` | Flatten payload XBOS → view model picker-ready (code/label/status_label) (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 1 | 134 | ~1.347 |  |
| `UC-XBOS-KPI-02` | Tính KPI theo lô trên máy chủ | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 130 | ~1.318 |  |
| `UC-HRM-05` | Cập nhật thông tin nhạy cảm tài khoản | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 2 | 110 | ~1.303 |  |
| `UC-XBOS-AR` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 129 | ~1.302 |  |
| `UC-XBOS-AR-01` | Danh sách yêu cầu tài sản | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 129 | ~1.302 |  |
| `UC-XBOS-AR-02` | Tạo yêu cầu tài sản mới | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 129 | ~1.302 |  |
| `UC-XBOS-AR-03` | Chuyển trạng thái yêu cầu tài sản | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 129 | ~1.302 |  |
| `UC-XBOS-INF` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 114 | ~1.287 |  |
| `UC-XBOS-INF-02` | Quản lý mẫu siêu dữ liệu theo pháp nhân | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 114 | ~1.287 |  |
| `UC-XBOS-INF-02b` | Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script | chưa map | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 114 | ~1.287 |  |
| `UC-XBOS-TENANT-01` | Liệt kê tenant / công ty người dùng được truy cập | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 116 | ~1.283 |  |
| `UC-XBOS-TENANT-02` | Xem tổng quan tổ chức tập đoàn theo quyền | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 116 | ~1.283 |  |
| `UC-XBOS-TENANT-03` | Liệt kê đơn vị thành viên trong tập đoàn | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 116 | ~1.283 |  |
| `FR-UC-HRM-21` | Embed — Danh sách nhân sự | catalog | Embed portal HRM | 1 | 112 | ~1.248 |  |
| `UC-HRM-SCOPE-05` | Map JWT roleCode → Vietnamese chip text inside HRM embed (parity with portal TopHeader). (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 2 | 93 | ~1.241 |  |
| `UC-HRM-MOB-14` | Làm việc ngoại tuyến có kiểm soát | SRS team / matrix | Mobile HRM | 3 | 99 | ~914 |  |
| `UC-XBOS-CC-05` | Thanh điều hành — KPI / tác vụ / cảnh báo | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 55 | ~819 |  |
| `UC-HRM-MOB-04` | Ghi nhận chấm công / điểm danh | SRS team / matrix | Mobile HRM | 1 | 79 | ~763 |  |
| `FR-UC-H05` | DTO cập nhật chu kỳ đánh giá (name/dates/status). (từ @CODE-MEMORY Purpose) | CODE-MEMORY Purpose | Khác / chưa phân loại | 2 | 101 | ~733 |  |
| `FR-UC-BP-PAY-04` | Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép) | catalog | Tiền lương (PAY) | 1 | 56 | ~679 | **50 UC MVP GD1** |
| `UC-XBOS-AUTH-02` | Xem thông tin phiên đăng nhập | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 50 | ~536 |  |
| `UC-XBOS-01` | Kiểm tra trạng thái dịch vụ | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 33 | ~333 |  |
| `UC-XBOS-MET-01` | Xem chỉ số vận hành dịch vụ API | catalog | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 33 | ~333 |  |
| `UC-BP-REC-00b` | Thư viện mô tả công việc (JD master) — MVP | chưa map | Tuyển dụng (REC) | 1 | 52 | ~249 |  |
| `UC-HRM-01` | Kiểm tra trạng thái dịch vụ | SRS team / matrix | Nền tảng / tích hợp (XBOS·HRM admin) | 1 | 24 | ~208 |  |

---

## 50 UC chương trình MVP GD1 — đối chiếu mã nguồn

| # | UC | Tên use case (tiếng Việt) | File gắn UC | Token ước lượng |
|---|-----|------------------------|-------------|-----------------|
| 1 | `UC-BP-REC-01` | Quản trị định biên vị trí × 12 tháng (phòng ban trình; HCNS tổng hợp) | 3 | ~11.000 |
| 2 | `UC-BP-REC-01b` | Auto sinh YCTD theo tháng «Cần tuyển» | 3 | ~11.000 |
| 3 | `UC-BP-REC-02` | Yêu cầu tuyển trong định biên (luồng rút gọn) | 7 | ~48.693 |
| 4 | `UC-BP-REC-02b` | Yêu cầu tuyển ngoài định biên (có BOD) | 3 | ~11.929 |
| 5 | `UC-BP-REC-08` | Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người») | 15 | ~62.794 |
| 6 | `UC-BP-REC-06a` | Xếp / hủy / đổi lịch PV — tối đa một lịch đang hiệu lực / ứng viên × pháp nhân; badge danh sách | 6 | ~19.258 |
| 7 | `UC-BP-REC-00` | Thư viện mô tả công việc (JD master) — MVP | 3 | ~7.042 |
| 8 | `UC-BP-REC-04` | Quét kho CV nội bộ trước kênh ngoài | 7 | ~45.176 |
| 9 | `UC-BP-REC-05` | Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline) | 9 | ~21.706 |
| 10 | `UC-BP-REC-06` | Gửi thư tuyển + đánh giá PV trong pipeline ứng viên | 10 | ~50.940 |
| 11 | `UC-BP-REC-07` | Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại) | 13 | ~56.755 |
| 12 | `UC-BP-CORE-01` | Hồ sơ vòng công khai (hành chính / phúc lợi) | 6 | ~16.671 |
| 13 | `UC-BP-CORE-02` | Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng) | 5 | ~11.805 |
| 14 | `UC-BP-CORE-08` | Khen thưởng & kỷ luật — thi hành → bảng lương | 5 | ~35.972 |
| 15 | `UC-BP-CORE-09a` | Thư viện điều khoản HĐ (Cài đặt) — ADD | 6 | ~37.285 |
| 16 | `UC-BP-CORE-09b` | Chọn gói nghề và xem trước HĐLĐ — ADD | 2 | ~15.074 |
| 17 | `UC-BP-CORE-09c` | Lưu phiên bản và in / PDF hợp đồng — ADD | 4 | ~6.380 |
| 18 | `UC-BP-CORE-09d` | Chọn mẫu HĐ theo catalog mở (ví dụ khởi tạo loại × khối · không trần 8) — ADD | 2 | ~2.662 |
| 19 | `UC-BP-CORE-02b` | Cấu hình nhóm field hồ sơ (metadata) | — | — |
| 20 | `UC-BP-CORE-03` | Checklist giấy tờ động (bắt buộc / tùy chọn) | 9 | ~25.832 |
| 21 | `UC-BP-CORE-05` | Cấp phát tài sản & biên bản bàn giao | 4 | ~22.130 |
| 22 | `UC-BP-CORE-06` | Thu hồi tài sản khi kích hoạt nghỉ việc | 4 | ~10.159 |
| 23 | `UC-BP-CORE-07` | Kích hoạt hồ sơ Hoạt động khi checklist đủ | 6 | ~15.235 |
| 24 | `UC-BP-CORE-09` | Hợp đồng LĐ — mẫu Word keyword fill | 7 | ~52.805 |
| 25 | `UC-BP-CORE-10` | BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn) | 16 | ~52.446 |
| 26 | `UC-BP-PLT-01` | Nền tảng cấu hình động (danh mục · schema · trường trộn) — ADD | 3 | ~10.443 |
| 27 | `UC-BP-ATT-02` | Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ) | 5 | ~20.384 |
| 28 | `UC-BP-ATT-08` | Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ) | 6 | ~23.315 |
| 29 | `UC-BP-ATT-09` | Nộp & duyệt phép — hold quỹ khi submit | 4 | ~10.534 |
| 30 | `UC-BP-ATT-10` | Tổng hợp bảng công (phễu giờ công tính lương) | 8 | ~14.262 |
| 31 | `UC-BP-ATT-11` | Ký chốt bảng công trước khi tính lương (workflow XBOS) | 9 | ~62.815 |
| 32 | `UC-BP-ATT-01` | Thiết lập quy tắc ca theo bộ phận / nhóm | 4 | ~9.535 |
| 33 | `UC-BP-ATT-03b` | Lịch lễ / Tết (dương + âm cấu hình năm) | 3 | ~19.706 |
| 34 | `UC-BP-ATT-03d` | Danh mục điểm GPS chấm công (vùng hợp lệ) — ADD MVP | 7 | ~30.086 |
| 35 | `UC-BP-ATT-04` | Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …) | 8 | ~36.384 |
| 36 | `UC-BP-ATT-04b` | Ứng phép & thời điểm cấp / không lương bù trừ | 2 | ~4.010 |
| 37 | `UC-BP-ATT-05` | Phép chuyển kỳ (bảo lưu theo FY tenant) | 1 | ~1.866 |
| 38 | `UC-BP-ATT-05b` | Panel quỹ phép khi nộp đơn — ADD MVP | 5 | ~12.052 |
| 39 | `UC-BP-ATT-06` | Phép bù OT khi công ty bật chế độ | 6 | ~21.148 |
| 40 | `UC-BP-ATT-07` | Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có) | 4 | ~13.253 |
| 41 | `UC-BP-ATT-12` | Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động | 5 | ~9.624 |
| 42 | `UC-BP-PAY-01` | Ranh giới: lương chỉ đọc bảng công đã chốt | 5 | ~21.432 |
| 43 | `UC-BP-PAY-02` | Lắp ráp và chạy động cơ công thức lương | 9 | ~71.460 |
| 44 | `UC-BP-PAY-04` | Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép) | 3 | ~5.927 |
| 45 | `UC-BP-PAY-03` | Giảm trừ gia cảnh từ hồ sơ (đủ quyền) | 3 | ~3.078 |
| 46 | `UC-BP-PAY-05` | Trần bảo hiểm trên tổng hợp kỳ (kể cả split) | 2 | ~2.792 |
| 47 | `UC-BP-PAY-06` | Tính lương kỳ khi đã Hoạt động + bảng công chốt | 6 | ~27.389 |
| 48 | `UC-BP-PAY-07` | Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối | 2 | ~6.083 |
| 49 | `UC-BP-PAY-08` | Phiếu lương — preview, bảo mật, trạng thái TT | 4 | ~7.067 |
| 50 | `UC-BP-PAY-09` | Phân nhóm bảng lương (VP / KD / tài xế / vận hành) | 4 | ~7.361 |

---

## Chi tiết file theo từng UC (top theo token)

### `UC-HRM-PAY` — Nhóm module embed Tiền lương (alias kỹ thuật → UC-BP-PAY-01..09, UC-HRM-24)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* alias dev · *9 file · ~108.477 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/pages/Payroll.tsx` | 4451 | 57.360 |
| `apps/web/hrm/src/components/payroll/SalaryComponentsTab.tsx` | 1326 | 16.513 |
| `apps/web/hrm/src/components/payroll/AdvanceRequestsTab.tsx` | 935 | 11.242 |
| `apps/web/hrm/src/components/payroll/payrollDomainUi.ts` | 736 | 6.778 |
| `apps/web/hrm/src/components/payroll/PayslipPrintDialog.tsx` | 576 | 5.980 |
| `apps/web/hrm/src/hooks/usePayrollDomainUi.ts` | 446 | 5.034 |
| `apps/web/hrm/src/components/payroll/taxSettlementFloatingUi.ts` | 259 | 2.782 |
| `apps/web/hrm/src/components/payroll/salaryComponentFormSchema.ts` | 190 | 2.089 |
| `apps/web/hrm/src/components/payroll/advanceRequestFormUi.ts` | 63 | 699 |

### `UC-HRM-25` — Embed — Hợp đồng và bảo hiểm xã hội

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *12 file · ~104.138 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` | 2047 | 23.650 |
| `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | 1446 | 17.753 |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.ts` | 1318 | 17.577 |
| `apps/api/hrm-api/src/catalog-extensions/catalog-extensions.service.ts` | 1091 | 13.483 |
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` | 1249 | 13.085 |
| `apps/web/hrm/src/hooks/useInsuranceList.ts` | 518 | 5.102 |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.controller.spec.ts` | 339 | 4.471 |
| `apps/web/hrm/src/hooks/useEmployeeContracts.ts` | 284 | 2.688 |
| `apps/web/web-portal/src/modules/hrm/hrmWorkspaceEmbedApi.ts` | 217 | 2.221 |
| `apps/web/hrm/src/lib/contractEndDatePolicy.ts` | 159 | 1.773 |
| `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts` | 214 | 1.491 |
| `apps/api/hrm-api/src/contracts-insurance/contract-end-date-policy.ts` | 79 | 844 |

### `FR-UC-BP-CORE-09` — Hợp đồng LĐ — mẫu Word keyword fill

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *17 file · ~102.601 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` | 2970 | 31.430 |
| `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` | 1695 | 21.198 |
| `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx` | 1138 | 13.239 |
| `apps/api/hrm-api/src/contracts-insurance/contract-library-publish.service.ts` | 956 | 10.207 |
| `apps/web/hrm/src/lib/contractCreateApi.ts` | 405 | 3.997 |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.constants.ts` | 317 | 3.668 |
| `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx` | 379 | 3.627 |
| `apps/api/hrm-api/src/contracts-insurance/dto/contract-legal-print.dto.ts` | 437 | 2.379 |
| `apps/api/hrm-api/src/contracts-insurance/contract-print-pdf.renderer.ts` | 167 | 1.804 |
| `apps/web/hrm/src/lib/contractTemplateCatalog.ts` | 148 | 1.745 |
| `apps/web/hrm/src/lib/contractLibraryPublishRequest.ts` | 148 | 1.555 |
| `apps/web/hrm/src/lib/contractClauseLibraryUx.ts` | 125 | 1.532 |
| `apps/web/hrm/src/lib/contractPrintFieldOverrides.ts` | 138 | 1.464 |
| `apps/web/hrm/src/lib/contractClauseOrder.ts` | 133 | 1.455 |
| `apps/web/hrm/src/lib/contractLegalPrintConstants.ts` | 125 | 1.338 |
| `apps/web/hrm/src/lib/contractPrintRequest.ts` | 84 | 1.046 |
| `apps/web/hrm/src/lib/contractCreateFieldManifest.ts` | 90 | 917 |

### `UC-HRM-21` — Embed — Danh sách nhân sự

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *14 file · ~92.304 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/employees/employees.controller.ts` | 1641 | 22.036 |
| `apps/api/hrm-api/src/employees/employees.service.ts` | 1765 | 19.910 |
| `apps/api/hrm-api/src/employees/employee-profile.service.ts` | 1290 | 14.183 |
| `apps/web/hrm/src/components/employee/EmployeeTraining.tsx` | 706 | 8.939 |
| `apps/web/hrm/src/pages/Employees.tsx` | 692 | 7.645 |
| `apps/web/hrm/src/components/employee/EmployeeWorkTimeline.tsx` | 585 | 7.466 |
| `apps/api/hrm-api/src/operating-units/be-hrm-emp-company-col-01.spec.ts` | 215 | 2.549 |
| `apps/web/hrm/src/hooks/useEmployeeTraining.ts` | 234 | 2.305 |
| `apps/api/hrm-api/src/operating-units/hrm-company-display-name.ts` | 126 | 1.457 |
| `apps/web/hrm/src/lib/hrmOperatingUnits.ts` | 126 | 1.411 |
| `apps/api/hrm-api/src/employees/employee-display.ts` | 112 | 1.248 |
| `apps/api/hrm-api/src/operating-units/operating-units.service.ts` | 99 | 1.227 |
| `apps/web/hrm/src/lib/employeeCompanyDisplayName.ts` | 85 | 1.009 |
| `apps/api/hrm-api/src/operating-units/hrm-operating-unit-registry.ts` | 78 | 919 |

### `UC-HRM-20` — Embed — Tổng quan HRM

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *12 file · ~87.238 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/modules/hrm/HrmWorkspacePanel.tsx` | 1800 | 25.104 |
| `apps/api/hrm-api/src/employees/employees.controller.ts` | 1641 | 22.036 |
| `apps/api/hrm-api/src/employees/employees.service.ts` | 1765 | 19.910 |
| `apps/web/hrm/src/pages/Dashboard.tsx` | 952 | 13.302 |
| `apps/web/web-portal/src/modules/hrm/hrmWorkspaceEmbedApi.ts` | 217 | 2.221 |
| `apps/api/hrm-api/src/employees/d-dash-01-employees-summary.spec.ts` | 141 | 1.515 |
| `apps/web/web-portal/src/modules/hrm/hrmWorkspaceEmbedApi.test.ts` | 121 | 1.221 |
| `apps/web/hrm/src/hooks/useExpiringContractsDashboard.ts` | 47 | 612 |
| `apps/web/hrm/src/lib/dashboardPayrollChart.ts` | 35 | 483 |
| `apps/web/web-portal/src/modules/hrm/mock-data.ts` | 33 | 363 |
| `apps/web/hrm/src/pages/Index.tsx` | 29 | 286 |
| `apps/web/hrm/src/hooks/useOperationsSummary.test.ts` | 24 | 185 |

### `UC-HRM-23` — Embed — Chấm công

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *6 file · ~87.161 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/pages/Attendance.tsx` | 5290 | 70.882 |
| `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` | 541 | 6.917 |
| `apps/web/hrm/src/components/attendance/CheckInOutWidget.tsx` | 447 | 5.621 |
| `apps/web/hrm/src/hooks/useWeeklyAttendanceSummary.ts` | 189 | 1.833 |
| `apps/web/hrm/src/components/attendance/ClockInMethodSelector.tsx` | 100 | 1.089 |
| `apps/web/hrm/src/lib/clockInMethods.ts` | 88 | 819 |

### `UC-HRM-22` — Embed — Tuyển dụng

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *6 file · ~83.494 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | 4285 | 48.029 |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.ts` | 1964 | 25.757 |
| `apps/api/hrm-api/src/recruitment/recruitment.controller.spec.ts` | 525 | 5.962 |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | 138 | 1.694 |
| `apps/api/hrm-api/src/recruitment/dto/create-job-requisition.dto.ts` | 124 | 1.073 |
| `apps/web/hrm/src/lib/recruitmentFunnel.ts` | 103 | 979 |

### `UC-HRM-28` — App — Cơ cấu lương NV

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *4 file · ~74.452 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | 3289 | 35.664 |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | 1644 | 21.972 |
| `apps/api/hrm-api/src/payroll/payroll-catalog.service.ts` | 1229 | 14.053 |
| `apps/web/hrm/src/hooks/useSalaryComponents.ts` | 299 | 2.763 |

### `UC-BP-PAY-02` — Lắp ráp và chạy động cơ công thức lương

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *9 file · ~71.460 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | 1761 | 17.571 |
| `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | 1397 | 15.655 |
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | 1026 | 10.585 |
| `apps/web/hrm/src/components/settings/PaySheetTemplateSettingsPanel.tsx` | 752 | 8.384 |
| `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` | 795 | 7.388 |
| `apps/web/hrm/src/lib/payFormulaCatalog.ts` | 511 | 5.377 |
| `apps/api/hrm-api/src/payroll/pay-formula-evaluator.ts` | 367 | 3.316 |
| `apps/web/hrm/src/lib/paySheetTemplateCatalog.ts` | 209 | 2.232 |
| `apps/api/hrm-api/src/payroll/pay-formula.constants.ts` | 79 | 952 |

### `FR-UC-BP-PAY-02` — Lắp ráp và chạy động cơ công thức lương

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *9 file · ~71.460 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-formula.service.ts` | 1761 | 17.571 |
| `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | 1397 | 15.655 |
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | 1026 | 10.585 |
| `apps/web/hrm/src/components/settings/PaySheetTemplateSettingsPanel.tsx` | 752 | 8.384 |
| `apps/api/hrm-api/src/payroll/pay-formula-variable-bag.ts` | 795 | 7.388 |
| `apps/web/hrm/src/lib/payFormulaCatalog.ts` | 511 | 5.377 |
| `apps/api/hrm-api/src/payroll/pay-formula-evaluator.ts` | 367 | 3.316 |
| `apps/web/hrm/src/lib/paySheetTemplateCatalog.ts` | 209 | 2.232 |
| `apps/api/hrm-api/src/payroll/pay-formula.constants.ts` | 79 | 952 |

### `UC-HRM-32` — App — Chấm công đầy đủ

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *1 file · ~70.882 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/pages/Attendance.tsx` | 5290 | 70.882 |

### `UC-HRM-24` — Embed — Lương

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *4 file · ~65.086 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/payroll.service.ts` | 3289 | 35.664 |
| `apps/api/hrm-api/src/payroll/payroll.controller.ts` | 1644 | 21.972 |
| `apps/api/hrm-api/src/payroll/payroll.controller.spec.ts` | 470 | 5.229 |
| `apps/web/web-portal/src/modules/hrm/hrmWorkspaceEmbedApi.ts` | 217 | 2.221 |

### `UC-BP-ATT-11` — Ký chốt bảng công trước khi tính lương (workflow XBOS)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *9 file · ~62.815 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/attendance.controller.ts` | 2194 | 29.675 |
| `apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx` | 929 | 10.823 |
| `apps/api/hrm-api/src/attendance/attendance-catalog.service.ts` | 540 | 6.401 |
| `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts` | 505 | 4.548 |
| `apps/api/hrm-api/src/attendance/attendance-sheet-sign.service.ts` | 359 | 3.962 |
| `apps/web/hrm/src/lib/attSheet11Ring.ts` | 253 | 2.931 |
| `apps/api/hrm-api/src/attendance/attendance-sheet-scope-parity.spec.ts` | 225 | 2.197 |
| `apps/web/hrm/src/lib/attSheet11Ring.test.ts` | 146 | 1.607 |
| `apps/api/hrm-api/src/attendance/attendance-sheet-scope.ts` | 57 | 671 |

### `UC-BP-REC-08` — Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người»)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *15 file · ~62.794 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | 2660 | 32.952 |
| `apps/api/hrm-api/src/recruitment/recruitment-dashboard.service.ts` | 644 | 6.153 |
| `apps/web/hrm/src/components/recruitment/RecruitmentNestDashboardPanel.tsx` | 412 | 5.123 |
| `apps/api/hrm-api/src/recruitment/recruitment-dashboard.formulas.ts` | 487 | 4.479 |
| `apps/web/hrm/src/components/recruitment/RecruitmentReportsTab.tsx` | 220 | 2.659 |
| `apps/web/hrm/src/hooks/useReportsData.ts` | 189 | 1.899 |
| `apps/web/hrm/src/lib/recruitmentDashboardNestBind.ts` | 179 | 1.795 |
| `apps/web/hrm/src/components/reports/RecruitmentReportTab.tsx` | 170 | 1.759 |
| `apps/web/hrm/src/lib/recruitmentDashboardNestBind.test.ts` | 163 | 1.656 |
| `apps/web/hrm/src/hooks/useRecruitmentNestDashboard.ts` | 125 | 1.307 |
| `apps/api/hrm-api/src/recruitment/recruitment-dashboard.constants.ts` | 71 | 1.031 |
| `apps/web/hrm/src/lib/recruitmentDashboardAggregator.ts` | 68 | 723 |
| `apps/web/hrm/src/hooks/useRecruitmentDashboard.ts` | 50 | 526 |
| `apps/api/hrm-api/src/recruitment/dto/recruitment-dashboard.query.dto.ts` | 70 | 503 |
| `apps/web/hrm/src/lib/recruitmentDashboardAggregator.test.ts` | 27 | 229 |

### `UC-BP-REC-07` — Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *13 file · ~56.755 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | 1275 | 16.568 |
| `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` | 912 | 10.861 |
| `apps/web/hrm/src/lib/apiError.ts` | 510 | 10.569 |
| `apps/web/hrm/src/components/recruitment/CandidateAcceptOfferDialog.tsx` | 442 | 4.686 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-07-cluster-be-01.spec.ts` | 368 | 3.898 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-07-cluster-be-02.spec.ts` | 296 | 3.043 |
| `apps/web/hrm/src/lib/recCandidateAcceptOffer.ts` | 194 | 2.312 |
| `apps/web/hrm/src/lib/hireReadinessUi.ts` | 128 | 1.262 |
| `apps/web/hrm/src/components/employee/HireReadinessBanner.tsx` | 108 | 1.113 |
| `apps/web/hrm/src/lib/recCandidateAcceptOffer.test.ts` | 96 | 958 |
| `apps/api/hrm-api/src/recruitment/rec-hire.constants.ts` | 61 | 656 |
| `apps/web/hrm/src/lib/apiError.recruitment-hire.test.ts` | 44 | 446 |
| `apps/api/hrm-api/src/recruitment/dto/accept-offer.dto.ts` | 36 | 383 |

### `UC-BP-CORE-09` — Hợp đồng LĐ — mẫu Word keyword fill

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *7 file · ~52.805 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` | 2970 | 31.430 |
| `apps/web/hrm/src/hooks/useContracts.ts` | 525 | 5.473 |
| `apps/web/hrm/src/lib/contractCreateApi.ts` | 405 | 3.997 |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.constants.ts` | 317 | 3.668 |
| `apps/web/hrm/src/components/contracts/ContractCreateWizardDialog.tsx` | 379 | 3.627 |
| `apps/api/hrm-api/src/contracts-insurance/dto/contract-legal-print.dto.ts` | 437 | 2.379 |
| `apps/web/hrm/src/lib/contractCore09Ring.ts` | 184 | 2.231 |

### `UC-BP-CORE-10` — BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *16 file · ~52.446 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` | 669 | 9.173 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurance-type.service.ts` | 753 | 7.586 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurer.service.ts` | 714 | 6.801 |
| `apps/api/hrm-api/src/employee-insurances/employee-insurances.service.ts` | 570 | 6.507 |
| `apps/web/hrm/src/hooks/useEmployeeInsurance.ts` | 771 | 4.323 |
| `apps/web/hrm/src/components/employee/InsuranceTimelineActionsPanel.tsx` | 284 | 3.083 |
| `apps/api/hrm-api/src/employees/po-hrm-e2e-link-emp-be-02.spec.ts` | 277 | 2.971 |
| `apps/web/hrm/src/lib/insuranceTimelineActions.ts` | 255 | 2.742 |
| `apps/web/hrm/src/lib/empCoreSiRing.ts` | 195 | 2.244 |
| `apps/api/hrm-api/src/employee-insurances/insurance-enrollment-bridge.ts` | 175 | 1.929 |
| `apps/web/hrm/src/lib/siInsuranceTypeCatalog.ts` | 114 | 1.246 |
| `apps/web/hrm/src/lib/siInsurerCatalog.ts` | 101 | 1.106 |
| `apps/api/hrm-api/src/employee-insurances/dto/create-employee-insurance.dto.ts` | 79 | 762 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurer.constants.ts` | 53 | 706 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurance-type.constants.ts` | 48 | 647 |
| `apps/api/hrm-api/src/employee-insurances/dto/update-employee-insurance.dto.ts` | 73 | 620 |

### `UC-BP-REC-06` — Gửi thư tuyển + đánh giá PV trong pipeline ứng viên

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *10 file · ~50.940 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | 1275 | 16.568 |
| `apps/web/hrm/src/components/recruitment/CandidateEvaluationDialog.tsx` | 933 | 11.409 |
| `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` | 912 | 10.861 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-06-cluster-be-01.spec.ts` | 415 | 4.501 |
| `apps/web/hrm/src/components/recruitment/CandidateMailDialog.tsx` | 307 | 3.290 |
| `apps/web/hrm/src/lib/recCandidateMailEval.ts` | 163 | 1.844 |
| `apps/api/hrm-api/src/recruitment/rec-mail-eval.constants.ts` | 63 | 760 |
| `apps/web/hrm/src/lib/recCandidateMailEval.test.ts` | 82 | 694 |
| `apps/api/hrm-api/src/recruitment/dto/candidate-mail.dto.ts` | 77 | 555 |
| `apps/web/hrm/src/lib/apiError.recruitment-mail-eval.test.ts` | 47 | 458 |

### `UC-BP-REC-02` — Yêu cầu tuyển trong định biên (luồng rút gọn)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *7 file · ~48.693 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | 2660 | 32.952 |
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.ts` | 578 | 6.104 |
| `apps/api/hrm-api/src/recruitment/yctd-requisition-gates.ts` | 551 | 5.436 |
| `apps/api/hrm-api/src/recruitment/yctd-jd-bind.ts` | 226 | 2.247 |
| `apps/api/hrm-api/src/recruitment/dto/create-job-requisition.dto.ts` | 124 | 1.073 |
| `apps/api/hrm-api/src/recruitment/dto/patch-requisition-pipeline-flags.dto.ts` | 53 | 492 |
| `apps/api/hrm-api/src/recruitment/dto/requisition-transition.dto.ts` | 39 | 389 |

### `UC-BP-REC-04` — Quét kho CV nội bộ trước kênh ngoài

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *7 file · ~45.176 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | 2660 | 32.952 |
| `apps/web/hrm/src/components/recruitment/InternalCvScanDialog.tsx` | 455 | 4.887 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-04-cluster-be-01.spec.ts` | 430 | 4.087 |
| `apps/web/hrm/src/lib/jobRequisitionCvScan.ts` | 143 | 1.701 |
| `apps/api/hrm-api/src/recruitment/dto/internal-scan.dto.ts` | 68 | 542 |
| `apps/api/hrm-api/src/recruitment/dto/list-candidates-table.query.dto.ts` | 73 | 515 |
| `apps/api/hrm-api/src/recruitment/dto/patch-requisition-pipeline-flags.dto.ts` | 53 | 492 |

### `FR-UC-BP-CORE-10` — BHXH lifecycle (Hoạt động / Ngừng / Tạm hoãn)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *15 file · ~43.273 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/si-insurance-type.service.ts` | 753 | 7.586 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurer.service.ts` | 714 | 6.801 |
| `apps/api/hrm-api/src/employee-insurances/employee-insurances.service.ts` | 570 | 6.507 |
| `apps/web/hrm/src/hooks/useEmployeeInsurance.ts` | 771 | 4.323 |
| `apps/web/hrm/src/components/employee/InsuranceTimelineActionsPanel.tsx` | 284 | 3.083 |
| `apps/api/hrm-api/src/employees/po-hrm-e2e-link-emp-be-02.spec.ts` | 277 | 2.971 |
| `apps/web/hrm/src/lib/insuranceTimelineActions.ts` | 255 | 2.742 |
| `apps/web/hrm/src/lib/empCoreSiRing.ts` | 195 | 2.244 |
| `apps/api/hrm-api/src/employee-insurances/insurance-enrollment-bridge.ts` | 175 | 1.929 |
| `apps/web/hrm/src/lib/siInsuranceTypeCatalog.ts` | 114 | 1.246 |
| `apps/web/hrm/src/lib/siInsurerCatalog.ts` | 101 | 1.106 |
| `apps/api/hrm-api/src/employee-insurances/dto/create-employee-insurance.dto.ts` | 79 | 762 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurer.constants.ts` | 53 | 706 |
| `apps/api/hrm-api/src/contracts-insurance/si-insurance-type.constants.ts` | 48 | 647 |
| `apps/api/hrm-api/src/employee-insurances/dto/update-employee-insurance.dto.ts` | 73 | 620 |

### `UC-HRM-27` — Embed — Quyết định và báo cáo (backlog)

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *7 file · ~41.281 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/pages/Decisions.tsx` | 1647 | 19.489 |
| `apps/api/hrm-api/src/decisions/decisions.service.ts` | 906 | 10.532 |
| `apps/web/hrm/src/pages/ToolsEquipment.tsx` | 260 | 3.878 |
| `apps/web/hrm/src/hooks/useDecisions.ts` | 304 | 3.008 |
| `apps/api/hrm-api/src/decisions/decisions.service.spec.ts` | 248 | 2.283 |
| `apps/web/hrm/src/lib/decisionListUi.ts` | 96 | 1.149 |
| `apps/web/hrm/src/hooks/useToolsEquipment.ts` | 101 | 942 |

### `UC-BP-CORE-09a` — Thư viện điều khoản HĐ (Cài đặt) — ADD

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *6 file · ~37.285 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/settings/ContractLegalPrintSettingsPanel.tsx` | 1695 | 21.198 |
| `apps/api/hrm-api/src/contracts-insurance/contract-library-publish.service.ts` | 956 | 10.207 |
| `apps/web/hrm/src/lib/contractLibraryPublishRequest.ts` | 148 | 1.555 |
| `apps/web/hrm/src/lib/contractClauseLibraryUx.ts` | 125 | 1.532 |
| `apps/web/hrm/src/lib/contractClauseOrder.ts` | 133 | 1.455 |
| `apps/web/hrm/src/lib/contractLegalPrintConstants.ts` | 125 | 1.338 |

### `UC-BP-ATT-04` — Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *8 file · ~36.384 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.ts` | 1063 | 10.883 |
| `apps/api/hrm-api/src/attendance/att-leave-type.service.ts` | 826 | 8.671 |
| `apps/web/hrm/src/components/settings/AttLeaveAccrualPolicySettingsPanel.tsx` | 510 | 5.851 |
| `apps/web/hrm/src/components/settings/AttLeaveTypeSettingsPanel.tsx` | 479 | 5.131 |
| `apps/web/hrm/src/lib/attLeave04Ring.ts` | 196 | 2.199 |
| `apps/web/hrm/src/components/attendance/AttLeaveTrackedEntitlementGrantPanel.tsx` | 178 | 1.982 |
| `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.constants.ts` | 65 | 848 |
| `apps/web/hrm/src/lib/attLeave04Ring.test.ts` | 73 | 819 |

### `UC-BP-CORE-08` — Khen thưởng & kỷ luật — thi hành → bảng lương

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *5 file · ~35.972 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeRewardsDiscipline.tsx` | 975 | 12.739 |
| `apps/api/hrm-api/src/employees/employee-reward-discipline.service.ts` | 1104 | 11.352 |
| `apps/web/hrm/src/hooks/useEmployeeRewardsDiscipline.ts` | 558 | 5.671 |
| `apps/api/hrm-api/src/employees/po-hrm-mvp-gd1-core-08-cluster-be-01.spec.ts` | 385 | 4.080 |
| `apps/web/hrm/src/lib/empCoreRdRing.ts` | 195 | 2.130 |

### `UC-HRM-ATT-LEAVE-01` — Luồng đơn nghỉ phép embed (alias → UC-BP-ATT-09, UC-HRM-10)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* alias dev · *4 file · ~35.414 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | 2420 | 30.705 |
| `apps/web/hrm/src/lib/leaveBalance.ts` | 219 | 2.530 |
| `apps/web/hrm/src/hooks/useLeaveBalancesByType.ts` | 142 | 1.452 |
| `apps/web/hrm/src/hooks/useLeaveBalance.ts` | 76 | 727 |

### `UC-HRM-CI-08` — Tạo gói cơ cấu lương NV (base / thử việc / phụ cấp)

*Khối:* Hợp đồng & BH (CI) · *Nguồn tên:* alias dev · *7 file · ~33.468 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` | 1249 | 13.085 |
| `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` | 733 | 8.719 |
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.spec.ts` | 632 | 5.989 |
| `apps/web/hrm/src/hooks/useEmployeeCompensation.ts` | 225 | 2.435 |
| `apps/web/hrm/src/lib/compensationLines.ts` | 188 | 2.012 |
| `apps/api/hrm-api/src/contracts-insurance/dto/update-contract.dto.ts` | 164 | 827 |
| `apps/web/hrm/src/lib/compensationAllowanceCodes.ts` | 32 | 401 |

### `FR-UC-BP-ATT-03` — Thu nhận điểm danh đa nguồn → giờ công thô

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *5 file · ~33.305 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/attendance-config.service.ts` | 1012 | 10.278 |
| `apps/web/hrm/src/components/attendance/AttHolidayCalendarPanel.tsx` | 628 | 7.525 |
| `apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts` | 595 | 6.345 |
| `apps/web/hrm/src/lib/attHoliday03bRing.ts` | 542 | 5.836 |
| `apps/web/hrm/src/lib/attWorkSite03dRing.ts` | 265 | 3.321 |

### `FR-UC-BP-CORE-08` — Khen thưởng & kỷ luật — thi hành → bảng lương

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *4 file · ~31.892 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeRewardsDiscipline.tsx` | 975 | 12.739 |
| `apps/api/hrm-api/src/employees/employee-reward-discipline.service.ts` | 1104 | 11.352 |
| `apps/web/hrm/src/hooks/useEmployeeRewardsDiscipline.ts` | 558 | 5.671 |
| `apps/web/hrm/src/lib/empCoreRdRing.ts` | 195 | 2.130 |

### `UC-BP-REC-00a` — Thư viện mô tả công việc (JD master) — MVP

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *5 file · ~31.448 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/jd-dynamic.service.ts` | 1867 | 21.035 |
| `apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx` | 739 | 8.415 |
| `apps/api/hrm-api/src/recruitment/jd-dynamic.constants.ts` | 164 | 1.493 |
| `apps/api/hrm-api/src/recruitment/dto/create-jd-field-def.dto.ts` | 56 | 262 |
| `apps/api/hrm-api/src/recruitment/dto/update-jd-field-def.dto.ts` | 46 | 243 |

### `UC-XBOS-02` — Khởi tạo hoặc cập nhật danh mục dùng chung

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~31.388 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/config-sync/config-sync.service.ts` | 1580 | 16.091 |
| `apps/api/xbos-api/dist-test/config-sync/config-sync.service.js` | 816 | 10.713 |
| `apps/api/xbos-api/src/config-sync/config-sync.controller.spec.ts` | 470 | 4.584 |

### `FR-UC-M01` — Đăng nhập, phiên JWT và shell portal (FR ecosystem M01)

*Khối:* Metadata / workflow (M01) · *Nguồn tên:* alias dev · *12 file · ~31.293 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/context/AuthContext.tsx` | 1003 | 6.742 |
| `apps/mobile/hrm-mobile/src/features/auth/LoginScreen.tsx` | 515 | 5.857 |
| `apps/web/web-portal/src/integrations/authSession.ts` | 428 | 4.685 |
| `apps/mobile/hrm-mobile/src/features/auth/ScopeScreen.tsx` | 304 | 3.388 |
| `apps/web/web-portal/src/pages/auth/LoginPage.tsx` | 220 | 2.632 |
| `apps/web/web-portal/src/contexts/AuthContext.tsx` | 228 | 2.169 |
| `apps/api/hrm-api/src/auth/uat-mobile-auth-ensure.ts` | 174 | 1.497 |
| `apps/api/xbos-api/src/auth/membership-display.ts` | 101 | 987 |
| `apps/api/xbos-api/dist-test/auth/membership-display.js` | 85 | 929 |
| `apps/mobile/hrm-mobile/src/features/auth/membershipDisplay.ts` | 63 | 811 |
| `apps/web/web-portal/src/components/layout/ExecutiveDashboardLayout.tsx` | 60 | 807 |
| `apps/api/hrm-api/src/auth/mobile-membership-display.ts` | 88 | 789 |

### `FR-UC-BP-ATT-04` — Cấp phát phép năm + danh mục loại phép (năm · thâm niên · …)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *6 file · ~30.819 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.ts` | 1063 | 10.883 |
| `apps/api/hrm-api/src/attendance/att-leave-type.service.ts` | 826 | 8.671 |
| `apps/web/hrm/src/components/settings/AttLeaveAccrualPolicySettingsPanel.tsx` | 510 | 5.851 |
| `apps/web/hrm/src/lib/attLeave04bRing.ts` | 200 | 2.367 |
| `apps/web/hrm/src/lib/attLeave04Ring.ts` | 196 | 2.199 |
| `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.constants.ts` | 65 | 848 |

### `UC-HRM-REC` — Nhóm module embed Tuyển dụng (alias → UC-HRM-22, UC-BP-REC-*)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* alias dev · *1 file · ~30.199 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/pages/Recruitment.tsx` | 2254 | 30.199 |

### `UC-BP-ATT-03d` — Danh mục điểm GPS chấm công (vùng hợp lệ) — ADD MVP

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *7 file · ~30.086 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/GPSAttendance.tsx` | 819 | 10.312 |
| `apps/api/hrm-api/src/attendance/attendance-config.service.ts` | 1012 | 10.278 |
| `apps/web/hrm/src/hooks/useAttendanceRules.ts` | 418 | 4.497 |
| `apps/web/hrm/src/lib/attWorkSite03dRing.ts` | 265 | 3.321 |
| `apps/web/hrm/src/lib/attWorkSite03dRing.test.ts` | 101 | 1.301 |
| `apps/api/hrm-api/src/attendance/dto/create-work-site.dto.ts` | 39 | 202 |
| `apps/api/hrm-api/src/attendance/dto/update-work-site.dto.ts` | 37 | 175 |

### `UC-HRM-06` — Đồng bộ dữ liệu dùng chung từ XBOS

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *4 file · ~28.469 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts` | 1643 | 17.670 |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | 730 | 7.611 |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts` | 207 | 1.841 |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync-display.ts` | 134 | 1.347 |

### `UC-BP-PAY-06` — Tính lương kỳ khi đã Hoạt động + bảng công chốt

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *6 file · ~27.389 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | 1026 | 10.585 |
| `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` | 866 | 8.857 |
| `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` | 577 | 5.706 |
| `apps/api/hrm-api/src/payroll/pay-tncn-resolver.ts` | 159 | 1.549 |
| `apps/web/hrm/src/components/payroll/payrollPaySheetTemplateSelect.ts` | 44 | 534 |
| `apps/api/hrm-api/src/payroll/pay-tax.constants.ts` | 23 | 158 |

### `FR-UC-BP-PAY-06` — Tính lương kỳ khi đã Hoạt động + bảng công chốt

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *5 file · ~27.231 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-sheet-template.service.ts` | 1026 | 10.585 |
| `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` | 866 | 8.857 |
| `apps/api/hrm-api/src/payroll/pay-src-resolver.ts` | 577 | 5.706 |
| `apps/api/hrm-api/src/payroll/pay-tncn-resolver.ts` | 159 | 1.549 |
| `apps/web/hrm/src/components/payroll/payrollPaySheetTemplateSelect.ts` | 44 | 534 |

### `FR-UC-BP-CORE-01` — Hồ sơ vòng công khai (hành chính / phúc lợi)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *7 file · ~27.212 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/decisions/hr-decision-type.service.ts` | 897 | 9.087 |
| `apps/web/hrm/src/components/employee/EmployeeFamilyInfo.tsx` | 655 | 7.510 |
| `apps/api/hrm-api/src/employees/employee-dependents.service.ts` | 448 | 4.523 |
| `apps/api/hrm-api/src/employees/employee-public-ring.ts` | 197 | 1.866 |
| `apps/web/hrm/src/lib/decisionPersonBound.ts` | 174 | 1.834 |
| `apps/web/hrm/src/lib/empCorePublicRing.ts` | 115 | 1.380 |
| `apps/web/hrm/src/lib/employeeWorkTimelineUi.ts` | 85 | 1.012 |

### `UC-HRM-09` — Vòng đời đơn chỉnh sửa chấm công + thông báo

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *6 file · ~27.063 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/attendance.service.ts` | 1023 | 11.335 |
| `apps/web/hrm/src/components/attendance/AttendanceUpdateRequestTab.tsx` | 556 | 8.388 |
| `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts` | 243 | 3.085 |
| `apps/web/hrm/src/hooks/useAttendanceUpdateRequests.ts` | 138 | 1.931 |
| `apps/web/hrm/src/lib/attendanceUpdateRequestTime.ts` | 109 | 1.233 |
| `apps/web/hrm/src/lib/leaveRequestDateWindow.ts` | 115 | 1.091 |

### `UC-BP-CORE-03` — Checklist giấy tờ động (bắt buộc / tùy chọn)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *9 file · ~25.832 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/employees/emp-document-checklist.service.ts` | 872 | 8.152 |
| `apps/api/hrm-api/src/employees/emp-document-type.service.ts` | 649 | 6.705 |
| `apps/web/hrm/src/components/employee/EmployeeDocumentChecklist.tsx` | 348 | 4.138 |
| `apps/web/hrm/src/hooks/useEmployeeDocumentChecklist.ts` | 223 | 2.465 |
| `apps/web/hrm/src/lib/empCoreChkRing.ts` | 117 | 1.366 |
| `apps/web/hrm/src/lib/employeeProfileTabGroups.ts` | 120 | 1.229 |
| `apps/api/hrm-api/src/employees/dto/emp-document-checklist.dto.ts` | 103 | 779 |
| `apps/api/hrm-api/src/employees/emp-document-type.constants.ts` | 44 | 569 |
| `apps/api/hrm-api/src/employees/emp-document-checklist.constants.ts` | 34 | 429 |

### `UC-HRM-MOB-12` — Xem và cập nhật hồ sơ cá nhân

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *11 file · ~25.083 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/profile/ProfileScreen.tsx` | 734 | 7.896 |
| `apps/mobile/hrm-mobile/src/utils/dynamicProfileForm.ts` | 286 | 3.176 |
| `apps/api/hrm-api/src/employees/employee-update-policy.ts` | 214 | 2.363 |
| `apps/mobile/hrm-mobile/src/integrations/hrmEmployees.ts` | 210 | 2.095 |
| `apps/mobile/hrm-mobile/src/utils/profileTabs.ts` | 197 | 2.051 |
| `apps/mobile/hrm-mobile/src/components/ui/AvatarUploadField.tsx` | 200 | 1.800 |
| `apps/mobile/hrm-mobile/src/components/profile/DynamicProfileForm.tsx` | 167 | 1.737 |
| `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeFieldsCatalog.ts` | 122 | 1.397 |
| `apps/mobile/hrm-mobile/src/utils/profileEssFields.ts` | 127 | 1.241 |
| `apps/mobile/hrm-mobile/src/components/ui/SegmentedTabBar.tsx` | 92 | 831 |
| `apps/mobile/hrm-mobile/src/utils/profileDisplaySanitize.ts` | 44 | 496 |

### `UC-HRM-INT-01` — Tuyển dụng → tuyển dụng thành công

*Khối:* Tích hợp nội bộ · *Nguồn tên:* SRS team / matrix · *8 file · ~24.344 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx` | 930 | 10.479 |
| `apps/web/hrm/src/hooks/useEmployee.ts` | 267 | 2.810 |
| `apps/api/hrm-api/src/recruitment/hire-employee-link.ts` | 230 | 2.356 |
| `apps/web/hrm/src/hooks/useKanbanCandidates.ts` | 235 | 2.280 |
| `apps/api/hrm-api/src/recruitment/be-hrm-g-db-01-hire-link-01.spec.ts` | 221 | 2.123 |
| `apps/web/hrm/src/components/recruitment/HireEmployeeLinkDialog.tsx` | 158 | 1.758 |
| `apps/web/hrm/src/lib/employeePickerLabel.ts` | 132 | 1.480 |
| `apps/web/hrm/src/lib/recruitmentHireLink.ts` | 87 | 1.058 |

### `FR-UC-BP-CORE-03` — Checklist giấy tờ động (bắt buộc / tùy chọn)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *7 file · ~23.824 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/employees/emp-document-checklist.service.ts` | 872 | 8.152 |
| `apps/api/hrm-api/src/employees/emp-document-type.service.ts` | 649 | 6.705 |
| `apps/web/hrm/src/components/employee/EmployeeDocumentChecklist.tsx` | 348 | 4.138 |
| `apps/web/hrm/src/hooks/useEmployeeDocumentChecklist.ts` | 223 | 2.465 |
| `apps/web/hrm/src/lib/empCoreChkRing.ts` | 117 | 1.366 |
| `apps/api/hrm-api/src/employees/emp-document-type.constants.ts` | 44 | 569 |
| `apps/api/hrm-api/src/employees/emp-document-checklist.constants.ts` | 34 | 429 |

### `UC-BP-ATT-08` — Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *6 file · ~23.315 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts` | 595 | 6.345 |
| `apps/web/hrm/src/hooks/useLeaveRequests.ts` | 516 | 6.079 |
| `apps/web/hrm/src/lib/attLeaveRing.ts` | 428 | 4.667 |
| `apps/web/hrm/src/components/attendance/AttLeavePreviewDeductionPanel.tsx` | 343 | 3.757 |
| `apps/api/hrm-api/src/attendance/leave-deduction-engine.ts` | 174 | 1.639 |
| `apps/api/hrm-api/src/attendance/dto/preview-leave-deduction.dto.ts` | 143 | 828 |

### `UC-BP-CORE-05` — Cấp phát tài sản & biên bản bàn giao

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *4 file · ~22.130 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeAssets.tsx` | 779 | 9.698 |
| `apps/api/hrm-api/src/employees/po-hrm-mvp-gd1-core-05-cluster-be-01.spec.ts` | 480 | 4.960 |
| `apps/web/hrm/src/hooks/useEmployeeAssets.ts` | 400 | 4.379 |
| `apps/web/hrm/src/lib/empCoreAstRing.ts` | 270 | 3.093 |

### `UC-HRM-CI-01` — Hợp đồng lao động — slice CI (alias → UC-BP-PLT-*)

*Khối:* Hợp đồng & BH (CI) · *Nguồn tên:* alias dev · *3 file · ~21.932 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeContracts.tsx` | 1446 | 17.753 |
| `apps/web/hrm/src/hooks/useEmployeeContracts.ts` | 284 | 2.688 |
| `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts` | 214 | 1.491 |

### `UC-BP-REC-05` — Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *9 file · ~21.706 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/rec-pipeline-stage.service.ts` | 754 | 7.673 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-05-cluster-be-01.spec.ts` | 474 | 5.063 |
| `apps/web/hrm/src/components/recruitment/CandidateStageTransitionDialog.tsx` | 288 | 2.872 |
| `apps/web/hrm/src/components/recruitment/CandidateStageHistoryPanel.tsx` | 161 | 1.820 |
| `apps/web/hrm/src/lib/recCandidateStageTransition.ts` | 142 | 1.671 |
| `apps/api/hrm-api/src/recruitment/rec-pipeline-stage.constants.ts` | 78 | 1.021 |
| `apps/web/hrm/src/lib/recCandidateStageTransition.test.ts` | 57 | 657 |
| `apps/api/hrm-api/src/recruitment/dto/candidate-stage-transition.dto.ts` | 68 | 545 |
| `apps/web/hrm/src/lib/apiError.recruitment-stage.test.ts` | 38 | 384 |

### `UC-BP-PAY-01` — Ranh giới: lương chỉ đọc bảng công đã chốt

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *5 file · ~21.432 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/apiError.ts` | 510 | 10.569 |
| `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` | 866 | 8.857 |
| `apps/web/hrm/src/lib/payPay01BindRing.ts` | 73 | 784 |
| `apps/api/hrm-api/src/payroll/pay-att-hour-boundary.ts` | 50 | 615 |
| `apps/api/hrm-api/src/payroll/pay-period-bind-resolver.ts` | 62 | 607 |

### `UC-HRM-10` — Vòng đời đơn nghỉ phép + thông báo

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *3 file · ~21.328 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-requests.service.ts` | 1756 | 18.755 |
| `apps/web/hrm/src/lib/hrmMetadataCompany.ts` | 141 | 1.741 |
| `apps/api/hrm-api/src/attendance/dto/create-leave-request.dto.ts` | 92 | 832 |

### `UC-BP-ATT-06` — Phép bù OT khi công ty bật chế độ

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *6 file · ~21.148 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/attendance-requests.service.ts` | 769 | 8.107 |
| `apps/api/hrm-api/src/attendance/att-ot-comp-leave-policy.service.ts` | 693 | 7.335 |
| `apps/web/hrm/src/components/settings/AttOtCompLeavePolicySettingsPanel.tsx` | 203 | 2.267 |
| `apps/web/hrm/src/lib/attLeave06Ring.ts` | 161 | 2.081 |
| `apps/web/hrm/src/lib/att06CatalogEnsure.ts` | 84 | 898 |
| `apps/api/hrm-api/src/attendance/att-ot-comp-leave-policy.constants.ts` | 31 | 460 |

### `UC-BP-ATT-02` — Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *5 file · ~20.384 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/AttLatePenaltyModePanel.tsx` | 551 | 6.535 |
| `apps/web/hrm/src/lib/attRuleRing.ts` | 436 | 4.830 |
| `apps/web/hrm/src/hooks/useAttendanceRules.ts` | 418 | 4.497 |
| `apps/api/hrm-api/src/attendance/late-penalty.util.ts` | 325 | 3.184 |
| `apps/api/hrm-api/src/attendance/late-penalty.util.spec.ts` | 146 | 1.338 |

### `UC-BP-ATT-03b` — Lịch lễ / Tết (dương + âm cấu hình năm)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *3 file · ~19.706 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/AttHolidayCalendarPanel.tsx` | 628 | 7.525 |
| `apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts` | 595 | 6.345 |
| `apps/web/hrm/src/lib/attHoliday03bRing.ts` | 542 | 5.836 |

### `UC-BP-REC-06a` — Xếp / hủy / đổi lịch PV — tối đa một lịch đang hiệu lực / ứng viên × pháp nhân; badge danh sách

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *6 file · ~19.258 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx` | 624 | 6.980 |
| `apps/web/hrm/src/components/recruitment/ManageActiveInterviewDialog.tsx` | 480 | 5.394 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-06a-cluster-be-01.spec.ts` | 347 | 3.593 |
| `apps/web/hrm/src/components/recruitment/candidateActiveInterview.ts` | 138 | 1.623 |
| `apps/api/hrm-api/src/recruitment/pool-spine-bridge.ts` | 148 | 1.347 |
| `apps/api/hrm-api/src/recruitment/dto/reschedule-interview.dto.ts` | 28 | 321 |

### `UC-HRM-EMP-01` — Hồ sơ nhân viên — slice embed (alias → UC-BP-CORE-*)

*Khối:* Hồ sơ nhân viên (EMP) · *Nguồn tên:* alias dev · *1 file · ~19.219 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` | 1508 | 19.219 |

### `UC-XBOS-13` — Định nghĩa quy trình (workflow)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *5 file · ~18.460 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.spec.ts` | 747 | 8.355 |
| `apps/web/web-portal/src/integrations/workflowMapper.ts` | 329 | 3.315 |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.controller.spec.ts` | 287 | 2.945 |
| `apps/web/web-portal/src/pages/command-center/WorkflowStepResolverFields.tsx` | 266 | 2.827 |
| `apps/web/web-portal/src/data/workflow-resolver.ts` | 94 | 1.018 |

### `UC-HRM-26` — Embed — Hàng chờ duyệt metadata

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *6 file · ~18.366 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | 747 | 8.144 |
| `apps/web/hrm/src/components/settings/MetadataQueueTab.tsx` | 273 | 2.951 |
| `apps/api/hrm-api/src/employee-metadata/employee-metadata.service.ts` | 182 | 2.305 |
| `apps/web/web-portal/src/modules/hrm/hrmWorkspaceEmbedApi.ts` | 217 | 2.221 |
| `apps/web/hrm/src/hooks/useMetadataQueue.ts` | 187 | 1.871 |
| `apps/web/hrm/src/lib/metadataWorkflowLabel.ts` | 74 | 874 |

### `UC-HRM-MOB-06b` — Touch-friendly UI to pick ≤3 medical docs (image/PDF), upload each (từ @CODE-MEMORY Purpose)

*Khối:* Mobile HRM · *Nguồn tên:* CODE-MEMORY Purpose · *6 file · ~17.968 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx` | 650 | 7.598 |
| `apps/mobile/hrm-mobile/src/features/attendance/LeaveRequestDetailScreen.tsx` | 495 | 3.216 |
| `apps/mobile/hrm-mobile/src/integrations/hrmFileUpload.ts` | 271 | 2.344 |
| `apps/mobile/hrm-mobile/src/components/ui/LeaveAttachmentPicker.tsx` | 201 | 1.971 |
| `apps/mobile/hrm-mobile/src/utils/leaveAttachment.ts` | 159 | 1.886 |
| `apps/mobile/hrm-mobile/src/utils/leaveAttachmentPicker.ts` | 110 | 953 |

### `FR-UC-BP-REC-06` — Gửi thư tuyển + đánh giá PV trong pipeline ứng viên

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* catalog · *8 file · ~17.907 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidateComparisonDialog.tsx` | 732 | 9.929 |
| `apps/api/hrm-api/src/recruitment/uv-yctd-bind.ts` | 304 | 2.939 |
| `apps/web/hrm/src/lib/candidateCompareUi.ts` | 151 | 1.681 |
| `apps/api/hrm-api/src/recruitment/pool-spine-bridge.ts` | 148 | 1.347 |
| `apps/api/hrm-api/src/recruitment/dto/compare-candidates.query.dto.ts` | 64 | 601 |
| `apps/api/hrm-api/src/recruitment/dto/list-job-requisitions.query.dto.ts` | 70 | 572 |
| `apps/api/hrm-api/src/recruitment/dto/list-applications.query.dto.ts` | 58 | 517 |
| `apps/api/hrm-api/src/recruitment/dto/reschedule-interview.dto.ts` | 28 | 321 |

### `FR-UC-BP-CORE-05` — Cấp phát tài sản & biên bản bàn giao

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *3 file · ~17.170 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeAssets.tsx` | 779 | 9.698 |
| `apps/web/hrm/src/hooks/useEmployeeAssets.ts` | 400 | 4.379 |
| `apps/web/hrm/src/lib/empCoreAstRing.ts` | 270 | 3.093 |

### `UC-BP-CORE-01` — Hồ sơ vòng công khai (hành chính / phúc lợi)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *6 file · ~16.671 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeFamilyInfo.tsx` | 655 | 7.510 |
| `apps/api/hrm-api/src/employees/employee-dependents.service.ts` | 448 | 4.523 |
| `apps/api/hrm-api/src/employees/employee-public-ring.ts` | 197 | 1.866 |
| `apps/web/hrm/src/lib/empCorePublicRing.ts` | 115 | 1.380 |
| `apps/web/hrm/src/lib/empCorePublicRing.test.ts` | 67 | 712 |
| `apps/api/hrm-api/src/employees/dto/employee-dependent.dto.ts` | 102 | 680 |

### `FR-UC-BP-ATT-08` — Tính ngày trừ phép xuyên cuối tuần và lễ (0,5 ngày / 1 giờ)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *4 file · ~16.408 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-holiday-calendar.service.ts` | 595 | 6.345 |
| `apps/web/hrm/src/lib/attLeaveRing.ts` | 428 | 4.667 |
| `apps/web/hrm/src/components/attendance/AttLeavePreviewDeductionPanel.tsx` | 343 | 3.757 |
| `apps/api/hrm-api/src/attendance/leave-deduction-engine.ts` | 174 | 1.639 |

### `UC-BP-REC-06b` — Gửi thư tuyển + đánh giá PV trong pipeline ứng viên

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *6 file · ~16.239 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidateComparisonDialog.tsx` | 732 | 9.929 |
| `apps/api/hrm-api/src/recruitment/uv-yctd-bind.ts` | 304 | 2.939 |
| `apps/web/hrm/src/lib/candidateCompareUi.ts` | 151 | 1.681 |
| `apps/api/hrm-api/src/recruitment/dto/compare-candidates.query.dto.ts` | 64 | 601 |
| `apps/api/hrm-api/src/recruitment/dto/list-job-requisitions.query.dto.ts` | 70 | 572 |
| `apps/api/hrm-api/src/recruitment/dto/list-applications.query.dto.ts` | 58 | 517 |

### `UC-HRM-ORG-COMPANY` — Phạm vi công ty / org (alias scope — UC-BP-CORE-*)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* alias dev · *2 file · ~16.068 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/company/CompanyManagement.tsx` | 981 | 11.185 |
| `apps/web/hrm/src/integrations/tenantScopeApi.ts` | 473 | 4.883 |

### `FR-UC-BP-ATT-02` — Phạt muộn / về sớm (phút / block / bậc + nguồn hợp lệ)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *4 file · ~15.887 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/AttLatePenaltyModePanel.tsx` | 551 | 6.535 |
| `apps/web/hrm/src/lib/attRuleRing.ts` | 436 | 4.830 |
| `apps/api/hrm-api/src/attendance/late-penalty.util.ts` | 325 | 3.184 |
| `apps/api/hrm-api/src/attendance/late-penalty.util.spec.ts` | 146 | 1.338 |

### `UC-HRM-REC-WF-02` — Workflow tuyển dụng — bước 2 (alias lane REC)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* alias dev · *5 file · ~15.623 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.spec.ts` | 641 | 6.955 |
| `apps/api/xbos-api/src/workflow-engine/workflow-apply-scope.ts` | 278 | 3.216 |
| `apps/api/xbos-api/dist-test/workflow-engine/workflow-apply-scope.js` | 231 | 3.015 |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | 138 | 1.694 |
| `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx` | 63 | 743 |

### `FR-UC-BP-REC-05` — Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* catalog · *4 file · ~15.590 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/rec-pipeline-stage.service.ts` | 754 | 7.673 |
| `apps/web/hrm/src/lib/candidateUvYctdUi.ts` | 398 | 4.406 |
| `apps/api/hrm-api/src/recruitment/uv-yctd-bind.ts` | 304 | 2.939 |
| `apps/api/hrm-api/src/recruitment/dto/list-job-requisitions.query.dto.ts` | 70 | 572 |

### `UC-HRM-ATT-OT` — Tăng ca / OT embed (alias → UC-BP-ATT-*)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* alias dev · *3 file · ~15.515 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` | 859 | 11.818 |
| `apps/web/hrm/src/hooks/useAttOtTypesEffective.ts` | 166 | 1.999 |
| `apps/web/hrm/src/hooks/useAttOtCompTypesEffective.ts` | 135 | 1.698 |

### `UC-BP-CORE-07` — Kích hoạt hồ sơ Hoạt động khi checklist đủ

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *6 file · ~15.235 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-activate-enroll.service.ts` | 613 | 5.928 |
| `apps/web/hrm/src/lib/empCoreActRing.ts` | 287 | 3.037 |
| `apps/web/hrm/src/components/employee/EmployeeActivatePanel.tsx` | 241 | 2.716 |
| `apps/web/hrm/src/hooks/useEmployeeActivate.ts` | 236 | 2.674 |
| `apps/api/hrm-api/src/employees/dto/activate-employee.dto.ts` | 44 | 461 |
| `apps/api/hrm-api/src/employees/emp-activate.constants.ts` | 30 | 419 |

### `FR-UC-BP-CORE-07` — Kích hoạt hồ sơ Hoạt động khi checklist đủ

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *6 file · ~15.235 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-activate-enroll.service.ts` | 613 | 5.928 |
| `apps/web/hrm/src/lib/empCoreActRing.ts` | 287 | 3.037 |
| `apps/web/hrm/src/components/employee/EmployeeActivatePanel.tsx` | 241 | 2.716 |
| `apps/web/hrm/src/hooks/useEmployeeActivate.ts` | 236 | 2.674 |
| `apps/api/hrm-api/src/employees/dto/activate-employee.dto.ts` | 44 | 461 |
| `apps/api/hrm-api/src/employees/emp-activate.constants.ts` | 30 | 419 |

### `UC-HRM-03` — Tạo hoặc cập nhật quản trị doanh nghiệp

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *4 file · ~15.203 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/company/CompanyManagement.tsx` | 981 | 11.185 |
| `apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts` | 262 | 2.704 |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.spec.ts` | 63 | 681 |
| `apps/api/hrm-api/src/hrm-admin/dto/create-company-admin.dto.ts` | 53 | 633 |

### `UC-BP-CORE-09b` — Chọn gói nghề và xem trước HĐLĐ — ADD

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *2 file · ~15.074 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/contracts/ContractPrintSpinePanel.tsx` | 1138 | 13.239 |
| `apps/web/hrm/src/lib/contractPackPreviewUx.ts` | 168 | 1.835 |

### `UC-HRM-31` — App — Kỳ lương

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *2 file · ~14.878 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/payroll-catalog.service.ts` | 1229 | 14.053 |
| `apps/web/hrm/src/components/payroll/payrollPeriodFormSchema.ts` | 76 | 825 |

### `UC-BP-CORE-01a` — Hồ sơ vòng công khai (hành chính / phúc lợi)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* CODE-MEMORY Purpose · *4 file · ~14.792 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/decisions/hr-decision-type.service.ts` | 897 | 9.087 |
| `apps/api/hrm-api/src/decisions/po-hrm-e2e-link-emp-be-03.spec.ts` | 278 | 2.859 |
| `apps/web/hrm/src/lib/decisionPersonBound.ts` | 174 | 1.834 |
| `apps/web/hrm/src/lib/employeeWorkTimelineUi.ts` | 85 | 1.012 |

### `UC-HRM-MOB-01` — Đăng nhập và thiết lập phiên an toàn

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *4 file · ~14.305 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/context/AuthContext.tsx` | 1003 | 6.742 |
| `apps/mobile/hrm-mobile/src/features/auth/LoginScreen.tsx` | 515 | 5.857 |
| `apps/mobile/hrm-mobile/src/features/auth/LoginCredentialField.tsx` | 138 | 1.253 |
| `apps/mobile/hrm-mobile/src/config/pilotApiBase.ts` | 32 | 453 |

### `UC-BP-ATT-10` — Tổng hợp bảng công (phễu giờ công tính lương)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *8 file · ~14.262 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts` | 505 | 4.548 |
| `apps/web/hrm/src/lib/attSheet10Ring.ts` | 303 | 3.505 |
| `apps/web/hrm/src/lib/attSheet10Ring.test.ts` | 164 | 1.647 |
| `apps/api/hrm-api/src/attendance/attendance-sheet-schema.bootstrap.ts` | 109 | 1.332 |
| `apps/mobile/hrm-mobile/src/components/attendance/CheckInMethodSelector.tsx` | 134 | 1.180 |
| `apps/web/hrm/src/lib/attSheetAggUi.ts` | 70 | 830 |
| `apps/web/hrm/src/lib/attendanceLeaveDisplay.ts` | 54 | 646 |
| `apps/mobile/hrm-mobile/src/utils/checkInChannel.ts` | 56 | 574 |

### `UC-HRM-MOB-16` — Avatar + name + job + dept + attendance badge; press → detail (≥44px). (từ @CODE-MEMORY Purpose)

*Khối:* Mobile HRM · *Nguồn tên:* CODE-MEMORY Purpose · *6 file · ~13.335 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/team/TeamDirectoryScreen.tsx` | 408 | 4.094 |
| `apps/mobile/hrm-mobile/src/utils/teamDirectory.ts` | 266 | 2.752 |
| `apps/mobile/hrm-mobile/src/integrations/hrmTeamDirectory.ts` | 215 | 2.141 |
| `apps/mobile/hrm-mobile/src/features/team/TeamColleagueDetailScreen.tsx` | 174 | 1.871 |
| `apps/mobile/hrm-mobile/src/components/team/TeamDirectoryRow.tsx` | 168 | 1.419 |
| `apps/mobile/hrm-mobile/src/integrations/hrmEmployeeDirectory.ts` | 109 | 1.058 |

### `UC-BP-ATT-07` — Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *4 file · ~13.253 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-sick-leave-fund-order.service.ts` | 659 | 6.703 |
| `apps/web/hrm/src/components/settings/AttSickLeaveFundOrderSettingsPanel.tsx` | 356 | 3.877 |
| `apps/web/hrm/src/lib/attLeave07Ring.ts` | 208 | 2.335 |
| `apps/api/hrm-api/src/attendance/att-sick-leave-fund-order.constants.ts` | 39 | 338 |

### `FR-UC-BP-ATT-07` — Nghỉ ốm — chế độ BH + hỗ trợ CTY (nếu có)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *4 file · ~13.253 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-sick-leave-fund-order.service.ts` | 659 | 6.703 |
| `apps/web/hrm/src/components/settings/AttSickLeaveFundOrderSettingsPanel.tsx` | 356 | 3.877 |
| `apps/web/hrm/src/lib/attLeave07Ring.ts` | 208 | 2.335 |
| `apps/api/hrm-api/src/attendance/att-sick-leave-fund-order.constants.ts` | 39 | 338 |

### `UC-HRM-MOB-06c` — Read-only leave balance chip â€” remaining/entitled + year; (từ @CODE-MEMORY Purpose)

*Khối:* Mobile HRM · *Nguồn tên:* CODE-MEMORY Purpose · *5 file · ~13.245 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx` | 650 | 7.598 |
| `apps/mobile/hrm-mobile/src/integrations/hrmLeaveBalance.ts` | 229 | 2.418 |
| `apps/mobile/hrm-mobile/src/components/ui/LeaveBalanceChip.tsx` | 118 | 1.183 |
| `apps/mobile/hrm-mobile/src/components/ui/LeaveBalanceHeader.tsx` | 114 | 1.128 |
| `apps/mobile/hrm-mobile/src/components/ui/__tests__/leaveBalanceChip.test.ts` | 74 | 918 |

### `UC-HRM-INT-02` — Nhân viên → Hợp đồng

*Khối:* Tích hợp nội bộ · *Nguồn tên:* SRS team / matrix · *1 file · ~13.085 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/employee-compensation.service.ts` | 1249 | 13.085 |

### `UC-BP-REC-00g` — Thư viện mô tả công việc (JD master) — MVP

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *4 file · ~12.563 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx` | 672 | 7.802 |
| `apps/web/hrm/src/lib/jdDynamicSnapshot.ts` | 270 | 2.367 |
| `apps/web/hrm/src/lib/jdPackClientNormalize.ts` | 164 | 1.729 |
| `apps/web/hrm/src/lib/jdDndSameNodeProps.ts` | 52 | 665 |

### `FR-UC-H03` — Đơn nghỉ phép — phê duyệt hai cấp (FR HRM leave ladder)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* alias dev · *6 file · ~12.319 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-balance.service.ts` | 637 | 6.438 |
| `apps/web/hrm/src/components/employee/EmployeeManagerPicker.tsx` | 222 | 2.312 |
| `apps/web/hrm/src/lib/leaveAttachment.ts` | 142 | 1.567 |
| `apps/api/hrm-api/src/employees/employee-manager.validation.ts` | 144 | 1.271 |
| `apps/api/hrm-api/src/attendance/dto/create-attendance-sheet.dto.ts` | 64 | 452 |
| `apps/api/hrm-api/src/attendance/dto/update-attendance-sheet.dto.ts` | 24 | 279 |

### `FR-UC-H04` — Phiếu lương / kỳ lương NV (FR HRM payroll read)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* alias dev · *4 file · ~12.314 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.bridge.ts` | 975 | 10.569 |
| `apps/api/hrm-api/src/recruitment/dto/create-job-template.dto.ts` | 113 | 687 |
| `apps/api/hrm-api/src/recruitment/dto/update-job-template.dto.ts` | 111 | 627 |
| `apps/api/hrm-api/src/recruitment/resolve-submitter-user-id.ts` | 42 | 431 |

### `FR-UC-BP-ATT-06` — Phép bù OT khi công ty bật chế độ

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *4 file · ~12.143 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-ot-comp-leave-policy.service.ts` | 693 | 7.335 |
| `apps/web/hrm/src/components/settings/AttOtCompLeavePolicySettingsPanel.tsx` | 203 | 2.267 |
| `apps/web/hrm/src/lib/attLeave06Ring.ts` | 161 | 2.081 |
| `apps/api/hrm-api/src/attendance/att-ot-comp-leave-policy.constants.ts` | 31 | 460 |

### `UC-HRM-ATT-SHIFT-CHANGE` — Đổi ca embed (alias → UC-BP-ATT-*)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* alias dev · *3 file · ~12.080 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx` | 651 | 9.634 |
| `apps/web/hrm/src/lib/workShiftCatalog.ts` | 108 | 1.475 |
| `apps/web/hrm/src/hooks/useWorkShiftsEffective.ts` | 80 | 971 |

### `UC-BP-ATT-05b` — Panel quỹ phép khi nộp đơn — ADD MVP

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *5 file · ~12.052 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-balance.service.ts` | 637 | 6.438 |
| `apps/web/hrm/src/lib/leaveBalance.ts` | 219 | 2.530 |
| `apps/web/hrm/src/lib/attLeave05bRing.ts` | 98 | 1.473 |
| `apps/web/hrm/src/hooks/useLeaveBalancesByType.ts` | 142 | 1.452 |
| `apps/api/hrm-api/src/attendance/dto/get-leave-balance-panel.query.dto.ts` | 23 | 159 |

### `UC-BP-REC-02b` — Yêu cầu tuyển ngoài định biên (có BOD)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *3 file · ~11.929 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.ts` | 578 | 6.104 |
| `apps/api/hrm-api/src/recruitment/yctd-requisition-gates.ts` | 551 | 5.436 |
| `apps/api/hrm-api/src/recruitment/dto/requisition-transition.dto.ts` | 39 | 389 |

### `UC-BP-CORE-02` — Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *5 file · ~11.805 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/po-hrm-mvp-gd1-core-02-cluster-be-01.spec.ts` | 466 | 4.877 |
| `apps/web/hrm/src/hooks/useEmployeeCompensation.ts` | 225 | 2.435 |
| `apps/api/hrm-api/src/contracts-insurance/compensation-cb-authz.ts` | 205 | 2.169 |
| `apps/web/hrm/src/lib/empCoreCbRing.ts` | 104 | 1.240 |
| `apps/api/hrm-api/src/contracts-insurance/dto/create-compensation-package.dto.ts` | 179 | 1.084 |

### `UC-HRM-SCOPE-03` — Resolver scope list↔detail (alias NFR — ADR scope ladder)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* alias dev · *7 file · ~11.510 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useEmployees.ts` | 315 | 3.312 |
| `apps/web/hrm/src/hooks/useEmployeesPage.ts` | 192 | 1.852 |
| `apps/web/hrm/src/hooks/useEmployeePicker.ts` | 176 | 1.630 |
| `apps/web/hrm/src/lib/hrmOperatingUnits.ts` | 126 | 1.411 |
| `apps/api/hrm-api/src/operating-units/operating-units.service.ts` | 99 | 1.227 |
| `apps/web/hrm/src/hooks/useSettingsCatalogsOverview.ts` | 92 | 1.159 |
| `apps/api/hrm-api/src/operating-units/hrm-operating-unit-registry.ts` | 78 | 919 |

### `UC-BP-REC-01` — Quản trị định biên vị trí × 12 tháng (phòng ban trình; HCNS tổng hợp)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *3 file · ~11.000 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useRecruitmentPlans.ts` | 417 | 4.132 |
| `apps/web/hrm/src/lib/recruitmentPlanHeadcount.ts` | 405 | 3.865 |
| `apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.ts` | 272 | 3.003 |

### `UC-BP-REC-01b` — Auto sinh YCTD theo tháng «Cần tuyển»

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *3 file · ~11.000 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useRecruitmentPlans.ts` | 417 | 4.132 |
| `apps/web/hrm/src/lib/recruitmentPlanHeadcount.ts` | 405 | 3.865 |
| `apps/api/hrm-api/src/recruitment/recruitment-plan-headcount.ts` | 272 | 3.003 |

### `UC-HRM-CI-11` — Lịch sử / phiên bản cơ cấu lương gắn HĐ

*Khối:* Hợp đồng & BH (CI) · *Nguồn tên:* alias dev · *2 file · ~10.629 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` | 733 | 8.719 |
| `apps/web/hrm/src/components/employee/EmployeeCompensationHistoryPanel.tsx` | 146 | 1.910 |

### `UC-BP-ATT-09` — Nộp & duyệt phép — hold quỹ khi submit

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *4 file · ~10.534 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/attLeave09Ring.ts` | 393 | 4.472 |
| `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.ts` | 355 | 3.859 |
| `apps/web/hrm/src/components/attendance/AttLeaveTrackedEntitlementGrantPanel.tsx` | 178 | 1.982 |
| `apps/api/hrm-api/src/attendance/dto/upsert-tracked-leave-balance.dto.ts` | 34 | 221 |

### `UC-BP-PLT-01` — Nền tảng cấu hình động (danh mục · schema · trường trộn) — ADD

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *3 file · ~10.443 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/settings/MergeTokenSettingsPanel.tsx` | 612 | 6.863 |
| `apps/web/hrm/src/lib/mergeTokenCatalog.ts` | 170 | 1.836 |
| `apps/web/hrm/src/lib/pltTokRing.ts` | 142 | 1.744 |

### `UC-BP-CORE-06` — Thu hồi tài sản khi kích hoạt nghỉ việc

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *4 file · ~10.159 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useEmployeeAssets.ts` | 400 | 4.379 |
| `apps/web/hrm/src/components/employee/EmployeeAssetReturnChecklist.tsx` | 292 | 3.400 |
| `apps/api/hrm-api/src/employees/po-hrm-mvp-gd1-core-06-cluster-be-02.spec.ts` | 163 | 1.911 |
| `apps/api/hrm-api/src/employees/dto/employee-profile-list.query.dto.ts` | 49 | 469 |

### `FR-UC-BP-PAY-01` — Ranh giới: lương chỉ đọc bảng công đã chốt

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *3 file · ~10.079 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-period-input-pack.service.ts` | 866 | 8.857 |
| `apps/api/hrm-api/src/payroll/pay-att-hour-boundary.ts` | 50 | 615 |
| `apps/api/hrm-api/src/payroll/pay-period-bind-resolver.ts` | 62 | 607 |

### `UC-HRM-02` — Tạo quản trị nền tảng

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *4 file · ~9.901 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts` | 593 | 7.056 |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.ts` | 144 | 1.695 |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.spec.ts` | 63 | 681 |
| `apps/api/hrm-api/src/hrm-admin/dto/create-platform-admin.dto.ts` | 41 | 469 |

### `FR-UC-BP-ATT-05` — Phép chuyển kỳ (bảo lưu theo FY tenant)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *3 file · ~9.777 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-balance.service.ts` | 637 | 6.438 |
| `apps/web/hrm/src/lib/attLeave05Ring.ts` | 140 | 1.866 |
| `apps/web/hrm/src/lib/attLeave05bRing.ts` | 98 | 1.473 |

### `UC-XBOS-08` — Thêm / sửa / xóa dữ liệu master theo lĩnh vực

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~9.629 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/business-master/business-master.service.js` | 283 | 3.536 |
| `apps/api/xbos-api/src/business-master/business-master.service.ts` | 326 | 3.380 |
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-BP-ATT-12` — Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *5 file · ~9.624 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-activate-enroll.service.ts` | 613 | 5.928 |
| `apps/web/hrm/src/components/employee/EmployeeActivateEnrollConfirmStrip.tsx` | 172 | 2.068 |
| `apps/web/hrm/src/lib/attLeave12Ring.ts` | 85 | 1.036 |
| `apps/web/hrm/src/hooks/useActivateDefaultShift.ts` | 48 | 508 |
| `apps/api/hrm-api/src/attendance/dto/get-activate-default-shift.query.dto.ts` | 12 | 84 |

### `FR-UC-BP-ATT-12` — Mở quỹ phép & ca mặc định khi hồ sơ Hoạt động

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *4 file · ~9.540 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-activate-enroll.service.ts` | 613 | 5.928 |
| `apps/web/hrm/src/components/employee/EmployeeActivateEnrollConfirmStrip.tsx` | 172 | 2.068 |
| `apps/web/hrm/src/lib/attLeave12Ring.ts` | 85 | 1.036 |
| `apps/web/hrm/src/hooks/useActivateDefaultShift.ts` | 48 | 508 |

### `UC-BP-ATT-01` — Thiết lập quy tắc ca theo bộ phận / nhóm

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *4 file · ~9.535 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/attShift01Ring.ts` | 253 | 3.094 |
| `apps/web/hrm/src/hooks/useWorkShifts.ts` | 291 | 3.052 |
| `apps/web/hrm/src/hooks/useShiftChangeRequests.ts` | 190 | 2.285 |
| `apps/web/hrm/src/lib/attShift01Ring.test.ts` | 91 | 1.104 |

### `UC-HRM-REC-WF-01` — Workflow tuyển dụng — bước 1 (alias lane REC)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* alias dev · *5 file · ~9.534 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/integrations/workflowMapper.ts` | 329 | 3.315 |
| `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.ts` | 276 | 2.696 |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | 138 | 1.694 |
| `apps/web/web-portal/src/data/hrm-recruitment-workflow-presets.test.ts` | 88 | 1.086 |
| `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx` | 63 | 743 |

### `FR-UC-BP-ATT-10` — Tổng hợp bảng công (phễu giờ công tính lương)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *4 file · ~9.529 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts` | 505 | 4.548 |
| `apps/web/hrm/src/lib/attSheet10Ring.ts` | 303 | 3.505 |
| `apps/web/hrm/src/lib/attSheetAggUi.ts` | 70 | 830 |
| `apps/web/hrm/src/lib/attendanceLeaveDisplay.ts` | 54 | 646 |

### `UC-HRM-RC-07` — Requisition / RC slice (alias tuyển dụng)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* alias dev · *2 file · ~9.464 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` | 547 | 6.325 |
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | 272 | 3.139 |

### `UC-HRM-07` — Lấy dữ liệu dùng chung theo khóa danh mục

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *2 file · ~9.452 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | 730 | 7.611 |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts` | 207 | 1.841 |

### `UC-HRM-08` — Liệt kê dữ liệu dùng chung theo phân hệ

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *2 file · ~9.452 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | 730 | 7.611 |
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts` | 207 | 1.841 |

### `UC-HRM-MOB-02` — Chọn và xác nhận phạm vi công ty

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *5 file · ~9.421 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/auth/ScopeScreen.tsx` | 304 | 3.388 |
| `apps/mobile/hrm-mobile/src/features/settings/SettingsScreen.tsx` | 219 | 2.415 |
| `apps/mobile/hrm-mobile/src/utils/companyDisplayVi.ts` | 344 | 1.923 |
| `apps/api/hrm-api/src/auth/mobile-auth.controller.spec.ts` | 79 | 884 |
| `apps/mobile/hrm-mobile/src/features/auth/membershipDisplay.ts` | 63 | 811 |

### `UC-HRM-ATT-TRIP` — Công tác embed (alias → UC-BP-ATT-*)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* alias dev · *1 file · ~9.346 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/BusinessTripRequestTab.tsx` | 628 | 9.346 |

### `UC-HRM-MOB-03` — Xem bảng điều khiển cá nhân

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *2 file · ~9.277 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | 663 | 7.780 |
| `apps/api/hrm-api/src/auth/uat-mobile-auth-ensure.ts` | 174 | 1.497 |

### `UC-XBOS-11` — Quản lý mẫu chức danh và gán vị trí (kiêm nhiệm)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~9.056 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/position-rbac/position-rbac.controller.js` | 281 | 4.479 |
| `apps/api/xbos-api/src/position-rbac/position-rbac.controller.ts` | 172 | 2.829 |
| `apps/api/xbos-api/src/position-rbac/position-rbac.controller.spec.ts` | 163 | 1.748 |

### `FR-UC-BP-REC-08` — Báo cáo & bảng điều khiển tuyển dụng («bao giờ đủ người»)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* catalog · *3 file · ~8.979 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/recruitment-dashboard.service.ts` | 644 | 6.153 |
| `apps/web/hrm/src/lib/recruitmentDashboardNestBind.ts` | 179 | 1.795 |
| `apps/api/hrm-api/src/recruitment/recruitment-dashboard.constants.ts` | 71 | 1.031 |

### `UC-HRM-ATT-LATE-EARLY` — Đi muộn / về sớm embed (alias → UC-BP-ATT-*)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* alias dev · *1 file · ~8.477 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/LateEarlyRequestTab.tsx` | 616 | 8.477 |

### `FR-UC-BP-ATT-09` — Nộp & duyệt phép — hold quỹ khi submit

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *2 file · ~8.331 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/attLeave09Ring.ts` | 393 | 4.472 |
| `apps/api/hrm-api/src/attendance/leave-attendance-funnel.service.ts` | 355 | 3.859 |

### `UC-HRM-CO-01` — Embed — Quản lý công ty: headcount ĐVTV (FR-HRM-CO-HC-01) + Ngành nghề (FR-HRM-CO-IND-01)

*Khối:* Công ty / headcount (CO) · *Nguồn tên:* SRS team / matrix · *1 file · ~8.161 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/org-foundation/org-foundation.service.ts` | 715 | 8.161 |

### `UC-BP-REC-05a` — Lịch sử trạng thái ứng viên gắn YCTD (N–N; PV trong pipeline)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *3 file · ~7.917 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/candidateUvYctdUi.ts` | 398 | 4.406 |
| `apps/api/hrm-api/src/recruitment/uv-yctd-bind.ts` | 304 | 2.939 |
| `apps/api/hrm-api/src/recruitment/dto/list-job-requisitions.query.dto.ts` | 70 | 572 |

### `UC-XBOS-AUTH-01` — Đăng nhập cổng Web Portal

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~7.834 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/auth/auth.service.js` | 250 | 3.803 |
| `apps/api/xbos-api/src/auth/auth.service.ts` | 285 | 3.495 |
| `apps/api/xbos-api/src/auth/auth.controller.spec.ts` | 50 | 536 |

### `UC-HRM-SCOPE-04` — Authenticate portal users, issue HS256 service JWT with tenant/company/role claims, (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *3 file · ~7.834 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/auth/auth.service.js` | 250 | 3.803 |
| `apps/api/xbos-api/src/auth/auth.service.ts` | 285 | 3.495 |
| `apps/api/xbos-api/src/auth/auth.controller.spec.ts` | 50 | 536 |

### `UC-HRM-MOB-05` — Xem lịch sử chấm công

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *1 file · ~7.780 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | 663 | 7.780 |

### `FR-UC-BP-CORE-06` — Thu hồi tài sản khi kích hoạt nghỉ việc

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *2 file · ~7.779 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useEmployeeAssets.ts` | 400 | 4.379 |
| `apps/web/hrm/src/components/employee/EmployeeAssetReturnChecklist.tsx` | 292 | 3.400 |

### `UC-HRM-MOB-06` — Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *1 file · ~7.598 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/attendance/CreateLeaveRequestScreen.tsx` | 650 | 7.598 |

### `UC-XBOS-KPI-01` — Tính KPI đơn lẻ trên máy chủ

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~7.562 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/kpi-engine/kpi-engine.controller.js` | 239 | 3.598 |
| `apps/api/xbos-api/src/kpi-engine/kpi-engine.controller.ts` | 208 | 2.646 |
| `apps/api/xbos-api/src/kpi-engine/kpi-engine.service.spec.ts` | 130 | 1.318 |

### `FR-UC-BP-ATT-11` — Ký chốt bảng công trước khi tính lương (workflow XBOS)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *2 file · ~7.479 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/att-timesheet-line-aggregate.ts` | 505 | 4.548 |
| `apps/web/hrm/src/lib/attSheet11Ring.ts` | 253 | 2.931 |

### `UC-BP-PAY-09` — Phân nhóm bảng lương (VP / KD / tài xế / vận hành)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *4 file · ~7.361 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-payroll-group.service.ts` | 547 | 5.708 |
| `apps/web/hrm/src/lib/payPay09GroupRing.ts` | 107 | 1.039 |
| `apps/web/hrm/src/lib/payPay09GroupRing.test.ts` | 43 | 471 |
| `apps/api/hrm-api/src/payroll/pay-payroll-group.constants.ts` | 10 | 143 |

### `UC-HRM-ATT-REPORTS` — Attendance reports KPI + charts + export dialog chrome (từ @CODE-MEMORY Purpose)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~7.205 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/AttendanceReportsTab.tsx` | 580 | 7.205 |

### `UC-BP-PAY-08` — Phiếu lương — preview, bảo mật, trạng thái TT

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *4 file · ~7.067 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/payroll/EssPayslipsPanel.tsx` | 338 | 3.897 |
| `apps/web/hrm/src/hooks/useMyEssPayslips.ts` | 172 | 1.591 |
| `apps/web/hrm/src/lib/essPayslipUi.ts` | 110 | 1.248 |
| `apps/api/hrm-api/src/payroll/pay-payslip.constants.ts` | 42 | 331 |

### `UC-BP-REC-00` — Thư viện mô tả công việc (JD master) — MVP

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* UC_INVENTORY · *3 file · ~7.042 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-00-cluster-be-01.spec.ts` | 519 | 5.559 |
| `apps/web/hrm/src/lib/jobTemplateStatus.ts` | 82 | 951 |
| `apps/web/hrm/src/lib/jobTemplateStatus.test.ts` | 45 | 532 |

### `UC-XBOS-DASH-01` — Cockpit tổng hợp KPI điều hành

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~6.854 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/pages/customers/CustomersPage.tsx` | 268 | 2.837 |
| `apps/web/web-portal/src/pages/organization/OrganizationPage.tsx` | 223 | 2.519 |
| `apps/web/web-portal/src/lib/dashboardPageToolbar.ts` | 156 | 1.498 |

### `FR-UC-XBOS-DASH-01` — Cockpit tổng hợp KPI điều hành

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~6.854 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/pages/customers/CustomersPage.tsx` | 268 | 2.837 |
| `apps/web/web-portal/src/pages/organization/OrganizationPage.tsx` | 223 | 2.519 |
| `apps/web/web-portal/src/lib/dashboardPageToolbar.ts` | 156 | 1.498 |

### `UC-XBOS-WF-01` — Lưu sơ đồ quy trình trên canvas

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *2 file · ~6.834 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/pages/command-center/CommandCenterInboxPage.tsx` | 322 | 3.889 |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.controller.spec.ts` | 287 | 2.945 |

### `FR-UC-BP-PAY-08` — Phiếu lương — preview, bảo mật, trạng thái TT

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *3 file · ~6.736 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/payroll/EssPayslipsPanel.tsx` | 338 | 3.897 |
| `apps/web/hrm/src/hooks/useMyEssPayslips.ts` | 172 | 1.591 |
| `apps/web/hrm/src/lib/essPayslipUi.ts` | 110 | 1.248 |

### `UC-HRM-REC-WF-03` — POST /recruitment/workflow/step/terminal — internal JWT auth only. (từ @CODE-MEMORY Purpose)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *4 file · ~6.516 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/modules/hrm/commandCenterUrl.ts` | 194 | 2.050 |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.controller.ts` | 180 | 1.986 |
| `apps/web/web-portal/src/modules/hrm/inboxDeepLink.ts` | 136 | 1.340 |
| `apps/web/web-portal/src/modules/hrm/inboxDeepLink.test.ts` | 108 | 1.140 |

### `FR-UC-M03` — Đọc số dư phép trước/khi tạo đơn — display-ready; panel 5 loại MVP một request. (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~6.438 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-balance.service.ts` | 637 | 6.438 |

### `UC-BP-CORE-09c` — Lưu phiên bản và in / PDF hợp đồng — ADD

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *4 file · ~6.380 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/contractPrintVersionUx.ts` | 196 | 2.066 |
| `apps/api/hrm-api/src/contracts-insurance/contract-print-pdf.renderer.ts` | 167 | 1.804 |
| `apps/web/hrm/src/lib/contractPrintFieldOverrides.ts` | 138 | 1.464 |
| `apps/web/hrm/src/lib/contractPrintRequest.ts` | 84 | 1.046 |

### `UC-HRM-MOB` — Thanh đầu Home — avatar/identity/search/chat/notify; paddingTop insets.top. (từ @CODE-MEMORY Purpose)

*Khối:* Mobile HRM · *Nguồn tên:* CODE-MEMORY Purpose · *4 file · ~6.179 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/features/attendance/CheckInScreen.tsx` | 282 | 3.069 |
| `apps/mobile/hrm-mobile/src/components/home/HomeTopBar.tsx` | 306 | 1.680 |
| `apps/mobile/hrm-mobile/src/i18n/leaveTypes.ts` | 78 | 789 |
| `apps/mobile/hrm-mobile/src/utils/operationsLabels.ts` | 63 | 641 |

### `UC-BP-PAY-07` — Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *2 file · ~6.083 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-termination.service.ts` | 573 | 5.735 |
| `apps/api/hrm-api/src/payroll/pay-term.constants.ts` | 36 | 348 |

### `UC-HRM-ATT-CLOCK-QR` — QR clock channel — camera scan + confirm check-in/out dialog (từ @CODE-MEMORY Purpose)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~6.012 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/QRCodeScanner.tsx` | 516 | 6.012 |

### `UC-BP-PAY-04` — Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *3 file · ~5.927 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-payslip-split.service.ts` | 533 | 5.129 |
| `apps/web/hrm/src/lib/payPayslipSplitDisplay.ts` | 56 | 679 |
| `apps/api/hrm-api/src/payroll/pay-payslip-split.constants.ts` | 16 | 119 |

### `UC-XBOS-CC-06` — Canvas quy trình

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *2 file · ~5.796 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/integrations/workflowMapper.ts` | 329 | 3.315 |
| `apps/web/web-portal/src/integrations/workflowEngineApi.ts` | 232 | 2.481 |

### `FR-UC-BP-PAY-07` — Lệnh nghỉ việc — cắt BH, tất toán phép, thu hồi, KT/KL kỳ cuối

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *1 file · ~5.735 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-termination.service.ts` | 573 | 5.735 |

### `FR-UC-BP-PAY-09` — Phân nhóm bảng lương (VP / KD / tài xế / vận hành)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *1 file · ~5.708 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-payroll-group.service.ts` | 547 | 5.708 |

### `UC-HRM-30` — App — Tuyển dụng đầy đủ

*Khối:* Embed portal HRM · *Nguồn tên:* SRS team / matrix · *4 file · ~5.479 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useKanbanCandidates.ts` | 235 | 2.280 |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | 138 | 1.694 |
| `apps/web/hrm/src/lib/recruitmentFunnel.ts` | 103 | 979 |
| `apps/web/hrm/src/hooks/useRecruitmentDashboard.ts` | 50 | 526 |

### `UC-HRM-12` — Đọc hộp thư thông báo nghiệp vụ

*Khối:* Khác / chưa phân loại · *Nguồn tên:* SRS team / matrix · *4 file · ~5.460 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/portalAuthBridge.ts` | 243 | 2.648 |
| `apps/web/hrm/src/pages/InboxNotifications.tsx` | 143 | 1.628 |
| `apps/api/hrm-api/src/notifications/notifications.controller.spec.ts` | 81 | 782 |
| `apps/web/hrm/src/lib/hrmInboxNotificationDisplay.ts` | 31 | 402 |

### `UC-HRM-ATT-EXPORT` — Client XLSX export dialog chrome (ACCEPTED_AS_IS export path) (từ @CODE-MEMORY Purpose)

*Khối:* Chấm công (legacy HRM mã) · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~5.011 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/attendance/AttendanceExportDialog.tsx` | 399 | 5.011 |

### `UC-XBOS-06` — Truy vấn nhật ký kiểm toán

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *6 file · ~4.906 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/platform/platform-audit.service.js` | 90 | 1.103 |
| `apps/api/xbos-api/dist-test/platform/platform-audit.controller.js` | 62 | 997 |
| `apps/api/xbos-api/src/platform/platform-audit.service.ts` | 100 | 932 |
| `apps/api/xbos-api/src/platform/platform-audit.controller.spec.ts` | 76 | 777 |
| `apps/api/xbos-api/src/platform/platform-audit.service.spec.ts` | 66 | 617 |
| `apps/api/xbos-api/src/platform/platform-audit.controller.ts` | 38 | 480 |

### `FR-UC-H01` — Flatten nhãn VI (status / phòng ban / chức danh / tên) lên response list/get/patch (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *3 file · ~4.831 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/employee/EmployeeManagerPicker.tsx` | 222 | 2.312 |
| `apps/api/hrm-api/src/employees/employee-manager.validation.ts` | 144 | 1.271 |
| `apps/api/hrm-api/src/employees/employee-display.ts` | 112 | 1.248 |

### `UC-HRM-REC-WF-04` — POST /recruitment/workflow/step/terminal — internal JWT auth only. (từ @CODE-MEMORY Purpose)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *3 file · ~4.792 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useKanbanCandidates.ts` | 235 | 2.280 |
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.controller.ts` | 180 | 1.986 |
| `apps/web/hrm/src/hooks/useRecruitmentDashboard.ts` | 50 | 526 |

### `UC-PLT-SI-INS-01` — Settings CRUD catalog loại BH — tạo mã N+1 → F5 list → retire ẩn picker. (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~4.761 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/settings/SiInsuranceTypeSettingsPanel.tsx` | 442 | 4.761 |

### `UC-XBOS-CC-07` — Hạ tầng — danh mục nền

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~4.752 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` | 273 | 3.101 |
| `apps/web/web-portal/src/integrations/infrastructureApi.ts` | 122 | 1.188 |
| `apps/web/web-portal/src/integrations/infrastructureApi.test.ts` | 35 | 463 |

### `UC-XBOS-SYNC-01` — Bootstrap hệ sinh thái XEVN (danh mục nền)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~4.584 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/config-sync/config-sync.controller.spec.ts` | 470 | 4.584 |

### `UC-XBOS-04` — Liệt kê danh mục theo phân hệ đích

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~4.584 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/config-sync/config-sync.controller.spec.ts` | 470 | 4.584 |

### `UC-XBOS-05` — Phát hành phiên bản hợp đồng dữ liệu

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~4.584 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/config-sync/config-sync.controller.spec.ts` | 470 | 4.584 |

### `UC-XBOS-INF-01` — Xem và sửa cấu hình hạ tầng danh mục nền

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *2 file · ~4.388 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/integrations/infrastructureEntityKeyResolver.ts` | 273 | 3.101 |
| `apps/api/xbos-api/src/infrastructure/infrastructure.controller.spec.ts` | 114 | 1.287 |

### `UC-HRM-WF-01` — Bridge leave spawn + terminal callback; resolveDirectManager reads (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~4.359 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` | 393 | 4.359 |

### `UC-HRM-WF-02` — Bridge leave spawn + terminal callback; resolveDirectManager reads (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~4.359 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/attendance/leave-workflow.bridge.ts` | 393 | 4.359 |

### `UC-BP-REC-00h` — Thư viện mô tả công việc (JD master) — MVP

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *2 file · ~4.250 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/jdDynamicSnapshot.ts` | 270 | 2.367 |
| `apps/web/hrm/src/components/recruitment/JdTemplateViewPanel.tsx` | 170 | 1.883 |

### `UC-XBOS-ORG` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~4.191 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts` | 398 | 4.191 |

### `UC-XBOS-CC-08` — Hệ thống phòng ban mẫu

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~4.191 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts` | 398 | 4.191 |

### `UC-XBOS-ORG-01` — Xem và sửa cây pháp nhân / đơn vị tổ chức

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~4.191 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/org-foundation/org-foundation.controller.spec.ts` | 398 | 4.191 |

### `UC-PLT-SI-INR-01` — Settings CRUD catalog nhà BH — tạo mã N+1 → F5 list → retire ẩn picker. (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~4.105 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/settings/SiInsurerSettingsPanel.tsx` | 395 | 4.105 |

### `UC-BP-ATT-04b` — Ứng phép & thời điểm cấp / không lương bù trừ

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *2 file · ~4.010 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/attLeave04bRing.ts` | 200 | 2.367 |
| `apps/api/hrm-api/src/attendance/dto/att-leave-accrual-policy.dto.ts` | 275 | 1.643 |

### `UC-XBOS-CAT` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~3.441 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.spec.ts` | 334 | 3.441 |

### `FR-UC-BP-CORE-02` — Hồ sơ vòng C&B (lương, BH, thuế, ngân hàng)

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *2 file · ~3.409 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/contracts-insurance/compensation-cb-authz.ts` | 205 | 2.169 |
| `apps/web/hrm/src/lib/empCoreCbRing.ts` | 104 | 1.240 |

### `UC-HRM-RC-08` — CRUD reusable job-description templates; feed requisition create. (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~3.139 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useJobTemplates.ts` | 272 | 3.139 |

### `FR-UC-BP-ATT-01` — Thiết lập quy tắc ca theo bộ phận / nhóm

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* catalog · *1 file · ~3.094 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/attShift01Ring.ts` | 253 | 3.094 |

### `UC-BP-PAY-03` — Giảm trừ gia cảnh từ hồ sơ (đủ quyền)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *3 file · ~3.078 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-gtgc-resolver.ts` | 188 | 1.706 |
| `apps/api/hrm-api/src/payroll/pay-gtgc-statutory-cfg.ts` | 110 | 1.204 |
| `apps/api/hrm-api/src/payroll/pay-gtgc.constants.ts` | 19 | 168 |

### `UC-XBOS-WF` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~2.945 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.controller.spec.ts` | 287 | 2.945 |

### `FR-UC-BP-PAY-03` — Giảm trừ gia cảnh từ hồ sơ (đủ quyền)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *2 file · ~2.910 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-gtgc-resolver.ts` | 188 | 1.706 |
| `apps/api/hrm-api/src/payroll/pay-gtgc-statutory-cfg.ts` | 110 | 1.204 |

### `UC-HRM-AT-03` — Helper thuần + React Query cache cho catalog ký hiệu công hiệu lực. (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~2.907 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useAttAttendanceCodesEffective.ts` | 237 | 2.907 |

### `UC-HRM-EM-01` — Map HrmEmployeeRecord → Employee; dept/position từ job_title_label / custom_fields; (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~2.810 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useEmployee.ts` | 267 | 2.810 |

### `UC-BP-PAY-05` — Trần bảo hiểm trên tổng hợp kỳ (kể cả split)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* UC_INVENTORY · *2 file · ~2.792 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-si-ceiling-resolver.ts` | 261 | 2.574 |
| `apps/api/hrm-api/src/payroll/pay-si-ceiling.constants.ts` | 27 | 218 |

### `UC-XBOS-MD-01` — Quản lý chức danh (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-XBOS-MD-02` — Quản lý nhà cung cấp (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-XBOS-MD-03` — Quản lý loại chi phí (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-XBOS-MD-04` — Quản lý chỉ số KPI (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-XBOS-MD-05` — Quản lý khách hàng (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-XBOS-MD-06` — Quản lý đối tác (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-XBOS-MD-07` — Quản lý loại xe / tài sản (master)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~2.713 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/business-master/business-master.controller.spec.ts` | 259 | 2.713 |

### `UC-BP-CORE-09d` — Chọn mẫu HĐ theo catalog mở (ví dụ khởi tạo loại × khối · không trần 8) — ADD

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* UC_INVENTORY · *2 file · ~2.662 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/contractTemplateCatalog.ts` | 148 | 1.745 |
| `apps/web/hrm/src/lib/contractCreateFieldManifest.ts` | 90 | 917 |

### `UC-HRM-TASK-01` — Create/edit task; employee/department pickers deferred until dialog open. (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~2.620 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/tasks/TaskFormDialog.tsx` | 170 | 2.620 |

### `FR-UC-BP-PAY-05` — Trần bảo hiểm trên tổng hợp kỳ (kể cả split)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *1 file · ~2.574 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/payroll/pay-si-ceiling-resolver.ts` | 261 | 2.574 |

### `UC-XBOS-07` — Tiếp nhận cảnh báo từ phân hệ vệ tinh

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *5 file · ~2.454 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/dist-test/alerts/alerts.controller.js` | 58 | 893 |
| `apps/api/xbos-api/src/alerts/alerts.controller.spec.ts` | 73 | 654 |
| `apps/api/xbos-api/src/alerts/alerts.controller.ts` | 35 | 425 |
| `apps/api/xbos-api/dist-test/alerts/satellite-alerts.constants.js` | 29 | 261 |
| `apps/api/xbos-api/src/alerts/satellite-alerts.constants.ts` | 28 | 221 |

### `UC-HRM-INT-03` — Nhân viên → Phiếu lương

*Khối:* Tích hợp nội bộ · *Nguồn tên:* SRS team / matrix · *1 file · ~2.435 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/hooks/useEmployeeCompensation.ts` | 225 | 2.435 |

### `UC-PLT-EMP-CF-01c` — Consumer-write membership assert for extension codes in custom_fields. (từ @CODE-MEMORY Purpose)

*Khối:* Hồ sơ nhân viên (EMP) · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~2.419 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/employees/emp-custom-field-consumer-assert.ts` | 230 | 2.419 |

### `FR-UC-BP-REC-07` — Chấp nhận offer → tạo hồ sơ nhân sự (không nhập lại)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* catalog · *2 file · ~2.375 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/hireReadinessUi.ts` | 128 | 1.262 |
| `apps/web/hrm/src/components/employee/HireReadinessBanner.tsx` | 108 | 1.113 |

### `UC-HRM-RC-09` — Render 6-column candidate pipeline from API-derived counts (post-WF sync). (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *2 file · ~2.348 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidatePipelineFunnel.tsx` | 118 | 1.369 |
| `apps/web/hrm/src/lib/recruitmentFunnel.ts` | 103 | 979 |

### `UC-HRM-REC-WF-05` — Render 6-column candidate pipeline from API-derived counts (post-WF sync). (từ @CODE-MEMORY Purpose)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *2 file · ~2.348 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/components/recruitment/CandidatePipelineFunnel.tsx` | 118 | 1.369 |
| `apps/web/hrm/src/lib/recruitmentFunnel.ts` | 103 | 979 |

### `FR-UC-BP-REC-02` — Yêu cầu tuyển trong định biên (luồng rút gọn)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* catalog · *1 file · ~2.247 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/yctd-jd-bind.ts` | 226 | 2.247 |

### `UC-HRM-REC-WF-06` — POST /recruitment/workflow/step/terminal — internal JWT auth only. (từ @CODE-MEMORY Purpose)

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~1.986 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/recruitment-workflow.controller.ts` | 180 | 1.986 |

### `UC-XBOS-16` — Yêu cầu tài sản — quy trình xác nhận kế toán (5 …

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *2 file · ~1.876 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/asset-request/asset-request.controller.spec.ts` | 129 | 1.302 |
| `apps/api/xbos-api/src/asset-request/asset-request.service.spec.ts` | 51 | 574 |

### `UC-BP-ATT-05` — Phép chuyển kỳ (bảo lưu theo FY tenant)

*Khối:* Chấm công & phép (ATT) · *Nguồn tên:* UC_INVENTORY · *1 file · ~1.866 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/attLeave05Ring.ts` | 140 | 1.866 |

### `UC-HRM-08A` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~1.841 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/catalog-sync/catalog-sync.controller.spec.ts` | 207 | 1.841 |

### `UC-XBOS-12` — Gán hoặc thu hồi quyền; kiểm tra xung đột quyền

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.748 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/position-rbac/position-rbac.controller.spec.ts` | 163 | 1.748 |

### `FR-UC-BP-PLT-01` — Nền tảng cấu hình động (danh mục · schema · trường trộn) — ADD

*Khối:* Nhân sự / HĐLĐ (CORE) · *Nguồn tên:* catalog · *1 file · ~1.744 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/pltTokRing.ts` | 142 | 1.744 |

### `UC-XBOS-AST` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~1.700 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/assets/assets.controller.spec.ts` | 172 | 1.700 |

### `UC-XBOS-AST-01` — Đăng ký tài sản

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.700 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/assets/assets.controller.spec.ts` | 172 | 1.700 |

### `UC-XBOS-AST-02` — Theo dõi vòng đời tài sản

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.700 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/assets/assets.controller.spec.ts` | 172 | 1.700 |

### `UC-XBOS-KPI-03` — Tổng hợp KPI đa cấp (rollup)

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *3 file · ~1.688 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/kpi-engine/kpi-engine.service.spec.ts` | 130 | 1.318 |
| `apps/api/xbos-api/dist-test/kpi-engine/kpi-scope.constants.js` | 19 | 214 |
| `apps/api/xbos-api/src/kpi-engine/kpi-scope.constants.ts` | 17 | 156 |

### `UC-HRM-04` — Mời nhân viên hàng loạt

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *2 file · ~1.376 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/hrm-admin/dto/invite-employees.dto.ts` | 69 | 695 |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.spec.ts` | 63 | 681 |

### `FR-UC-B04` — Flatten payload XBOS → view model picker-ready (code/label/status_label) (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *1 file · ~1.347 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/catalog-sync/catalog-sync-display.ts` | 134 | 1.347 |

### `UC-XBOS-KPI-02` — Tính KPI theo lô trên máy chủ

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.318 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/kpi-engine/kpi-engine.service.spec.ts` | 130 | 1.318 |

### `UC-HRM-05` — Cập nhật thông tin nhạy cảm tài khoản

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *2 file · ~1.303 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.controller.spec.ts` | 63 | 681 |
| `apps/api/hrm-api/src/hrm-admin/dto/reset-user-password.dto.ts` | 47 | 622 |

### `UC-XBOS-AR` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~1.302 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/asset-request/asset-request.controller.spec.ts` | 129 | 1.302 |

### `UC-XBOS-AR-01` — Danh sách yêu cầu tài sản

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.302 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/asset-request/asset-request.controller.spec.ts` | 129 | 1.302 |

### `UC-XBOS-AR-02` — Tạo yêu cầu tài sản mới

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.302 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/asset-request/asset-request.controller.spec.ts` | 129 | 1.302 |

### `UC-XBOS-AR-03` — Chuyển trạng thái yêu cầu tài sản

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.302 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/asset-request/asset-request.controller.spec.ts` | 129 | 1.302 |

### `UC-XBOS-INF` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~1.287 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/infrastructure/infrastructure.controller.spec.ts` | 114 | 1.287 |

### `UC-XBOS-INF-02` — Quản lý mẫu siêu dữ liệu theo pháp nhân

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.287 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/infrastructure/infrastructure.controller.spec.ts` | 114 | 1.287 |

### `UC-XBOS-INF-02b` — Mã legacy/alias — chưa có trong UC-BP inventory 50 UC; xem docs/hrm/SRS.md hoặc bổ sung UC_ALIAS trong script

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* chưa map · *1 file · ~1.287 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/infrastructure/infrastructure.controller.spec.ts` | 114 | 1.287 |

### `UC-XBOS-TENANT-01` — Liệt kê tenant / công ty người dùng được truy cập

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.283 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/tenant-scope/tenant-scope.controller.spec.ts` | 116 | 1.283 |

### `UC-XBOS-TENANT-02` — Xem tổng quan tổ chức tập đoàn theo quyền

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.283 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/tenant-scope/tenant-scope.controller.spec.ts` | 116 | 1.283 |

### `UC-XBOS-TENANT-03` — Liệt kê đơn vị thành viên trong tập đoàn

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~1.283 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/tenant-scope/tenant-scope.controller.spec.ts` | 116 | 1.283 |

### `FR-UC-HRM-21` — Embed — Danh sách nhân sự

*Khối:* Embed portal HRM · *Nguồn tên:* catalog · *1 file · ~1.248 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/employees/employee-display.ts` | 112 | 1.248 |

### `UC-HRM-SCOPE-05` — Map JWT roleCode → Vietnamese chip text inside HRM embed (parity with portal TopHeader). (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *2 file · ~1.241 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/integrations/scopeRoleLabels.ts` | 50 | 666 |
| `apps/web/hrm/src/lib/scopeRoleLabels.ts` | 43 | 575 |

### `UC-HRM-MOB-14` — Làm việc ngoại tuyến có kiểm soát

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *3 file · ~914 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/context/NetworkContext.tsx` | 45 | 426 |
| `apps/mobile/hrm-mobile/src/components/OfflineBanner.tsx` | 35 | 319 |
| `apps/mobile/hrm-mobile/src/integrations/networkState.ts` | 19 | 169 |

### `UC-XBOS-CC-05` — Thanh điều hành — KPI / tác vụ / cảnh báo

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~819 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/integrations/xbosApiScopeRouteTable.ts` | 55 | 819 |

### `UC-HRM-MOB-04` — Ghi nhận chấm công / điểm danh

*Khối:* Mobile HRM · *Nguồn tên:* SRS team / matrix · *1 file · ~763 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/mobile/hrm-mobile/src/utils/checkInLocation.ts` | 79 | 763 |

### `FR-UC-H05` — DTO cập nhật chu kỳ đánh giá (name/dates/status). (từ @CODE-MEMORY Purpose)

*Khối:* Khác / chưa phân loại · *Nguồn tên:* CODE-MEMORY Purpose · *2 file · ~733 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/performance/dto/update-performance-evaluation.dto.ts` | 62 | 419 |
| `apps/api/hrm-api/src/performance/dto/update-performance-cycle.dto.ts` | 39 | 314 |

### `FR-UC-BP-PAY-04` — Gộp lương khi đổi điều kiện giữa kỳ (không GTCG kép)

*Khối:* Tiền lương (PAY) · *Nguồn tên:* catalog · *1 file · ~679 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/hrm/src/lib/payPayslipSplitDisplay.ts` | 56 | 679 |

### `UC-XBOS-AUTH-02` — Xem thông tin phiên đăng nhập

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~536 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/auth/auth.controller.spec.ts` | 50 | 536 |

### `UC-XBOS-01` — Kiểm tra trạng thái dịch vụ

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~333 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/app.controller.spec.ts` | 33 | 333 |

### `UC-XBOS-MET-01` — Xem chỉ số vận hành dịch vụ API

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* catalog · *1 file · ~333 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/xbos-api/src/app.controller.spec.ts` | 33 | 333 |

### `UC-BP-REC-00b` — Thư viện mô tả công việc (JD master) — MVP

*Khối:* Tuyển dụng (REC) · *Nguồn tên:* chưa map · *1 file · ~249 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/recruitment/dto/put-jd-layout.dto.ts` | 52 | 249 |

### `UC-HRM-01` — Kiểm tra trạng thái dịch vụ

*Khối:* Nền tảng / tích hợp (XBOS·HRM admin) · *Nguồn tên:* SRS team / matrix · *1 file · ~208 token*

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/api/hrm-api/src/app.controller.spec.ts` | 24 | 208 |

---

## File chưa gắn UC rõ (top 60 theo token)

> Cần bổ sung `@CODE-MEMORY` hoặc trace BA — thường là UI shell, test, util chung.

| File | Dòng | Token ~ |
|------|------|---------|
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | 10722 | 144.226 |
| `apps/web/hrm/src/integrations/hrmApi.ts` | 10783 | 109.412 |
| `apps/web/hrm/src/integrations/supabase/types.ts` | 6314 | 58.008 |
| `apps/api/hrm-api/src/recruitment/recruitment-catalog.service.ts` | 3781 | 44.861 |
| `apps/web/web-portal/src/data/mockData.ts` | 2478 | 26.986 |
| `apps/web/hrm/src/pages/PlatformAdmin.tsx` | 1416 | 23.711 |
| `apps/web/hrm/src/pages/Contracts.tsx` | 1833 | 21.370 |
| `apps/web/hrm/src/components/recruitment/HeadcountProposalTab.tsx` | 1487 | 18.720 |
| `apps/api/hrm-api/dist-uat-w6/recruitment/recruitment-catalog.service.js` | 1198 | 17.656 |
| `apps/web/hrm/src/components/recruitment/JobPostingsTab.tsx` | 1392 | 17.253 |
| `apps/api/hrm-api/src/payroll/payroll.service.spec.ts` | 1582 | 16.988 |
| `apps/api/hrm-api/src/attendance/leave-requests.service.spec.ts` | 1599 | 16.858 |
| `apps/api/xbos-api/src/workflow-engine/workflow-engine.service.ts` | 1352 | 15.628 |
| `apps/web/hrm/src/components/payroll/PayrollBatchesTab.tsx` | 1283 | 15.517 |
| `apps/api/hrm-api/dist-uat-w6/recruitment/recruitment.controller.js` | 894 | 15.429 |
| `apps/web/hrm/src/components/recruitment/InterviewsTab.tsx` | 1241 | 15.307 |
| `apps/api/hrm-api/dist-uat-w6/attendance/attendance.controller.js` | 868 | 15.237 |
| `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx` | 2443 | 15.140 |
| `apps/web/hrm/src/components/payroll/SalaryTemplateBuilder.tsx` | 1084 | 15.125 |
| `apps/web/hrm/src/pages/PrivacyPolicy.tsx` | 552 | 14.093 |
| `apps/web/hrm/src/pages/EmployeeProfile.tsx` | 1153 | 13.893 |
| `apps/web/hrm/src/components/employee/EmployeeWorkHistory.tsx` | 1114 | 13.811 |
| `apps/web/hrm/src/components/payroll/SalesDataTab.tsx` | 1151 | 13.589 |
| `apps/web/hrm/src/components/company/CompanyMembersManagement.tsx` | 1241 | 13.580 |
| `apps/api/hrm-api/dist-uat-w6/employees/employees.controller.js` | 750 | 13.532 |
| `apps/web/hrm/src/components/employee/EmployeeJobList.tsx` | 1058 | 13.258 |
| `apps/api/hrm-api/src/settings/allowance-catalog-sync.service.ts` | 1277 | 13.251 |
| `apps/web/hrm/src/components/payroll/BonusPolicyTab.tsx` | 1050 | 13.250 |
| `apps/web/hrm/src/pages/Insurance.tsx` | 1077 | 12.805 |
| `apps/api/xbos-api/dist-test/workflow-engine/workflow-engine.service.js` | 863 | 12.711 |
| `apps/web/hrm/src/components/settings/SettingsDefaultsPanel.tsx` | 1158 | 12.567 |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.spec.ts` | 1258 | 12.334 |
| `apps/web/x-bos-core/src/store/useXbosStore.ts` | 1151 | 12.077 |
| `apps/api/hrm-api/dist-uat-w6/catalog-extensions/catalog-extensions.service.js` | 798 | 11.871 |
| `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx` | 963 | 11.606 |
| `apps/api/hrm-api/dist-uat-w6/payroll/payroll.controller.js` | 673 | 11.506 |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.spec.ts` | 1097 | 11.486 |
| `apps/api/hrm-api/dist-uat-w6/settings-catalogs/settings-catalogs.service.js` | 774 | 11.087 |
| `apps/web/x-bos-core/src/pages/kpi/PolicyManagementPage.tsx` | 896 | 11.013 |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts` | 1145 | 10.980 |
| `apps/api/hrm-api/dist-uat-w6/payroll/payroll.service.js` | 722 | 9.942 |
| `apps/api/hrm-api/src/employees/employees.service.spec.ts` | 1035 | 9.936 |
| `apps/web/web-portal/src/pages/command-center/WorkflowCanvas.tsx` | 1061 | 9.793 |
| `apps/web/web-portal/src/pages/settings/VehicleTypesSettingsPage.tsx` | 842 | 9.625 |
| `apps/api/hrm-api/src/settings/position-compensation-policy.service.ts` | 956 | 9.319 |
| `apps/web/hrm/src/components/employee/EmployeeSalary.tsx` | 739 | 9.302 |
| `apps/web/hrm/src/components/payroll/InsurancePolicyTab.tsx` | 678 | 9.205 |
| `apps/api/hrm-api/dist-uat-w6/employees/employees.service.js` | 657 | 9.197 |
| `apps/web/hrm/src/components/attendance/AttendanceRecordsTable.tsx` | 691 | 9.010 |
| `apps/web/hrm/src/components/settings/EmpEmploymentStatusSettingsPanel.tsx` | 836 | 8.899 |
| `apps/api/hrm-api/src/attendance/attendance.service.spec.ts` | 820 | 8.841 |
| `apps/api/hrm-api/src/attendance/att-attendance-code.service.ts` | 869 | 8.752 |
| `apps/api/hrm-api/src/merge-tokens/merge-tokens.service.ts` | 886 | 8.646 |
| `apps/web/x-bos-core/src/pages/kpi/RewardPenaltyCalcPage.tsx` | 674 | 8.551 |
| `apps/api/hrm-api/src/payroll/pay-formula.service.spec.ts` | 854 | 8.486 |
| `apps/api/hrm-api/dist-uat-w6/recruitment/recruitment-workflow.bridge.js` | 608 | 8.394 |
| `apps/web/hrm/src/components/payroll/TaxPolicyTab.tsx` | 608 | 8.272 |
| `apps/web/hrm/src/components/recruitment/CampaignsTab.tsx` | 680 | 8.222 |
| `apps/api/hrm-api/dist-uat-w6/contracts-insurance/employee-compensation.service.js` | 585 | 8.132 |
| `apps/web/hrm/src/pages/Settings.tsx` | 679 | 8.132 |
| … | +2542 file | |

---

*Sinh bởi `node scripts/program/uc-source-token-inventory.mjs` — chạy lại sau wave lớn.*