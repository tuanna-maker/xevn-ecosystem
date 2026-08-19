# Tổng hợp SoT nghiệp vụ — HRM Enterprise Blueprint

| Mục | Nội dung |
|-----|----------|
| Phiên bản | **1.0** — hợp nhất HTML họp + mindmap B-Minutes + WBS Excel |
| Ngày | 2026-08-04 |
| Trạng thái họp | **ĐÃ HỌP XONG TOÀN BỘ** bốn trụ (Tuyển · Nhân sự · Chấm công/Phép · **Tiền lương**) — **cấm** ghi «họp lương chưa xong» |
| Mục đích | Inventory nội bộ cho SRS / TechSpec / DB / API / WBS — **không** gửi khách nguyên văn |
| CORRECTION | Bãi bỏ MEETING P1 cũ («PAY chưa họp») — thay bằng mục **§1.4 PAY đã chốt** dưới đây |

---

## 0. Nguồn hợp nhất (ưu tiên khi lệch)

| # | Nguồn | Path / ghi chú | Vai trò |
|---|-------|----------------|---------|
| 1 | **Mindmap quyết định** | `_mindmap_20260804/mindmap_02.png` (Quyết định & hướng) | **Khóa quyết định** đã thống nhất |
| 2 | **Mindmap phạm vi chức năng** | `mindmap_01.png` (Tuyển / Chấm–phép / Hồ sơ) | Chi tiết chức năng bổ sung |
| 3 | **Mindmap hành động** | `mindmap_03.png` + `mindmap_04.png` | WBS / nghiệm thu / task triển khai tài liệu |
| 4 | **Bản ghi HTML** | Desktop B-Minutes + `_meeting_*` | Chi tiết diễn giải Người nói 2 |
| 5 | **WBS Excel** | `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` (+ bản cũ) | Phân rã task / UC |
| 6 | **SRS hiện tại** | `SRS_HRM_ENTERPRISE.md` | SoT khách — delta ADD/UPGRADE theo bảng dưới |

**Quy tắc merge:** Mindmap «thống nhất / chốt» **thắng** ghi chú tạm trong HTML (ví dụ transcript cắt giữa chừng). HTML dùng để **làm đầy** field/luồng. Excel dùng để **phân rã WBS**, không được mâu thuẫn mindmap khóa.

---

## 1. Quyết định đã thống nhất (mindmap «Quyết định & hướng»)

| ID | Quyết định | Hệ quả |
|----|------------|--------|
| D1 | **Tách chiến dịch tuyển** khỏi MVP — chỉ khi có đối tác/API | Campaign/JobPost = **GĐ2** |
| D2 | Module tuyển tập trung: **JD + YCTD + ứng viên + báo cáo**; **bắt buộc** liên kết UV ↔ YCTD | REC MVP 4 khối |
| D3 | Trường **trong/ngoài định biên** trên YCTD → điều kiện duyệt | REC-02 / 02b |
| D4 | Kế hoạch tháng: **chỉ số cần tuyển** — bỏ cột kế hoạch/đề xuất trùng | FR-REC-01 UI |
| D5 | Chuyển **lương, NH, MST, BH** sang module HĐ/BH (bảo mật) | CORE C&B ring |
| D6 | **Không** gộp quản lý công việc vào nhân sự — module riêng | OUT CORE |
| D7 | **Tạm dừng code/demo** — xác nhận tài liệu nghiệp vụ trước khi triển khai | Dev unlock sau confirm giấy |
| D8 | **Bảng công tổng hợp** (chấm + phép + OT) = **đầu vào tính lương** | ATT closed → PAY |

---

## 2. Phạm vi chức năng (mindmap + HTML)

### 2.1. Tuyển dụng (REC)

| ID | Yêu cầu | Nguồn |
|----|---------|-------|
| R1 | Tin/chiến dịch nội bộ không đồng bộ nền tảng → **ít giá trị**; chiến dịch **không làm phase này** | mindmap_01 + D1 |
| R2 | YCTD: trong/ngoài định biên + lý do tuyển mới/thay thế → duyệt | mindmap_01/03 + D3 |
| R3 | Tracking funnel: CV → PV → offer → onboard **gắn YCTD** | mindmap_01 + D2 |
| R4 | Báo cáo: theo thời gian × phòng × cấp; **KH vs thực tế** | mindmap_04 |
| R5 | Kế hoạch tháng chỉ «cần tuyển»; phòng ban trình–duyệt, HCNS tổng hợp | HTML + D4 |
| R6 | JD master; đánh giá PV động; mail theo giai đoạn; UV N–N YCTD | HTML |

### 2.2. Hồ sơ nhân sự (CORE)

| ID | Yêu cầu | Nguồn |
|----|---------|-------|
| C1 | Hồ sơ: cơ bản + cá nhân + công việc + tài chính; **+ người phụ thuộc** | mindmap_01 |
| C2 | Lương / NH / MST / BH → **HĐ/BH** (không để hồ sơ mở) | D5 |
| C3 | Quản lý công việc = **module riêng** | D6 |
| C4–C9 | Timeline BH; KT/KL → lương; tài sản BB; lịch sử quyết định; nghỉ tự nguyện vs đuổi; checklist giấy tờ | HTML |

### 2.3. Chấm công – nghỉ phép (ATT)

| ID | Yêu cầu | Nguồn |
|----|---------|-------|
| A1 | Khai báo **ca** + quy định đi muộn/về sớm theo chính sách | mindmap_01 |
| A2 | Bảng công tổng hợp (chấm + phép + OT) → **điều kiện tính lương** | D8 + mindmap_01 |
| A3 | Loại phép cấu hình: **phép năm · thâm niên · bù OT · chuyển kỳ · ứng phép** | mindmap_01 (**bổ sung**) |
| A4 | Nghỉ ốm: xét **chế độ BH** + hỗ trợ thêm của công ty (nếu có) | mindmap_01 (**bổ sung**) |
| A5 | Rule theo ca/lịch bộ phận; accrual + hold; holiday calendar | HTML |
| A6 | Mobile punch (kênh dữ liệu) | HTML |

### 2.4. Tiền lương (PAY) — **ĐÃ CHỐT TRONG HỌP**

| ID | Yêu cầu đã thống nhất | Nguồn |
|----|----------------------|-------|
| P1 | **Nguồn giờ công duy nhất** = bảng công tổng hợp đã chốt (từ chấm + phép + OT) | D8 |
| P2 | Dữ liệu C&B (lương nền, NH, MST, mức BH theo timeline) lấy từ module HĐ/BH — không từ hồ sơ công khai | D5 |
| P3 | KT/KL có tiền → ghi nhận kỳ lương + trạng thái đã thi hành | HTML |
| P4 | Công thức / engine cấu hình: giữ cờ **Q-PAY-FORMULA** (cách lắp công thức) — **không** đồng nghĩa «chưa họp lương» | SRS + ADR |
| P5 | Tách module tiền lương khỏi các module khác (ranh giới rõ) | mindmap_04 |
| P6 | Split-month / tất toán nghỉ việc: giữ FR PAY đã có trong SRS; siết AC theo P1–P3 | SRS hiện hữu |

> **CORRECTION bắt buộc trên mọi artifact:** xóa / thay thế câu «họp lương chưa xong», «PAY meeting unfinished», «P1 HOLD vì chưa họp». PAY depth kỹ thuật có thể vẫn **DRAFT chờ khách ký giấy** (D7) — khác với «chưa họp».

---

## 3. Hành động triển khai tài liệu (mindmap 03–04)

| # | Việc | Owner họp | Ghi chú PM |
|---|------|-----------|------------|
| H1 | Tổng hợp WBS phân rã module/task nghiệp vụ | Người nói 1 | Đồng bộ `WBS_*_MOI.xlsx` + synthesis này |
| H2 | Gửi file nghiệm thu cho anh Nam ký | Người nói 1 | Packet SRS/PDF/WBS — sponsor gửi |
| H3 | Bổ sung trong/ngoài ĐB + tuyển mới/thay thế trên YCTD | Docs → SRS | Đang delta |
| H4 | Tách chiến dịch khỏi phạm vi hiện tại | Docs | GĐ2 |
| H5 | Chỉnh bảng KH tuyển tháng | Docs + WBS | D4 |
| H6 | Báo cáo tuyển theo yêu cầu | Docs | R4 |
| H7 | Rà soát tách module: việc / HĐ-BH / chấm-phép / lương | Docs + ADR | 4 trụ + Work OUT |

---

## 4. Ma trận artifact cần cập nhật (wave CORRECTION)

| Artifact | Việc |
|----------|------|
| `MEETING_20260804_CUSTOMER_WANTS.md` | Trỏ sang synthesis; sửa §1.4 PAY |
| `SRS_HRM_ENTERPRISE.md` | ADD loại phép A3–A4; khóa D1–D8; PAY không ghi «chưa họp» |
| `TECHSPEC_*` / `API_DESIGN_*` / `DB_DESIGN_*` | Gỡ «họp lương chưa xong»; mở depth PAY theo P1–P6 + FR hiện có; formula UI vẫn Q-PAY-FORMULA |
| WBS Excel | Đồng bộ GĐ2 campaign; leave types; module tách |
| PDF khách | Rebuild sau SRS delta |

---

## 5. Cấm

- Ghi «họp chưa xong phần lương».
- Claim khách đã **ký** SRS chỉ vì mindmap nội bộ.
- Mở `apps/**` trước D7 (xác nhận tài liệu).
- Prompt-echo mindmap/HTML vào bản gửi khách.
