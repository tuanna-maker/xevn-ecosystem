import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

type Phase2StubModalProps = {
  visible: boolean;
  featureLabel: string;
  onClose: () => void;
};

/** BR-ZEN-02 — Phase 2 stub, no crash on tap. */
export function Phase2StubModal({ visible, featureLabel, onClose }: Phase2StubModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button">
        <Pressable
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
          testID="phase2-stub-modal"
        >
          <Text style={styles.title}>{featureLabel}</Text>
          <Text style={styles.body}>Tính năng này sẽ có trong Phase 2.</Text>
          <Pressable onPress={onClose} style={styles.btn} accessibilityRole="button">
            <Text style={styles.btnText}>Đóng</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.screenPaddingH,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: layout.cardPadding,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title3,
  },
  body: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.body,
  },
  btn: {
    alignSelf: 'flex-end',
    minHeight: layout.touchTargetMin,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  btnText: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
