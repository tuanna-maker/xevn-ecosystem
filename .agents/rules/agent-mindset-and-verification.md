# Agent Mindset & Verification Protocol (Zero-Regression)

Đây là quy tắc tối cao về **Mindset** và **Cơ chế rà soát** áp dụng cho mọi Agent trước, trong và sau khi viết code, nhằm chấm dứt tình trạng lặp lại các lỗi sơ đẳng (như mất code do `git checkout`, script replace thất bại mà không check lại, quên rule UI/UX).

## 1. MINDSET CỐT LÕI (PRE-CODE)
- **Tuyệt đối không lười biếng / phỏng đoán:** Trước khi sửa bất kỳ file nào, bắt buộc phải dùng `grep_search` hoặc `view_file` để ĐỌC TRẠNG THÁI HIỆN TẠI của file đó. Trạng thái ở session trước đó có thể không phản ánh đúng hiện tại (do chưa commit).
- **Tuyệt đối cẩn trọng với các lệnh rollback (`git checkout`, `git reset`):** Trước khi chạy các lệnh này, PHẢI kiểm tra `git status` và `git diff` để biết chính xác mình sắp vứt bỏ những dòng code nào. Không bao giờ chạy rollback "mù".
- **Không giả định Script/Tool luôn thành công:** Nếu dùng Node script với `replace` hoặc các công cụ sửa code tự động, KHÔNG ĐƯỢC mặc định là nó đã chạy đúng dù không quăng lỗi.

### 1.1 Quy trình Nghiệp vụ & Trạng thái Khóa (Spec Lock & Locked States)
- **Tuyệt đối không đoán mò:** Trước khi chỉnh sửa bất kỳ logic nghiệp vụ nào, bắt buộc phải tra cứu tài liệu đặc tả `docs/brand-new-documents-20270801/` (SRS, TechSpec, UIUX Spec).
- **Đồng bộ trạng thái khóa (Read-Only Parity):** Nếu một thực thể được Backend quy định là không thể sửa đổi khi ở trạng thái nhất định (Ví dụ: chính sách `status = ACTIVE` sẽ ném lỗi 409 Conflict ở API), thì Frontend PHẢI khóa chỉnh sửa tương ứng (disabled các ô input, select, ẩn nút Lưu/Xóa) và hiển thị cảnh báo hướng dẫn người dùng rõ ràng. Không được để giao diện mở nhưng API chặn lại.

### 1.2 Định dạng Số tiền & Tiền tệ (VND Money Inputs)
- **Cấm tự viết định dạng thủ công:** Không bao giờ tự viết logic format số tiền bằng `Intl.NumberFormat` inline kết hợp với `type="text"` hoặc `type="number"` thô sơ. Điều này sẽ phá vỡ bộ đệm (buffer) của các bộ gõ tiếng Việt (Telex, VNI) gây nhân đôi ký tự.
- **Tái sử dụng linh hồn hệ thống:** Bắt buộc sử dụng component chuyên biệt [ViMoneyInput](file:///c:/Users/ADMIN/OneDrive/Ta%CC%80i%20li%C3%AA%CC%A3u/Vibe%20Coding/projects/xevn-ecosystem/apps/web/hrm/src/components/ui/ViMoneyInput.tsx) có sẵn để xử lý cơ chế ngăn chặn IME conflict.

## 2. QUY TRÌNH RÀ SOÁT TRƯỚC KHI CODE (PRE-FLIGHT CHECKLIST)
Trước khi đưa ra bất kỳ thay đổi nào:
1. [ ] **Đọc hiểu Spec & Ý định của User:** Yêu cầu này nằm ở Component nào? Màn hình nào? (Ví dụ: Modal con hay là Full-page?).
2. [ ] **Đọc mã nguồn thực tế:** Xác minh xem code thực tế đang viết gì, biến nào đang được truyền vào.
3. [ ] **Cross-Check API Contract:** Nếu liên quan đến dữ liệu, gọi thẳng API bằng `curl` hoặc `Invoke-RestMethod` để XEM THẬT SỰ CẤU TRÚC JSON LÀ GÌ (là Object `{ data: [] }` hay là Array `[]`). TUYỆT ĐỐI KHÔNG TỰ SUY DIỄN cấu trúc.

## 3. QUY TRÌNH RÀ SOÁT SAU KHI CODE (POST-FLIGHT VERIFICATION)
Sau khi chạy tool sửa code / ghi file:
1. [ ] **Verify lại file đã sửa:** Chạy lệnh `Get-Content` hoặc `view_file` ở đúng dòng vừa sửa để MẮT NHÌN THẤY thay đổi đã thực sự được lưu vào file. (Đặc biệt với regex/replace).
2. [ ] **Check Error Log / Terminal:** Xem tiến trình Vite/NestJS có văng lỗi compile hay linting error nào không. Không được báo cáo hoàn thành nếu terminal đang đỏ rực.
3. [ ] **Tự đánh giá UX/UI:** Nút bấm có thiếu không? (Có Lưu thì phải có Đóng/Hủy). Bố cục có bị vỡ không? Component có tái sử dụng đúng chuẩn không?

*Bất cứ Agent nào khi nhận Task từ User, phải tự lẩm nhẩm lại checklist này. Việc "Tôi tưởng...", "Tôi quên..." là không thể chấp nhận được.*
