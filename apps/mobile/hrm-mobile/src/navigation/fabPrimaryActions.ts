/**
 * Center FAB primary action sheet — MOB-UX-10-P0 · MOBILE_HRM_ESS_UX_BENCHMARK.md §13.4.
 * Persona-ordered quick actions; preserves 4-tab lock (nav targets only).
 */

import type { Ionicons } from '@expo/vector-icons';

import type { MobilePersonaId } from '../utils/mobilePersona';

export type FabPrimaryActionId = 'check_in' | 'create_leave' | 'manager_approvals';

export type FabPrimaryAction = {
  id: FabPrimaryActionId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  testID: string;
  accessibilityLabel: string;
  badgeCount?: number;
};

export type FabPersonaInput = {
  persona: MobilePersonaId;
  managerPendingCount?: number;
};

/** Sheet title — bottom sheet header copy. */
export const FAB_ACTION_SHEET_TITLE = 'Thao tác nhanh';

/** FAB opens sheet — not direct CheckIn (MOB-UX-10-P0). */
export const CHECK_IN_FAB_ACCESSIBILITY_LABEL = 'Thao tác nhanh';

export const FAB_ACTION_SHEET_TEST_ID = 'fab-primary-action-sheet';

const CHECK_IN: FabPrimaryAction = {
  id: 'check_in',
  label: 'Chấm công',
  subtitle: 'Ghi nhận giờ vào / ra',
  icon: 'time',
  iconColor: '#0E7490',
  iconBg: '#CCFBF1',
  testID: 'fab-action-check-in',
  accessibilityLabel: 'Chấm công',
};

const CREATE_LEAVE: FabPrimaryAction = {
  id: 'create_leave',
  label: 'Tạo đơn nghỉ',
  subtitle: 'Gửi yêu cầu nghỉ phép mới',
  icon: 'calendar',
  iconColor: '#1E40AF',
  iconBg: '#DBEAFE',
  testID: 'fab-action-create-leave',
  accessibilityLabel: 'Tạo đơn nghỉ',
};

const MANAGER_APPROVALS_BASE: Omit<FabPrimaryAction, 'badgeCount'> = {
  id: 'manager_approvals',
  label: 'Duyệt đơn',
  subtitle: 'Đơn chờ duyệt từ cấp dưới',
  icon: 'checkmark-done',
  iconColor: '#B45309',
  iconBg: '#FEF3C7',
  testID: 'fab-action-manager-approvals',
  accessibilityLabel: 'Duyệt đơn chờ duyệt',
};

/**
 * Resolve FAB sheet rows per persona — EMP/MGR: check-in + leave;
 * MGR/LDR: + approvals (badge when pending > 0); LDR: no check-in (BR-PERS-02).
 */
export function resolveFabPrimaryActions(input: FabPersonaInput): FabPrimaryAction[] {
  const actions: FabPrimaryAction[] = [];

  if (input.persona !== 'leader') {
    actions.push(CHECK_IN);
  }

  actions.push(CREATE_LEAVE);

  if (input.persona === 'manager' || input.persona === 'leader') {
    const count = Math.max(0, input.managerPendingCount ?? 0);
    actions.push({
      ...MANAGER_APPROVALS_BASE,
      badgeCount: count > 0 ? count : undefined,
      accessibilityLabel:
        count > 0 ? `Duyệt đơn, ${count} đơn chờ` : MANAGER_APPROVALS_BASE.accessibilityLabel,
    });
  }

  return actions;
}
