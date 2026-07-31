/**
 * @CODE-MEMORY
 * Screen:     CreateLeaveRequest step 2 — AttachmentPicker (W7-3)
 * UC:         UC-HRM-MOB-06b
 * BR:         BR-LEAVE-DOC-01 · AC-LEAVE-DOC-01..02
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.2
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §4.2 AttachmentPicker · §5.2
 * Purpose:    Touch-friendly UI to pick ≤3 medical docs (image/PDF), upload each
 *             via parent `onUpload`, show progress, allow remove/retry.
 * WorkItem:   PCOMP-W7-MOB-LEAVE-DOC
 * Coded:      2026-07-19
 *
 * Callers:
 *   - CreateLeaveRequestScreen.tsx → LeaveAttachmentPicker
 *
 * Callees:
 *   - promptLeaveAttachmentPick → expo-image-picker / expo-document-picker
 *   - validateLeaveAttachment → leaveAttachment.ts
 *   - onUpload → uploadLeaveAttachmentFile (hrmFileUpload)
 *
 * FE-Actions:
 *   | User action     | Handler        | Lib / RPC                              |
 *   |-----------------|----------------|----------------------------------------|
 *   | + Đính kèm      | addAttachment  | pick → validate → onUpload             |
 *   | Xóa             | removeAt       | local state only                       |
 *
 * Impact:     Silent validation fail → user thinks attach worked; must Alert
 * must_keep:  minHeight ≥44px on add/remove; max 3 files; upload-before-submit
 * SOLID:      Presentational picker; upload orchestration injected via onUpload
 * LastVerified: utils/__tests__/leaveAttachment.test.ts · hrmFileUpload.test.ts
 */

import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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
      Alert.alert('Tệp không hợp lệ', validation);
      return;
    }

    const previous = attachments;
    const nextIndex = attachments.length;
    const pending = [...attachments, picked];
    onChange(pending);
    setUploadingIndex(nextIndex);

    try {
      const uploaded = await onUpload(picked);
      if (!uploaded?.uploadedUrl) {
        onChange(previous);
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
      if (disabled || uploadingIndex != null) return;
      onChange(attachments.filter((_, i) => i !== index));
    },
    [attachments, disabled, onChange, uploadingIndex],
  );

  return (
    <View style={styles.wrap} testID="leave-attachment-picker">
      <Text style={styles.title}>Giấy tờ y tế</Text>
      <Text style={styles.hint}>
        Bắt buộc cho nghỉ ốm/thai sản — tối đa {LEAVE_ATTACHMENT_MAX_FILES} tệp, 10 MB (JPEG/PNG/WebP/PDF).
      </Text>

      {attachments.map((item, index) => (
        <View key={`${item.fileName}-${index}`} style={styles.row} testID={`leave-attachment-row-${index}`}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.uploadedUrl ? '✓ ' : uploadingIndex === index ? '… ' : ''}
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
              hitSlop={8}
              style={styles.removeBtn}
              testID={`leave-attachment-remove-${index}`}
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
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  fileName: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  removeBtn: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
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
