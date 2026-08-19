# PO-HRM-REC-HEADCOUNT-PLAN-TESTCASES-01.md — RECRUITMENT HEADCOUNT PLAN TESTCASE SPECIFICATION
## TÀI LIỆU QUY CHUẨN KỊCH BẢN KIỂM THỬ GIAO DIỆN & TÍNH NĂNG ĐỊNH BIÊN TUYỂN DỤNG

---

## 1. NGUYÊN TẮC KIỂM THỬ BẮT BUỘC (TESTING PRINCIPLES)

1. **FE-First Real User Interactions (Luồng kiểm thử từ FE ➔ BE real endpoint):**
   - Mọi kịch bản test **BẮT BUỘC** xuất phát từ thao tác thực tế của người dùng trên giao diện FE (DOM Events: click nút Xóa, gõ phím ô nhập, mở Modal).
   - **CẤM NGHIÊM NGẠC** test dựa trên Fake API hay Mock Data ảo làm sai lệch kết quả trải nghiệm thực tế của người dùng.
2. **UI/UX Visual Inspection Verification:**
   - Không xuất hiện nút mũi tên tăng/giảm (`spin-button`) góc phải ô nhập số.
   - Các ô nhập tháng không hiện sẵn số `0` thừa mứa.
   - Popup Modal mở rộng đầy đủ (`max-w-[95vw] w-[1450px]`), không bị đè hay cắt xén nội dung.

---

## 2. MA TRẬN KỊCH BẢN KIỂM THỬ (TESTCASE MATRIX)

| Mã TestCase | Tên Kịch Bản | Thao Tác Kiểm Thử Trên FE | Kết Quả Kỳ Vọng (Expected Outcome) | Trạng Thái |
|-------------|--------------|---------------------------|-------------------------------------|------------|
| **TC-FE-REC-HC-01** | Xóa Vị trí trong Kế hoạch | Bấm nút Thùng rác đỏ (`Trash2`) bên cạnh Tên vị trí | Hàng vị trí bị xóa hoàn toàn khỏi DOM (không tự động khôi phục row rỗng) | **PASS** |
| **TC-FE-REC-HC-02** | Xóa Phòng ban trong Kế hoạch | Bấm nút Thùng rác đỏ (`Trash2`) bên cạnh Tên phòng ban | Khối phòng ban và các vị trí con bị xóa khỏi DOM | **PASS** |
| **TC-FE-REC-HC-03** | Ô nhập số không hiện sẵn `0` | Mở Popup Tạo định biên tuyển dụng | Ô nhập số các tháng rỗng sạch sẽ (`""`), không pre-fill số `0` | **PASS** |
| **TC-FE-REC-HC-04** | Gõ số trên ô nhập tháng | Gõ phím số `3` vào ô nhập Tháng 1 | Ô hiển thị `3`, xóa phím trở về rỗng `""` | **PASS** |
| **TC-FE-REC-HC-05** | Không hiện nút mũi tên tăng/giảm | Kiểm tra trực quan ô nhập số | 100% ô nhập số không có spin button arrows | **PASS** |
| **TC-FE-REC-HC-06** | Popup rộng thoáng không cắt xén | Mở Popup Tạo định biên | Modal mở rộng `1450px`, 12 tháng hiển thị đầy đủ không bị che | **PASS** |
| **TC-FE-REC-HC-07** | Thêm Vị trí mới | Bấm `+ Thêm vị trí` | Thêm 1 hàng vị trí mới với ô chọn vị trí rỗng | **PASS** |
| **TC-FE-REC-HC-08** | Thêm Phòng ban mới | Bấm `+ Thêm phòng ban` | Thêm 1 khối phòng ban mới ở cuối lưới | **PASS** |

---

## 3. THAM CHIẾU QUY TRÌNH & MÃ NGUỒN (TRACEABILITY)

- **SRS Document**: `docs/program/specs/PO-HRM-EMP-PROFILE-CATALOG-SRS-01.md`
- **TechSpec Document**: `docs/program/specs/PO-HRM-EMP-PROFILE-CATALOG-TECHSPEC-01.md`
- **UIUX Spec Document**: `docs/program/specs/PO-HRM-TEMPLATE-BUILDER-UIUX-SPEC-01.md` §9 (`BR-UI-NUMERIC-INPUT-NO-TYPE-NUMBER-01`)
- **Source Files**: `apps/web/hrm/src/pages/Recruitment.tsx`
