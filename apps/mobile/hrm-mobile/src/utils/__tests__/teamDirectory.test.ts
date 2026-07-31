import { describe, expect, it } from 'vitest';
import type { EmployeeRow } from '../../integrations/hrmEmployees';
import {
  applyTeamDirectoryFilters,
  buildAttendanceCheckInMap,
  composeTeamDirectoryMembers,
  countTeamDirectoryFilterOptions,
  DIRECTORY_SEARCH_DEBOUNCE_MS,
  DIRECTORY_SEARCH_MIN_CHARS,
  filterTeamDirectoryBySearch,
  foldDirectorySearchText,
  groupTeamDirectoryByDepartment,
  normalizeDirectorySearchQuery,
  resolveDepartmentColorStrip,
  resolveListEmployeeDepartment,
  resolveTeamCheckInStatus,
  resolveTeamMemberJobTitle,
  TEAM_CHECK_IN_BADGE,
} from '../teamDirectory';

const emp = (
  id: string,
  name: string,
  code: string,
  job = 'engineer',
  department?: string | null,
): EmployeeRow => ({
  id,
  company_id: 'holding',
  employee_code: code,
  email: `${code}@xe.vn`,
  full_name: name,
  job_title_key: job,
  department,
  status: 'active',
  hired_at: '2024-01-01',
});

describe('buildAttendanceCheckInMap', () => {
  it('marks present and late as checked in', () => {
    const map = buildAttendanceCheckInMap([
      { employee_id: 'e1', attendance_date: '2026-06-09', status: 'present', check_in_at: '08:00' },
      { employee_id: 'e2', attendance_date: '2026-06-09', status: 'late', check_in_at: '09:15' },
      { employee_id: 'e3', attendance_date: '2026-06-09', status: 'absent', check_in_at: null },
    ]);
    expect(resolveTeamCheckInStatus(map, 'e1')).toBe('checked_in');
    expect(resolveTeamCheckInStatus(map, 'e2')).toBe('checked_in');
    expect(resolveTeamCheckInStatus(map, 'e3')).toBe('not_checked_in');
    expect(resolveTeamCheckInStatus(map, 'e9')).toBe('not_checked_in');
  });

  it('pending without check_in is not checked in', () => {
    const map = buildAttendanceCheckInMap([
      { employee_id: 'e4', attendance_date: '2026-06-09', status: 'pending', check_in_at: null },
      { employee_id: 'e5', attendance_date: '2026-06-09', status: 'pending', check_in_at: '08:01' },
    ]);
    expect(resolveTeamCheckInStatus(map, 'e4')).toBe('not_checked_in');
    expect(resolveTeamCheckInStatus(map, 'e5')).toBe('checked_in');
  });
});

describe('composeTeamDirectoryMembers', () => {
  it('joins employees with department, localized job title, and badges', () => {
    const members = composeTeamDirectoryMembers(
      [
        emp('e1', 'Nguyễn A', 'NV001', 'engineer', 'Vận hành'),
        emp('e2', 'Trần B', 'NV002', 'DRIVER'),
      ],
      buildAttendanceCheckInMap([
        { employee_id: 'e1', attendance_date: '2026-06-09', status: 'present', check_in_at: '08:00' },
      ]),
    );
    expect(members).toHaveLength(2);
    expect(members[0].department).toBe('Vận hành');
    expect(members[0].jobTitle).toBe('Kỹ sư');
    expect(members[0].departmentLabel).toBe('Vận hành · Kỹ sư');
    expect(members[0].checkInStatus).toBe('checked_in');
    expect(members[1].jobTitle).toBe('Lái xe');
    expect(members[1].department).toBe('Khác');
    expect(members[1].checkInStatus).toBe('not_checked_in');
    expect(TEAM_CHECK_IN_BADGE.checked_in.label).toBe('Đã chấm');
    expect(TEAM_CHECK_IN_BADGE.not_checked_in.label).toBe('Chưa chấm');
  });
});

describe('groupTeamDirectoryByDepartment', () => {
  it('groups members into sorted sections with stable color strips', () => {
    const members = composeTeamDirectoryMembers(
      [
        emp('e1', 'B', 'NV002', 'engineer', 'Kế toán'),
        emp('e2', 'A', 'NV001', 'manager', 'Vận hành'),
        emp('e3', 'C', 'NV003', 'hr_staff', 'Vận hành'),
      ],
      new Map(),
    );
    const sections = groupTeamDirectoryByDepartment(members);
    expect(sections.map((s) => s.title)).toEqual(['Kế toán', 'Vận hành']);
    expect(sections[1].data.map((m) => m.employee.full_name)).toEqual(['A', 'C']);
    expect(resolveDepartmentColorStrip('Vận hành')).toBe(sections[1].colorStrip);
  });
});

describe('resolveListEmployeeDepartment', () => {
  it('falls back to Khác when department missing', () => {
    expect(resolveListEmployeeDepartment(emp('e1', 'A', 'NV1'))).toBe('Khác');
    expect(resolveListEmployeeDepartment(emp('e1', 'A', 'NV1', 'engineer', 'Vận tải'))).toBe(
      'Vận tải',
    );
  });
});

describe('resolveTeamMemberJobTitle', () => {
  it('localizes DRIVER seed key', () => {
    expect(resolveTeamMemberJobTitle(emp('e1', 'A', 'NV1', 'DRIVER'))).toBe('Lái xe');
  });
});

describe('applyTeamDirectoryFilters', () => {
  const members = composeTeamDirectoryMembers(
    [
      emp('e1', 'Huỳnh Văn C', 'NV100', 'engineer', 'Vận hành'),
      emp('e2', 'Lê Thị D', 'NV200', 'manager', 'Kế toán'),
      emp('e3', 'Phạm E', 'NV300', 'DRIVER', 'Vận hành'),
    ],
    buildAttendanceCheckInMap([
      { employee_id: 'e1', attendance_date: '2026-06-09', status: 'present', check_in_at: '08:00' },
      { employee_id: 'e2', attendance_date: '2026-06-09', status: 'present', check_in_at: '08:05' },
    ]),
  );

  it('normalizes search per SRS R1 (min 2 chars) and NFR debounce constant', () => {
    expect(DIRECTORY_SEARCH_MIN_CHARS).toBe(2);
    expect(DIRECTORY_SEARCH_DEBOUNCE_MS).toBe(300);
    expect(normalizeDirectorySearchQuery('N')).toBe('');
    expect(normalizeDirectorySearchQuery('  ')).toBe('');
    expect(normalizeDirectorySearchQuery('Nguyễn')).toBe('Nguyễn');
  });

  it('filters by search query on name, code, department, and job title', () => {
    expect(filterTeamDirectoryBySearch(members, 'N')).toHaveLength(3);
    expect(filterTeamDirectoryBySearch(members, 'huỳnh')).toHaveLength(1);
    expect(filterTeamDirectoryBySearch(members, 'NV300')).toHaveLength(1);
    expect(filterTeamDirectoryBySearch(members, 'lái xe')).toHaveLength(1);
    expect(filterTeamDirectoryBySearch(members, 'kế toán')).toHaveLength(1);
    expect(applyTeamDirectoryFilters(members, 'checked_in', '')).toHaveLength(2);
    expect(applyTeamDirectoryFilters(members, 'off', '')).toHaveLength(1);
    expect(applyTeamDirectoryFilters(members, 'all', 'lê')).toHaveLength(1);
  });

  it('AC-DIR-01: ASCII Nguyen matches accented Nguyễn (fold)', () => {
    expect(foldDirectorySearchText('Nguyễn')).toBe('nguyen');
    expect(filterTeamDirectoryBySearch(members, 'Nguyen')).toHaveLength(0);
    const withNguyen = composeTeamDirectoryMembers(
      [emp('e9', 'Nguyễn Văn A', 'HLD-0099', 'engineer', 'Ban Điều hành')],
      new Map(),
    );
    expect(filterTeamDirectoryBySearch(withNguyen, 'Nguyen')).toHaveLength(1);
    expect(filterTeamDirectoryBySearch(withNguyen, 'ZzzNoMatch999')).toHaveLength(0);
  });

  it('R2: nonsense query yields empty for empty-state copy path', () => {
    expect(applyTeamDirectoryFilters(members, 'all', 'ZzzNoMatch999')).toHaveLength(0);
  });

  it('counts filter chip totals', () => {
    expect(countTeamDirectoryFilterOptions(members)).toEqual({
      all: 3,
      checked_in: 2,
      off: 1,
    });
  });
});
