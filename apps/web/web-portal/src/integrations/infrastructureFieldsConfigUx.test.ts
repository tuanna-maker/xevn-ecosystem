import { describe, expect, it } from 'vitest';
import {
  buildInfraFieldsApplySuccessMessage,
  infrastructureSiteEntrySettingsUrl,
  shouldShowInfraConsumerNavHint,
} from './infrastructureFieldsConfigUx';

describe('infrastructureFieldsConfigUx', () => {
  it('shows consumer nav hint only for company_member_units', () => {
    expect(shouldShowInfraConsumerNavHint('company_member_units')).toBe(true);
    expect(shouldShowInfraConsumerNavHint('company_infrastructure')).toBe(false);
    expect(shouldShowInfraConsumerNavHint(null)).toBe(false);
  });

  it('builds company_infrastructure deep link', () => {
    expect(infrastructureSiteEntrySettingsUrl()).toBe(
      '/command-center?settings=company_infrastructure',
    );
  });

  it('builds apply success message with field count', () => {
    expect(buildInfraFieldsApplySuccessMessage('comp-002', 3)).toContain('3 trường hiển thị');
    expect(buildInfraFieldsApplySuccessMessage('comp-002', 0)).toContain('Cấu hình khối/trường đã lưu');
  });
});
