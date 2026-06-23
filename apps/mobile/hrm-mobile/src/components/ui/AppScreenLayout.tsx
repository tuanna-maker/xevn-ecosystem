import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import {
  resolveBottomSafeInset,
  resolveScreenPaddingTop,
  resolveScrollPaddingBottom,
  resolveStandaloneScrollPaddingBottom,
  resolveTabBarHeight,
} from '../../theme/layoutInsets';
import { vi } from '../../i18n/vi';

type AppScreenLayoutProps = {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  /** iOS large title style (34pt) for list-root screens */
  largeTitle?: boolean;
  loading?: boolean;
  error?: string;
  empty?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void | Promise<void>;
  refreshing?: boolean;
  scroll?: boolean;
  /** iOS grouped inset list background (#F2F2F7) */
  grouped?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  headerAction?: React.ReactNode;
  /** Sticky bottom CTA zone (wizard / check-in) */
  footer?: React.ReactNode;
  /**
   * Apply top safe-area inset — tab-root screens without native stack header (Dashboard, Login).
   * Stack screens with `headerLargeTitle` should leave false (default).
   */
  safeAreaTop?: boolean;
  /**
   * Native stack already shows large title — render subtitle only (no duplicate inline title).
   */
  stackHeaderPresent?: boolean;
  /**
   * Include bottom tab bar height in scroll padding (default true for signed-in tab flows).
   * Set false on Login / full-screen routes outside bottom tabs.
   */
  includeTabBarInset?: boolean;
  /** Extra bottom inset for sticky footer above tab bar (check-in thumb-zone lift). */
  footerBottomExtra?: number;
} & Pick<ScrollViewProps, 'keyboardShouldPersistTaps'>;

type LayoutBodyProps = AppScreenLayoutProps & {
  paddingTop: number;
  scrollPaddingBottom: number;
  footerBottomInset: number;
};

function AppScreenLayoutBody({
  children,
  title,
  subtitle,
  largeTitle = false,
  loading = false,
  error,
  empty = false,
  emptyMessage = 'Chưa có dữ liệu',
  onRefresh,
  refreshing = false,
  scroll = true,
  grouped = false,
  contentStyle,
  headerAction,
  footer,
  keyboardShouldPersistTaps,
  paddingTop,
  scrollPaddingBottom,
  footerBottomInset,
  stackHeaderPresent = false,
}: LayoutBodyProps) {
  const rootStyle = grouped ? styles.rootGrouped : styles.root;
  const contentGap = grouped ? layout.sectionGap : layout.itemGap;
  const showInlineTitle = Boolean(title) && !stackHeaderPresent;

  const header = showInlineTitle || subtitle || headerAction ? (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {showInlineTitle ? (
          <Text style={[styles.title, largeTitle && styles.largeTitle]}>{title}</Text>
        ) : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {headerAction}
    </View>
  ) : null;

  const body = (
    <>
      {error ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {loading && !refreshing ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{vi.loading}</Text>
        </View>
      ) : empty && !loading ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>{emptyMessage}</Text>
          <Text style={styles.emptyHint}>Kéo xuống để làm mới hoặc thử lại sau.</Text>
        </View>
      ) : (
        children
      )}
    </>
  );

  const contentContainerStyle: StyleProp<ViewStyle> = [
    styles.content,
    { paddingTop, paddingBottom: scrollPaddingBottom, gap: contentGap },
    contentStyle,
  ];

  if (!scroll) {
    return (
      <View style={[rootStyle, styles.flex, contentStyle, footer ? { paddingBottom: footerBottomInset } : null]}>
        <View style={[styles.flex, { paddingTop }]}>{header}{body}</View>
        {footer}
      </View>
    );
  }

  return (
    <View style={[rootStyle, styles.flex, footer ? { paddingBottom: footerBottomInset } : null]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.primary} />
          ) : undefined
        }
      >
        {header}
        {body}
      </ScrollView>
      {footer}
    </View>
  );
}

/** Inside bottom-tab navigator — reads measured tab bar height for scroll/footer inset. */
function TabBarAwareAppScreenLayout(props: AppScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const measuredTabBarHeight = useBottomTabBarHeight();
  const tabBarHeight = Math.max(
    measuredTabBarHeight,
    resolveTabBarHeight({ bottom: insets.bottom }),
  );
  const safeAreaTop = props.safeAreaTop ?? false;
  const footerBottomExtra = props.footerBottomExtra ?? 0;

  return (
    <AppScreenLayoutBody
      {...props}
      paddingTop={resolveScreenPaddingTop(insets, safeAreaTop)}
      scrollPaddingBottom={resolveScrollPaddingBottom(insets, tabBarHeight)}
      footerBottomInset={tabBarHeight + footerBottomExtra}
    />
  );
}

/** Outside bottom tabs (Login) — bottom safe area only, no tab bar hook. */
function StandaloneAppScreenLayout(props: AppScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = resolveBottomSafeInset(insets.bottom);
  const safeAreaTop = props.safeAreaTop ?? false;

  return (
    <AppScreenLayoutBody
      {...props}
      paddingTop={resolveScreenPaddingTop(insets, safeAreaTop)}
      scrollPaddingBottom={resolveStandaloneScrollPaddingBottom(insets)}
      footerBottomInset={Math.max(bottomInset, spacing.sm)}
    />
  );
}

export function AppScreenLayout(props: AppScreenLayoutProps) {
  if (props.includeTabBarInset === false) {
    return <StandaloneAppScreenLayout {...props} />;
  }
  return <TabBarAwareAppScreenLayout {...props} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rootGrouped: {
    flex: 1,
    backgroundColor: colors.iosGroupedBackground,
  },
  content: {
    paddingHorizontal: layout.screenPaddingH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: layout.sectionGap - layout.itemGap,
  },
  headerText: { flex: 1, gap: 4 },
  title: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.lineHeight.title2,
  },
  largeTitle: {
    fontSize: typography.fontSize.largeTitle,
    lineHeight: typography.lineHeight.largeTitle,
  },
  subtitle: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: layout.cardPadding,
  },
  errorText: {
    color: '#991B1B',
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.medium,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.callout,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
