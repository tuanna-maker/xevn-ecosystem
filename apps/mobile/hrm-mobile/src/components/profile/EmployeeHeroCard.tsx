import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { resolveEmployeeStatusLabel } from '../../utils/profileTabs';
import { AvatarUploadField, type AvatarUploadFieldProps } from '../ui/AvatarUploadField';
import { StatusBadge } from '../ui/StatusBadge';

type EmployeeHeroCardProps = {
  fullName: string;
  subtitle: string;
  employmentStatus: string;
  avatar: Pick<
    AvatarUploadFieldProps,
    | 'avatarUrl'
    | 'employeeCode'
    | 'baseUrl'
    | 'uploading'
    | 'onPickAndUpload'
    | 'onRemove'
    | 'disabled'
  >;
  testID?: string;
};

/** Workday-style gradient hero + avatar ring — MOB-UX-12c F-3 / J-AVT-02. */
export function EmployeeHeroCard({
  fullName,
  subtitle,
  employmentStatus,
  avatar,
  testID = 'profile-employee-hero',
}: EmployeeHeroCardProps) {
  return (
    <View style={styles.wrap} testID={testID}>
      <LinearGradient
        colors={[colors.homeHeroGradientStart, colors.homeHeroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.inner}>
          <LinearGradient
            colors={[colors.accent, colors.primary, colors.homeHeroGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInset}>
              <AvatarUploadField fullName={fullName} {...avatar} />
            </View>
          </LinearGradient>

          <Text style={styles.name} numberOfLines={2}>
            {fullName || 'Nhân viên'}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
          <StatusBadge
            status={employmentStatus}
            label={resolveEmployeeStatusLabel(employmentStatus)}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const AVATAR_RING = 112;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.sectionGap,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: radius.card,
    paddingBottom: spacing.lg,
  },
  inner: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingHorizontal: layout.screenPaddingH,
  },
  avatarRing: {
    width: AVATAR_RING,
    height: AVATAR_RING,
    borderRadius: AVATAR_RING / 2,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInset: {
    width: AVATAR_RING - 6,
    height: AVATAR_RING - 6,
    borderRadius: (AVATAR_RING - 6) / 2,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: typography.lineHeight.title1,
  },
  subtitle: {
    fontSize: typography.fontSize.callout,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: typography.lineHeight.callout,
  },
});
