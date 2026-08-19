/**
 * One-shot generator: W1-S6-HRM-B-MOB professional UC TC packs (STT 301–366).
 * Design-only · uat_done false · Leave L2 = SPEC_GAP inventory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..');
const squadDir = __dirname;
const WI = 'PO-UC-TC-W1-S6-HRM-B-MOB';
const AUTHOR = `qa · ${WI}`;

/** @typedef {{stt:number,id:string,name:string,mod:string,surfaces:string,actors:string,api:string,srsNew:string,tech:string,readiness:string,codeNote:string,depth:string}} UC */

/** @type {UC[]} */
const UCS = [
  { stt: 301, id: 'HRM-PR-04', name: 'Chốt kỳ lương', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Manager · Finance · Tenant Admin', api: 'POST /api/hrm/payroll/:id/lock · POST …/approve · GET …/:period', srsNew: 'SRS_VN § lương / kỳ (delta) · N/A-DELTA nếu chỉ SRS cũ', tech: 'docs/hrm/TECHSPEC.md · TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Matrix endpoint Có; chốt kỳ = mutate khóa — HP+FD+AU scope.', depth: 'mutate' },
  { stt: 302, id: 'HRM-PR-05', name: 'Xem phiếu lương', mod: 'M05', surfaces: 'hrm-embed / hrm-mobile / api', actors: 'NV ESS · HCNS · Finance', api: 'GET /api/hrm/payroll/:period · payslip detail pattern', srsNew: 'SRS_VN § phiếu lương · API_CONTRACT_VN payroll', tech: 'TECHSPEC_HE §9.3 · TECHSPEC_MOBILE', readiness: 'LIKELY_PARTIAL', codeNote: 'Web + mobile payslip; MOB-09 API Một phần.', depth: 'read' },
  { stt: 303, id: 'HRM-PR-06', name: 'Báo cáo đối soát lương', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Finance · HR Manager · Group CEO', api: 'GET payroll reconcile / report', srsNew: 'N/A-DELTA (SRS cũ báo cáo)', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Report; scope main vs member AU.', depth: 'report' },
  { stt: 304, id: 'HRM-RC-01', name: 'Tạo yêu cầu tuyển dụng', mod: 'M05', surfaces: 'hrm-embed / api / xbos-cc', actors: 'HRBP · Recruiter · Manager', api: 'POST /api/hrm/recruitment/requisitions · WF spawn', srsNew: 'SRS_VN § tuyển dụng · API_CONTRACT_VN requisitions', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'U84 REC-REQ path; JD catalog assert residual — full FD design.', depth: 'wf' },
  { stt: 305, id: 'HRM-RC-02', name: 'Xem danh sách yêu cầu tuyển dụng', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HRBP · Recruiter · CEO', api: 'GET /api/hrm/recruitment/requisitions', srsNew: 'SRS_VN § tuyển dụng', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'List scope parity get-by-id.', depth: 'read' },
  { stt: 306, id: 'HRM-RC-03', name: 'Tạo hồ sơ ứng viên', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Recruiter · HRBP', api: 'POST candidates / pipeline', srsNew: 'SRS_VN § ứng viên', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Pipeline create; GPLX gate SPEC_GAP nếu TO-BE.', depth: 'mutate' },
  { stt: 307, id: 'HRM-RC-04', name: 'Xem danh sách ứng viên', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Recruiter · HRBP', api: 'GET candidates', srsNew: 'SRS_VN § ứng viên', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'List+filter; empty hợp lệ.', depth: 'read' },
  { stt: 308, id: 'HRM-RC-05', name: 'Lên lịch phỏng vấn', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Recruiter · Interviewer', api: 'POST interview schedule', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Schedule; vi-VN date AC.', depth: 'mutate' },
  { stt: 309, id: 'HRM-RC-06', name: 'Cập nhật kết quả phỏng vấn', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Interviewer · Recruiter', api: 'PATCH/POST interview result', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Result → pipeline stage.', depth: 'mutate' },
  { stt: 310, id: 'HRM-CI-01', name: 'Tạo hợp đồng lao động', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · HRBP', api: 'POST /api/hrm/contracts (pattern)', srsNew: 'SRS_VN § hợp đồng', tech: 'TECHSPEC_HE §9.3 · docs/hrm/TECHSPEC.md', readiness: 'LIKELY_IMPL', codeNote: 'Create FK employee; soft-delete only.', depth: 'mutate' },
  { stt: 311, id: 'HRM-CI-02', name: 'Ghi nhận bảo hiểm nhân viên', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS', api: 'POST insurance enrollment', srsNew: 'SRS_VN § BHXH', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Insurance amounts vi-VN grouping FE.', depth: 'mutate' },
  { stt: 312, id: 'HRM-CI-03', name: 'Xem danh sách hợp đồng', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · manager', api: 'GET contracts', srsNew: 'SRS_VN § hợp đồng', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'J-HRM list→detail scope parity.', depth: 'read' },
  { stt: 313, id: 'HRM-CI-04', name: 'Cảnh báo hợp đồng sắp hết hạn', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · system', api: 'GET expiring contracts / alerts', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Alert window BD; dd/MM/yyyy.', depth: 'report' },
  { stt: 314, id: 'HRM-CI-05', name: 'Cập nhật hợp đồng', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS', api: 'PATCH/PUT contracts/:id', srsNew: 'SRS_VN § hợp đồng', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Update giữ soft-delete invariant.', depth: 'mutate' },
  { stt: 315, id: 'HRM-CI-06', name: 'Xóa hợp đồng', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · Tenant Admin', api: 'DELETE/soft-delete contracts/:id', srsNew: 'SRS_VN § soft-delete', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Soft-delete only — hard-delete FD.', depth: 'soft' },
  { stt: 316, id: 'HRM-CI-07', name: 'Cảnh báo bảo hiểm sắp hết hạn', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · system', api: 'GET insurance expiry alerts', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Parallel CI-04 insurance.', depth: 'report' },
  { stt: 317, id: 'HRM-MD-01', name: 'Gửi yêu cầu thay đổi metadata hồ sơ', mod: 'M05', surfaces: 'hrm-embed / hrm-mobile / api', actors: 'NV ESS · HCNS', api: 'POST metadata-change-requests', srsNew: 'SRS_VN § metadata', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'ESS submit → queue pending.', depth: 'mutate' },
  { stt: 318, id: 'HRM-MD-02', name: 'Xem hàng chờ thay đổi metadata', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · HRBP · Approver', api: 'GET metadata queue', srsNew: 'SRS_VN § metadata', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Embed UC-HRM-26 consumer.', depth: 'read' },
  { stt: 319, id: 'HRM-MD-03', name: 'Phê duyệt thay đổi metadata', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Approver · HCNS', api: 'POST …/approve', srsNew: 'SRS_VN § metadata', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Approve mutates profile; self-approve AU.', depth: 'wf' },
  { stt: 320, id: 'HRM-MD-04', name: 'Từ chối thay đổi metadata', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Approver', api: 'POST …/reject', srsNew: 'SRS_VN § metadata', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Reject + reason FD.', depth: 'wf' },
  { stt: 321, id: 'HRM-MD-05', name: 'Xem nhật ký thay đổi metadata', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HCNS · Auditor', api: 'GET metadata audit log', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Audit trail read.', depth: 'read' },
  { stt: 322, id: 'HRM-SC-01', name: 'Xem tổng quan danh mục cấu hình HRM', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin · Group CEO', api: 'GET catalog-sync / settings overview', srsNew: 'SRS_VN § danh mục', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Overview after XBOS publish/pull.', depth: 'read' },
  { stt: 323, id: 'HRM-SC-02', name: 'Đồng bộ toàn bộ danh mục từ XBOS', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin · system', api: 'POST /api/hrm/catalog-sync', srsNew: 'SRS_VN § catalog sync', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Sync ERROR banner class.', depth: 'mutate' },
  { stt: 324, id: 'HRM-SC-03', name: 'Bổ sung giá trị danh mục mở rộng', mod: 'M05', surfaces: 'hrm-embed / xbos-cc / api', actors: 'HR Admin · company_group_hr', api: 'POST catalog extension · WF', srsNew: 'SRS_VN § CAT-EXT', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'U84 CAT-EXT Primary path.', depth: 'wf' },
  { stt: 325, id: 'HRM-SC-04', name: 'Yêu cầu xóa trường danh mục', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin', api: 'POST catalog delete-request', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Platform catalog hard-delete forbidden.', depth: 'mutate' },
  { stt: 326, id: 'HRM-SC-05', name: 'Phê duyệt lô mở rộng danh mục', mod: 'M05', surfaces: 'xbos-cc / api', actors: 'Governance · Group HR', api: 'POST XBOS-CAT approve', srsNew: 'SRS_VN § CAT approve', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Inbox approve XBOS-CAT-201 pattern.', depth: 'wf' },
  { stt: 327, id: 'HRM-SC-06', name: 'Từ chối lô mở rộng danh mục', mod: 'M05', surfaces: 'xbos-cc / api', actors: 'Governance', api: 'POST XBOS-CAT reject', srsNew: 'SRS_VN § CAT reject', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Reject reason + F5.', depth: 'wf' },
  { stt: 328, id: 'HRM-SC-07', name: 'Khởi tạo mẫu import nhân sự tập đoàn', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Group HR Admin', api: 'POST init import template (admin)', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Bootstrap template — không UAT seed evidence.', depth: 'mutate' },
  { stt: 329, id: 'HRM-SC-08', name: 'Khởi tạo danh mục phòng ban – chức vụ theo công ty', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin · member CEO', api: 'POST dept/position catalog init', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Per-company catalog; scope AU.', depth: 'mutate' },
  { stt: 330, id: 'HRM-SC-09', name: 'Khởi tạo danh mục hồ sơ xe du lịch', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin · Fleet admin (DL)', api: 'POST fleet catalog init', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Tourism fleet catalog slice.', depth: 'mutate' },
  { stt: 331, id: 'HRM-IM-01', name: 'Xem trước import nhân sự từ file', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin', api: 'POST import preview', srsNew: 'SRS_VN § import', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Preview errors before commit.', depth: 'mutate' },
  { stt: 332, id: 'HRM-IM-02', name: 'Xác nhận import nhân sự', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin', api: 'POST import commit', srsNew: 'SRS_VN § import', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Commit after preview.', depth: 'mutate' },
  { stt: 333, id: 'HRM-IM-03', name: 'Export danh sách nhân sự', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HRBP · HCNS · CEO', api: 'GET export employees', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Export scoped; PII check.', depth: 'read' },
  { stt: 334, id: 'HRM-IM-04', name: 'Tải file mẫu import', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HR Admin', api: 'GET import template file', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Download template HP+UX.', depth: 'read' },
  { stt: 335, id: 'HRM-OP-01', name: 'Tạo công việc vận hành', mod: 'M05', surfaces: 'hrm-embed / hrm-mobile / api', actors: 'Manager · Ops · NV', api: 'POST /api/hrm/tasks (ops)', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3 · MOB-OPERATIONS neo', readiness: 'LIKELY_PARTIAL', codeNote: 'Ops tasks; MOB-11 consumer.', depth: 'mutate' },
  { stt: 336, id: 'HRM-OP-02', name: 'Xem danh sách công việc', mod: 'M05', surfaces: 'hrm-embed / hrm-mobile / api', actors: 'Assignee · Manager', api: 'GET tasks', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'List filters; empty UX.', depth: 'read' },
  { stt: 337, id: 'HRM-OP-03', name: 'Cập nhật trạng thái công việc', mod: 'M05', surfaces: 'hrm-embed / hrm-mobile / api', actors: 'Assignee · Manager', api: 'PATCH tasks/:id/status', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'SM illegal FD.', depth: 'mutate' },
  { stt: 338, id: 'HRM-OP-04', name: 'Báo cáo tổng hợp công việc', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Manager · Ops lead', api: 'GET tasks report', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Aggregate report scope.', depth: 'report' },
  { stt: 339, id: 'HRM-PF-01', name: 'Tạo chu kỳ đánh giá hiệu suất', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HRBP · Manager', api: 'POST performance cycles', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Cycle create; date range BD.', depth: 'mutate' },
  { stt: 340, id: 'HRM-PF-02', name: 'Xem danh sách chu kỳ đánh giá', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'HRBP · Manager · NV', api: 'GET performance cycles', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'List read.', depth: 'read' },
  { stt: 341, id: 'HRM-PF-03', name: 'Tạo phiếu đánh giá', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Manager · Self', api: 'POST performance reviews', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Score 0–100 exempt thousand-group.', depth: 'mutate' },
  { stt: 342, id: 'HRM-PF-04', name: 'Xem danh sách phiếu đánh giá', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Manager · NV · HRBP', api: 'GET performance reviews', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'List+detail scope.', depth: 'read' },
  { stt: 343, id: 'HRM-FL-01', name: 'Xem danh sách hồ sơ xe (fleet)', mod: 'M05', surfaces: 'hrm-embed / api', actors: 'Fleet admin · DL HR · driver', api: 'GET fleet vehicles', srsNew: 'N/A-DELTA', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Fleet list DL scope.', depth: 'read' },
  { stt: 344, id: 'UC-HRM-20', name: 'Embed — Tổng quan HRM', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'ceo@xe.vn · member CEO · HRBP', api: 'GET dashboard/summary proxies', srsNew: 'SRS_VN § embed · docs/hrm/SRS.md', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'P-CC overview; no 409/54321.', depth: 'embed' },
  { stt: 345, id: 'UC-HRM-21', name: 'Embed — Danh sách nhân sự', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'ceo@ · HRBP · member CEO', api: 'GET /api/hrm/employees', srsNew: 'SRS_VN § NV', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'J-HRM-01 list→profile scope_parity.', depth: 'embed' },
  { stt: 346, id: 'UC-HRM-22', name: 'Embed — Tuyển dụng', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'HRBP · Recruiter', api: 'recruitment APIs via embed', srsNew: 'SRS_VN § tuyển dụng', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Tab embed + deep link requisition.', depth: 'embed' },
  { stt: 347, id: 'UC-HRM-23', name: 'Embed — Chấm công', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'HCNS · Manager · NV', api: 'attendance APIs', srsNew: 'SRS_VN § chấm công', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Công chuẩn empty≠PASS (console-clean).', depth: 'embed' },
  { stt: 348, id: 'UC-HRM-24', name: 'Embed — Lương', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'Finance · HR · NV', api: 'payroll APIs', srsNew: 'SRS_VN § lương', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Payroll tab; money vi-VN.', depth: 'embed' },
  { stt: 349, id: 'UC-HRM-25', name: 'Embed — Hợp đồng và bảo hiểm xã hội', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'HCNS · NV', api: 'contracts + insurance', srsNew: 'SRS_VN § HĐ/BH', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_IMPL', codeNote: 'Contracts embed list→detail.', depth: 'embed' },
  { stt: 350, id: 'UC-HRM-26', name: 'Embed — Hàng chờ duyệt metadata', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'Approver · HCNS', api: 'metadata queue APIs', srsNew: 'SRS_VN § metadata', tech: 'TECHSPEC_HE §9.3', readiness: 'LIKELY_PARTIAL', codeNote: 'U65 no fake inbox seed.', depth: 'embed' },
  { stt: 351, id: 'UC-HRM-27', name: 'Embed — Quyết định và báo cáo (backlog)', mod: 'M05', surfaces: 'web-portal / hrm-embed', actors: 'CEO · HRBP', api: 'decisions/reports (partial)', srsNew: 'N/A-DELTA backlog', tech: 'TECHSPEC_HE §9.3', readiness: 'GAP', codeNote: 'Matrix waived/FE backlog — GAP honest.', depth: 'embed' },
  { stt: 352, id: 'UC-HRM-MOB-01', name: 'Đăng nhập và thiết lập phiên an toàn', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'uat.nv#### · manager mobile', api: 'POST /api/hrm/auth/mobile/login · refresh', srsNew: 'SRS_MOBILE · SRS_VN § auth mobile', tech: 'docs/hrm/TECHSPEC_MOBILE.md §5.2', readiness: 'LIKELY_IMPL', codeNote: 'SecureStore refresh; neo MOB-HOME/SETTINGS.', depth: 'mobile' },
  { stt: 353, id: 'UC-HRM-MOB-02', name: 'Chọn và xác nhận phạm vi công ty', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'multi-membership ESS', api: 'memberships[] · x-company-id', srsNew: 'SRS_MOBILE · ADR scope ladder', tech: 'TECHSPEC_MOBILE §4.2', readiness: 'LIKELY_IMPL', codeNote: 'Company picker; 409 mismatch.', depth: 'mobile' },
  { stt: 354, id: 'UC-HRM-MOB-03', name: 'Xem bảng điều khiển cá nhân', mod: 'M06', surfaces: 'hrm-mobile', actors: 'ESS', api: 'dashboard summary GETs', srsNew: 'SRS_MOBILE', tech: 'TECHSPEC_MOBILE · MOB-HOME neo', readiness: 'LIKELY_PARTIAL', codeNote: 'Home tiles; neo MOB-HOME only.', depth: 'mobile' },
  { stt: 355, id: 'UC-HRM-MOB-04', name: 'Ghi nhận chấm công / điểm danh', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS (không Leader FAB)', api: 'POST /api/hrm/attendance/records', srsNew: 'SRS_MOBILE · FR-UC-M04', tech: 'TECHSPEC_MOBILE · MOB-ATTENDANCE neo', readiness: 'LIKELY_IMPL', codeNote: 'J-MOB-02 GPS check-in.', depth: 'mobile' },
  { stt: 356, id: 'UC-HRM-MOB-05', name: 'Xem lịch sử chấm công', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS', api: 'GET attendance records history', srsNew: 'SRS_MOBILE', tech: 'MOB-ATTENDANCE neo', readiness: 'LIKELY_PARTIAL', codeNote: 'Calendar; ≠ epoch 1970.', depth: 'mobile' },
  { stt: 357, id: 'UC-HRM-MOB-06', name: 'Tạo đơn chỉnh sửa chấm công hoặc đơn nghỉ phép', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS uat.nv0003', api: 'POST update-requests · leave-requests · files/upload', srsNew: 'SRS_MOBILE · FR-UC-M03/M04 · exemplar Leave/ATT', tech: 'TECHSPEC_MOBILE · MOB-LEAVE-APPR · MOB-ATTENDANCE neo', readiness: 'LIKELY_IMPL', codeNote: 'ESS 25+; L2 SPEC_GAP inventory not PASS.', depth: 'mobile' },
  { stt: 358, id: 'UC-HRM-MOB-07', name: 'Xem danh sách đơn và trạng thái', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS', api: 'GET leave-requests · update-requests', srsNew: 'SRS_MOBILE', tech: 'MOB-LEAVE-APPR · MOB-ATTENDANCE neo', readiness: 'LIKELY_PARTIAL', codeNote: 'J-MOB-03 list→detail.', depth: 'mobile' },
  { stt: 359, id: 'UC-HRM-MOB-08', name: 'Phê duyệt hoặc từ chối đơn chờ', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'Manager uat.nv0001 (cấm ceo@ L1 leave)', api: 'POST …/approve · …/reject', srsNew: 'SRS_MOBILE · FR-UC-M03', tech: 'MOB-LEAVE-APPR neo · Leave L2 SPEC_GAP', readiness: 'LIKELY_IMPL', codeNote: 'L1 HP; L2 SPEC_GAP inventory only.', depth: 'mobile' },
  { stt: 360, id: 'UC-HRM-MOB-09', name: 'Xem tóm tắt lương theo kỳ', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS', api: 'GET payroll/payslip summary', srsNew: 'SRS_MOBILE · J-MOB-04', tech: 'TECHSPEC_MOBILE', readiness: 'LIKELY_PARTIAL', codeNote: 'Payslip vi-VN; API partial.', depth: 'mobile' },
  { stt: 361, id: 'UC-HRM-MOB-10', name: 'Xem hợp đồng và bảo hiểm', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS', api: 'GET contracts/insurance own', srsNew: 'SRS_MOBILE', tech: 'TECHSPEC_MOBILE · MOB-PROFILE neo', readiness: 'LIKELY_PARTIAL', codeNote: 'Own contract read.', depth: 'mobile' },
  { stt: 362, id: 'UC-HRM-MOB-11', name: 'Quản lý công việc và yêu cầu dịch vụ', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS · Manager', api: 'tasks APIs', srsNew: 'SRS_MOBILE', tech: 'MOB-OPERATIONS · MOB-TEAM neo', readiness: 'LIKELY_PARTIAL', codeNote: 'Ops mobile status update.', depth: 'mobile' },
  { stt: 363, id: 'UC-HRM-MOB-12', name: 'Xem và cập nhật hồ sơ cá nhân', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS', api: 'GET/PATCH profile · metadata request', srsNew: 'SRS_MOBILE', tech: 'MOB-PROFILE neo', readiness: 'LIKELY_PARTIAL', codeNote: 'Profile view/update.', depth: 'mobile' },
  { stt: 364, id: 'UC-HRM-MOB-13', name: 'Nhận thông báo (in-app / realtime / push)', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS · Manager', api: 'GET notifications/inbox · socket /hrm-realtime · push-tokens', srsNew: 'SRS_MOBILE · PLAN_MOBILE_REALTIME', tech: 'TECHSPEC_MOBILE §7', readiness: 'LIKELY_PARTIAL', codeNote: 'In-app P0; push P1 LOCK.', depth: 'mobile' },
  { stt: 365, id: 'UC-HRM-MOB-14', name: 'Làm việc ngoại tuyến có kiểm soát', mod: 'M06', surfaces: 'hrm-mobile', actors: 'ESS', api: 'cache read-model (no fake mutate)', srsNew: 'SRS_MOBILE P2 offline', tech: 'TECHSPEC_MOBILE §8', readiness: 'GAP', codeNote: 'P2 offline — GAP/PARTIAL honest.', depth: 'mobile' },
  { stt: 366, id: 'UC-HRM-MOB-15', name: 'Đăng xuất và thu hồi phiên', mod: 'M06', surfaces: 'hrm-mobile / api', actors: 'ESS', api: 'logout · clear SecureStore · revoke if exists', srsNew: 'SRS_MOBILE', tech: 'TECHSPEC_MOBILE §5.3', readiness: 'LIKELY_PARTIAL', codeNote: 'Local clear; remote revoke may GAP.', depth: 'mobile' },
];

function tcId(uc, fn, type, n) {
  const stem = uc.id.replace(/^UC-/, '');
  return `TC-${stem}-${fn.replace(/^FN-/, '')}-${type}-${n}`;
}

function countTypes(cases) {
  const o = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, SG: 0, LOCK: 0, other: 0 };
  for (const c of cases) {
    if (o[c.t] !== undefined) o[c.t]++;
    else o.other++;
  }
  return o;
}

function fnSummary(fns, cases) {
  const rows = [];
  let tot = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, sum: 0 };
  for (const fn of fns) {
    const cs = cases.filter((c) => c.fn === fn.id);
    const hp = cs.filter((c) => c.t === 'HP').length;
    const fd = cs.filter((c) => c.t === 'FD').length;
    const bd = cs.filter((c) => c.t === 'BD').length;
    const au = cs.filter((c) => c.t === 'AU').length;
    const ux = cs.filter((c) => c.t === 'UX').length;
    const sg = cs.filter((c) => c.t === 'SG' || c.t === 'LOCK').length;
    const sum = cs.length;
    tot.HP += hp; tot.FD += fd; tot.BD += bd; tot.AU += au; tot.UX += ux; tot.sum += sum;
    rows.push(`| ${fn.id} | ${hp} | ${fd} | ${bd} | ${au} | ${ux}${sg ? ` (+${sg} SG/LOCK)` : ''} | **${sum}** |`);
  }
  rows.push(`| **Tổng** | ${tot.HP} | ${tot.FD} | ${tot.BD} | ${tot.AU} | ${tot.UX} | **${tot.sum}** |`);
  return { rows, total: tot.sum };
}

/** Mobile-specific case builders — returns {caps,fns,cases,specGaps} */
function buildMobile(uc) {
  const caps = [];
  const fns = [];
  const cases = [];
  const specGaps = [];
  const C = (id, name, purpose, actor) => caps.push({ id, name, purpose, actor });
  const F = (cap, id, name, ui, mutate) => fns.push({ cap, id, name, ui, mutate });
  const T = (t, n, p, steps, exp, fn, cap) => cases.push({ t, n, p, steps, exp, fn, cap });

  const tables = {
    'UC-HRM-MOB-01': () => {
      C('CAP-01', 'Đăng nhập ESS', 'Xác thực + JWT/memberships', 'NV');
      C('CAP-02', 'Làm mới phiên', 'Refresh SecureStore', 'NV · hệ thống');
      C('CAP-03', 'Chặn phiên lỗi', 'Sai MK / lockout / network', 'NV · hệ thống');
      F('CAP-01', 'FN-LOGIN', 'Submit login', 'POST …/auth/mobile/login', 'Y');
      F('CAP-01', 'FN-STORE', 'Lưu token an toàn', 'SecureStore', 'Y');
      F('CAP-02', 'FN-REFRESH', 'Refresh access', 'POST …/refresh', 'Y');
      F('CAP-03', 'FN-FAIL', 'Hiển thị lỗi đăng nhập', 'UI', 'N');
      F('CAP-03', 'FN-LOCK', 'Lockout sau N lần', 'API/UI', 'Y');
      T('HP', '001', 'P0', 'Login đúng credential → Home', '2xx + tokens + Home', 'FN-LOGIN', 'CAP-01');
      T('FD', '001', 'P0', 'Sai password', '4xx VI · không vào Home', 'FN-LOGIN', 'CAP-01');
      T('FD', '002', 'P0', 'Thiếu email/password', 'FE block', 'FN-LOGIN', 'CAP-01');
      T('BD', '001', 'P1', 'Password biên dài/ngắn', 'accept/reject documented', 'FN-LOGIN', 'CAP-01');
      T('AU', '001', 'P0', 'Sai tenant/company header', '403/409', 'FN-LOGIN', 'CAP-01');
      T('UX', '001', 'P1', 'Network down', 'HRM-MOB-ERR-NETWORK', 'FN-FAIL', 'CAP-03');
      T('HP', '002', 'P0', 'Kill-reopen còn session (refresh)', 'Home nếu refresh OK', 'FN-REFRESH', 'CAP-02');
      T('FD', '003', 'P0', 'Refresh hết hạn', 'force login · clear store', 'FN-REFRESH', 'CAP-02');
      T('HP', '003', 'P1', 'Refresh chỉ SecureStore', 'không AsyncStorage refresh', 'FN-STORE', 'CAP-01');
      T('UX', '002', 'P2', 'Loading khi login', 'không trắng', 'FN-LOGIN', 'CAP-01');
      T('FD', '004', 'P1', 'Lockout threshold', 'cooldown message', 'FN-LOCK', 'CAP-03');
      T('AU', '002', 'P1', 'Token không log plaintext', 'no secret in logs', 'FN-STORE', 'CAP-01');
    },
    'UC-HRM-MOB-02': () => {
      C('CAP-01', 'Chọn công ty', 'Multi-membership picker', 'NV kiêm nhiệm');
      C('CAP-02', 'Xác nhận scope', 'Gắn x-company-id', 'NV · hệ thống');
      C('CAP-03', 'Chặn lệch scope', '409/empty ngoài CT', 'hệ thống');
      F('CAP-01', 'FN-PICK', 'Mở danh sách membership', 'UI', 'N');
      F('CAP-02', 'FN-CONFIRM', 'Xác nhận CT active', 'UI/API', 'Y');
      F('CAP-03', 'FN-MISMATCH', 'Gọi API sai CT', 'API', 'Y');
      F('CAP-01', 'FN-SINGLE', '1 membership auto', 'UI', 'N');
      T('HP', '001', 'P0', '≥2 CT → chọn → confirm', 'Active CT · header khớp', 'FN-CONFIRM', 'CAP-02');
      T('HP', '002', 'P1', '1 membership auto', 'Home đúng CT', 'FN-SINGLE', 'CAP-01');
      T('FD', '001', 'P0', 'Bỏ confirm khi bắt buộc', 'không mutate ngoài CT', 'FN-CONFIRM', 'CAP-02');
      T('AU', '001', 'P0', 'Đổi CT rồi gọi list CT cũ', '404/409', 'FN-MISMATCH', 'CAP-03');
      T('AU', '002', 'P0', 'Member không rollup tập đoàn', '403/409/empty ADR', 'FN-MISMATCH', 'CAP-03');
      T('UX', '001', 'P1', 'Empty memberships', 'message · logout path', 'FN-PICK', 'CAP-01');
      T('UX', '002', 'P2', 'Loading memberships', 'shimmer', 'FN-PICK', 'CAP-01');
      T('BD', '001', 'P2', 'Nhiều membership (>5)', 'scroll/select OK', 'FN-PICK', 'CAP-01');
      T('HP', '003', 'P1', 'Persist CT sau kill-reopen', 'còn CT đã chọn', 'FN-CONFIRM', 'CAP-02');
      T('FD', '002', 'P1', 'CT inactive', 'reject + message', 'FN-CONFIRM', 'CAP-02');
      T('AU', '003', 'P1', 'Thiếu x-company-id mutate', '409', 'FN-MISMATCH', 'CAP-03');
      T('UX', '003', 'P2', 'Tên CT trên shell', 'user thấy CT active', 'FN-PICK', 'CAP-01');
    },
    'UC-HRM-MOB-03': () => {
      C('CAP-01', 'Xem Home ESS', 'Tóm tắt cá nhân', 'NV');
      C('CAP-02', 'Điều hướng tile', 'Vào leave/att/payslip', 'NV');
      C('CAP-03', 'Trạng thái lỗi/empty', 'Banner honest', 'NV');
      F('CAP-01', 'FN-LOAD', 'Load dashboard', 'GET summaries', 'N');
      F('CAP-02', 'FN-NAV', 'Tap tile/nav', 'UI', 'N');
      F('CAP-03', 'FN-ERR', 'API down', 'UI', 'N');
      T('HP', '001', 'P0', 'Home có tên NV + CT', 'content · không trắng', 'FN-LOAD', 'CAP-01');
      T('HP', '002', 'P1', 'Stats chấm công', 'số hoặc 0 hợp lệ', 'FN-LOAD', 'CAP-01');
      T('FD', '001', 'P0', 'API summary 500', 'banner · không fake data', 'FN-ERR', 'CAP-03');
      T('UX', '001', 'P0', 'Empty stats ngày mới', '0 / empty', 'FN-LOAD', 'CAP-03');
      T('UX', '002', 'P1', 'Pull-to-refresh', 'reload OK', 'FN-LOAD', 'CAP-01');
      T('HP', '003', 'P0', 'Tap Đi muộn → CreateUpdateRequest', 'land đúng', 'FN-NAV', 'CAP-02');
      T('HP', '004', 'P1', 'Tap nghỉ phép hub', 'Leave path', 'FN-NAV', 'CAP-02');
      T('AU', '001', 'P1', 'Scope CT trên Home', 'data đúng CT', 'FN-LOAD', 'CAP-01');
      T('BD', '001', 'P2', 'Tên NV dài', 'truncate OK', 'FN-LOAD', 'CAP-01');
      T('UX', '003', 'P2', 'Offline banner nếu cache', 'chỉ xem nếu P2', 'FN-ERR', 'CAP-03');
      T('HP', '005', 'P2', 'Manager entry phê duyệt', 'badge nếu isManager', 'FN-NAV', 'CAP-02');
      T('FD', '002', 'P2', 'Partial tile fail', 'lỗi cục bộ', 'FN-ERR', 'CAP-03');
    },
    'UC-HRM-MOB-04': () => {
      C('CAP-01', 'Chấm công vào', 'Ghi nhận điểm danh', 'NV ESS');
      C('CAP-02', 'Vị trí / GPS', 'Gắn coords', 'NV · hệ thống');
      C('CAP-03', 'Chặn sai điều kiện', 'Trùng / role', 'hệ thống');
      F('CAP-01', 'FN-OPEN', 'Mở CheckIn', 'UI', 'N');
      F('CAP-01', 'FN-CHECKIN', 'POST records', 'POST /attendance/records', 'Y');
      F('CAP-02', 'FN-GPS', 'Lấy vị trí', 'device', 'N');
      F('CAP-03', 'FN-ROLE', 'Ẩn FAB Leader', 'UI', 'N');
      F('CAP-03', 'FN-DUP', 'Chặn chấm trùng', 'API', 'Y');
      T('HP', '001', 'P0', 'CheckIn → Chấm công', '2xx · toast · history có', 'FN-CHECKIN', 'CAP-01');
      T('HP', '002', 'P0', 'J-MOB-02 GPS permission OK', 'coords/optional documented', 'FN-GPS', 'CAP-02');
      T('FD', '001', 'P0', 'Deny location khi bắt buộc', 'message · không silent', 'FN-GPS', 'CAP-02');
      T('FD', '002', 'P0', 'Chấm lần 2 cùng ca (nếu BR)', '4xx', 'FN-DUP', 'CAP-03');
      T('AU', '001', 'P0', 'Sai company header', '409', 'FN-CHECKIN', 'CAP-03');
      T('UX', '001', 'P1', 'Busy CTA', 'no double-submit', 'FN-CHECKIN', 'CAP-01');
      T('UX', '002', 'P1', 'API down', 'error rõ', 'FN-CHECKIN', 'CAP-01');
      T('BD', '001', 'P1', 'Biên giờ ca', 'documented', 'FN-CHECKIN', 'CAP-01');
      T('HP', '003', 'P1', 'Neo MOB-ATTENDANCE CheckIn', 'HDSD', 'FN-OPEN', 'CAP-01');
      T('FD', '003', 'P1', 'Leader không FAB check-in', 'ẩn/disabled', 'FN-ROLE', 'CAP-03');
      T('AU', '002', 'P2', 'Không ghi hộ NV khác', '403', 'FN-CHECKIN', 'CAP-03');
      T('UX', '003', 'P2', 'Success alert', 'dismiss OK', 'FN-CHECKIN', 'CAP-01');
      T('FD', '004', 'P2', 'Thiếu employee_id', 'block', 'FN-CHECKIN', 'CAP-03');
      T('HP', '004', 'P2', 'Offline queue nếu có', 'không claim nếu GAP', 'FN-CHECKIN', 'CAP-01');
    },
    'UC-HRM-MOB-05': () => {
      C('CAP-01', 'Xem lịch sử', 'Calendar + timeline', 'NV');
      C('CAP-02', 'Lọc ngày', 'Chi tiết ngày', 'NV');
      C('CAP-03', 'Chất lượng dữ liệu', 'Không epoch / format VI', 'hệ thống');
      F('CAP-01', 'FN-HIST', 'Mở AttendanceHistory', 'GET records', 'N');
      F('CAP-02', 'FN-DAY', 'Chọn ngày', 'UI', 'N');
      F('CAP-03', 'FN-FMT', 'Format ngày giờ', 'UI', 'N');
      T('HP', '001', 'P0', 'Lịch sử sau check-in', 'thấy bản ghi', 'FN-HIST', 'CAP-01');
      T('HP', '002', 'P1', 'Đổi tháng calendar', 'load đúng kỳ', 'FN-HIST', 'CAP-01');
      T('FD', '001', 'P0', 'API 500', 'banner', 'FN-HIST', 'CAP-01');
      T('UX', '001', 'P0', 'Ngày không có chấm', 'empty day', 'FN-DAY', 'CAP-02');
      T('UX', '002', 'P1', 'Shimmer loading', 'không trắng', 'FN-HIST', 'CAP-01');
      T('BD', '001', 'P1', 'Ngày đầu/cuối tháng', 'đúng', 'FN-DAY', 'CAP-02');
      T('AU', '001', 'P0', 'Không thấy CT khác', 'scope', 'FN-HIST', 'CAP-01');
      T('HP', '003', 'P0', 'Ngày ≠ 01/01/1970', 'dd/MM/yyyy HH:mm', 'FN-FMT', 'CAP-03');
      T('FD', '002', 'P1', 'Timestamp 0/null', '— không crash', 'FN-FMT', 'CAP-03');
      T('HP', '004', 'P2', 'Badge đi muộn/vắng', 'đúng enum', 'FN-HIST', 'CAP-01');
      T('UX', '003', 'P2', 'Pull refresh', 'OK', 'FN-HIST', 'CAP-01');
      T('AU', '002', 'P2', 'Deep link history', 'đúng NV', 'FN-HIST', 'CAP-01');
    },
    'UC-HRM-MOB-06': () => {
      C('CAP-01', 'Tạo đơn chỉnh CC / đi muộn', 'NV đăng ký sửa giờ', 'NV');
      C('CAP-02', 'Tạo đơn nghỉ phép', 'NV đăng ký nghỉ', 'NV');
      C('CAP-03', 'Validate nộp', 'Field / balance / notice', 'hệ thống');
      C('CAP-04', 'Giấy tờ nghỉ', 'Upload path hợp lệ', 'NV');
      C('CAP-05', 'L2 ladder (TO-BE)', 'Duyệt cấp 2 vượt ngưỡng', 'L2 · SPEC_GAP');
      F('CAP-01', 'FN-ATT-NAV', 'Mở CreateUpdateRequest', 'UI MOB-ATTENDANCE', 'N');
      F('CAP-01', 'FN-ATT-CREATE', 'Gửi update-request', 'POST …/update-requests', 'Y');
      F('CAP-02', 'FN-LV-NAV', 'Mở CreateLeaveRequest', 'UI MOB-LEAVE-APPR', 'N');
      F('CAP-02', 'FN-LV-CREATE', 'Gửi leave-request', 'POST …/leave-requests', 'Y');
      F('CAP-03', 'FN-VAL', 'Validate date/reason/type', 'API/UI', 'Y');
      F('CAP-04', 'FN-ATTACH', 'Upload leave attachment', 'POST …/files/upload', 'Y');
      F('CAP-05', 'FN-L2', 'Approve L2', 'API', 'Y');
      specGaps.push('FN-L2 / CAP-05 — ladder L2 AS-IS 1 bước: inventory TC only, không PASS / không invent T_L1/N');
      T('HP', '001', 'P0', 'ATT: FAB → Đơn công → ISO giờ + lý do → Gửi', '201 HRM-ATT-REQ-201 · pending · F5', 'FN-ATT-CREATE', 'CAP-01');
      T('HP', '002', 'P0', 'LEAVE: wizard 4 bước → Gửi phép năm', '2xx pending · list · F5', 'FN-LV-CREATE', 'CAP-02');
      T('HP', '003', 'P0', 'Neo MOB-ATTENDANCE CreateUpdateRequest', 'land HDSD', 'FN-ATT-NAV', 'CAP-01');
      T('HP', '004', 'P0', 'Neo MOB-LEAVE-APPR CreateLeaveRequest', 'wizard OK', 'FN-LV-NAV', 'CAP-02');
      T('FD', '001', 'P0', 'ATT thiếu ngày/lý do', '4xx · không row', 'FN-VAL', 'CAP-03');
      T('FD', '002', 'P0', 'ATT giờ HH:mm trần', '4xx (không 500)', 'FN-VAL', 'CAP-03');
      T('FD', '003', 'P0', 'LEAVE thiếu loại/ngày', 'FE/API block', 'FN-VAL', 'CAP-03');
      T('FD', '004', 'P0', 'LEAVE ốm ≥3d thiếu attach', '4xx', 'FN-ATTACH', 'CAP-04');
      T('FD', '005', 'P0', 'LEAVE vượt số dư', '4xx', 'FN-VAL', 'CAP-03');
      T('FD', '006', 'P0', 'LEAVE overlap pending', '4xx', 'FN-VAL', 'CAP-03');
      T('FD', '007', 'P1', 'LEAVE phép năm <3d notice', '4xx hoặc soft documented', 'FN-VAL', 'CAP-03');
      T('FD', '008', 'P0', 'Attach URL ngoài /api/hrm/files/', '4xx', 'FN-ATTACH', 'CAP-04');
      T('BD', '001', 'P0', 'ATT ISO TIMESTAMPTZ', '201', 'FN-ATT-CREATE', 'CAP-01');
      T('BD', '002', 'P1', 'LEAVE total_days=1', '2xx', 'FN-LV-CREATE', 'CAP-02');
      T('BD', '003', 'P1', 'LEAVE biên số dư còn 1', '2xx', 'FN-VAL', 'CAP-03');
      T('AU', '001', 'P0', 'Tạo đơn gắn CT khác', '403/409', 'FN-ATT-CREATE', 'CAP-01');
      T('AU', '002', 'P1', 'Member scope leave', 'không persist ngoài CT', 'FN-LV-CREATE', 'CAP-02');
      T('UX', '001', 'P1', 'WF spawn missing', 'SPAWN-MISSING honest', 'FN-LV-CREATE', 'CAP-02');
      T('UX', '002', 'P1', 'Busy submit', '1 request', 'FN-ATT-CREATE', 'CAP-01');
      T('UX', '003', 'P2', 'Empty balance header', '0/—', 'FN-LV-NAV', 'CAP-02');
      T('HP', '005', 'P1', 'Upload attach sick OK', '2xx + create', 'FN-ATTACH', 'CAP-04');
      T('FD', '009', 'P2', 'File >10MB / sai MIME', 'reject', 'FN-ATTACH', 'CAP-04');
      T('SG', '001', 'P2', 'SPEC_GAP inventory: đơn vượt ngưỡng cần L2', 'BLOCKED — không claim PASS', 'FN-L2', 'CAP-05');
      T('SG', '002', 'P2', 'SPEC_GAP inventory: sau L1 chưa terminal khi vượt N', 'BLOCKED design only', 'FN-L2', 'CAP-05');
      T('HP', '006', 'P1', 'Persona uat.nv0003 → manager uat.nv0001', 'manager_id lock', 'FN-LV-CREATE', 'CAP-02');
      T('FD', '010', 'P1', 'Cancel/edit own pending illegal', '4xx', 'FN-LV-CREATE', 'CAP-02');
    },
    'UC-HRM-MOB-07': () => {
      C('CAP-01', 'Danh sách đơn của tôi', 'Leave + update-request', 'NV');
      C('CAP-02', 'Chi tiết đơn', 'List→detail J-MOB-03', 'NV');
      C('CAP-03', 'Trạng thái / filter', 'Tabs pending/approved', 'NV');
      F('CAP-01', 'FN-LIST', 'Mở list đơn', 'GET', 'N');
      F('CAP-02', 'FN-DET', 'Mở detail', 'GET by id', 'N');
      F('CAP-03', 'FN-FILTER', 'Đổi tab/filter', 'UI', 'N');
      T('HP', '001', 'P0', 'Sau create → list thấy đơn', 'row pending', 'FN-LIST', 'CAP-01');
      T('HP', '002', 'P0', 'Tap row → detail', 'J-MOB-03 không 404', 'FN-DET', 'CAP-02');
      T('FD', '001', 'P0', 'Detail id ngoài scope', '404/409', 'FN-DET', 'CAP-02');
      T('UX', '001', 'P0', 'Empty list', 'CTA tạo đơn', 'FN-LIST', 'CAP-01');
      T('UX', '002', 'P1', 'Error banner API', 'không trắng', 'FN-LIST', 'CAP-01');
      T('HP', '003', 'P1', 'Filter Nghỉ / Chỉnh CC', 'đúng loại', 'FN-FILTER', 'CAP-03');
      T('HP', '004', 'P1', 'Tab approved sau duyệt', 'thấy status', 'FN-FILTER', 'CAP-03');
      T('AU', '001', 'P0', 'Không thấy đơn CT khác', 'scope', 'FN-LIST', 'CAP-01');
      T('BD', '001', 'P2', 'Nhiều trang', 'pagination', 'FN-LIST', 'CAP-01');
      T('UX', '003', 'P2', 'Pull refresh', 'OK', 'FN-LIST', 'CAP-01');
      T('HP', '005', 'P1', 'Swipe/actions trên list', 'documented', 'FN-LIST', 'CAP-01');
      T('FD', '002', 'P2', 'Stale id sau soft-delete', '404 honest', 'FN-DET', 'CAP-02');
    },
    'UC-HRM-MOB-08': () => {
      C('CAP-01', 'Hàng chờ QL', 'ManagerApprovals', 'QL uat.nv0001');
      C('CAP-02', 'Duyệt L1', 'Approve leave/att', 'QL');
      C('CAP-03', 'Từ chối L1', 'Reject + lý do', 'QL');
      C('CAP-04', 'Chống gian lận', 'Self-approve · sai CT', 'hệ thống');
      C('CAP-05', 'L2 SPEC_GAP', 'Ladder cấp 2', 'SPEC_GAP');
      F('CAP-01', 'FN-INBOX', 'Mở ManagerApprovals', 'GET pending', 'N');
      F('CAP-02', 'FN-APPR', 'Duyệt', 'POST approve', 'Y');
      F('CAP-03', 'FN-REJ', 'Từ chối', 'POST reject', 'Y');
      F('CAP-04', 'FN-SELF', 'Chặn tự duyệt', 'API', 'Y');
      F('CAP-05', 'FN-L2', 'Duyệt L2', 'API', 'Y');
      specGaps.push('L2 approve/hold — SPEC_GAP inventory; không PASS');
      T('HP', '001', 'P0', 'QL mở inbox thấy đơn NV', 'cards pending', 'FN-INBOX', 'CAP-01');
      T('HP', '002', 'P0', 'Duyệt leave L1 mobile', '2xx · approved · badge↓ · F5', 'FN-APPR', 'CAP-02');
      T('HP', '003', 'P0', 'Duyệt att update L1', '203 HRM-ATT-REQ-203 · F5', 'FN-APPR', 'CAP-02');
      T('HP', '004', 'P0', 'J-MOB-05 Duyệt/Từ chối', 'HDSD neo MOB-LEAVE-APPR', 'FN-APPR', 'CAP-02');
      T('FD', '001', 'P0', 'Duyệt 2 lần', '4xx/no-op', 'FN-APPR', 'CAP-02');
      T('FD', '002', 'P0', 'Từ chối thiếu lý do (nếu BR)', '4xx', 'FN-REJ', 'CAP-03');
      T('HP', '005', 'P1', 'Từ chối + lý do đủ', 'rejected · F5', 'FN-REJ', 'CAP-03');
      T('AU', '001', 'P0', 'Self-approve bị chặn', '4xx BR-WF-04', 'FN-SELF', 'CAP-04');
      T('AU', '002', 'P0', 'Duyệt sai CT / thiếu x-company-id', '409', 'FN-APPR', 'CAP-04');
      T('AU', '003', 'P0', 'cấm ceo@ làm L1 leave', 'persona lock', 'FN-APPR', 'CAP-04');
      T('UX', '001', 'P1', 'Empty inbox', 'empty — không seed', 'FN-INBOX', 'CAP-01');
      T('UX', '002', 'P1', 'Sau duyệt row khỏi pending', 'UI update', 'FN-APPR', 'CAP-02');
      T('SG', '001', 'P2', 'SPEC_GAP L2 approve inventory', 'BLOCKED not PASS', 'FN-L2', 'CAP-05');
      T('SG', '002', 'P2', 'SPEC_GAP L2 hold inventory', 'BLOCKED not PASS', 'FN-L2', 'CAP-05');
      T('FD', '003', 'P1', 'Reject lý do quá ngắn', '4xx nếu rule', 'FN-REJ', 'CAP-03');
      T('AU', '004', 'P1', 'QL CT khác không thấy đơn', 'empty/403', 'FN-INBOX', 'CAP-04');
      T('HP', '006', 'P2', 'Confirm modal approve/decline', 'ConfirmActionModal', 'FN-APPR', 'CAP-02');
      T('UX', '003', 'P2', 'Filter tab Nghỉ vs Chỉnh CC', 'đúng pack neo', 'FN-INBOX', 'CAP-01');
    },
    'UC-HRM-MOB-09': () => {
      C('CAP-01', 'Xem tóm tắt lương', 'Payslip theo kỳ', 'NV');
      C('CAP-02', 'Chi tiết phiếu', 'Net/gross / khấu trừ', 'NV');
      C('CAP-03', 'Bảo mật & format', 'Chỉ own · vi-VN money', 'hệ thống');
      F('CAP-01', 'FN-SUM', 'Mở tóm tắt kỳ', 'GET payroll summary', 'N');
      F('CAP-02', 'FN-DET', 'Xem chi tiết dòng', 'UI', 'N');
      F('CAP-03', 'FN-FMT', 'Format tiền', 'UI', 'N');
      F('CAP-03', 'FN-SCOPE', 'Chỉ phiếu của mình', 'API', 'N');
      T('HP', '001', 'P0', 'Mở Payslip kỳ hiện tại', 'tóm tắt hoặc empty hợp lệ', 'FN-SUM', 'CAP-01');
      T('HP', '002', 'P0', 'J-MOB-04 deep link nếu có', 'land đúng', 'FN-SUM', 'CAP-01');
      T('HP', '003', 'P1', 'Chọn kỳ khác', 'load đúng period', 'FN-SUM', 'CAP-01');
      T('FD', '001', 'P0', 'API 500/partial', 'banner · không số bịa', 'FN-SUM', 'CAP-01');
      T('UX', '001', 'P0', 'Chưa có phiếu kỳ', 'empty honest', 'FN-SUM', 'CAP-01');
      T('AU', '001', 'P0', 'Không xem phiếu NV khác', '403/404', 'FN-SCOPE', 'CAP-03');
      T('AU', '002', 'P1', 'Sai company scope', '409/empty', 'FN-SCOPE', 'CAP-03');
      T('HP', '004', 'P1', 'Chi tiết khấu trừ/gross', 'dòng bind', 'FN-DET', 'CAP-02');
      T('BD', '001', 'P1', 'Money grouping vi-VN', 'hiển thị đúng', 'FN-FMT', 'CAP-03');
      T('FD', '002', 'P1', 'Null amount', '— không NaN', 'FN-FMT', 'CAP-03');
      T('UX', '002', 'P2', 'Loading shimmer', 'OK', 'FN-SUM', 'CAP-01');
      T('UX', '003', 'P2', 'Pull refresh', 'OK', 'FN-SUM', 'CAP-01');
      T('HP', '005', 'P2', 'Kỳ đã chốt vs draft', 'label trạng thái', 'FN-SUM', 'CAP-01');
      T('FD', '003', 'P2', 'Period invalid', '4xx', 'FN-SUM', 'CAP-01');
    },
    'UC-HRM-MOB-10': () => {
      C('CAP-01', 'Xem HĐ của tôi', 'Contract read', 'NV');
      C('CAP-02', 'Xem BH', 'Insurance read', 'NV');
      C('CAP-03', 'Format / scope', 'Date VI · own only', 'hệ thống');
      F('CAP-01', 'FN-CTR', 'List/detail HĐ', 'GET', 'N');
      F('CAP-02', 'FN-INS', 'Xem BH', 'GET', 'N');
      F('CAP-03', 'FN-FMT', 'dd/MM/yyyy', 'UI', 'N');
      T('HP', '001', 'P0', 'Mở HĐ/BH từ Profile', 'HĐ active hoặc empty', 'FN-CTR', 'CAP-01');
      T('HP', '002', 'P1', 'Chi tiết HĐ', 'số HĐ · ngày hiệu lực', 'FN-CTR', 'CAP-01');
      T('HP', '003', 'P1', 'Thông tin BHXH', 'sổ / trạng thái', 'FN-INS', 'CAP-02');
      T('FD', '001', 'P0', 'API fail', 'banner', 'FN-CTR', 'CAP-01');
      T('UX', '001', 'P0', 'Chưa có HĐ', 'empty', 'FN-CTR', 'CAP-01');
      T('AU', '001', 'P0', 'Không xem HĐ NV khác', '403/404', 'FN-CTR', 'CAP-03');
      T('BD', '001', 'P1', 'Ngày hết hạn biên', 'format đúng', 'FN-FMT', 'CAP-03');
      T('FD', '002', 'P1', 'Null date', '—', 'FN-FMT', 'CAP-03');
      T('UX', '002', 'P2', 'Loading', 'OK', 'FN-CTR', 'CAP-01');
      T('HP', '004', 'P2', 'Neo MOB-PROFILE', 'entry đúng', 'FN-CTR', 'CAP-01');
      T('AU', '002', 'P2', 'Sai CT', 'empty/409', 'FN-CTR', 'CAP-03');
      T('UX', '003', 'P2', 'Pull refresh', 'OK', 'FN-INS', 'CAP-02');
    },
    'UC-HRM-MOB-11': () => {
      C('CAP-01', 'Xem việc được giao', 'Ops list', 'NV · QL');
      C('CAP-02', 'Cập nhật trạng thái', 'SM task', 'NV');
      C('CAP-03', 'Tạo/yêu cầu dịch vụ', 'Create nếu UI', 'NV · QL');
      F('CAP-01', 'FN-LIST', 'List tasks', 'GET', 'N');
      F('CAP-02', 'FN-STATUS', 'Update status', 'PATCH', 'Y');
      F('CAP-03', 'FN-CREATE', 'Create task/request', 'POST', 'Y');
      T('HP', '001', 'P0', 'Mở Operations/Tasks', 'list hoặc empty', 'FN-LIST', 'CAP-01');
      T('HP', '002', 'P0', 'Đổi trạng thái hợp lệ', '2xx · F5', 'FN-STATUS', 'CAP-02');
      T('FD', '001', 'P0', 'Chuyển trạng thái illegal', '4xx', 'FN-STATUS', 'CAP-02');
      T('HP', '003', 'P1', 'Tạo việc (nếu UI)', '2xx · list có', 'FN-CREATE', 'CAP-03');
      T('FD', '002', 'P1', 'Tạo thiếu tiêu đề', '4xx', 'FN-CREATE', 'CAP-03');
      T('AU', '001', 'P0', 'Không thấy việc CT khác', 'scope', 'FN-LIST', 'CAP-01');
      T('UX', '001', 'P0', 'Empty', 'empty', 'FN-LIST', 'CAP-01');
      T('UX', '002', 'P1', 'Error API', 'banner', 'FN-LIST', 'CAP-01');
      T('BD', '001', 'P2', 'Title dài', 'truncate/reject', 'FN-CREATE', 'CAP-03');
      T('HP', '004', 'P2', 'Neo MOB-OPERATIONS', 'HDSD', 'FN-LIST', 'CAP-01');
      T('AU', '002', 'P1', 'Assignee only update own', '403 nếu sửa hộ', 'FN-STATUS', 'CAP-02');
      T('UX', '003', 'P2', 'Pull refresh', 'OK', 'FN-LIST', 'CAP-01');
      T('FD', '003', 'P2', 'Double status tap', 'idempotent/4xx', 'FN-STATUS', 'CAP-02');
      T('HP', '005', 'P2', 'Filter theo trạng thái', 'đúng', 'FN-LIST', 'CAP-01');
    },
    'UC-HRM-MOB-12': () => {
      C('CAP-01', 'Xem hồ sơ', 'Profile read', 'NV');
      C('CAP-02', 'Cập nhật field cho phép', 'Edit own', 'NV');
      C('CAP-03', 'Yêu cầu đổi metadata', 'MD-01 bridge', 'NV');
      F('CAP-01', 'FN-VIEW', 'Mở profile', 'GET', 'N');
      F('CAP-02', 'FN-EDIT', 'Lưu field ESS', 'PATCH', 'Y');
      F('CAP-03', 'FN-MD', 'Gửi yêu cầu MD', 'POST', 'Y');
      T('HP', '001', 'P0', 'Mở Profile', 'họ tên · mã NV', 'FN-VIEW', 'CAP-01');
      T('HP', '002', 'P0', 'Sửa field cho phép → Lưu', '2xx · F5', 'FN-EDIT', 'CAP-02');
      T('FD', '001', 'P0', 'Sửa field bị khóa', '4xx/disabled', 'FN-EDIT', 'CAP-02');
      T('HP', '003', 'P1', 'Gửi yêu cầu đổi metadata', '2xx pending', 'FN-MD', 'CAP-03');
      T('FD', '002', 'P1', 'MD thiếu lý do/value', '4xx', 'FN-MD', 'CAP-03');
      T('AU', '001', 'P0', 'Không sửa NV khác', '403', 'FN-EDIT', 'CAP-02');
      T('UX', '001', 'P1', 'Empty optional', '—', 'FN-VIEW', 'CAP-01');
      T('UX', '002', 'P1', 'API fail', 'banner', 'FN-VIEW', 'CAP-01');
      T('BD', '001', 'P2', 'Phone/email format', 'validate', 'FN-EDIT', 'CAP-02');
      T('HP', '004', 'P2', 'Neo MOB-PROFILE', 'HDSD', 'FN-VIEW', 'CAP-01');
      T('FD', '003', 'P2', 'PII mask trên log', 'no leak', 'FN-VIEW', 'CAP-01');
      T('AU', '002', 'P2', 'Scope CT', 'đúng CT', 'FN-VIEW', 'CAP-01');
    },
    'UC-HRM-MOB-13': () => {
      C('CAP-01', 'Inbox in-app', 'GET notifications', 'NV · QL');
      C('CAP-02', 'Realtime', 'Socket hrm:event', 'NV · QL');
      C('CAP-03', 'Push (P1)', 'FCM/APNs optional', 'P1 LOCK');
      F('CAP-01', 'FN-INBOX', 'Mở inbox', 'GET …/notifications/inbox', 'N');
      F('CAP-01', 'FN-READ', 'Đánh dấu đã đọc', 'PATCH …/read', 'Y');
      F('CAP-02', 'FN-SOCK', 'Nhận event → refresh', 'socket', 'N');
      F('CAP-03', 'FN-PUSH', 'Đăng ký push-token', 'POST push-tokens', 'Y');
      T('HP', '001', 'P0', 'Mở inbox thông báo', 'list hoặc empty', 'FN-INBOX', 'CAP-01');
      T('HP', '002', 'P0', 'Mark read', '2xx · UI cập nhật', 'FN-READ', 'CAP-01');
      T('FD', '001', 'P1', 'Mark read id lạ', '404', 'FN-READ', 'CAP-01');
      T('HP', '003', 'P1', 'Realtime event → refresh', 'UI cập nhật (REST SoT)', 'FN-SOCK', 'CAP-02');
      T('FD', '002', 'P1', 'Socket disconnect', 'app vẫn REST OK', 'FN-SOCK', 'CAP-02');
      T('UX', '001', 'P0', 'Empty inbox', 'empty — không seed', 'FN-INBOX', 'CAP-01');
      T('UX', '002', 'P1', 'Deep link notif → ManagerApprovals', 'land đúng', 'FN-INBOX', 'CAP-01');
      T('AU', '001', 'P0', 'Không thấy notif CT khác', 'scope', 'FN-INBOX', 'CAP-01');
      T('SG', '001', 'P2', 'Push P1 LOCK inventory', 'không claim EVIDENCED nếu chưa ship', 'FN-PUSH', 'CAP-03');
      T('HP', '004', 'P2', 'Register push token opt-in', '2xx nếu endpoint có', 'FN-PUSH', 'CAP-03');
      T('FD', '003', 'P2', 'Token invalid', '4xx', 'FN-PUSH', 'CAP-03');
      T('UX', '003', 'P2', 'Badge count', 'đúng pending', 'FN-INBOX', 'CAP-01');
    },
    'UC-HRM-MOB-14': () => {
      C('CAP-01', 'Đọc cache offline', 'Read-model TTL', 'NV');
      C('CAP-02', 'Chặn mutate offline', 'Không POST giả thành công', 'hệ thống');
      C('CAP-03', 'Banner chỉ xem', 'UX honest', 'NV');
      F('CAP-01', 'FN-CACHE', 'Xem dữ liệu đã sync', 'cache', 'N');
      F('CAP-02', 'FN-BLOCK', 'Thử gửi đơn offline', 'UI', 'Y');
      F('CAP-03', 'FN-BANNER', 'Banner offline', 'UI', 'N');
      specGaps.push('P2 offline — nhiều nhánh GAP vs TECHSPEC_MOBILE §8');
      T('HP', '001', 'P1', 'Airplane sau sync → History cache', 'read-model hoặc empty honest', 'FN-CACHE', 'CAP-01');
      T('FD', '001', 'P0', 'Gửi leave/att offline', 'block · không fake 2xx', 'FN-BLOCK', 'CAP-02');
      T('FD', '002', 'P0', 'Check-in offline', 'queue documented hoặc block', 'FN-BLOCK', 'CAP-02');
      T('UX', '001', 'P0', 'Banner «chỉ xem»', 'hiện khi cache', 'FN-BANNER', 'CAP-03');
      T('UX', '002', 'P1', 'Hết TTL cache', 'force online/error', 'FN-CACHE', 'CAP-01');
      T('AU', '001', 'P2', 'Cache không lẫn CT', 'scope', 'FN-CACHE', 'CAP-01');
      T('BD', '001', 'P2', 'Cache size max', 'evict documented', 'FN-CACHE', 'CAP-01');
      T('SG', '001', 'P2', 'SPEC_GAP: offline queue mutate chưa ship', 'inventory BLOCKED', 'FN-BLOCK', 'CAP-02');
      T('HP', '002', 'P2', 'Reconnect → sync pull', 'REST refresh', 'FN-CACHE', 'CAP-01');
      T('FD', '003', 'P2', 'Corrupt cache', 'safe clear', 'FN-CACHE', 'CAP-01');
      T('UX', '003', 'P2', 'Settings offline mode', 'nếu có', 'FN-BANNER', 'CAP-03');
      T('HP', '003', 'P2', 'Payslip cache read-only', 'không edit', 'FN-CACHE', 'CAP-01');
    },
    'UC-HRM-MOB-15': () => {
      C('CAP-01', 'Đăng xuất cục bộ', 'Xóa token SecureStore', 'NV');
      C('CAP-02', 'Thu hồi từ xa', 'Revoke nếu API có', 'NV · hệ thống');
      C('CAP-03', 'Sau logout', 'Không gọi API authenticated', 'hệ thống');
      F('CAP-01', 'FN-LOGOUT', 'Tap Đăng xuất', 'UI', 'Y');
      F('CAP-02', 'FN-REVOKE', 'Gọi revoke', 'API optional', 'Y');
      F('CAP-03', 'FN-GUARD', 'Chặn vào Home sau logout', 'UI', 'N');
      T('HP', '001', 'P0', 'Đăng xuất → login', 'tokens cleared', 'FN-LOGOUT', 'CAP-01');
      T('HP', '002', 'P0', 'Kill-reopen sau logout', 'login screen', 'FN-GUARD', 'CAP-03');
      T('FD', '001', 'P1', 'Logout khi API down', 'vẫn clear local', 'FN-LOGOUT', 'CAP-01');
      T('SG', '001', 'P2', 'Remote revoke thiếu', 'GAP inventory — fallback local', 'FN-REVOKE', 'CAP-02');
      T('AU', '001', 'P0', 'Access token cũ sau logout', '401', 'FN-GUARD', 'CAP-03');
      T('UX', '001', 'P1', 'Confirm dialog logout', 'confirm/cancel', 'FN-LOGOUT', 'CAP-01');
      T('HP', '003', 'P1', 'Clear refresh SecureStore', 'không auto-login', 'FN-LOGOUT', 'CAP-01');
      T('FD', '002', 'P2', 'Double tap logout', 'idempotent', 'FN-LOGOUT', 'CAP-01');
      T('UX', '002', 'P2', 'Loading logout', 'OK', 'FN-LOGOUT', 'CAP-01');
      T('AU', '002', 'P2', 'Deep link sau logout', 'login · không lộ data', 'FN-GUARD', 'CAP-03');
      T('HP', '004', 'P2', 'Multi-account switch', 'clear trước login mới', 'FN-LOGOUT', 'CAP-01');
      T('FD', '003', 'P2', 'Revoke 4xx vẫn local clear', 'honest', 'FN-REVOKE', 'CAP-02');
    },
  };

  const fn = tables[uc.id];
  if (!fn) throw new Error('Missing mobile builder for ' + uc.id);
  fn();
  return { caps, fns, cases, specGaps };
}

function buildGeneric(uc) {
  const caps = [];
  const fns = [];
  const cases = [];
  const specGaps = [];
  const C = (id, name, purpose, actor) => caps.push({ id, name, purpose, actor });
  const F = (cap, id, name, ui, mutate) => fns.push({ cap, id, name, ui, mutate });
  const T = (t, n, p, steps, exp, fn, cap) => cases.push({ t, n, p, steps, exp, fn, cap });

  C('CAP-01', `Thực hiện ${uc.name}`, 'Mục tiêu chính UC', 'primary actor');
  C('CAP-02', 'Kiểm soát dữ liệu / BR', 'Validate · biên · trạng thái', 'hệ thống');
  C('CAP-03', 'Phạm vi & quyền', 'RBAC · company scope', 'hệ thống');
  if (['wf', 'mutate'].includes(uc.depth)) C('CAP-04', 'Phản hồi FE sau mutate', 'List/detail/F5 sau 2xx', 'user');
  if (uc.depth === 'embed') C('CAP-04', 'Cross-nav embed', 'Tab load + list→detail', 'user');
  if (uc.depth === 'report') C('CAP-04', 'Bộ lọc & xuất', 'Filter kỳ / export', 'user');
  if (uc.depth === 'soft') C('CAP-04', 'Phản hồi FE sau soft-delete', 'List ẩn row · F5', 'user');

  F('CAP-01', 'FN-OPEN', 'Mở màn/HDSD path', 'UI', 'N');
  F('CAP-01', 'FN-MAIN', ['read', 'report', 'embed'].includes(uc.depth) ? 'Xem/tải dữ liệu chính' : 'Thực hiện hành động chính', 'UI/API', ['read', 'report', 'embed'].includes(uc.depth) ? 'N' : 'Y');
  F('CAP-02', 'FN-VAL', 'Validate / BR fail-deep', 'API/UI', 'Y');
  F('CAP-03', 'FN-SCOPE', 'Auth/scope', 'API', 'Y');
  F('CAP-01', 'FN-DETAIL', 'List→detail / deep link', 'UI/API', 'N');
  if (uc.depth === 'wf') {
    F('CAP-01', 'FN-APPR', 'Duyệt / bước WF', 'UI/API', 'Y');
    F('CAP-01', 'FN-REJ', 'Từ chối WF', 'UI/API', 'Y');
  }
  if (uc.depth === 'soft') {
    F('CAP-01', 'FN-SOFT', 'Soft-delete', 'API', 'Y');
    F('CAP-02', 'FN-HARD', 'Chặn hard-delete', 'API', 'Y');
  }
  if (uc.depth === 'embed') {
    F('CAP-04', 'FN-TAB', 'Load tab embed', 'UI', 'N');
    F('CAP-04', 'FN-J', 'Journey L2.5', 'UI', 'N');
  }
  if (uc.depth === 'report') {
    F('CAP-04', 'FN-FILTER', 'Lọc kỳ/CT', 'UI', 'N');
    F('CAP-04', 'FN-EXPORT', 'Export nếu có', 'UI/API', 'N');
  }
  if (uc.depth === 'mutate' || uc.depth === 'wf' || uc.depth === 'soft') {
    F('CAP-04', 'FN-FE', 'FE sau 2xx + F5', 'UI', 'N');
  }

  T('HP', '001', 'P0', `Login persona → menu SRS → ${uc.name} (HDSD)`, 'land đúng màn · không banner ERROR', 'FN-OPEN', 'CAP-01');
  if (['read', 'report', 'embed'].includes(uc.depth)) {
    T('HP', '002', 'P0', 'Tải dữ liệu chính / list', '2xx · FE bind · empty hợp lệ nếu 0', 'FN-MAIN', 'CAP-01');
  } else {
    T('HP', '002', 'P0', 'Thực hiện mutate chính → Lưu/Gửi', '2xx mã nghiệp vụ · FE cập nhật · F5 còn', 'FN-MAIN', 'CAP-01');
  }
  T('FD', '001', 'P0', 'Thiếu field bắt buộc / BR sai', '4xx · không persist', 'FN-VAL', 'CAP-02');
  T('FD', '002', 'P1', 'Trạng thái illegal (đã chốt/đã xóa/đã duyệt)', '4xx deterministic', 'FN-VAL', 'CAP-02');
  T('AU', '001', 'P0', 'Sai company / member vượt scope', '403/409 · không lộ data', 'FN-SCOPE', 'CAP-03');
  T('AU', '002', 'P1', 'Role không đủ quyền', '403 · nút ẩn/disabled', 'FN-SCOPE', 'CAP-03');
  T('UX', '001', 'P1', 'Empty state', 'empty hợp lệ · không spinner vĩnh viễn', 'FN-MAIN', 'CAP-01');
  T('UX', '002', 'P1', 'API 500 / sync error', 'banner honest', 'FN-MAIN', 'CAP-01');
  T('HP', '003', 'P1', 'List→detail hoặc deep link', 'không 404 scope_parity', 'FN-DETAIL', 'CAP-01');
  T('BD', '001', 'P1', 'Biên ngày/số/tiền (vi-VN)', 'accept/reject documented', 'FN-VAL', 'CAP-02');

  if (['mutate', 'wf', 'soft'].includes(uc.depth)) {
    T('HP', '004', 'P0', 'FE sau 2xx: row/toast/state', 'quan sát UI · F5', 'FN-FE', 'CAP-04');
    T('FD', '003', 'P1', 'Double submit', 'idempotent/4xx', 'FN-MAIN', 'CAP-01');
    T('BD', '002', 'P2', 'Boundary độ dài lý do/tên', 'documented', 'FN-VAL', 'CAP-02');
    T('AU', '003', 'P1', 'Group CEO main vs member slug', 'rollup đúng ADR', 'FN-SCOPE', 'CAP-03');
    T('UX', '003', 'P2', 'Loading/busy CTA', 'no double', 'FN-MAIN', 'CAP-01');
  }
  if (uc.depth === 'wf') {
    T('HP', '005', 'P0', 'Duyệt bước WF (inbox/UI) từ nguồn FE', '2xx · F5 trạng thái', 'FN-APPR', 'CAP-01');
    T('HP', '006', 'P1', 'Từ chối + lý do', 'rejected · F5', 'FN-REJ', 'CAP-01');
    T('FD', '004', 'P0', 'Duyệt khi inbox trống', 'BLOCKED honest — không seed', 'FN-APPR', 'CAP-01');
    T('AU', '004', 'P0', 'Self-approve nếu áp dụng', '4xx', 'FN-APPR', 'CAP-03');
    T('UX', '004', 'P2', 'Badge/inbox count sau duyệt', 'giảm', 'FN-APPR', 'CAP-01');
  }
  if (uc.depth === 'soft') {
    T('HP', '005', 'P0', 'Soft-delete', '2xx · ẩn khỏi list active · F5', 'FN-SOFT', 'CAP-01');
    T('FD', '004', 'P0', 'Hard-delete attempt', 'forbidden 4xx', 'FN-HARD', 'CAP-02');
    T('AU', '004', 'P1', 'Xóa ngoài quyền', '403', 'FN-SOFT', 'CAP-03');
  }
  if (uc.depth === 'embed') {
    T('HP', '004', 'P0', 'Tab embed load P-CC / HRM', 'không 409/54321 bắt buộc', 'FN-TAB', 'CAP-04');
    T('HP', '005', 'P0', 'L2.5 click path list→detail', 'PASS URL+API', 'FN-J', 'CAP-04');
    T('FD', '003', 'P0', 'HRM API down (:28001)', 'banner Sync ERROR · không pretend OK', 'FN-TAB', 'CAP-04');
    T('AU', '003', 'P0', 'member CEO vs ceo@xe.vn scope', 'đúng ADR', 'FN-SCOPE', 'CAP-03');
    T('UX', '003', 'P1', 'iframe/proxy reload F5', 'data còn/empty hợp lệ', 'FN-TAB', 'CAP-04');
    if (uc.id === 'UC-HRM-27') {
      T('SG', '001', 'P2', 'Backlog/waived — inventory GAP', 'không claim UAT', 'FN-MAIN', 'CAP-01');
      specGaps.push('UC-HRM-27 backlog/waived — GAP inventory');
    }
    if (uc.id === 'UC-HRM-23') {
      T('FD', '004', 'P0', 'Công chuẩn empty + auto-reload storm', 'FAIL nghiệp vụ dù console sạch', 'FN-MAIN', 'CAP-01');
    }
  }
  if (uc.depth === 'report') {
    T('HP', '004', 'P1', 'Đổi bộ lọc kỳ/CT', 'số liệu khớp filter', 'FN-FILTER', 'CAP-04');
    T('HP', '005', 'P2', 'Export nếu có', 'file/2xx', 'FN-EXPORT', 'CAP-04');
    T('BD', '002', 'P1', 'Kỳ biên (tháng 1 / 12)', 'OK', 'FN-FILTER', 'CAP-04');
  }
  if (uc.depth === 'read') {
    T('HP', '004', 'P2', 'Pagination / search nếu có', 'đúng page', 'FN-MAIN', 'CAP-01');
    T('FD', '003', 'P2', 'Malformed query', '4xx', 'FN-VAL', 'CAP-02');
  }
  if (uc.id === 'HRM-PR-04') {
    T('FD', '005', 'P0', 'Chốt kỳ đã locked', '4xx deterministic', 'FN-VAL', 'CAP-02');
    T('AU', '005', 'P0', 'Finance vs HR role lock', '403 nếu sai role', 'FN-SCOPE', 'CAP-03');
  }
  if (uc.id === 'HRM-RC-03') {
    T('SG', '001', 'P2', 'GPLX Offer gate TO-BE', 'SPEC_GAP inventory — không invent PASS', 'FN-VAL', 'CAP-02');
    specGaps.push('GPLX Offer gate — SPEC_GAP inventory');
  }
  if (uc.id === 'HRM-SC-04') {
    T('FD', '005', 'P0', 'Xóa platform catalog hard', 'forbidden', 'FN-VAL', 'CAP-02');
  }

  return { caps, fns, cases, specGaps };
}

function buildDesign(uc) {
  return uc.depth === 'mobile' ? buildMobile(uc) : buildGeneric(uc);
}

function renderFile(uc, design) {
  const { caps, fns, cases, specGaps } = design;
  const { rows: fnRows, total } = fnSummary(fns, cases);
  const persona =
    uc.depth === 'mobile'
      ? 'uat.nv#### / xevn-uat-2026 (mgr uat.nv0001 khi duyệt)'
      : 'ceo@xe.vn / Xevn@2026 · member du-lich.ceo khi AU';

  const tcRows = cases
    .map((c) => {
      const id = tcId(uc, c.fn, c.t, c.n);
      const layer = uc.depth === 'mobile' ? 'MOBILE' : uc.depth === 'embed' ? 'UI' : 'UI/API';
      return `| **${id}** | ${c.cap} | ${c.fn} | ${c.t} | ${c.p} | ${persona} | U65 FE precond · không seed | ${c.steps} | ${c.exp} | ${layer} | matrix STT ${uc.stt} · ${uc.api.split('·')[0].trim()} |`;
    })
    .join('\n');

  const capRows = caps.map((c) => `| **${c.id}** | ${c.name} | ${c.purpose} | ${c.actor} |`).join('\n');
  const fnTable = fns.map((f) => `| ${f.cap} | **${f.id}** | ${f.name} | ${f.ui} | ${f.mutate} |`).join('\n');
  const sgNote = specGaps.length
    ? specGaps.map((s) => `- ${s}`).join('\n')
    : '- (không — trừ ghi chú case SG/LOCK trong bảng TC)';

  const neo =
    uc.depth === 'mobile'
      ? `\n> **Depth pack neo (không copy đè):** \`docs/qa/testcases/hrm-mobile/\` (MOB-HOME · MOB-ATTENDANCE · MOB-LEAVE-APPR · MOB-PROFILE · MOB-OPERATIONS · MOB-SETTINGS) · exemplar \`UC-FR-H03_LEAVE.md\` · \`UC-ATT_ESS_ADJUST.md\`.\n`
      : '';

  return `# UC — \`${uc.id}\` · ${uc.name}

| Meta | Value |
|------|--------|
| **uc_id** | \`${uc.id}\` |
| **stt_phase1** | ${uc.stt} |
| **mod** | ${uc.mod} |
| **name_vi** | ${uc.name} |
| **actors** | ${uc.actors} |
| **surfaces** | ${uc.surfaces} |
| **srs_old** | \`docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md\` STT ${uc.stt} · \`PHASE1_UC_SRS_TECHSPEC_MATRIX.md\` · client-delivery SRS FR (nếu map) |
| **srs_new** | ${uc.srsNew} |
| **tech_spec** | ${uc.tech} |
| **api_contract** | ${uc.api} |
| **author** | ${AUTHOR} |
| **design_status** | **DESIGNED** |
| **execution** | not started |
| **uat_done** | **false** |
| **code_readiness** | \`${uc.readiness}\` — **không** = UAT PASS |
| **code_note** | ${uc.codeNote} |
| **squad** | W1-S6-HRM-B-MOB |
| **work_item_id** | \`${WI}\` |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Leave L2 = **SPEC_GAP inventory** (không PASS). Design ≠ UAT.
${neo}
---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo **${uc.name}** đúng HDSD/SRS trên bề mặt ${uc.surfaces}: actor thực hiện được đường chính quan sát được (FE/API sau 2xx + F5 khi mutate), bị chặn đúng khi BR/validate/scope sai, và không claim nghiệm thu khi còn SPEC_GAP/GAP.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
${capRows}

**Đếm nghiệp vụ:** **${caps.length}**

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
${fnTable}

**Đếm chức năng:** **${fns.length}**

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
${fnRows.join('\n')}

---

## 5. Test cases (P0 đủ; P1/P2 rút gọn 1 dòng)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
${tcRows}

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | yes | ${caps.every((c) => fns.some((f) => f.cap === c.id)) ? 'yes' : 'NO'} | |
| Mọi FN mutate ≥1 HP + ≥1 FD (hoặc SG inventory) | yes | reviewed | SG/LOCK counted separate |
| Auth/scope nếu đa CT | yes | AU cases | |
| SPEC_GAP ghi rõ | yes | see below | không PASS |

**SPEC_GAP / LOCK inventory:**
${sgNote}

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ${uc.readiness === 'GAP' ? 'Thiếu/ partial endpoint' : 'Matrix/API_CONTRACT có tín hiệu'} | ${uc.api} |
| FE menu/nút/role | ${uc.surfaces.includes('embed') || uc.surfaces.includes('mobile') ? 'Surface khai trong inventory' : 'hrm-embed/web path'} | BANG_TONG_HOP STT ${uc.stt} |
| Mobile (nếu có) | ${uc.depth === 'mobile' ? 'TECHSPEC_MOBILE + depth pack neo' : 'N/A hoặc consumer phụ'} | docs/hrm/TECHSPEC_MOBILE.md |
| RBAC / scope | Bắt buộc AU trên đa CT / member vs main | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope ladder |

**Verdict code_readiness:** \`${uc.readiness}\` (design-time; matrix \`e2e_pass\` ≠ UAT FE U65).

---

## 8. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
uc_id: ${uc.id}
stt_phase1: ${uc.stt}
cases_designed: ${total}
code_readiness: ${uc.readiness}
uat_done: false
squad: W1-S6-HRM-B-MOB
work_item_id: ${WI}
\`\`\`
`;
}

function main() {
  const manifestRows = [];
  let sumCases = 0;
  const readinessCount = { LIKELY_IMPL: 0, LIKELY_PARTIAL: 0, GAP: 0, UNKNOWN: 0 };
  let sgUc = 0;

  for (const uc of UCS) {
    const design = buildDesign(uc);
    const { total } = fnSummary(design.fns, design.cases);
    if (total === 0) throw new Error('Zero cases for ' + uc.id);
    if (uc.depth === 'mobile' && total < 10) throw new Error('Mobile ESS under-depth: ' + uc.id + ' = ' + total);
    const md = renderFile(uc, design);
    const fileName = `${uc.id}.md`;
    fs.writeFileSync(path.join(outDir, fileName), md, 'utf8');
    sumCases += total;
    readinessCount[uc.readiness] = (readinessCount[uc.readiness] || 0) + 1;
    const hasSg = design.specGaps.length > 0 || design.cases.some((c) => c.t === 'SG' || c.t === 'LOCK');
    if (hasSg) sgUc++;
    const types = countTypes(design.cases);
    manifestRows.push({
      stt: uc.stt,
      id: uc.id,
      name: uc.name,
      cases: total,
      readiness: uc.readiness,
      depth: uc.depth,
      hp: types.HP,
      fd: types.FD,
      sg: types.SG + types.LOCK,
      file: `../${fileName}`,
    });
  }

  const byDepth = {};
  for (const r of manifestRows) {
    byDepth[r.depth] = byDepth[r.depth] || { uc: 0, cases: 0 };
    byDepth[r.depth].uc++;
    byDepth[r.depth].cases += r.cases;
  }

  const table = manifestRows
    .map(
      (r) =>
        `| ${r.stt} | \`${r.id}\` | ${r.name} | ${r.cases} | \`${r.readiness}\` | ${r.hp}/${r.fd}/${r.sg} | [\`${r.id}.md\`](${r.file}) |`,
    )
    .join('\n');

  const depthTable = Object.entries(byDepth)
    .map(([k, v]) => `| ${k} | ${v.uc} | ${v.cases} |`)
    .join('\n');

  const manifest = `# Manifest — Squad W1-S6-HRM-B-MOB

| Meta | Value |
|------|--------|
| **squad_id** | \`W1-S6-HRM-B-MOB\` |
| **work_item_id** | \`${WI}\` |
| **STT range** | **301–366** |
| **UC count** | **${manifestRows.length}** |
| **cases_designed (sum)** | **${sumCases}** |
| **design_status** | DESIGNED |
| **execution** | not started |
| **uat_done** | **false** |
| **ack_status** | **READY_FOR_SYNTH** |
| **author** | ${AUTHOR} |
| **date** | 2026-08-04 |
| **locks** | U65 · U76 · Leave L2 = SPEC_GAP inventory not PASS · Mobile ESS ≥10 cases · design ≠ UAT |

---

## 1. Sums

| Metric | Value |
|--------|------:|
| UC files | **${manifestRows.length}** |
| Tổng **cases_designed** | **${sumCases}** |
| code_readiness LIKELY_IMPL | ${readinessCount.LIKELY_IMPL || 0} |
| code_readiness LIKELY_PARTIAL | ${readinessCount.LIKELY_PARTIAL || 0} |
| code_readiness GAP | ${readinessCount.GAP || 0} |
| code_readiness UNKNOWN | ${readinessCount.UNKNOWN || 0} |
| UC có SPEC_GAP/LOCK inventory | ${sgUc} |

### Theo depth

| depth | UC | cases |
|-------|---:|------:|
${depthTable}

---

## 2. Per-UC

| STT | uc_id | name_vi | cases_designed | code_readiness | HP/FD/SG | file |
|----:|-------|---------|---------------:|----------------|----------|------|
${table}

---

## 3. Notes (honest)

- Exemplar Leave/ATT professional + \`docs/qa/testcases/hrm-mobile/*\` dùng **neo** — không đè nội dung pack menu.
- \`UC-HRM-MOB-06\` / \`UC-HRM-MOB-08\`: case type **SG** = inventory L2 ladder — **không** PASS.
- Matrix Phase1 \`e2e_pass\` **không** suy ra \`uat_done: true\`.
- Generator: \`_gen_w1_s6.mjs\` (có thể xóa sau synth nếu PM muốn).

---

## 4. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
work_item_id: ${WI}
from_role: qa
to_role: pm
next_owner: pm
cases_designed_sum: ${sumCases}
uc_files: ${manifestRows.length}
uat_done: false
evidence_path: docs/qa/professional/by-uc/_squad/W1-S6-HRM-B-MOB_MANIFEST.md
next_dispatch_prompt: PO-UC-TC-W2-SYNTH-01 — Synth sau khi S1–S6 READY_FOR_SYNTH; dedupe TC-ID; cập nhật MASTER_COVERAGE_REPORT.md; uat_done vẫn false.
\`\`\`
`;

  fs.writeFileSync(path.join(squadDir, 'W1-S6-HRM-B-MOB_MANIFEST.md'), manifest, 'utf8');
  console.log(JSON.stringify({ uc: manifestRows.length, cases: sumCases, readinessCount, sgUc }, null, 2));
}

main();
