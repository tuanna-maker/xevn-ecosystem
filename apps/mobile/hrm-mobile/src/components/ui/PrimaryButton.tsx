import React from 'react';

import { ActivityIndicator, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '../primitives/PressableScale';

import { colors, layout, radius, typography } from '../../theme/tokens';



type PrimaryButtonProps = {

  label: string;

  onPress: () => void;

  disabled?: boolean;

  loading?: boolean;

  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';

  size?: 'md' | 'sm';

  style?: StyleProp<ViewStyle>;

  accessibilityLabel?: string;

  testID?: string;

};



export function PrimaryButton({

  label,

  onPress,

  disabled = false,

  loading = false,

  variant = 'primary',

  size = 'md',

  style,

  accessibilityLabel,

  testID,

}: PrimaryButtonProps) {

  const isDisabled = disabled || loading;



  return (

    <PressableScale

      testID={testID}

      accessibilityRole="button"

      accessibilityLabel={accessibilityLabel ?? label}

      accessibilityState={{ disabled: isDisabled, busy: loading }}

      onPress={onPress}

      disabled={isDisabled}

      style={[

        styles.base,

        size === 'md' && styles.md,

        size === 'sm' && styles.sm,

        variant === 'primary' && styles.primary,

        variant === 'secondary' && styles.secondary,

        variant === 'danger' && styles.danger,

        variant === 'ghost' && styles.ghost,

        isDisabled && styles.disabled,

        isDisabled && variant === 'primary' && styles.disabledPrimary,

        style,

      ]}

    >

      {loading ? (

        <ActivityIndicator

          size="small"

          color={variant === 'secondary' || variant === 'ghost' ? colors.primary : colors.surface}

        />

      ) : (

        <Text

          style={[

            styles.label,

            size === 'sm' && styles.labelSm,

            variant === 'primary' && styles.labelPrimary,

            variant === 'secondary' && styles.labelSecondary,

            variant === 'danger' && styles.labelDanger,

            variant === 'ghost' && styles.labelGhost,

          ]}

        >

          {label}

        </Text>

      )}

    </PressableScale>

  );

}



const styles = StyleSheet.create({

  base: {

    borderRadius: radius.card,

    alignItems: 'center',

    justifyContent: 'center',

    width: '100%',

  },

  md: {

    minHeight: layout.primaryButtonHeight,

    paddingHorizontal: layout.screenPaddingH,

  },

  sm: {

    minHeight: layout.filterChipHeight,

    paddingHorizontal: layout.screenPaddingH - 4,

  },

  primary: {

    backgroundColor: colors.primary,

  },

  secondary: {

    backgroundColor: colors.surface,

    borderWidth: 1,

    borderColor: colors.border,

  },

  danger: {

    backgroundColor: colors.danger,

  },

  ghost: {

    backgroundColor: 'transparent',

  },

  disabled: { opacity: 0.6 },

  disabledPrimary: { backgroundColor: colors.primaryDisabled },

  label: {

    fontSize: typography.fontSize.body,

    fontWeight: typography.fontWeight.semibold,

    lineHeight: typography.lineHeight.body,

  },

  labelSm: {

    fontSize: typography.fontSize.callout,

  },

  labelPrimary: { color: colors.surface },

  labelSecondary: { color: colors.primary },

  labelDanger: { color: colors.surface },

  labelGhost: { color: colors.primary },

});

