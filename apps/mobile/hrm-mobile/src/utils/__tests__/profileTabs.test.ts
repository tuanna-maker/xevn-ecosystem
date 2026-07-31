import { describe, expect, it } from 'vitest';
import type { EmployeeRow } from '../../integrations/hrmEmployees';
import type { PayslipListRow } from '../../integrations/payrollPayslips';
import {
  buildProfileDocumentSections,
  buildProfileInfoSections,
  buildProfileSubtitle,
  buildProfileWorkSections,
  PROFILE_TAB_OPTIONS,
  resolveContractTypeLabel,
  resolveEmployeeStatusLabel,
  sanitizeProfileDisplay,
} from '../profileTabs';
import { computeTaskProgress, resolveProfileCurrentTask, resolveUpdateTypeLabel } from '../profileTask';

const baseEmployee: EmployeeRow = {
  id: '6c887177-0000-4000-8000-000000000001',
  company_id: 'holding',
  employee_code: 'NV0001',
  email: 'uat.nv0001@xe.vn',
  full_name: 'Nguyễn Văn A',
  job_title_key: 'engineer',
  status: 'active',
  hired_at: '2024-01-15',
  avatar_url: null,
};

describe('PROFILE_TAB_OPTIONS', () => {
  it('exposes ZenHR segmented tabs Thông tin / Công việc / Tài liệu', () => {
    expect(PROFILE_TAB_OPTIONS.map((o) => o.label)).toEqual(['Thông tin', 'Công việc', 'Tài liệu']);
  });
});

describe('sanitizeProfileDisplay', () => {
  it('hides UUID and seed codes', () => {
    expect(sanitizeProfileDisplay('seed:p1-hrm-emp-001')).toBe('Dữ liệu mẫu UAT');
    expect(sanitizeProfileDisplay('6c887177-0000-4000-8000-000000000001')).toBe('—');
    expect(sanitizeProfileDisplay('HRM-EMP-200')).toBe('—');
  });

  it('passes through normal Vietnamese text', () => {
    expect(sanitizeProfileDisplay('Phòng Kỹ thuật')).toBe('Phòng Kỹ thuật');
  });
});

describe('resolveEmployeeStatusLabel', () => {
  it('maps API status to Vietnamese', () => {
    expect(resolveEmployeeStatusLabel('active')).toBe('Đang làm việc');
    expect(resolveEmployeeStatusLabel('on_leave')).toBe('Đang nghỉ phép');
    expect(resolveEmployeeStatusLabel('probation')).toBe('Thử việc');
  });

  it('unknown employment status → em dash (U72 M-F-09)', () => {
    expect(resolveEmployeeStatusLabel('exotic_status')).toBe('—');
  });
});

describe('buildProfileWorkSections', () => {
  it('uses localized job title not raw key', () => {
    const sections = buildProfileWorkSections(baseEmployee);
    const jobRow = sections[0].rows.find((r) => r.label === 'Chức danh');
    expect(jobRow?.value).toBe('Kỹ sư');
    expect(sections[0].rows.find((r) => r.label === 'Trạng thái')?.value).toBe('Đang làm việc');
    expect(sections[0].rows.find((r) => r.label === 'Ngày vào làm')?.value).toBe('15/01/2024');
  });
});

describe('buildProfileInfoSections', () => {
  it('groups contact fields', () => {
    const sections = buildProfileInfoSections(baseEmployee);
    expect(sections[0].title).toBe('Liên hệ');
    expect(sections[0].rows[0].value).toBe('uat.nv0001@xe.vn');
  });

  it('MOB-12: shows phone from custom_fields when present', () => {
    const sections = buildProfileInfoSections({
      ...baseEmployee,
      custom_fields: { phone_number: '0909999888' },
    });
    const labels = sections.flatMap((s) => s.rows.map((r) => r.label));
    expect(labels).toContain('Số điện thoại');
  });
});

describe('buildProfileDocumentSections', () => {
  it('formats payslip and contract rows without raw ISO', () => {
    const payslips: PayslipListRow[] = [
      {
        id: 'p1',
        period_label: 'Tháng 05/2026',
        employee_name: 'A',
        gross_amount: 10000000,
        deduction_amount: 1000000,
        net_amount: 9000000,
        status: 'approved',
        currency: 'VND',
      },
    ];
    const sections = buildProfileDocumentSections(payslips, [
      {
        id: 'c1',
        contract_type: 'full_time',
        start_date: '2024-01-15',
        end_date: '2025-01-14',
        status: 'approved',
      },
    ]);
    expect(sections[0].title).toBe('Phiếu lương gần đây');
    expect(sections[0].rows[0].label).toBe('Tháng 05/2026');
    expect(sections[1].rows[0].label).toBe('Toàn thời gian');
    expect(sections[1].rows[0].value).toContain('15/01/2024');
    expect(sections[1].rows[0].value).not.toContain('2024-01-15');
  });
});

describe('resolveContractTypeLabel', () => {
  it('maps contract_type keys including web HDLD / full-time (U72 M-F-05)', () => {
    expect(resolveContractTypeLabel('probation')).toBe('Thử việc');
    expect(resolveContractTypeLabel('full-time')).toBe('Toàn thời gian');
    expect(resolveContractTypeLabel('full_time')).toBe('Toàn thời gian');
    expect(resolveContractTypeLabel('fixed_term')).toBe('Có thời hạn');
    expect(resolveContractTypeLabel('permanent')).toBe('Không thời hạn');
    expect(resolveContractTypeLabel('HDLD_KTH')).toBe('Không thời hạn');
    expect(resolveContractTypeLabel('HDLD_01')).toBe('Có thời hạn');
    expect(resolveContractTypeLabel('Hợp đồng 1 năm')).toBe('Hợp đồng 1 năm');
    expect(resolveContractTypeLabel('weird_slug_xyz')).toBe('—');
  });
});

describe('buildProfileSubtitle', () => {
  it('combines code and role', () => {
    expect(buildProfileSubtitle(baseEmployee)).toBe('NV0001 · Kỹ sư');
  });
});

describe('resolveProfileCurrentTask', () => {
  it('prefers pending leave over update', () => {
    const task = resolveProfileCurrentTask(
      [
        {
          id: 'l1',
          leave_type: 'annual',
          start_date: '2026-06-10',
          end_date: '2026-06-12',
          status: 'pending',
        },
      ],
      [{ id: 'u1', update_type: 'check_in', status: 'pending' }],
    );
    expect(task?.title).toContain('nghỉ phép');
    expect(task?.subtitle).toContain('/');
  });

  it('returns null when no pending items', () => {
    expect(resolveProfileCurrentTask([], [])).toBeNull();
  });
});

describe('computeTaskProgress', () => {
  it('returns bounded progress for pending', () => {
    expect(computeTaskProgress('pending')).toBe(40);
    expect(computeTaskProgress('approved')).toBe(100);
  });
});

describe('resolveUpdateTypeLabel', () => {
  it('maps update_type without seed codes', () => {
    expect(resolveUpdateTypeLabel('check_in')).toBe('Giờ vào');
    expect(resolveUpdateTypeLabel('check_in_out')).toBe('Giờ vào và ra');
    expect(resolveUpdateTypeLabel('seed:uat-update')).toBe('Chỉnh sửa chấm công');
  });
});
