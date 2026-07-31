/**
 * @CODE-MEMORY
 * Screen:     AvatarUploadField — chọn / xóa ảnh đại diện ESS
 * UC:         UC-HRM-MOB-12 profile avatar · AC-BRAND-DNA-01
 * BR:         Confirm xóa dùng ConfirmActionModal (decline) — không Alert.alert confirm
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md § L2m
 * TechSpec:   apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md § L2 Alert → prefer modal
 * Purpose:    Pick thư viện + upload; xác nhận xóa branded; lỗi runtime vẫn Alert (system).
 * WorkItem:   MOB-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 *
 * Callers: ProfileScreen
 * Callees: HrmAvatar · pickHrmImageFromLibrary · ConfirmActionModal
 *
 * FE-Actions:
 *   | Thao tác   | Handler        | UI                    |
 *   |------------|----------------|-----------------------|
 *   | Chọn ảnh   | pickImage      | library picker        |
 *   | Xóa ảnh    | setConfirmOpen | ConfirmActionModal    |
 *
 * Impact:     Revert về Alert confirm → mất DNA brand trên destructive.
 * must_keep:  ConfirmActionModal cho remove; error Alert OK (non-confirm)
 * SOLID:      Upload orchestration ở parent via onPickAndUpload / onRemove
 * LastVerified: src/theme/__tests__/mobL2Primitives.test.ts
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { borderWidth, colors, spacing, typography } from '../../theme/tokens';
import { pickHrmImageFromLibrary } from '../../utils/hrmImagePicker';
import { withAvatarCacheBust } from '../../utils/resolveHrmAvatarUrl';
import { ConfirmActionModal } from './ConfirmActionModal';
import { HrmAvatar } from './HrmAvatar';

const AVATAR_SIZE = 96;
const CAMERA_SIZE = 32;

export type AvatarUploadFieldProps = {
  avatarUrl?: string | null;
  fullName: string;
  employeeCode?: string;
  baseUrl?: string;
  disabled?: boolean;
  uploading?: boolean;
  onPickAndUpload: (payload: {
    uri: string;
    fileName: string;
    mimeType: string;
    byteSize?: number;
  }) => Promise<string | null>;
  onRemove?: () => Promise<void>;
};

export function AvatarUploadField({
  avatarUrl,
  fullName,
  employeeCode,
  baseUrl,
  disabled,
  uploading,
  onPickAndUpload,
  onRemove,
}: AvatarUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl ?? null);
  const [localUploading, setLocalUploading] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  useEffect(() => {
    setPreviewUrl(avatarUrl ?? null);
  }, [avatarUrl]);

  const busy = uploading || localUploading;

  const pickImage = useCallback(async () => {
    if (disabled || busy) return;

    const picked = await pickHrmImageFromLibrary();
    if (!picked) return;

    setLocalUploading(true);
    try {
      const uploaded = await onPickAndUpload(picked);
      if (uploaded) {
        setPreviewUrl(withAvatarCacheBust(uploaded));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không tải được ảnh.';
      Alert.alert('Lỗi', message);
    } finally {
      setLocalUploading(false);
    }
  }, [busy, disabled, onPickAndUpload]);

  const openRemoveConfirm = useCallback(() => {
    if (disabled || busy || !onRemove) return;
    setConfirmRemoveOpen(true);
  }, [busy, disabled, onRemove]);

  const confirmRemove = useCallback(() => {
    if (!onRemove) return;
    setConfirmRemoveOpen(false);
    void (async () => {
      setLocalUploading(true);
      try {
        await onRemove();
        setPreviewUrl(null);
      } finally {
        setLocalUploading(false);
      }
    })();
  }, [onRemove]);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => void pickImage()}
        disabled={disabled || busy}
        accessibilityRole="button"
        accessibilityLabel="Chọn ảnh đại diện"
        testID="profile-avatar-pick"
        style={styles.avatarPressable}
      >
        <HrmAvatar size={AVATAR_SIZE} fullName={fullName} avatarUrl={previewUrl} baseUrl={baseUrl} />
        {!disabled ? (
          <View style={styles.cameraBadge} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {busy ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text style={styles.cameraGlyph} accessibilityElementsHidden>
                📷
              </Text>
            )}
          </View>
        ) : null}
      </Pressable>

      {previewUrl && onRemove && !disabled ? (
        <Pressable
          onPress={openRemoveConfirm}
          disabled={busy}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={styles.removeLink}>Xóa ảnh</Text>
        </Pressable>
      ) : null}

      {employeeCode ? <Text style={styles.code}>{employeeCode}</Text> : null}

      <ConfirmActionModal
        visible={confirmRemoveOpen}
        kind="decline"
        title="Xóa ảnh"
        message="Bạn có chắc muốn xóa ảnh đại diện?"
        confirmLabel="Xóa"
        cancelLabel="Huỷ"
        onConfirm={confirmRemove}
        onCancel={() => setConfirmRemoveOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  avatarPressable: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    borderRadius: CAMERA_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.focus,
    borderColor: colors.surface,
  },
  cameraGlyph: {
    fontSize: 14,
    lineHeight: 16,
  },
  removeLink: {
    fontSize: typography.fontSize.subhead,
    color: colors.danger,
    fontWeight: typography.fontWeight.medium,
  },
  code: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});
