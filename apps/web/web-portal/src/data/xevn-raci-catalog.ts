/**
 * Ma trận RACI — Option 1 (khách hàng Xe Việt Nam).
 * Nguồn: docs/từ khách hàng/1. PHÂN QUYỀN RACI OPTION 1.xlsx — hàng tiêu đề cột (sheet1, dòng 9–10).
 * Dùng cho: danh mục vai trò, gán bước quy trình, căn chỉnh ma trận phân quyền X-BOS.
 */

export const RACI_SOURCE_FILE =
  'docs/từ khách hàng/1. PHÂN QUYỀN RACI OPTION 1.xlsx';

export const RACI_LETTER_MEANINGS: ReadonlyArray<{
  letter: string;
  labelVi: string;
  labelEn: string;
}> = [
  { letter: 'R', labelVi: 'Thực hiện', labelEn: 'Responsible' },
  { letter: 'A', labelVi: 'Chịu trách nhiệm cuối', labelEn: 'Accountable' },
  { letter: 'C', labelVi: 'Tham vấn', labelEn: 'Consulted' },
  { letter: 'I', labelVi: 'Nhận thông tin', labelEn: 'Informed' },
];

export type RaciOrgColumnId =
  | 'dhcd'
  | 'hdqt'
  | 'ceo'
  | 'ban_kiem_soat'
  | 'giam_sat_an_toan'
  | 'ptgd_noi_chinh'
  | 'tckt'
  | 'hcns'
  | 'ptgd_van_hanh'
  | 'xuong_sua_chua'
  | 'coo'
  | 'van_tai_hanh_khach'
  | 'van_tai_hang_hoa'
  | 'kho_phan_phoi'
  | 'ptgd_kinh_doanh'
  | 'kinh_doanh'
  | 'marketing'
  | 'cong_ty_thanh_vien';

/** Một cột trên ma trận RACI (đơn vị / chức danh đại diện). */
export type RaciOrgColumn = {
  id: RaciOrgColumnId;
  /** Tên khối / đơn vị trên file Excel (hàng 9). */
  orgUnit: string;
  /** Chức danh đại diện trong cột (hàng 10; có thể rỗng). */
  positionTitle: string;
  /** Nhãn gán bước quy trình (dropdown). */
  workflowRoleLabel: string;
  /** Được cấu hình nhánh Từ chối trên quy trình (ĐHCĐ: góc quản trị, không từ chối nghiệp vụ thường). */
  workflowAllowsReject: boolean;
};

/**
 * Cột RACI theo thứ tự trái → phải trên file (cột C → T trong Excel, 0-based col 2..19).
 */
export const RACI_ORG_COLUMNS: ReadonlyArray<RaciOrgColumn> = [
  {
    id: 'dhcd',
    orgUnit: 'ĐHCĐ',
    positionTitle: '',
    workflowRoleLabel: 'ĐHCĐ — Đại hội đồng cổ đông',
    workflowAllowsReject: false,
  },
  {
    id: 'hdqt',
    orgUnit: 'HĐQT',
    positionTitle: 'HĐQT',
    workflowRoleLabel: 'HĐQT — Hội đồng quản trị',
    workflowAllowsReject: true,
  },
  {
    id: 'ceo',
    orgUnit: 'CEO',
    positionTitle: 'CEO',
    workflowRoleLabel: 'CEO — Tổng Giám đốc',
    workflowAllowsReject: true,
  },
  {
    id: 'ban_kiem_soat',
    orgUnit: 'Ban Kiểm soát',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Ban Kiểm soát — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'giam_sat_an_toan',
    orgUnit: 'Giám sát và an toàn',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Giám sát & an toàn — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'ptgd_noi_chinh',
    orgUnit: 'P.TGĐ (Nội chính)',
    positionTitle: 'PTGĐ',
    workflowRoleLabel: 'PTGĐ Nội chính',
    workflowAllowsReject: true,
  },
  {
    id: 'tckt',
    orgUnit: 'Tài chính kế toán',
    positionTitle: 'CFO',
    workflowRoleLabel: 'Tài chính kế toán — CFO',
    workflowAllowsReject: true,
  },
  {
    id: 'hcns',
    orgUnit: 'Hành chính nhân sự',
    positionTitle: 'CHRO',
    workflowRoleLabel: 'Hành chính nhân sự — CHRO',
    workflowAllowsReject: true,
  },
  {
    id: 'ptgd_van_hanh',
    orgUnit: 'P.TGĐ (Vận hành)',
    positionTitle: 'PTGD',
    workflowRoleLabel: 'PTGĐ Vận hành',
    workflowAllowsReject: true,
  },
  {
    id: 'xuong_sua_chua',
    orgUnit: 'Xưởng sửa chữa',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Xưởng sửa chữa — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'coo',
    orgUnit: 'COO',
    positionTitle: 'COO',
    workflowRoleLabel: 'COO — Giám đốc vận hành',
    workflowAllowsReject: true,
  },
  {
    id: 'van_tai_hanh_khach',
    orgUnit: 'Vận tải Hành Khách',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Vận tải hành khách — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'van_tai_hang_hoa',
    orgUnit: 'Vận Tải hàng hóa',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Vận tải hàng hóa — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'kho_phan_phoi',
    orgUnit: 'Kho phân phối',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Kho phân phối — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'ptgd_kinh_doanh',
    orgUnit: 'P.TGĐ (PT KD)',
    positionTitle: 'PTGĐ',
    workflowRoleLabel: 'PTGĐ Phụ trách kinh doanh',
    workflowAllowsReject: true,
  },
  {
    id: 'kinh_doanh',
    orgUnit: 'Kinh doanh',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Kinh doanh — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'marketing',
    orgUnit: 'Maketing',
    positionTitle: 'Trưởng phòng',
    workflowRoleLabel: 'Marketing — Trưởng phòng',
    workflowAllowsReject: true,
  },
  {
    id: 'cong_ty_thanh_vien',
    orgUnit: 'Công ty thành viên',
    positionTitle: 'Giám đốc',
    workflowRoleLabel: 'Công ty thành viên — Giám đốc',
    workflowAllowsReject: true,
  },
];

export function raciColumnById(id: RaciOrgColumnId): RaciOrgColumn | undefined {
  return RACI_ORG_COLUMNS.find((c) => c.id === id);
}

/** id vai trò quy trình: tiền tố `raci_` + id cột. */
export function workflowRoleIdForRaciColumn(id: RaciOrgColumnId): string {
  return `raci_${id}`;
}
