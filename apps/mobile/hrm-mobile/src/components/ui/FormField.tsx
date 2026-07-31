/**
 * @CODE-MEMORY
 * Screen:     FormField — label + TextInput chuẩn ESS
 * UC:         AC-BRAND-DNA-01 · AC-ESS form entry
 * BR:         radius.input 8 · borderWidth.thin / focus · colors.border · touch ≥44
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md § L2m
 * TechSpec:   apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md § L2 TextInput
 * Purpose:    Ô nhập dùng chung; viền thin mặc định, focus = borderWidth.focus + primary.
 * WorkItem:   MOB-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 *
 * Callers: ProfileScreen, CreateLeaveRequestScreen, DynamicProfileForm, Login (pattern), …
 * Callees: theme/tokens (radius.input, borderWidth.thin|focus, colors.border)
 *
 * FE-Actions:
 *   | Thao tác | Handler      | UI                         |
 *   |----------|--------------|----------------------------|
 *   | Focus    | setFocused   | borderWidth.focus + primary|
 *   | Change   | onChangeText | TextInput                  |
 *
 * Impact:     Hardcode borderWidth: 1 → mất focus ring DNA khi đổi token.
 * must_keep:  radius.input; borderWidth.thin|focus; minHeight 44; placeholder = textMuted
 * SOLID:      Field chrome tách khỏi validation nghiệp vụ
 * LastVerified: src/theme/__tests__/mobL2Primitives.test.ts
 */

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { borderWidth, colors, radius, spacing, typography } from '../../theme/tokens';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'decimal-pad' | 'phone-pad' | 'numeric';
  placeholder?: string;
  editable?: boolean;
  onBlur?: () => void;
};

export function FormField({
  label,
  value,
  onChangeText,
  multiline,
  autoCapitalize,
  secureTextEntry,
  keyboardType,
  placeholder,
  editable = true,
  onBlur,
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMulti,
          !editable && styles.readonly,
          focused && editable && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 4 },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subhead,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.subhead,
  },
  input: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
  },
  inputFocused: {
    borderWidth: borderWidth.focus,
    borderColor: colors.primary,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  readonly: { opacity: 0.75, backgroundColor: colors.background },
});
