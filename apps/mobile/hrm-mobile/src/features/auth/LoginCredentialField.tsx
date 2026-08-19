/**
 * @CODE-MEMORY
 * Screen:     Auth — LoginCredentialField (adb-sync TextInput seam)
 * UC:         UC-HRM-MOB-01 · C-LOGIN-ADB
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md §3.2 · FR-UC-M01
 * Purpose:    RN TextInput adb/uiautomator paste + input text must reach submit state (not controlled wipe).
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02
 * Coded:      2026-08-05
 * Callers:    LoginScreen (login-email · login-password · login-dev-base-url)
 * Impact:     Controlled value= re-renders clear native adb paste — HRM-VAL-001 / wrong API host.
 * must_keep:  testID login-email / login-password / login-dev-base-url; brand input chrome; no qa-login path
 * SOLID:      ADB sync isolated from generic FormField (settings/profile stay controlled)
 * LastVerified: src/features/auth/__tests__/loginScreenAdb.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01
 * change_mode: FIX
 * What: optional defaultValue + liveRef seed — login-dev-base-url adb fill binds React baseUrl
 * Why: R6 OBS — controlled FormField URL kept pilot :3001; session ignored 10.0.2.2:28001
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02
 * change_mode: FIX
 * What: Android focusable/editable + minHeight hit target for adb tap → focused=true
 * Why: R7 FAIL — EditText bounds present but adb tap left focused=false at bottom of screen
 */
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { borderWidth, colors, radius, spacing, typography } from '../../theme/tokens';

export type LoginCredentialFieldHandle = {
  /** Latest text (keyboard, paste, or adb setText before blur). */
  getText: () => string;
  blur: () => void;
  focus: () => void;
};

type Props = {
  label: string;
  onLiveTextChange: (text: string) => void;
  testID: string;
  accessibilityLabel?: string;
  /** Seed uncontrolled native text (e.g. default HRM base URL). */
  defaultValue?: string;
} & Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'keyboardType'
  | 'placeholder'
  | 'secureTextEntry'
  | 'autoFocus'
>;

export const LoginCredentialField = forwardRef<LoginCredentialFieldHandle, Props>(
  function LoginCredentialField(
    {
      label,
      onLiveTextChange,
      testID,
      accessibilityLabel,
      defaultValue = '',
      autoCapitalize,
      keyboardType,
      placeholder,
      secureTextEntry,
      autoFocus,
    },
    ref,
  ) {
    const inputRef = useRef<TextInput>(null);
    const liveRef = useRef(defaultValue);

    const commit = (text: string) => {
      liveRef.current = text;
      onLiveTextChange(text);
    };

    useImperativeHandle(ref, () => ({
      getText: () => liveRef.current,
      blur: () => inputRef.current?.blur(),
      focus: () => inputRef.current?.focus(),
    }));

    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={inputRef}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? testID}
          style={styles.input}
          defaultValue={defaultValue}
          onChangeText={commit}
          onEndEditing={(e) => commit(e.nativeEvent.text ?? '')}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoFocus={autoFocus}
          importantForAutofill="no"
          autoCorrect={false}
          spellCheck={false}
          editable
          focusable
          showSoftInputOnFocus
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  field: { gap: 4 },
  label: {
    color: colors.text,
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
    minHeight: 48,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
  },
});
