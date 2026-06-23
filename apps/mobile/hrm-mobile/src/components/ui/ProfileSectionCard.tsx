import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';

type ProfileSectionCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Grouped inset section with icon header — Workday / Personio SET G pattern. */
export function ProfileSectionCard({ title, icon, children, style, testID }: ProfileSectionCardProps) {
  return (
    <View style={[styles.card, style]} testID={testID} accessibilityRole="summary">
      <View style={styles.header}>
        <View style={styles.iconWrap} accessibilityElementsHidden>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: spacing.sm,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title3,
  },
  body: {
    gap: spacing.xs,
  },
});
