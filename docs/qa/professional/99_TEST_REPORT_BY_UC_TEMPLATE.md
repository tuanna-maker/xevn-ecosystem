# Mẫu Test Report theo Use Case (chuyên nghiệp)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-PRO-TR-BY-UC-TPL-01` |
| **Dùng khi** | Đã **chạy** test (giai đoạn B) — **không** dùng để giả tiến độ thiết kế |
| **Khác report cũ** | Rollup theo **UC → Nghiệp vụ → Chức năng → TC**, không chỉ list TC-ID |

---

## 1. Executive (1 bảng)

| UC | Nghiệp vụ (#) | Chức năng (#) | TC thiết kế | Đã chạy | PASS | FAIL | BLOCKED | SPEC_GAP | % chạy |
|----|---------------:|--------------:|------------:|--------:|-----:|-----:|--------:|---------:|-------:|
| FR-H03 Leave | 8 | 20 | 39 | 0 | 0 | 0 | 0 | 2 | 0% |
| FR-B03 Rec+WF | 9 | 28 | 56 | 0 | 0 | 0 | 0 | 0 | 0% |
| ATT ESS | 6 | 12 | 27 | 0 | 0 | 0 | 0 | 0* | 0% |

\* LOCK XBOS đếm riêng, không tính PASS.

**UAT DONE:** chỉ khi Sponsor định nghĩa D3 + mọi P0 PASS — mặc định **false**.

---

## 2. Chi tiết theo UC (lặp cho mỗi UC)

### UC: … 

#### 2.1 Theo nghiệp vụ

| Cap-ID | Nghiệp vụ | TC thiết kế | Chạy | PASS | FAIL | BLOCKED | Ghi chú |
|--------|-----------|------------:|-----:|-----:|-----:|--------:|---------|
| CAP-… | … | | | | | | |

#### 2.2 Theo chức năng (P0)

| FN-ID | Chức năng | TC-IDs | Kết quả lần chạy | Evidence / Test Log |
|-------|-----------|--------|------------------|---------------------|
| FN-… | … | TC-… | PASS/FAIL/… | path U78 |

#### 2.3 Lỗi / residual

| ID | Severity | Cap/FN | Mô tả | Owner |
|----|----------|--------|-------|-------|

---

## 3. Luồng E2E (giai đoạn B — tách section)

Khi Sponsor yêu cầu test **luồng tổng thể**, thêm:

| Flow-ID | Ghép các UC/FN | Mục tiêu | TC compose | Kết quả |
|---------|----------------|----------|------------|---------|
| E2E-HIRE-TO-PAY | REC caps 01→08 | Hire-to-Pay | dãy HP | |
| E2E-LEAVE-L1 | LEAVE create→approve→balance | Nghỉ L1 | dãy HP | |
| E2E-… | (mở rộng tư duy) | | | |

**Không** thay thế §2 (đủ chức năng trong từng UC).

---

*Template — copy sang `docs/qa/reports/` khi bắt đầu execution wave.*
