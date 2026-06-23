import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { HrmAvatar } from './HrmAvatar';

const DEFAULT_RING_WIDTH = 2;

type EmployeeAvatarRingProps = {
  size: number;
  fullName: string;
  avatarUrl?: string | null;
  baseUrl?: string;
  ringWidth?: number;
  /** Green dot when checked in; neutral when not (MOB-UX-12b directory). */
  attendanceCheckedIn?: boolean;
  showAttendanceDot?: boolean;
  testID?: string;
};

/** Shared avatar gradient ring + optional attendance dot — reused by hero and directory rows. */
export function EmployeeAvatarRing({
  size,
  fullName,
  avatarUrl,
  baseUrl,
  ringWidth = DEFAULT_RING_WIDTH,
  attendanceCheckedIn,
  showAttendanceDot = false,
  testID,
}: EmployeeAvatarRingProps) {
  const outer = size + ringWidth * 2;
  const dotSize = Math.max(10, Math.round(size * 0.24));
  const dotColor = attendanceCheckedIn ? colors.success : colors.neutral;

  return (
    <View style={styles.wrap} testID={testID}>
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ring, { padding: ringWidth, borderRadius: outer / 2 }]}
      >
        <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
          <HrmAvatar size={size} fullName={fullName} avatarUrl={avatarUrl} baseUrl={baseUrl} />
        </View>
      </LinearGradient>
      {showAttendanceDot ? (
        <View
          testID={testID ? `${testID}-attendance-dot` : undefined}
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: dotColor,
            },
          ]}
          accessibilityLabel={attendanceCheckedIn ? 'Đã chấm công' : 'Chưa chấm công'}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  ring: {
    overflow: 'hidden',
  },
  inner: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
