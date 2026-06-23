import { describe, expect, it } from 'vitest';
import type { DirectoryDetailRow } from '../../integrations/hrmEmployeeDirectory';
import { resolveRoleSubtitle } from '../dashboardEss';
import {
  buildColleagueQuickActions,
  mapColleagueDetailFields,
  mapEmploymentStatusVi,
  resolveColleagueHeroSubtitle,
  resolveDirectoryDepartment,
} from '../teamDirectoryDetail';

const row: DirectoryDetailRow = {
  id: 'emp-1',
  employee_code: 'NV0002',
  full_name: 'Nguyễn Văn A',
  job_title_key: 'engineer',
  department: 'Vận tải',
  avatar_url: null,
  status: 'active',
  manager_id: null,
  phone_number: '0901111222',
  email: 'n***@xe.vn',
  attendance_today: {
    checked_in: true,
    check_in_at: '2026-06-09T08:15:00.000Z',
    status: 'present',
  },
};

describe('teamDirectoryDetail', () => {
  it('resolveDirectoryDepartment prefers department field', () => {
    expect(resolveDirectoryDepartment(row)).toBe('Vận tải');
    expect(resolveDirectoryDepartment({ ...row, department: null })).toBe('Kỹ sư');
  });

  it('mapEmploymentStatusVi localizes active — no raw enum on UI', () => {
    expect(mapEmploymentStatusVi('active')).toBe('Đang làm việc');
    expect(mapEmploymentStatusVi('on_leave')).toBe('Đang nghỉ phép');
  });

  it('resolveRoleSubtitle maps DRIVER seed key to Vietnamese', () => {
    expect(resolveRoleSubtitle('DRIVER')).toBe('Lái xe');
    expect(resolveRoleSubtitle('driver')).toBe('Lái xe');
  });

  it('resolveColleagueHeroSubtitle joins department and job title', () => {
    expect(resolveColleagueHeroSubtitle('Vận tải', 'Lái xe')).toBe('Vận tải · Lái xe');
    expect(resolveColleagueHeroSubtitle('—', 'Lái xe')).toBe('Lái xe');
  });

  it('mapColleagueDetailFields maps directory view fields for detail screen', () => {
    const fields = mapColleagueDetailFields(row);
    expect(fields.name).toBe('Nguyễn Văn A');
    expect(fields.code).toBe('NV0002');
    expect(fields.department).toBe('Vận tải');
    expect(fields.jobTitle).toBe('Kỹ sư');
    expect(fields.heroSubtitle).toBe('Vận tải · Kỹ sư');
    expect(fields.email).toBe('n***@xe.vn');
    expect(fields.phone).toBe('0901111222');
    expect(fields.statusLabel).toBe('Đang làm việc');
    expect(fields.attendanceLabel).toBe('Đã chấm');
    expect(fields.attendanceTone).toBe('success');
    expect(fields.checkInAt).not.toBe('—');
  });

  it('maps DRIVER + active without raw API codes on UI fields', () => {
    const fields = mapColleagueDetailFields({
      ...row,
      job_title_key: 'DRIVER',
      status: 'active',
      department: 'Trung tâm vận tải',
    });
    expect(fields.jobTitle).toBe('Lái xe');
    expect(fields.statusLabel).toBe('Đang làm việc');
    expect(fields.heroSubtitle).toBe('Trung tâm vận tải · Lái xe');
    expect(fields.jobTitle).not.toBe('DRIVER');
    expect(fields.statusLabel).not.toBe('active');
  });

  it('maps not checked in badge when attendance absent', () => {
    const fields = mapColleagueDetailFields({
      ...row,
      attendance_today: { checked_in: false, check_in_at: null, status: null },
    });
    expect(fields.attendanceLabel).toBe('Chưa chấm');
    expect(fields.attendanceTone).toBe('neutral');
    expect(fields.checkInAt).toBe('—');
  });

  it('buildColleagueQuickActions exposes tel and mailto when data present', () => {
    const actions = buildColleagueQuickActions('0901111222', 'a@xe.vn');
    expect(actions).toHaveLength(2);
    expect(actions[0]).toMatchObject({ id: 'call', label: 'Gọi', href: 'tel:0901111222' });
    expect(actions[1]).toMatchObject({ id: 'email', label: 'Email', href: 'mailto:a@xe.vn' });
  });

  it('buildColleagueQuickActions omits actions when contact missing', () => {
    expect(buildColleagueQuickActions('—', '—')).toHaveLength(0);
  });
});
