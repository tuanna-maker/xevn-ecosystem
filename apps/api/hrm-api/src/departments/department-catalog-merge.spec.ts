import {
  departmentMergeKey,
  isDepartmentUuid,
  mergeDepartmentCatalogRows,
} from './department-catalog-merge';
import type { DepartmentRow } from './department-catalog-merge';

const baseRow = (overrides: Partial<DepartmentRow>): DepartmentRow => ({
  id: 'id',
  company_id: 'main',
  tenant_id: null,
  parent_id: null,
  name: 'Dept',
  code: null,
  description: null,
  manager_name: null,
  manager_email: null,
  employee_count: 0,
  level: 1,
  sort_order: 0,
  status: 'active',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
  ...overrides,
});

describe('department-catalog-merge', () => {
  it('isDepartmentUuid detects UUIDs', () => {
    expect(isDepartmentUuid('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')).toBe(true);
    expect(isDepartmentUuid('phong_dphh')).toBe(false);
  });

  it('mergeDepartmentCatalogRows prefers HRM metadata for same code', () => {
    const merged = mergeDepartmentCatalogRows(
      [baseRow({ id: 'uuid-1', name: 'Phòng Nhân sự', code: 'nhan_su', employee_count: 5 })],
      [baseRow({ id: 'catalog-dept-0', name: 'Phòng Nhân sự', code: 'nhan_su' })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe('uuid-1');
    expect(departmentMergeKey(merged[0]!)).toBe('code:nhan_su');
  });

  it('pairs HRM row without code to catalog row by name', () => {
    const merged = mergeDepartmentCatalogRows(
      [
        baseRow({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          name: 'Phòng Điều Phối Hàng Hóa',
          code: null,
          employee_count: 40,
        }),
      ],
      [
        baseRow({
          id: 'phong_dphh',
          name: 'Phòng Điều Phối Hàng Hóa',
          code: 'phong_dphh',
        }),
      ],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0]?.id).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    expect(merged[0]?.code).toBe('phong_dphh');
  });
});
