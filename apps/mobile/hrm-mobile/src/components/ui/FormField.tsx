import React from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme/tokens';



type FormFieldProps = {

  label: string;

  value: string;

  onChangeText?: (t: string) => void;

  multiline?: boolean;

  autoCapitalize?: 'none' | 'sentences';

  secureTextEntry?: boolean;

  keyboardType?: 'default' | 'email-address' | 'decimal-pad';

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

  return (

    <View style={styles.field}>

      <Text style={styles.label}>{label}</Text>

      <TextInput

        style={[styles.input, multiline && styles.inputMulti, !editable && styles.readonly]}

        value={value}

        onChangeText={onChangeText}

        onBlur={onBlur}

        multiline={multiline}

        secureTextEntry={secureTextEntry}

        autoCapitalize={autoCapitalize ?? 'sentences'}

        keyboardType={keyboardType}

        placeholder={placeholder}

        placeholderTextColor={colors.textSecondary}

        editable={editable}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  field: { gap: 4 },

  label: {

    color: colors.textSecondary,

    fontSize: typography.fontSize.footnote,

    fontWeight: typography.fontWeight.medium,

    lineHeight: typography.lineHeight.footnote,

  },

  input: {

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: radius.input,

    paddingHorizontal: spacing.md - 4,

    paddingVertical: spacing.sm + 2,

    color: colors.text,

    backgroundColor: colors.surface,

    fontSize: typography.fontSize.body,

    lineHeight: typography.lineHeight.body,

  },

  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  readonly: { opacity: 0.75, backgroundColor: colors.background },

});


