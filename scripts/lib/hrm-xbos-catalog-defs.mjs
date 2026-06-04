/**
 * 72 HRM catalog keys per docs/hrm/DANH_MUC_XBOS_CHO_HRM.md STT 1–72 (DELTA-G5-01).
 * work_item_id: P1-U18-DO-B1
 */
import { HRM_CONTRACT_TYPES, HRM_INSURANCE_PROVIDERS } from './vietnamese-workforce-data.mjs';

const stub = (prefix, labels) =>
  labels.map((label, i) => ({ code: `${prefix}_${String(i + 1).padStart(2, '0')}`, label, status: 'active' }));

/** @type {Array<{ key: string; name: string; domain: string; stt: number; items: Array<{code:string;label:string;status:string;unit?:string}> }>} */
export const HRM_XBOS_CATALOG_DEFS = [
  // §2 — existing bootstrap keys (STT 1–2, 6 partial)
  { stt: 1, key: 'xevn_subsidiaries', name: 'Công ty / pháp nhân thành viên', domain: 'organization', items: stub('SUB', ['Xe Việt Nam', 'Xe Du lịch', 'Visun', 'Xe TMDV', 'Xe Logistics']) },
  { stt: 2, key: 'xevn_business_domains', name: 'Mảng kinh doanh', domain: 'strategy', items: stub('DOM', ['Vận tải hành khách', 'Logistics', 'Du lịch', 'Tài chính']) },
  { stt: 3, key: 'org_units', name: 'Cây đơn vị tổ chức / phòng ban', domain: 'organization', items: stub('ORG', ['Ban TGĐ', 'Phòng Nhân sự', 'Phòng Vận hành', 'Phòng Tài chính']) },
  { stt: 4, key: 'branches', name: 'Chi nhánh / điểm làm việc', domain: 'organization', items: stub('BR', ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ']) },
  { stt: 5, key: 'management_units', name: 'Trực thuộc quản lý', domain: 'organization', items: stub('MU', ['Tập đoàn', 'Công ty thành viên', 'Chi nhánh']) },
  { stt: 6, key: 'regions', name: 'Khu vực / vùng miền', domain: 'organization', items: stub('REG', ['Miền Bắc', 'Miền Trung', 'Miền Nam']) },
  // §3
  { stt: 7, key: 'job_titles', name: 'Thư viện mẫu chức danh', domain: 'human_resources', items: [
    { code: 'CEO', label: 'Tổng Giám đốc', status: 'active' },
    { code: 'CHRO', label: 'Giám đốc Nhân sự', status: 'active' },
    { code: 'OPS_MANAGER', label: 'Quản lý Vận hành', status: 'active' },
    { code: 'DRIVER_LEAD', label: 'Đội trưởng Lái xe', status: 'active' },
  ] },
  { stt: 8, key: 'company_job_titles', name: 'Chức danh áp dụng theo công ty', domain: 'human_resources', items: stub('CJT', ['TGĐ công ty', 'TP Nhân sự', 'TP Vận hành']) },
  { stt: 9, key: 'departments', name: 'Bộ phận làm việc', domain: 'human_resources', items: stub('DEPT', ['Nhân sự', 'Vận hành', 'Kế toán', 'Kinh doanh']) },
  { stt: 10, key: 'positions', name: 'Chức vụ / vị trí công việc', domain: 'human_resources', items: stub('POS', ['Chuyên viên', 'Trưởng phòng', 'Phó phòng', 'Nhân viên']) },
  { stt: 11, key: 'hrm_business_roles', name: 'Vai trò nghiệp vụ HRM', domain: 'human_resources', items: stub('ROLE', ['HRBP', 'Payroll Admin', 'Recruiter', 'Attendance Admin']) },
  { stt: 12, key: 'permission_codes', name: 'Mã quyền chức năng', domain: 'human_resources', items: stub('PERM', ['hrm.read', 'hrm.write', 'hrm.approve']) },
  { stt: 13, key: 'role_permission_matrix', name: 'Ma trận phân quyền theo vai trò', domain: 'human_resources', items: stub('RPM', ['HR Admin', 'Line Manager', 'Employee Self']) },
  { stt: 14, key: 'user_role_assignments', name: 'Gán chức danh cho người dùng', domain: 'human_resources', items: stub('URA', ['Kiêm nhiệm TGĐ', 'Kiêm nhiệm HRBP']) },
  // §4 field groups
  { stt: 15, key: 'hrm_employee_basic_fields', name: 'Định danh và tổ chức', domain: 'hrm_employee', items: stub('BASIC', ['Mã NV', 'Họ tên', 'Bộ phận', 'Chức vụ']) },
  { stt: 16, key: 'hrm_employee_personal_fields', name: 'Nhân thân', domain: 'hrm_employee', items: stub('PERS', ['Năm sinh', 'Giới tính', 'CCCD', 'Dân tộc']) },
  { stt: 17, key: 'hrm_employee_contact_fields', name: 'Liên lạc', domain: 'hrm_employee', items: stub('CONT', ['SĐT', 'Email', 'Zalo']) },
  { stt: 18, key: 'hrm_employee_emergency_fields', name: 'Liên hệ khẩn cấp', domain: 'hrm_employee', items: stub('EMRG', ['Người liên hệ', 'SĐT', 'Quan hệ']) },
  { stt: 19, key: 'hrm_employee_address_fields', name: 'Địa chỉ', domain: 'hrm_employee', items: stub('ADDR', ['Thường trú', 'Tạm trú']) },
  { stt: 20, key: 'hrm_employee_insurance_fields', name: 'Bảo hiểm', domain: 'hrm_employee', items: stub('INSF', ['Mã BHXH']) },
  // §4.1 value selects
  { stt: 21, key: 'employment_statuses', name: 'Trạng thái lao động', domain: 'hrm_employee', items: [
    { code: 'active', label: 'Đang làm việc', status: 'active' },
    { code: 'probation', label: 'Thử việc', status: 'active' },
    { code: 'inactive', label: 'Ngừng làm việc', status: 'active' },
  ] },
  { stt: 22, key: 'genders', name: 'Giới tính', domain: 'hrm_employee', items: stub('GEN', ['Nam', 'Nữ', 'Khác']) },
  { stt: 23, key: 'ethnicities', name: 'Dân tộc', domain: 'hrm_employee', items: stub('ETH', ['Kinh', 'Tày', 'Thái', 'Mường']) },
  { stt: 24, key: 'religions', name: 'Tôn giáo', domain: 'hrm_employee', items: stub('REL', ['Không', 'Phật giáo', 'Công giáo']) },
  { stt: 25, key: 'education_levels', name: 'Trình độ chuyên môn', domain: 'hrm_employee', items: stub('EDU', ['Trung cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ']) },
  { stt: 26, key: 'emergency_contact_relations', name: 'Quan hệ người liên hệ khẩn cấp', domain: 'hrm_employee', items: stub('ECR', ['Cha/mẹ', 'Vợ/chồng', 'Anh/chị/em']) },
  // §5
  { stt: 27, key: 'contract_types', name: 'Loại hợp đồng lao động', domain: 'hr_policy', items: HRM_CONTRACT_TYPES.map((t) => ({ code: t.key, label: t.label, status: 'active' })) },
  { stt: 28, key: 'hr_decision_types', name: 'Loại quyết định nhân sự', domain: 'hr_policy', items: stub('HRD', ['Bổ nhiệm', 'Miễn nhiệm', 'Kỷ luật']) },
  { stt: 29, key: 'attendance_update_types', name: 'Loại đơn chỉnh sửa chấm công', domain: 'attendance', items: stub('AUT', ['Quên chấm công', 'Sai ca', 'Công tác']) },
  { stt: 30, key: 'leave_types', name: 'Loại đơn nghỉ phép', domain: 'attendance', items: stub('LVT', ['Phép năm', 'Ốm', 'Thai sản', 'Không lương']) },
  { stt: 31, key: 'shifts', name: 'Ca làm việc / lịch ca', domain: 'attendance', items: stub('SHF', ['Ca ngày', 'Ca đêm', 'Ca gãy']) },
  { stt: 32, key: 'payroll_period_types', name: 'Kỳ lương', domain: 'payroll', items: stub('PPT', ['Tháng', 'Tuần', 'Quý']) },
  { stt: 33, key: 'allowance_types', name: 'Loại phụ cấp', domain: 'payroll', items: stub('ALW', ['Ăn ca', 'Xăng xe', 'Điện thoại']) },
  { stt: 34, key: 'deduction_types', name: 'Loại khấu trừ', domain: 'payroll', items: stub('DED', ['BHXH', 'Thuế TNCN', 'Tạm ứng']) },
  { stt: 35, key: 'operations_request_types', name: 'Loại yêu cầu dịch vụ nội bộ', domain: 'operations', items: stub('ORT', ['IT support', 'HCNS', 'Tài chính']) },
  { stt: 36, key: 'request_statuses', name: 'Trạng thái xử lý đơn', domain: 'operations', items: stub('RST', ['Chờ duyệt', 'Đã duyệt', 'Từ chối']) },
  // §6
  { stt: 37, key: 'recruitment_campaign_types', name: 'Loại chiến dịch tuyển dụng', domain: 'recruitment', items: stub('RCT', ['Tuyển mới', 'Thay thế', 'Mở rộng']) },
  { stt: 38, key: 'requisition_statuses', name: 'Trạng thái yêu cầu tuyển', domain: 'recruitment', items: stub('RQS', ['Mở', 'Đóng', 'Tạm dừng']) },
  { stt: 39, key: 'candidate_sources', name: 'Nguồn ứng viên', domain: 'recruitment', items: stub('CSO', ['Website', 'Giới thiệu', 'Headhunt', 'Job board']) },
  { stt: 40, key: 'candidate_statuses', name: 'Trạng thái ứng viên', domain: 'recruitment', items: stub('CST', ['Mới', 'Phỏng vấn', 'Offer', 'Từ chối']) },
  { stt: 41, key: 'interview_rounds', name: 'Vòng phỏng vấn', domain: 'recruitment', items: stub('IVR', ['Vòng 1', 'Vòng 2', 'Vòng cuối']) },
  { stt: 42, key: 'interview_results', name: 'Kết quả phỏng vấn', domain: 'recruitment', items: stub('IVS', ['Đạt', 'Không đạt', 'Cân nhắc']) },
  // §7
  { stt: 43, key: 'document_folder_types', name: 'Thư mục / loại tài liệu hồ sơ', domain: 'documents', items: stub('DOC', ['Hợp đồng', 'Bằng cấp', 'CMND/CCCD']) },
  { stt: 44, key: 'metadata_change_types', name: 'Loại thay đổi metadata hồ sơ', domain: 'documents', items: stub('MCT', ['Cập nhật liên hệ', 'Đổi chức danh']) },
  { stt: 45, key: 'profile_change_rejection_reasons', name: 'Lý do từ chối duyệt thay đổi hồ sơ', domain: 'documents', items: stub('PCR', ['Thiếu hồ sơ', 'Sai quy trình']) },
  // §8 fleet (du lịch)
  { stt: 46, key: 'hrm_fleet_driver_fields', name: 'Lái xe & tuyến', domain: 'hrm_fleet', items: stub('FLD', ['Tên lái xe', 'SĐT', 'Tuyến']) },
  { stt: 47, key: 'hrm_fleet_vehicle_fields', name: 'Thông tin xe', domain: 'hrm_fleet', items: stub('FLV', ['BKS', 'Số khung', 'Hãng xe']) },
  { stt: 48, key: 'hrm_fleet_registration_fields', name: 'Đăng ký & đăng kiểm', domain: 'hrm_fleet', items: stub('FLR', ['Ngày đăng ký', 'Ngày đăng kiểm']) },
  { stt: 49, key: 'hrm_fleet_insurance_fields', name: 'Bảo hiểm xe', domain: 'hrm_fleet', items: stub('FLI', ['TNDS', 'Vật chất']) },
  { stt: 50, key: 'hrm_fleet_permit_fields', name: 'Phù hiệu & giấy đi đường', domain: 'hrm_fleet', items: stub('FLP', ['Phù hiệu', 'Giấy đi đường']) },
  { stt: 51, key: 'hrm_fleet_road_fee_fields', name: 'Phí bảo trì đường bộ', domain: 'hrm_fleet', items: stub('FLF', ['Phí BOT', 'Phí đường bộ']) },
  { stt: 52, key: 'hrm_fleet_telecom_fields', name: 'Viễn thông / SIM', domain: 'hrm_fleet', items: stub('FLT', ['Nhà mạng', 'Gói cước']) },
  { stt: 53, key: 'hrm_fleet_gps_fields', name: 'Thiết bị định vị', domain: 'hrm_fleet', items: stub('FLG', ['GPS', 'Camera hành trình']) },
  { stt: 54, key: 'hrm_fleet_finance_fields', name: 'Tài chính vay xe', domain: 'hrm_fleet', items: stub('FLN', ['Tổ chức vay', 'Số tiền vay']) },
  // §9 workflow refs
  { stt: 55, key: 'wf_attendance_correction', name: 'Mã quy trình chỉnh sửa chấm công', domain: 'workflow_definition', items: stub('WFA', ['WF-ATT-001']) },
  { stt: 56, key: 'wf_leave_request', name: 'Mã quy trình nghỉ phép', domain: 'workflow_definition', items: stub('WFL', ['WF-LVE-001']) },
  { stt: 57, key: 'wf_catalog_extension', name: 'Mã quy trình duyệt mở rộng danh mục HRM', domain: 'workflow_definition', items: stub('WFC', ['WF-CAT-001']) },
  { stt: 58, key: 'wf_metadata_change', name: 'Mã quy trình duyệt thay đổi metadata', domain: 'workflow_definition', items: stub('WFM', ['WF-MD-001']) },
  { stt: 59, key: 'workflow_groups', name: 'Nhóm quy trình', domain: 'workflow_definition', items: stub('WFG', ['Nhân sự', 'Vận hành', 'Tài chính']) },
  // §10 master
  { stt: 60, key: 'job_titles_master', name: 'Chức danh (master)', domain: 'human_resources', items: stub('JTM', ['TGĐ', 'GĐ', 'Trưởng phòng']) },
  { stt: 61, key: 'internal_customers', name: 'Khách hàng nội bộ / đối tác HR', domain: 'finance_control', items: stub('ICU', ['Công ty thành viên A', 'Công ty thành viên B']) },
  { stt: 62, key: 'expense_types', name: 'Loại chi phí', domain: 'finance_control', items: stub('EXP', ['Tạm ứng', 'Hoàn ứng', 'Chi phí đi lại']) },
  { stt: 63, key: 'kpi_library', name: 'Chỉ số KPI nhân sự', domain: 'performance_management', items: [
    { code: 'KPI_OTIF', label: 'Tỷ lệ giao đúng hạn OTIF', unit: '%', status: 'active' },
    { code: 'KPI_ABSENCE', label: 'Tỷ lệ vắng mặt', unit: '%', status: 'active' },
    { code: 'KPI_LABOR_COST', label: 'Chi phí nhân công/đơn', unit: 'VND', status: 'active' },
  ] },
  // §11 RACI
  { stt: 64, key: 'raci_business_blocks', name: 'Khối nghiệp vụ RACI', domain: 'governance', items: stub('RBB', ['Ban TGĐ', 'Vận hành', 'Tài chính']) },
  { stt: 65, key: 'raci_activity_catalog', name: 'Catalog hoạt động RACI', domain: 'governance', items: stub('RAC', ['Hoạch định chiến lược', 'Quản trị nhân sự']) },
  { stt: 66, key: 'raci_roles', name: 'Vai trò RACI (R/A/C/I)', domain: 'governance', items: stub('RR', ['Responsible', 'Accountable', 'Consulted', 'Informed']) },
  { stt: 67, key: 'activity_capability_map', name: 'Ánh xạ hoạt động ↔ chức năng phân hệ', domain: 'governance', items: stub('ACM', ['HRM', 'XBOS', 'Portal']) },
  { stt: 68, key: 'raci_title_assignments', name: 'Gán cột RACI ↔ chức danh', domain: 'governance', items: stub('RTA', ['CEO', 'CHRO', 'COO']) },
  // §12 Command Center + bootstrap extras
  { stt: 69, key: 'company_form_presets', name: 'Preset biểu mẫu hồ sơ theo công ty', domain: 'command_center', items: stub('CFP', ['Mẫu tập đoàn', 'Mẫu du lịch']) },
  { stt: 70, key: 'internal_document_types', name: 'Danh mục văn bản nội bộ', domain: 'command_center', items: stub('IDT', ['Quyết định', 'Thông báo', 'Công văn']) },
  { stt: 71, key: 'measurement_catalogs', name: 'Danh mục đo lường', domain: 'command_center', items: stub('MSR', ['KPI vận hành', 'KPI nhân sự']) },
  { stt: 72, key: 'benefit_price_policies', name: 'Danh mục giá / chính sách phúc lợi', domain: 'command_center', items: stub('BPP', ['Bảo hiểm bổ sung', 'Phụ cấp ăn ca']) },
  // Bootstrap extras (count toward G5 holding publish set)
  { stt: 0, key: 'cost_centers', name: 'Trung tâm chi phí', domain: 'finance_control', items: stub('CC', ['Vận hành HN', 'Vận hành HCM', 'Kho ĐN']) },
  { stt: 0, key: 'xevn_governance_policies', name: 'Chính sách quản trị XeVN', domain: 'governance', items: stub('GOV', ['Chấm công', 'Lương', 'Bảo mật dữ liệu']) },
];

if (HRM_XBOS_CATALOG_DEFS.filter((d) => d.stt > 0).length !== 72) {
  throw new Error(`Expected 72 STT defs, got ${HRM_XBOS_CATALOG_DEFS.filter((d) => d.stt > 0).length}`);
}

/** Insurance provider codes for satellite seed cross-ref */
export const HRM_INSURANCE_CATALOG_ITEMS = HRM_INSURANCE_PROVIDERS.map((p, i) => ({
  code: `INS_${i + 1}`,
  label: p,
  status: 'active',
}));
