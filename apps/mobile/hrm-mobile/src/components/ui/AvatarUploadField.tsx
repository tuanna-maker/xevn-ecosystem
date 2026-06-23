import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';
import { pickHrmImageFromLibrary } from '../../utils/hrmImagePicker';
import { withAvatarCacheBust } from '../../utils/resolveHrmAvatarUrl';
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

  const removeAvatar = useCallback(async () => {
    if (disabled || busy || !onRemove) return;
    Alert.alert('Xóa ảnh', 'Bạn có chắc muốn xóa ảnh đại diện?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setLocalUploading(true);
            try {
              await onRemove();
              setPreviewUrl(null);
            } finally {
              setLocalUploading(false);
            }
          })();
        },
      },
    ]);
  }, [busy, disabled, onRemove]);

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
          onPress={() => void removeAvatar()}
          disabled={busy}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text style={styles.removeLink}>Xóa ảnh</Text>
        </Pressable>
      ) : null}

      {employeeCode ? <Text style={styles.code}>{employeeCode}</Text> : null}
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
    borderWidth: 2,
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
