import {
  directoryItemPassesAttendanceFilter,
  isDirectoryView,
  mapDirectoryDetail,
  mapDirectoryListItem,
  maskDirectoryEmail,
  resolveDirectorySearchTerm,
} from './employee-directory';
import type { EmployeeRow } from './employee-directory.types';
import { signServiceJwt } from '../common/jwt-sign';

const baseRow: EmployeeRow = {
  id: '11111111-1111-4111-8111-111111111111',
  company_id: 'holding',
  employee_code: 'NV1001',
  email: 'nguyen.van.uat@xe.vn',
  full_name: 'Nguyễn Văn UAT',
  job_title_key: 'STAFF',
  manager_id: '22222222-2222-4222-8222-222222222222',
  status: 'active',
  hired_at: '2024-01-01',
  archived_at: null,
  avatar_url: '/api/hrm/files/holding/avatar.jpg',
  custom_fields: {
    department: 'Vận hành',
    phone_number: '0901234567',
    date_of_birth: '1990-05-15',
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('employee-directory helpers', () => {
  it('isDirectoryView accepts directory case-insensitively', () => {
    expect(isDirectoryView('directory')).toBe(true);
    expect(isDirectoryView('Directory')).toBe(true);
    expect(isDirectoryView(undefined)).toBe(false);
  });

  it('resolveDirectorySearchTerm prefers q over keyword', () => {
    expect(resolveDirectorySearchTerm('keyword', 'search')).toBe('search');
    expect(resolveDirectorySearchTerm('keyword', undefined)).toBe('keyword');
  });

  it('mapDirectoryListItem strips PII fields and exposes display-ready labels', () => {
    const item = mapDirectoryListItem(baseRow);
    expect(item).toEqual({
      id: baseRow.id,
      employee_code: 'NV1001',
      full_name: 'Nguyễn Văn UAT',
      job_title_key: 'STAFF',
      job_title: 'STAFF',
      job_title_label: 'STAFF',
      department: 'Vận hành',
      avatar_url: baseRow.avatar_url,
      status: 'active',
      status_label: 'Đang làm việc',
    });
    expect(item).not.toHaveProperty('email');
    expect(item).not.toHaveProperty('custom_fields');
    expect(item).not.toHaveProperty('date_of_birth');
  });

  it('mapDirectoryListItem never leaks snake job_title_key as job_title_label', () => {
    const item = mapDirectoryListItem({
      ...baseRow,
      job_title_key: 'LEGAL_SPECIALIST',
      custom_fields: { department: 'Pháp chế' },
    });
    expect(item.job_title_label).toBeNull();
    expect(item.job_title_key).toBe('LEGAL_SPECIALIST');
    expect(item.department).toBe('Pháp chế');
    expect(item.status_label).toBe('Đang làm việc');
  });

  it('mapDirectoryListItem includes attendance_today when requested', () => {
    const item = mapDirectoryListItem(
      baseRow,
      { check_in_at: '2026-06-09T01:00:00.000Z', status: 'present' },
      true,
    );
    expect(item.attendance_today).toEqual({
      checked_in: true,
      check_in_at: '2026-06-09T01:00:00.000Z',
      status: 'present',
    });
  });

  it('mapDirectoryDetail masks email for non-HR', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      employee_id: '33333333-3333-4333-8333-333333333333',
      roles: ['employee'],
    });
    const detail = mapDirectoryDetail(baseRow, `Bearer ${token}`);
    expect(detail.email).toBe(maskDirectoryEmail(baseRow.email));
    expect(detail.phone_number).toBe('0901234567');
    expect(detail.manager_id).toBe(baseRow.manager_id);
    expect(detail).not.toHaveProperty('custom_fields');
  });

  it('mapDirectoryDetail exposes plaintext email for HR', () => {
    const token = signServiceJwt({
      sub: 'hr.manager@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      roleCode: 'hr_manager',
    });
    const detail = mapDirectoryDetail(baseRow, `Bearer ${token}`);
    expect(detail.email).toBe(baseRow.email);
  });

  it('MP-01: mapDirectoryListItem exposes job_title alias of job_title_key', () => {
    const item = mapDirectoryListItem({ ...baseRow, job_title_key: 'CEO' });
    expect(item.job_title).toBe('CEO');
    expect(item.job_title_key).toBe('CEO');
  });

  it('MP-01: job_title is null when job_title_key is null', () => {
    const item = mapDirectoryListItem({ ...baseRow, job_title_key: null });
    expect(item.job_title).toBeNull();
    expect(item.job_title_key).toBeNull();
  });

  it('directoryItemPassesAttendanceFilter filters checked_in rows', () => {
    const checked = mapDirectoryListItem(
      baseRow,
      { check_in_at: '2026-06-09T01:00:00.000Z', status: 'present' },
      true,
    );
    const notChecked = mapDirectoryListItem(baseRow, null, true);
    expect(directoryItemPassesAttendanceFilter(checked, 'checked_in')).toBe(
      true,
    );
    expect(directoryItemPassesAttendanceFilter(notChecked, 'checked_in')).toBe(
      false,
    );
    expect(
      directoryItemPassesAttendanceFilter(notChecked, 'not_checked_in'),
    ).toBe(true);
  });
});
