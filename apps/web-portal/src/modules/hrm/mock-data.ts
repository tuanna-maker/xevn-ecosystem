import { SETTINGS_CONTROL_TEXT, SETTINGS_RADIUS_CARD } from '../../pages/command-center/settings-form-pattern';

export const HRM_TABLE_SHELL = `w-full max-w-full overflow-x-auto border border-xevn-border bg-white mt-4 ${SETTINGS_RADIUS_CARD}`;
// Không ép `min-w` để tránh layout bị "phình" khi viewport hẹp
export const HRM_TABLE_CLASS = `w-full ${SETTINGS_CONTROL_TEXT}`;

export const HRM_MOCK_RECRUITMENT = [
  {
    id: 'rc-01',
    campaign: 'Kỹ sư phần mềm Backend — Đội nền tảng',
    department: 'Công nghệ thông tin',
    need: 3,
    pipeline: 7,
    status: 'Đang tuyển',
  },
  {
    id: 'rc-02',
    campaign: 'Chuyên viên phân tích nghiệp vụ — Khối Vận hành',
    department: 'Vận hành sản xuất',
    need: 2,
    pipeline: 4,
    status: 'Đang tuyển',
  },
  {
    id: 'rc-03',
    campaign: 'Trưởng phòng Kinh doanh khu vực Miền Trung',
    department: 'Kinh doanh & Phát triển thị trường',
    need: 1,
    pipeline: 2,
    status: 'Tạm dừng',
  },
  {
    id: 'rc-04',
    campaign: 'Nhân viên hành chính — Văn phòng Hà Nội',
    department: 'Hành chính — Nhân sự',
    need: 1,
    pipeline: 9,
    status: 'Đang tuyển',
  },
  {
    id: 'rc-05',
    campaign: 'Kế toán tổng hợp — Chi nhánh Đà Nẵng',
    department: 'Tài chính — Kế toán',
    need: 1,
    pipeline: 3,
    status: 'Đã đủ chỉ tiêu',
  },
];

export const HRM_MOCK_ATTENDANCE = [
  {
    id: 'at-01',
    period: 'Tháng 03/2026',
    entity: 'Công ty TNHH XEVN Việt Nam',
    workdays: 22,
    leave: 48,
    late: 12,
    locked: 'Đã khóa kỳ',
  },
  {
    id: 'at-02',
    period: 'Tháng 03/2026',
    entity: 'Chi nhánh Hồ Chí Minh',
    workdays: 22,
    leave: 31,
    late: 8,
    locked: 'Đã khóa kỳ',
  },
  {
    id: 'at-03',
    period: 'Tháng 03/2026',
    entity: 'Nhà máy Bình Dương',
    workdays: 22,
    leave: 22,
    late: 19,
    locked: 'Mở chỉnh sửa',
  },
  {
    id: 'at-04',
    period: 'Tuần 14/2026',
    entity: 'Văn phòng Đà Nẵng',
    workdays: 5,
    leave: 6,
    late: 2,
    locked: 'Đang tổng hợp',
  },
];

export const HRM_MOCK_PAYROLL = [
  {
    id: 'pl-01',
    period: 'Kỳ lương 03/2026',
    entity: 'Công ty TNHH XEVN Việt Nam',
    gross: '12,4 tỷ ₫',
    approved: 'Đã duyệt BOD',
    payDate: '05/04/2026',
    status: 'Sẵn sàng chi',
  },
  {
    id: 'pl-02',
    period: 'Kỳ lương 03/2026',
    entity: 'Chi nhánh Hồ Chí Minh',
    gross: '4,1 tỷ ₫',
    approved: 'Chờ duyệt HRBP',
    payDate: '—',
    status: 'Nháp',
  },
  {
    id: 'pl-03',
    period: 'Thưởng Q1/2026',
    entity: 'Toàn tập đoàn',
    gross: '2,8 tỷ ₫',
    approved: 'Đã duyệt',
    payDate: '15/04/2026',
    status: 'Đang tính thuế TNCN',
  },
];

export const HRM_MOCK_CONTRACTS = [
  {
    id: 'ct-01',
    code: 'HĐLĐ-2026-0142',
    employee: 'Nguyễn Minh Tuấn',
    type: 'Không xác định thời hạn',
    start: '01/02/2024',
    end: '—',
    status: 'Hiệu lực',
  },
  {
    id: 'ct-02',
    code: 'HĐLĐ-2025-0891',
    employee: 'Trần Thị Mai Lan',
    type: 'Xác định thời hạn 36 tháng',
    start: '15/06/2025',
    end: '14/06/2028',
    status: 'Hiệu lực',
  },
  {
    id: 'ct-03',
    code: 'PL-2026-003',
    employee: 'Lê Hoàng Phúc',
    type: 'Phụ lục điều chỉnh lương',
    start: '01/03/2026',
    end: '—',
    status: 'Chờ ký số',
  },
  {
    id: 'ct-04',
    code: 'HĐLĐ-2023-0401',
    employee: 'Phạm Quốc Anh',
    type: 'Xác định thời hạn 24 tháng',
    start: '01/01/2023',
    end: '31/12/2024',
    status: 'Hết hạn — Gia hạn',
  },
];

export const HRM_MOCK_INSURANCE = [
  {
    id: 'bh-01',
    ref: 'BHXH-EMP-88421',
    employee: 'Nguyễn Minh Tuấn',
    regime: 'BHXH 17,5% / BHYT 4,5%',
    period: 'Kỳ 03/2026',
    sync: 'Đồng bộ VSSID',
  },
  {
    id: 'bh-02',
    ref: 'BHXH-EMP-88422',
    employee: 'Trần Thị Mai Lan',
    regime: 'BHXH 17,5% / BHYT 4,5%',
    period: 'Kỳ 03/2026',
    sync: 'Chờ xác nhận',
  },
  {
    id: 'bh-03',
    ref: 'BHTN-BATCH-03',
    employee: '312 nhân sự — gói hàng loạt',
    regime: 'BHTN 1%',
    period: 'Kỳ 03/2026',
    sync: 'Đã nộp',
  },
];

export const HRM_MOCK_DECISIONS = [
  {
    id: 'qd-01',
    decision_number: 'QĐ-HCNS-2026-08',
    decision_date: '18/03/2026',
    decision_type: 'Bổ nhiệm',
    title: 'Bổ nhiệm chức vụ Trưởng chi nhánh',
    employee_name: 'Nguyễn Minh Tuấn',
    employee_id: 'NV-10023',
    department: 'Chi nhánh Đà Nẵng',
    position: 'Trưởng chi nhánh',
    effective_date: '01/04/2026',
    expiry_date: '31/03/2029',
    signer_name: 'Trần Văn Long',
    signer_position: 'Tổng Giám đốc',
    signing_date: '18/03/2026',
    status: 'Đã ban hành',
    content: 'Căn cứ vào năng lực chuyên môn và nhu cầu phát triển của công ty, nay quyết định bổ nhiệm ông Nguyễn Minh Tuấn giữ chức vụ Trưởng chi nhánh Đà Nẵng. Ông Tuấn có trách nhiệm điều hành toàn bộ hoạt động kinh doanh tại khu vực miền Trung, báo cáo trực tiếp cho Tổng Giám đốc.',
    note: 'Kèm theo phụ lục mô tả công việc'
  },
  {
    id: 'qd-02',
    decision_number: 'QĐ-HCNS-2026-07',
    decision_date: '10/03/2026',
    decision_type: 'Kỷ luật',
    title: 'Cảnh cáo vi phạm nội quy an toàn lao động',
    employee_name: 'Trần Thị Mai Lan',
    employee_id: 'NV-20045',
    department: 'Nhà máy Bình Dương',
    position: 'Tổ trưởng sản xuất',
    effective_date: '10/03/2026',
    expiry_date: '10/09/2026',
    signer_name: 'Lê Thanh Hải',
    signer_position: 'Giám đốc Nhà máy',
    signing_date: '10/03/2026',
    status: 'Đã ban hành',
    content: 'Thi hành kỷ luật bằng hình thức cảnh cáo đối với bà Trần Thị Mai Lan do vi phạm quy định an toàn PCCC tại phân xưởng 2. Trong thời gian thi hành kỷ luật (6 tháng), bà Lan không được xét thi đua khen thưởng và nâng lương.',
    note: 'Lưu hồ sơ nhân sự'
  },
  {
    id: 'qd-03',
    decision_number: 'QĐ-HCNS-2026-06',
    decision_date: '28/02/2026',
    decision_type: 'Điều chuyển',
    title: 'Điều chuyển công tác nội bộ',
    employee_name: 'Lê Hoàng Phúc',
    employee_id: 'NV-10567',
    department: 'Khối Công nghệ thông tin',
    position: 'Kỹ sư an ninh mạng',
    effective_date: '15/03/2026',
    expiry_date: '',
    signer_name: 'Trần Văn Long',
    signer_position: 'Tổng Giám đốc',
    signing_date: '28/02/2026',
    status: 'Chờ phê duyệt',
    content: 'Điều chuyển ông Lê Hoàng Phúc từ Phòng Hỗ trợ IT sang Đội An ninh thông tin, giữ nguyên bậc lương hiện tại. Ông Phúc có trách nhiệm bàn giao công việc trước ngày 14/03/2026.',
    note: ''
  },
  {
    id: 'qd-04',
    decision_number: 'QĐ-HCNS-2026-05',
    decision_date: '15/02/2026',
    decision_type: 'Thăng chức',
    title: 'Nâng bậc lương và thăng chức',
    employee_name: 'Phạm Thu Hà',
    employee_id: 'NV-10322',
    department: 'Phòng Marketing',
    position: 'Trưởng nhóm Marketing',
    effective_date: '01/03/2026',
    expiry_date: '',
    signer_name: 'Trần Văn Long',
    signer_position: 'Tổng Giám đốc',
    signing_date: '15/02/2026',
    status: 'Dự thảo',
    content: 'Dựa trên kết quả đánh giá năng lực năm 2025, quyết định thăng chức từ Chuyên viên lên Trưởng nhóm Marketing, đồng thời nâng hệ số lương theo quy chế tài chính hiện hành.',
    note: 'Chờ ý kiến HĐQT'
  }
];

export const HRM_MOCK_REPORTS = [
  {
    id: 'rp-01',
    name: 'Biến động nhân sự theo phòng ban',
    cadence: 'Hàng tuần',
    lastRun: '31/03/2026 07:00',
    channel: 'Email BOD + Teams',
    status: 'Thành công',
  },
  {
    id: 'rp-02',
    name: 'Tổng hợp công — đối soát chấm công',
    cadence: 'Hàng tháng',
    lastRun: '01/04/2026 05:30',
    channel: 'SFTP kế toán',
    status: 'Đang chạy',
  },
  {
    id: 'rp-03',
    name: 'Chi phí BHXH theo pháp nhân',
    cadence: 'Hàng quý',
    lastRun: '15/03/2026 14:20',
    channel: 'Power BI dataset',
    status: 'Thành công',
  },
  {
    id: 'rp-04',
    name: 'Hợp đồng sắp hết hạn (90 ngày)',
    cadence: 'Hàng ngày',
    lastRun: '03/04/2026 06:00',
    channel: 'Email HRBP',
    status: 'Cảnh báo 12 hồ sơ',
  },
];
export const HRM_MOCK_TASKS = [
  {
    id: 'tk-01',
    title: 'Hoàn thiện đánh giá thử việc — Lê Minh Khang',
    assignee: 'HRBP miền Nam',
    due: '08/04/2026',
    priority: 'Cao',
    status: 'Đang làm',
  },
  {
    id: 'tk-02',
    title: 'Đối soát chấm công ca 3 — Nhà máy Bình Dương',
    assignee: 'Chuyên viên C&B',
    due: '05/04/2026',
    priority: 'Cao',
    status: 'Chờ phản hồi',
  },
  {
    id: 'tk-03',
    title: 'Cập nhật mẫu hợp đồng thử việc theo NĐ mới',
    assignee: 'Pháp chế nội bộ',
    due: '18/04/2026',
    priority: 'Trung bình',
    status: 'Mới giao',
  },
  {
    id: 'tk-04',
    title: 'Rà soát quyền truy cập module lương — Chi nhánh ĐN',
    assignee: 'IT Hệ thống',
    due: '12/04/2026',
    priority: 'Thấp',
    status: 'Đang làm',
  },
];

export const HRM_MOCK_PROCESSES = [
  {
    id: 'pr-01',
    code: 'QT-NS-04',
    name: 'Quy trình xin nghỉ phép & duyệt công',
    version: 'v2.3',
    owner: 'Ban HCNS',
    effective: '01/01/2026',
    status: 'Hiệu lực',
  },
  {
    id: 'pr-02',
    code: 'QT-NS-11',
    name: 'Quy trình tuyển dụng & offer',
    version: 'v1.8',
    owner: 'Tuyển dụng',
    effective: '15/03/2026',
    status: 'Hiệu lực',
  },
  {
    id: 'pr-03',
    code: 'QT-AT-02',
    name: 'Chính sách an toàn — Cấp phát CCDC',
    version: 'v1.0',
    owner: 'Hành chính',
    effective: '—',
    status: 'Soạn thảo',
  },
];

export const HRM_MOCK_SERVICE_REQUESTS = [
  {
    id: 'sv-01',
    code: 'DV-8841',
    requester: 'Phạm Thu Hà',
    type: 'Cấp phát thiết bị',
    dept: 'Marketing',
    submitted: '02/04/2026',
    status: 'Chờ duyệt quản lý',
  },
  {
    id: 'sv-02',
    code: 'DV-8836',
    requester: 'Đỗ Quốc Việt',
    type: 'Đặt xe công tác liên tỉnh',
    dept: 'Kinh doanh',
    submitted: '01/04/2026',
    status: 'Đã duyệt — Chờ vận hành',
  },
  {
    id: 'sv-03',
    code: 'DV-8829',
    requester: 'Hoàng Thị Yến',
    type: 'Hỗ trợ chứng từ BHXH',
    dept: 'Nhân sự văn phòng',
    submitted: '31/03/2026',
    status: 'Hoàn tất',
  },
];

export const HRM_MOCK_TOOLS_EQUIPMENT = [
  {
    id: 'tl-01',
    asset: 'LT-DELL-042',
    name: 'Laptop Dell Latitude 5440',
    holder: 'Nguyễn Minh Tuấn',
    location: 'VP Hà Nội',
    condition: 'Tốt',
    nextAudit: '30/06/2026',
  },
  {
    id: 'tl-02',
    asset: 'TB-AN-118',
    name: 'Mũ bảo hộ — size L',
    holder: 'Kho Nhà máy BD',
    location: 'Bình Dương',
    condition: 'Tốt',
    nextAudit: '15/05/2026',
  },
  {
    id: 'tl-03',
    asset: 'XE-07',
    name: 'Xe nâng điện Toyota 1,5T',
    holder: 'Bộ phận Logistics',
    location: 'Kho TP.HCM',
    condition: 'Bảo trì định kỳ',
    nextAudit: '20/04/2026',
  },
];

export const HRM_MOCK_PENDING_PAYROLL = [
  {
    id: 'pp-01',
    batch: 'PL-CN-HCM-03/2026',
    entity: 'Chi nhánh Hồ Chí Minh',
    employees: 184,
    blocker: 'Thiếu chốt chấm công ca 3',
  },
  {
    id: 'pp-02',
    batch: 'PL-NM-BD-03/2026',
    entity: 'Nhà máy Bình Dương',
    employees: 412,
    blocker: 'Chờ duyệt làm thêm giờ tuần 13',
  },
  {
    id: 'pp-03',
    batch: 'PL-VP-HN-03/2026',
    entity: 'Văn phòng Hà Nội',
    employees: 96,
    blocker: '—',
  },
];

export const HRM_MOCK_AI_SESSIONS = [
  {
    id: 'ai-01',
    topic: 'Giải thích điều khoản thử việc theo BLLĐ (bản hiện hành)',
    user: 'Trịnh Lan Anh',
    when: '03/04/2026 09:12',
    outcome: 'Đã tóm tắt kèm điều khoản tham chiếu',
  },
  {
    id: 'ai-02',
    topic: 'Soạn email từ chối ứng viên — giữ quan hệ tốt',
    user: 'Lê Hoàng Phúc',
    when: '02/04/2026 16:40',
    outcome: 'Đã sinh 2 phương án tone chuyên nghiệp',
  },
  {
    id: 'ai-03',
    topic: 'Checklist hồ sơ gia nhập BHXH cho nhân sự mới',
    user: 'Nguyễn Thị Quỳnh',
    when: '01/04/2026 11:05',
    outcome: 'Đã liệt kê chứng từ & thứ tự nộp',
  },
];

export const HRM_MOCK_GUIDE_CHAPTERS = [
  {
    id: 'g1',
    title: 'Bắt đầu nhanh trong portal',
    summary: 'Đăng nhập, chọn đơn vị, điều hướng rail HRM và tìm kiếm nhân sự.',
    steps: 4,
  },
  {
    id: 'g2',
    title: 'Nhân sự & hồ sơ',
    summary: 'Tạo hồ sơ, nhập liệu hàng loạt, mở hồ sơ chi tiết và phân quyền xem.',
    steps: 6,
  },
  {
    id: 'g3',
    title: 'Chấm công & nghỉ phép',
    summary: 'Ca làm, quy tắc, đơn nghỉ — đối soát thiết bị và khóa kỳ.',
    steps: 5,
  },
  {
    id: 'g4',
    title: 'Lương & BHXH',
    summary: 'Thành phần lương, kỳ chi trả, tích hợp dữ liệu bảo hiểm.',
    steps: 5,
  },
  {
    id: 'g5',
    title: 'Tuyển dụng & UniAI',
    summary: 'Pipeline ứng viên, lịch phỏng vấn, gợi ý từ trợ lý AI.',
    steps: 4,
  },
];
