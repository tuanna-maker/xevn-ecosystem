import { describe, expect, it, vi } from 'vitest';
import {
  resolveWorkflowBusinessTypeLabel,
  shouldShowWorkflowDevSeedControls,
} from './workflowDisplayLabels';

describe('workflowDisplayLabels', () => {
  it('maps known business_type keys to Vietnamese labels', () => {
    expect(resolveWorkflowBusinessTypeLabel('catalog_governance')).toBe('Quản trị danh mục');
    expect(resolveWorkflowBusinessTypeLabel('workflow_definition_review')).toBe(
      'Duyệt định nghĩa quy trình',
    );
    expect(resolveWorkflowBusinessTypeLabel('fleet_ops')).toBe('Vận hành đội xe');
    expect(resolveWorkflowBusinessTypeLabel('finance_expense')).toBe('Chi phí & thanh toán');
    expect(resolveWorkflowBusinessTypeLabel('hrm_recruitment')).toBe('Tuyển dụng');
    expect(resolveWorkflowBusinessTypeLabel('hrm_requisition')).toBe('Yêu cầu tuyển dụng');
    expect(resolveWorkflowBusinessTypeLabel('hrm_candidate')).toBe('Roadmap ứng viên');
    expect(resolveWorkflowBusinessTypeLabel('hrm_recruitment_plan')).toBe('Kế hoạch tuyển dụng');
    expect(resolveWorkflowBusinessTypeLabel('general')).toBe('Nghiệp vụ chung');
    expect(resolveWorkflowBusinessTypeLabel('hrm_payroll')).toBe('Tiền lương');
  });

  it('falls back for unknown snake_case keys', () => {
    expect(resolveWorkflowBusinessTypeLabel('custom_module')).toBe('Custom Module');
  });

  it('shouldShowWorkflowDevSeedControls hides on production and remote hosts', () => {
    vi.stubEnv('PROD', true);
    expect(shouldShowWorkflowDevSeedControls()).toBe(false);
    vi.stubEnv('PROD', false);

    const originalHostname = window.location.hostname;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, hostname: 'example.invalid' },
    });
    expect(shouldShowWorkflowDevSeedControls()).toBe(false);

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, hostname: 'localhost' },
    });
    expect(shouldShowWorkflowDevSeedControls()).toBe(true);

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, hostname: originalHostname },
    });
    vi.unstubAllEnvs();
  });
});
