# TechSpec — Technical Specification for Wave 4: Contract Types & Employment Types

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-CONTRACT-EMPLOYMENT-TYPE-TECHSPEC-01 |
| ref_srs | [BA_HRM_CONTRACT_EMPLOYMENT_TYPE_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_CONTRACT_EMPLOYMENT_TYPE_SRS_01_20260813.md) |
| Architecture Decision | **Option (a) Approved**: Sử dụng cơ chế `group_ref` trên `emp_employment_type` và `contract_types` |
| Scope | Group/Holding Ref + Tenant Local Extension |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Enterprise Grade Standard |

---

## 1. Tổng quan Kiến trúc & Phân tách Domain

Wave 4 bao gồm 2 sub-domains danh mục quản lý song song:
1. **Loại Hợp đồng Lao động (Contract Types):** Quản lý hình thức văn bản cam kết pháp lý giữa người lao động và doanh nghiệp (5 loại chuẩn).
2. **Loại hình Lao động (Employment Types):** Phân loại tư cách pháp lý và hình thức làm việc của nhân sự (`EMP_OFFICIAL`, `EMP_PROBATION`, `EMP_SEASONAL`).

---

## 2. Chi tiết 5 Loại Hợp đồng & 3 Loại hình Lao động Chuẩn

### 2.1. Danh mục 5 Loại Hợp đồng Chuẩn (Luật Lao động 2019)

| Mã loại hợp đồng | Tên loại hợp đồng | Thời hạn pháp lý chuẩn | Đối tượng áp dụng |
|---|---|---|---|
| `CTR_PROBATION` | Hợp đồng Thử việc | Tối đa 02 tháng (60 ngày) | Nhân sự mới tuyển dụng thử thách |
| `CTR_FIXED_TERM` | Hợp đồng Xác định thời hạn | Từ 12 đến 36 tháng | Nhân viên ký chính thức lần 1 hoặc 2 |
| `CTR_INDEFINITE` | Hợp đồng Không xác định thời hạn | Không giới hạn thời gian | Nhân viên gắn bó lâu dài (ký lần 3) |
| `CTR_SEASONAL` | Hợp đồng Mùa vụ / Vụ việc | Dưới 12 tháng | Lao động bốc xếp, phụ xe theo đợt |
| `CTR_COLLABORATOR` | Hợp đồng Cộng tác viên | Theo thỏa thuận công việc | Chuyên gia tư vấn, cộng tác viên ngoài |

### 2.2. Danh mục 3 Loại hình Lao động Chuẩn

| Mã loại hình | Tên loại hình lao động | Quyền lợi BHXH | Đánh giá thử việc |
|---|---|---|---|
| `EMP_OFFICIAL` | Nhân viên chính thức | Tham gia đầy đủ BHXH/BHYT/BHTN | Đã đạt thử việc |
| `EMP_PROBATION` | Nhân viên thử việc | Nhận 85% lương ngạch, không BHXH bắt buộc | Đang trong giai đoạn thử thách |
| `EMP_SEASONAL` | Lao động mùa vụ / Thử thách | Thanh toán trọn gói theo công việc | Theo ca/lượt |

---

## 3. Quy tắc Nghiệp vụ (Business Rules)

1. **Rule CTR-01 (Giới hạn thử việc):** Hợp đồng thử việc `CTR_PROBATION` không được gia hạn quá 02 lần cho cùng một vị trí công tác.
2. **Rule CTR-02 (Tự động chuyển tiếp):** Khi kết thúc 02 lần Hợp đồng xác định thời hạn `CTR_FIXED_TERM`, lần tái ký tiếp theo bắt buộc chuyển thành `CTR_INDEFINITE`.
