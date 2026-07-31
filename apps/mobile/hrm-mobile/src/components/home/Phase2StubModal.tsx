/**
 * @CODE-MEMORY
 * Screen:     Home — Phase2StubModal (stub feature dialog)
 * UC:         BR-ZEN-02 · AC-BRAND-DNA-01
 * BR:         Modal DNA — radius.modal · borderWidth.thin · colors.border
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md §3 L3m
 * TechSpec:   THEME_USAGE.md § L2 inventory / L3 optional stub close
 * Purpose:    Dialog stub Phase 2 — chrome khớp ConfirmActionModal DNA.
 * WorkItem:   MOB-XEVN-BRAND-SHELL-L3-01
 * Coded:      2026-07-22
 * Callers:    Home / dashboard stub taps
 * Callees:    colors.surface|text|primary · radius.modal · borderWidth.thin
 * Impact:     radius.lg không stroke → lệch L2 modal DNA
 * must_keep:  radius.modal + borderWidth.thin + colors.border
 * SOLID:      Stub UI tách business ESS remaster
 * LastVerified: src/theme/__tests__/mobL3Shell.test.ts
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';

import { borderWidth, colors, layout, radius, spacing, typography } from '../../theme/tokens';

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
    borderRadius: radius.modal,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
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
