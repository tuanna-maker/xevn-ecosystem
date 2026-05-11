/**
 * Khung hệ thống Phòng/Ban — danh mục nền có mã, tick pháp nhân áp dụng,
 * chọn cấp ORG GRADE được kích hoạt (prototype; sau này gắn cây PB + chức danh).
 */

export type DeptSystemFoundationTemplate = {
  id: string;
  code: string;
  nameVi: string;
  description?: string;
  /** Pháp nhân thành viên áp dụng khung này */
  appliesToCompanyIds: string[];
  /** Các cấp ORG GRADE (1–9) được dùng tại đơn vị — mặc định đủ 9, có thể bỏ cấp 6 (trống) */
  enabledOrgGradeLevels: number[];
};

export const INITIAL_DEPT_SYSTEM_TEMPLATES: DeptSystemFoundationTemplate[] = [
  {
    id: 'dtpl-001',
    code: 'PB-ORG-XEVN-01',
    nameVi: 'Khung phòng/ban & chức danh chuẩn XeVN',
    description:
      'Tham chiếu ORG GRADE tập đoàn; phòng/ban cụ thể khai báo tại từng pháp nhân sau khi được gán khung.',
    appliesToCompanyIds: ['comp-001', 'comp-002', 'comp-003'],
    enabledOrgGradeLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
];
