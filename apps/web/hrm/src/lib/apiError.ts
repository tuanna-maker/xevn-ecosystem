type ApiErrorPayload = {
  code?: string;
  message?: string;
  details?: unknown;
  status?: number;
};

const friendlyByCode: Record<string, string> = {
  "HRM-TIMEOUT":
    "Hết thời gian chờ phản hồi từ server. Kiểm tra kết nối mạng hoặc thử tải lại trang.",
  "HRM-AUTH-001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  "HRM-AUTH-002": "Bạn không có quyền thực hiện thao tác này.",
  "HRM-VAL-001": "Dữ liệu gửi lên chưa hợp lệ.",
  /** ATT-02 / BR-BP-SHF-02 — mixed mode or bands overlap. */
  "HRM-VAL-400":
    "Cấu hình phạt muộn không hợp lệ (lẫn chế độ hoặc bảng mức chồng). Chọn đúng một mode rồi thử lại.",
  "HRM-DATA-404": "Không tìm thấy dữ liệu yêu cầu.",
  "HRM-USER-001": "Không thể xử lý tài khoản người dùng.",
  "HRM-ATT-001": "Không thể tạo bản ghi chấm công. Vui lòng kiểm tra dữ liệu đầu vào.",
  "HRM-ATT-404": "Không tìm thấy bản ghi chấm công cần cập nhật.",
  "HRM-PAY-001": "Khoảng ngày kỳ lương chưa hợp lệ (ngày bắt đầu phải <= ngày kết thúc).",
  "HRM-PAY-002": "Kỳ lương bị trùng với kỳ đã tồn tại.",
  "HRM-PAY-404": "Không thể xử lý kỳ lương do trạng thái hiện tại không hợp lệ hoặc không tồn tại.",
  "HRM-PAY-405": "Không thể khóa kỳ lương do chưa ở trạng thái đã xử lý.",
  /** UC-BP-PAY-01 — bind draft/submitted or process without closed sheet (BR-BP-TS-03). */
  "HRM-PAY-ATT-412":
    "Bảng chấm công chưa chốt hoặc không khớp kỳ lương. Chốt bảng công (ATT-11) rồi gắn lại — không lấy giờ từ đơn phép/OT.",
  "HRM-PAY-INP-409-DUP": "Kỳ lương đã gắn bảng công này.",
  /** F-PAY-PAYSLIP-01 ESS — token thiếu employee_id hoặc cross-employee. */
  "HRM-PAY-403-ESS":
    "Phiếu lương cá nhân chỉ dành cho tài khoản gắn hồ sơ nhân viên. Không xem hoặc xác nhận phiếu của người khác.",
  "HRM-PAY-409-ESS": "Phiếu lương chưa sẵn sàng xác nhận — kỳ chưa được xử lý.",
  "RATE-429": "Hệ thống đang giới hạn tần suất truy cập (429). Vui lòng đợi vài giây rồi Thử lại.",
  "SHEET-400": "File import không hợp lệ hoặc thiếu tham số kind.",
  "SHEET-408": "Xử lý file vượt quá thời gian cho phép trên máy chủ.",
  "SHEET-413": "File hoặc dữ liệu vượt quá giới hạn kích thước/số dòng.",
  "SHEET-415": "Định dạng file không được hỗ trợ cho import.",
  "SHEET-422": "Dữ liệu import không thỏa điều kiện nghiệp vụ (xem chi tiết từng dòng).",
  "SCOPE_TENANT_REQUIRED": "Thiếu tenant trong phạm vi yêu cầu.",
  "SCOPE_COMPANY_REQUIRED": "Thiếu công ty trong phạm vi yêu cầu.",
  "SCOPE_TENANT_INVALID": "Tenant không hợp lệ.",
  "SCOPE_COMPANY_INVALID": "Công ty không hợp lệ.",
  "SCOPE_CONTEXT_MISMATCH": "Phạm vi tenant/công ty không khớp phiên đăng nhập.",
  "HRM-REC-WF-LOCKED":
    "Đang chạy quy trình phê duyệt — duyệt trên Inbox; không đổi giai đoạn/trạng thái trực tiếp.",
  "HRM-REC-WF-SPAWN-MISSING":
    "Không tạo được quy trình phê duyệt. Kiểm tra mẫu QT trên XBOS rồi gửi lại.",
  "HRM-REC-WF-STAGE-UNMAPPED": "Bước quy trình chưa gắn với giai đoạn tuyển dụng.",
  /** FR-HRM-INT-01 Diễn biến #5 — chốt hired thiếu mã hồ sơ. */
  "HRM-REC-HIRE-400":
    "Chốt tuyển cần gắn hồ sơ nhân viên. Chọn hoặc tạo hồ sơ cùng đơn vị rồi thử lại.",
  /** FR-HRM-INT-01 Diễn biến #4 — hồ sơ khác đơn vị. */
  "HRM-REC-HIRE-409":
    "Hồ sơ nhân viên và ứng viên không cùng đơn vị — không thể chốt tuyển.",
  /** UC-BP-REC-07 / F-REC-HIRE-01 — offer-ready gate (PO-HRM-MVP-GD1-REC-07-CLUSTER-FE-01). */
  "HRM-REC-HIRE-OFFER-INVALID":
    "Ứng viên chưa đủ điều kiện chấp nhận offer (chưa offer-ready hoặc neo YCTD không rõ). Không tạo hồ sơ mới.",
  "HRM-REC-HIRE-CANCELLED":
    "Offer đã hủy — hệ thống không tạo hồ sơ nhân sự mới. Kiểm tra lý do hủy trên UV–YCTD.",
  "HRM-REC-HIRE-PREFILL-FAIL":
    "Thiếu dữ liệu bắt buộc từ UV/YCTD (họ tên hoặc đơn vị) — không tạo hồ sơ. Bổ sung trên UV rồi thử lại.",
  "HRM-REC-HIRE-DUP":
    "Xung đột liên kết hồ sơ (đã gắn nhân viên khác). Không tạo hồ sơ thứ hai — kiểm tra soft link hiện có.",
  /** O11 — REC ↛ PAY. */
  "HRM-REC-PAY-403":
    "Không gửi payload lương/payslip từ bước chấp nhận offer. Hoàn thiện hồ sơ và HĐ trước khi payroll.",
  /** UC-BP-CORE-01 / F-CORE-EMP-01 — C&B keys on public PATCH/POST (PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01). */
  "HRM-CORE-CB-403":
    "Không được gửi hoặc sửa field mật (lương / tài khoản ngân hàng / MST / BHXH) trên hồ sơ công khai. Dùng vòng C&B (HĐ–BH).",
  /** UC-BP-CORE-02 / F-CORE-EMP-02 — thiếu quyền mở/sửa vòng mật (≠ public CB-403). */
  "HRM-CORE-CB-AUTHZ-403":
    "Bạn không đủ quyền xem hoặc sửa vòng mật C&B (lương / NH / MST). Cần membership view_salary / C&B.",
  "HRM-CORE-CB-VAL-400":
    "Dữ liệu C&B chưa hợp lệ (thiếu ngày hiệu lực, số tiền, định dạng NH/MST, hoặc đổi mức BH phải qua actions change_rate).",
  "HRM-COMP-409-OVERLAP":
    "Khoảng hiệu lực gói đãi ngộ bị chồng hoặc kỳ đã khóa. Chọn ngày hiệu lực khác rồi lưu lại.",
  "HRM-CORE-CB-OVERLAP-409":
    "Khoảng hiệu lực gói đãi ngộ bị chồng hoặc kỳ đã khóa. Chọn ngày hiệu lực khác rồi lưu lại.",
  "HRM-SI-ACTION-400":
    "Không thực hiện được hành động BH (đổi mức / tạm hoãn / ngừng / đóng / tiếp tục). Kiểm tra ngày hiệu lực; tạm hoãn bắt buộc có căn cứ (suspend_reason).",
  "ACTION-400":
    "Không thực hiện được hành động BH — thiếu ngày hiệu lực hoặc căn cứ tạm hoãn (ACTION-400).",
  "HRM-CORE-PUB-VAL-400":
    "Dữ liệu hồ sơ công khai chưa hợp lệ. Kiểm tra họ tên, mã nhân viên và các trường hành chính rồi thử lại.",
  "HRM-CORE-DEP-VAL-400":
    "Thiếu họ tên, quan hệ hoặc ngày sinh người phụ thuộc (bắt buộc cho phúc lợi / quà 1/6). Bổ sung rồi lưu lại.",
  "HRM-CORE-DEP-404":
    "Không tìm thấy người phụ thuộc (đã xóa mềm hoặc không thuộc hồ sơ này).",
  /** UC-BP-CORE-08 / F-CORE-RD-01 — KT/KL VAL (PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01). */
  "HRM-CORE-RD-VAL-400":
    "Dữ liệu khen thưởng / kỷ luật chưa hợp lệ (thiếu tiêu đề, số tiền không hợp lệ, hoặc có số tiền mà thiếu kỳ lương đích).",
  "HRM-CORE-RD-ENFORCE-409":
    "Không thể thi hành — chưa gắn kỳ lương khi có số tiền, hoặc trạng thái không hợp lệ để thi hành.",
  "HRM-CORE-RD-DUAL-PERIOD-409":
    "Một khoản khen thưởng / kỷ luật không được gắn hai kỳ lương đang mở. Chọn một kỳ rồi thử lại.",
  "HRM-CORE-RD-LOCKED-PERIOD-409":
    "Kỳ lương đã khóa — không sửa hoặc hủy thi hành ảnh hưởng phiếu lương đã chốt.",
  "HRM-CORE-RD-EMP-INACTIVE-409":
    "Nhân viên không ở trạng thái Hoạt động — không tạo hoặc thi hành khen thưởng / kỷ luật.",
  "HRM-CORE-RD-PERIOD-404":
    "Không tìm thấy kỳ lương đích trong phạm vi đơn vị (hoặc kỳ không còn mở/điều chỉnh).",
  "HRM-CORE-RD-404":
    "Không tìm thấy bản ghi khen thưởng / kỷ luật (đã hủy hoặc ngoài phạm vi).",
  /** FR-UC-BP-REC-06a Diễn biến #2 — một lịch đang hiệu lực/candidate (≠ soft-gate · ≠ PAST · ≠ CANCEL-REASON). */
  "HRM-REC-IV-409-ACTIVE":
    "Ứng viên đã có lịch phỏng vấn đang hiệu lực. Hãy hủy hoặc đổi lịch hiện tại trước khi tạo lịch mới.",
  /** VAL-REC-CNS-05 / O5 — stage allows_interview_schedule=false (≠ 409 ACTIVE). */
  "HRM-REC-IV-400-STAGE-DISALLOW":
    "Giai đoạn hiện tại không cho phép lên lịch phỏng vấn. Bật cờ «Cho phép lịch PV» trên Cài đặt → Giai đoạn REC, hoặc chuyển ứng viên sang giai đoạn cho phép.",
  /** Legacy alias — same VI as STAGE-DISALLOW; keep distinct from 409 ACTIVE. */
  "HRM-REC-IV-STAGE-DENY":
    "Giai đoạn hiện tại không cho phép lên lịch phỏng vấn. Bật cờ «Cho phép lịch PV» trên Cài đặt → Giai đoạn REC, hoặc chuyển ứng viên sang giai đoạn cho phép.",
  /** O7 / VAL-REC-IV-03 — past datetime when CFG block. */
  "HRM-REC-IV-400-PAST-DATETIME":
    "Ngày giờ phỏng vấn không được ở quá khứ theo chính sách đơn vị. Chọn thời điểm hiện tại hoặc tương lai.",
  /** O6 / VAL-REC-IV-06 — cancel reason required when CFG on. */
  "HRM-REC-IV-400-CANCEL-REASON":
    "Đơn vị yêu cầu nhập lý do hủy lịch phỏng vấn. Vui lòng nhập lý do rồi thử lại.",
  /** VAL-REC-IV-09 / R06 — illegal status or R-A on non-ACTIVE. */
  "HRM-REC-IV-400-INVALID-TRANSITION":
    "Không thể chuyển trạng thái hoặc đổi lịch trên bản ghi này (đã kết thúc hoặc chuyển không hợp lệ).",
  /** FR-HRM-AT-10 Diễn biến #5 — chồng lịch nghỉ (409). */
  "HRM-LEAVE-VAL-OVERLAP":
    "Khoảng ngày trùng với đơn nghỉ đang chờ duyệt hoặc đã duyệt. Chọn ngày khác rồi gửi lại.",
  /** FR-HRM-AT-10 Diễn biến #6 — hết phép khi theo dõi số dư (400). */
  "HRM-LEAVE-VAL-BALANCE":
    "Không đủ số dư phép cho loại nghỉ này. Giảm số ngày hoặc chọn loại khác.",
  "HRM-ATT-SIGN-INCOMPLETE":
    "Chưa đủ các bước ký bắt buộc (NV, quản lý trực tiếp, HCNS). Hoàn tất xác nhận trước khi chốt.",
  "HRM-ATT-SHEET-STATE":
    "Bảng công chưa ở trạng thái chờ ký — không thể ký hoặc chốt trên bản nháp.",
  "HRM-ATT-SHEET-LOCKED": "Bảng công đã chốt — không thể ký thêm.",
  /** FR-UC-BP-REC-02 Diễn biến 1d — bind/preview JD không Hiệu lực. */
  "HRM-JD-YCTD-STATUS":
    "JD đã chọn không còn Hiệu lực (Nháp/Ngừng). Chọn JD Hiệu lực khác từ thư viện.",
  /** FR-UC-BP-REC-02 Diễn biến 1b/#2 — thiếu tham chiếu JD bắt buộc. */
  "HRM-JD-YCTD-REQUIRED":
    "Bắt buộc chọn JD Hiệu lực từ thư viện trước khi lưu yêu cầu tuyển dụng.",
  /** FR-UC-BP-REC-02 — JD ngoài phạm vi / không tồn tại. */
  "HRM-JD-YCTD-NOT-FOUND": "Không tìm thấy JD trong phạm vi công ty hiện tại.",
  /** UC-BP-REC-00 O4 / P05 — UQ (company_id, code). */
  "HRM-JD-CODE-DUP":
    "Mã JD trùng trong pháp nhân này. Đổi mã rồi lưu lại.",
  /** UC-BP-REC-00 O3 / P01 — publish thiếu required-on-layout. */
  "HRM-REC-JD-PUB-REQUIRED":
    "Thiếu trường bắt buộc trên bố cục hiệu lực — không thể phát hành. Bổ sung rồi thử Phát hành lại.",
  /** UC-BP-REC-00 O3 / P02 — publish khi layout trống. */
  "HRM-REC-JD-PUB-LAYOUT-EMPTY":
    "Bố cục JD đang trống — không thể phát hành. Kéo nhóm / chọn chức danh để có bố cục rồi thử lại.",
  /** UC-BP-REC-00 O3 — publish khi không còn Nháp. */
  "HRM-REC-JD-PUB-STATE":
    "Chỉ phát hành được bản Nháp. Bản này không còn ở trạng thái Nháp.",
  "HRM-REC-JD-POS":
    "Chức danh không thuộc danh mục hiệu lực. Chọn lại từ catalog chức danh.",
  "HRM-JD-LAYOUT-EMPTY":
    "Bố cục JD trống — thêm nhóm luôn bật hoặc nhóm tùy chọn trước khi lưu.",
  "HRM-REC-JD-RETIRED-LOCKED":
    "JD đã Ngừng — không chỉnh nội dung. Tạo bản Nháp mới nếu cần thay thế.",
  "HRM-REC-JD-REACTIVATE-HOLD":
    "Phục hồi JD Ngừng → Hiệu lực chưa hỗ trợ trên MVP. Tạo bản Nháp mới rồi Phát hành.",
  "HRM-REC-JD-BRIDGE":
    "Trạng thái JD và cờ hiệu lực không khớp. Tải lại trang rồi thao tác lại.",
  /** UC-BP-REC-08 Dashboard period VAL (API-01 §8). */
  "HRM-REC-DASH-PERIOD-400":
    "Kỳ lọc không hợp lệ. Chọn năm hoặc khoảng từ tháng–đến tháng (yyyy-MM), from ≤ to.",
  "HRM-REC-DASH-VAL-400": "Tham số bảng điều khiển tuyển không hợp lệ.",
  "HRM-REC-DASH-METHOD-405": "Bảng điều khiển tuyển chỉ hỗ trợ xem (GET).",
  /** Scope mismatch — U19 / VAL-02. */
  "HRM-SCOPE-409": "Đơn vị lọc không khớp phạm vi đăng nhập. Chọn lại đơn vị trong quyền.",
  /** UC-BP-REC-02/02b Wave-2 YCTD tokens (API-01 §8). */
  "HRM-YCTD-MODE-REQUIRED":
    "Bắt buộc chọn trong định biên hoặc ngoài định biên trước khi lưu/gửi duyệt.",
  "HRM-YCTD-CELL-MISSING":
    "YCTD trong định biên cần gắn mã ô Cần tuyển đã duyệt.",
  "HRM-YCTD-CELL-NOT-APPROVED":
    "Ô định biên chưa ở trạng thái Cần tuyển đã duyệt — chọn ô khác hoặc duyệt định biên trước.",
  "HRM-YCTD-CELL-PLAN-NOT-APPROVED":
    "Kế hoạch định biên chưa duyệt — không gắn YCTD trong ĐB vào ô này.",
  "HRM-YCTD-CELL-QTY":
    "Số lượng vượt ô định biên — không thể giữ Trong ĐB. Chuyển sang Ngoài định biên và nhập lý do, hoặc giảm số lượng.",
  "HRM-YCTD-OUT-REASON":
    "YCTD ngoài định biên bắt buộc nhập lý do vượt / phát sinh.",
  "HRM-YCTD-HIRE-REASON":
    "Bắt buộc chọn lý do tuyển (mới hoặc thay thế). Thay thế cần chọn nhân viên được thay.",
  "HRM-YCTD-MATRIX-MISMATCH":
    "Ma trận duyệt không khớp nhánh trong/ngoài định biên. Kiểm tra cấu hình quy trình XBOS.",
  "HRM-YCTD-BOD-REQUIRED":
    "Ngoài định biên cần duyệt BOD trước khi mở nhận hồ sơ / đăng tin.",
  "HRM-YCTD-NOT-RECEIVABLE":
    "YCTD chưa mở nhận hồ sơ (open_for_hire). Hoàn tất duyệt rồi thử lại.",
  "HRM-YCTD-MODE-UNCLASSIFIED":
    "YCTD legacy chưa phân loại trong/ngoài định biên — chọn chế độ và lưu trước khi nhận hồ sơ.",
  "HRM-YCTD-SPAWN-DUP":
    "Ô này đã có YCTD trong định biên — không tạo trùng (spawn UQ).",
  "HRM-YCTD-VAL-400": "Dữ liệu YCTD không hợp lệ. Kiểm tra lý do từ chối và các trường bắt buộc.",
  /** UC-BP-REC-04 / F-REC-CV-SCAN — Quét kho nội bộ (≠ UV-YCTD · ≠ 0-hits done). */
  "HRM-REC-CV-SCAN-REQUIRED":
    "Chưa quét kho nội bộ hoặc bỏ qua có lý do — không bật «Đã đăng tin» (kênh ngoài GĐ1).",
  "HRM-REC-CV-SCAN-SKIP-REASON":
    "Bỏ qua quét bắt buộc nhập lý do. Điền lý do rồi xác nhận lại.",
  "HRM-REC-CV-SCAN-FORBIDDEN":
    "Bạn không đủ quyền bỏ qua quét kho (chỉ HR tuyển dụng / Trưởng bộ phận trong phạm vi).",
  "HRM-REC-CV-SCAN-YCTD":
    "YCTD chưa mở nhận hồ sơ (open_for_hire) — không bắt đầu quét kho trên yêu cầu này.",
  "HRM-REC-CV-SCAN-ALREADY":
    "YCTD đã có vết quét — chính sách hiện tại chặn quét lại. Kiểm tra cờ pipeline.",
  /** FR-UC-BP-REC-05a #5 — thiếu YCTD bắt buộc. */
  "HRM-REC-UV-YCTD-REQUIRED":
    "Bắt buộc chọn yêu cầu tuyển dụng (YCTD) trước khi lưu ứng viên.",
  /** FR-UC-BP-REC-05a #3 — YCTD không còn nhận hồ sơ. */
  "HRM-REC-UV-YCTD-STATUS":
    "YCTD đã chọn không còn nhận hồ sơ. Chọn yêu cầu đang mở/duyệt khác.",
  /** FR-UC-BP-REC-05a — YCTD ngoài phạm vi / không tồn tại. */
  "HRM-REC-UV-YCTD-NOT-FOUND": "Không tìm thấy yêu cầu tuyển dụng trong phạm vi hiện tại.",
  /** FR-UC-BP-REC-05a #4 — position_key lệch YCTD. */
  "HRM-REC-UV-POSITION-MISMATCH":
    "Vị trí không khớp YCTD đã chọn — vị trí lấy từ yêu cầu tuyển, không nhập chữ tự do.",
  /** FR-UC-BP-REC-06b #5 — so sánh vượt max-N. */
  "HRM-REC-CMP-MAX-N":
    "Chỉ có thể so sánh tối đa số ứng viên cho phép trên cùng một yêu cầu tuyển dụng.",
  /** FR-UC-BP-REC-06b · BR-BP-REC-CMP-01 — trộn UV hai YCTD. */
  "HRM-REC-CMP-YCTD-MIX":
    "Không thể so sánh ứng viên thuộc hai yêu cầu tuyển dụng khác nhau. Chọn lại trong cùng một YCTD.",
  /** UC-BP-CORE-09a / F-CORE-CTR-CL — thư viện điều khoản (PO-HRM-MVP-GD1-CORE-09A-CLUSTER-FE-01). */
  "HRM-CTR-CL-REQUIRED":
    "Thiếu mã, tiêu đề hoặc nội dung điều khoản. Bổ sung code / title_vi / body_vi rồi lưu.",
  "HRM-CTR-CL-CODE-CONFLICT":
    "Điều khoản đã gắn bản HĐ phát hành — không ghi đè nội dung tại chỗ. Bấm «Tăng phiên bản» (Hiệu lực) để activate bump; HĐ cũ giữ snapshot bất biến.",
  "HRM-CTR-CL-404": "Không tìm thấy điều khoản trong phạm vi đơn vị hiện tại.",
  /** FR-UC-BP-CORE-09a · VAL-PUB — group library publish/pull/apply. */
  "HRM-CTR-PUB-EMPTY":
    "Chưa có mẫu hoặc điều khoản hiệu lực tại tập đoàn để phát hành. Kích hoạt ít nhất một TPL/CL rồi thử lại.",
  "HRM-CTR-PUB-FORBIDDEN": "Chỉ vai trò cấu hình tập đoàn được phát hành thư viện hợp đồng.",
  "HRM-CTR-PUB-NOT-FOUND": "Không tìm thấy phiên bản phát hành đã chọn.",
  "HRM-CTR-PUB-RETIRED": "Phiên bản phát hành đã ngừng — không kéo mới được.",
  "HRM-CTR-PUB-CODE-CONFLICT":
    "Mã điều khoản/mẫu nội bộ thành viên trùng với gói tập đoàn. Đổi mã nội bộ hoặc chọn lineage khác.",
  "HRM-CTR-PUB-NOTHING-TO-APPLY":
    "Chưa có bản nháp tập đoàn để áp dụng. Hãy Kéo gói trước, rồi Áp dụng.",
  /** FR-09d DYNAMIC LOCK — format/FK only; never «not in starter 8». */
  "HRM-CTR-TPL-CODE-INVALID":
    "Mã mẫu không hợp lệ (định dạng / mã không tồn tại hoặc chưa hiệu lực). Không bị chặn vì «ngoài 8 mẫu starter».",
  "HRM-CTR-TPL-PACK-MISMATCH":
    "Gói nghề không khớp ma trận mẫu (IT_OFFICE / DRIVER cho ma trận X.E, hoặc pack đã cấu hình).",
  /** UC-BP-CORE-09b / F-CORE-CTR-PREV — 0 active template (AC-CTR-PRINT-01). */
  "HRM-CTR-TPL-NONE":
    "Chưa có mẫu HĐ hiệu lực. Mở Cài đặt → Điều khoản HĐ / Mẫu theo loại, kích hoạt ít nhất một mẫu rồi xem trước lại.",
  "HRM-CTR-PACK-INVALID":
    "Gói nghề không hợp lệ. Chọn Chung · IT/văn phòng · Lái xe (MVP) rồi thử lại.",
  "HRM-CTR-TERM-INVALID":
    "Loại thời hạn / thời lượng mẫu không hợp lệ (thử việc · xác định · không xác định).",
  "HRM-CTR-DRIVER-REQUIRED":
    "Gói Lái xe cần đủ GPLX (số, hạng, ngày cấp, nơi cấp) và biển số xe trước khi phát hành bản in.",
  /** UC-BP-CORE-09c / F-CORE-CTR-VER — issue gate + PDF snapshot (PO-HRM-MVP-GD1-CORE-09C-CLUSTER-FE-01). */
  "HRM-CTR-ISSUE-BLOCKED":
    "Chưa đủ điều kiện ban hành bản in (thiếu field hoặc điều khoản bắt buộc). Bổ sung theo danh sách thiếu rồi lưu phiên bản lại.",
  "HRM-CTR-VERSION-NOT-ISSUED":
    "Chỉ tải PDF từ phiên bản đã phát hành (issued). Bản nháp/đã thay thế không xuất PDF từ snapshot.",
  "HRM-CTR-PV-404":
    "Không tìm thấy phiên bản in trong phạm vi đơn vị (đã xóa hoặc ngoài scope).",
  "HRM-CTR-RENDER-FAIL":
    "Máy chủ không tạo được file PDF từ snapshot đã khóa. Thử lại hoặc báo Dev-BE (không tự ghép PDF từ thư viện live).",
  /** Platform MergeToken — F-PLT-TOK · format-only (không «ngoài starter N»). */
  "HRM-PLT-CAT-CODE-INVALID":
    "Mã catalog không hợp lệ (định dạng slug chữ cái đầu + a-zA-Z / số / _). Không bị chặn vì «ngoài danh sách starter».",
  "HRM-PLT-CAT-CODE-CONFLICT":
    "Đã có mã catalog active trùng trong đơn vị. Dùng upsert hoặc đổi mã.",
  "HRM-EMP-DOC-TYPE-UNKNOWN":
    "Loại giấy tờ không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Loại giấy tờ EMP.",
  "HRM-EMP-DOC-404": "Không tìm thấy loại giấy tờ trong phạm vi đơn vị hiện tại.",
  /** UC-BP-CORE-03 / F-CORE-CHK-01 — checklist instance (PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01). */
  "HRM-CORE-CHK-VAL-400":
    "Dữ liệu checklist không hợp lệ (trạng thái / trường bắt buộc). Kiểm tra rồi lưu lại — chưa ghi.",
  "HRM-CORE-CHK-CONFLICT-409":
    "Đã có dòng checklist active cùng mã loại giấy tờ trên hồ sơ này. Dùng dòng hiện có hoặc ẩn (soft-archive) trước.",
  "HRM-CORE-CHK-404":
    "Không tìm thấy dòng checklist / hồ sơ trong phạm vi đơn vị (đã ẩn hoặc ngoài scope).",
  /** UC-BP-CORE-05 / F-CORE-AST-01 · F-CORE-AST-BB-01 (PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01). */
  "HRM-EMP-ASSET-SERIAL-CONFLICT":
    "Số serial đang được cấp phát (Đang sử dụng) cho bản ghi khác trong phạm vi. Đổi serial hoặc thu hồi bản ghi cũ trước.",
  "HRM-EMP-ASSET-DELETE-FORBIDDEN":
    "Không xóa cứng bản ghi đã cấp phát. Dùng Thu hồi (đổi trạng thái) để giữ lịch sử cho CORE-06.",
  "HRM-EMP-ASSET-VAL-400":
    "Dữ liệu tài sản chưa hợp lệ (thiếu tên, ngày, hoặc trường bắt buộc). Kiểm tra rồi lưu lại.",
  "HRM-EMP-PROFILE-400":
    "Dữ liệu hồ sơ / cấp phát chưa hợp lệ. Kiểm tra rồi lưu lại.",
  "HRM-EMP-PROFILE-404":
    "Không tìm thấy bản ghi tài sản / hồ sơ trong phạm vi đơn vị (đã xóa hoặc ngoài scope).",
  /** UC-BP-CORE-07 / F-CORE-ACT-01 — activate gate (PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01). */
  "HRM-EMP-ACT-CHECKLIST-INCOMPLETE":
    "Checklist giấy tờ bắt buộc chưa đủ (còn mục chưa xác nhận hoặc còn mục chặn kích hoạt). Hoàn tất tab Giấy tờ rồi thử lại — trạng thái chưa đổi.",
  "HRM-EMP-ACT-400":
    "Thiếu hoặc sai ngày hiệu lực kích hoạt (dd/MM/yyyy). Chọn ngày hợp lệ rồi thử lại — trạng thái chưa đổi.",
  "HRM-EMP-ET-UNKNOWN":
    "Loại hình thuê không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Loại hình thuê EMP.",
  "HRM-EMP-ET-404": "Không tìm thấy loại hình thuê trong phạm vi đơn vị hiện tại.",
  /** F-DEC-CAT / VAL-DEC-CNS — open decision-type catalog. */
  "HRM-DEC-TYPE-UNKNOWN":
    "Loại quyết định không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Loại quyết định DEC.",
  "HRM-DEC-TYP-404": "Không tìm thấy loại quyết định trong phạm vi đơn vị hiện tại.",
  "HRM-DEC-TYP-WH-REQUIRED":
    "Không thể ngừng loại quyết định ghi WH duy nhất khi còn đường WH mở. Gán loại WH khác trước.",
  "HRM-PLT-TOKEN-UNKNOWN": "Thiếu token bắt buộc theo chính sách resolve nghiêm ngặt.",
  "HRM-PLT-SCHEMA-INVALID":
    "Cấu trúc token/schema không hợp lệ (ví dụ cú pháp #token# kép — GĐ1 chỉ dùng {{token}}).",
  "HRM-PLT-TOK-404": "Không tìm thấy merge token trong phạm vi đơn vị hiện tại.",
  "HRM-ATT-LVT-404": "Không tìm thấy loại phép trong phạm vi đơn vị hiện tại.",
  "HRM-LEAVE-TYPE-UNKNOWN":
    "Loại phép không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo loại phép trong Cài đặt → Loại phép ATT.",
  /** UC-BP-ATT-01 / F-ATT-SHIFT-CNS-01 — invent-ban when Nest active>0 (PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01). */
  "HRM-ATT-SHIFT-KEY":
    "Mã ca không thuộc danh mục Nest hiệu lực. Chọn ca từ danh sách hoặc tạo trong Chấm công → Danh sách ca.",
  "HRM-WS-VAL": "Dữ liệu ca làm việc không hợp lệ. Kiểm tra mã, giờ bắt đầu/kết thúc rồi lưu lại.",
  "HRM-WS-404": "Không tìm thấy ca làm việc trong phạm vi đơn vị hiện tại.",
  "HRM-WS-409": "Xung đột ca làm việc (mã trùng hoặc trạng thái không cho phép). Kiểm tra rồi thử lại.",
  /** UC-BP-ATT-03d / F-ATT-PUNCH-01 — geofence OOS (PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01). */
  "HRM-ATT-GEO-001":
    "Ngoài vùng GPS cho phép. Đứng trong bán kính điểm hiệu lực hoặc cập nhật danh mục điểm GPS.",
  /** UC-BP-ATT-03d — GPS method thiếu lat/lon (cấm silent 2xx). */
  "HRM-ATT-GEO-REQ":
    "Thiếu tọa độ GPS. Bật vị trí / gửi vĩ độ·kinh độ — không im lặng thành công.",
  "HRM-ATT-SITE-VAL": "Dữ liệu điểm GPS không hợp lệ. Kiểm tra tên, tọa độ, bán kính rồi Lưu lại.",
  "HRM-ATT-SITE-404": "Không tìm thấy điểm GPS trong phạm vi đơn vị hiện tại.",
  /** UC-BP-ATT-08 / F-ATT-LEAVE-01 — thiếu lịch lễ năm → CHẶN NỘP (PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01). */
  "HRM-LEAVE-HOL-MISSING":
    "Thiếu lịch lễ năm — không thể nộp đơn nghỉ. Cập nhật lịch lễ đơn vị rồi thử lại.",
  /** UC-BP-ATT-03b / F-ATT-HOL-01 — năm chưa có lịch (thin GET) — mở admin Lịch lễ / Tết. */
  "HRM-ATT-HOL-404":
    "Chưa có lịch lễ năm này. Mở Cài đặt → Lịch lễ / Tết để khai ngày rồi Lưu (thin ≠ ATT-03b DONE).",
  /**
   * ATT-08 ALIGN inflate — prefer leaveAlignInflateMessage() when details present;
   * this string is fallback only (HRM-VAL-400 also used by ATT-02 late-penalty).
   */
  "HRM-LEAVE-ALIGN-INFLATE":
    "Số ngày nộp không khớp ngày trừ quỹ engine — không dùng calendar làm trừ quỹ (BR-BP-LV-05).",
  /** F-SI-CAT / VAL-SI-CNS — open insurance-type catalog (AC-PLT-SI-INS-01b · E3 AC-INS-03). */
  "HRM-INS-TYPE-KEY":
    "Loại bảo hiểm không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Loại BH / SI type.",
  "HRM-SI-INS-TYPE-UNKNOWN":
    "Loại bảo hiểm không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Loại BH / SI type.",
  "HRM-SI-INS-TYPE-404": "Không tìm thấy loại bảo hiểm trong phạm vi đơn vị hiện tại.",
  /** F-SI-CAT-INS / VAL-SI-INR-CNS — open insurer catalog (AC-PLT-SI-INSURER-01b · E3 AC-INS-02). */
  "HRM-INS-INSURER-KEY":
    "Nhà bảo hiểm không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Nhà BH / Insurers.",
  "HRM-SI-INSURER-UNKNOWN":
    "Nhà bảo hiểm không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo trong Cài đặt → Nhà BH / Insurers.",
  "HRM-SI-INSURER-404": "Không tìm thấy nhà bảo hiểm trong phạm vi đơn vị hiện tại.",
  /** F-REC-CAT / APP-02 — open pipeline-stage catalog (AC-PLT-REC-04). */
  "HRM-REC-STAGE-UNKNOWN":
    "Giai đoạn không thuộc catalog hiệu lực. Chọn mã từ danh sách hoặc tạo giai đoạn trong Cài đặt → Giai đoạn REC.",
  /** F-REC-APP-02 — UC-BP-REC-05 reject / reverse / empty (PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01). */
  "HRM-REC-STAGE-REJECT-REASON":
    "Từ chối / rút hồ sơ bắt buộc nhập lý do. Nhập lý do rồi lưu lại — trạng thái chưa đổi.",
  "HRM-REC-STAGE-REVERSE-FORBIDDEN":
    "Không được đảo chiều giai đoạn pipeline (CFG tắt). Chọn giai đoạn tiến tới hoặc bật cho phép đảo chiều.",
  "HRM-REC-STAGE-EMPTY-CATALOG":
    "Chưa có giai đoạn pipeline hiệu lực. Tạo mã tại Cài đặt → Giai đoạn REC (không seed) rồi thử lại.",
  "HRM-REC-STAGE-HISTORY-FAIL":
    "Không ghi được lịch sử trạng thái — giai đoạn chưa đổi. Thử lại hoặc liên hệ quản trị.",
  "HRM-REC-STAGE-WF-LOCKED":
    "Hồ sơ đang khóa quy trình — không đổi giai đoạn tay trên UV–YCTD này.",
  /** F-REC-MAIL-01 — UC-BP-REC-06 (PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01). */
  "HRM-REC-MAIL-CC-REQUIRED":
    "Mẫu mời phỏng vấn bắt buộc CC email người phỏng vấn. Thêm CC rồi gửi lại — thư chưa xếp hàng gửi.",
  "HRM-REC-MAIL-TEMPLATE-INACTIVE":
    "Mẫu thư không hiệu lực hoặc không thuộc catalog đơn vị. Chọn mẫu khác rồi thử lại.",
  "HRM-REC-MAIL-NEO-REQUIRED":
    "Gửi thư phải gắn UV–YCTD (Lane A). Gắn yêu cầu tuyển trước khi gửi thư theo mẫu.",
  "HRM-REC-MAIL-VAL-400":
    "Dữ liệu thư chưa hợp lệ (địa chỉ nhận / nội dung). Kiểm tra rồi gửi lại.",
  "HRM-REC-MAIL-404": "Không tìm thấy bản ghi thư trong phạm vi đơn vị hiện tại.",
  "HRM-REC-MAIL-PROVIDER-FAIL":
    "Gửi thư thất bại — hệ thống giữ trạng thái failed/nháp và không đổi giai đoạn pipeline.",
  /** F-REC-APP-03 UPGRADE — Pass/Fail neo YCTD. */
  "HRM-REC-EVAL-PASSFAIL-REQUIRED":
    "Chốt đánh giá bắt buộc chọn Đạt (Pass) hoặc Không đạt (Fail). Không để nháp/pending làm DONE.",
  "HRM-REC-EVAL-NEO-REQUIRED":
    "Đánh giá FR-06 phải neo UV–YCTD. Không dùng hồ sơ kho CV thuần làm SoT điểm.",
  "HRM-REC-EVAL-ROUND-GATE":
    "Còn lịch phỏng vấn đang hiệu lực hoặc vòng trước chưa kết thúc. Hủy/hoàn tất lịch trước khi chốt đánh giá vòng mới.",
  "HRM-REC-EVAL-LEGACY-READONLY":
    "Bản đánh giá cũ (pool) chỉ đọc — không sửa như FR-06. Tạo đánh giá mới trên UV–YCTD.",
  "HRM-REC-EVAL-404": "Không tìm thấy đánh giá trong phạm vi đơn vị hiện tại.",
  "HRM-REC-STG-404": "Không tìm thấy giai đoạn pipeline trong phạm vi đơn vị hiện tại.",
  "HRM-REC-STG-HIRED-DUP":
    "Đã có một giai đoạn «kết quả tuyển» (hired-outcome) active trong đơn vị. Ngừng hoặc đổi cờ giai đoạn cũ trước.",
  "HRM-REC-STG-HIRED-REQUIRED":
    "Không thể ngừng giai đoạn hired-outcome duy nhất khi còn đường chốt tuyển mở. Gán hired-outcome khác trước.",
  /** F-PAY-FORMULA — dual-control / immutable / preview stub (không claim LIVE). */
  "HRM-PAY-FORMULA-403-DUAL":
    "Phát hành dual-control: người soạn và người phát hành phải khác nhau. Đăng nhập tài khoản kỹ thuật khác rồi thử lại.",
  "HRM-PAY-FORMULA-409-IMMUTABLE":
    "Bản công thức đã khóa (không phải bản nháp). Tạo phiên bản mới để chỉnh sửa — không sửa tại chỗ bản hiệu lực.",
  "HRM-PAY-FORMULA-409-STATE":
    "Trạng thái công thức không cho phép thao tác này. Kiểm tra bản nháp / chờ phát hành rồi thử lại.",
  "HRM-PAY-FORMULA-CODE-INVALID":
    "Mã công thức không hợp lệ (slug a-z, số, gạch dưới). Không bị chặn vì «ngoài danh sách starter».",
  "HRM-PAY-FORMULA-CODE-CONFLICT":
    "Đã có công thức cùng mã và phiên bản trong đơn vị. Đổi mã hoặc tạo phiên bản mới.",
  "HRM-PAY-FORMULA-412-VARS":
    "Thiếu biến bắt buộc (DV-18) hoặc biến ngoài allow-list ATT/C&B. Bổ sung biến rồi gửi phát hành lại.",
  "HRM-PAY-FORMULA-412-PREVIEW-STUB":
    "Xem trước đang ở chế độ stub (evaluator chưa LIVE · thiếu dòng bảng công đóng). Đây không phải kết quả lương thật — payroll_e2e_ready=false.",
  "HRM-PAY-FORMULA-412":
    "Kỳ lương chưa gắn công thức đã phát hành (active). Chọn bản hiệu lực rồi xử lý kỳ.",
  "HRM-PAY-FORMULA-404": "Không tìm thấy công thức lương trong phạm vi đơn vị hiện tại.",
  "HRM-SC-COMP-KEY":
    "Mã thành phần lương không có trong danh mục Nest hiệu lực — chọn lại từ picker (AC-PAY-COMP-01).",
};

export class ApiClientError extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(payload: ApiErrorPayload) {
    super(payload.message || "Có lỗi xảy ra khi gọi API.");
    this.name = "ApiClientError";
    this.code = payload.code;
    this.status = payload.status;
    this.details = payload.details;
  }
}

/** True for fetch abort / navigation cancel — not user-facing failures. */
export function isAbortLikeError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof Error) {
    const name = error.name?.toLowerCase() ?? "";
    const message = error.message?.toLowerCase() ?? "";
    if (name === "aborterror") return true;
    if (message.includes("aborted") || message.includes("abort")) return true;
  }
  return false;
}

/** Enrich BALANCE toast with available/requested days when BE returns details. */
function leaveBalanceMessage(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as { available_days?: unknown; requested_days?: unknown };
  const available = Number(d.available_days);
  const requested = Number(d.requested_days);
  if (!Number.isFinite(available) || !Number.isFinite(requested)) return null;
  return `Không đủ số dư phép. Còn ${available} ngày, yêu cầu ${requested} ngày.`;
}

/**
 * ATT-08 ALIGN — HRM-VAL-400 with deductible_units details (≠ ATT-02 late-penalty VAL-400).
 * Detect calendar inflate reject from BE createLeaveRequest.
 */
function leaveAlignInflateMessage(error: {
  code?: string;
  message?: string;
  details?: unknown;
}): string | null {
  const msg = String(error.message ?? "");
  const inflateHint =
    /calendar inflate|deductible_units|BR-BP-LV-05|does not match engine/i.test(msg);
  let client: number | null = null;
  let engine: number | null = null;
  if (error.details && typeof error.details === "object") {
    const d = error.details as Record<string, unknown>;
    const c = Number(d.total_days ?? d.totalDays);
    const e = Number(d.deductible_units ?? d.deductibleUnits);
    if (Number.isFinite(c)) client = c;
    if (Number.isFinite(e)) engine = e;
  }
  const hasEngineDetails = client != null && engine != null;
  if (!inflateHint && !(error.code === "HRM-VAL-400" && hasEngineDetails)) {
    return null;
  }
  if (client != null && engine != null) {
    return `Số ngày nộp (${client}) không khớp ngày trừ quỹ engine (${engine}). Không dùng calendar làm trừ quỹ (BR-BP-LV-05 · ALIGN).`;
  }
  return "Số ngày nộp không khớp ngày trừ quỹ engine — không dùng calendar làm trừ quỹ (BR-BP-LV-05 · ALIGN).";
}

export function toErrorMessage(error: unknown, fallback: string) {
  if (isAbortLikeError(error)) {
    return friendlyByCode["HRM-TIMEOUT"];
  }

  if (error instanceof ApiClientError) {
    if (error.code === "HRM-LEAVE-VAL-BALANCE") {
      const enriched = leaveBalanceMessage(error.details);
      if (enriched) return enriched;
    }
    const alignMsg = leaveAlignInflateMessage(error);
    if (alignMsg) return alignMsg;
    if (error.code && friendlyByCode[error.code]) return friendlyByCode[error.code];
    if (error.status === 429) return friendlyByCode["RATE-429"];
    return error.message || fallback;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as {
      message?: string;
      code?: string;
      status?: number;
      details?: unknown;
    };
    if (candidate.code === "HRM-LEAVE-VAL-BALANCE") {
      const enriched = leaveBalanceMessage(candidate.details);
      if (enriched) return enriched;
    }
    const alignMsg = leaveAlignInflateMessage(candidate);
    if (alignMsg) return alignMsg;
    if (candidate.code && friendlyByCode[candidate.code]) return friendlyByCode[candidate.code];
    if (candidate.status === 429) return friendlyByCode["RATE-429"];
    if (candidate.message) return candidate.message;
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
