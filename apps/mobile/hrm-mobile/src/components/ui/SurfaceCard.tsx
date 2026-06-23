import React from 'react';

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { PressableScale } from '../primitives/PressableScale';

import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';



type SurfaceCardProps = {

  title: string;

  children: React.ReactNode;

  footer?: React.ReactNode;

  style?: StyleProp<ViewStyle>;

  /** When set, whole card is tappable with press-scale feedback. */
  onPress?: () => void;

  testID?: string;

};



export function SurfaceCard({ title, children, footer, style, onPress, testID }: SurfaceCardProps) {

  const card = (

    <View style={[styles.card, style]} testID={testID}>

      <Text style={styles.title}>{title}</Text>

      <View style={styles.body}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}

    </View>

  );



  if (onPress) {

    return (

      <PressableScale

        onPress={onPress}

        accessibilityRole="button"

        accessibilityLabel={title}

        style={styles.pressableWrap}

      >

        {card}

      </PressableScale>

    );

  }



  return card;

}



const styles = StyleSheet.create({

  pressableWrap: {

    width: '100%',

  },

  card: {

    backgroundColor: colors.surface,

    borderRadius: radius.card,

    borderWidth: 1,

    borderColor: colors.border,

    padding: layout.cardPadding,

    gap: spacing.sm,

    ...shadow.sm,

  },

  title: {

    fontSize: typography.fontSize.title2,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

    lineHeight: typography.lineHeight.title2,

  },

  body: { gap: spacing.xs },

  footer: {

    borderTopWidth: 1,

    borderTopColor: colors.border,

    paddingTop: spacing.sm,

    marginTop: spacing.xs,

  },

});

