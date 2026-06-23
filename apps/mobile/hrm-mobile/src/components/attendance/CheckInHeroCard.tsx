import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { HrmAvatar } from '../ui/HrmAvatar';

type CheckInHeroCardProps = {
  fullName: string;
  employeeCode: string;
  avatarUrl?: string | null;
  baseUrl?: string;
  loading?: boolean;
  testID?: string;
};

/** Apple grouped hero — read-only identity (no UUID field). MOB-UX-13a. */
export function CheckInHeroCard({
  fullName,
  employeeCode,
  avatarUrl,
  baseUrl,
  loading = false,
  testID = 'check-in-hero',
}: CheckInHeroCardProps) {
  const displayName = fullName.trim() || 'Nhân viên';
  const displayCode = employeeCode.trim() || '—';

  return (
    <View style={styles.wrap} testID={testID}>
      <LinearGradient
        colors={[colors.homeHeroGradientStart, colors.homeHeroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.inner}>
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" accessibilityLabel="Đang tải hồ sơ" />
          ) : (
            <>
              <HrmAvatar size={72} fullName={displayName} avatarUrl={avatarUrl} baseUrl={baseUrl} />
              <Text style={styles.name} numberOfLines={2}>
                {displayName}
              </Text>
              <Text style={styles.codeLabel}>Mã nhân viên</Text>
              <Text style={styles.codeValue} numberOfLines={1}>
                {displayCode}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.itemGap,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: radius.card,
  },
  inner: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: layout.inlineGap,
  },
  name: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title2,
    textAlign: 'center',
  },
  codeLabel: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
    marginTop: spacing.xs,
  },
  codeValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
    fontVariant: ['tabular-nums'],
  },
});
