import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, radius, typography } from '../../theme/tokens';
import { resolveEmployeeInitials, resolveHrmAvatarUrl } from '../../utils/resolveHrmAvatarUrl';

export type HrmAvatarProps = {
  size: number;
  fullName?: string | null;
  avatarUrl?: string | null;
  baseUrl?: string;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function HrmAvatar({
  size,
  fullName,
  avatarUrl,
  baseUrl,
  style,
  accessibilityLabel,
}: HrmAvatarProps) {
  const resolved = resolveHrmAvatarUrl(baseUrl, avatarUrl);
  const initials = resolveEmployeeInitials(fullName);
  const fontSize = Math.max(12, Math.round(size * 0.34));

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? `Ảnh đại diện ${fullName?.trim() || 'nhân viên'}`}
    >
      {resolved ? (
        <Image source={{ uri: resolved }} style={styles.image} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.fallback, { borderRadius: size / 2 }]}>
          {initials === '?' ? (
            <Ionicons name="person" size={fontSize + 4} color={colors.primary} accessibilityElementsHidden />
          ) : (
            <Text style={[styles.initials, { fontSize }]} accessibilityElementsHidden>
              {initials}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    overflow: 'hidden',
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  initials: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
