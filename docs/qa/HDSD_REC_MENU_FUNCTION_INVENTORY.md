# Inventory HDSD — Menu × màn × nút × function (Tuyển dụng / Recruitment)

| Thuộc tính | Giá trị |
|------------|---------|
| **work_item_id** | `BA-HDSD-REC-INVENTORY-01` |
| **program** | `P-REC-E2E-13STEP-01` · sponsor **U76** |
| **Ngày** | 01/08/2026 |
| **SoT HDSD (HRM)** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` (XEVN/HDSD-HRM-007) |
| **SoT HDSD (XBOS liên quan)** | `HDSD_XEVN_CH04` §4.1 Inbox · §4.2 Canvas QT · §4.4.1 Áp dụng danh mục (Nguồn ứng viên) — khôi phục từ bản ghi phiên khi thư mục `hdsd/` thiếu trên disk |
| **FE neo** | `apps/web/hrm/src/pages/Recruitment.tsx` · `apps/web/hrm/src/i18n/locales/vi.json` → `recruitment.*` |
| **Kịch bản 13 bước** | `docs/qa/P1_BROWSER_E2E_RECRUITMENT_13STEP_XBOS_HRM.md` (S0–S11) |
| **no_prompt_echo** | true — không dán chat Sponsor vào bản khách |

**Quy ước cột**

| Cột | Ý nghĩa |
|-----|---------|
| `hdsd_ref` | Chương / mục / hình HDSD |
| `maps_to_fe_tab_id` | `id` tab/submenu FE (`Recruitment.tsx`) hoặc route XBOS |
| `maps_to_13step` | S0–S11 hoặc `—` |
| Label | **100% tiếng Việt khớp HDSD** (không thay bằng nhãn FE lệch) |

**Ghi chú label FE:** một số nhãn `vi.json` ngắn hơn / lệch HDSD (vd. tab `dashboard` = «Dashboard»; HDSD = «Tổng quan»). QA **click theo nhãn HDSD** hoặc ghi 🟡 `label_drift` nếu chỉ thấy nhãn FE.

---

## 1. Bảng inventory (cover U76)

| hdsd_ref | chapter | menu | screen_tab | button_or_function | expected_user_action | maps_to_fe_tab_id | maps_to_13step | notes |
|----------|---------|------|------------|--------------------|----------------------|-------------------|----------------|-------|
| CH07 §1 · Hình 7.0 | Ch07 Tuyển dụng | Tuyển dụng | Thanh điều hướng (11 tab) | Mở module | CC → HRM → **Tuyển dụng** (`…/hrm/recruitment`) | `recruitment` route | S1–S11 | Entry chung |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Tổng quan** | Chọn tab | Xem dashboard + Kanban | `dashboard` | S5 · S11 (funnel) | FE i18n: «Dashboard» — drift |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Yêu cầu tuyển dụng** | Chọn tab | Xem danh sách YCTD | `requisitions` | S2 | Hardcoded VI khớp HDSD |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Thư viện JD** | Chọn tab | Xem mẫu JD | `jd-library` | S3 | Hardcoded VI khớp HDSD |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Tin tuyển dụng** | Chọn tab | Mở list tin | `jobs` | S4 | FE: «Tin Tuyển dụng» |
| CH07 §1 Menu con Tin | Ch07 | Tuyển dụng | Tin tuyển dụng → **Tất cả** | Chọn submenu | Lọc mọi tin | `jobs` / `all` | S4 | FE: «Tất cả tin tuyển dụng» |
| CH07 §1 Menu con Tin | Ch07 | Tuyển dụng | Tin tuyển dụng → **Đang tuyển** | Chọn submenu | Lọc tin đang mở | `jobs` / `active` | S4 | FE: «Tin đang tuyển» |
| CH07 §1 Menu con Tin | Ch07 | Tuyển dụng | Tin tuyển dụng → **Hết hạn** | Chọn submenu | Lọc tin hết hạn | `jobs` / `expired` | S4 | FE: «Tin hết hạn» |
| CH07 §1 Menu con Tin | Ch07 | Tuyển dụng | Tin tuyển dụng → **Nháp** | Chọn submenu | Lọc tin nháp | `jobs` / `draft` | S4 | FE: «Tin nháp» |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Ứng viên** | Chọn tab | Mở pipeline UV | `candidates` | S5 · S8 · S9 | |
| CH07 §1 Menu con UV | Ch07 | Tuyển dụng | Ứng viên → **Tất cả** | Chọn submenu | Mọi UV | `candidates` / `all` | S5 | FE: «Tất cả ứng viên» |
| CH07 §1 Menu con UV | Ch07 | Tuyển dụng | Ứng viên → **Mới** | Chọn submenu | UV mới | `candidates` / `new` | S5 | FE: «Ứng viên mới» |
| CH07 §1 Menu con UV | Ch07 | Tuyển dụng | Ứng viên → **Sàng lọc** | Chọn submenu | Đang sàng CV | `candidates` / `screening` | S5 | FE: «Đang sàng lọc» |
| CH07 §1 Menu con UV | Ch07 | Tuyển dụng | Ứng viên → **Phỏng vấn** | Chọn submenu | Đang PV | `candidates` / `interview` | S6 | FE: «Đang phỏng vấn» |
| CH07 §1 Menu con UV | Ch07 | Tuyển dụng | Ứng viên → **Đã tuyển** | Chọn submenu | UV hired | `candidates` / `hired` | S9 | |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Đề xuất định biên** | Chọn tab | Xem proposal HC | `proposals` | S1 | FE nhãn ngắn: «Đề xuất» |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Chiến dịch** | Chọn tab | Xem campaign | `campaigns` | S4 | |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Phỏng vấn** | Chọn tab | Xem lịch PV | `interviews` | S6 | |
| CH07 §1 Menu con PV | Ch07 | Tuyển dụng | Phỏng vấn → **Đã lên lịch** | Chọn submenu | Lịch sắp tới | `interviews` / `scheduled` | S6 | FE: «Lịch phỏng vấn» |
| CH07 §1 Menu con PV | Ch07 | Tuyển dụng | Phỏng vấn → **Hoàn thành** | Chọn submenu | PV đã xong | `interviews` / `completed` | S6 · S7 | FE: «Đã hoàn thành» |
| CH07 §1 Menu con PV | Ch07 | Tuyển dụng | Phỏng vấn → **Đã hủy** | Chọn submenu | PV hủy | `interviews` / `cancelled` | S6 | |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Đánh giá** | Chọn tab | Bảng điểm UV | `evaluations` | S7 | |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Kế hoạch tuyển dụng** | Chọn tab | Plan định biên tháng | `plans` | S1 | FE nhãn ngắn: «Kế hoạch» |
| CH07 §1 Bảng Tab | Ch07 | Tuyển dụng | **Báo cáo** | Chọn tab | Thống kê TD | `reports` | S11 | Funnel / nguồn |
| CH07 §2.1 | Ch07 | Tuyển dụng | Tổng quan → **Dashboard** | Chọn sub-tab | Funnel 6 giai đoạn, KPI, biểu đồ | `dashboard` + Dashboard | S5 · S11 | FE: «Dashboard» |
| CH07 §2.1 | Ch07 | Tuyển dụng | Tổng quan → **Bảng Kanban** | Chọn sub-tab | Kéo-thả UV theo cột | `dashboard` + Board | S5 · S8 · S9 | FE: «Board tuyển dụng» |
| CH07 §2 Bảng Nút | Ch07 | Tuyển dụng | Tổng quan / Dashboard | **Tạo tin tuyển dụng** (+) | Shortcut tạo job (quyền create) | `jobs` (navigate/create) | S4 | |
| CH07 §2 Pipeline | Ch07 | Tuyển dụng | Tổng quan | **Pipeline ứng viên (6 giai đoạn)** | Bấm cột funnel → tab Ứng viên | `candidates` | S5 | |
| CH07 §2 KPI | Ch07 | Tuyển dụng | Tổng quan | Thẻ KPI (Chỉ tiêu · CV · Đã PV · Đã tuyển) | Đọc số liệu | `dashboard` | S11 | |
| CH07 §2 Chi phí | Ch07 | Tuyển dụng | Tổng quan | Thẻ chi phí TB/UV · TopCV · 24h | Đọc khi có data | `dashboard` | — | Empty OK |
| CH07 §2 Biểu đồ | Ch07 | Tuyển dụng | Tổng quan | Biểu đồ đường / tròn / cột phòng ban | Quan sát | `dashboard` | — | |
| CH07 §2 Hoạt động | Ch07 | Tuyển dụng | Tổng quan | **Hoạt động gần đây** | Xem 5 UV mới | `dashboard` | S5 | |
| CH07 §2 Cột Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Cột **Ứng tuyển** | Xem / kéo thẻ vào | stage `applied` | S5 | |
| CH07 §2 Cột Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Cột **Sàng lọc** | Kéo UV sang sàng | stage `screening` | S5 | |
| CH07 §2 Cột Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Cột **Phỏng vấn** | Kéo UV sang PV | stage `interview` | S6 | |
| CH07 §2 Cột Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Cột **Offer** (Đề nghị tuyển) | Kéo UV sang offer | stage `offer` | S8 | FE stage label: «Đề xuất» |
| CH07 §2 Cột Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Cột **Đã tuyển** | Kéo → mở **Liên kết nhân viên** nếu chưa có NV | stage `hired` | S9 | |
| CH07 §2 Cột Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Cột **Từ chối** | Kéo loại UV | stage `rejected` | — | Reject path |
| CH07 §2 Thẻ Kanban | Ch07 | Tuyển dụng | Bảng Kanban | Kéo thẻ (Grip) | Đổi giai đoạn | `dashboard` board | S5–S9 | |
| CH07 §3 | Ch07 | Tuyển dụng | Yêu cầu tuyển dụng | **Tạo yêu cầu** / Thêm | Mở form vị trí, SL, phòng ban | `requisitions` | S2 | FE: «Thêm yêu cầu» |
| CH07 §3 | Ch07 | Tuyển dụng | Yêu cầu tuyển dụng | **Lưu** (form YCTD) | POST YCTD → row · F5 | `requisitions` | S2 | UF-HRM-12 |
| CH07 §3 | Ch07 | Tuyển dụng | Yêu cầu tuyển dụng | **Mở JD** | Chuyển Thư viện JD | `jd-library` | S3 | |
| CH07 §3 | Ch07 | Tuyển dụng | Yêu cầu tuyển dụng | **Duyệt / từ chối** (nếu bật WF) | Theo workflow | `requisitions` + XBOS Inbox | S2 | Bridge Inbox |
| CH07 §3 + FE SoT | Ch07 | Tuyển dụng | Yêu cầu tuyển dụng | **Gửi duyệt QT** | Spawn task Inbox (sau Lưu) | `requisitions` | S2 | HDSD §3 «Duyệt»; FE nút VI «Gửi duyệt QT» |
| CH07 §3 | Ch07 | Tuyển dụng | Yêu cầu tuyển dụng | **Sửa** / Chi tiết | Mở sửa hoặc detail | `requisitions` | S2 | |
| CH07 §4 | Ch07 | Tuyển dụng | Thư viện JD | **Sửa** · **Xóa** · **Dùng cho tin tuyển dụng** | CRUD / gắn tin | `jd-library` | S3 | |
| CH07 §4 | Ch07 | Tuyển dụng | Thư viện JD | Tạo / Lưu mẫu JD | Persist Purpose · trách nhiệm · band | `jd-library` | S3 | FR-HRM-SC-JT-01 |
| CH07 §5 | Ch07 | Tuyển dụng | Tin tuyển dụng | **Xem** · **Sửa** · **Đóng tin** | Vòng đời tin | `jobs` | S4 | |
| CH07 §5 Form | Ch07 | Tuyển dụng | Tin tuyển dụng | Form tạo/sửa tin (tiêu đề, PB, địa điểm, loại hình, SL, hạn, mô tả, yêu cầu…) | Điền → Lưu/Đăng | `jobs` | S4 | Lương min/max không bắt buộc |
| CH07 §5 Trạng thái | Ch07 | Tuyển dụng | Tin tuyển dụng | Trạng thái Nháp / Đang tuyển / Hết hạn | Quan sát cột | `jobs` | S4 | draft · active · expired |
| CH07 §6 | Ch07 | Tuyển dụng | Ứng viên | **Thêm ứng viên** | Form họ tên, email, SĐT, vị trí, nguồn | `candidates` | S5 | |
| CH07 §6 | Ch07 | Tuyển dụng | Ứng viên | **Xem chi tiết** | Hồ sơ · lịch sử giai đoạn · đính kèm | `candidates` detail | S5–S9 | CandidateDetailView |
| CH07 §6 | Ch07 | Tuyển dụng | Ứng viên | **Chuyển giai đoạn** | Dropdown hoặc kéo Kanban | `candidates` | S5 · S8 · S9 | |
| CH07 §6 · §13 | Ch07 | Tuyển dụng | Ứng viên / Kanban | **Liên kết nhân viên** | Chọn NV khi Đã tuyển | HireEmployeeLinkDialog | S9 | UC-HRM-INT-01 |
| CH07 §7 | Ch07 | Tuyển dụng | Đề xuất định biên | Tạo / duyệt đề xuất HC | Tiêu đề · kỳ · PB · vị trí · SL · trạng thái | `proposals` | S1 | FE: «Tạo đề xuất» |
| CH07 §7 | Ch07 | Tuyển dụng | Đề xuất định biên | **Duyệt** / **Từ chối** | Đổi trạng thái proposal | `proposals` | S1 | |
| CH07 §7 | Ch07 | Tuyển dụng | Đề xuất định biên | **Tạo tin tuyển dụng** (từ đề xuất) | Shortcut sang tin | `jobs` | S4 | Có trên FE HeadcountProposalTab |
| CH07 §8 | Ch07 | Tuyển dụng | Chiến dịch | Xem / tạo chiến dịch | Tên · vị trí · UV · thời gian · owner · funnel | `campaigns` | S4 | |
| CH07 §9 | Ch07 | Tuyển dụng | Phỏng vấn | **Sửa** · **Hủy** · **Ghi nhận kết quả** | Quản lý lịch | `interviews` | S6 · S7 | |
| CH07 §9 | Ch07 | Tuyển dụng | Phỏng vấn / UV | Lên lịch PV (họ tên, vị trí, ngày giờ, interviewer, hình thức) | Tạo lịch → Lưu | `interviews` + Schedule dialog | S6 | FE: ScheduleInterviewDialog |
| CH07 §10 Thẻ | Ch07 | Tuyển dụng | Đánh giá | Thẻ Tổng / Đạt / Không đạt / Chờ xem xét | Đọc thống kê | `evaluations` | S7 | |
| CH07 §10 Nút | Ch07 | Tuyển dụng | Đánh giá | **So sánh ứng viên** | Mở so sánh ≥2 UV | CandidateComparisonDialog | S7 | |
| CH07 §10 Chi tiết | Ch07 | Tuyển dụng | Đánh giá | Nút mắt → chi tiết đánh giá | Mở CandidateEvaluationDialog | `evaluations` | S7 | |
| CH07 §13 | Ch07 | Tuyển dụng | Đánh giá | **CandidateEvaluationDialog** | Chấm tiêu chí · điểm · nhận xét · kết quả → Lưu | dialog | S7 | |
| CH07 §11.1 | Ch07 | Tuyển dụng | Kế hoạch tuyển dụng | **Tạo kế hoạch** (+) | Mở form (quyền create) | `plans` | S1 | |
| CH07 §11.1 | Ch07 | Tuyển dụng | Kế hoạch tuyển dụng | Thẻ KPI Tổng / Đã duyệt / Chờ duyệt | Đọc | `plans` | S1 | |
| CH07 §11.1 | Ch07 | Tuyển dụng | Kế hoạch tuyển dụng | **Xem chi tiết** | Mở plan detail | `plans` | S1 | |
| CH07 §11.2 | Ch07 | Tuyển dụng | Hộp thoại Tạo kế hoạch | **Thêm phòng ban** | Thêm dòng PB | `plans` dialog | S1 | |
| CH07 §11.2 | Ch07 | Tuyển dụng | Hộp thoại Tạo kế hoạch | **Thêm vị trí** | Thêm dòng vị trí | `plans` dialog | S1 | |
| CH07 §11.2 | Ch07 | Tuyển dụng | Hộp thoại Tạo kế hoạch | Thùng rác | Xóa PB/vị trí (giữ ≥1) | `plans` dialog | S1 | |
| CH07 §11.2 | Ch07 | Tuyển dụng | Hộp thoại Tạo kế hoạch | **Lưu nháp** | Lưu không gửi duyệt | `plans` | S1 | |
| CH07 §11.2 | Ch07 | Tuyển dụng | Hộp thoại Tạo kế hoạch | **Tạo kế hoạch** | Submit | `plans` | S1 | |
| CH07 §11.2 Form | Ch07 | Tuyển dụng | Hộp thoại Tạo kế hoạch | Trường tiêu đề · năm · từ/đến tháng · ghi chú · NS/DX | Điền bắt buộc | `plans` | S1 | |
| CH07 §11.3 | Ch07 | Tuyển dụng | Chi tiết kế hoạch | **Sửa** | Chỉnh sửa | `plans` | S1 | |
| CH07 §11.3 | Ch07 | Tuyển dụng | Chi tiết kế hoạch | **Gửi duyệt QT** | Gửi duyệt định biên | `plans` | S1 | Cùng nút VI trên FE |
| CH07 §11.3 | Ch07 | Tuyển dụng | Chi tiết kế hoạch | **Từ chối** | Từ chối plan | `plans` | S1 | |
| CH07 §11.3 | Ch07 | Tuyển dụng | Chi tiết kế hoạch | **Duyệt kế hoạch** | Duyệt (theo quyền/WF) | `plans` | S1 | |
| CH07 §12 | Ch07 | Tuyển dụng | Báo cáo | Xem nguồn UV · funnel · chi phí · time-to-hire | Quan sát báo cáo | `reports` | S11 | RecruitmentReportsTab |
| CH07 §14 | Ch07 | Tuyển dụng | (mọi màn) | Quan sát trạng thái UV / tin / kế hoạch / PV / đánh giá | Khớp bảng §14 | * | S2–S11 | AC trạng thái |
| CH07 §15 | Ch07 | Tuyển dụng | (lỗi) | Không kéo Kanban / tab trống / không tạo tin / funnel 0 / Gửi duyệt QT treo | Xử lý theo HDSD §15 | * | — | Không seed để «có UV» |
| CH04 §4.1 | Ch04 XBOS | Command Center | **Hộp thư Workflow** | Mở inbox Action Cards | Xem task chờ duyệt (gồm tuyển dụng) | CC Inbox | S2 · S0 | UF-XBOS-12 |
| CH04 §4.1 | Ch04 XBOS | Hộp thư | Chi tiết task | **Hoàn thành** | Duyệt/hoàn thành bước WF | CC Inbox | S2 | J-REC-WF-03 |
| CH04 §4.1 | Ch04 XBOS | Hộp thư | Chi tiết task | **Từ chối** | Từ chối bước WF | CC Inbox | S2 | J-REC-WF-06 optional |
| CH04 §4.2 | Ch04 XBOS | Cài đặt / Quy trình | Danh sách QT | **Thêm quy trình mới** | Tạo definition | Canvas list | S0 | |
| CH04 §4.2 | Ch04 XBOS | Quy trình | Danh sách QT | **Chỉnh sửa** | Mở canvas | Canvas | S0 | |
| CH04 §4.2 | Ch04 XBOS | Quy trình | Thẻ **Mẫu QT tuyển dụng HRM (bridge)** | Tạo/mở mẫu HRM | Canvas bridge | S0 | hrm_recruitment_* |
| CH04 §4.2 | Ch04 XBOS | Canvas | **Lưu quy trình** | Persist graph · F5 còn | Canvas | S0 | J-REC-WF-01 |
| CH04 §4.2 | Ch04 XBOS | Canvas | Cấu hình bước (Phê duyệt / Đồng ý / Từ chối / BOD) | Gán luồng tuyển dụng | Canvas | S0 | Trigger: YCTD gửi duyệt |
| CH04 §4.4.1 | Ch04 XBOS | Cài đặt hệ thống | **Áp dụng danh mục HRM (ĐVTV)** | Chọn nguồn **Nguồn ứng viên** (+ chức danh…) | Áp dụng ĐVTV | S0b | FR-HRM-SC-CH-01 |
| CH04 §4.4.1 | Ch04 XBOS | Áp dụng danh mục | **Tải lại nguồn tập đoàn** | Đọc snapshot | catalog apply | S0b | |
| CH04 §4.4.1 | Ch04 XBOS | Áp dụng danh mục | **Áp dụng cho N ĐVTV** | POST apply | catalog apply | S0b | G-BM-03 nếu thiếu UI |
| CH11 §11.1 (liên quan) | Ch11 HRM Settings | Cài đặt HRM | Danh mục đồng bộ XBOS | **Pull** / xem picker kênh TD · chức danh | Scope ĐVTV thấy catalog | settings catalogs | S0b · S3 · S4 | UF-HRM-10 |

---

## 2. Orphan HDSD (có trong HDSD — không có tab/control FE tương đương rõ)

| hdsd_ref | Mục HDSD | Kỳ vọng | Tình trạng FE | Gợi ý QA |
|----------|----------|---------|---------------|----------|
| — | *(11 tab chính + submenu Tin/UV/PV)* | Có tab | **Không orphan tab** — đủ map `dashboard`…`reports` | Cover hết hàng §1 |
| CH07 §2 «Offer» | Cột Kanban Offer / Đề nghị tuyển | Stage + (có thể) form offer | Có stage chip/kéo; **không** màn offer letter / compensation riêng | 🟡 `product_gap` S8 nếu chỉ kéo stage |
| CH07 §15 «import» | Gợi ý thêm UV / import khi funnel=0 | Có đường nhập UV | FE có **Import** dialog nhưng **không** nằm bảng Nút HDSD §6 | Cover Import như FE-extra (§3); không claim nút HDSD |
| CH07 | Onboarding 30/60/90 · probation close | *(không liệt kê trong Ch07)* | Ngoài HDSD Ch07 | S10/S11 theo 13-step = gap program, **không** orphan HDSD |
| CH04 §4.2 | «Apply workflow to members» riêng | Apply QT xuống ĐVTV | Catalog apply §4.4.1 có; apply-WF-members có thể ABSENT | 🟡 G-BM-03 nếu không thấy UI |

---

## 3. Orphan FE (có trên app — không / mờ trong bảng Nút HDSD)

| FE control | Path / component | Trong HDSD? | Ghi chú U76 |
|------------|------------------|-------------|-------------|
| Nút **Import** ứng viên | `CandidateImportDialog` trên `CandidatesTab` | Chỉ nhắc «import» ở §15 lỗi | QA cover như FE-extra; không đổi label HDSD |
| `InterviewCalendarView` | Lịch PV (nếu bật view) | Không đặt tên trong §9 | Optional smoke |
| `JobCandidatesDialog` / `CampaignCandidatesTab` | Dialog UV theo tin/chiến dịch | Không mục riêng | Optional |
| Tab label «Dashboard» | `recruitment.tabs.dashboard` | HDSD = **Tổng quan** | Ghi `label_drift` |
| Submenu nhãn dài FE | `jobsMenu` / `candidatesMenu` / `interviewsMenu` | HDSD ngắn hơn | Cùng `id` submenu = PASS nếu click đúng filter |
| «Board tuyển dụng» | `boardTab` | HDSD = **Bảng Kanban** | `label_drift` |
| Stage FE «Đề xuất» | `recruitment.offer` | HDSD cột **Offer** / Đề nghị tuyển | Cùng stage `offer` |
| Tab FE «Đề xuất» / «Kế hoạch» | `proposals` / `plans` | HDSD đầy đủ «Đề xuất định biên» / «Kế hoạch tuyển dụng» | `label_drift` ngắn |

**Không có FE tab id ngoài 11 mục HDSD** trên `Recruitment.tsx` (`dashboard` … `reports` + `requisitions` + `jd-library`).

---

## 4. Map nhanh 13 bước → hàng inventory

| Step | HDSD neo chính |
|------|----------------|
| **S0** | CH04 §4.2 Canvas + Mẫu QT tuyển dụng HRM · Lưu quy trình |
| **S0b** | CH04 §4.4.1 Áp dụng danh mục (Nguồn ứng viên · Chức danh) · CH11 pull |
| **S1** | CH07 §7 Đề xuất định biên · §11 Kế hoạch tuyển dụng |
| **S2** | CH07 §3 YCTD + Gửi duyệt QT · CH04 §4.1 Inbox Hoàn thành/Từ chối |
| **S3** | CH07 §4 Thư viện JD |
| **S4** | CH07 §5 Tin + §8 Chiến dịch · §2 Tạo tin |
| **S5** | CH07 §6 Ứng viên + submenu Sàng lọc · Kanban Sàng lọc |
| **S6** | CH07 §9 Phỏng vấn + submenu · Schedule |
| **S7** | CH07 §10 Đánh giá · So sánh · Evaluation dialog |
| **S8** | CH07 Kanban Offer / chuyển giai đoạn offer |
| **S9** | CH07 Kanban Đã tuyển · Liên kết nhân viên |
| **S10** | *(không có trong CH07)* → 🟡 product_gap ngoài inventory HDSD |
| **S11** | CH07 §12 Báo cáo · funnel Dashboard · YCTD filled (nếu có) |

---

## 5. Gate QA (U65 + U76)

1. Mọi hàng §1 có verdict 🟢 / 🟡 product_gap / 🔴 / ⬜ trong evidence `QA-REC-HDSD-COVERAGE-01`.
2. Click path dùng **label HDSD**; nếu UI chỉ hiện nhãn FE lệch → vẫn cover function + ghi `label_drift`.
3. Cấm seed · cấm PASS chỉ API.
4. Happy path 13-step không thay thế coverage submenu (Tin ×4 · UV ×5 · PV ×3).

---

## 6. SoT recovery note

Thư mục `docs/client-delivery/hdsd/**` **không** còn trên workspace / không track git tại thời điểm BA. Chương 7 được **khôi phục** từ transcript subagent ba-docs (`86bcd5a8-…`) vào `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md`. XBOS CH04 trích từ transcript (`7439915a-…`) cho các hàng Inbox/Canvas/catalog — file CH04 đầy đủ chưa restore trong work_item này.
