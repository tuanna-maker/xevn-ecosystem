import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';
import { HrmAvatar } from '../ui/HrmAvatar';

type HomeHubPersonCardProps = {
  displayName: string;
  subtitle: string;
  avatarUrl?: string | null;
  baseUrl?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Rich person row card — avatar + subtitle (MOB-UX-08 whos-out / birthday). */
export function HomeHubPersonCard({
  displayName,
  subtitle,
  avatarUrl,
  baseUrl,
  onPress,
  accessibilityLabel,
}: HomeHubPersonCardProps) {
  const content = (
    <View style={styles.card}>
      <HrmAvatar size={44} fullName={displayName} avatarUrl={avatarUrl ?? null} baseUrl={baseUrl} />
      <View style={styles.textCol}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? displayName}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
    ...shadow.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
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
});
