# Phiếu chốt sponsor — mở Excel (không điền trên file Markdown này)

| Mục | Nội dung |
|-----|----------|
| **Mã** | `PO-HRM-BP-SPONSOR-CHOT-01` |
| **Ngày** | 2026-08-05 |
| **Vì sao không điền trên `.md`** | Cursor xem Markdown khó thấy ô trống; checkbox ☐ không gõ được tiện |

---

## Anh điền ở đâu?

### Cách 1 — khuyến nghị (file riêng)

Mở bằng **Excel / LibreOffice** (không cần đọc trong Cursor):

**[`SPONSOR_CHOT_FILL.xlsx`](./SPONSOR_CHOT_FILL.xlsx)**  
(Nếu file đang mở bị khóa: dùng [`SPONSOR_CHOT_FILL_v1.1.xlsx`](./SPONSOR_CHOT_FILL_v1.1.xlsx) — đủ PROP/LICH)

- Sheet **`00_Chot_Sponsor`** (v1.1 — gồm D7 · Q-* · MD-S* · **PROP-03d/03e/05b** · **LICH-ATT** · UI · chữ ký)
- Chỉ gõ vào cột **vàng**: **G** (Quyết định), **H** (Ghi chú), **I** (Ngày)
- Cột G có **dropdown** chọn sẵn
- Sheet **`Huong_dan`** — cách dùng
- **18 dòng MISSING:** sheet **`02b`** trong `WBS_HRM_ENTERPRISE_UC_CHOT.xlsx` (hoặc bảng §4.1 trong `W3_PAPER_PACKET_SPONSOR.md`)
- Chi tiết từng UC «Lịch»: `W3_PAPER_PACKET_SPONSOR.md` §5.1 (nếu cần từng dòng ngoài LICH-ATT)

### Cách 2 — cùng file WBS chốt workshop

**[`WBS_HRM_ENTERPRISE_UC_CHOT.xlsx`](./WBS_HRM_ENTERPRISE_UC_CHOT.xlsx)**  
→ sheet đầu **`00_Chot_Sponsor`** (cùng nội dung cột vàng)

---

## Không điền vào đâu?

| File | Lý do |
|------|--------|
| `WBS_HRM_ENTERPRISE_KHACH_MOI.xlsx` | WBS hạng mục / pointer — **không** phải phiếu Q-* |
| File `.md` này | Chỉ hướng dẫn đường dẫn |

---

## Sau khi điền

1. **Save** Excel  
2. Báo PM hoặc gửi lại file  
3. Team cập nhật gap matrix / SRS theo cột G  

---

## File liên quan

| File | Việc |
|------|------|
| [`DECISION_PACKET_Q_PAY_FORMULA.md`](./DECISION_PACKET_Q_PAY_FORMULA.md) | Chi tiết Q-PAY-FORMULA |
| [`MASTER_DATA_CONFIG_CLASSIFICATION.md`](./MASTER_DATA_CONFIG_CLASSIFICATION.md) | REF/CFG/TXN (team) |
| [`SPONSOR_UI_BRAND_OPEN_QUESTIONS.md`](./SPONSOR_UI_BRAND_OPEN_QUESTIONS.md) | UI brand — tư vấn ngoài |
| `_build_sponsor_chot_fill.py` | Tạo lại Excel nếu cần |

```bash
python docs/client-delivery/hrm-enterprise-blueprint/_build_sponsor_chot_fill.py
```
