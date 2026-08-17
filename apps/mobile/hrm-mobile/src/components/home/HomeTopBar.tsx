/**
 * @CODE-MEMORY
 * Screen:     Home (Dashboard) — HomeTopBar
 * UC:         UC-HRM-MOB hub · WCAG 2.4.12 / HIG
 * BR:         Top safe-area; touch ≥44pt
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §2.2
 * TechSpec:   MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §4.1
 * Purpose:    Thanh đầu Home — avatar/identity/search/chat/notify; paddingTop insets.top.
 * WorkItem:   D-UX-R3-WCAG-MOBILE-01
 * Coded:      2026-07-28
 * Callers:    DashboardScreen
 * Callees:    useSafeAreaInsets · HrmAvatar · layout.touchTargetMin
 * Impact:     Bỏ paddingTop insets → che status bar; avatar hit dưới 44 → HIG FAIL
 * must_keep:  paddingTop insets.top; avatarHit / iconButton ≥44
 * SOLID:      Presentational chrome
 * LastVerified: docs/qa/evidence/d-ux-r3-wcag-mobile-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A
 * What: MOB-03 J-MOB-01 shell — brand typography + 4px shell accent bar
 */
import { Ionicons } from '@expo/vector-icons';

import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { HrmAvatar } from '../ui/HrmAvatar';

import { brandDisplayText, brandBodyText } from '../../theme/brandTypography';
import { brand, colors, layout, radius, spacing, typography } from '../../theme/tokens';



type HomeTopBarProps = {

  displayName: string;

  roleSubtitle?: string;

  companyLabel?: string;

  avatarUrl: string | null;

  baseUrl: string;

  onSearchPress?: () => void;

  onChatPress?: () => void;

  onNotificationsPress: () => void;

  onAvatarPress?: () => void;

};



export function HomeTopBar({

  displayName,

  roleSubtitle,

  companyLabel,

  avatarUrl,

  baseUrl,

  onSearchPress,

  onChatPress,

  onNotificationsPress,

  onAvatarPress,

}: HomeTopBarProps) {

  const insets = useSafeAreaInsets();

  const role = roleSubtitle?.trim() || 'Nhân viên';



  return (

    <View style={[styles.root, { paddingTop: insets.top }]}>

      <View style={styles.row}>

        <Pressable

          onPress={onAvatarPress}

          accessibilityRole="button"

          accessibilityLabel={`Hồ sơ ${displayName}`}

          style={styles.avatarHit}

          hitSlop={8}

          testID="home-top-bar-avatar"

        >

          <HrmAvatar size={40} fullName={displayName} avatarUrl={avatarUrl} baseUrl={baseUrl} />

        </Pressable>



        <View style={styles.identityCol}>

          <Text style={styles.displayName} numberOfLines={1} accessibilityRole="text">

            {displayName}

          </Text>

          <Text style={styles.roleSubtitle} numberOfLines={1}>

            {role}

          </Text>

        </View>



        {onSearchPress ? (

          <Pressable

            onPress={onSearchPress}

            accessibilityRole="button"

            accessibilityLabel="Tìm kiếm"

            style={styles.iconButton}

            hitSlop={8}

          >

            <Ionicons name="search-outline" size={22} color={colors.surface} />

          </Pressable>

        ) : null}



        {onChatPress ? (
          <Pressable
            onPress={onChatPress}
            accessibilityRole="button"
            accessibilityLabel="Chat nội bộ"
            style={styles.iconButton}
            hitSlop={8}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.surface} />
          </Pressable>
        ) : null}

        <Pressable

          onPress={onNotificationsPress}

          accessibilityRole="button"

          accessibilityLabel="Thông báo"

          style={styles.iconButton}

          hitSlop={8}

        >

          <Ionicons name="notifications-outline" size={24} color={colors.surface} />

        </Pressable>

      </View>



      {companyLabel ? (

        <Text style={styles.companyLabel} numberOfLines={1}>

          {companyLabel}

        </Text>

      ) : null}

      <View style={styles.shellBrandBar} accessibilityElementsHidden testID="home-top-bar-brand-accent" />

    </View>

  );

}



const styles = StyleSheet.create({

  root: {

    backgroundColor: colors.primary,

    paddingHorizontal: layout.screenPaddingH,

    paddingBottom: spacing.md,

    marginHorizontal: -layout.screenPaddingH,

    marginBottom: spacing.sm,

  },

  row: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

  },

  avatarHit: {

    width: layout.touchTargetMin,

    height: layout.touchTargetMin,

    alignItems: 'center',

    justifyContent: 'center',

  },

  identityCol: {

    flex: 1,

    minWidth: 0,

    gap: 2,

  },

  displayName: {
    ...brandDisplayText({ fontWeight: '700' }),
    fontSize: typography.fontSize.body,
    color: colors.surface,
    lineHeight: typography.lineHeight.body,
  },

  roleSubtitle: {
    ...brandBodyText(),
    fontSize: typography.fontSize.footnote,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: typography.lineHeight.footnote,
  },

  iconButton: {

    width: layout.touchTargetMin,

    height: layout.touchTargetMin,

    alignItems: 'center',

    justifyContent: 'center',

  },

  companyLabel: {
    ...brandBodyText(),
    marginTop: spacing.sm,
    fontSize: typography.fontSize.footnote,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: typography.lineHeight.footnote,
  },

  shellBrandBar: {
    marginTop: spacing.sm,
    height: brand.barWidth,
    borderRadius: radius.full,
    backgroundColor: colors.brandShell,
    opacity: 0.35,
  },

});

