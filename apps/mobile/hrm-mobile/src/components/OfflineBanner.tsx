import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../context/NetworkContext';

export function OfflineBanner() {
  const net = useNetwork();
  const insets = useSafeAreaInsets();
  if (!net.ready || !net.offline) return null;
  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 6) }]}>
      <Text style={styles.text}>Ngoại tuyến — chỉ đọc/cache; không ghi API (UC-HRM-MOB-14)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#422006',
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#78350f',
  },
  text: { color: '#fef3c7', fontSize: 13, lineHeight: 18 },
});
