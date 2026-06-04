/** Dữ liệu tĩnh PMP Phase 1 — tiếng Việt */
export const DU_AN = {
  ten: 'Hệ sinh thái XeVN OS — Giai đoạn 1 (Phase 1)',
  ma: 'XEVN-P1-2026',
  batDau: '2026-05-19',
  ketThuc: '2026-08-15',
  sponsor: 'Ban lãnh đạo / Đối tác XeVN',
  pm: 'Quản lý dự án — PM (điều phối 10 vai trò)',
};

export const VAI_TRO = [
  { vaiTro: 'PM', moTa: 'Quản lý dự án, điều phối sprint, bus, gate', nguoi: 'PM Agent / Product Owner' },
  { vaiTro: 'SA', moTa: 'Kiến trúc, OpenAPI, ADR, boundary NFR', nguoi: 'Solution Architect' },
  { vaiTro: 'BA-Process', moTa: 'UC, AC, BR matrix, traceability', nguoi: 'Business Analyst (quy trình)' },
  { vaiTro: 'BA-Data', moTa: 'Data contract, danh mục 183, validation', nguoi: 'Business Analyst (dữ liệu)' },
  { vaiTro: 'Dev-BE', moTa: 'hrm-api, xbos-api, DB, seed', nguoi: 'Backend Lead + dev' },
  { vaiTro: 'Dev-FE', moTa: 'web-portal, hrm embed, vitest', nguoi: 'Frontend' },
  { vaiTro: 'Dev-Mobile', moTa: 'hrm-mobile, smoke MOB-*', nguoi: 'Mobile' },
  { vaiTro: 'QA', moTa: 'L0–L4, UAT, promote UC', nguoi: 'QA Lead' },
  { vaiTro: 'QC', moTa: 'Go/No-Go, pre-merge checklist', nguoi: 'QC Manager' },
  { vaiTro: 'Technical Manager', moTa: 'Security, convention, review', nguoi: 'TM' },
  { vaiTro: 'DevOps', moTa: 'Stack, CI, seed pipeline', nguoi: 'DevOps' },
];

export const STAKEHOLDER = [
  { nhom: 'Sponsor', ten: 'Ban lãnh đạo XeVN', quyenHan: 'Phê duyệt scope, nghiệm thu M5', lienHe: 'Họp gate S5' },
  { nhom: 'Đối tác vận hành', ten: 'Đội triển khai XeVN', quyenHan: 'UAT pilot, phản hồi nghiệp vụ', lienHe: 'Báo cáo PMP Excel' },
  { nhom: 'PMO', ten: 'PM dự án', quyenHan: 'Điều phối 10 vai trò', lienHe: 'Bus + LIVE_STATUS hàng ngày' },
  { nhom: 'Kỹ thuật', ten: 'SA, Dev-BE, Dev-FE, DevOps', quyenHan: 'Triển khai & vận hành stack', lienHe: 'Evidence docs/qa' },
  { nhom: 'Chất lượng', ten: 'QA, QC, TM', quyenHan: 'Xác nhận gate G1–G9', lienHe: 'PHASE1_GATE_REPORT' },
  { nhom: 'Người dùng pilot', ten: 'CEO tập đoàn (ceo@xe.vn)', quyenHan: 'UAT Command Center + HRM', lienHe: 'HUONG_DAN_DANG_NHAP_PILOT' },
];

export const TRUYEN_THONG = [
  { suKien: 'Họp khởi động Phase 1', tanSuat: 'Một lần', thanhPhan: 'Sponsor, PM, SA', dauRa: 'Charter + WBS' },
  { suKien: 'Sprint Planning', tanSuat: 'Đầu mỗi sprint S0–S5', thanhPhan: 'PM + toàn team', dauRa: 'Bus DISPATCHED' },
  { suKien: 'Daily pulse', tanSuat: 'Hàng ngày', thanhPhan: 'PM', dauRa: 'TEAM_LIVE_STATUS.md' },
  { suKien: 'Handoff Dev → QA', tanSuat: 'Theo work_item', thanhPhan: 'Dev, QA', dauRa: 'READY_FOR_QA + evidence' },
  { suKien: 'Sprint Review', tanSuat: 'Cuối sprint', thanhPhan: 'PM, QC, Sponsor (tùy)', dauRa: 'Retro + unlock sprint kế' },
  { suKien: 'Báo cáo đối tác', tanSuat: 'Theo yêu cầu / 2 tuần', thanhPhan: 'PM', dauRa: 'File Excel PMP này' },
  { suKien: 'Gate Go/No-Go', tanSuat: 'S0, S2, S3, S5', thanhPhan: 'QC + PM', dauRa: 'qc-*-*.md verdict' },
];

export const KE_HOACH_CHAT_LUONG = [
  { tang: 'L0', ten: 'Stack & health', lenh: 'pnpm run qc:dev-stack', tieuChi: 'HRM :28001, XBOS :28002, Portal :5175 HTTP 200', chuTri: 'DevOps/QA' },
  { tang: 'L1', ten: 'UAT tích hợp hệ thống', lenh: 'pnpm run test:system:uat', tieuChi: '37/37 PASS', chuTri: 'QA' },
  { tang: 'L2', ten: 'Pilot flows Command Center', lenh: 'pnpm run test:pilot:flows', tieuChi: '13/13 P-CC-01..09', chuTri: 'QA' },
  { tang: 'L2.5', ten: 'Journey nghiệp vụ HRM', lenh: 'J-HRM-01..07 smoke', tieuChi: 'List → chi tiết 200', chuTri: 'QA' },
  { tang: 'L3', ten: 'HRM embed audit', lenh: 'pnpm run test:hrm-embed:audit', tieuChi: '8/8 P-CC-03..08, không 54321', chuTri: 'QA' },
  { tang: 'L4', ten: 'Unit/contract jest', lenh: 'hrm-api + xbos-api test', tieuChi: '150+ xbos, 150+ hrm PASS', chuTri: 'Dev-BE/QA' },
  { tang: 'Gate', ten: 'Phase 1 gate', lenh: 'pnpm phase1:gate', tieuChi: 'exit 0', chuTri: 'PM/QA' },
];

export const BAN_GIAO = [
  { id: 'DL-01', ten: 'Portal X-BOS (web-portal)', trangThai: 'Pilot UAT', duongDan: 'apps/web/web-portal' },
  { id: 'DL-02', ten: 'API HRM (hrm-api)', trangThai: 'Pilot UAT', duongDan: 'apps/api/hrm-api' },
  { id: 'DL-03', ten: 'API XBOS (xbos-api)', trangThai: 'Pilot UAT', duongDan: 'apps/api/xbos-api' },
  { id: 'DL-04', ten: 'App Mobile HRM', trangThai: 'Regression PASS', duongDan: 'apps/mobile/hrm-mobile' },
  { id: 'DL-05', ten: 'BRD/SRS Phase 1', trangThai: 'Đã bàn giao', duongDan: 'docs/client-delivery/' },
  { id: 'DL-06', ten: 'Ma trận 245 UC', trangThai: 'Cập nhật liên tục', duongDan: 'docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md' },
  { id: 'DL-07', ten: 'Báo cáo gate QA', trangThai: 'Cập nhật liên tục', duongDan: 'docs/qa/PHASE1_GATE_REPORT.md' },
  { id: 'DL-08', ten: 'Kế hoạch PMP Excel', trangThai: 'Phiên bản này', duongDan: 'docs/client-delivery/Ke_hoach_du_an_PMP_*.xlsx' },
  { id: 'DL-09', ten: 'Seed & runbook pilot', trangThai: 'Có điều kiện', duongDan: 'docs/hrm/HUONG_DAN_DANG_NHAP_PILOT.md' },
];

export const RUI_RO = [
  ['R-01', 'Rủi ro', 'G1 chưa đạt 245/245 UC', 'Cao', 'PM', 'P1-CLOSE W2–W3 + QA promote', 'Mở', '157/245 hiện tại'],
  ['R-02', 'Rủi ro', 'G2 XBOS 79/104 e2e_pass', 'Cao', 'Dev-BE/FE', 'Đóng 4 UC planned + FE L2', 'Mở', 'p1-close-qa-w1b'],
  ['R-03', 'Rủi ro', 'hrm-api jest 149/150', 'Trung bình', 'Dev-BE', 'P1-CLOSE-BE-W3 spec fix', 'Mở', 'attendance scope'],
  ['R-04', 'Rủi ro', 'UC-XBOS-10 promote 500 tax_code', 'Cao', 'Dev-BE/DevOps', 'Migration DB + seed', 'Mở', 'org-foundation'],
  ['R-05', 'Rủi ro', 'Dual Supabase/API SoT HRM', 'Trung bình', 'Dev-FE', 'HRM_FULL_FIDELITY migrate', 'Mở', '~90 file ngoài pilot'],
  ['R-06', 'Rủi ro', 'Scope mutate IDOR P1-01', 'Cao', 'Dev-BE/TM', 'assertResourceInHrmScope', 'Mở', 'production blocker'],
  ['R-07', 'Rủi ro', 'Hook PM auto treo máy', 'Thấp', 'PM', 'PM_ORCHESTRATION_MODE=STOP', 'Đã xử lý', '.cursor/team'],
  ['I-01', 'Vấn đề', 'CC-03/04 chưa L2 promote', 'Trung bình', 'Dev-FE', 'P1-CLOSE-FE-W3', 'Mở', 'QA-W1B defer'],
  ['I-02', 'Vấn đề', 'ECO-FE-01 mock còn sót', 'Trung bình', 'Dev-FE', 'W3 global mock removal', 'Mở', '—'],
  ['I-03', 'Vấn đề', 'Chưa QC GO program', 'Cao', 'QC', 'P1-S5-QC-02', 'Mở', 'S5 locked'],
  ['I-04', 'Vấn đề', 'Production chưa triển khai', 'Cao', 'DevOps', 'Gate prod riêng', 'Mở', 'ngoài P1'],
];

export const GIA_DINH = [
  ['GD-01', 'Postgres + JWT pilot sẵn sàng trên môi trường demo'],
  ['GD-02', 'Tài khoản ceo@xe.vn / scope company_id=main đã seed'],
  ['GD-03', 'Đối tác chấp nhận UAT trên dev/local trước production'],
  ['GD-04', 'SRS 245 FR đã đủ; thay đổi scope qua change log PM'],
  ['GD-05', 'Không bulk-waive UC; miễn trừ chỉ PM+SA (ECO-MASTER-01)'],
];

export const RANG_BUOC = [
  ['RB-01', '245 UC Phase 1 — không gồm 128 UC Logistic Phase 2'],
  ['RB-02', 'Mỗi UC e2e_pass cần evidence_path trong phase1-impl-status.json'],
  ['RB-03', 'QC mới ký DONE chương trình — Dev không tự claim'],
  ['RB-04', 'HRM embed bắt buộc qua Portal SSO — không login :8080 độc lập'],
  ['RB-05', 'Thời gian ~13 tuần squad; parallel agent tăng throughput'],
];

export const BAI_HOC = [
  ['2026-05-23', 'S0', 'Embed pilot trước full HRM → giảm 54321', 'hrmEmbedPilotGuard'],
  ['2026-05-24', 'U18', 'Gov wave SA/BA trước Dev → ít rework', 'p1-today-*-delta'],
  ['2026-05-24', 'U18', 'Không claim DONE khi G1/G2 mở', 'p1-u18-qc-eod NO-GO'],
  ['2026-05-25', 'P1-CLOSE', 'QA không bulk-promote FE không L2', 'p1-close-qa-w1'],
  ['2026-05-25', 'P1-CLOSE', 'company_id=main không phải xevn trên KPI rail', 'p1-close-fe-a2'],
];

export const THAY_DOI = [
  ['CHG-01', '2026-05-24', 'U18 deadline Phase 1 trong ngày', 'PM', 'Đã', 'NO-GO program; tiếp P1-CLOSE'],
  ['CHG-02', '2026-05-25', 'Bỏ login HRM standalone → Portal SSO', 'PM/FE', 'Đã', 'HRM-AUTH-PORTAL-ONLY'],
  ['CHG-03', '2026-05-25', 'Overlay P1-CLOSE 4 wave', 'PM', 'Đang', 'đóng 123 UC còn'],
];

/** WBS chi tiết + Gantt */
export const WBS_CHI_TIET = [
  { wbs: '1.0', ten: 'Chương trình Phase 1 (245 UC)', bat_dau: '2026-05-19', ket_thuc: '2026-08-15', pct: 64, tt: 'Đang TH', chu: 'PM', pred: '—' },
  { wbs: '1.1', ten: 'Quản trị dự án & PMO', bat_dau: '2026-05-19', ket_thuc: '2026-08-15', pct: 75, tt: 'Đang TH', chu: 'PM', pred: '—' },
  { wbs: '1.1.1', ten: 'WBS / PMP / MASTER_TODO', bat_dau: '2026-05-19', ket_thuc: '2026-05-22', pct: 100, tt: 'Xong', chu: 'PM', pred: '—' },
  { wbs: '1.1.2', ten: 'Bus + TEAM_LIVE_STATUS', bat_dau: '2026-05-19', ket_thuc: '2026-08-15', pct: 80, tt: 'Đang TH', chu: 'PM', pred: '1.1.1' },
  { wbs: '1.2', ten: 'Sprint S0 — Pilot zero-defect', bat_dau: '2026-05-19', ket_thuc: '2026-05-27', pct: 100, tt: 'Xong', chu: 'PM/QA/QC', pred: '1.1' },
  { wbs: '1.2.1', ten: 'L0 qc:dev-stack', bat_dau: '2026-05-19', ket_thuc: '2026-05-20', pct: 100, tt: 'Xong', chu: 'DevOps', pred: '—' },
  { wbs: '1.2.2', ten: 'P-CC-01..08 BA + BE scope main', bat_dau: '2026-05-20', ket_thuc: '2026-05-24', pct: 100, tt: 'Xong', chu: 'BA/BE', pred: '1.2.1' },
  { wbs: '1.2.3', ten: 'FE embed API mode P-CC-05..08', bat_dau: '2026-05-22', ket_thuc: '2026-05-25', pct: 100, tt: 'Xong', chu: 'Dev-FE', pred: '1.2.2' },
  { wbs: '1.2.4', ten: 'QC S0 GO WITH CONDITIONS', bat_dau: '2026-05-25', ket_thuc: '2026-05-25', pct: 100, tt: 'Xong', chu: 'QC', pred: '1.2.3' },
  { wbs: '1.3', ten: 'Sprint S1 — XBOS planned→be', bat_dau: '2026-05-28', ket_thuc: '2026-06-18', pct: 90, tt: 'Xong', chu: 'Dev/BA', pred: '1.2' },
  { wbs: '1.3.1', ten: 'SA OpenAPI M01', bat_dau: '2026-05-28', ket_thuc: '2026-06-02', pct: 100, tt: 'Xong', chu: 'SA', pred: '1.3' },
  { wbs: '1.3.2', ten: 'BA UC-XBOS-03..07 + MD-01..08', bat_dau: '2026-05-28', ket_thuc: '2026-06-05', pct: 100, tt: 'Xong', chu: 'BA', pred: '1.3' },
  { wbs: '1.3.3', ten: 'BE catalog/KPI/org/audit/ECO-MASTER-02', bat_dau: '2026-06-01', ket_thuc: '2026-06-15', pct: 100, tt: 'Xong', chu: 'Dev-BE', pred: '1.3.2' },
  { wbs: '1.3.4', ten: 'FE KPI rail, workflow, dept templates', bat_dau: '2026-06-05', ket_thuc: '2026-06-18', pct: 100, tt: 'Xong', chu: 'Dev-FE', pred: '1.3.3' },
  { wbs: '1.3.5', ten: 'QA S1 batch 37/37 UAT', bat_dau: '2026-06-10', ket_thuc: '2026-06-18', pct: 100, tt: 'Xong', chu: 'QA', pred: '1.3.4' },
  { wbs: '1.4', ten: 'Overlay HRM-FULL-FIDELITY', bat_dau: '2026-05-24', ket_thuc: '2026-06-10', pct: 92, tt: 'GWC', chu: 'Dev/QA', pred: '1.2' },
  { wbs: '1.4.1', ten: 'Seed realistic + density 7/7', bat_dau: '2026-05-24', ket_thuc: '2026-05-28', pct: 100, tt: 'Xong', chu: 'Dev-BE', pred: '1.4' },
  { wbs: '1.4.2', ten: 'QC G-FID-08 embed slice', bat_dau: '2026-05-24', ket_thuc: '2026-05-24', pct: 100, tt: 'GWC', chu: 'QC', pred: '1.4.1' },
  { wbs: '1.5', ten: 'P1-CLOSE-W1 đóng G2 gap', bat_dau: '2026-05-25', ket_thuc: '2026-06-01', pct: 80, tt: 'Đang TH', chu: 'Dev/QA', pred: '1.3' },
  { wbs: '1.5.1', ten: 'BE-A2 ORG/SYNC/master', bat_dau: '2026-05-25', ket_thuc: '2026-05-25', pct: 100, tt: 'Xong', chu: 'Dev-BE', pred: '1.5' },
  { wbs: '1.5.2', ten: 'FE-A2 CC-05/AR/org', bat_dau: '2026-05-25', ket_thuc: '2026-05-25', pct: 100, tt: 'Xong', chu: 'Dev-FE', pred: '1.5' },
  { wbs: '1.5.3', ten: 'QA-W1 promote 6 UC', bat_dau: '2026-05-25', ket_thuc: '2026-05-25', pct: 100, tt: 'Xong', chu: 'QA', pred: '1.5.1' },
  { wbs: '1.5.4', ten: 'BE-W1B/C1 + FE-W1B', bat_dau: '2026-05-25', ket_thuc: '2026-05-26', pct: 100, tt: 'Xong', chu: 'Dev', pred: '1.5.3' },
  { wbs: '1.5.5', ten: 'QA-W1B +8 UC G2', bat_dau: '2026-05-26', ket_thuc: '2026-05-26', pct: 100, tt: 'Xong', chu: 'QA', pred: '1.5.4' },
  { wbs: '1.6', ten: 'P1-CLOSE-W2/W3 đóng UC còn', bat_dau: '2026-05-26', ket_thuc: '2026-06-10', pct: 40, tt: 'Đang TH', chu: 'Dev/QA', pred: '1.5' },
  { wbs: '1.6.1', ten: 'BE-W2 HRM AT/PR promote', bat_dau: '2026-05-26', ket_thuc: '2026-05-26', pct: 100, tt: 'Xong', chu: 'Dev-BE', pred: '1.6' },
  { wbs: '1.6.2', ten: 'FE-W2 reports/tasks API', bat_dau: '2026-05-26', ket_thuc: '2026-05-26', pct: 100, tt: 'Xong', chu: 'Dev-FE', pred: '1.6' },
  { wbs: '1.6.3', ten: 'QA-W2 + BE-W3 + FE-W3', bat_dau: '2026-05-26', ket_thuc: '2026-06-08', pct: 30, tt: 'Đang TH', chu: 'QA', pred: '1.6.1' },
  { wbs: '1.7', ten: 'Sprint S2 — XBOS 104 e2e (G2)', bat_dau: '2026-06-02', ket_thuc: '2026-06-16', pct: 76, tt: 'Đang TH', chu: 'Dev/QA', pred: '1.5' },
  { wbs: '1.8', ten: 'Sprint S3 — HRM 119 (G3)', bat_dau: '2026-06-17', ket_thuc: '2026-07-14', pct: 58, tt: 'Kế hoạch', chu: 'Dev/QA', pred: '1.7' },
  { wbs: '1.8.1', ten: 'FE full embed + standalone SSO', bat_dau: '2026-06-17', ket_thuc: '2026-07-01', pct: 50, tt: 'Kế hoạch', chu: 'Dev-FE', pred: '1.8' },
  { wbs: '1.8.2', ten: 'BE employees/:id + scope parity', bat_dau: '2026-06-17', ket_thuc: '2026-07-05', pct: 55, tt: 'Kế hoạch', chu: 'Dev-BE', pred: '1.8' },
  { wbs: '1.9', ten: 'Sprint S4 — DM 183 + G4', bat_dau: '2026-07-15', ket_thuc: '2026-07-28', pct: 100, tt: 'Xong', chu: 'DevOps', pred: '1.8' },
  { wbs: '1.10', ten: 'Sprint S5 — Nghiệm thu Phase 1', bat_dau: '2026-07-29', ket_thuc: '2026-08-08', pct: 15, tt: 'Kế hoạch', chu: 'QA/QC/PM', pred: '1.9' },
  { wbs: '1.10.1', ten: 'QA-03 full regression strict', bat_dau: '2026-07-29', ket_thuc: '2026-08-02', pct: 0, tt: 'Chưa', chu: 'QA', pred: '1.10' },
  { wbs: '1.10.2', ten: 'QC-02 GO program 245/245', bat_dau: '2026-08-03', ket_thuc: '2026-08-08', pct: 0, tt: 'Chưa', chu: 'QC', pred: '1.10.1' },
  { wbs: '1.10.3', ten: 'M5 — Ký nghiệm thu đối tác', bat_dau: '2026-08-08', ket_thuc: '2026-08-15', pct: 0, tt: 'Chưa', chu: 'Sponsor/PM', pred: '1.10.2' },
];

export const SPRINT_BACKLOG = [
  ['S0', 'P1-S0-PM-01', 'PM', 'Kickoff + daily + bus', 'Xong', 'TEAM_LIVE_STATUS'],
  ['S0', 'P1-S0-DO-01', 'DevOps', 'L0 qc:dev-stack', 'Xong', 'scrum-s0-stack'],
  ['S0', 'P1-S0-FE-01', 'Dev-FE', 'Embed P-CC-05..08 API', 'Xong', 'S1-FE-DEBT'],
  ['S0', 'P1-S0-QA-01', 'QA', 'Retest P-CC-01..08', 'Xong', 'pilot-business-flow'],
  ['S0', 'P1-S0-QC-01', 'QC', 'Gate 8 routes', 'GWC', 'qc-hrm-embed'],
  ['S1', 'P1-S1-SA-01', 'SA', 'OpenAPI M01', 'Xong', 'ADR OpenAPI'],
  ['S1', 'P1-S1-BE-01..05', 'Dev-BE', 'Catalog/KPI/org/audit', 'Xong', 'p1-s5-be-wave'],
  ['S1', 'P1-S1-FE-01..03', 'Dev-FE', 'CC KPI/workflow/dept', 'Xong', 'p1-today-fe-a'],
  ['S1', 'P1-S1-QA-01', 'QA', 'UAT 37/37 + embed 8/8', 'Xong', 'p1-s5-qa-01'],
  ['S1', 'P1-S1-TM-01', 'TM', 'Review S1', 'GWC', 'p1-s1-tm-01'],
  ['S2', 'P1-S2-FE-01', 'Dev-FE', 'ACTION_BUTTON→API', 'Đang', '—'],
  ['S2', 'P1-S2-QA-01', 'QA', 'verify-capability-e2e', 'Đang', '—'],
  ['S2', 'P1-S2-QC-01', 'QC', 'Gate khối A', 'GWC', 'p1-s2-qc-01'],
  ['S3', 'P1-S3-BE-01', 'Dev-BE', 'HRM API completion', 'Kế hoạch', '—'],
  ['S3', 'P1-S3-FE-01', 'Dev-FE', 'Full HRM embed', 'Kế hoạch', '—'],
  ['S3', 'P1-S3-QA-01', 'QA', 'UAT 119 HRM', 'Kế hoạch', '—'],
  ['S4', 'P1-S4-DO-01', 'DevOps', 'Seed W2 pipeline', 'Xong', 'p1-u18-do-b1'],
  ['S4', 'P1-S4-QA-01', 'QA', 'G4 DM-LOG 22', 'Xong', 'p1-u18-qa-g4'],
  ['S5', 'P1-S5-QA-01', 'QA', 'Full regression', 'Xong', 'p1-u18-qa-eod'],
  ['S5', 'P1-S5-QC-01', 'QC', 'U18 EOD NO-GO', 'Xong', 'p1-u18-qc-eod'],
  ['CLOSE', 'P1-CLOSE-BE-A2', 'Dev-BE', 'ORG/SYNC G2', 'Xong', 'p1-close-be-a2'],
  ['CLOSE', 'P1-CLOSE-FE-A2', 'Dev-FE', 'CC-05/AR', 'Xong', 'p1-close-fe-a2'],
  ['CLOSE', 'P1-CLOSE-QA-W1B', 'QA', '+8 UC promote', 'Xong', 'p1-close-qa-w1b'],
  ['CLOSE', 'P1-CLOSE-BE-W2', 'Dev-BE', '+20 HRM UC', 'Xong', 'p1-close-be-w2'],
  ['CLOSE', 'P1-CLOSE-FE-W2', 'Dev-FE', 'Reports/tasks API', 'Xong', 'p1-close-fe-w2'],
  ['CLOSE', 'P1-CLOSE-QA-W2', 'QA', 'Promote all handoff', 'Đang', '—'],
  ['CLOSE', 'P1-CLOSE-BE-W3', 'Dev-BE', 'Blockers tax_code', 'Đang', '—'],
  ['CLOSE', 'P1-CLOSE-FE-W3', 'Dev-FE', 'CC-03/04/ECO-FE', 'Đang', '—'],
];

export const COT_MOC = [
  ['M0', 'Pilot 8 tuyến Command Center', 'S0', '2026-05-27', 'G8', 'Đạt', 'P-CC-01..08 PASS', 'pilot-business-flow'],
  ['M1', 'XBOS BE slice hoàn tất', 'S1', '2026-06-18', '—', 'Đạt', 'Catalog/KPI/org', 'p1-s5-be-wave-final'],
  ['M1b', 'HRM fidelity density 7/7', 'Overlay', '2026-06-10', 'G-FID', 'GWC', 'Group CEO main', 'hrm-qc-w1-clean-gate'],
  ['M2', 'XBOS 104 UC e2e_pass', 'S2/CLOSE', '2026-06-16', 'G2', 'Chưa', '79/104', 'p1-close-qa-w1b'],
  ['M3', 'HRM 119 UC sign-off', 'S3', '2026-07-14', 'G3', 'Chưa', '—', '—'],
  ['M4', '183 DM + DM-LOG 22', 'S4', '2026-07-28', 'G4 G5', 'Đạt', '22/22 LOG', 'p1-u18-qa-g4'],
  ['M5', 'Nghiệm thu Phase 1', 'S5', '2026-08-08', 'G1 G7', 'Chưa', '157/245', 'P1-S5-QC-02'],
];

export const GATE_CHI_TIET = [
  ['G1', 'Đóng 245 use case', 'Mỗi UC: e2e_pass hoặc waived + evidence_path', '245/245', 'phase1-impl-status.json', 'QA/QC'],
  ['G2', 'XBOS khối A', '104 UC e2e_pass (STT 1–97, 367–373)', '104/104', 'verify:capabilities', 'QA'],
  ['G3', 'HRM khối C', '119 UC QA sign-off + L2 route', '119/119', 'test:hrm-embed + mobile', 'QA'],
  ['G4', 'DM-LOG', '22 UC XBOS-DM-LOG-* checklist', '22/22', 'seed + QA G4', 'QA'],
  ['G5', '183 danh mục', 'Publish + menu-density 7/7', 'Đạt', 'verify:hrm:menu-density', 'DevOps/QA'],
  ['G6', 'Mobile HRM', '15 UC-HRM-MOB-*', '15/15', 'mobile-hrm-smoke.mjs', 'QA'],
  ['G7', 'Gate tự động', 'pnpm phase1:gate exit 0', '0', 'PHASE1_GATE_REPORT', 'PM'],
  ['G8', 'Pilot zero-defect', 'L0–L3 P-CC PASS', 'PASS', 'pilot + embed audit', 'QA'],
  ['G9', 'Traceability test', '245 UC ≥ partial trong catalog', '245/245', 'test:uc:catalog', 'QA'],
];

export const MOD_LABEL = {
  M00: 'M00 — Cổng & Command Center',
  M01: 'M01 — XBOS nền tảng',
  M02: 'M02 — Governance danh mục',
  M03: 'M03 — DM Logistic',
  M05: 'M05 — HRM nghiệp vụ',
  M06: 'M06 — HRM Mobile',
};
