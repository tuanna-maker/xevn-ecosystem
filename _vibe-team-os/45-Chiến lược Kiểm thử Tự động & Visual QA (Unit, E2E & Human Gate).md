# 45 — Chiến lược Kiểm thử Tự động & Visual QA (Unit, E2E & Human Gate)

**Ban hành:** 2026-08-17
**Mục đích:** Hợp nhất tư duy kiểm thử từ `31` và `33` thành một quy trình thực thi vật lý. Xác định bộ công cụ chuẩn (Playwright, Jest), phân lớp trách nhiệm (Dev làm Unit, AI viết E2E Script, QA/QC soi UI/UX) và nghiêm cấm tuyệt đối các hành vi "Fake/Mock" trên môi trường UAT.
**Liên kết:** `31-WORLD-STANDARD-TEST-LOG.md` · `33-TESTCASE-VS-REPORT-VS-UNIT.md`

---

## 1. Mô hình Kiểm thử 3 Lớp (The 3-Tier Testing Pyramid)

Thay vì chỉ viết Testcase trên giấy, mọi dự án phải được bảo vệ bởi 3 lớp kiểm thử sau:

### Lớp 1: Unit Test (Mã tự động của Dev)
*   **Công cụ:** `Jest` (cho Backend/NestJS) hoặc `Vitest` (cho Frontend/React).
*   **Nhiệm vụ:** Chứng minh quy tắc nghiệp vụ (BR) trong Service/DTO là đúng.
*   **Luật:** Dev phải viết Unit Test bám sát *Unit Test Plan*. Unit Test chỉ test logic tính toán, KHÔNG thay thế việc test trên trình duyệt[cite: 10]. Dev không được đẩy sang QA nếu chưa có Unit Test Xanh (Covered)[cite: 10].

### Lớp 2: Auto E2E Test (Kịch bản trình duyệt tự động)
*   **Công cụ lõi:** `Playwright` (Microsoft). Đây là tool mạnh nhất hiện nay, tự động mở Chrome/Safari, click, gõ phím và chụp ảnh màn hình như một người dùng thật.
*   **Nhiệm vụ:** Tự động hóa các luồng Happy Path và Fail-deep từ Master Catalog[cite: 10].
*   **Luật "3 KHÔNG":**
    1.  **KHÔNG Fake API:** Playwright phải chạy trên giao diện Frontend đã kết nối với Backend thật và DB thật[cite: 10]. Không được mock/seed data giả để lừa hệ thống[cite: 10].
    2.  **KHÔNG Hardcode:** Script phải móc vào các thẻ HTML bằng `data-testid`, không dùng XPath dễ vỡ.
    3.  **KHÔNG Quên Log:** Playwright sẽ được cấu hình để tự động sinh ra file `.json` và báo cáo HTML đúng chuẩn ISO 29119-3 mà File 31 yêu cầu mỗi khi chạy xong.

### Lớp 3: Visual & UX QA (Chốt chặn Thị giác của Con người)
*   **Công cụ:** Mắt người (QA/QC) + Playwright Trace Viewer.
*   **Nhiệm vụ:** Máy móc không biết thế nào là "xấu". QA/QC có trách nhiệm chạy test bằng tay (hoặc quan sát màn hình lúc Playwright đang chạy) để bắt các lỗi UI/UX.

---

## 2. Tiêu chuẩn Visual QA (Chốt chặn của QA/QC)

QA/QC tuyệt đối không được đánh `PASS` chỉ vì "Lưu thành công vào DB". Trước khi log vào bảng IEEE 829[cite: 9], QA/QC phải kiểm tra:

1.  **Lỗi Tràn viền & Cắt chữ (Overflow/Truncation):** Nhập dữ liệu dài bất thường (Ví dụ: Tên công ty 200 ký tự). Chữ có bị co rúm lại không đọc được, hay tràn đè lên cái nút bên cạnh không?
2.  **Lỗi Che khuất (Z-Index):** Mở một cái Popup/Dropdown, nó có bị cái Header hay một cái Popup khác đè lên che mất không?
3.  **Lỗi Cuộn chuột (Scroll & Responsive):** Thu nhỏ màn hình trình duyệt lại. Form nhập liệu có hiện thanh cuộn không, hay bị mất hẳn nút "Xác nhận" ở dưới đáy màn hình?

> **Quy trình xử lý:** Nếu vướng 1 trong 3 lỗi trên, QA/QC phải **chụp ảnh màn hình (hoặc cắt video từ Playwright), khoanh đỏ, và Assign thẳng lại cho Dev-FE** yêu cầu fix UI. Cấm châm chước "chức năng chạy được là được".

---

## 3. Quy trình AI viết Script Playwright từ Testcase (Dành cho PM/QA)

Để biến các Testcase trên giấy thành Script Playwright tự động, PM/QA không cần tự code. Hãy dùng Cursor/Claude theo quy trình sau:

1. **Chuẩn bị đầu vào:** Mở file `docs/qa/testcases/...` có chứa các bước thao tác (Steps) và kỳ vọng (Expected)[cite: 10].
2. **Giao việc cho Agent:** Nạp đoạn Prompt sau (Dựa trên template Dispatch của File 33[cite: 10]):
   ```text
   Mission: Viết script Playwright E2E cho luồng "Tạo Hóa Đơn".
   Read_first: File Testcase TC-INV-01 đến TC-INV-05.
   Rules:
   - KHÔNG fake API, phải tương tác với DOM thật qua `data-testid`.
   - Script phải chờ API response trả về 201/200 rồi mới expect UI thay đổi. Không dùng `waitForTimeout`.
   - Cấu hình tự động chụp Screenshot nếu test `FAIL`.
   - Ghi log kết quả (Start time, End time, Status) ra file JSON chuẩn XeVN[cite: 9].