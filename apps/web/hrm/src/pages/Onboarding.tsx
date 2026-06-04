import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirectToPortalLogin } from '@/lib/portalLogin';
/** Company onboarding via X-BOS Portal — no Supabase (P1-SUPA-FE-02). */
export default function Onboarding() {
  const { t } = useTranslation();

  useEffect(() => {
    redirectToPortalLogin('/hr');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('onboarding.title', { defaultValue: 'Thiết lập công ty' })}</CardTitle>
          <CardDescription>
            {t('onboarding.portalRedirect', {
              defaultValue: 'Đang chuyển sang Portal X-BOS để hoàn tất đăng ký…',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
