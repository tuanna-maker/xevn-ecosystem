# Chương 7 — Tuyển dụng (HRM)

| Thuộc tính | Giá trị |
|------------|---------|
| **Mã tài liệu** | XEVN/HDSD-HRM-007 |
| **Phiên bản** | 1.0 (Markdown — placeholder ảnh) |
| **Ngày hiệu lực** | 30/07/2026 |
| **Đường vào** | Command Center → HRM → **Tuyển dụng** |
| **Route embed** | `…/hrm/recruitment` |
| **Đối tượng** | HRBP, Recruiter, Trưởng phòng tuyển dụng |
| **Tham chiếu SRS** | UC-HRM-22 · HRM-RC-01 · FR-HRM-RC-* |

---

## 1. Giới thiệu

Module **Tuyển dụng** hỗ trợ toàn trình: yêu cầu tuyển → thư viện JD → tin tuyển dụng → ứng viên → phỏng vấn → đánh giá → kế hoạch định biên → chiến dịch → báo cáo.

Thanh tab ngang trên cùng (11 mục chính; 3 mục có menu con). Nội dung thay đổi theo tab đang chọn.

`[Hình 7.0 — Thanh điều hướng Tuyển dụng]`

#### Bảng — Tab điều hướng chính

| Tab | Menu con | Mô tả ngắn |
|-----|----------|-------------|
| **Tổng quan** | — | Dashboard KPI + Kanban pipeline |
| **Yêu cầu tuyển dụng** | — | Danh sách requisition |
| **Thư viện JD** | — | Mẫu mô tả công việc |
| **Tin tuyển dụng** | Tất cả · Đang tuyển · Hết hạn · Nháp | Quản lý job posting |
| **Ứng viên** | Tất cả · Mới · Sàng lọc · Phỏng vấn · Đã tuyển | Pipeline ứng viên |
| **Đề xuất định biên** | — | Headcount proposal |
| **Chiến dịch** | — | Campaign tuyển dụng |
| **Phỏng vấn** | Đã lên lịch · Hoàn thành · Đã hủy | Lịch PV |
| **Đánh giá** | — | Bảng điểm ứng viên |
| **Kế hoạch tuyển dụng** | — | Plan định biên theo tháng |
| **Báo cáo** | — | Thống kê tuyển dụng |

---

## 2. Tab Tổng quan

`[Hình 7.1 — Dashboard tuyển dụng]`

### 2.1. Sub-tab Dashboard / Bảng Kanban

| Sub-tab | Nội dung |
|---------|----------|
| **Dashboard** | Funnel 6 giai đoạn, KPI, biểu đồ, hoạt động gần đây |
| **Bảng Kanban** | Kéo-thả ứng viên giữa các cột giai đoạn |

#### Bảng — Nút & thành phần (Dashboard)

| Thành phần | Chức năng |
|------------|-----------|
| **Tạo tin tuyển dụng** (+) | Shortcut tạo job (cần quyền `create`) |
| **Pipeline ứng viên (6 giai đoạn)** | Funnel: Ứng tuyển → Sàng lọc → PV → Offer → Đã tuyển → Từ chối; bấm cột → chuyển tab Ứng viên |
| Thẻ KPI | Chỉ tiêu · CV ứng tuyển · Đã phỏng vấn · Đã tuyển |
| Thẻ chi phí | Chi phí TB/UV · TopCV · 24h (khi có dữ liệu) |
| Biểu đồ đường | Xu hướng tuyển dụng theo tháng |
| Biểu đồ tròn | Phân bổ theo trạng thái UV |
| **Hoạt động gần đây** | 5 UV mới nhất |
| Biểu đồ cột ngang | Theo phòng ban |

#### Bảng — Cột Kanban

| Cột (stage) | Ý nghĩa |
|-------------|---------|
| Ứng tuyển | UV mới nộp hồ sơ |
| Sàng lọc | Đang lọc CV |
| Phỏng vấn | Đang/ sắp PV |
| Offer | Đề nghị tuyển |
| Đã tuyển | Trúng tuyển (kéo vào cột này mở hộp thoại **Liên kết nhân viên** nếu chưa có NV) |
| Từ chối | Loại UV |

Thẻ Kanban: avatar chữ cái, họ tên, vị trí, nguồn, ngày ứng tuyển, sao đánh giá. Kéo bằng tay cầm (GripVertical).

---

## 3. Tab Yêu cầu tuyển dụng

`[Hình 7.2 — Yêu cầu tuyển dụng]`

Component: **JobRequisitionsTab** — danh sách yêu cầu mở headcount, trạng thái duyệt, liên kết sang Thư viện JD.

| Thao tác thường gặp | Mô tả |
|---------------------|--------|
| Tạo yêu cầu | Nút thêm; điền vị trí, số lượng, phòng ban |
| Mở JD | Chuyển sang tab Thư viện JD |
| Duyệt / từ chối | Theo workflow (nếu bật) |

---

## 4. Tab Thư viện JD

`[Hình 7.3 — Thư viện JD]`

Component: **JobTemplatesTab** — quản lý mẫu mô tả công việc (JD) tái sử dụng khi đăng tin.

| Cột / trường thường có | Mô tả |
|------------------------|--------|
| Tiêu đề JD | Tên mẫu |
| Phòng ban · Vị trí | Phân loại |
| Mô tả · Yêu cầu · Quyền lợi | Nội dung JD |
| Thao tác | Sửa · Xóa · Dùng cho tin tuyển dụng |

---

## 5. Tab Tin tuyển dụng

`[Hình 7.4 — Tin tuyển dụng]`

Menu con: **Tất cả** · **Đang tuyển** · **Hết hạn** · **Nháp**.

Component: **JobPostingsTab**.

#### Bảng — Cột danh sách tin (tham khảo)

| Cột | Mô tả |
|-----|--------|
| Tiêu đề tin | Tên vị trí tuyển |
| Phòng ban | Đơn vị |
| Địa điểm | Nơi làm việc |
| Số lượng | Headcount cần tuyển |
| Hạn nộp | `dd/MM/yyyy` |
| Trạng thái | Nháp / Đang tuyển / Hết hạn |
| Thao tác | Xem · Sửa · Đóng tin |

#### Bảng — Trường form tin tuyển dụng

| Trường | Bắt buộc |
|--------|----------|
| Tiêu đề | Có |
| Phòng ban | Có |
| Địa điểm | Có |
| Loại hình (full-time/part-time…) | Có |
| Số lượng tuyển | Có |
| Lương tối thiểu / tối đa | Không |
| Hạn nộp hồ sơ | Có |
| Mô tả công việc | Có |
| Yêu cầu | Có |
| Quyền lợi | Không |

---

## 6. Tab Ứng viên

`[Hình 7.5 — Danh sách / Kanban ứng viên]`

Menu con: **Tất cả** · **Mới** · **Sàng lọc** · **Phỏng vấn** · **Đã tuyển**.

Component: **CandidatesTab** — bảng + chi tiết UV (**CandidateDetailView**).

| Thao tác | Mô tả |
|----------|--------|
| Thêm ứng viên | Form: họ tên, email, SĐT, vị trí, nguồn |
| Xem chi tiết | Hồ sơ, lịch sử giai đoạn, tài liệu đính kèm |
| Chuyển giai đoạn | Dropdown hoặc kéo Kanban |
| **Liên kết nhân viên** | Khi chuyển «Đã tuyển»: chọn NV có sẵn hoặc tạo mới |

---

## 7. Tab Đề xuất định biên

`[Hình 7.6 — Đề xuất định biên]`

Component: **HeadcountProposalTab** — đề xuất số lượng NS theo phòng/vị trí/kỳ.

| Trường | Mô tả |
|--------|--------|
| Tiêu đề đề xuất | Tên proposal |
| Kỳ áp dụng | Tháng/năm |
| Phòng ban · Vị trí | Dòng định biên |
| Số lượng NS / DX | Theo tháng |
| Trạng thái | Chờ duyệt / Đã duyệt |

---

## 8. Tab Chiến dịch

`[Hình 7.7 — Chiến dịch tuyển dụng]`

Component: **CampaignsTab**.

| Cột | Mô tả |
|-----|--------|
| Tên chiến dịch | Tên campaign |
| Số vị trí · Số UV | Thống kê |
| Thời gian | Từ – đến |
| Chủ trì · Theo dõi | Owner / follower |
| Trạng thái | Đang chạy / Hoàn thành |
| Funnel nội bộ | CV pass · PV · Hired |

---

## 9. Tab Phỏng vấn

`[Hình 7.8 — Lịch phỏng vấn]`

Menu con: **Đã lên lịch** · **Hoàn thành** · **Đã hủy**.

Component: **InterviewsTab**.

| Cột | Mô tả |
|-----|--------|
| Ứng viên | Họ tên |
| Vị trí | Job applied |
| Ngày · Giờ | Lịch PV |
| Người phỏng vấn | Interviewer |
| Hình thức | Online / Trực tiếp |
| Trạng thái | Scheduled / Completed / Cancelled |
| Thao tác | Sửa · Hủy · Ghi nhận kết quả |

---

## 10. Tab Đánh giá

`[Hình 7.9 — Bảng đánh giá ứng viên]`

#### Bảng — Thẻ thống kê

| Thẻ | Ý nghĩa |
|-----|---------|
| Tổng đánh giá | Số phiếu |
| Đạt | Pass |
| Không đạt | Fail |
| Chờ xem xét | Pending + Hold |

#### Bảng — Nút

| Nút | Chức năng |
|-----|-----------|
| **So sánh ứng viên** | Mở **CandidateComparisonDialog** |

#### Bảng — Cột danh sách đánh giá

| Cột | Mô tả |
|-----|--------|
| Ứng viên | Tên + email |
| Vị trí | Position |
| Người đánh giá | Evaluator |
| Điểm | Weighted score /5 |
| Kết quả | Pass / Fail / Hold / Pending |
| Ngày đánh giá | `dd/MM/yyyy` |
| Chi tiết | Nút mắt → **CandidateEvaluationDialog** |

---

## 11. Tab Kế hoạch tuyển dụng

`[Hình 7.10 — Kế hoạch định biên năm]`

### 11.1. Danh sách kế hoạch

| Cột | Mô tả |
|-----|--------|
| Tiêu đề kế hoạch | Tên plan |
| Kỳ | Tháng bắt đầu – kết thúc / năm |
| Người tạo | Creator |
| Ngày tạo | `dd/MM/yyyy` |
| Trạng thái | Nháp · Chờ duyệt · Chờ duyệt QT · Đã duyệt |
| Thao tác | Xem chi tiết |

Thẻ KPI: Tổng kế hoạch · Đã duyệt · Chờ duyệt.

| Nút | Chức năng |
|-----|-----------|
| **Tạo kế hoạch** (+) | Mở form tạo (cần quyền `create`) |

### 11.2. Hộp thoại — Tạo kế hoạch mới

| Trường | Bắt buộc |
|--------|----------|
| Tiêu đề kế hoạch | Có |
| Năm | Có |
| Từ tháng · Đến tháng | Có |
| Ghi chú | Không |

**Bảng định biên:** mỗi phòng ban có thể thêm nhiều vị trí; mỗi ô tháng nhập **NS** (nhân sự) và **DX** (định biên tăng thêm).

| Nút trong bảng | Chức năng |
|----------------|-----------|
| **Thêm phòng ban** | Thêm dòng phòng |
| **Thêm vị trí** | Thêm dòng vị trí con |
| Thùng rác | Xóa phòng/vị trí (giữ ≥1) |
| **Lưu nháp** | Lưu không gửi duyệt |
| **Tạo kế hoạch** | Submit |

### 11.3. Chi tiết kế hoạch

Read-only bảng NS/DX theo tháng. Nút: **Sửa** · **Gửi duyệt QT** · **Từ chối** · **Duyệt kế hoạch** (tùy trạng thái và workflow).

---

## 12. Tab Báo cáo

`[Hình 7.11 — Báo cáo tuyển dụng]`

Component: **RecruitmentReportsTab** — biểu đồ nguồn UV (**CandidateSourceStats**), hiệu suất funnel, chi phí, time-to-hire.

---

## 13. Hộp thoại dùng chung

| Hộp thoại | Khi mở | Trường chính |
|-----------|--------|--------------|
| **CandidateEvaluationDialog** | Đánh giá/chấm điểm UV | Tiêu chí, điểm, nhận xét, kết quả |
| **CandidateComparisonDialog** | So sánh ≥2 UV | Bảng điểm song song |
| **HireEmployeeLinkDialog** | Kéo UV sang «Đã tuyển» | Chọn NV hệ thống để liên kết |

---

## 14. Trạng thái nghiệp vụ

| Đối tượng | Trạng thái | Ý nghĩa |
|-----------|------------|---------|
| Ứng viên | applied → screening → interview → offer → hired / rejected | Pipeline chuẩn |
| Tin tuyển dụng | draft · active · expired | Vòng đời tin |
| Kế hoạch | draft · pending · pending_approval · approved · rejected | Duyệt định biên |
| Phỏng vấn | scheduled · completed · cancelled | Lịch PV |
| Đánh giá | pass · fail · hold · pending | Kết quả PV |

---

## 15. Lỗi thường gặp

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Không kéo được thẻ Kanban | UV đang khóa workflow — chờ duyệt QT hoặc mở **HireEmployeeLinkDialog** |
| Tab trống «đang phát triển» | Chọn đúng menu con (Jobs/Candidates/Interviews) |
| Không tạo được tin | Kiểm tra quyền `recruitment` · `create` |
| Funnel = 0 | Chưa có UV — thêm qua tab **Ứng viên** hoặc import |
| «Gửi duyệt QT» không phản hồi | Kiểm tra workflow tuyển dụng đã cấu hình trên XBOS |

---

## 16. Liên kết kiểm thử

| Tham chiếu | Nội dung |
|------------|----------|
| UC-HRM-22 | Use case tuyển dụng tổng |
| HRM-RC-01 | Yêu cầu tuyển dụng / requisition |
| J-HRM-REC-* | Journey cross-nav (nếu có trong matrix QA) |
