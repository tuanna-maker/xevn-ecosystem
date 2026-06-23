import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FAB_ACTION_SHEET_TEST_ID,
  FAB_ACTION_SHEET_TITLE,
  type FabPrimaryAction,
  type FabPrimaryActionId,
} from '../../navigation/fabPrimaryActions';
import { CHECK_IN_FAB_NAV_TARGET } from '../../navigation/checkInFab';
import {
  navigateToCreateLeaveRequest,
  navigateToManagerApprovals,
} from '../../navigation/profileStackNav';
import type { MainTabParamList } from '../../navigation/types';
import { TAB_BAR_BASE_HEIGHT, resolveBottomSafeInset } from '../../theme/layoutInsets';
import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';

type TabNav = BottomTabNavigationProp<MainTabParamList>;

type FabPrimaryActionSheetProps = {
  visible: boolean;
  actions: FabPrimaryAction[];
  onClose: () => void;
};

function navigateForAction(navigation: TabNav, id: FabPrimaryActionId): void {
  switch (id) {
    case 'check_in':
      navigation.navigate(CHECK_IN_FAB_NAV_TARGET.tab, {
        screen: CHECK_IN_FAB_NAV_TARGET.screen,
      });
      break;
    case 'create_leave':
      navigateToCreateLeaveRequest(navigation);
      break;
    case 'manager_approvals':
      navigateToManagerApprovals(navigation);
      break;
    default:
      break;
  }
}

export function FabPrimaryActionSheet({ visible, actions, onClose }: FabPrimaryActionSheetProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNav>();

  const sheetBottom = resolveBottomSafeInset(insets.bottom) + TAB_BAR_BASE_HEIGHT + spacing.sm;

  const onSelect = useCallback(
    (id: FabPrimaryActionId) => {
      onClose();
      navigateForAction(navigation, id);
    },
    [navigation, onClose],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Đóng thao tác nhanh">
        <Pressable
          testID={FAB_ACTION_SHEET_TEST_ID}
          style={[styles.sheet, { marginBottom: sheetBottom }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} accessibilityElementsHidden />
          <Text style={styles.title}>{FAB_ACTION_SHEET_TITLE}</Text>
          <View style={styles.list}>
            {actions.map((action) => (
              <Pressable
                key={action.id}
                testID={action.testID}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
                onPress={() => onSelect(action.id)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <View style={[styles.iconWrap, { backgroundColor: action.iconBg }]}>
                  <Ionicons name={action.icon} size={22} color={action.iconColor} accessibilityElementsHidden />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.rowLabel}>{action.label}</Text>
                  <Text style={styles.rowSubtitle}>{action.subtitle}</Text>
                </View>
                {action.badgeCount != null && action.badgeCount > 0 ? (
                  <View style={styles.badge} accessibilityLabel={`${action.badgeCount} đơn chờ`}>
                    <Text style={styles.badgeText}>
                      {action.badgeCount > 99 ? '99+' : String(action.badgeCount)}
                    </Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} accessibilityElementsHidden />
                )}
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            onPress={onClose}
            style={({ pressed }) => [styles.cancelBtn, pressed && styles.rowPressed]}
          >
            <Text style={styles.cancelLabel}>Đóng</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
    paddingHorizontal: layout.screenPaddingH,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.separator,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.title3,
    lineHeight: typography.lineHeight.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  list: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.listRowMinHeight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
  },
  rowPressed: {
    backgroundColor: colors.iosGroupedBackground,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.primaryButtonHeight,
    marginTop: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.iosGroupedBackground,
  },
  cancelLabel: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
