import { Ionicons } from '@expo/vector-icons';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

import {
  ACTION_GRID_ABOVE_FOLD_ROWS,
  ACTION_GRID_COLS,
  chunkActionGridPages,
  resolveAboveFoldPageSize,
  resolveActionGridCols,
  resolveActionGridPageSize,
  resolveActionGridTileWidth,
} from '../../utils/homeActionGrid';

import {
  getQuickAccessTilesForPersona,
  type QuickAccessTileConfig,
  type QuickAccessTileId,
} from '../../utils/homePortal';

import type { MobilePersonaId } from '../../utils/mobilePersona';

import { HomeSectionHeader } from './HomeSectionHeader';

export type QuickAccessGridProps = {
  persona?: MobilePersonaId;
  /** @deprecated Prefer `persona`. */
  isManager?: boolean;
  badgeCounts?: Partial<Record<QuickAccessTileId, number>>;
  onTilePress: (id: QuickAccessTileId) => void;
  /** Home above-fold: single-row pages + compact tiles (MOB-UX-14-R3). */
  aboveFold?: boolean;
  /** iPhone SE class — 52dp tiles, tighter gaps (MOB-UX-14-R6). */
  ultraCompact?: boolean;
};

const TILE_GAP = spacing.xs;
const ROW_GAP = spacing.xs;
const TILE_MIN_HEIGHT = 72;
const TILE_MIN_HEIGHT_COMPACT = 64;
const TILE_MIN_HEIGHT_ULTRA_COMPACT = 52;
const TILE_ICON_SIZE = 40;
const TILE_ICON_SIZE_COMPACT = 32;
const TILE_ICON_SIZE_ULTRA_COMPACT = 28;

function ActionTile({
  tile,
  tileWidth,
  badge,
  onPress,
  compact = false,
  ultraCompact = false,
  flexCell = false,
}: {
  tile: QuickAccessTileConfig;
  tileWidth: number;
  badge: number;
  onPress: () => void;
  compact?: boolean;
  ultraCompact?: boolean;
  flexCell?: boolean;
}) {
  const iconSize = ultraCompact
    ? TILE_ICON_SIZE_ULTRA_COMPACT
    : compact
      ? TILE_ICON_SIZE_COMPACT
      : TILE_ICON_SIZE;
  const minHeight = ultraCompact
    ? TILE_MIN_HEIGHT_ULTRA_COMPACT
    : compact
      ? TILE_MIN_HEIGHT_COMPACT
      : TILE_MIN_HEIGHT;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        flexCell ? styles.tileFlex : { width: tileWidth },
        { minHeight },
        pressed && styles.tilePressed,
      ]}
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={tile.stub ? `${tile.label} — sắp có` : tile.label}
      testID={`home-action-tile-${tile.id}`}
    >
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.iconCircle,
            compact && styles.iconCircleCompact,
            { backgroundColor: tile.tileColor },
          ]}
        >
          <Ionicons name={tile.icon} size={compact ? 18 : 20} color={tile.iconColor} />
        </View>
        {badge > 0 ? (
          <View
            style={styles.badge}
            accessibilityLabel={`${badge} mục`}
            testID={`home-action-tile-${tile.id}-badge`}
          >
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={compact ? 1 : 2}>
        {tile.label}
      </Text>
    </Pressable>
  );
}

function ActionGridPage({
  tiles,
  tileWidth,
  gridCols,
  badgeCounts,
  onTilePress,
  maxRows,
  compact = false,
  ultraCompact = false,
}: {
  tiles: QuickAccessTileConfig[];
  tileWidth: number;
  gridCols: number;
  badgeCounts?: Partial<Record<QuickAccessTileId, number>>;
  onTilePress: (id: QuickAccessTileId) => void;
  maxRows?: number;
  compact?: boolean;
  ultraCompact?: boolean;
}) {
  const rows: QuickAccessTileConfig[][] = [];
  for (let i = 0; i < tiles.length; i += gridCols) {
    rows.push(tiles.slice(i, i + gridCols));
  }
  const visibleRows = maxRows != null && maxRows > 0 ? rows.slice(0, maxRows) : rows;

  return (
    <View style={styles.page}>
      {visibleRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={[styles.row, { gap: TILE_GAP }]}>
          {row.map((tile) => (
            <View key={tile.id} style={styles.tileCell}>
              <ActionTile
                tile={tile}
                tileWidth={tileWidth}
                badge={badgeCounts?.[tile.id] ?? 0}
                onPress={() => onTilePress(tile.id)}
                compact={compact}
                ultraCompact={ultraCompact}
                flexCell
              />
            </View>
          ))}
          {row.length < gridCols
            ? Array.from({ length: gridCols - row.length }).map((_, padIndex) => (
                <View key={`pad-${rowIndex}-${padIndex}`} style={styles.tileCell} />
              ))
            : null}
        </View>
      ))}
    </View>
  );
}

/** ZenHR 4-col compact action carousel — MOB-UX-14a / J-MOB-32+. */
export function QuickAccessGrid({
  persona: personaProp,
  isManager = false,
  badgeCounts,
  onTilePress,
  aboveFold = false,
  ultraCompact = false,
}: QuickAccessGridProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [layoutWidth, setLayoutWidth] = useState(0);

  useEffect(() => {
    setLayoutWidth(0);
    setActivePage(0);
  }, [screenWidth]);
  const persona = personaProp ?? (isManager ? 'manager' : 'employee');
  const tiles = useMemo(() => getQuickAccessTilesForPersona(persona), [persona]);

  const estimatedContentWidth = useMemo(
    () => Math.max(0, Math.round(screenWidth - layout.screenPaddingH * 2)),
    [screenWidth],
  );

  const onWrapLayout = useCallback((event: LayoutChangeEvent) => {
    const measured = Math.round(event.nativeEvent.layout.width);
    if (measured > 0) {
      setLayoutWidth((prev) => (prev === measured ? prev : measured));
    }
  }, []);

  const contentWidth = layoutWidth > 0 ? layoutWidth : estimatedContentWidth;

  const gridCols = useMemo(() => {
    if (aboveFold) {
      return ACTION_GRID_COLS;
    }
    return resolveActionGridCols(contentWidth);
  }, [aboveFold, contentWidth]);

  const pageSize = useMemo(
    () =>
      aboveFold
        ? resolveAboveFoldPageSize(gridCols, ACTION_GRID_ABOVE_FOLD_ROWS)
        : resolveActionGridPageSize(gridCols),
    [aboveFold, gridCols],
  );

  const pages = useMemo(() => chunkActionGridPages(tiles, pageSize), [tiles, pageSize]);
  const [activePage, setActivePage] = useState(0);

  const pageWidth = contentWidth > 0 ? contentWidth : undefined;
  const tileWidth = useMemo(() => {
    if (contentWidth <= 0) {
      return 72;
    }
    return resolveActionGridTileWidth(contentWidth, gridCols, TILE_GAP);
  }, [contentWidth, gridCols]);

  const maxRows = aboveFold ? ACTION_GRID_ABOVE_FOLD_ROWS : undefined;
  const listScrollEnabled = pages.length > 1 && contentWidth > 0;

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!contentWidth) return;
      const x = e.nativeEvent.contentOffset.x;
      const index = Math.round(x / contentWidth);
      setActivePage(Math.max(0, Math.min(index, pages.length - 1)));
    },
    [contentWidth, pages.length],
  );

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<QuickAccessTileConfig[]>) => (
      <View style={[styles.pageSlot, pageWidth != null ? { width: pageWidth } : styles.pageSlotFlex]}>
        <ActionGridPage
          tiles={item}
          tileWidth={tileWidth}
          gridCols={gridCols}
          badgeCounts={badgeCounts}
          onTilePress={onTilePress}
          maxRows={maxRows}
          compact={aboveFold}
          ultraCompact={ultraCompact}
        />
      </View>
    ),
    [pageWidth, tileWidth, gridCols, badgeCounts, onTilePress, maxRows, aboveFold, ultraCompact],
  );

  const wrapStyle = ultraCompact ? [styles.wrap, styles.wrapUltraCompact] : styles.wrap;

  return (
    <View
      style={wrapStyle}
      testID="home-actions-carousel"
      onLayout={onWrapLayout}
      collapsable={false}
    >
      {aboveFold ? null : <HomeSectionHeader title="Truy cập nhanh" />}

      <FlatList
        key={`action-grid-${gridCols}-${contentWidth}`}
        data={pages}
        keyExtractor={(_, index) => `action-page-${index}`}
        renderItem={renderPage}
        horizontal
        pagingEnabled={contentWidth > 0}
        snapToInterval={contentWidth > 0 ? contentWidth : undefined}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        scrollEnabled={listScrollEnabled}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        accessibilityRole="menu"
        style={styles.list}
        extraData={`${gridCols}-${contentWidth}-${aboveFold}`}
      />

      {pages.length > 1 && !(aboveFold && ultraCompact) ? (
        <View
          style={styles.dots}
          accessibilityRole="adjustable"
          accessibilityLabel="Trang thao tác"
          testID="home-actions-page-dots"
        >
          {pages.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[styles.dot, index === activePage ? styles.dotActive : null]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Alias for ZenHR benchmark naming. */
export const HomeActionsCarousel = QuickAccessGrid;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  wrapUltraCompact: {
    gap: 2,
    marginBottom: 2,
  },
  list: {
    width: '100%',
  },
  pageSlot: {
    flexGrow: 0,
    flexShrink: 0,
  },
  pageSlotFlex: {
    flex: 1,
    width: '100%',
  },
  page: {
    gap: ROW_GAP,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  tileCell: {
    flex: 1,
    minWidth: 0,
  },
  tile: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: TILE_MIN_HEIGHT,
  },
  tileFlex: {
    width: '100%',
  },
  tilePressed: {
    opacity: 0.88,
  },
  iconWrap: {
    position: 'relative',
  },
  iconCircle: {
    width: TILE_ICON_SIZE,
    height: TILE_ICON_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleCompact: {
    width: TILE_ICON_SIZE_COMPACT,
    height: TILE_ICON_SIZE_COMPACT,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.surface,
  },
  label: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.caption,
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
