/**
 * Mẫu ma trận phân quyền X-BOS theo nhóm chức danh RACI Option 1.
 * Hạt giống tương thích `buildPermissionMatrix` trong CommandCenterPage.
 */

export type RaciPermissionRowSeed = Partial<{
  view: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
  dataScope: 'personal' | 'department' | 'legal_entity' | 'group';
}>;

export type RaciPermissionBootstrap = {
  roles: ReadonlyArray<{ id: string; label: string }>;
  defaultRoleId: string;
  seedsByRoleId: Record<string, Record<string, RaciPermissionRowSeed>>;
};

/** HĐQT — gần tương đương BOD: quyền cao, phạm vi tập đoàn. */
const SEEDS_HDQT: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: true, delete: true, approve: true, dataScope: 'group' },
  'pm-org-2': { view: true, write: true, delete: true, approve: true, dataScope: 'group' },
  'pm-org-3': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-log-1': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-log-2': { view: true, write: true, delete: true, approve: true, dataScope: 'group' },
  'pm-log-3': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-hr-1': { view: true, write: false, delete: false, approve: true, dataScope: 'group' },
  'pm-hr-2': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-sys-1': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-sys-2': { view: true, write: true, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-3': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
};

const SEEDS_CEO: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-org-2': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-org-3': { view: true, write: false, delete: false, approve: true, dataScope: 'group' },
  'pm-log-1': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-log-2': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-log-3': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-hr-1': { view: true, write: false, delete: false, approve: true, dataScope: 'group' },
  'pm-hr-2': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-sys-1': { view: true, write: false, delete: false, approve: false, dataScope: 'group' },
  'pm-sys-2': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-3': { view: true, write: false, delete: false, approve: true, dataScope: 'group' },
};

const SEEDS_CFO: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-org-2': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-org-3': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-log-1': { view: true, write: false, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-log-2': { view: true, write: false, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-log-3': { view: true, write: true, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-hr-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-hr-2': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-2': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-sys-3': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
};

const SEEDS_CHRO: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-org-2': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-org-3': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-log-1': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-log-2': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-log-3': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-hr-1': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-hr-2': { view: true, write: true, delete: false, approve: true, dataScope: 'group' },
  'pm-sys-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-2': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-sys-3': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
};

const SEEDS_PTGD_KD: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-org-2': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-org-3': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-log-1': { view: true, write: true, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-log-2': { view: true, write: true, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-log-3': { view: true, write: true, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-hr-1': { view: true, write: false, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-hr-2': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-1': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-sys-2': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-sys-3': { view: true, write: false, delete: false, approve: false, dataScope: 'legal_entity' },
};

const SEEDS_TRUONG_KHO: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-org-2': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-org-3': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-log-1': { view: true, write: true, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-log-2': { view: true, write: true, delete: false, approve: true, dataScope: 'legal_entity' },
  'pm-log-3': { view: true, write: true, delete: false, approve: false, dataScope: 'legal_entity' },
  'pm-hr-1': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-hr-2': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-sys-1': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-sys-2': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-sys-3': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
};

const SEEDS_NV_THUC_HIEN: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-org-2': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-org-3': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-log-1': { view: true, write: false, delete: false, approve: false, dataScope: 'department' },
  'pm-log-2': { view: true, write: true, delete: false, approve: false, dataScope: 'department' },
  'pm-log-3': { view: true, write: true, delete: false, approve: false, dataScope: 'department' },
  'pm-hr-1': { view: true, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-hr-2': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-sys-1': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-sys-2': { view: true, write: false, delete: false, approve: false, dataScope: 'personal' },
  'pm-sys-3': { view: false, write: false, delete: false, approve: false, dataScope: 'personal' },
};

const SEEDS_ADMIN_HT: Record<string, RaciPermissionRowSeed> = {
  'pm-org-1': { view: true, write: true, delete: true, approve: false, dataScope: 'group' },
  'pm-org-2': { view: true, write: true, delete: true, approve: false, dataScope: 'group' },
  'pm-org-3': { view: true, write: false, delete: false, approve: false, dataScope: 'group' },
  'pm-log-1': { view: true, write: true, delete: true, approve: false, dataScope: 'group' },
  'pm-log-2': { view: true, write: true, delete: true, approve: false, dataScope: 'group' },
  'pm-log-3': { view: true, write: true, delete: false, approve: false, dataScope: 'group' },
  'pm-hr-1': { view: true, write: true, delete: true, approve: false, dataScope: 'group' },
  'pm-hr-2': { view: true, write: true, delete: false, approve: false, dataScope: 'group' },
  'pm-sys-1': { view: true, write: true, delete: true, approve: true, dataScope: 'group' },
  'pm-sys-2': { view: true, write: true, delete: true, approve: true, dataScope: 'group' },
  'pm-sys-3': { view: true, write: true, delete: true, approve: true, dataScope: 'group' },
};

export const RACI_PERMISSION_BOOTSTRAP: RaciPermissionBootstrap = {
  roles: [
    { id: 'raci_hdqt', label: 'HĐQT (RACI)' },
    { id: 'raci_ceo', label: 'CEO' },
    { id: 'raci_cfo', label: 'CFO / TCKT' },
    { id: 'raci_chro', label: 'CHRO / HCNS' },
    { id: 'raci_ptgd_kd', label: 'PTGĐ Kinh doanh' },
    { id: 'raci_truong_kho', label: 'Trưởng phòng Kho' },
    { id: 'raci_nv_th', label: 'Nhân viên thực hiện (R)' },
    { id: 'admin_ht', label: 'Admin hệ thống' },
  ],
  defaultRoleId: 'raci_hdqt',
  seedsByRoleId: {
    raci_hdqt: SEEDS_HDQT,
    raci_ceo: SEEDS_CEO,
    raci_cfo: SEEDS_CFO,
    raci_chro: SEEDS_CHRO,
    raci_ptgd_kd: SEEDS_PTGD_KD,
    raci_truong_kho: SEEDS_TRUONG_KHO,
    raci_nv_th: SEEDS_NV_THUC_HIEN,
    admin_ht: SEEDS_ADMIN_HT,
  },
};
