# SPONSOR QUESTIONS — Cần xác nhận trước khi code Policy Engine
## Ngày: 2026-08-22 | Gửi: PM → Sponsor XeVN

> **Tại sao cần trả lời những câu này?**  
> Hệ thống tính lương mới sẽ config hoàn toàn bằng dữ liệu — không hardcode.  
> Nếu thiếu thông tin dưới đây, **không thể code đúng** các công thức tương ứng.  
> **Ưu tiên: Q1, Q2, Q3 trả lời trước (Critical). Q4–Q6 có thể sau.**

---

## ❓ Q1 — CRITICAL: Thưởng doanh thu Lái xe Tải — Mức 1 và Mức 2

**Context:**  
QĐ 206/2026 quy định thưởng DT theo tiered:
- DT ≤ Mức 1 → 6% DT
- Mức 1 < DT ≤ Mức 2 → 8% DT
- DT > Mức 2 → 8%×Mức2 + 10%×(DT – Mức2)

Tài liệu **chưa ghi rõ Mức 1 và Mức 2 là bao nhiêu** theo từng loại xe.

**Câu hỏi:** Với mỗi loại xe tải, Mức 1 và Mức 2 doanh thu (VND/tháng) là bao nhiêu?

| Loại xe | Mức 1 (VND) | Mức 2 (VND) |
|---------|------------|------------|
| 1T – 2T | ________________ | ________________ |
| 3.5T – 4.5T | ________________ | ________________ |
| 5T – 6.5T | ________________ | ________________ |
| 8T Hino/Isuzu | ________________ | ________________ |
| 8T Chenglong | ________________ | ________________ |
| 15T FVM | ________________ | ________________ |
| Đầu kéo container | ________________ | ________________ |

**Hoặc:** Mức 1/Mức 2 giống nhau cho tất cả loại xe? Nếu vậy, Mức 1 = ______ và Mức 2 = ______

**Ảnh hưởng nếu không trả lời:** Không tính được thưởng DT LX Tải (toàn bộ nhóm LX_TAI bị block).

---

## ❓ Q2 — CRITICAL: Lương Văn phòng Hà Nội — Cơ chế nào?

**Context:**  
Hiện tại tài liệu mô tả:
- VP Tỉnh (NĐ/NB/TB): Lương **zero-sum pool** theo hệ số vị trí × giờ công
- VP HN: Chưa có quy chế riêng — chỉ có "Bảng lương VP HN 2026.06.21" nhưng chưa đọc được cơ chế

**Câu hỏi:** Nhân viên văn phòng Hà Nội (bộ phận hành chính, kế toán, marketing...) lương theo cơ chế nào?

☐ **A — Ngạch-Bậc thuần túy**: Lương = Bảng lương ngạch-bậc + Phụ cấp định mức + Thưởng KPI%  
☐ **B — Zero-sum pool**: Giống VP Tỉnh, lương theo quỹ chia theo hệ số  
☐ **C — Kết hợp**: Phần cứng theo ngạch-bậc + Phần biến động theo KPI/DT  
☐ **D — Khác**: ___________________________________________________

*Ghi chú thêm (nếu có): _______________________________________________*

**Ảnh hưởng nếu không trả lời:** Không thiết kế được `pay_group VP_HN` — toàn bộ NV VP HN không có policy.

---

## ❓ Q3 — CRITICAL: Tổng đài 1500 vs 1731 — Cùng hay khác công thức?

**Context:**  
Quy chế TĐ hiện mô tả:
- Pool 5,000,000đ/tháng chia theo số cuộc nghe
- Thưởng HĐ theo ca (600k/800k), Thưởng TG (700k/1,500k)
- Hệ số nhỡ, Top CLDV

**Câu hỏi:** Số 1500 và 1731 có **cùng công thức tính lương không**, hay mỗi số có pool/định mức riêng?

☐ **A — Cùng hoàn toàn**: 1 policy áp cho cả 2 số, pool gộp chung  
☐ **B — Cùng công thức nhưng pool riêng**: Mỗi số có pool 5,000,000 riêng, tính độc lập  
☐ **C — Khác nhau**: 1500 và 1731 có định mức/tỷ lệ khác nhau

*Nếu B hoặc C, bổ sung thêm: Định mức pool và thưởng HĐ/TG của số 1731 là bao nhiêu?*

| Hạng mục | Số 1500 | Số 1731 |
|---------|---------|---------|
| Pool cuộc nghe/tháng | 5,000,000 | ________________ |
| Thưởng HĐ Ca sáng | 600,000 | ________________ |
| Thưởng HĐ Ca chiều | 800,000 | ________________ |
| Thưởng TG Ca sáng | 700,000 | ________________ |
| Thưởng TG Ca chiều | 1,500,000 | ________________ |

**Ảnh hưởng nếu không trả lời:** Không thể tách pool đúng cho 2 nhóm TĐ — có thể tính lầm.

---

## ❓ Q4 — HIGH: Tạm ứng lương

**Câu hỏi:** Nhân viên được tạm ứng lương tối đa bao nhiêu % lương tháng?

☐ 30%  ☐ 50%  ☐ 70%  ☐ 80%  ☐ Khác: ______  
*Tạm ứng có qua phê duyệt không?* ☐ Có (1 cấp)  ☐ Có (2 cấp)  ☐ Không cần phê duyệt  
*Tạm ứng trừ vào lương tháng hiện tại hay tháng sau?* ☐ Tháng hiện tại  ☐ Tháng sau

---

## ❓ Q5 — MEDIUM: Thưởng chuyên cần Lái xe Tuyến sau 31/05/2026

**Context:** QĐ 169/2026 áp dụng thưởng chuyên cần 1,000,000đ/tháng từ 01/04–31/05/2026.

**Câu hỏi:** Sau 31/05/2026:

☐ **Hết hạn** — không còn thưởng chuyên cần  
☐ **Gia hạn thêm** đến: ____/____/2026  
☐ **Chuyển thành chính sách thường xuyên** (không còn thời hạn)  
☐ **Chờ quyết định BGĐ**

---

## ❓ Q6 — MEDIUM: Điểm CLHĐ Lái xe Tải — Ai nhập?

**Context:** Điểm CLHĐ (Chất lượng hàng đơn) dùng để tính khấu trừ 100,000đ/điểm.  
Điểm này xuất phát từ biên bản vi phạm (vệ sinh, xước, hỏng hóc).

**Câu hỏi:** Điểm CLHĐ do bộ phận nào nhập vào hệ thống?

☐ **HR** — nhập thủ công hàng tháng từ biên bản nhận từ Logistics  
☐ **Fleet Manager** — nhập trực tiếp khi phát sinh  
☐ **Supervisor** — nhập qua form riêng, sau đó HR confirm  
☐ **Import Excel** — Fleet nhập Excel, HR upload vào hệ thống

*Quy trình xác nhận:* ☐ 1 người nhập là xong  ☐ Cần HR review lại trước khi tính lương

---

## GỬI LẠI CHO PM SAU KHI ĐIỀN

Sau khi điền xong Q1–Q3 (Critical), PM sẽ:
1. Cập nhật params trong `pay_income_components` cho component_type tương ứng
2. Unblock code cho E2 Policy Engine (Epic P0 quan trọng nhất)
3. Hoàn thiện seed data catalog

**Deadline đề xuất: Trong vòng 2 ngày làm việc để không block team dev.**
