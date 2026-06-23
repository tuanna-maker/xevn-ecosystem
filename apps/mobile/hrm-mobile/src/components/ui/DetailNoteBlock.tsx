import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../../theme/tokens';



type DetailNoteBlockProps = {

  label: string;

  text: string;

  variant?: 'muted' | 'danger';

};



export function DetailNoteBlock({ label, text, variant = 'muted' }: DetailNoteBlockProps) {

  const isDanger = variant === 'danger';



  return (

    <View style={styles.wrap}>

      <Text style={[styles.label, isDanger && styles.labelDanger]}>{label}</Text>

      <View style={[styles.block, isDanger && styles.blockDanger]}>

        <Text style={[styles.text, isDanger && styles.textDanger]}>{text}</Text>

      </View>

    </View>

  );

}



const styles = StyleSheet.create({

  wrap: { gap: spacing.xs },

  label: {

    fontSize: typography.fontSize.footnote,

    color: colors.textSecondary,

    fontWeight: typography.fontWeight.medium,

    lineHeight: typography.lineHeight.footnote,

  },

  labelDanger: { color: colors.danger },

  block: {

    backgroundColor: colors.background,

    borderRadius: radius.md,

    padding: spacing.md - 4,

    borderWidth: 1,

    borderColor: colors.border,

  },

  blockDanger: {

    backgroundColor: '#FEF2F2',

    borderColor: '#FECACA',

  },

  text: {

    fontSize: typography.fontSize.body,

    color: colors.text,

    lineHeight: typography.lineHeight.body,

  },

  textDanger: { color: '#991B1B' },

});


