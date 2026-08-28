import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { colors, layout, spacing, typography, radius } from '../../theme/tokens';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { useAuth } from '../../context/AuthContext';
import { vi } from '../../i18n/vi';
import { formatHrmDate } from '../../utils/formatHrm';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  published_at: string;
  cover_url?: string | null;
};

export function InternalNewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const nav = useNavigation<any>();

  useEffect(() => {
    let active = true;
    const fetchNews = async () => {
      try {
        const res = await hrmRequest<any>(
          auth.getHrmAuth(),
          `/internal-news?company_id=${auth.companyId}`,
          { method: 'GET' }
        );
        if (res.ok && active) {
          // Fallback to empty array if no data
          setNews(res.data?.items || []);
        }
      } catch (err) {
        // Ignore errors for now
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchNews();
    return () => { active = false; };
  }, [auth]);

  const renderItem = ({ item }: { item: NewsItem }) => (
    <Pressable
      onPress={() => nav.navigate('NewsDetail', { id: item.id })}
      style={({ pressed }) => [styles.cardWrapper, pressed && styles.cardPressed]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardContent}>
          <Text style={styles.date}>{formatHrmDate(item.published_at)}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.summary} numberOfLines={3}>{item.summary}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <AppScreenLayout
      title="Tin nội bộ"
      stackHeaderPresent
      grouped
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : news.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Chưa có tin tức nào được đăng.</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  list: {
    padding: layout.screenPaddingH,
    gap: layout.itemGap,
  },
  cardWrapper: {
    borderRadius: radius.card,
  },
  cardPressed: {
    opacity: 0.7,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
  },
  title: {
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  summary: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
