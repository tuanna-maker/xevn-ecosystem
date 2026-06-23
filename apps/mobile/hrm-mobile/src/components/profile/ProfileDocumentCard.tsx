import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

export type ProfileDocumentCardKind = 'payslip' | 'contract';

type ProfileDocumentCardProps = {
  kind: ProfileDocumentCardKind;
  title: string;
  subtitle: string;
  amount?: string;
  statusLabel?: string;
  onPress?: () => void;
  testID?: string;
};

const KIND_META: Record<
  ProfileDocumentCardKind,
  { icon: keyof typeof Ionicons.glyphMap; gradient: [string, string] }
> = {
  payslip: {
    icon: 'wallet',
    gradient: [colors.payslipHeroGradientStart, colors.payslipHeroGradientEnd],
  },
  contract: {
    icon: 'document-text',
    gradient: [colors.homeHeroGradientStart, colors.homeHeroGradientEnd],
  },
};

/** Rich document row — payslip/contract cards for Profile «Tài liệu». */
export function ProfileDocumentCard({
  kind,
  title,
  subtitle,
  amount,
  statusLabel,
  onPress,
  testID,
}: ProfileDocumentCardProps) {
  const meta = KIND_META[kind];
  const content = (
    <View style={styles.row}>
      <LinearGradient colors={meta.gradient} style={styles.iconGradient}>
        <Ionicons name={meta.icon} size={22} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
        {statusLabel ? (
          <Text style={styles.status} numberOfLines={1}>
            {statusLabel}
          </Text>
        ) : null}
      </View>
      {amount ? (
        <Text style={styles.amount} numberOfLines={1}>
          {amount}
        </Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </View>
  );

  if (!onPress) {
    return (
      <View style={styles.card} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <PressableScale style={styles.card} onPress={onPress} testID={testID} accessibilityRole="button">
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 2,
  },
  title: {
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
  status: {
    fontSize: typography.fontSize.caption,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  amount: {
    fontSize: typography.fontSize.subhead,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    fontVariant: ['tabular-nums'],
    maxWidth: 120,
    textAlign: 'right',
  },
});
