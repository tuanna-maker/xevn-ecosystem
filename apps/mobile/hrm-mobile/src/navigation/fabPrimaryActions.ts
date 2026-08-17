/**
 * @CODE-MEMORY
 * Screen:     FAB «Thao tác nhanh» action catalog
 * UC:         J-MOB FAB · AT-01 đơn công / đi muộn
 * BR:         MOB-UX-10-P0 · must_keep create_leave FAB path
 * SRS:        MOBILE_HRM_ESS_UX_BENCHMARK.md §13.4 · PO_E2E spine AT-01
 * TechSpec:   apps/mobile/hrm-mobile nav FAB sheet
 * Purpose:    Persona-ordered quick actions; preserves 4-tab lock (nav targets only).
 * WorkItem:   R-SPINE-AT-NAV-01
 * Coded:      2026-05 (baseline)
 * must_keep:  create_leave row for EMP/MGR/LDR; check_in hidden for leader
 * LastVerified: docs/qa/evidence/r-spine-at-nav-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-AT-NAV-01
 * change_mode: ADD
 * What: FAB row create_update_request («Tạo đơn công») → CreateUpdateRequest
 * Why: AT-01 BLOCKED — CreateUpdateRequest tồn tại nhưng không có HDSD entry
 * must_keep: create_leave path / testID fab-action-create-leave; U65 no seed
 */

import type { Ionicons } from '@expo/vector-icons';

import { colors, statusToneColor } from '../theme/tokens';
import type { MobilePersonaId } from '../utils/mobilePersona';

export type FabPrimaryActionId =
  | 'check_in'
  | 'create_leave'
  | 'create_update_request'
  | 'manager_approvals';

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

const warnTone = statusToneColor('warning');

const CHECK_IN: FabPrimaryAction = {
  id: 'check_in',
  label: 'Chấm công',
  subtitle: 'Ghi nhận giờ vào / ra',
  icon: 'time',
  iconColor: colors.accent,
  iconBg: colors.homeTileCheckin,
  testID: 'fab-action-check-in',
  accessibilityLabel: 'Chấm công',
};

const CREATE_LEAVE: FabPrimaryAction = {
  id: 'create_leave',
  label: 'Tạo đơn nghỉ',
  subtitle: 'Gửi yêu cầu nghỉ phép mới',
  icon: 'calendar',
  iconColor: colors.primary,
  iconBg: colors.primaryMuted,
  testID: 'fab-action-create-leave',
  accessibilityLabel: 'Tạo đơn nghỉ',
};

const CREATE_UPDATE_REQUEST: FabPrimaryAction = {
  id: 'create_update_request',
  label: 'Tạo đơn công',
  subtitle: 'Xin đi muộn hoặc điều chỉnh chấm công',
  icon: 'create',
  iconColor: colors.warning,
  iconBg: colors.homeTileExpenses,
  testID: 'fab-action-create-update-request',
  accessibilityLabel: 'Tạo đơn công, xin đi muộn',
};

const MANAGER_APPROVALS_BASE: Omit<FabPrimaryAction, 'badgeCount'> = {
  id: 'manager_approvals',
  label: 'Duyệt đơn',
  subtitle: 'Đơn chờ duyệt từ cấp dưới',
  icon: 'checkmark-done',
  iconColor: warnTone.text,
  iconBg: warnTone.bg,
  testID: 'fab-action-manager-approvals',
  accessibilityLabel: 'Duyệt đơn chờ duyệt',
};

/**
 * Resolve FAB sheet rows per persona — EMP/MGR: check-in + leave + đơn công;
 * MGR/LDR: + approvals (badge when pending > 0); LDR: no check-in (BR-PERS-02).
 */
export function resolveFabPrimaryActions(input: FabPersonaInput): FabPrimaryAction[] {
  const actions: FabPrimaryAction[] = [];

  if (input.persona !== 'leader') {
    actions.push(CHECK_IN);
  }

  actions.push(CREATE_LEAVE);
  actions.push(CREATE_UPDATE_REQUEST);

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
