/**
 * Chuẩn hóa văn phong BRD/SRS khách: tiếng Việt thuần, không câu Anh–Việt lẫn.
 * Không thay thế trong khối ```mermaid / ``` — giữ nguyên loop, opt, participant, v.v.
 */

/** Thay thế theo thứ tự dài → ngắn — KHÔNG đụng từ khóa Mermaid */
export const BRD_VIETNAMESE_REPLACEMENTS = [
  ['không đọc được snapshot tenant khác', 'không đọc được bản dữ liệu của công ty khác'],
  ['Phạm vi tenant:', 'Phạm vi theo công ty:'],
  ['Đồng bộ danh mục XBOS → HRM theo tenant', 'Đồng bộ danh mục XBOS → HRM theo từng công ty'],
  ['Phát hành theo tenant', 'Phát hành theo từng công ty'],
  ['(Master tenant)', '(đơn vị chủ — tập đoàn)'],
  ['Master tenant', 'đơn vị chủ (tập đoàn)'],
  ['Governance danh mục HRM', 'Quản trị danh mục HRM'],
  ['Governance mở rộng', 'Quản trị mở rộng danh mục'],
  ['công ty / tenant được gán', 'công ty được phân quyền'],
  ['công ty / tenant', 'công ty được phân quyền'],
  ['phạm vi tenant', 'phạm vi công ty'],
  ['theo tenant', 'theo công ty'],
  ['tenant công ty', 'công ty con'],
  ['HR tại tenant', 'HR tại công ty'],
  ['HRM (tenant A)', 'HRM (công ty A)'],
  ['snapshot có hiệu lực', 'bản chụp dữ liệu có hiệu lực'],
  ['Ghi snapshot + checksum', 'Ghi bản chụp dữ liệu và mã kiểm tra toàn vẹn'],
  ['Ghi snapshot', 'Ghi bản chụp dữ liệu'],
  ['snapshot + checksum', 'bản chụp dữ liệu và mã kiểm tra toàn vẹn'],
  ['target + phạm vi công ty', 'phân hệ đích và phạm vi công ty'],
  ['target + phạm vi tenant', 'phân hệ đích và phạm vi công ty'],
  ['gán target HRM', 'gán cho phân hệ Nhân sự'],
  ['target HRM', 'phân hệ đích Nhân sự'],
  ['Phiên bản active (checksum)', 'Phiên bản đang hiệu lực (mã kiểm tra toàn vẹn)'],
  ['Gán catalog →', 'Gán danh mục →'],
  ['catalog → phân hệ đích Nhân sự', 'danh mục → phân hệ đích Nhân sự'],
  ['→ API đồng bộ', '→ đồng bộ qua dịch vụ'],
  ['chạy workflow', 'chạy quy trình'],
  ['khởi chạy workflow', 'khởi chạy quy trình'],
  ['Định nghĩa workflow', 'Định nghĩa quy trình'],
  ['phiên** workflow', 'phiên quy trình'],
  ['phiên workflow', 'phiên quy trình'],
  ['workflow (nếu', 'quy trình (nếu'],
  ['workflow (bước', 'quy trình (bước'],
  ['workflow loại', 'quy trình loại'],
  ['Pilot: workflow', 'Thử nghiệm: quy trình'],
  ['Workflow Engine', 'Bộ máy quy trình'],
  ['XBOS Workflow', 'XBOS — quy trình'],
  ['đúng `tenantId` + `companyId`', 'đúng công ty được phân quyền'],
  ['**một** catalog hoặc', '**một** danh mục hoặc'],
  ['payload theo tenant/công ty', 'dữ liệu trả về theo công ty'],
  ['UC-XBOS (config-sync)', 'UC-XBOS (đồng bộ cấu hình)'],
  ['+ checksum;', '+ mã kiểm tra toàn vẹn;'],
  ['+ checksum', '+ mã kiểm tra toàn vẹn'],
  ['checksum;', 'mã kiểm tra toàn vẹn;'],
  ['API / Web HRM', 'Dịch vụ / Cổng HRM'],
  ['API XBOS', 'Dịch vụ XBOS'],
  ['form nhân viên, import, mobile', 'biểu mẫu nhân viên, nhập khẩu, ứng dụng di động'],
  ['**batch** trạng thái `pending`', '**lô** trạng thái chờ duyệt'],
  ['Lưu batch pending', 'Lưu lô chờ duyệt'],
  ['Tạo **batch**', 'Tạo **lô**'],
  ['trạng thái batch', 'trạng thái lô'],
  ['(catalogKey)', '(mã danh mục)'],
  ['startCatalogWorkflow (batchId, tenant A)', 'Khởi chạy quy trình danh mục (mã lô, công ty A)'],
  ['Tạo task duyệt catalog', 'Tạo tác vụ duyệt danh mục'],
  ['Cổng Web (Portal)', 'Cổng Web'],
  ['dữ liệu master', 'dữ liệu gốc'],
  ['Master và KPI', 'Dữ liệu gốc và chỉ số điều hành'],
  ['Master toàn hệ', 'Dữ liệu gốc toàn hệ'],
  ['Master tuyến', 'Dữ liệu gốc tuyến'],
  ['pilot Mobile', 'thử nghiệm ứng dụng di động'],
  ['Phase 1 & Phase 2', 'Giai đoạn 1 và Giai đoạn 2'],
  ['Lộ trình Phase 1', 'Lộ trình Giai đoạn 1'],
  ['Mã use case', 'Mã tình huống sử dụng'],
  ['go-live', 'đưa vào vận hành'],
  ['app lái xe', 'ứng dụng lái xe'],
  ['trong từng app', 'trong từng ứng dụng'],
  ['(app)', '(ứng dụng)'],
  ['đơn/booking', 'đơn/đặt chỗ'],
  ['/ booking', '/ đặt chỗ'],
  ['booking', 'đặt chỗ'],
  ['BOOKED', 'ĐÃ_ĐẶT'],
  ['Logistic Web / API', 'Cổng Logistic / Dịch vụ'],
  ['Logistic Web +', 'Cổng Logistic +'],
  ['Logistic Web', 'Cổng Logistic'],
  ['UAT pilot', 'nghiệm thu thử nghiệm'],
  ['Metadata và danh mục', 'Thông tin mô tả và danh mục'],
  ['Metadata và', 'Thông tin mô tả và'],
  ['Tenant tôi', 'Công ty tôi'],
  ['Hiển thị UI ', 'Hiển thị giao diện '],
  ['tình huống sử dụng (use case)', 'tình huống sử dụng'],
  ['use case toàn hệ', 'tình huống sử dụng toàn hệ'],
  ['use case', 'tình huống sử dụng'],
  ['| API |', '| Dịch vụ |'],
  ['| Mobile |', '| Di động |'],
  ['| Web |', '| Cổng web |'],
  ['Dữ liệu master, tính KPI', 'Dữ liệu gốc, tính chỉ số điều hành'],
  ['; UI đọc từ HRM', '; giao diện đọc từ HRM'],
  ['Pilot: quy trình', 'Thử nghiệm: quy trình'],
  ['Pilot:', 'Thử nghiệm:'],
  ['mũ RACI · assignee', 'mũ phân công · người được gán duyệt'],
  ['(catalog / leave / logistic)', '(danh mục / nghỉ phép / logistic)'],
  ['Tạo task hộp thư', 'Tạo tác vụ hộp thư'],
  ['Master data và KPI', 'Dữ liệu gốc và chỉ số điều hành'],
  ['| Web Portal |', '| Cổng web |'],
  ['| API / Web |', '| Dịch vụ / Cổng web |'],
  ['dịch vụ API', 'dịch vụ nền'],
  ['(master)', '(gốc)'],
  ['(workflow)', '(quy trình)'],
  ['hrm_catalog_extension', 'mở_rộng_danh_mục_nhân_sự'],
  ['preset…', 'mẫu sẵn…'],
  ['preset', 'mẫu sẵn'],
  ['merge vào', 'gộp vào'],
  ['SLA (', 'cam kết dịch vụ ('],
  ['tenant / công ty', 'công ty'],
  ['một tenant', 'một công ty'],
  ['tenant master', 'công ty chủ'],
  ['Mở rộng tenant mới với', 'Mở rộng công ty mới với'],
  ['master data', 'dữ liệu gốc'],
  ['Web Portal', 'Cổng web'],
  ['cổng Web Portal', 'cổng web'],
  ['workflow XBOS', 'quy trình XBOS'],
  ['| API / Mobile |', '| Dịch vụ / Di động |'],
  ['API / Mobile', 'Dịch vụ / Di động'],
  ['API thật', 'dịch vụ thật'],
  ['khi API chưa', 'khi dịch vụ chưa'],
  ['XBOS governance', 'Quản trị XBOS'],
  ['(mobile)', '(di động)'],
  ['| Tên use case |', '| Tên tình huống sử dụng |'],
  ['cổng Cổng web', 'cổng web'],
  ['Tích hợp FE', 'Tích hợp giao diện'],
  ['Command Center', 'Trung tâm điều hành'],
];

/** Thay thế bổ sung cho nội dung SRS (ngoài khối code/mermaid) */
export const SRS_VIETNAMESE_EXTRA = [
  ['App Mobile', 'Ứng dụng di động'],
  ['Cổng Web HRM', 'Cổng HRM'],
  ['Cổng Web Logistic', 'Cổng Logistic'],
  ['Cổng Web XBOS', 'Cổng XBOS'],
  ['Client tích hợp', 'Ứng dụng tích hợp'],
  ['HRM API', 'Dịch vụ HRM'],
  ['Logistic API', 'Dịch vụ Logistic'],
  ['XBOS API', 'Dịch vụ XBOS'],
  ['API Gateway', 'Cổng dịch vụ'],
  ['REQ-SRS', 'YÊU-CẦU'],
];

function applyReplacements(text, replacements) {
  let out = text;
  for (const [from, to] of replacements) {
    out = out.split(from).join(to);
  }
  return out;
}

/**
 * Áp dụng bảng thay thế chỉ trên phần ngoài ``` ... ```.
 */
export function applyVietnameseProseSkipFences(md, replacements = BRD_VIETNAMESE_REPLACEMENTS) {
  const parts = md.split(/(```[\s\S]*?```)/g); // \r\n OK inside [\s\S]
  return parts
    .map((part) => (part.startsWith('```') ? part : applyReplacements(part, replacements)))
    .join('');
}

/** @deprecated — dùng applyVietnameseProseSkipFences */
export function applyBrdVietnameseProse(md) {
  return applyVietnameseProseSkipFences(md, BRD_VIETNAMESE_REPLACEMENTS);
}

export function applySrsVietnameseProse(md) {
  let out = applyVietnameseProseSkipFences(md, BRD_VIETNAMESE_REPLACEMENTS);
  out = applyVietnameseProseSkipFences(out, SRS_VIETNAMESE_EXTRA);
  return out;
}
