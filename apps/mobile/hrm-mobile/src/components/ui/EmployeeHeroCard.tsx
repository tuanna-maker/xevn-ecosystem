import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { EmployeeAvatarRing } from './EmployeeAvatarRing';
import { StatusBadge } from './StatusBadge';

const AVATAR_SIZE = 104;

type EmployeeHeroCardProps = {
  name: string;
  subtitle: string;
  avatarUrl?: string | null;
  baseUrl?: string;
  attendanceLabel: string;
  attendanceTone: 'success' | 'neutral';
  testID?: string;
};

/** Workday / ZenHR hero — gradient band, avatar ring, org subtitle, attendance pill. */
export function EmployeeHeroCard({
  name,
  subtitle,
  avatarUrl,
  baseUrl,
  attendanceLabel,
  attendanceTone,
  testID = 'employee-hero-card',
}: EmployeeHeroCardProps) {
  return (
    <View style={styles.wrap} testID={testID} accessibilityRole="summary">
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <EmployeeAvatarRing
            size={AVATAR_SIZE}
            fullName={name}
            avatarUrl={avatarUrl}
            baseUrl={baseUrl}
            ringWidth={3}
            testID={`${testID}-avatar-ring`}
          />

          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2} testID={`${testID}-subtitle`}>
            {subtitle}
          </Text>

          <StatusBadge
            status={attendanceTone === 'success' ? 'present' : 'absent'}
            tone={attendanceTone}
            label={attendanceLabel}
            testID={`${testID}-attendance-badge`}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: layout.screenPaddingH,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  gradient: {
    borderRadius: radius.card,
  },
  content: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  name: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.title2,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.callout,
  },
});
