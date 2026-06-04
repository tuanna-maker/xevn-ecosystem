import { matchPath } from 'react-router-dom';
import { hrmPortalPath, HRM_PORTAL_BASE } from './paths';

export const SYSTEM_SETTINGS = 'SYSTEM_SETTINGS';

const CC_MODULE_CODES = new Set([
  'group',
  'finance',
  'accounting',
  'business',
  'fleet',
  'hrm',
  'system',
]);

export function isCommandCenterHrmPath(pathname: string): boolean {
  return matchPath({ path: `${HRM_PORTAL_BASE}/*`, end: false }, pathname) != null;
}

/**
 * Đọc module Command Center từ URL — reload/F5 phải khôi phục đúng view.
 */
export function parseCommandCenterModule(
  pathname: string,
  search: string,
): string | 'all' | typeof SYSTEM_SETTINGS {
  if (isCommandCenterHrmPath(pathname)) return 'hrm';

  const params = new URLSearchParams(search);
  if (params.get('settings')) return SYSTEM_SETTINGS;

  const mod = params.get('module');
  if (mod === 'group') return 'all';
  if (mod && CC_MODULE_CODES.has(mod) && mod !== 'hrm' && mod !== 'system') return mod;

  return 'all';
}

/** Settings keys that call XBOS strict modules — never add `companyId=holding` to URL. */
export const CC_STRICT_XBOS_SETTINGS_KEYS = new Set([
  'workflow',
  'asset_requests',
  'permission',
  'company_infrastructure',
]);

export type CommandCenterSettingsDeepLinkOpts = {
  settingsMenu: string;
  /** Workflow definition id for settings=workflow deep link. */
  workflowDefinitionId?: string;
  /** Workflow instance id — inbox drawer / J-XBOS-01. */
  workflowInstanceId?: string;
};

/**
 * Build Command Center settings deep link (EX-SA01-P1-04).
 * Scope stays on JWT (`main`); do not put company partition in query string.
 */
export function commandCenterSettingsDeepLink(opts: CommandCenterSettingsDeepLinkOpts): string {
  const params = new URLSearchParams();
  params.set('settings', opts.settingsMenu);
  if (opts.workflowDefinitionId?.trim()) {
    params.set('wfId', opts.workflowDefinitionId.trim());
  }
  if (opts.workflowInstanceId?.trim()) {
    params.set('wfInstanceId', opts.workflowInstanceId.trim());
  }
  return `/command-center?${params.toString()}`;
}

export function parseCommandCenterSettingsDeepLink(search: string): {
  settingsMenu: string | null;
  workflowDefinitionId: string | null;
  workflowInstanceId: string | null;
  rejectedCompanyIdParam: boolean;
} {
  const params = new URLSearchParams(search);
  const rejectedCompanyIdParam =
    params.has('companyId') &&
    (params.get('companyId') === 'holding' || params.get('companyId') === 'all');
  if (rejectedCompanyIdParam) {
    params.delete('companyId');
  }
  return {
    settingsMenu: params.get('settings'),
    workflowDefinitionId: params.get('wfId'),
    workflowInstanceId: params.get('wfInstanceId'),
    rejectedCompanyIdParam,
  };
}

export function commandCenterModuleUrl(
  module: string | 'all' | typeof SYSTEM_SETTINGS,
  opts?: { settingsMenu?: string },
): string {
  if (module === 'hrm') return hrmPortalPath('dashboard');
  if (module === SYSTEM_SETTINGS) {
    const key = opts?.settingsMenu ?? 'company_member_units';
    return commandCenterSettingsDeepLink({ settingsMenu: key });
  }
  if (module === 'all' || module === 'group') return '/command-center';
  return `/command-center?module=${encodeURIComponent(module)}`;
}
