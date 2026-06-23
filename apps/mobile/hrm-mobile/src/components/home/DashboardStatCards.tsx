import React from 'react';
import { StyleSheet, View } from 'react-native';
import { buildDefaultEssStatCards, type EssStatCard, type EssStatCardId } from '../../utils/dashboardEss';
import { essStatRowLayout } from '../../theme/essStatRowLayout';
import { colors, layout, radius } from '../../theme/tokens';
import { EssStatRow } from './EssStatRow';

type DashboardStatCardsProps = {
  cards: EssStatCard[];
  onCardPress: (id: EssStatCardId) => void;
  /** Used when `cards` empty — always paint seeded rows (MOB-UX-14-R4). */
  isManager?: boolean;
  /** Above-fold budget may cap rows (default 4). */
  maxRows?: number;
};

/** Compact grouped stat list — max 4 Apple Settings rows (MOB-UX-14c). */
export function DashboardStatCards({
  cards,
  onCardPress,
  isManager = false,
  maxRows = essStatRowLayout.maxRows,
}: DashboardStatCardsProps) {
  const resolved = cards.length > 0 ? cards : buildDefaultEssStatCards(isManager);
  const rows = resolved.slice(0, Math.max(1, Math.min(maxRows, essStatRowLayout.maxRows)));

  return (
    <View
      style={styles.card}
      accessibilityRole="list"
      testID="home-ess-stat-rows"
      collapsable={false}
      importantForAccessibility="yes"
    >
      {rows.map((card, index) => (
        <EssStatRow
          key={card.id}
          label={card.title}
          value={card.value}
          onPress={() => onCardPress(card.id)}
          showSeparator={index < rows.length - 1}
          testID={`home-ess-stat-row-${card.id}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    overflow: 'hidden',
    marginBottom: essStatRowLayout.sectionGapBelow,
  },
});
