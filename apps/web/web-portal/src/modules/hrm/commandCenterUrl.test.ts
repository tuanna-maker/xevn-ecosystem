import { describe, expect, it } from 'vitest';
import {
  CC_INBOX_PATH,
  CC_STRICT_XBOS_SETTINGS_KEYS,
  commandCenterInboxPath,
  commandCenterInboxInstanceDeepLink,
  commandCenterSettingsDeepLink,
  isCommandCenterInboxPath,
  normalizeSettingsMenuKey,
  parseCommandCenterSettingsDeepLink,
} from './commandCenterUrl';

describe('commandCenterInboxPath (D-HDSD-WF-INBOX-FE-01)', () => {
  it('exposes canonical inbox route', () => {
    expect(commandCenterInboxPath()).toBe('/command-center/inbox');
    expect(CC_INBOX_PATH).toBe('/command-center/inbox');
    expect(isCommandCenterInboxPath('/command-center/inbox')).toBe(true);
    expect(isCommandCenterInboxPath('/command-center')).toBe(false);
  });
});

describe('commandCenterInboxInstanceDeepLink (J-XBOS-01)', () => {
  it('builds CC home deep link with wfInstanceId only', () => {
    const url = commandCenterInboxInstanceDeepLink('inst-42');
    expect(url).toBe('/command-center?wfInstanceId=inst-42');
    expect(url).not.toContain('settings=');
    expect(url).not.toContain('companyId');
    expect(url).not.toContain('wfTaskId');
  });

  it('R-XHRM-REC-WF-DEEPLINK-TASKID: includes wfTaskId for Inbox Xử lý', () => {
    const url = commandCenterInboxInstanceDeepLink('inst-42', 'task-99');
    expect(url).toBe('/command-center?wfTaskId=task-99&wfInstanceId=inst-42');
  });
});

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

  it('parses wfTaskId alongside wfInstanceId', () => {
    const parsed = parseCommandCenterSettingsDeepLink(
      '?wfTaskId=task-1&wfInstanceId=inst-9',
    );
    expect(parsed.workflowTaskId).toBe('task-1');
    expect(parsed.workflowInstanceId).toBe('inst-9');
    expect(parsed.settingsMenu).toBeNull();
  });

  it('D-HDSD-MUTATE-FE-01: maps HDSD settings aliases', () => {
    expect(normalizeSettingsMenuKey('workflow_designer')).toBe('workflow');
    expect(normalizeSettingsMenuKey('departments')).toBe('tenant_departments');
    expect(normalizeSettingsMenuKey('rbac')).toBe('permission');
    const parsed = parseCommandCenterSettingsDeepLink('?settings=workflow_designer');
    expect(parsed.settingsMenu).toBe('workflow');
    expect(parsed.settingsMenuRaw).toBe('workflow_designer');
  });
});