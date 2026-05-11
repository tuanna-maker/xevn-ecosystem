/**
 * Danh mục nền hạ tầng cơ sở (Origin catalog) — có mã cố định, phạm vi pháp nhân,
 * trước khi cấu hình khối/trường và trước khi nhập giá trị từng điểm hạ tầng.
 */

export type InfrastructureFoundationCategory = {
  id: string;
  /** Mã danh mục nền (vd: HT-LOG-CS) — dùng làm khóa nghiệp vụ / đồng bộ */
  code: string;
  nameVi: string;
  description?: string;
  /** Pháp nhân trong tập đoàn phải áp dụng bộ khối/trường của danh mục này */
  appliesToCompanyIds: string[];
};

export const INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES: InfrastructureFoundationCategory[] = [
  {
    id: 'fcat-001',
    code: 'HT-LOG-CS',
    nameVi: 'Danh mục hạ tầng logistics cơ sở (Origin)',
    description:
      'Khối thông tin chuẩn cho kho, bãi, văn phòng điều hành, ICD — gán cho pháp nhân trước khi nhập điểm.',
    appliesToCompanyIds: ['comp-001', 'comp-002', 'comp-003'],
  },
];
