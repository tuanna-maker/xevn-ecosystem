# PO-HRM-JD-GROUP-MODEL-01 — Nhóm mặc định vs nhóm kéo (từ JD mẫu XeVN)

| Field | Value |
|-------|--------|
| **Date** | 2026-08-06 |
| **Sponsor** | 3 JD IT + yêu cầu nhóm mặc định có tạo được + rule chọn nhóm |
| **Samples** | `Downloads/JD_*Tester*`, `*Fullstack*`, `*BA*` · extract `_tmp_jd_samples_extract.txt` |
| **Driver benchmark** | Mẫu lái xe / tài xế xe tải / đầu kéo (VN logistics) |
| **Locks** | Option A · Q1 · Q6 vẫn hiệu lực; SoT = Thư viện JD |

---

## 1. Phân tích 3 JD IT (cùng “họ” Công nghệ)

Cả BA / Fullstack / Tester-QA đều theo **cùng khung 4 khối lớn**:

| # | Khối (section) | Có trên cả 3? | Ghi chú khác biệt nội dung |
|---|----------------|---------------|----------------------------|
| 0 | **Header tin tuyển** (chức danh, thu nhập band, thời gian, địa điểm) | Có | Fullstack nhấn stack + «Yêu cầu AI bắt buộc»; BA/Tester band lương số |
| 1 | **Mô tả công việc** | Có | Nội dung theo nghề (BRD/SRS vs Node/React vs Test Case/UAT) |
| 2 | **Yêu cầu ứng viên** (chung + chuyên môn/ưu tiên) | Có | Fullstack tách bắt buộc vs ưu tiên; AI bắt buộc mạnh hơn |
| 3 | **Thời gian & địa điểm** | Có | **Gần như copy-paste** (T2–T7, 2 T7 remote, Licogi 12) |
| 4 | **Chế độ đãi ngộ** | Có | Lương/BHXH/nghỉ phép **chung**; lộ trình thăng tiến **theo nghề** |

**Kết luận IT:** Phần “khung công ty / phúc lợi / giờ làm” = **nhóm lặp**; phần “mô tả + yêu cầu chuyên môn” = **nhóm theo họ nghề**.

---

## 2. JD Lái xe (benchmark vận tải XeVN) — điểm khác

So với họ IT, JD lái xe / tài xế logistics thường **thêm / thay** các nhóm:

| Nhóm đặc thù vận hành | Ví dụ nội dung | IT có? |
|----------------------|----------------|--------|
| Giấy phép & chứng chỉ | Hạng B2/C/D/CE, chứng chỉ ATLĐ, PCCC | Không (thay bằng bằng CNTT) |
| An toàn & tuân thủ | Luật GTĐB, quy trình an toàn cảng/kho | Hiếm / khác ngữ cảnh |
| Ca kíp & điều động | Ca 12h, lệnh điều xe, sẵn sàng tăng ca | Khác hoàn toàn vs T2–T7 office |
| Kiểm tra phương tiện | Trước/sau ca: nhiên liệu, phanh, lốp | Không |
| Nhật trình / chứng từ giao nhận | Sổ lộ trình, giao nhận hàng, ETC | Không |
| Sức khỏe / tố chất vận hành | Khỏe, chịu áp lực thời gian | Khác soft-skill IT |

**Kết luận:** Không thể dùng **một** layout mặc định duy nhất cho mọi vị trí. Cần **nhiều gói nhóm mặc định (default pack)** + **rule chọn pack** theo ngữ cảnh (họ nghề / ngành / loại vị trí).

---

## 3. Giải pháp tổng thể (đề xuất — nâng Option A)

### 3.1 Ba lớp cấu hình

```text
Lớp 1 — Field (trường)
  text ngắn/dài, số, select, date, rich-lite…

Lớp 2 — Group (nhóm thông tin)          ← sponsor nhấn mạnh
  tập field + thứ tự + nhãn section + bắt buộc trong nhóm

Lớp 3 — Default Pack (gói mặc định)     ← “khi nào dùng nhóm mặc định nào”
  tập Group đánh dấu always_on khi viết JD
  + rule áp dụng (xem §3.3)
```

Khi **viết JD**:

1. Hệ thống chọn **Default Pack** theo rule → các Group trong pack **luôn có** (không cần kéo).
2. HR **kéo thêm** Group tùy chọn (optional) từ catalog (ví dụ «Yêu cầu AI», «Chứng chỉ chuyên ngành», «Ca kíp»).
3. Trong mỗi Group vẫn có thể sắp xếp field (Q1 DnD layout).
4. Lưu JD → `layout_snapshot` gồm cả pack + groups đã kéo (Q6).

### 3.2 Group luôn tạo được ở Cài đặt

Mỗi Group có metadata:

| Thuộc tính | Ý nghĩa |
|------------|---------|
| `code` / `label` | VD `SEC_DUTIES`, `SEC_REQUIREMENTS`, `SEC_LICENSE` |
| `kind` | `system_skeleton` \| `tenant_custom` |
| `usage` | `default_eligible` \| `optional_only` |
| `fields[]` | danh sách field_def + order |
| `view_style` | TopCV section (heading / bullets / chips) |

**System skeleton (seed cấu hình — không seed dữ liệu UAT):** các Group chuẩn XeVN có thể tạo sẵn lúc bootstrap cấu hình (Settings), HR vẫn **sửa/nhân bản/ngừng**.

### 3.3 Rule chọn Default Pack (khi nào dùng gói nào)

Ưu tiên đánh giá (fail-closed → pack an toàn nhất):

| Thứ tự | Điều kiện | Ví dụ pack |
|-------:|-----------|------------|
| 1 | `job_family` / họ nghề trên chức danh | `PACK_IT_OFFICE` · `PACK_DRIVER_OPS` · `PACK_WAREHOUSE` |
| 2 | `industry` / ngành LE hoặc tag vị trí | Logistics nặng → ưu tiên driver/ops |
| 3 | `employment_type` + `work_mode` | Office full-time vs ca kíp |
| 4 | Fallback pháp nhân | `PACK_COMPANY_DEFAULT` (header + duties + req + time + benefit tối thiểu) |

**Ví dụ map XeVN:**

| Pack | Group luôn có | Optional kéo thêm |
|------|---------------|-------------------|
| `PACK_IT_OFFICE` | Header · Mô tả CV · Yêu cầu UV · Thời gian/ĐĐ · Đãi ngộ | Yêu cầu AI · Stack kỹ thuật · Lợi thế logistics domain |
| `PACK_DRIVER_OPS` | Header · Mục tiêu/an toàn · Nhiệm vụ vận hành · GP&L chứng chỉ · Ca/điều động · Đãi ngộ | Container/cảng · Nhật trình · Sức khỏe |
| `PACK_COMPANY_DEFAULT` | Header · Mô tả · Yêu cầu · Thời gian · Đãi ngộ | (tối thiểu) |

Rule lưu ở Settings (cấu hình được), không hardcode trong FE.

### 3.4 Phân tách “nội dung lặp” vs “nội dung nghề”

Từ 3 JD IT:

| Nên thuộc Default Pack (reuse) | Nên thuộc Group optional / per-JD |
|--------------------------------|-----------------------------------|
| Thời gian & địa điểm office | Bullet mô tả công việc |
| Khối BHXH / nghỉ phép / thưởng khung | Yêu cầu chuyên môn / stack / AI |
| Header công ty + địa điểm Licogi | Lộ trình thăng tiến theo nghề |

→ Giảm copy-paste; JD lái xe **không** inherit giờ 08:00–17:00 office nếu pack = DRIVER_OPS.

---

## 4. Mapping sang epic hiện tại

| Artifact | Việc cần ADD |
|----------|----------------|
| SPEC-01 | UC nhóm + pack + rule áp dụng; AC kéo group |
| DATA-01 | Entity `rec_jd_group_def`, `rec_jd_default_pack`, `pack_rules` |
| ARCH-02 | API group/pack; FE: Settings groups/packs · builder kéo **group** |
| View TopCV | Render theo group order trong snapshot |

**must_keep:** Option A · Q1 · Q6 · SoT `job_description_templates` · cấm dual-write `job_postings` · U65.

---

## 5. Câu hỏi chốt nhanh (nếu cần — mặc định đề xuất sẵn)

| # | Đề xuất mặc định (team dùng nếu sponsor im) |
|---|-----------------------------------------------|
| G1 | Pack gắn theo **họ nghề / job_family** trên chức danh (XBOS job_titles tag) |
| G2 | Group «Thời gian & địa điểm» và «Đãi ngộ khung» tách khỏi «Mô tả/Yêu cầu» |
| G3 | Lái xe = pack riêng; không dùng PACK_IT_OFFICE |
| G4 | Khi đổi chức danh giữa chừng: hỏi «Áp pack mới?» — không tự xóa nội dung đã gõ |

---

## 6. World benchmark (ADD)

Tham chiếu toàn cầu + map pack/catalog chuẩn:  
[`PO-HRM-JD-WORLD-BENCHMARK-01.md`](./PO-HRM-JD-WORLD-BENCHMARK-01.md)

Điểm chốt: Google **Min vs Pref** · LinkedIn **summary ngắn + benefits nổi** · Workday/Greenhouse **template theo job family** · TopCV **Quyền lợi** · Driver **License/Safety/Shift**.

## 7. Next

- ba-process: delta SPEC groups/packs (+ import WORLD-BENCHMARK catalog §4)  
- ba-data: entity + VAL  
- sa: APPEND ARCH (group layer) — Dev vẫn sau khi ARCH group sẵn sàng  
