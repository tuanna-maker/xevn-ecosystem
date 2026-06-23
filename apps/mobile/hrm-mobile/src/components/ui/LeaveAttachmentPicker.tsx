import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import {
  LEAVE_ATTACHMENT_MAX_FILES,
  type LeaveAttachmentDraft,
  validateLeaveAttachment,
} from '../../utils/leaveAttachment';
import { promptLeaveAttachmentPick } from '../../utils/leaveAttachmentPicker';

export type LeaveAttachmentPickerProps = {
  attachments: LeaveAttachmentDraft[];
  onChange: (next: LeaveAttachmentDraft[]) => void;
  onUpload: (draft: LeaveAttachmentDraft) => Promise<LeaveAttachmentDraft | null>;
  disabled?: boolean;
};

export function LeaveAttachmentPicker({
  attachments,
  onChange,
  onUpload,
  disabled,
}: LeaveAttachmentPickerProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addAttachment = useCallback(async () => {
    if (disabled || uploadingIndex != null) return;
    if (attachments.length >= LEAVE_ATTACHMENT_MAX_FILES) return;

    const picked = await promptLeaveAttachmentPick();
    if (!picked) return;

    const validation = validateLeaveAttachment(picked);
    if (validation) {
      return;
    }

    const nextIndex = attachments.length;
    const pending = [...attachments, picked];
    onChange(pending);
    setUploadingIndex(nextIndex);

    try {
      const uploaded = await onUpload(picked);
      if (!uploaded?.uploadedUrl) {
        onChange(attachments);
        return;
      }
      const merged = pending.map((item, i) => (i === nextIndex ? uploaded : item));
      onChange(merged);
    } finally {
      setUploadingIndex(null);
    }
  }, [attachments, disabled, onChange, onUpload, uploadingIndex]);

  const removeAt = useCallback(
    (index: number) => {
      onChange(attachments.filter((_, i) => i !== index));
    },
    [attachments, onChange],
  );

  return (
    <View style={styles.wrap} testID="leave-attachment-picker">
      <Text style={styles.title}>Giấy tờ y tế</Text>
      <Text style={styles.hint}>Bắt buộc cho nghỉ ốm/thai sản — tối đa {LEAVE_ATTACHMENT_MAX_FILES} tệp, 10 MB.</Text>

      {attachments.map((item, index) => (
        <View key={`${item.fileName}-${index}`} style={styles.row}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.uploadedUrl ? '✓ ' : ''}
            {item.fileName}
          </Text>
          {uploadingIndex === index ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Xóa tệp đính kèm"
              onPress={() => removeAt(index)}
              disabled={disabled}
            >
              <Text style={styles.remove}>Xóa</Text>
            </Pressable>
          )}
        </View>
      ))}

      {attachments.length < LEAVE_ATTACHMENT_MAX_FILES ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thêm giấy tờ đính kèm"
          style={[styles.addBtn, disabled && styles.addBtnDisabled]}
          onPress={() => void addAttachment()}
          disabled={disabled || uploadingIndex != null}
          testID="leave-attachment-add"
        >
          <Text style={styles.addBtnText}>
            {uploadingIndex != null ? 'Đang tải lên…' : '+ Đính kèm ảnh/PDF'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  hint: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fileName: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  remove: {
    fontSize: typography.fontSize.sm,
    color: colors.danger,
    fontWeight: typography.fontWeight.medium,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.5 },
  addBtnText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
