/**
 * @CODE-MEMORY
 * Screen: Command Center · URL helpers for settings / inbox deep links
 * UC: J-XBOS-01 · UC-HRM-REC-WF-03
 * BR: BR-INBOX-01 (task id for mutate)
 * SRS: docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md
 * TechSpec: Command Center embed / workflow-engine inbox
 * Purpose: Build/parse CC query deep links without companyId=holding; inbox drawer
 *   uses wfInstanceId for detail + optional wfTaskId for Xử lý.
 * WorkItem: R-XHRM-REC-WF-DEEPLINK-TASKID
 * Coded: 2026-05 (baseline) · CHANGE 2026-07-20
 * Callers: CommandCenterPage navigate / parse location.search
 * Callees: URLSearchParams
 * FEActions: Open inbox card → URL wfTaskId+wfInstanceId → drawer Xử lý
 * Impact: Missing wfTaskId + synthetic cardId=instance → POST 404
 * must_keep: J-XBOS-01 instance-only URL still opens detail; J-02/03/06 GWC
 * SOLID: Pure URL helpers — no React
 * LastVerified: commandCenterUrl.test.ts
 *
 * @CODE-MEMORY-CHANGE
 * Date: 2026-07-20
 * What: Add optional wfTaskId to inbox/settings deep-link build + parse
 * Why: C-XHRM-REC-WF-CANVAS-05-01 / R-XHRM-REC-WF-DEEPLINK-TASKID
 * must_keep: J-REC-WF-02/03/06 GWC — do not reopen without FAIL
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W3-FE-LOG09
 * change_mode: ADD
 * What: SETTINGS_MENU_ALIASES sao_chep_bo_danh_muc_log / log_clone_bundle → log_catalog_clone_bundle
 * Why: U76 HDSD deep-link for LOG-09 clone-bundle wizard
 * must_keep: existing aliases; DM-09 hrm_catalog_clone separate; U65 no seed
 */
import { matchPath } from 'react-router-dom';
import { hrmPortalPath, HRM_PORTAL_BASE, stripTenantPrefixFromPathname } from './paths';

export const SYSTEM_SETTINGS = 'SYSTEM_SETTINGS';

/** Canonical CC workflow inbox route (TC-ECO-INT-03 / D-HDSD-WF-INBOX-FE-01). */
export const CC_INBOX_PATH = '/command-center/inbox';

export function isCommandCenterInboxPath(pathname: string): boolean {
  const stripped = stripTenantPrefixFromPathname(pathname);
  return matchPath({ path: CC_INBOX_PATH, end: false }, stripped) != null;
}

export function commandCenterInboxPath(): string {
  return CC_INBOX_PATH;
}

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
  const stripped = stripTenantPrefixFromPathname(pathname);
  return (
    stripped === HRM_PORTAL_BASE ||
    matchPath({ path: `${HRM_PORTAL_BASE}/*`, end: false }, stripped) != null
  );
}

/**
 * Đọc module Command Center từ URL — reload/F5 phải khôi phục đúng view.
 */
export function parseCommandCenterModule(
  pathname: string,
  search: string,
): string | 'all' | typeof SYSTEM_SETTINGS {
  if (isCommandCenterInboxPath(pathname)) return 'all';
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

/** HDSD / legacy query aliases → canonical Command Center settings menu keys (D-HDSD-MUTATE-FE-01). */
export const SETTINGS_MENU_ALIASES: Record<string, string> = {
  workflow_designer: 'workflow',
  departments: 'tenant_departments',
  rbac: 'permission',
  raci: 'company_member_units',
  hrm_catalog: 'hrm_catalog_governance',
  catalog: 'hrm_catalog_governance',
  /** U76 / HDSD — LOG-09 bundle clone (domains=logistics) */
  sao_chep_bo_danh_muc_log: 'log_catalog_clone_bundle',
  log_clone_bundle: 'log_catalog_clone_bundle',
};

export function normalizeSettingsMenuKey(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  return SETTINGS_MENU_ALIASES[trimmed] ?? trimmed;
}

export type CommandCenterSettingsDeepLinkOpts = {
  settingsMenu: string;
  /** Workflow definition id for settings=workflow deep link. */
  workflowDefinitionId?: string;
  /** Workflow instance id — inbox drawer detail fetch / J-XBOS-01. */
  workflowInstanceId?: string;
  /**
   * Workflow step task id — Inbox Xử lý / reject / complete (R-XHRM-REC-WF-DEEPLINK-TASKID).
   * Prefer over instance id for POST `/workflow-engine/tasks/:id/*`.
   */
  workflowTaskId?: string;
};

/**
 * Build Command Center settings deep link (EX-SA01-P1-04).
 * Scope stays on JWT (`main`); do not put company partition in query string.
 */
/**
 * J-XBOS-01 — inbox drawer deep link on CC home (no settings rail).
 * @param workflowTaskId optional step task id for actionable Xử lý (must_keep J-03/06).
 */
export function commandCenterInboxInstanceDeepLink(
  workflowInstanceId: string,
  workflowTaskId?: string,
): string {
  const params = new URLSearchParams();
  const taskId = workflowTaskId?.trim();
  if (taskId) params.set('wfTaskId', taskId);
  params.set('wfInstanceId', workflowInstanceId.trim());
  return `/command-center?${params.toString()}`;
}

export function commandCenterSettingsDeepLink(opts: CommandCenterSettingsDeepLinkOpts): string {
  const params = new URLSearchParams();
  params.set('settings', opts.settingsMenu);
  if (opts.workflowDefinitionId?.trim()) {
    params.set('wfId', opts.workflowDefinitionId.trim());
  }
  if (opts.workflowTaskId?.trim()) {
    params.set('wfTaskId', opts.workflowTaskId.trim());
  }
  if (opts.workflowInstanceId?.trim()) {
    params.set('wfInstanceId', opts.workflowInstanceId.trim());
  }
  return `/command-center?${params.toString()}`;
}

export function parseCommandCenterSettingsDeepLink(search: string): {
  settingsMenu: string | null;
  settingsMenuRaw: string | null;
  workflowDefinitionId: string | null;
  workflowInstanceId: string | null;
  workflowTaskId: string | null;
  rejectedCompanyIdParam: boolean;
} {
  const params = new URLSearchParams(search);
  const rejectedCompanyIdParam =
    params.has('companyId') &&
    (params.get('companyId') === 'holding' || params.get('companyId') === 'all');
  if (rejectedCompanyIdParam) {
    params.delete('companyId');
  }
  const rawSettings = params.get('settings');
  return {
    settingsMenu: normalizeSettingsMenuKey(rawSettings),
    settingsMenuRaw: rawSettings,
    workflowDefinitionId: params.get('wfId'),
    workflowInstanceId: params.get('wfInstanceId'),
    workflowTaskId: params.get('wfTaskId'),
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
