import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { shouldSkipSupabaseDataFetches } from '@/lib/hrmDataMode';
import { navigatePortalHrmMenu, type PortalHrmNavKey } from '@/lib/hrmEmbedPortalNav';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

type EmbedGuardedTabProps = {
  children: ReactNode;
  /** Menu label shown when embed blocks Supabase-only tab. */
  menuLabel: string;
  /** Command Center sidebar target (P-CC menu). */
  portalNavKey?: PortalHrmNavKey;
};

/** Prevents Supabase-only profile tabs from mounting in Command Center embed. */
export function EmbedGuardedTab({ children, menuLabel, portalNavKey = 'employees' }: EmbedGuardedTabProps) {
  const { t } = useTranslation();

  if (!shouldSkipSupabaseDataFetches()) {
    return <>{children}</>;
  }

  const portalEmbed = typeof window !== 'undefined' && getHrmPortalMode(window.location.search);
  const sidebarLabel = t(`embed.portalNav.${portalNavKey}`, menuLabel);

  return (
    <Card className="border-dashed border-amber-200 bg-amber-50/40">
      <CardContent className="flex items-start gap-3 py-8 text-sm text-muted-foreground">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-medium text-foreground">{t('embed.guardedTab.title')}</p>
          <p className="leading-relaxed">
            {t('embed.guardedTab.body', { menu: menuLabel })}
          </p>
          {portalEmbed ? (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs font-semibold text-primary"
              onClick={() => navigatePortalHrmMenu(portalNavKey)}
            >
              {t('embed.guardedTab.openSidebar', { menu: sidebarLabel })}
              <ExternalLink className="ml-1 inline h-3 w-3" />
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">{t('embed.guardedTab.standaloneHint')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
