import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { colors, layout, spacing, typography, radius } from '../../theme/tokens';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { useAuth } from '../../context/AuthContext';
import { formatHrmDate } from '../../utils/formatHrm';

type NewsDetail = {
  id: string;
  title: string;
  content: string;
  published_at: string;
  author_name?: string;
};

export function NewsDetailScreen() {
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const route = useRoute<any>();
  const newsId = route.params?.id;

  useEffect(() => {
    let active = true;
    const fetchArticle = async () => {
      if (!newsId) return;
      try {
        const res = await hrmRequest<any>(
          auth.getHrmAuth(),
          `/internal-news/${newsId}?company_id=${auth.companyId}`,
          { method: 'GET' }
        );
        if (res.ok && active) {
          setArticle(res.data);
        }
      } catch (err) {
        // Ignore errors
      } finally {
        if (active) setLoading(false);
      }
    };
    void fetchArticle();
    return () => { active = false; };
  }, [auth, newsId]);

  return (
    <AppScreenLayout
      title="Chi tiết bản tin"
      stackHeaderPresent
      scroll={false}
      grouped
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !article ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Không tìm thấy bản tin này.</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{formatHrmDate(article.published_at)}</Text>
            {article.author_name ? (
              <Text style={styles.metaText}> • {article.author_name}</Text>
            ) : null}
          </View>
          <View style={styles.divider} />
          {/* Simple text rendering for MVP, consider React Native Render HTML for full support */}
          <Text style={styles.body}>{article.content}</Text>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: layout.screenPaddingH,
  },
  title: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.lineHeight.title2,
  },
  meta: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  metaText: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  body: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    color: colors.text,
  },
  emptyText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
