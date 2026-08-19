/**
 * One-shot generator: W1-S5-HRM-A (STT 248–300) UC TC design files.
 * DESIGN only — not UAT evidence. Run: node _gen_w1_s5_hrm_a.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..');

const WI = 'PO-UC-TC-W1-S5-HRM-A';
const AUTHOR = `qa · ${WI}`;

/** @typedef {{ id: string, stt: number, name: string, mod: string, actors: string, surfaces: string, srs_old: string, srs_new: string, tech: string, api: string, readiness: string, code_note: string, kind: string, thick?: boolean, xref?: string }} UcDef */

/** @type {UcDef[]} */
const UCS = [
  // —— XBOS-DM-HRM (248–262) ——
  { id: 'XBOS-DM-HRM-01', stt: 248, name: 'Xem tổng quan danh mục theo phân hệ Nhân sự', mod: 'M02', actors: 'Group CEO · HR Admin XBOS', surfaces: 'xbos-cc / web-portal', srs_old: 'BANG_TONG_HOP_USECASE_HRM.md STT1 · matrix 248', srs_new: 'SRS_VN §4 catalog/HRM (overlap) · N/A-DELTA nếu thiếu FR riêng', tech: 'TECHSPEC_HE §7–8 · docs/hrm/TECHSPEC.md catalog', api: 'GET /api/xbos/config-sync/catalog/:key · CC catalogs', readiness: 'LIKELY_PARTIAL', code_note: 'XBOS config-sync + business-master catalog paths tồn tại; overview HRM-specific UI cần FE CC verify.', kind: 'read' },
  { id: 'XBOS-DM-HRM-02', stt: 249, name: 'Cấu hình 6 nhóm trường hồ sơ nhân viên', mod: 'M02', actors: 'Group HR / Catalog admin', surfaces: 'xbos-cc', srs_old: 'BANG_TONG_HOP STT2', srs_new: 'SRS_VN §4 employee metadata groups · N/A-DELTA', tech: 'TECHSPEC_HE §7–8', api: 'XBOS catalog items + HRM employee-metadata', readiness: 'LIKELY_PARTIAL', code_note: 'hrm-api employee-metadata.controller + settings-catalogs; 6 nhóm field schema vs FE form pack cần đối chiếu.', kind: 'crud', thick: true },
  { id: 'XBOS-DM-HRM-03', stt: 250, name: 'Bổ sung trường mở rộng theo công ty', mod: 'M02', actors: 'Member HR · Catalog admin', surfaces: 'xbos-cc / hrm-embed', srs_old: 'BANG_TONG_HOP STT3', srs_new: 'SRS_VN catalog extension', tech: 'TECHSPEC_HE §7–8', api: 'POST catalog extension · catalog-governance', readiness: 'LIKELY_IMPL', code_note: 'xbos catalog-governance + hrm catalog-extensions controllers present; Primary CAT-EXT evidence exists elsewhere — design ≠ UAT.', kind: 'mutate_wf', thick: true },
  { id: 'XBOS-DM-HRM-04', stt: 251, name: 'Gửi phê duyệt khi công ty con thêm hoặc xóa trường', mod: 'M02', actors: 'Member HR · Approver hat', surfaces: 'xbos-cc inbox', srs_old: 'BANG_TONG_HOP STT4', srs_new: 'SRS_VN WF catalog extension', tech: 'TECHSPEC_HE §7–8', api: 'WF spawn catalog_extension · Inbox', readiness: 'LIKELY_IMPL', code_note: 'WF catalog extension path used in U84 Primary; Phase1 uc_id SoT for design tree.', kind: 'mutate_wf', thick: true },
  { id: 'XBOS-DM-HRM-05', stt: 252, name: 'Phê duyệt hoặc từ chối mở rộng danh mục', mod: 'M02', actors: 'Group governance approver', surfaces: 'xbos-cc inbox', srs_old: 'BANG_TONG_HOP STT5', srs_new: 'SRS_VN WF approve', tech: 'TECHSPEC_HE §7–8', api: 'POST WF complete/reject · XBOS-CAT-*', readiness: 'LIKELY_IMPL', code_note: 'workflow-engine approve/reject; stamp scope AU required.', kind: 'mutate_wf', thick: true },
  { id: 'XBOS-DM-HRM-06', stt: 253, name: 'Khai bộ phòng ban và chức vụ theo từng công ty', mod: 'M02', actors: 'HR Admin · Member CEO', surfaces: 'xbos-cc / hrm-embed', srs_old: 'BANG_TONG_HOP STT6', srs_new: 'SRS_VN org/dept', tech: 'TECHSPEC_HE §7–8 · hrm departments', api: 'XBOS ORG/dept · HRM /departments · position catalog', readiness: 'LIKELY_IMPL', code_note: 'hrm departments.controller + XBOS org; position catalog seed paths exist — design cấm dùng seed làm evidence UAT.', kind: 'crud', thick: true },
  { id: 'XBOS-DM-HRM-07', stt: 254, name: 'Sao chép thư viện chức danh sang công ty con', mod: 'M02', actors: 'Group HR', surfaces: 'xbos-cc', srs_old: 'BANG_TONG_HOP STT7', srs_new: 'N/A-DELTA copy library', tech: 'TECHSPEC_HE §7–8', api: 'POST apply-to-members / copy position catalog', readiness: 'LIKELY_PARTIAL', code_note: 'config-sync apply-to-members tồn tại; copy semantics chức danh member cần FE+BR confirm.', kind: 'mutate', thick: true },
  { id: 'XBOS-DM-HRM-08', stt: 255, name: 'Gán danh mục cho phân hệ Nhân sự', mod: 'M02', actors: 'Catalog admin', surfaces: 'xbos-cc', srs_old: 'BANG_TONG_HOP STT8', srs_new: 'SRS_VN target subsystem', tech: 'TECHSPEC_HE §7–8', api: 'assign catalog → target=hrm', readiness: 'LIKELY_PARTIAL', code_note: 'Pattern XBOS-DM assign; HRM target binding FE menu pack neo only.', kind: 'crud' },
  { id: 'XBOS-DM-HRM-09', stt: 256, name: 'Phát hành phiên bản danh mục mới', mod: 'M02', actors: 'Group Catalog admin', surfaces: 'xbos-cc', srs_old: 'BANG_TONG_HOP STT9', srs_new: 'SRS_VN publish', tech: 'TECHSPEC_HE §7–8', api: 'POST /api/xbos/config-sync/catalog/:key/publish', readiness: 'LIKELY_IMPL', code_note: 'PublishCatalogDto + config-sync.controller publish endpoint.', kind: 'mutate', thick: true },
  { id: 'XBOS-DM-HRM-10', stt: 257, name: 'Đồng bộ danh mục xuống HRM', mod: 'M02', actors: 'System · HR Admin', surfaces: 'api / hrm-embed', srs_old: 'BANG_TONG_HOP STT10 · UC-HRM-06 overlap', srs_new: 'SRS_VN sync', tech: 'docs/hrm/TECHSPEC.md sync', api: 'POST /api/hrm/catalog-sync/pull/:catalogKey · GET status', readiness: 'LIKELY_IMPL', code_note: 'catalog-sync.controller pull/status/list present.', kind: 'mutate', thick: true },
  { id: 'XBOS-DM-HRM-11', stt: 258, name: 'Kiểm tra danh mục thiếu trước import nhân sự', mod: 'M02', actors: 'HRBP · Import operator', surfaces: 'hrm-embed', srs_old: 'BANG_TONG_HOP STT11', srs_new: 'N/A-DELTA preflight', tech: 'TECHSPEC import/spreadsheet', api: 'spreadsheet/import precheck · catalog-sync status', readiness: 'LIKELY_PARTIAL', code_note: 'spreadsheet.controller exists; explicit missing-catalog preflight UX may be PARTIAL.', kind: 'read' },
  { id: 'XBOS-DM-HRM-12', stt: 259, name: 'Cấu hình preset biểu mẫu theo công ty (Command Center)', mod: 'M02', actors: 'Group admin', surfaces: 'xbos-cc', srs_old: 'BANG_TONG_HOP STT12', srs_new: 'N/A-DELTA form preset', tech: 'TECHSPEC_HE §7–8', api: 'CC form preset / metadata template', readiness: 'LIKELY_PARTIAL', code_note: 'XBOS INF metadata templates; HRM form preset mapping FE spot needed.', kind: 'crud' },
  { id: 'XBOS-DM-HRM-13', stt: 260, name: 'Khai danh mục hồ sơ xe (du lịch)', mod: 'M02', actors: 'Member Du lịch HR/Fleet', surfaces: 'xbos-cc / hrm-embed', srs_old: 'BANG_TONG_HOP STT13', srs_new: 'SRS_VN fleet catalog', tech: 'hrm fleet TECHSPEC', api: 'fleet + catalog keys tourism', readiness: 'LIKELY_PARTIAL', code_note: 'fleet.controller present; DM-HRM-13 catalog-of-vehicles vs fleet master — verify mapping.', kind: 'crud' },
  { id: 'XBOS-DM-HRM-14', stt: 261, name: 'Gán mã quy trình cho loại đơn HRM', mod: 'M02', actors: 'HR Admin · WF admin', surfaces: 'xbos-cc / hrm settings', srs_old: 'BANG_TONG_HOP STT14', srs_new: 'SRS_VN WF binding', tech: 'TECHSPEC_HE WF + HRM settings', api: 'settings-catalogs · WF definition key bind', readiness: 'LIKELY_PARTIAL', code_note: 'settings-catalogs.controller + WF defs; binding UI for leave/att/req types PARTIAL risk.', kind: 'mutate_wf', thick: true },
  { id: 'XBOS-DM-HRM-15', stt: 262, name: 'Xem lịch sử thay đổi danh mục', mod: 'M02', actors: 'Catalog admin · Auditor', surfaces: 'xbos-cc', srs_old: 'BANG_TONG_HOP STT15', srs_new: 'SRS_VN audit', tech: 'TECHSPEC_HE §7–8', api: 'GET audit / catalog history', readiness: 'LIKELY_PARTIAL', code_note: 'XBOS audit pattern; HRM-specific history view may share UC-XBOS-06.', kind: 'read' },

  // —— UC-HRM platform (263–270) ——
  { id: 'UC-HRM-01', stt: 263, name: 'Kiểm tra trạng thái dịch vụ', mod: 'M05', actors: 'Ops · any authed', surfaces: 'api', srs_old: 'BANG_TONG_HOP STT16', srs_new: 'SRS_VN health', tech: 'TECHSPEC_HE §9.3', api: 'GET /api/hrm/health → HRM-HEALTH-200', readiness: 'LIKELY_IMPL', code_note: 'app.controller health ok payload.', kind: 'health' },
  { id: 'UC-HRM-02', stt: 264, name: 'Tạo quản trị nền tảng', mod: 'M05', actors: 'Platform super-admin', surfaces: 'api / admin', srs_old: 'BANG_TONG_HOP STT17', srs_new: 'SRS_VN admin', tech: 'TECHSPEC_HE §9.3', api: 'POST /api/hrm/admin/platform-admin', readiness: 'LIKELY_IMPL', code_note: 'hrm-admin.controller platform-admin.', kind: 'mutate', thick: true },
  { id: 'UC-HRM-03', stt: 265, name: 'Tạo hoặc cập nhật quản trị doanh nghiệp', mod: 'M05', actors: 'Platform admin · Group CEO', surfaces: 'api / admin', srs_old: 'BANG_TONG_HOP STT18', srs_new: 'SRS_VN company admin', tech: 'TECHSPEC_HE §9.3', api: 'POST /api/hrm/admin/company-admin', readiness: 'LIKELY_IMPL', code_note: 'hrm-admin company-admin + memberships CRUD.', kind: 'mutate', thick: true },
  { id: 'UC-HRM-04', stt: 266, name: 'Mời nhân viên hàng loạt', mod: 'M05', actors: 'HR Admin', surfaces: 'api / hrm-embed', srs_old: 'BANG_TONG_HOP STT19', srs_new: 'SRS_VN invite', tech: 'TECHSPEC_HE §9.3', api: 'POST /api/hrm/admin/invite-employee', readiness: 'LIKELY_PARTIAL', code_note: 'invite-employee endpoint; bulk FE UX vs single invite — PARTIAL if UI only single.', kind: 'mutate', thick: true },
  { id: 'UC-HRM-05', stt: 267, name: 'Cập nhật thông tin nhạy cảm tài khoản', mod: 'M05', actors: 'HR Admin · Platform admin', surfaces: 'api', srs_old: 'BANG_TONG_HOP STT20', srs_new: 'SRS_VN sensitive account', tech: 'TECHSPEC_HE §9.3', api: 'POST reset-user-password · sensitive PATCH', readiness: 'LIKELY_PARTIAL', code_note: 'reset-user-password present; broader PII/sensitive fields may be employee PATCH — scope AU critical.', kind: 'mutate', thick: true },
  { id: 'UC-HRM-06', stt: 268, name: 'Đồng bộ dữ liệu dùng chung từ XBOS', mod: 'M05', actors: 'HR Admin · System', surfaces: 'api / hrm-embed', srs_old: 'BANG_TONG_HOP STT21', srs_new: 'SRS_VN catalog sync', tech: 'docs/hrm/TECHSPEC.md', api: 'POST catalog-sync/pull/:key', readiness: 'LIKELY_IMPL', code_note: 'Same stack as XBOS-DM-HRM-10 consumer side.', kind: 'mutate', thick: true },
  { id: 'UC-HRM-07', stt: 269, name: 'Lấy dữ liệu dùng chung theo khóa danh mục', mod: 'M05', actors: 'HRM FE · API client', surfaces: 'api', srs_old: 'BANG_TONG_HOP STT22', srs_new: 'SRS_VN get catalog', tech: 'TECHSPEC_HE §9.3', api: 'GET /api/hrm/catalog-sync/:catalogKey', readiness: 'LIKELY_IMPL', code_note: 'catalog-sync GET :catalogKey.', kind: 'read' },
  { id: 'UC-HRM-08', stt: 270, name: 'Liệt kê dữ liệu dùng chung theo phân hệ', mod: 'M05', actors: 'HRM FE · API client', surfaces: 'api', srs_old: 'BANG_TONG_HOP STT23', srs_new: 'SRS_VN list catalogs', tech: 'TECHSPEC_HE §9.3', api: 'GET /api/hrm/catalog-sync', readiness: 'LIKELY_IMPL', code_note: 'catalog-sync list GET().', kind: 'read' },

  // —— Attendance (271–283) ——
  { id: 'HRM-AT-01', stt: 271, name: 'Ghi nhận bản ghi chấm công', mod: 'M05', actors: 'NV · Device · HR', surfaces: 'hrm-embed / api / mobile', srs_old: 'BANG_TONG_HOP STT24', srs_new: 'SRS_VN §4 attendance', tech: 'docs/hrm/TECHSPEC.md attendance', api: 'POST /api/hrm/attendance/records', readiness: 'LIKELY_IMPL', code_note: 'attendance.controller Post records.', kind: 'mutate', thick: true },
  { id: 'HRM-AT-02', stt: 272, name: 'Xem danh sách bản ghi chấm công', mod: 'M05', actors: 'NV · QL · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT25', srs_new: 'SRS_VN attendance list', tech: 'TECHSPEC attendance', api: 'GET …/attendance/records · GET :recordId', readiness: 'LIKELY_IMPL', code_note: 'List + get-by-id; scope_parity list↔detail required.', kind: 'read' },
  { id: 'HRM-AT-03', stt: 273, name: 'Cập nhật trạng thái bản ghi chấm công', mod: 'M05', actors: 'HR · QL', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT26', srs_new: 'SRS_VN att status', tech: 'TECHSPEC attendance', api: 'PATCH …/records/:id/status', readiness: 'LIKELY_IMPL', code_note: 'Patch status endpoint.', kind: 'mutate', thick: true },
  { id: 'HRM-AT-04', stt: 274, name: 'Tạo đơn chỉnh sửa chấm công', mod: 'M05', actors: 'NV ESS · HR', surfaces: 'hrm-embed / mobile', srs_old: 'BANG_TONG_HOP STT27 · xref UC-ATT_ESS_ADJUST', srs_new: 'SRS_VN att adjust', tech: 'TECHSPEC attendance', api: 'POST …/update-requests', readiness: 'LIKELY_IMPL', code_note: 'update-requests create; ISO timestamptz wire risk known from Primary — design FD covers.', kind: 'mutate', thick: true, xref: 'docs/qa/professional/UC-ATT_ESS_ADJUST.md' },
  { id: 'HRM-AT-05', stt: 275, name: 'Xem danh sách đơn chỉnh sửa chấm công', mod: 'M05', actors: 'NV · QL · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT28', srs_new: 'SRS_VN att adjust list', tech: 'TECHSPEC attendance', api: 'GET …/update-requests', readiness: 'LIKELY_IMPL', code_note: 'List endpoint; slug↔UUID company filter AU.', kind: 'read' },
  { id: 'HRM-AT-06', stt: 276, name: 'Sửa đơn chỉnh sửa chấm công', mod: 'M05', actors: 'NV (owner pending)', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT29', srs_new: 'SRS_VN att adjust patch', tech: 'TECHSPEC attendance', api: 'PATCH …/update-requests/:requestId', readiness: 'LIKELY_IMPL', code_note: 'Patch update-requests; FD illegal edit when approved.', kind: 'mutate', thick: true },
  { id: 'HRM-AT-07', stt: 277, name: 'Phê duyệt đơn chỉnh sửa chấm công', mod: 'M05', actors: 'QL trực tiếp · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT30 · xref ATT ESS', srs_new: 'SRS_VN approve', tech: 'TECHSPEC attendance', api: 'POST …/update-requests/:id/approve', readiness: 'LIKELY_IMPL', code_note: 'Approve endpoint; x-company-id AU critical (Primary residual class).', kind: 'mutate_wf', thick: true, xref: 'docs/qa/professional/UC-ATT_ESS_ADJUST.md' },
  { id: 'HRM-AT-08', stt: 278, name: 'Từ chối đơn chỉnh sửa chấm công', mod: 'M05', actors: 'QL · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT31', srs_new: 'SRS_VN reject', tech: 'TECHSPEC attendance', api: 'POST …/update-requests/:id/reject', readiness: 'LIKELY_IMPL', code_note: 'Reject endpoint + reason FD.', kind: 'mutate_wf', thick: true },
  { id: 'HRM-AT-09', stt: 279, name: 'Xóa đơn chỉnh sửa chấm công', mod: 'M05', actors: 'NV owner · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT32', srs_new: 'SRS_VN delete draft/pending', tech: 'TECHSPEC attendance', api: 'DELETE …/update-requests/:id', readiness: 'LIKELY_IMPL', code_note: 'Delete endpoint; soft-delete policy check.', kind: 'mutate', thick: true },
  { id: 'HRM-AT-10', stt: 280, name: 'Tạo đơn nghỉ phép', mod: 'M05', actors: 'NV ESS', surfaces: 'hrm-embed / mobile', srs_old: 'BANG_TONG_HOP STT33 · xref FR-H03', srs_new: 'SRS_VN §4 leave', tech: 'docs/hrm/TECHSPEC.md leave', api: 'POST …/attendance/leave-requests', readiness: 'LIKELY_IMPL', code_note: 'leave-requests create + leave-workflow.controller; depth xref UC-FR-H03 — Phase1 id SoT.', kind: 'mutate', thick: true, xref: 'docs/qa/professional/UC-FR-H03_LEAVE.md' },
  { id: 'HRM-AT-11', stt: 281, name: 'Xem danh sách đơn nghỉ phép', mod: 'M05', actors: 'NV · QL · HR', surfaces: 'hrm-embed / mobile / api', srs_old: 'BANG_TONG_HOP STT34 · xref FR-H03', srs_new: 'SRS_VN leave list', tech: 'TECHSPEC leave', api: 'GET …/leave-requests · leave-balance · overview', readiness: 'LIKELY_IMPL', code_note: 'List + balance + overview endpoints.', kind: 'read', xref: 'docs/qa/professional/UC-FR-H03_LEAVE.md' },
  { id: 'HRM-AT-12', stt: 282, name: 'Phê duyệt đơn nghỉ phép', mod: 'M05', actors: 'QL L1 · (L2 SPEC_GAP)', surfaces: 'hrm-embed / mobile / inbox', srs_old: 'BANG_TONG_HOP STT35 · xref FR-H03', srs_new: 'SRS_VN leave approve', tech: 'TECHSPEC leave', api: 'POST …/leave-requests/:id/approve', readiness: 'LIKELY_PARTIAL', code_note: 'L1 approve IMPL; L2 ladder SPEC_GAP per exemplar FR-H03 — do not invent PASS.', kind: 'mutate_wf', thick: true, xref: 'docs/qa/professional/UC-FR-H03_LEAVE.md' },
  { id: 'HRM-AT-13', stt: 283, name: 'Từ chối đơn nghỉ phép', mod: 'M05', actors: 'QL L1', surfaces: 'hrm-embed / mobile / inbox', srs_old: 'BANG_TONG_HOP STT36 · xref FR-H03', srs_new: 'SRS_VN leave reject', tech: 'TECHSPEC leave', api: 'POST …/leave-requests/:id/reject', readiness: 'LIKELY_IMPL', code_note: 'Reject + reason; self-approve AU.', kind: 'mutate_wf', thick: true, xref: 'docs/qa/professional/UC-FR-H03_LEAVE.md' },

  // —— Service requests (284–289) ——
  { id: 'HRM-SV-01', stt: 284, name: 'Tạo yêu cầu dịch vụ nội bộ', mod: 'M05', actors: 'NV · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT37', srs_new: 'SRS_VN service request', tech: 'TECHSPEC operations', api: 'POST /api/hrm/operations/service-requests', readiness: 'LIKELY_IMPL', code_note: 'operations.controller create service-requests.', kind: 'mutate', thick: true },
  { id: 'HRM-SV-02', stt: 285, name: 'Xem danh sách yêu cầu dịch vụ', mod: 'M05', actors: 'NV · Approver · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT38', srs_new: 'SRS_VN SV list', tech: 'TECHSPEC operations', api: 'GET …/service-requests', readiness: 'LIKELY_IMPL', code_note: 'List + company scope filter.', kind: 'read' },
  { id: 'HRM-SV-03', stt: 286, name: 'Cập nhật yêu cầu dịch vụ', mod: 'M05', actors: 'NV owner pending', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT39', srs_new: 'SRS_VN SV update', tech: 'TECHSPEC operations', api: 'PATCH …/service-requests/:id', readiness: 'LIKELY_IMPL', code_note: 'Update DTO; FD when approved.', kind: 'mutate', thick: true },
  { id: 'HRM-SV-04', stt: 287, name: 'Xóa yêu cầu dịch vụ', mod: 'M05', actors: 'NV owner · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT40', srs_new: 'SRS_VN SV delete', tech: 'TECHSPEC operations', api: 'DELETE …/service-requests/:id', readiness: 'LIKELY_IMPL', code_note: 'Delete endpoint; soft-delete policy.', kind: 'mutate', thick: true },
  { id: 'HRM-SV-05', stt: 288, name: 'Phê duyệt yêu cầu dịch vụ', mod: 'M05', actors: 'Approver · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT41', srs_new: 'SRS_VN SV approve', tech: 'TECHSPEC operations', api: 'POST …/service-requests/:id/approve', readiness: 'LIKELY_IMPL', code_note: 'Approve + scope mismatch HRM-SVC-409 class.', kind: 'mutate_wf', thick: true },
  { id: 'HRM-SV-06', stt: 289, name: 'Từ chối yêu cầu dịch vụ', mod: 'M05', actors: 'Approver · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP STT42', srs_new: 'SRS_VN SV reject', tech: 'TECHSPEC operations', api: 'POST …/service-requests/:id/reject', readiness: 'LIKELY_IMPL', code_note: 'Reject + reason FD.', kind: 'mutate_wf', thick: true },

  // —— Notifications (290–292) ——
  { id: 'UC-HRM-12', stt: 290, name: 'Đọc hộp thư thông báo nghiệp vụ', mod: 'M05', actors: 'NV · QL · HR', surfaces: 'hrm-embed / mobile / api', srs_old: 'BANG_TONG_HOP notifications', srs_new: 'SRS_VN inbox notify', tech: 'TECHSPEC notifications', api: 'GET /api/hrm/notifications/inbox', readiness: 'LIKELY_IMPL', code_note: 'notifications.controller inbox GET — không nhầm XBOS WF Inbox.', kind: 'read' },
  { id: 'HRM-NT-01', stt: 291, name: 'Đánh dấu thông báo đã đọc', mod: 'M05', actors: 'NV · QL', surfaces: 'hrm-embed / mobile / api', srs_old: 'BANG_TONG_HOP NT-01', srs_new: 'SRS_VN mark read', tech: 'TECHSPEC notifications', api: 'PATCH …/inbox/:id/read', readiness: 'LIKELY_IMPL', code_note: 'Patch read endpoint.', kind: 'mutate' },
  { id: 'HRM-NT-02', stt: 292, name: 'Đăng ký token thông báo đẩy (mobile)', mod: 'M05', actors: 'Mobile ESS', surfaces: 'hrm-mobile / api', srs_old: 'BANG_TONG_HOP NT-02', srs_new: 'SRS_VN push token', tech: 'TECHSPEC notifications', api: 'POST …/push-tokens', readiness: 'LIKELY_IMPL', code_note: 'push-tokens POST; mobile surface.', kind: 'mutate' },

  // —— Employees (293–297) ——
  { id: 'HRM-EM-01', stt: 293, name: 'Tạo hồ sơ nhân viên', mod: 'M05', actors: 'HRBP · HR Admin', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP EM-01 · menu HRM-EMPLOYEES neo', srs_new: 'SRS_VN §4 employee', tech: 'docs/hrm/TECHSPEC.md employees', api: 'POST /api/hrm/employees', readiness: 'LIKELY_IMPL', code_note: 'employees.controller Post(); hire path overlaps FR-B03 — Phase1 EM-01 SoT.', kind: 'mutate', thick: true, xref: 'docs/qa/professional/UC-FR-B03_RECRUITMENT_WF.md (hire neo)' },
  { id: 'HRM-EM-02', stt: 294, name: 'Xem danh sách nhân viên', mod: 'M05', actors: 'HR · CEO · Manager', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP EM-02', srs_new: 'SRS_VN emp list', tech: 'TECHSPEC employees', api: 'GET /employees · GET summary · GET :id', readiness: 'LIKELY_IMPL', code_note: 'List+summary+detail; J-HRM-01 scope_parity mandatory.', kind: 'read' },
  { id: 'HRM-EM-03', stt: 295, name: 'Cập nhật hồ sơ nhân viên', mod: 'M05', actors: 'HRBP · HR Admin', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP EM-03', srs_new: 'SRS_VN emp update', tech: 'TECHSPEC employees', api: 'PATCH /employees/:employeeId', readiness: 'LIKELY_IMPL', code_note: 'Patch + nested assets/skills/timeline subresources.', kind: 'mutate', thick: true },
  { id: 'HRM-EM-04', stt: 296, name: 'Lưu trữ (xóa mềm) nhân viên', mod: 'M05', actors: 'HR Admin', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP EM-04', srs_new: 'SRS_VN archive soft-delete', tech: 'TECHSPEC employees', api: 'POST /employees/:id/archive', readiness: 'LIKELY_IMPL', code_note: 'Archive soft-delete; hard-delete forbidden per platform.', kind: 'mutate', thick: true },
  { id: 'HRM-EM-05', stt: 297, name: 'Khôi phục nhân viên đã lưu trữ', mod: 'M05', actors: 'HR Admin', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP EM-05', srs_new: 'SRS_VN restore', tech: 'TECHSPEC employees', api: 'POST /employees/:id/restore', readiness: 'LIKELY_IMPL', code_note: 'Restore endpoint.', kind: 'mutate', thick: true },

  // —— Payroll periods (298–300) ——
  { id: 'HRM-PR-01', stt: 298, name: 'Tạo kỳ lương', mod: 'M05', actors: 'Payroll admin · HR', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP PR-01', srs_new: 'SRS_VN payroll period', tech: 'docs/hrm/TECHSPEC.md payroll', api: 'POST /api/hrm/payroll/periods', readiness: 'LIKELY_IMPL', code_note: 'payroll.controller Post periods.', kind: 'mutate', thick: true },
  { id: 'HRM-PR-02', stt: 299, name: 'Xem danh sách kỳ lương', mod: 'M05', actors: 'Payroll · HR · CEO', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP PR-02', srs_new: 'SRS_VN period list', tech: 'TECHSPEC payroll', api: 'GET /payroll/periods', readiness: 'LIKELY_IMPL', code_note: 'List periods; scope AU.', kind: 'read' },
  { id: 'HRM-PR-03', stt: 300, name: 'Xử lý tính lương theo kỳ', mod: 'M05', actors: 'Payroll admin', surfaces: 'hrm-embed / api', srs_old: 'BANG_TONG_HOP PR-03', srs_new: 'SRS_VN process payroll', tech: 'TECHSPEC payroll', api: 'POST /payroll/periods/:id/process · close', readiness: 'LIKELY_IMPL', code_note: 'Process + close endpoints; formula BE-only (SOLID FE–BE).', kind: 'mutate', thick: true },
];

function slug(ucId) {
  return ucId.replace(/[^A-Za-z0-9]+/g, '-');
}

function designTree(uc) {
  const short = slug(uc.id);
  const xrefNote = uc.xref
    ? `\n\n> **Cross-ref depth (neo, không đè):** \`${uc.xref}\` — filename Phase1 \`${uc.id}\` là SoT.`
    : '';

  switch (uc.kind) {
    case 'health':
      return {
        caps: [
          ['CAP-01', 'Kiểm tra sức khỏe dịch vụ', 'Xác nhận HRM API sống trước UAT', uc.actors],
        ],
        fns: [
          ['CAP-01', 'FN-HEALTH', 'Gọi health endpoint', 'GET /api/hrm/health', 'N'],
        ],
        counts: [['FN-HEALTH', 2, 0, 0, 1, 1]],
        cases: [
          [`TC-${short}-HEALTH-HP-001`, 'CAP-01', 'FN-HEALTH', 'HP', 'P0', 'ops/any', 'Stack up', '1. GET /api/hrm/health', '200 HRM-HEALTH-200 + status ok', 'API', uc.api],
          [`TC-${short}-HEALTH-HP-002`, 'CAP-01', 'FN-HEALTH', 'HP', 'P1', 'portal proxy', 'Vite/portal proxy', '1. Mở portal → proxy health', 'Không 500 proxy khi :28001 up', 'UI/API', 'qc:fe-be-health'],
          [`TC-${short}-HEALTH-AU-001`, 'CAP-01', 'FN-HEALTH', 'AU', 'P1', 'anon', 'Không token (nếu policy public)', '1. GET không Authorization', '200 public HOẶC 401 theo OpenAPI — ghi contract', 'API', uc.api],
          [`TC-${short}-HEALTH-UX-001`, 'CAP-01', 'FN-HEALTH', 'UX', 'P0', 'ops', 'hrm-api down', '1. Stop API 2. Gọi health/proxy', 'ECONNREFUSED / portal báo lỗi rõ — không silent', 'API', 'pm-fe-be-live-health'],
        ],
      };
    case 'read':
      return buildRead(uc, short, xrefNote);
    case 'crud':
      return buildCrud(uc, short, xrefNote);
    case 'mutate':
    case 'mutate_wf':
      return buildMutate(uc, short, xrefNote, uc.kind === 'mutate_wf');
    default:
      return buildMutate(uc, short, xrefNote, false);
  }
}

function buildRead(uc, short, xrefNote) {
  const isLeave = uc.id.startsWith('HRM-AT-1') || uc.id === 'HRM-AT-11';
  const isEmp = uc.id.startsWith('HRM-EM-02');
  const caps = [
    ['CAP-01', 'Truy vấn / liệt kê', uc.name, uc.actors],
    ['CAP-02', 'Chi tiết / filter / empty', 'Deep-link & empty trung thực', uc.actors],
    ['CAP-03', 'Phạm vi đa công ty', 'Không lộ ngoài scope', 'RBAC'],
  ];
  const fns = [
    ['CAP-01', 'FN-LIST', 'List / overview', uc.api.split('·')[0].trim(), 'N'],
    ['CAP-02', 'FN-DETAIL', 'Mở chi tiết / by-id', 'GET by id / row click', 'N'],
    ['CAP-02', 'FN-FILTER', 'Lọc theo trạng thái/CT/kỳ', 'query params UI', 'N'],
    ['CAP-03', 'FN-SCOPE', 'Chặn scope sai', '403/409 / empty đúng', 'N'],
  ];
  let counts = [
    ['FN-LIST', 2, 0, 0, 1, 2],
    ['FN-DETAIL', 1, 1, 0, 1, 1],
    ['FN-FILTER', 1, 0, 1, 0, 1],
    ['FN-SCOPE', 0, 0, 0, 2, 0],
  ];
  if (isLeave) {
    counts = [
      ['FN-LIST', 2, 0, 0, 1, 2],
      ['FN-DETAIL', 1, 1, 0, 1, 1],
      ['FN-FILTER', 1, 0, 1, 0, 1],
      ['FN-SCOPE', 0, 0, 0, 2, 1],
      ['FN-BALANCE', 1, 0, 1, 0, 0],
    ];
    fns.push(['CAP-01', 'FN-BALANCE', 'Xem số dư phép', 'GET leave-balance', 'N']);
  }
  if (isEmp) {
    counts = [
      ['FN-LIST', 2, 0, 0, 1, 2],
      ['FN-DETAIL', 2, 1, 0, 1, 1],
      ['FN-FILTER', 1, 0, 1, 0, 1],
      ['FN-SCOPE', 0, 0, 0, 2, 0],
      ['FN-SUMMARY', 1, 0, 0, 1, 0],
    ];
    fns.push(['CAP-01', 'FN-SUMMARY', 'KPI summary đầu list', 'GET employees/summary', 'N']);
  }
  const cases = [
    [`TC-${short}-LIST-HP-001`, 'CAP-01', 'FN-LIST', 'HP', 'P0', 'ceo@xe.vn', 'Đã login holding', `1. Vào màn liên quan ${uc.name} 2. Chờ load`, 'List 2xx · không banner ERROR · empty hợp lệ nếu 0 row', 'UI/API', uc.srs_old],
    [`TC-${short}-LIST-HP-002`, 'CAP-01', 'FN-LIST', 'HP', 'P1', 'member CEO', 'Login member slug', '1. Mở cùng màn scope member', 'Chỉ data CT mình · 2xx', 'UI/API', 'ADR scope ladder'],
    [`TC-${short}-LIST-UX-001`, 'CAP-01', 'FN-LIST', 'UX', 'P0', 'HR', 'Filter ra empty', '1. Filter không khớp', 'Empty state trung thực · không GET storm', 'UI', 'U65'],
    [`TC-${short}-LIST-UX-002`, 'CAP-01', 'FN-LIST', 'UX', 'P0', 'HR', 'API 500 giả lập', '1. Quan sát banner', 'Error rõ · có Tải lại thủ công', 'UI', 'U63'],
    [`TC-${short}-LIST-AU-001`, 'CAP-01', 'FN-LIST', 'AU', 'P0', 'du-lich.ceo', 'Member token', '1. Gọi list holding rollup (nếu UI có)', '403/409 hoặc không hiện CT khác', 'UI/API', 'scope'],
    [`TC-${short}-DETAIL-HP-001`, 'CAP-02', 'FN-DETAIL', 'HP', 'P0', 'HR', 'Có ≥1 row từ FE', '1. Click row / deep link', 'Detail 2xx · không 404 khi list có (scope_parity)', 'UI/API', 'J-HRM-*'],
    [`TC-${short}-DETAIL-FD-001`, 'CAP-02', 'FN-DETAIL', 'FD', 'P0', 'HR', 'ID ngoài scope', '1. Deep link UUID CT khác', '404/409 deterministic', 'API', 'scope_parity'],
    [`TC-${short}-DETAIL-AU-001`, 'CAP-02', 'FN-DETAIL', 'AU', 'P1', 'NV thường', 'Không quyền xem all', '1. Mở list/detail người khác', '403 hoặc mask theo RBAC', 'UI/API', 'RBAC'],
    [`TC-${short}-DETAIL-UX-001`, 'CAP-02', 'FN-DETAIL', 'UX', 'P2', 'HR', 'Loading chậm', '1. Open detail', 'Skeleton/spinner · không trắng', 'UI', 'UX'],
    [`TC-${short}-FILTER-HP-001`, 'CAP-02', 'FN-FILTER', 'HP', 'P1', 'HR', 'Có data đa trạng thái', '1. Đổi filter status', 'Grid khớp filter · F5 giữ hoặc reset theo HDSD', 'UI', 'HDSD'],
    [`TC-${short}-FILTER-BD-001`, 'CAP-02', 'FN-FILTER', 'BD', 'P2', 'HR', '—', '1. Page size biên / ngày biên', 'Không crash · vi-VN date', 'UI', 'UX_VI format'],
    [`TC-${short}-FILTER-UX-001`, 'CAP-02', 'FN-FILTER', 'UX', 'P2', 'HR', '—', '1. Clear filter', 'Trả về full list hợp lệ', 'UI', 'UX'],
    [`TC-${short}-SCOPE-AU-001`, 'CAP-03', 'FN-SCOPE', 'AU', 'P0', 'member', 'Token member', '1. Đổi x-company-id sang CT khác', '409 SCOPE / mismatch', 'API', 'scope'],
    [`TC-${short}-SCOPE-AU-002`, 'CAP-03', 'FN-SCOPE', 'AU', 'P0', 'ceo@', 'Holding main', '1. List rollup vs member detail', 'Parity list↔get-by-id', 'API', 'scope_parity'],
  ];
  if (isLeave) {
    cases.push(
      [`TC-${short}-BALANCE-HP-001`, 'CAP-01', 'FN-BALANCE', 'HP', 'P0', 'NV', 'Có số dư', '1. GET leave-balance / mở UI số dư', 'Số dư hiển thị · không NaN', 'UI/API', 'FR-H03'],
      [`TC-${short}-BALANCE-BD-001`, 'CAP-01', 'FN-BALANCE', 'BD', 'P1', 'NV', 'Số dư 0', '1. Xem balance', '0 hợp lệ · không âm ảo', 'UI/API', 'FR-H03'],
      [`TC-${short}-SCOPE-UX-001`, 'CAP-03', 'FN-SCOPE', 'UX', 'P1', 'QL', 'Không đơn chờ', '1. List mgr', 'Empty chờ duyệt — không seed inbox', 'UI', 'U65'],
    );
  }
  if (isEmp) {
    cases.push(
      [`TC-${short}-SUMMARY-HP-001`, 'CAP-01', 'FN-SUMMARY', 'HP', 'P1', 'ceo@', 'Holding', '1. GET summary trước list', '200 · KPI khớp scope', 'API', 'employees/summary'],
      [`TC-${short}-SUMMARY-AU-001`, 'CAP-01', 'FN-SUMMARY', 'AU', 'P1', 'member', 'Member', '1. Summary', 'Không rollup CT khác', 'API', 'scope'],
      [`TC-${short}-DETAIL-HP-002`, 'CAP-02', 'FN-DETAIL', 'HP', 'P0', 'ceo@', 'List có NV', '1. Click tên NV (J-HRM-01)', 'Profile không 404', 'UI', 'J-HRM-01'],
    );
  }
  return { caps, fns, counts, cases, xrefNote };
}

function buildCrud(uc, short, xrefNote) {
  const caps = [
    ['CAP-01', 'Xem cấu hình / danh mục', 'Đọc trạng thái hiện tại', uc.actors],
    ['CAP-02', 'Tạo / cập nhật cấu hình', 'Ghi master đúng CT', uc.actors],
    ['CAP-03', 'Validate & phạm vi', 'Chặn sai BR / ngoài scope', 'Hệ thống'],
  ];
  const fns = [
    ['CAP-01', 'FN-OPEN', 'Mở màn cấu hình', 'CC/HRM menu', 'N'],
    ['CAP-01', 'FN-LIST', 'List giá trị / nhóm', 'GET', 'N'],
    ['CAP-02', 'FN-CREATE', 'Thêm mới', 'POST', 'Y'],
    ['CAP-02', 'FN-UPDATE', 'Sửa', 'PATCH/PUT', 'Y'],
    ['CAP-02', 'FN-DISABLE', 'Ngừng / xóa mềm (nếu có)', 'DELETE/soft', 'Y'],
    ['CAP-03', 'FN-VAL', 'Validate bắt buộc / trùng mã', 'BE DTO', 'Y'],
    ['CAP-03', 'FN-SCOPE', 'Scope đa CT', 'header/JWT', 'Y'],
  ];
  const counts = [
    ['FN-OPEN', 1, 0, 0, 0, 1],
    ['FN-LIST', 1, 0, 0, 1, 1],
    ['FN-CREATE', 2, 2, 1, 1, 1],
    ['FN-UPDATE', 1, 2, 0, 1, 1],
    ['FN-DISABLE', 1, 1, 0, 0, 0],
    ['FN-VAL', 0, 2, 1, 0, 0],
    ['FN-SCOPE', 0, 0, 0, 2, 0],
  ];
  const cases = [
    [`TC-${short}-OPEN-HP-001`, 'CAP-01', 'FN-OPEN', 'HP', 'P0', 'ceo@xe.vn', 'Login', `1. Menu SRS → ${uc.name}`, 'Màn load · không 409', 'UI', uc.srs_old],
    [`TC-${short}-OPEN-UX-001`, 'CAP-01', 'FN-OPEN', 'UX', 'P1', 'ceo@', 'API chậm', '1. Open', 'Loading rõ', 'UI', 'UX'],
    [`TC-${short}-LIST-HP-001`, 'CAP-01', 'FN-LIST', 'HP', 'P0', 'HR Admin', '—', '1. List', '2xx + FE bind', 'UI/API', uc.api],
    [`TC-${short}-LIST-AU-001`, 'CAP-01', 'FN-LIST', 'AU', 'P0', 'member', 'Member', '1. List', 'Chỉ CT mình / đúng partition', 'UI/API', 'scope'],
    [`TC-${short}-LIST-UX-001`, 'CAP-01', 'FN-LIST', 'UX', 'P1', 'HR', 'Empty', '1. CT mới', 'Empty hợp lệ', 'UI', 'U65'],
    [`TC-${short}-CREATE-HP-001`, 'CAP-02', 'FN-CREATE', 'HP', 'P0', 'HR Admin', 'Quyền đủ', '1. Thêm 2. Lưu', '2xx · row hiện · F5 còn', 'UI/API', uc.api],
    [`TC-${short}-CREATE-HP-002`, 'CAP-02', 'FN-CREATE', 'HP', 'P1', 'ceo@', 'Holding', '1. Tạo bản ghi holding-scope', 'Persist đúng company_id', 'UI/API', 'ADR main'],
    [`TC-${short}-CREATE-FD-001`, 'CAP-02', 'FN-CREATE', 'FD', 'P0', 'HR', '—', '1. Bỏ field bắt buộc 2. Lưu', '4xx validate · FE message', 'UI/API', 'DTO'],
    [`TC-${short}-CREATE-FD-002`, 'CAP-02', 'FN-CREATE', 'FD', 'P0', 'HR', 'Mã trùng', '1. Tạo trùng code', '409/400 deterministic', 'API', 'BR unique'],
    [`TC-${short}-CREATE-BD-001`, 'CAP-02', 'FN-CREATE', 'BD', 'P1', 'HR', '—', '1. Độ dài mã min/max', 'Biên pass/fail đúng', 'API', 'BD'],
    [`TC-${short}-CREATE-AU-001`, 'CAP-02', 'FN-CREATE', 'AU', 'P0', 'NV thường', 'Không quyền', '1. POST', '403', 'API', 'RBAC'],
    [`TC-${short}-CREATE-UX-001`, 'CAP-02', 'FN-CREATE', 'UX', 'P1', 'HR', '—', '1. Lưu OK', 'Toast/row · nút không double-submit', 'UI', 'UX'],
    [`TC-${short}-UPDATE-HP-001`, 'CAP-02', 'FN-UPDATE', 'HP', 'P0', 'HR', 'Có row', '1. Sửa 2. Lưu 3. F5', '2xx · giá trị mới còn', 'UI/API', uc.api],
    [`TC-${short}-UPDATE-FD-001`, 'CAP-02', 'FN-UPDATE', 'FD', 'P0', 'HR', 'Row locked/published', '1. Sửa khi không cho', '4xx BR lock', 'API', 'BR'],
    [`TC-${short}-UPDATE-FD-002`, 'CAP-02', 'FN-UPDATE', 'FD', 'P1', 'HR', 'ID lạ', '1. PATCH uuid random', '404', 'API', 'not found'],
    [`TC-${short}-UPDATE-AU-001`, 'CAP-02', 'FN-UPDATE', 'AU', 'P0', 'member', 'Row CT khác', '1. PATCH', '403/409', 'API', 'scope'],
    [`TC-${short}-UPDATE-UX-001`, 'CAP-02', 'FN-UPDATE', 'UX', 'P2', 'HR', '—', '1. Concurrent edit (nếu có)', 'Thông báo xung đột hoặc last-write documented', 'UI', 'SPEC_GAP nếu im'],
    [`TC-${short}-DISABLE-HP-001`, 'CAP-02', 'FN-DISABLE', 'HP', 'P1', 'HR Admin', 'Row active', '1. Ngừng/xóa mềm', '2xx · không hard-delete', 'UI/API', 'soft-delete'],
    [`TC-${short}-DISABLE-FD-001`, 'CAP-02', 'FN-DISABLE', 'FD', 'P0', 'HR', 'Đang được reference', '1. Disable', '4xx FK/in-use hoặc soft only', 'API', 'BR'],
    [`TC-${short}-VAL-FD-001`, 'CAP-03', 'FN-VAL', 'FD', 'P0', 'HR', '—', '1. Ký tự cấm / null', 'Reject', 'API', 'validation'],
    [`TC-${short}-VAL-FD-002`, 'CAP-03', 'FN-VAL', 'FD', 'P1', 'HR', '—', '1. Enum sai', '400', 'API', 'DTO'],
    [`TC-${short}-VAL-BD-001`, 'CAP-03', 'FN-VAL', 'BD', 'P2', 'HR', '—', '1. Max length name', 'Biên', 'API', 'BD'],
    [`TC-${short}-SCOPE-AU-001`, 'CAP-03', 'FN-SCOPE', 'AU', 'P0', 'member', '—', '1. Ghi vào CT khác', '409/403', 'API', 'scope'],
    [`TC-${short}-SCOPE-AU-002`, 'CAP-03', 'FN-SCOPE', 'AU', 'P0', 'ceo@', 'main', '1. Ghi holding vs member', 'Đúng partition JWT', 'API', 'ADR'],
  ];
  return { caps, fns, counts, cases, xrefNote };
}

function buildMutate(uc, short, xrefNote, isWf) {
  const thick = uc.thick !== false;
  const caps = [
    ['CAP-01', 'Chuẩn bị / mở form', 'Đúng menu HDSD', uc.actors],
    ['CAP-02', 'Thực thi mutate chính', uc.name, uc.actors],
    ['CAP-03', 'Fail-deep nghiệp vụ', 'Validate · BR · SM', 'Hệ thống'],
    ['CAP-04', 'Phạm vi & chống gian lận', 'Scope · self-approve', 'RBAC'],
  ];
  if (isWf) {
    caps.push(['CAP-05', 'Phê duyệt / từ chối / inbox', 'Hoàn tất bước', 'Approver']);
  }
  if (uc.id.startsWith('HRM-AT-10') || uc.id === 'HRM-AT-12' || uc.id === 'HRM-AT-13') {
    caps.push(['CAP-06', 'Số dư / giấy tờ / notice (leave)', 'BR nghỉ phép', 'NV · Hệ thống']);
  }
  if (uc.id.startsWith('HRM-EM-')) {
    caps.push(['CAP-06', 'Liên kết master sau mutate', 'Dept/position/catalog', 'HR']);
  }
  if (uc.id.startsWith('HRM-PR-')) {
    caps.push(['CAP-06', 'Trạng thái kỳ lương', 'open→processing→closed', 'Payroll']);
  }

  const fns = [
    ['CAP-01', 'FN-OPEN', 'Mở UI / chọn context CT', 'menu HDSD', 'N'],
    ['CAP-02', 'FN-ACT', 'Hành động chính (create/update/process)', uc.api.split('·')[0].trim(), 'Y'],
    ['CAP-02', 'FN-RELOAD', 'F5 / navigate lại', 'browser', 'N'],
    ['CAP-03', 'FN-VAL', 'Validate bắt buộc & format', 'DTO', 'Y'],
    ['CAP-03', 'FN-BR', 'Business rule reject', 'Service', 'Y'],
    ['CAP-03', 'FN-SM', 'State machine illegal transition', 'status', 'Y'],
    ['CAP-04', 'FN-SCOPE', 'Sai công ty / header', 'x-company-id', 'Y'],
    ['CAP-04', 'FN-RBAC', 'Sai role', 'JWT role', 'Y'],
  ];
  if (isWf) {
    fns.push(
      ['CAP-05', 'FN-APPR', 'Duyệt', 'approve API/UI', 'Y'],
      ['CAP-05', 'FN-REJ', 'Từ chối + lý do', 'reject API/UI', 'Y'],
      ['CAP-05', 'FN-SELF', 'Chặn tự duyệt', 'BR-WF-04', 'Y'],
    );
  }
  if (uc.id === 'HRM-AT-10' || uc.id === 'HRM-AT-12') {
    fns.push(
      ['CAP-06', 'FN-BAL', 'Chặn vượt số dư', 'leave-balance', 'Y'],
      ['CAP-06', 'FN-ATT', 'Ốm ≥3d thiếu file', 'attachment', 'Y'],
      ['CAP-06', 'FN-NOTICE', 'Notice ≥3 ngày lịch (nếu SRS)', 'create validate', 'Y'],
    );
  }
  if (uc.id.startsWith('HRM-EM-01') || uc.id === 'HRM-EM-03') {
    fns.push(['CAP-06', 'FN-LINK', 'Gán phòng ban / chức danh catalog', 'FK catalogs', 'Y']);
  }
  if (uc.id === 'HRM-PR-03') {
    fns.push(
      ['CAP-06', 'FN-PROC', 'Process kỳ', 'POST …/process', 'Y'],
      ['CAP-06', 'FN-CLOSE', 'Close kỳ', 'POST …/close', 'Y'],
    );
  }

  // counts tuned to 15–40 for thick mutate
  const counts = [
    ['FN-OPEN', 1, 0, 0, 0, 1],
    ['FN-ACT', 2, 1, 1, 1, 1],
    ['FN-RELOAD', 1, 0, 0, 0, 1],
    ['FN-VAL', 0, 2, 1, 0, 0],
    ['FN-BR', 0, 2, 0, 0, 0],
    ['FN-SM', 0, 2, 0, 0, 1],
    ['FN-SCOPE', 0, 0, 0, 2, 0],
    ['FN-RBAC', 0, 0, 0, 2, 0],
  ];
  if (isWf) {
    counts.push(['FN-APPR', 2, 1, 0, 1, 1], ['FN-REJ', 1, 1, 0, 0, 0], ['FN-SELF', 0, 1, 0, 1, 0]);
  }
  if (uc.id === 'HRM-AT-10' || uc.id === 'HRM-AT-12') {
    counts.push(['FN-BAL', 0, 1, 1, 0, 0], ['FN-ATT', 0, 2, 1, 0, 0], ['FN-NOTICE', 0, 1, 1, 0, 0]);
  }
  if (uc.id.startsWith('HRM-EM-01') || uc.id === 'HRM-EM-03') {
    counts.push(['FN-LINK', 1, 1, 0, 0, 0]);
  }
  if (uc.id === 'HRM-PR-03') {
    counts.push(['FN-PROC', 1, 1, 0, 1, 1], ['FN-CLOSE', 1, 1, 0, 0, 0]);
  }
  if (!thick) {
    // thin mutate (NT)
    counts.length = 0;
    counts.push(
      ['FN-OPEN', 1, 0, 0, 0, 1],
      ['FN-ACT', 1, 1, 0, 1, 1],
      ['FN-RELOAD', 1, 0, 0, 0, 0],
      ['FN-VAL', 0, 1, 0, 0, 0],
      ['FN-BR', 0, 1, 0, 0, 0],
      ['FN-SM', 0, 1, 0, 0, 0],
      ['FN-SCOPE', 0, 0, 0, 1, 0],
      ['FN-RBAC', 0, 0, 0, 1, 0],
    );
  }

  const cases = [
    [`TC-${short}-OPEN-HP-001`, 'CAP-01', 'FN-OPEN', 'HP', 'P0', persona(uc), 'Login đúng persona', `1. Menu HDSD → ${uc.name}`, 'Form/list sẵn sàng · không ERROR banner', 'UI', 'U76 HDSD'],
    [`TC-${short}-OPEN-UX-001`, 'CAP-01', 'FN-OPEN', 'UX', 'P1', persona(uc), '—', '1. Open khi API down', 'Banner lỗi rõ', 'UI', 'health'],
    [`TC-${short}-ACT-HP-001`, 'CAP-02', 'FN-ACT', 'HP', 'P0', persona(uc), precondHappy(uc), stepsHappy(uc), '2xx + FE cập nhật + F5 còn · U65 no seed', 'UI/API', uc.api],
    [`TC-${short}-ACT-HP-002`, 'CAP-02', 'FN-ACT', 'HP', 'P1', 'ceo@xe.vn / member', 'Đổi scope CT hợp lệ', '1. Lặp happy trên CT thành viên', 'Persist đúng company_id', 'UI/API', 'scope'],
    [`TC-${short}-ACT-FD-001`, 'CAP-02', 'FN-ACT', 'FD', 'P0', persona(uc), '—', '1. Submit thiếu field bắt buộc', '4xx · FE giữ form · không tạo bản ghi', 'UI/API', 'FD'],
    [`TC-${short}-ACT-BD-001`, 'CAP-02', 'FN-ACT', 'BD', 'P1', persona(uc), '—', boundaryStep(uc), 'Biên pass/fail đúng SRS', 'UI/API', 'BD'],
    [`TC-${short}-ACT-AU-001`, 'CAP-02', 'FN-ACT', 'AU', 'P0', 'role thiếu quyền', 'Login low privilege', '1. Thử mutate', '403', 'API', 'RBAC'],
    [`TC-${short}-ACT-UX-001`, 'CAP-02', 'FN-ACT', 'UX', 'P1', persona(uc), '—', '1. Double-click Lưu', 'Idempotent hoặc disable nút', 'UI', 'UX'],
    [`TC-${short}-RELOAD-HP-001`, 'CAP-02', 'FN-RELOAD', 'HP', 'P0', persona(uc), 'Sau ACT-HP-001', '1. F5', 'Dữ liệu còn', 'UI', 'U65'],
    [`TC-${short}-RELOAD-UX-001`, 'CAP-02', 'FN-RELOAD', 'UX', 'P2', persona(uc), '—', '1. Back list → detail', 'Không 404 (parity)', 'UI', 'L2.5'],
    [`TC-${short}-VAL-FD-001`, 'CAP-03', 'FN-VAL', 'FD', 'P0', persona(uc), '—', '1. Sai format (email/date/ISO time)', '400 + message', 'API', 'DTO'],
    [`TC-${short}-VAL-FD-002`, 'CAP-03', 'FN-VAL', 'FD', 'P0', persona(uc), '—', '1. Payload null/empty string bắt buộc', '400', 'API', 'validation'],
    [`TC-${short}-VAL-BD-001`, 'CAP-03', 'FN-VAL', 'BD', 'P2', persona(uc), '—', '1. Max length lý do/ghi chú', 'Biên', 'API', 'BD'],
    [`TC-${short}-BR-FD-001`, 'CAP-03', 'FN-BR', 'FD', 'P0', persona(uc), brPre(uc), brStep(uc), 'Reject mã lỗi nghiệp vụ ổn định', 'API', 'BR'],
    [`TC-${short}-BR-FD-002`, 'CAP-03', 'FN-BR', 'FD', 'P1', persona(uc), '—', '1. Trùng khóa nghiệp vụ (nếu có)', '409/400', 'API', 'unique'],
    [`TC-${short}-SM-FD-001`, 'CAP-03', 'FN-SM', 'FD', 'P0', persona(uc), 'Bản ghi terminal', '1. Mutate lại trạng thái cấm', '4xx illegal transition', 'API', 'SM'],
    [`TC-${short}-SM-FD-002`, 'CAP-03', 'FN-SM', 'FD', 'P1', persona(uc), 'Pending', '1. Thao tác không đúng vai', '4xx', 'API', 'SM'],
    [`TC-${short}-SM-UX-001`, 'CAP-03', 'FN-SM', 'UX', 'P1', persona(uc), 'Terminal', '1. UI nút', 'Nút duyệt/sửa ẩn hoặc disabled', 'UI', 'UX'],
    [`TC-${short}-SCOPE-AU-001`, 'CAP-04', 'FN-SCOPE', 'AU', 'P0', 'member CEO', 'Token CT A', '1. Header CT B', '409 SCOPE_CONTEXT_MISMATCH / tương đương', 'API', 'scope'],
    [`TC-${short}-SCOPE-AU-002`, 'CAP-04', 'FN-SCOPE', 'AU', 'P0', 'ceo@', 'Holding', '1. Thao tác bản ghi member không thuộc rollup policy', '403/409 hoặc đúng ADR', 'API', 'ADR'],
    [`TC-${short}-RBAC-AU-001`, 'CAP-04', 'FN-RBAC', 'AU', 'P0', 'NV ESS', 'Không phải approver', '1. Gọi approve/admin API', '403', 'API', 'RBAC'],
    [`TC-${short}-RBAC-AU-002`, 'CAP-04', 'FN-RBAC', 'AU', 'P1', 'anon', 'Hết hạn JWT', '1. Mutate', '401', 'API', 'auth'],
  ];

  if (isWf) {
    cases.push(
      [`TC-${short}-APPR-HP-001`, 'CAP-05', 'FN-APPR', 'HP', 'P0', 'QL/approver', 'Có đơn pending từ FE (không seed)', '1. Mở list/inbox 2. Duyệt', '2xx · status approved · F5', 'UI/API', uc.api],
      [`TC-${short}-APPR-HP-002`, 'CAP-05', 'FN-APPR', 'HP', 'P1', 'approver', 'Multi-hat nếu có', '1. Duyệt đúng hat', 'Task đóng · badge giảm', 'UI', 'WF'],
      [`TC-${short}-APPR-FD-001`, 'CAP-05', 'FN-APPR', 'FD', 'P0', 'approver', 'Đã approved', '1. Approve lần 2', '4xx', 'API', 'SM'],
      [`TC-${short}-APPR-AU-001`, 'CAP-05', 'FN-APPR', 'AU', 'P0', 'approver CT khác', '—', '1. Approve thiếu/sai x-company-id', '409 scope', 'API', 'ATT/leave Primary class'],
      [`TC-${short}-APPR-UX-001`, 'CAP-05', 'FN-APPR', 'UX', 'P1', 'approver', 'Inbox trống', '1. Mở inbox', 'Empty — BLOCKED tạo nguồn từ FE · không seed', 'UI', 'U65'],
      [`TC-${short}-REJ-HP-001`, 'CAP-05', 'FN-REJ', 'HP', 'P0', 'approver', 'Pending', '1. Từ chối + lý do đủ', '2xx rejected · F5', 'UI/API', 'reject'],
      [`TC-${short}-REJ-FD-001`, 'CAP-05', 'FN-REJ', 'FD', 'P0', 'approver', '—', '1. Reject không lý do / lý do ngắn', '4xx validate', 'API', 'FD'],
      [`TC-${short}-SELF-FD-001`, 'CAP-05', 'FN-SELF', 'FD', 'P0', 'NV=QL cùng user', 'Self pending', '1. Tự duyệt', 'Reject BR-WF-04 / tương đương', 'API', 'BR-WF-04'],
      [`TC-${short}-SELF-AU-001`, 'CAP-05', 'FN-SELF', 'AU', 'P1', 'NV', '—', '1. Approve API của mình', '403/422', 'API', 'AU'],
    );
  }

  if (uc.id === 'HRM-AT-10' || uc.id === 'HRM-AT-12') {
    cases.push(
      [`TC-${short}-BAL-FD-001`, 'CAP-06', 'FN-BAL', 'FD', 'P0', 'NV', 'Số dư thấp', '1. Xin vượt số dư', 'Reject', 'API', 'FR-H03'],
      [`TC-${short}-BAL-BD-001`, 'CAP-06', 'FN-BAL', 'BD', 'P1', 'NV', 'Còn đúng 1 ngày', '1. Xin 1 ngày', 'Pass biên', 'API', 'FR-H03'],
      [`TC-${short}-ATT-FD-001`, 'CAP-06', 'FN-ATT', 'FD', 'P0', 'NV', 'Ốm ≥3 ngày', '1. Không đính kèm', 'Reject', 'API', 'FR-H03'],
      [`TC-${short}-ATT-FD-002`, 'CAP-06', 'FN-ATT', 'FD', 'P0', 'NV', '—', '1. attachment_url ngoài /api/hrm/files/', 'Reject path', 'API', 'FR-H03'],
      [`TC-${short}-ATT-BD-001`, 'CAP-06', 'FN-ATT', 'BD', 'P1', 'NV', 'Ốm đúng 3 ngày + file', '1. Submit', 'Pass', 'API', 'FR-H03'],
      [`TC-${short}-NOTICE-FD-001`, 'CAP-06', 'FN-NOTICE', 'FD', 'P1', 'NV', 'Phép năm', '1. Gửi <3 ngày lịch', 'Reject hoặc soft-warn theo SRS — ghi SPEC_GAP nếu lệch', 'API', 'FR-H03'],
      [`TC-${short}-NOTICE-BD-001`, 'CAP-06', 'FN-NOTICE', 'BD', 'P2', 'NV', 'Đúng 3 ngày', '1. Submit', 'Pass biên', 'API', 'FR-H03'],
    );
  }

  if (uc.id === 'HRM-AT-12') {
    cases.push(
      [`TC-${short}-L2-UX-001`, 'CAP-05', 'FN-APPR', 'UX', 'P0', 'L2', 'Đơn vượt ngưỡng L2', '1. Tìm bước L2', 'SPEC_GAP AS-IS 1 bước — case BLOCKED design · không claim PASS', 'UI', 'FR-H03 SPEC_GAP'],
    );
  }

  if (uc.id.startsWith('HRM-EM-01') || uc.id === 'HRM-EM-03') {
    cases.push(
      [`TC-${short}-LINK-HP-001`, 'CAP-06', 'FN-LINK', 'HP', 'P0', 'HRBP', 'Catalog dept/pos đã sync', '1. Chọn PB/chức danh 2. Lưu', 'FK hợp lệ · FE hiển thị tên', 'UI/API', 'catalog'],
      [`TC-${short}-LINK-FD-001`, 'CAP-06', 'FN-LINK', 'FD', 'P0', 'HRBP', 'Pos không thuộc CT', '1. Gán sai catalog', '4xx assert catalog', 'API', 'JD/pos class'],
    );
  }

  if (uc.id === 'HRM-PR-03') {
    cases.push(
      [`TC-${short}-PROC-HP-001`, 'CAP-06', 'FN-PROC', 'HP', 'P0', 'Payroll', 'Kỳ open có NV', '1. Process', '2xx · trạng thái processing/done · payslip sinh (nếu SRS)', 'UI/API', 'payroll process'],
      [`TC-${short}-PROC-FD-001`, 'CAP-06', 'FN-PROC', 'FD', 'P0', 'Payroll', 'Kỳ đã close', '1. Process lại', '4xx', 'API', 'SM'],
      [`TC-${short}-PROC-AU-001`, 'CAP-06', 'FN-PROC', 'AU', 'P0', 'NV', '—', '1. Process', '403', 'API', 'RBAC'],
      [`TC-${short}-PROC-UX-001`, 'CAP-06', 'FN-PROC', 'UX', 'P1', 'Payroll', 'Job dài', '1. Process', 'Progress/lock UI', 'UI', 'UX'],
      [`TC-${short}-CLOSE-HP-001`, 'CAP-06', 'FN-CLOSE', 'HP', 'P0', 'Payroll', 'Sau process OK', '1. Close', '2xx closed · F5', 'UI/API', 'close'],
      [`TC-${short}-CLOSE-FD-001`, 'CAP-06', 'FN-CLOSE', 'FD', 'P0', 'Payroll', 'Chưa process', '1. Close', '4xx BR', 'API', 'BR'],
    );
  }

  // Ensure thin NT still has enough cases from base (~12+)
  if (uc.id === 'HRM-NT-01' || uc.id === 'HRM-NT-02') {
    // base already ~22; ok
  }

  return { caps, fns, counts, cases, xrefNote };
}

function persona(uc) {
  if (uc.id.startsWith('XBOS-DM')) return 'ceo@xe.vn';
  if (uc.id.startsWith('UC-HRM-0') && uc.stt <= 265) return 'platform-admin / ceo@';
  if (uc.id.startsWith('HRM-AT-1') && ['HRM-AT-10', 'HRM-AT-11'].includes(uc.id)) return 'NV ESS / uat.nv';
  if (uc.id === 'HRM-AT-12' || uc.id === 'HRM-AT-13' || uc.id === 'HRM-AT-07' || uc.id === 'HRM-AT-08') return 'QL / manager';
  if (uc.id.startsWith('HRM-EM')) return 'HRBP / ceo@';
  if (uc.id.startsWith('HRM-PR')) return 'Payroll admin';
  if (uc.id === 'HRM-NT-02') return 'mobile ESS';
  return 'HR / ceo@xe.vn';
}

function precondHappy(uc) {
  if (uc.id.includes('APPR') || uc.kind === 'mutate_wf') return 'Nguồn pending tạo từ FE trước (U65 — cấm seed inbox)';
  if (uc.id.startsWith('HRM-EM')) return 'Catalog dept/pos đã có từ luồng FE/sync (không seed evidence)';
  if (uc.id.startsWith('HRM-PR')) return 'Có NV active trong scope';
  return 'Quyền + scope CT hợp lệ; data nguồn từ FE nếu cần';
}

function stepsHappy(uc) {
  return `1. Nhập đủ field hợp lệ theo HDSD cho «${uc.name}» 2. Lưu/Gửi/Thực thi 3. Quan sát Network 2xx 4. F5`;
}

function boundaryStep(uc) {
  if (uc.id.startsWith('HRM-AT')) return '1. Giờ/ngày biên (00:00, 23:59, ISO T) / số ngày = 1';
  if (uc.id.startsWith('HRM-PR')) return '1. Kỳ trùng tháng / from>to';
  if (uc.id.startsWith('HRM-EM')) return '1. CCCD/email biên độ dài';
  return '1. Giá trị biên số/ngày/độ dài';
}

function brPre(uc) {
  if (uc.id.startsWith('HRM-AT-10')) return 'Overlap pending hoặc thiếu số dư';
  if (uc.id.startsWith('HRM-PR')) return 'Kỳ overlapping';
  return 'Điều kiện BR sai';
}

function brStep(uc) {
  if (uc.id.startsWith('HRM-AT-10')) return '1. Tạo đơn overlap ngày';
  if (uc.id.startsWith('HRM-EM-04')) return '1. Archive NV đang có HĐ active (nếu BR chặn)';
  return '1. Thao tác vi phạm BR đã biết trong SRS/TechSpec';
}

function sumCounts(counts) {
  const t = { HP: 0, FD: 0, BD: 0, AU: 0, UX: 0, S: 0 };
  for (const [, hp, fd, bd, au, ux] of counts) {
    t.HP += hp; t.FD += fd; t.BD += bd; t.AU += au; t.UX += ux;
    t.S += hp + fd + bd + au + ux;
  }
  return t;
}

function renderUc(uc) {
  const tree = designTree(uc);
  const totals = sumCounts(tree.counts);
  // Prefer designed case table length as SoT count (counts should match)
  const caseN = tree.cases.length;
  const countRows = tree.counts
    .map(([fn, hp, fd, bd, au, ux]) => `| ${fn} | ${hp} | ${fd} | ${bd} | ${au} | ${ux} | **${hp + fd + bd + au + ux}** |`)
    .join('\n');
  const capRows = tree.caps.map(([id, n, p, a]) => `| ${id} | ${n} | ${p} | ${a} |`).join('\n');
  const fnRows = tree.fns.map(([c, id, n, ui, m]) => `| ${c} | ${id} | ${n} | ${ui} | ${m} |`).join('\n');
  const caseRows = tree.cases
    .map((r) => `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${r[5]} | ${r[6]} | ${r[7]} | ${r[8]} | ${r[9]} | ${r[10]} |`)
    .join('\n');

  const gapLeave = uc.id === 'HRM-AT-12'
    ? '| L2 leave ladder | SRS exemplar FR-H03 | AS-IS 1 bước | **SPEC_GAP** — không PASS |'
    : '| — | — | — | Không giấu gap |';

  return `# UC — \`${uc.id}\` · ${uc.name}

| Meta | Value |
|------|--------|
| **uc_id** | \`${uc.id}\` |
| **stt_phase1** | ${uc.stt} |
| **mod** | ${uc.mod} |
| **name_vi** | ${uc.name} |
| **actors** | ${uc.actors} |
| **surfaces** | ${uc.surfaces} |
| **srs_old** | ${uc.srs_old} |
| **srs_new** | ${uc.srs_new} |
| **tech_spec** | ${uc.tech} |
| **api_contract** | ${uc.api} |
| **author** | ${AUTHOR} |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | \`${uc.readiness}\` — **không** = UAT PASS |
| **code_note** | ${uc.code_note} |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.
${tree.xrefNote || ''}

---

## 1. Mục tiêu UC (1 đoạn)

${uc.name}: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
${capRows}

**Đếm nghiệp vụ:** ${tree.caps.length}

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
${fnRows}

**Đếm chức năng:** ${tree.fns.length}

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
${countRows}
| **Tổng (fn plan)** | ${totals.HP} | ${totals.FD} | ${totals.BD} | ${totals.AU} | ${totals.UX} | **${totals.S}** |
| **Tổng (bảng §5)** | | | | | | **${caseN}** |

> Σ bàn giao Synth = **số dòng TC §5** (\`${caseN}\`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
${caseRows}

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | ${tree.caps.every((c) => tree.fns.some((f) => f[0] === c[0])) ? 'Y' : 'N'} | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y (mutate) | Xem §4 | Optional FN ghi * |
| Auth/scope nếu đa CT | Y | AU cases | |
| SPEC_GAP ghi rõ | Y | | |
${gapLeave}

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | ${uc.readiness} — ${uc.code_note} | ${uc.api} |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | ${uc.surfaces.includes('mobile') ? 'In-scope surface — case Layer MOBILE/API' : 'N/A wave này trừ khi surfaces ghi mobile'} | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** \`${uc.readiness}\`

---

## 8. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
uc_id: ${uc.id}
cases_designed: ${caseN}
code_readiness: ${uc.readiness}
work_item_id: ${WI}
\`\`\`
`;
}

function main() {
  if (UCS.length !== 53) {
    console.error(`Expected 53 UCs, got ${UCS.length}`);
    process.exit(1);
  }

  const rows = [];
  let totalCases = 0;
  const readiness = { LIKELY_IMPL: 0, LIKELY_PARTIAL: 0, GAP: 0, UNKNOWN: 0 };

  for (const uc of UCS) {
    const md = renderUc(uc);
    const file = path.join(OUT, `${uc.id}.md`);
    fs.writeFileSync(file, md, 'utf8');
    const caseN = (md.match(/^\| TC-/gm) || []).length;
    totalCases += caseN;
    readiness[uc.readiness] = (readiness[uc.readiness] || 0) + 1;
    rows.push({
      stt: uc.stt,
      id: uc.id,
      name: uc.name,
      cases: caseN,
      readiness: uc.readiness,
      kind: uc.kind,
    });
    console.log(`Wrote ${uc.id}.md — ${caseN} cases — ${uc.readiness}`);
  }

  const manifest = `# Manifest — Squad W1-S5-HRM-A

| Meta | Value |
|------|--------|
| **work_item_id** | \`${WI}\` |
| **squad_id** | \`W1-S5-HRM-A\` |
| **STT range** | 248–300 |
| **uc_count** | ${rows.length} |
| **cases_designed_total** | **${totalCases}** |
| **author** | qa |
| **design_status** | DESIGNED |
| **execution** | not started |
| **ack_status** | **READY_FOR_SYNTH** |
| **generated** | 2026-08-04 |
| **locks** | U65 · U76 · design ≠ UAT · Phase1 \`uc_id\` filename SoT |
| **xref_exemplars** | \`UC-FR-H03_LEAVE.md\` · \`UC-FR-B03_RECRUITMENT_WF.md\` · \`UC-ATT_ESS_ADJUST.md\` (neo only) |
| **menu_neo** | HRM-EMPLOYEES / HRM-RECRUITMENT packs — không đè SoT by-uc |

---

## 1. Rollup code_readiness (honest grep — không = UAT)

| code_readiness | UC count |
|----------------|---------:|
| LIKELY_IMPL | ${readiness.LIKELY_IMPL || 0} |
| LIKELY_PARTIAL | ${readiness.LIKELY_PARTIAL || 0} |
| GAP | ${readiness.GAP || 0} |
| UNKNOWN | ${readiness.UNKNOWN || 0} |
| **Σ UC** | **${rows.length}** |

---

## 2. Per-UC inventory

| STT | uc_id | name_vi | kind | cases_designed | code_readiness | file |
|----:|-------|---------|------|---------------:|----------------|------|
${rows.map((r) => `| ${r.stt} | \`${r.id}\` | ${r.name} | ${r.kind} | ${r.cases} | \`${r.readiness}\` | \`by-uc/${r.id}.md\` |`).join('\n')}

| | | | **TOTAL** | **${totalCases}** | | |

---

## 3. Cluster subtotals

| Cluster | STT | UC | Cases |
|---------|-----|---:|------:|
| XBOS-DM-HRM-* | 248–262 | ${rows.filter((r) => r.id.startsWith('XBOS-DM-HRM')).length} | ${rows.filter((r) => r.id.startsWith('XBOS-DM-HRM')).reduce((a, r) => a + r.cases, 0)} |
| UC-HRM-01..08 | 263–270 | ${rows.filter((r) => /^UC-HRM-0[1-8]$/.test(r.id)).length} | ${rows.filter((r) => /^UC-HRM-0[1-8]$/.test(r.id)).reduce((a, r) => a + r.cases, 0)} |
| HRM-AT-* | 271–283 | ${rows.filter((r) => r.id.startsWith('HRM-AT')).length} | ${rows.filter((r) => r.id.startsWith('HRM-AT')).reduce((a, r) => a + r.cases, 0)} |
| HRM-SV-* | 284–289 | ${rows.filter((r) => r.id.startsWith('HRM-SV')).length} | ${rows.filter((r) => r.id.startsWith('HRM-SV')).reduce((a, r) => a + r.cases, 0)} |
| UC-HRM-12 + NT | 290–292 | ${rows.filter((r) => r.id === 'UC-HRM-12' || r.id.startsWith('HRM-NT')).length} | ${rows.filter((r) => r.id === 'UC-HRM-12' || r.id.startsWith('HRM-NT')).reduce((a, r) => a + r.cases, 0)} |
| HRM-EM-* | 293–297 | ${rows.filter((r) => r.id.startsWith('HRM-EM')).length} | ${rows.filter((r) => r.id.startsWith('HRM-EM')).reduce((a, r) => a + r.cases, 0)} |
| HRM-PR-01..03 | 298–300 | ${rows.filter((r) => r.id.startsWith('HRM-PR')).length} | ${rows.filter((r) => r.id.startsWith('HRM-PR')).reduce((a, r) => a + r.cases, 0)} |
| **Squad total** | 248–300 | **${rows.length}** | **${totalCases}** |

---

## 4. SPEC_GAP / residuals (design-time)

| ID | UC | Note |
|----|-----|------|
| SG-LEAVE-L2 | \`HRM-AT-12\` | Ladder L2 AS-IS gap — cite exemplar FR-H03; không invent PASS |
| SG-DM-FORM-PRESET | \`XBOS-DM-HRM-12\` | Form preset CC ↔ HRM mapping PARTIAL |
| SG-DM-FLEET-MAP | \`XBOS-DM-HRM-13\` | Catalog xe vs fleet master mapping |
| SG-INVITE-BULK | \`UC-HRM-04\` | Bulk invite FE vs single API invite |
| NOTE-ATT-SCOPE | \`HRM-AT-07\` | Approve header \`x-company-id\` class — design AU covers |

---

## 5. Handoff

\`\`\`
ack_status: READY_FOR_SYNTH
work_item_id: ${WI}
from_role: qa
next_owner: pm
evidence_path: docs/qa/professional/by-uc/_squad/W1-S5-HRM-A_MANIFEST.md
uc_files: ${rows.length}
cases_designed_total: ${totalCases}
execution: not started
uat_done: false
\`\`\`

---

*Generator: \`_gen_w1_s5_hrm_a.mjs\` — re-run only if regenerating design intentionally.*
`;

  const manifestPath = path.join(__dirname, 'W1-S5-HRM-A_MANIFEST.md');
  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log(`\nManifest → ${manifestPath}`);
  console.log(`UC=${rows.length} cases_total=${totalCases}`);
}

main();
