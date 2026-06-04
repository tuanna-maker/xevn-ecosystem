import { describe, expect, it } from 'vitest';
import {
  CC_STRICT_XBOS_SETTINGS_KEYS,
  commandCenterSettingsDeepLink,
  parseCommandCenterSettingsDeepLink,
} from './commandCenterUrl';

describe('commandCenterSettingsDeepLink (EX-SA01-P1-04)', () => {
  it('never encodes companyId=holding in CC settings URLs', () => {
    const url = commandCenterSettingsDeepLink({
      settingsMenu: 'workflow',
      workflowDefinitionId: 'wf-1',
      workflowInstanceId: 'inst-9',
    });
    expect(url).toContain('settings=workflow');
    expect(url).toContain('wfId=wf-1');
    expect(url).toContain('wfInstanceId=inst-9');
    expect(url).not.toContain('companyId');
    expect(url).not.toContain('holding');
  });

  it('flags legacy holding companyId query on parse', () => {
    const parsed = parseCommandCenterSettingsDeepLink(
      '?settings=workflow&companyId=holding&wfId=abc',
    );
    expect(parsed.settingsMenu).toBe('workflow');
    expect(parsed.workflowDefinitionId).toBe('abc');
    expect(parsed.rejectedCompanyIdParam).toBe(true);
    expect(CC_STRICT_XBOS_SETTINGS_KEYS.has('workflow')).toBe(true);
  });
});
