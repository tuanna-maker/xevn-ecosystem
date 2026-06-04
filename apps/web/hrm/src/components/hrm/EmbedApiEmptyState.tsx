import { useTranslation } from 'react-i18next';
import { PackageOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type EmbedApiEmptyStateProps = {
  /** i18n key under embed.apiEmpty.* or raw title when contains a space */
  titleKey?: string;
  bodyKey?: string;
  title?: string;
  body?: string;
};

/** BR-360-SOURCE-01 — explicit empty copy in portal embed API mode (not silent blank). */
export function EmbedApiEmptyState({
  titleKey = 'embed.apiEmpty.title',
  bodyKey = 'embed.apiEmpty.body',
  title,
  body,
}: EmbedApiEmptyStateProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t(titleKey);
  const resolvedBody = body ?? t(bodyKey);

  return (
    <Card className="border-dashed border-slate-200 bg-slate-50/60">
      <CardContent className="flex items-start gap-3 py-8 text-sm text-muted-foreground">
        <PackageOpen className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{resolvedTitle}</p>
          <p className="leading-relaxed">{resolvedBody}</p>
        </div>
      </CardContent>
    </Card>
  );
}
