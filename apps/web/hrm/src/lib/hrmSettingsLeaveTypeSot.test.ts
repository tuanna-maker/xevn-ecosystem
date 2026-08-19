import { describe, expect, it } from 'vitest';
import type { HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';
import {
  isLeaveTypesCatalogKey,
  isLeaveTypesGroupRefReadOnly,
  leaveTypesTenantWriterHint,
  SETTINGS_ATT_LEAVE_TYPES_PATH,
  SETTINGS_ATT_LEAVE_TYPES_TAB,
} from '@/lib/hrmSettingsLeaveTypeSot';

const leaveRow = (overrides?: Partial<HrmSettingsCatalogOverviewRow>): HrmSettingsCatalogOverviewRow => ({
  catalogKey: 'leave_types',
  name: 'Loại nghỉ',
  domain: null,
  xbosVersion: 1,
  xbosSyncedAt: null,
  xbosItems: [],
  hrmExtensionItems: [],
  effectiveItems: [],
  tenantWriter: {
    kind: 'att_leave_type',
    apiPath: '/api/hrm/attendance/leave-types',
    effectiveApiPath: '/api/hrm/attendance/leave-types/effective',
    groupRefReadOnly: true,
  },
  ...overrides,
});

describe('PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01 — leave_types REF SoT helpers', () => {
  it('detects leave_types catalog keys', () => {
    expect(isLeaveTypesCatalogKey('leave_types')).toBe(true);
    expect(isLeaveTypesCatalogKey('departments')).toBe(false);
  });

  it('groupRefReadOnly when tenantWriter stamped (HRM-SC-01)', () => {
    expect(isLeaveTypesGroupRefReadOnly(leaveRow())).toBe(true);
    expect(isLeaveTypesGroupRefReadOnly(leaveRow({ tenantWriter: undefined }))).toBe(false);
    expect(isLeaveTypesGroupRefReadOnly(leaveRow({ catalogKey: 'departments' }))).toBe(false);
  });

  it('exposes writer hint for CTA copy', () => {
    const hint = leaveTypesTenantWriterHint(leaveRow());
    expect(hint?.apiPath).toContain('/attendance/leave-types');
    expect(hint?.effectiveApiPath).toContain('/effective');
  });

  it('deep-link tab id for Loại phép ATT', () => {
    expect(SETTINGS_ATT_LEAVE_TYPES_TAB).toBe('att-leave-types');
    expect(SETTINGS_ATT_LEAVE_TYPES_PATH).toBe('/settings?tab=att-leave-types');
  });
});
