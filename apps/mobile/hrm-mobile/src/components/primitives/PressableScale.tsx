import React, { useCallback, useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { UI_MOTION_PRESS_DURATION_MS, UI_MOTION_PRESS_SCALE } from './uiMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Target scale on press. Default 0.98 (AC-UI-MOTION). */
  pressedScale?: number;
  /** Animation duration ms. Default 150. */
  durationMs?: number;
};

/**
 * Subtle press-scale feedback — respects Reduce Motion (MOB-UX-11a / AC-UI-MOTION).
 */
export function PressableScale({
  children,
  style,
  pressedScale = UI_MOTION_PRESS_SCALE,
  durationMs = UI_MOTION_PRESS_DURATION_MS,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      if (!disabled && !reduceMotion) {
        scale.value = withTiming(pressedScale, { duration: durationMs });
      }
      onPressIn?.(event);
    },
    [disabled, reduceMotion, pressedScale, durationMs, onPressIn, scale],
  );

  const handlePressOut = useCallback(
    (event: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      if (!reduceMotion) {
        scale.value = withTiming(1, { duration: durationMs });
      }
      onPressOut?.(event);
    },
    [reduceMotion, durationMs, onPressOut, scale],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
