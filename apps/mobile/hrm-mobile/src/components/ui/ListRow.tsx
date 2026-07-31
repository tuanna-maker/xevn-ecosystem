import React from 'react';

import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, layout, radius, shadow, spacing, typography, type StatusTone } from '../../theme/tokens';

import { StatusBadge } from './StatusBadge';



type ListRowProps = {

  title: string;

  subtitle?: string;

  meta?: string;

  status?: string;

  statusLabel?: string;

  statusTone?: StatusTone;

  statusTestID?: string;

  testID?: string;

  onPress?: () => void;

  trailing?: React.ReactNode;

  actions?: React.ReactNode;

  style?: StyleProp<ViewStyle>;

};



export function ListRow({
  title,
  subtitle,
  meta,
  status,
  statusLabel,
  statusTone,
  statusTestID,
  testID,
  onPress,
  trailing,
  actions,
  style,
}: ListRowProps) {

  const content = (

    <View style={[styles.card, style]} testID={testID}>

      <View style={styles.main}>

        <View style={styles.textCol}>

          <Text style={styles.title} numberOfLines={2}>

            {title}

          </Text>

          {subtitle ? (

            <Text style={styles.subtitle} numberOfLines={2}>

              {subtitle}

            </Text>

          ) : null}

          {meta ? <Text style={styles.meta}>{meta}</Text> : null}

        </View>

        {status ? (
          <StatusBadge status={status} label={statusLabel} tone={statusTone} testID={statusTestID} />
        ) : null}

        {trailing}

      </View>

      {actions ? <View style={styles.actions}>{actions}</View> : null}

    </View>

  );



  if (onPress) {

    return (

      <Pressable

        onPress={onPress}

        accessibilityRole="button"

        style={({ pressed }) => [pressed && styles.pressed]}

      >

        {content}

      </Pressable>

    );

  }



  return content;

}



const styles = StyleSheet.create({

  card: {

    backgroundColor: colors.surface,

    borderRadius: radius.card,

    borderWidth: 1,

    borderColor: colors.border,

    paddingHorizontal: layout.screenPaddingH,

    paddingVertical: spacing.sm + 4,

    minHeight: layout.listRowMinHeight,

    justifyContent: 'center',

    gap: spacing.sm,

    ...shadow.sm,

  },

  main: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

  },

  textCol: { flex: 1, gap: 4 },

  title: {

    fontSize: typography.fontSize.title3,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

    lineHeight: typography.lineHeight.title3,

  },

  subtitle: {

    fontSize: typography.fontSize.callout,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.callout,

  },

  meta: {

    fontSize: typography.fontSize.footnote,

    color: colors.textMuted,

    lineHeight: typography.lineHeight.footnote,

    marginTop: 2,

  },

  actions: {

    flexDirection: 'row',

    gap: spacing.sm,

    marginTop: spacing.xs,

  },

  pressed: { opacity: 0.92 },

});


