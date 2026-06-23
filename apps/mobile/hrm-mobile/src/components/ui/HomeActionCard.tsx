import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';

type HomeActionCardProps = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function HomeActionCard({
  title,
  subtitle,
  icon,
  onPress,
  accent = false,
  style,
  accessibilityLabel,
}: HomeActionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [styles.wrap, accent && styles.wrapAccent, pressed && styles.pressed, style]}
    >
      <View style={[styles.iconBox, accent && styles.iconBoxAccent]}>
        <Ionicons name={icon} size={24} color={accent ? colors.primary : colors.textSecondary} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={styles.chevron} accessibilityElementsHidden>
        ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    minHeight: layout.listRowMinHeight + 8,
    gap: spacing.sm,
    ...shadow.sm,
  },
  wrapAccent: {
    borderColor: colors.primaryMuted,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.92 },
  iconBox: {
    width: layout.touchTargetMin,
    height: layout.touchTargetMin,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxAccent: {
    backgroundColor: colors.primaryMuted,
  },
  textCol: { flex: 1, gap: 2 },
  title: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title3,
  },
  subtitle: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.callout,
  },
  chevron: {
    fontSize: typography.fontSize.title2,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.normal,
    marginLeft: spacing.xs,
  },
});
