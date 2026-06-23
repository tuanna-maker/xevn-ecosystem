import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const LOGO = require('../../../assets/xevn-logo.png');

type XevnLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  testID?: string;
};

/** Canonical XeVN mark — copy `assets/brand/xevn-logo-master.png` when adding new mobile apps. */
export function XevnLogo({ size = 72, style, imageStyle, testID }: XevnLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]} testID={testID}>
      <Image
        source={LOGO}
        style={[{ width: size, height: size }, imageStyle]}
        resizeMode="contain"
        accessibilityLabel="XeVN"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
