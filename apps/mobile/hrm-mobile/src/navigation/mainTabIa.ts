/**
 * Bottom tab IA — MOBILE_UI_LIBRARY_DECISION.md §7.1 · D-MOB-UX09-IA-01.
 * Trang chủ | Đội nhóm | Phiếu lương | Hồ sơ (4-tab ZenHR lock).
 */

import type { Ionicons } from '@expo/vector-icons';

import { vi } from '../i18n/vi';

export type MainTabKey = 'TabDashboard' | 'TabAttendance' | 'TabPayslip' | 'TabProfile';

export type MainTabIaEntry = {
  key: MainTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

/** Canonical 4-tab labels + icons — BR-PORT-02 / MOB-UX-09 Option A. */
export const MAIN_TAB_IA: readonly MainTabIaEntry[] = [
  { key: 'TabDashboard', label: vi.dashboard, icon: 'home', iconOutline: 'home-outline' },
  { key: 'TabAttendance', label: vi.teamDirectory, icon: 'people', iconOutline: 'people-outline' },
  { key: 'TabPayslip', label: vi.payslips, icon: 'wallet', iconOutline: 'wallet-outline' },
  { key: 'TabProfile', label: vi.profile, icon: 'person', iconOutline: 'person-outline' },
] as const;

export const MAIN_TAB_LABELS_JOINED = MAIN_TAB_IA.map((t) => t.label).join('|');

export const EXPECTED_MAIN_TAB_LABELS = 'Trang chủ|Đội nhóm|Phiếu lương|Hồ sơ';

/** 4-tab ZenHR lock — shared by FAB/checkInFab (BR-PORT-02). */
export const MAIN_TAB_COUNT = MAIN_TAB_IA.length;
