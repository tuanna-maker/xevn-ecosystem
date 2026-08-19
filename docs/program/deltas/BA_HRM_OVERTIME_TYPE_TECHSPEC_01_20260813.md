# TechSpec — Technical Specification for Wave 6: Overtime (OT) Types & Exclusions

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-OVERTIME-TYPE-TECHSPEC-01 |
| ref_srs | [BA_HRM_OVERTIME_TYPE_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_OVERTIME_TYPE_SRS_01_20260813.md) |
| Architecture Decision | **Option (a) Approved**: Sử dụng cơ chế `att_ot_type` có sẵn + Exclusion Scope Rule |
| Scope | Group/Holding Ref + Department/EmploymentType Exclusion Scope |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Enterprise Grade Standard |

---

## 1. Phân tích Luật Lao động 2019 về Làm thêm giờ (Overtime)

Wave 6 định nghĩa 3 mức hệ số tiền lương làm thêm giờ theo Điều 98 Luật Lao động 2019:

| Mã loại OT | Tên loại OT | Thời điểm làm thêm | Hệ số lương làm thêm (%) |
|---|---|---|---|
| `OT_WEEKDAY` | OT Ngày thường | Sau giờ làm việc ngày làm việc bình thường | **150%** (Hệ số `1.5`) |
| `OT_WEEKEND` | OT Ngày nghỉ hàng tuần | Ngày nghỉ hàng tuần (Thứ 7 / Chủ nhật) | **200%** (Hệ số `2.0`) |
| `OT_HOLIDAY` | OT Ngày lễ, Tết | Ngày lễ Tết công bố theo luật | **300%** (Hệ số `3.0`) |

---

## 2. Quy tắc Loại trừ Đặc thù Ngành Vận tải (Driver Exclusion Rule)

1. **Bản chất nghiệp vụ:** Đội ngũ Lái xe tải đường dài, Lái xe công nghệ/giao hàng, và Lái xe theo chuyến được trả lương theo **Đơn giá lượt/chuyến (Trip Allowance)** hoặc **Doanh số chuyến**, đã bao gồm bù đắp thời gian làm việc linh hoạt.
2. **Cấu hình Loại trừ (`excluded_employment_types` & `excluded_department_ids`):**
   - Loại trừ tự động khi tính lương cho bộ phận `DEP_LOGISTICS_DRIVER` và loại hình lao động `EMP_DRIVER`.
   - Tránh tính trùng lặp hai lần (Double Premium Penalty): Vừa hưởng tiền chuyến vừa tính OT theo giờ.
