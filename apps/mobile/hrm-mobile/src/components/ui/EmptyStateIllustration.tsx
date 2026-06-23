import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

const EMPTY_CALENDAR_LOTTIE = require('../../../assets/lottie/empty-calendar.json');

type EmptyStateIllustrationProps = {
  title: string;
  hint?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  useLottie?: boolean;
  testID?: string;
  /** MOB-UX-13d — outer wrap supplies breathing room; shrink inner padding. */
  compact?: boolean;
};

/** Generic empty state — Lottie when available, Ionicons fallback. */
export function EmptyStateIllustration({
  title,
  hint = 'Kéo xuống để làm mới.',
  ctaLabel,
  onCtaPress,
  icon = 'folder-open-outline',
  useLottie = true,
  testID,
  compact = false,
}: EmptyStateIllustrationProps) {
  const [lottieFailed, setLottieFailed] = useState(false);
  const showLottie = useLottie && !lottieFailed;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]} accessibilityRole="text" testID={testID}>
      <View style={styles.iconCircle} accessibilityElementsHidden>
        {showLottie ? (
          <LottieView
            source={EMPTY_CALENDAR_LOTTIE}
            autoPlay
            loop
            style={styles.lottie}
            onAnimationFailure={() => setLottieFailed(true)}
          />
        ) : (
          <Ionicons name={icon} size={48} color={colors.primary} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {onCtaPress && ctaLabel ? (
        <PrimaryButton label={ctaLabel} onPress={onCtaPress} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  wrapCompact: {
    paddingVertical: 0,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  lottie: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
  },
  hint: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.subhead,
  },
  cta: { marginTop: spacing.sm, alignSelf: 'stretch' },
});
