import { Ionicons } from '@expo/vector-icons';

import React from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';



import { HrmAvatar } from '../ui/HrmAvatar';

import { colors, layout, radius, spacing, typography } from '../../theme/tokens';



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

          hitSlop={8}

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

  identityCol: {

    flex: 1,

    minWidth: 0,

    gap: 2,

  },

  displayName: {

    fontSize: typography.fontSize.body,

    fontWeight: typography.fontWeight.semibold,

    color: colors.surface,

    lineHeight: typography.lineHeight.body,

  },

  roleSubtitle: {

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

    marginTop: spacing.sm,

    fontSize: typography.fontSize.footnote,

    color: 'rgba(255,255,255,0.85)',

    lineHeight: typography.lineHeight.footnote,

  },

});

