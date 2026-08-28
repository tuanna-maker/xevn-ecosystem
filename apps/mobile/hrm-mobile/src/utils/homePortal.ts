import type { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/tokens';

import type { HomeCelebrationItem } from './dashboardHubCelebrate';
import type { MobilePersonaId } from './mobilePersona';

export type QuickAccessTileId =
  | 'checkin'
  | 'time_off'
  | 'ot_request'
  | 'business_trip'
  | 'payroll'
  | 'schedule'
  | 'approve'
  | 'news'
  | 'team'
  | 'contracts'
  | 'operations'
  | 'notifications'
  | 'journey'
  | 'reports'
  | 'help';

export type QuickAccessTileConfig = {
  id: QuickAccessTileId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tileColor: string;
  iconColor: string;
  /** Phase 1 — no navigation yet */
  stub?: boolean;
  /** Hidden for leader persona (BR-PERS-02). */
  hideForLeader?: boolean;
  /** Only shown for manager / leader personas */
  managerOnly?: boolean;
};

/** MOB-UX-13c canonical 3×4 action grid — Vietnamese labels, persona-gated Báo cáo. */
const HOME_ACTION_TILES: QuickAccessTileConfig[] = [
  {
    id: 'checkin',
    label: 'Chấm công',
    icon: 'time-outline',
    tileColor: colors.homeTileCheckin,
    iconColor: colors.accent,
  },
  {
    id: 'time_off',
    label: 'Nghỉ phép',
    icon: 'calendar-outline',
    tileColor: colors.homeTileTimeOff,
    iconColor: colors.success,
  },
  {
    id: 'ot_request',
    label: 'Làm thêm giờ',
    icon: 'moon-outline',
    tileColor: colors.homeTileMerits,
    iconColor: '#7C3AED',
  },
  {
    id: 'business_trip',
    label: 'Công tác',
    icon: 'airplane-outline',
    tileColor: colors.homeTilePolicies,
    iconColor: '#DB2777',
  },
  {
    id: 'payroll',
    label: 'Bảng lương',
    icon: 'wallet-outline',
    tileColor: colors.homeTilePayroll,
    iconColor: colors.warning,
  },
  {
    id: 'schedule',
    label: 'Lịch ca',
    icon: 'list-outline',
    tileColor: colors.homeTileCareer,
    iconColor: '#059669',
  },
  {
    id: 'approve',
    label: 'Phê duyệt',
    icon: 'checkmark-circle-outline',
    tileColor: colors.homeTileTasks,
    iconColor: colors.danger,
    managerOnly: true,
  },
  {
    id: 'news',
    label: 'Tin nội bộ',
    icon: 'newspaper-outline',
    tileColor: colors.homeTileProfile,
    iconColor: colors.primary,
  },
  {
    id: 'help',
    label: 'Trợ giúp',
    icon: 'help-circle-outline',
    tileColor: colors.homeTileProfile,
    iconColor: colors.textSecondary,
  },
];

function resolveApproveTileLabel(persona: MobilePersonaId): string {
  return persona === 'employee' ? 'Việc' : 'Duyệt';
}

/** Persona-aware home action tiles — EMP 9, MGR 10, LDR 9 (MOB-UX-13e). */
export function getQuickAccessTilesForPersona(persona: MobilePersonaId): QuickAccessTileConfig[] {
  const showManagerTiles = persona === 'manager' || persona === 'leader';

  return HOME_ACTION_TILES.filter((tile) => {
    if (tile.managerOnly && !showManagerTiles) return false;
    if (tile.hideForLeader && persona === 'leader') return false;
    return true;
  }).map((tile) =>
    tile.id === 'approve' ? { ...tile, label: resolveApproveTileLabel(persona) } : tile,
  );
}

/** @deprecated Use getQuickAccessTilesForPersona — boolean maps employee vs manager (not leader). */
export function getQuickAccessTiles(isManager: boolean): QuickAccessTileConfig[] {
  return getQuickAccessTilesForPersona(isManager ? 'manager' : 'employee');
}

/** @deprecated Legacy 8-tile portal config — kept for migration tests. */
export const QUICK_ACCESS_TILES = HOME_ACTION_TILES.filter((t) => !t.managerOnly).slice(0, 8);

export type HeroCarouselKind = 'birthday_self' | 'birthday_colleague' | 'anniversary' | 'milestone' | 'welcome';

export type HeroCarouselItem = {
  id: string;
  kind: HeroCarouselKind;
  title: string;
  subtitle: string;
  gradientStart: string;
  gradientEnd: string;
};

const HERO_GRADIENTS: Record<HeroCarouselKind, { start: string; end: string }> = {
  birthday_self: { start: '#7C3AED', end: '#A78BFA' },
  birthday_colleague: { start: colors.homeHeroGradientStart, end: colors.homeHeroGradientEnd },
  anniversary: { start: '#0D9488', end: '#2DD4BF' },
  milestone: { start: '#1E3A8A', end: '#2563EB' },
  welcome: { start: colors.homeHeroGradientStart, end: colors.homeHeroGradientEnd },
};

export function buildHeroCarouselItems(input: {
  viewerName: string;
  isBirthdayToday: boolean;
  birthdayBanner: string;
  celebrations: HomeCelebrationItem[];
}): HeroCarouselItem[] {
  const items: HeroCarouselItem[] = [];

  if (input.isBirthdayToday && input.birthdayBanner.trim()) {
    const g = HERO_GRADIENTS.birthday_self;
    items.push({
      id: 'hero-self-birthday',
      kind: 'birthday_self',
      title: input.birthdayBanner,
      subtitle: 'Chúc bạn một ngày thật vui vẻ!',
      gradientStart: g.start,
      gradientEnd: g.end,
    });
  }

  for (const row of input.celebrations) {
    const g = HERO_GRADIENTS.birthday_colleague;
    items.push({
      id: `hero-celebration-${row.employee_id}`,
      kind: 'birthday_colleague',
      title: `Sinh nhật ${row.display_name}`,
      subtitle: row.display_date ? `Hôm nay · ${row.display_date}` : 'Hôm nay',
      gradientStart: g.start,
      gradientEnd: g.end,
    });
  }

  // MOB-UX-16a ILA-01: TopBar already shows identity — no welcome slide fallback.
  return items;
}

export function resolveQuickAccessTile(
  id: QuickAccessTileId,
  persona: MobilePersonaId = 'employee',
): QuickAccessTileConfig | undefined {
  return getQuickAccessTilesForPersona(persona).find((tile) => tile.id === id);
}

export type HomePayslipTeaserSource = {
  id: string;
  period_label: string;
  net_amount: number | null;
  currency: string;
  status: string;
};

/** Latest payslip row for home feed teaser — API returns newest-first. BR-ZEN-03: skip null net. */
export function pickLatestPayslipTeaser(
  rows: HomePayslipTeaserSource[],
): {
  id: string;
  periodLabel: string;
  netAmount: number | null;
  currency: string;
  status: string;
} | null {
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    id: row.id,
    periodLabel: row.period_label,
    netAmount: row.net_amount,
    currency: row.currency,
    status: row.status,
  };
}
