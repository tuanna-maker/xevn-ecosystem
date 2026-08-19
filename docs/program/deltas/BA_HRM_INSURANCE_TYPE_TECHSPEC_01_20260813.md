# TechSpec — Technical Specification for Wave 5: Insurance Types & Rates

| Meta | Value |
|---|---|
| work_item_id | BA-HRM-INSURANCE-TYPE-TECHSPEC-01 |
| ref_srs | [BA_HRM_INSURANCE_TYPE_SRS_01_20260813.md](file:///C:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/docs/program/deltas/BA_HRM_INSURANCE_TYPE_SRS_01_20260813.md) |
| Architecture Decision | **Option (a) Approved**: Sử dụng cơ chế `si_insurance_type` và `pay_insurance_rate_cfg` |
| Scope | Group/Holding Ref + Tenant Local Extension |
| Ngày | 2026-08-13 |
| Trạng thái | CONFIRMED — Enterprise Grade Standard |

---

## 1. Phân tích Luật Bảo hiểm Xã hội Việt Nam (Mới nhất)

Wave 5 cấu hình 5 khoản trích nộp bảo hiểm bắt buộc theo Nghị định & Luật BHXH:

| Mã loại bảo hiểm | Tên bảo hiểm | Tỷ lệ Doanh nghiệp (%) | Tỷ lệ Người lao động (%) | Tổng trích nộp (%) |
|---|---|---|---|---|
| `INS_BHXH` | Bảo hiểm xã hội | 17.0% | 8.0% | 25.0% |
| `INS_BHYT` | Bảo hiểm y tế | 3.0% | 1.5% | 4.5% |
| `INS_BHTN` | Bảo hiểm thất nghiệp | 1.0% | 1.0% | 2.0% |
| `INS_KPCD` | Kinh phí công đoàn | 2.0% | 0.0% | 2.0% |
| `INS_BHTNLN` | Bảo hiểm TNLĐ - BNN | 0.5% | 0.0% | 0.5% |
| **TỔNG CỘNG** | **5 Khoản bắt buộc** | **23.5%** | **10.5%** | **34.0%** |

---

## 2. Quy tắc Tính toán Thuế & Lương Gross/Net (Business Rules)

1. **Rule INS-01 (Mức trần đóng BHXH):** Mức lương làm căn cứ đóng BHXH/BHYT tối đa bằng 20 lần mức lương cơ sở do Chính phủ quy định (VD: $20 \times 2.340.000 = 46.800.000$ VNĐ).
2. **Rule INS-02 (Mức trần BHTN):** Mức lương đóng BHTN tối đa bằng 20 lần mức lương tối thiểu vùng do Chính phủ quy định theo từng địa bàn (Vùng I: $20 \times 4.960.000 = 99.200.000$ VNĐ).
3. **Rule INS-03 (Khấu trừ thuế TNCN):** Khoản trích nộp BHXH, BHYT, BHTN của Người lao động ($10.5\%$) được trừ khỏi thu nhập chịu thuế TNCN.
