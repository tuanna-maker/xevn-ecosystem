import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography, type StatusTone } from '../../theme/tokens';
import { StatusBadge } from './StatusBadge';

export type EssRichListRowIconTone = 'primary' | 'success' | 'warning' | 'accent' | 'neutral';

const ICON_GRADIENTS: Record<EssRichListRowIconTone, [string, string]> = {
  primary: [colors.homeHeroGradientStart, colors.homeHeroGradientEnd],
  success: [colors.payslipHeroGradientStart, colors.payslipHeroGradientEnd],
  warning: ['#F59E0B', '#D97706'],
  accent: [colors.accent, '#0891B2'],
  /** Chrome icon only — ban pale slate-400 body text */
  neutral: [colors.textMuted, colors.textSecondary],
};

type EssRichListRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconTone?: EssRichListRowIconTone;
  title: string;
  subtitle?: string;
  status?: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  trailing?: React.ReactNode;
  actions?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Personio-style rich inbox row — gradient icon + semantic status chip. */
export function EssRichListRow({
  icon,
  iconTone = 'primary',
  title,
  subtitle,
  status,
  statusLabel,
  statusTone,
  trailing,
  actions,
  onPress,
  style,
  testID,
}: EssRichListRowProps) {
  const gradient = ICON_GRADIENTS[iconTone];

  const content = (
    <View style={[styles.row, style]} testID={testID}>
      <LinearGradient colors={gradient} style={styles.iconGradient}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {status ? (
            <StatusBadge status={status} label={statusLabel} tone={statusTone} />
          ) : null}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      {trailing ?? (!actions && onPress ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ) : null)}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <PressableScale onPress={onPress} accessibilityRole="button">
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    minHeight: layout.listRowMinHeight,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    minWidth: 120,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  subtitle: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
