import type { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

export type ProfileQuickActionId = 'payslip' | 'leave' | 'check_in' | 'approvals';

export type ProfileQuickAction = {
  id: ProfileQuickActionId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tileColor: string;
  iconColor: string;
  testID: string;
};

/** Beisen-style 快捷入口 — MOB-UX-12c / F-3 AC-UI-PROF-03. */
export const PROFILE_QUICK_ACTIONS: ProfileQuickAction[] = [
  {
    id: 'payslip',
    label: 'Phiếu lương',
    icon: 'wallet',
    tileColor: colors.homeTilePayroll,
    iconColor: colors.warning,
    testID: 'profile-quick-payslip',
  },
  {
    id: 'leave',
    label: 'Nghỉ phép',
    icon: 'calendar',
    tileColor: colors.homeTileTimeOff,
    iconColor: colors.success,
    testID: 'profile-quick-leave',
  },
  {
    id: 'check_in',
    label: 'Chấm công',
    icon: 'finger-print',
    tileColor: colors.homeTileCheckin,
    iconColor: colors.accent,
    testID: 'profile-quick-checkin',
  },
  {
    id: 'approvals',
    label: 'Phê duyệt',
    icon: 'checkmark-done',
    tileColor: colors.homeTileTasks,
    iconColor: colors.danger,
    testID: 'profile-quick-approvals',
  },
];
