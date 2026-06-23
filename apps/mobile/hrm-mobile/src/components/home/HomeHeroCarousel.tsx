import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import type { HeroCarouselItem } from '../../utils/homePortal';

type HomeHeroCarouselProps = {
  items: HeroCarouselItem[];
};

const HORIZONTAL_BLEED = layout.screenPaddingH;
const CARD_WIDTH = Dimensions.get('window').width - HORIZONTAL_BLEED * 2;

export function HomeHeroCarousel({ items }: HomeHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + layout.itemGap));
    setActiveIndex(Math.max(0, Math.min(index, items.length - 1)));
  }, [items.length]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<HeroCarouselItem>) => (
      <View
        style={[
          styles.card,
          {
            width: CARD_WIDTH,
            backgroundColor: item.gradientStart,
          },
        ]}
        accessibilityRole="text"
      >
        <View style={[styles.cardAccent, { backgroundColor: item.gradientEnd }]} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
        </View>
        <View style={styles.illustration} accessibilityElementsHidden>
          <Ionicons
            name={item.kind === 'birthday_self' || item.kind === 'birthday_colleague' ? 'gift-outline' : 'sparkles-outline'}
            size={48}
            color="rgba(255,255,255,0.35)"
          />
        </View>
      </View>
    ),
    [],
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <FlatList
        data={items}
        keyExtractor={(row) => row.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + layout.itemGap}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
      />
      {items.length > 1 ? (
        <View style={styles.dots} accessibilityRole="adjustable" accessibilityLabel="Trang carousel">
          {items.map((row, index) => (
            <View
              key={row.id}
              style={[styles.dot, index === activeIndex ? styles.dotActive : null]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.sectionGap,
    gap: spacing.sm,
  },
  listContent: {
    gap: layout.itemGap,
  },
  card: {
    borderRadius: radius.card,
    minHeight: 132,
    overflow: 'hidden',
    padding: layout.cardPadding,
    justifyContent: 'flex-end',
  },
  cardAccent: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
    borderRadius: radius.card,
  },
  cardContent: {
    gap: spacing.xs,
    maxWidth: '72%',
    zIndex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
    lineHeight: typography.lineHeight.title3,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.subhead,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: typography.lineHeight.subhead,
  },
  illustration: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});
