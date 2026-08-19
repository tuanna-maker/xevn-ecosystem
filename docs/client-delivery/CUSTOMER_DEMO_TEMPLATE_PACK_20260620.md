# Gói gửi khách — Template danh mục XBOS (phản hồi demo HRM 2026-06-20)

| Trường | Giá trị |
|--------|---------|
| **work_item_id** | `CD-FB-01-TEMPLATE` |
| **Phiên bản template** | v2.0 · 2026-06-20 |
| **Đối tượng** | Quản lý / BA phía khách — chuẩn bị pilot Connect (T8/2026) |
| **ack_status** | `PASS_TO_PM` |

---

## 1. File đính kèm email

| # | File gửi khách | Ghi chú |
|---|----------------|---------|
| 1 | **`XBOS_Catalog_Import_Template_v2.xlsx`** | File chính — đối tác điền và gửi lại |
| 2 | *(tùy chọn)* Tài liệu này — **chỉ phần §2 + §3** (copy vào email hoặc xuất PDF ngắn) | Không bắt buộc đính kèm toàn bộ file nội bộ |

**Đường dẫn nội bộ (PM/BA):**

`docs/client-delivery/templates/XBOS_Catalog_Import_Template_v2.xlsx`

**Không gửi:** `v1`, script generator, tài liệu kỹ thuật nội bộ (`docs/xbos/`, `docs/hrm/`).

---

## 2. Email gửi khách (copy-ready)

**Tiêu đề đề xuất:**

```text
[XeVN] Template Excel danh mục hạ tầng & master data — chuẩn bị pilot tháng 8
```

**Nội dung:**

```text
Kính gửi Anh/Chị,

Cảm ơn Anh/Chị đã tham gia buổi rà soát HRM ngày 20/06. Theo thống nhất trong biên bản, XeVN gửi kèm file Excel mẫu để Quý công ty chuẩn bị dữ liệu danh mục trước giai đoạn chạy thử (tháng 8/2026).

■ File đính kèm
• XBOS_Catalog_Import_Template_v2.xlsx

■ Việc cần làm (ưu tiên tuần này)
1. Mở sheet «02_DU_LIEU_DANH_MUC».
2. Tập trung hai nhóm đã tô màu trong file (hoặc tìm theo cột «Tên danh mục»):
   • Danh mục nền — Hạ tầng cơ sở — loại hình kho, bãi, văn phòng, ICD… (dòng 8–13)
   • Điểm hạ tầng (kho / bãi / ICD…) — từng điểm vật lý cụ thể (dòng 14–19)
3. Điền đủ cột «Mã giá trị», «Tên hiển thị», «Trạng thái» (Hoạt động / Ngừng).
4. Các danh mục khác trên sheet 02 có thể bổ sung dần; sheet «01_DANH_SACH_DANH_MUC» liệt kê toàn bộ danh mục hệ thống để tham khảo.

■ Quy tắc điền nhanh
• Mã giá trị: viết liền, không dấu, ổn định (vd. KHO-BINHDUONG, BAI-XE-01, VP-HN-TONG).
• Tên hiển thị: tên tiếng Việt hiển thị trên hệ thống.
• Cần thêm dòng: chèn dòng mới, giữ nguyên «Tên danh mục» của nhóm đó.
• Không đổi tên sheet và dòng tiêu đề.

■ Gửi lại
Khi hoàn tất phần hạ tầng (và các danh mục đã điền), vui lòng gửi file .xlsx về email [điền email PM] trước buổi họp Thứ 2 / Thứ 5 tới.

XeVN sẽ kiểm tra và import vào môi trường pilot; phần danh mục chưa có chức năng import file sẽ được hướng dẫn nhập trên giao diện.

Trân trọng,
[Tên người gửi]
Đội dự án XeVN OS
```

---

## 3. Hướng dẫn điền sheet «02_DU_LIEU_DANH_MUC»

### 3.1 Cấu trúc cột (một bảng duy nhất)

| Cột | Bắt buộc | Cách điền |
|-----|----------|-----------|
| **Tên danh mục** | Có (đã điền sẵn) | **Không sửa** — dùng để nhóm dòng |
| **Mã giá trị** | Có | Mã nội bộ ổn định, không dấu, không khoảng trắng (gạch ngang được) |
| **Tên hiển thị** | Có | Tên tiếng Việt trên màn hình Command Center / HRM |
| **Mô tả** | Không | Giải thích ngắn (địa chỉ, công suất, ghi chú vận hành…) |
| **Trạng thái** | Có | `Hoạt động` hoặc `Ngừng` |
| **Ghi chú** | Không | Ý kiến / câu hỏi gửi XeVN |

Mỗi danh mục có **6 dòng trống** sẵn. Cần nhiều hơn → chèn thêm dòng, **copy cùng giá trị cột «Tên danh mục»**.

### 3.2 Hai nhóm ưu tiên — Hạ tầng (tô màu trước khi gửi)

Sponsor/PM **tô nền vàng nhạt** (hoặc xanh nhạt) các dòng sau trong file Excel trước khi gửi khách:

| Nhóm trên sheet 02 | Dòng Excel (cột A = Tên danh mục) | STT trên sheet 01 | Ý nghĩa nghiệp vụ |
|--------------------|-----------------------------------|-------------------|-------------------|
| **Danh mục nền — Hạ tầng cơ sở** | **8 → 13** | 2 | **Loại / phân loại** hạ tầng dùng chung: kho thường, kho lạnh, bãi xe, văn phòng, ICD, trạm… |
| **Điểm hạ tầng (kho / bãi / ICD…)** | **14 → 19** | 3 | **Từng điểm cụ thể** gắn pháp nhân: tên kho, bãi, văn phòng thực tế |

**Thứ tự logic:** Điền **Danh mục nền** trước (phân loại), sau đó **Điểm hạ tầng** (chi tiết từng cơ sở). Trên hệ thống XeVN, điểm hạ tầng sẽ tham chiếu loại đã khai ở danh mục nền.

### 3.3 Ví dụ điền — Danh mục nền (dòng 8–13)

| Tên danh mục | Mã giá trị | Tên hiển thị | Mô tả | Trạng thái |
|--------------|------------|--------------|-------|------------|
| Danh mục nền — Hạ tầng cơ sở | `KHO-THUONG` | Kho thường | Kho bãi container / hàng khô | Hoạt động |
| Danh mục nền — Hạ tầng cơ sở | `KHO-LANH` | Kho lạnh | Nhiệt độ kiểm soát | Hoạt động |
| Danh mục nền — Hạ tầng cơ sở | `BAI-XE` | Bãi xe / bãi container | Bãi trung chuyển, đậu xe | Hoạt động |
| Danh mục nền — Hạ tầng cơ sở | `VP-HANH-CHINH` | Văn phòng hành chính | Trụ sở, VP chi nhánh | Hoạt động |
| Danh mục nền — Hạ tầng cơ sở | `ICD` | ICD / depot | Cảng cạn, depot liên vận | Hoạt động |

### 3.4 Ví dụ điền — Điểm hạ tầng (dòng 14–19)

| Tên danh mục | Mã giá trị | Tên hiển thị | Mô tả | Trạng thái |
|--------------|------------|--------------|-------|------------|
| Điểm hạ tầng (kho / bãi / ICD…) | `KHO-BD-01` | Kho Bình Dương 1 | Kho chính miền Nam — loại Kho thường | Hoạt động |
| Điểm hạ tầng (kho / bãi / ICD…) | `BAI-HN-TRUNG-TAM` | Bãi xe Trung tâm Hà Nội | Bãi container nội đô | Hoạt động |
| Điểm hạ tầng (kho / bãi / ICD…) | `VP-HN-TONG` | Văn phòng Tập đoàn HN | Số nhà, quận… | Hoạt động |
| Điểm hạ tầng (kho / bãi / ICD…) | `ICD-HP-01` | ICD Hải Phòng | Cảng cạn khu vực Bắc | Hoạt động |

> **Lưu ý cho khách:** Mã và tên trên chỉ là **ví dụ minh họa** — Quý công ty thay bằng danh sách thực tế (kho, bãi, văn phòng đang vận hành).

### 3.5 Các sheet khác (tham khảo)

| Sheet | Mục đích |
|-------|----------|
| `00_HUONG_DAN` | Hướng dẫn ngắn trong file Excel |
| `01_DANH_SACH_DANH_MUC` | Danh sách ~98 danh mục XBOS; cột «Import hệ thống» = `Có` → XeVN import được sau khi nhận file |

---

## 4. Checklist PM trước khi gửi

- [ ] Đính kèm **`XBOS_Catalog_Import_Template_v2.xlsx`** (không phải v1)
- [ ] Tô màu dòng **8–13** và **14–19** trên sheet 02 (hoặc chèn comment «Ưu tiên điền»)
- [ ] Copy email §2, điền tên người gửi + email nhận file
- [ ] Không đính kèm tài liệu nội bộ dev/QA
- [ ] Ghi bus: `CD-FB-01-TEMPLATE` → đã gửi khách + ngày

---

## 5. Handoff PM

```yaml
completion_report: |
  Đã tạo gói gửi khách: email VN copy-ready, file đính kèm, hướng dẫn sheet 02,
  vị trí dòng 8–13 (Danh mục nền — Hạ tầng cơ sở) và 14–19 (Điểm hạ tầng),
  kèm ví dụ kho/bãi/văn phòng/ICD. Không thay đổi code.
next_owner: pm
next_dispatch_prompt: |
  PM gửi email §2 kèm XBOS_Catalog_Import_Template_v2.xlsx; tô màu dòng hạ tầng;
  cập nhật P1-CUSTOMER-DEMO F2 [x]; dispatch CD-FB-02-BA-DELTA hoặc wave W0 kế theo program.
ack_status: PASS_TO_PM
evidence_path: docs/client-delivery/CUSTOMER_DEMO_TEMPLATE_PACK_20260620.md
```
