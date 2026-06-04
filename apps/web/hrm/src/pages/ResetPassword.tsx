import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalLoginRedirect } from '@/components/auth/PortalLoginRedirect';

/** Password reset via X-BOS Portal — no Supabase auth (P1-SUPA-FE-02). */
export default function ResetPassword() {
  const { t } = useTranslation();

  return (
    <>
      <PortalLoginRedirect returnPath="/hr" />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('resetPassword.title', { defaultValue: 'Đặt lại mật khẩu' })}</CardTitle>
            <CardDescription>
              {t('resetPassword.portalRedirect', {
                defaultValue: 'Đang chuyển bạn sang Portal X-BOS để đặt lại mật khẩu…',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent />
        </Card>
      </div>
    </>
  );
}
