import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HOME_ACTIVITY_SHEET_TEST_ID } from '../../utils/homeScrollBudget';
import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';
import { HomeSectionHeader } from './HomeSectionHeader';

export type HomeActivitySheetSection = {
  key: string;
  title: string;
  badgeCount?: number;
  actionLabel?: string;
  onActionPress?: () => void;
  testID?: string;
  content: React.ReactNode;
};

type HomeActivitySheetProps = {
  visible: boolean;
  sections: HomeActivitySheetSection[];
  onClose: () => void;
};

/** Consolidated «Hoạt động» bottom sheet — payslip, approvals, tasks, today, upcoming (MOB-UX-14b). */
export function HomeActivitySheet({ visible, sections, onClose }: HomeActivitySheetProps) {
  const insets = useSafeAreaInsets();

  if (sections.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Đóng Hoạt động">
        <Pressable
          testID={HOME_ACTIVITY_SHEET_TEST_ID}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} accessibilityElementsHidden />
          <Text style={styles.title}>Hoạt động</Text>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {sections.map((section) => (
              <View key={section.key} style={styles.section} testID={section.testID}>
                <View style={styles.sectionHeader}>
                  <HomeSectionHeader title={section.title} badgeCount={section.badgeCount} />
                  {section.actionLabel && section.onActionPress ? (
                    <Pressable
                      onPress={section.onActionPress}
                      accessibilityRole="button"
                      hitSlop={8}
                    >
                      <Text style={styles.link}>{section.actionLabel}</Text>
                    </Pressable>
                  ) : null}
                </View>
                <View style={styles.sectionBody}>{section.content}</View>
              </View>
            ))}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
          >
            <Text style={styles.closeLabel}>Đóng</Text>
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
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
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
    fontSize: typography.fontSize.title2,
    lineHeight: typography.lineHeight.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: layout.sectionGap,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: layout.itemGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionBody: {
    gap: layout.itemGap,
  },
  link: {
    fontSize: typography.fontSize.subhead,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.primaryButtonHeight,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.iosGroupedBackground,
  },
  closePressed: {
    opacity: 0.88,
  },
  closeLabel: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
