# XBOS — Template Excel danh mục (đơn giản — gửi đối tác)

**Phiên bản:** v2.0 · **Ngày:** 2026-06-20  
**File:** [`templates/XBOS_Catalog_Import_Template_v2.xlsx`](./templates/XBOS_Catalog_Import_Template_v2.xlsx)  
**Tái tạo:** `node scripts/generate-xbos-catalog-excel-template.mjs`

> v1 đã thay bằng v2 — bỏ các cột kỹ thuật (`tenant_id`, `company_id`, `item_id`…). Chỉ giữ trường nghiệp vụ danh mục.

---

## 1. Cấu trúc (3 sheet)

| Sheet | Mục đích |
|-------|----------|
| `00_HUONG_DAN` | Hướng dẫn điền ngắn |
| `01_DANH_SACH_DANH_MUC` | **Liệt kê đủ** mọi danh mục XBOS (~98 mục) — kể cả **chưa có import file** |
| `02_DU_LIEU_DANH_MUC` | **Một bảng duy nhất** để đối tác điền giá trị |

---

## 2. Cột điền dữ liệu (sheet 02)

| Cột | Bắt buộc | Ghi chú |
|-----|----------|---------|
| **Tên danh mục** | Có (đã điền sẵn) | Không sửa tên nhóm |
| **Mã giá trị** | Có | Mã ổn định, không dấu (vd. `PHEP-NAM`, `CEO`) |
| **Tên hiển thị** | Có | Tên tiếng Việt trên hệ thống |
| **Mô tả** | Không | Giải thích ngắn |
| **Trạng thái** | Có | `Hoạt động` hoặc `Ngừng` |
| **Ghi chú** | Không | Ý kiến đối tác |

Mỗi danh mục có **6 dòng trống** (cột Tên danh mục đã ghi sẵn). Cần thêm → chèn dòng, copy cùng «Tên danh mục».

---

## 3. Danh sách danh mục gồm những gì?

- **25 danh mục Command Center / Master** (pháp nhân, hạ tầng, phòng ban, NCC, KPI, văn bản, phân quyền, quy trình…)
- **72 danh mục HRM** theo `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md`
- **2 danh mục bổ sung** (trung tâm chi phí, chính sách quản trị)

Cột **Import hệ thống** trên sheet 01 ghi rõ:

| Giá trị | Ý nghĩa |
|---------|---------|
| **Có (API)** / **Có (config-sync)** | Team XeVN import được sau khi nhận file |
| **Chưa (UI thủ công)** | Chưa có import file — liệt kê để đối tác chuẩn bị dữ liệu |
| **UI metadata** | Nhóm trường hồ sơ — cấu hình trên màn hình |
| **Tham chiếu quy trình** | Mã quy trình, không phải danh mục giá trị chọn |

---

## 4. Quy trình

1. Đối tác mở sheet **02**, điền Mã + Tên hiển thị cho từng danh mục cần khai.
2. Gửi file `.xlsx` về XeVN.
3. XeVN validate → import API (phần «Có») hoặc nhập UI (phần «Chưa»).

---

## 5. Tham chiếu

- 72 danh mục HRM: `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md`
- Hợp đồng field chi tiết (nội bộ Dev): `docs/xbos/S1_BA_DATA_MD01-08.md`
