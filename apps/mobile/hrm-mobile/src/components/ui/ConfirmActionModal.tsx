/**
 * @CODE-MEMORY
 * Screen:     ConfirmActionModal — hộp thoại xác nhận branded (approve / decline / submit)
 * UC:         AC-BRAND-DNA-01 · J-MOB approvals / leave submit
 * BR:         XeVN Precision Motion — modal r12 · border thin · colors.border
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md § L2m
 * TechSpec:   apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md § L2 Modal
 * Purpose:    Thay Alert.alert hệ thống cho thao tác xác nhận có DNA brand; đọc radius.modal + borderWidth.thin.
 * WorkItem:   MOB-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 *
 * Callers:
 *   - CreateLeaveRequestScreen → confirm submit
 *   - ManagerApprovalsScreen → approve / decline
 *   - LeaveRequestDetailScreen → cancel leave confirm
 *   - AvatarUploadField → remove avatar confirm
 *
 * Callees: PrimaryButton · theme/tokens (colors, radius.modal, borderWidth.thin)
 *
 * FE-Actions:
 *   | Thao tác     | Handler   | UI                         |
 *   |--------------|-----------|----------------------------|
 *   | Huỷ          | onCancel  | ghost PrimaryButton        |
 *   | Xác nhận     | onConfirm | primary / danger button    |
 *
 * Impact:     Đổi radius/border lệch → modal lệch card DNA; Alert.alert còn lại = system chrome (document).
 * must_keep:  radius.modal; borderWidth.thin; colors.border; không hardcode borderWidth: 1
 * SOLID:      Dialog presentation tách khỏi screen business logic
 * LastVerified: src/theme/__tests__/mobL2Primitives.test.ts
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { borderWidth, colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import { PrimaryButton } from './PrimaryButton';

export type ConfirmActionKind = 'approve' | 'decline' | 'submit';

type ConfirmActionModalProps = {
  visible: boolean;
  kind: ConfirmActionKind;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ICONS: Record<ConfirmActionKind, { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  approve: { name: 'checkmark-circle', color: colors.success, bg: statusToneColor('success').bg },
  decline: { name: 'close-circle', color: colors.danger, bg: statusToneColor('danger').bg },
  submit: { name: 'paper-plane', color: colors.primary, bg: colors.primaryMuted },
};

export function ConfirmActionModal({
  visible,
  kind,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const icon = ICONS[kind];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.box} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name} size={40} color={icon.color} accessibilityElementsHidden />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <PrimaryButton label={cancelLabel} variant="ghost" onPress={onCancel} style={styles.btn} />
            <PrimaryButton
              label={confirmLabel}
              variant={kind === 'decline' ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={styles.btn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: radius.modal,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
  btn: { flex: 1 },
});
