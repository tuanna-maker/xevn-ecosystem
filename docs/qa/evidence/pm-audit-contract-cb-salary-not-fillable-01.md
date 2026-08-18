# PM Audit — "Lương đóng BH" read-only, không có nơi điền khi hợp đồng mới hoàn toàn

- **work_item_id:** PM-AUDIT-CTR-CB-SALARY-NOT-FILLABLE-01
- **Ngày:** 2026-08-12
- **Nguồn:** Sponsor phản ánh trực tiếp qua browser thật (màn `/hr/contracts` → "Thêm hợp đồng") + đối chiếu file khách hàng gửi `docs/từ khách hàng/2026.08.07. Hợp đồng mẫu X.E.xlsx`.

## 1. Hiện trạng đã verify

`ContractCbReadOnlyCard.tsx` hiển thị 3 field: **Lương cơ bản**, **Lương đóng BH**, **Tỉ lệ hưởng lương** — cả 3 đều **read-only**, lấy từ `snapshot.compensation_snapshot` (API `contract-legal-print.service.ts`). Khi nhân viên **mới hoàn toàn chưa từng có gói C&B** (`employee_compensation_packages` — SoT đã sealed ở `PO-HRM-MVP-GD1-CORE-02-CLUSTER-DATA-01`, QC `CORE02QC1-MSL80DU6`), snapshot rỗng → cả 3 ô hiện `—`, **không có cách nào điền** ngay trong màn tạo hợp đồng.

## 2. Đối chiếu file khách hàng thật

`2026.08.07. Hợp đồng mẫu X.E.xlsx` — 18 sheet, gồm:
- **`Mã NV`** (3902 dòng × 88 cột) — bảng chủ dữ liệu nhân sự thật khách đang dùng. Cột **Y = "Mức BHXH"** — **xác nhận khách hàng CÓ theo dõi field này như 1 field độc lập, tách khỏi "Mức lương" (cột AK, dùng cho HĐTV)** — đúng như sponsor nói, đây là field thật cần điền, không phải suy diễn.
- 6 sheet mẫu hợp đồng in riêng theo **loại HĐ × khối** (HĐTV/HĐLĐ 12T/24T/KXĐTH, mỗi loại có bản riêng cho Khối VP và Khối LX) — nội dung điều khoản **khác nhau thật** giữa các loại (vd. HĐTV không có "Điều 5 nghĩa vụ bồi thường chi phí đào tạo" như HĐLĐ 12T có) — xác nhận yêu cầu "dynamic theo loại hợp đồng" của sponsor có cơ sở thật trong tài liệu khách gửi, không phải cảm tính.
- **Không có sheet nào ghi "Lương đóng BH" là số tính riêng theo công thức** — khách hàng nhập tay trực tiếp cột "Mức BHXH" cùng lúc với hồ sơ nhân sự, không phải suy ra từ nơi khác.

## 3. Root cause thiết kế hiện tại (đã trace code)

- SoT lương/C&B đã được kiến trúc đúng chuẩn (`28-FE-BE-SEPARATION-DISPLAY-READY.md`): BE sở hữu `employee_compensation_packages`, contract chỉ đọc SNAPSHOT — **đúng hướng, không nên phá bằng cách cho contract dialog tự ghi đè SoT lương** (sẽ tạo dual-SoT, vi phạm R-FE-02/must_keep CORE-02).
- **Gap thật:** khi employee MỚI (chưa từng có gói C&B) → không có snapshot → dialog hợp đồng bế tắc, không dẫn người dùng đi đâu để tạo gói C&B đầu tiên. Có sẵn `EmployeeCompensationPanel.tsx` (màn Hồ sơ nhân viên → C&B) để tạo/sửa gói lương — nhưng **contract dialog không link/hướng dẫn** tới đó khi snapshot rỗng.

## 4. Việc cần làm (đề xuất — CẦN ba-process xác nhận trước khi code, đây là quyết định luồng nghiệp vụ, không phải chỉ sửa UI)

Câu hỏi cần trả lời trước khi dispatch dev:
1. Khi tạo hợp đồng đầu tiên cho nhân viên chưa có gói C&B — HR phải **bắt buộc tạo gói C&B trước** (redirect/CTA rõ ràng sang `EmployeeCompensationPanel`, block "Lưu" hợp đồng cho tới khi có), hay **cho phép nhập lương ngay trong dialog hợp đồng và hệ thống tự tạo gói C&B đầu tiên từ đó** (khớp quy trình thực tế khách hàng đang làm trên Excel — nhập lương cùng lúc hồ sơ)?
2. Field "Mức BHXH" (Lương đóng BH) trong dữ liệu khách — có luôn bằng "Lương cơ bản" hay có thể khác (lương đóng BH thấp hơn lương thực nhận, tình huống phổ biến ở VN)? Cần xác nhận qua thêm dữ liệu mẫu trong sheet `Mã NV` (cột AK "Mức lương" vs cột Y "Mức BHXH" — nếu 2 cột này khác giá trị ở cùng 1 dòng nhân viên thì xác nhận đây là 2 field độc lập thật).
3. Danh sách 6 loại hợp đồng theo khối (VP/LX) khác điều khoản — hệ thống catalog `loại hợp đồng` hiện có đang generic, cần kiểm tra template composer (`PO-HRM-SETTINGS-CTR-TPL-COMPOSER-FE-01`) đã có đủ 6 mẫu này chưa hay chỉ mới có khung chọn điều khoản chung.

**Chưa dispatch dev-fe/dev-be cho việc này** — dispatch `ba-process` trước để trả lời 3 câu trên, tránh code sai hướng nghiệp vụ (đúng tinh thần `02-SPEC-FIRST-GATE.md`).

## 5. Ghi chú thêm — không verify được câu hỏi 2 từ data mẫu

Đã thử quét cột Y ("Mức BHXH") và AK ("Mức lương") trong sheet `Mã NV` (500 dòng đầu) — **0 dòng có dữ liệu ở 1 trong 2 cột này** (bảng chủ yếu là khung/template, dữ liệu thật thưa). Không đủ căn cứ tự kết luận 2 field có luôn bằng nhau hay không từ file này — ba-process cần hỏi sponsor trực tiếp hoặc tìm nguồn dữ liệu khác nếu có.
