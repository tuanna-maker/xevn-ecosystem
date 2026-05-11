import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Star, Clock, AlertTriangle, ArrowUpRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useCompanySubscription, useUpgradePlan, useCanAddEmployee } from '@/hooks/useCompanySubscription';
import { useActiveSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { cn } from '@/lib/utils';

export function SubscriptionManagement() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { data: subscription, isLoading: subLoading } = useCompanySubscription();
  const { data: plans = [], isLoading: plansLoading } = useActiveSubscriptionPlans();
  const upgradePlan = useUpgradePlan();
  const { data: employeeLimit } = useCanAddEmployee();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      await upgradePlan.mutateAsync({
        planId: selectedPlan.id,
        planCode: selectedPlan.code,
        maxEmployees: selectedPlan.max_employees,
      });
      toast.success(t('settings.sub.upgradeSuccess'));
      setUpgradeOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (subLoading || plansLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.is_active;
  const isExpired = !isActive;
  const trialDays = subscription?.trial_days_remaining || 0;

  // Get localized plan name
  const getPlanName = () => {
    if (isEn) return subscription?.plan_name_en || subscription?.plan_code || 'Starter';
    return subscription?.plan_name_vi || subscription?.plan_code || 'Starter';
  };

  // Get localized features
  const getFeatures = () => isEn ? subscription?.plan_features_en : subscription?.plan_features_vi;
  const getPlanFeatures = (plan: SubscriptionPlan) => isEn ? plan.features_en : plan.features_vi;
  const getPlanDisplayName = (plan: SubscriptionPlan) => isEn ? plan.name_en : plan.name_vi;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className={cn(isExpired && 'border-destructive')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            {t('settings.sub.currentPlan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold">{getPlanName()}</h3>
              <div className="flex items-center gap-2 mt-1">
                {isTrial && isActive && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {t('settings.sub.daysRemaining', { days: trialDays })}
                  </Badge>
                )}
                {!isTrial && isActive && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('settings.sub.active')}
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {t('settings.sub.expired')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              {subscription?.plan_price_monthly && (
                <p className="text-2xl font-bold">{formatPrice(subscription.plan_price_monthly)}<span className="text-sm font-normal text-muted-foreground">/{t('settings.sub.month')}</span></p>
              )}
            </div>
          </div>

          {/* Employee usage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('settings.sub.employeeUsage')}</span>
              <span className="font-medium">{employeeLimit?.current ?? '—'} / {employeeLimit?.max ?? subscription?.max_employees ?? 30}</span>
            </div>
            <Progress value={employeeLimit ? (employeeLimit.current / employeeLimit.max) * 100 : 0} className="h-2" />
          </div>

          {/* Features */}
          {(subscription?.plan_features_vi || subscription?.plan_features_en) && (
            <div className="space-y-1.5 pt-2">
              <p className="text-sm font-medium">{t('settings.sub.includedFeatures')}:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {getFeatures()?.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => setUpgradeOpen(true)} className="mt-2">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            {t('settings.sub.upgradePlan')}
          </Button>
        </CardContent>
      </Card>

      {/* Trial Warning */}
      {isTrial && trialDays <= 5 && isActive && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-medium text-sm">
                {t('settings.sub.trialExpireWarning', { days: trialDays })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.sub.upgradeNowDesc')}
              </p>
            </div>
            <Button size="sm" onClick={() => setUpgradeOpen(true)} className="ml-auto shrink-0">
              {t('settings.sub.upgrade')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('settings.sub.choosePlan')}</DialogTitle>
            <DialogDescription>{t('settings.sub.choosePlanDesc')}</DialogDescription>
          </DialogHeader>
          <div className={`grid grid-cols-1 gap-3 ${plans.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {plans.map((plan) => {
              const isCurrentPlan = plan.code === subscription?.plan_code;
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <Card
                  key={plan.id}
                  onClick={() => !isCurrentPlan && setSelectedPlan(plan)}
                  className={cn(
                    'cursor-pointer transition-all border-2 relative',
                    isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : '',
                    isCurrentPlan ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50',
                    plan.is_popular && !isSelected && 'border-amber-300'
                  )}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-xs gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        {t('settings.sub.popular')}
                      </Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">{t('settings.sub.current')}</Badge>
                    </div>
                  )}
                  <CardContent className="pt-5 pb-4 text-center space-y-2">
                    <p className="font-semibold">{getPlanDisplayName(plan)}</p>
                    <p className="text-2xl font-bold">{formatPrice(plan.price_monthly)}<span className="text-xs font-normal text-muted-foreground">/{t('settings.sub.month')}</span></p>
                    <p className="text-xs text-muted-foreground">{plan.max_employees} {t('settings.sub.employees')}</p>
                    <div className="text-left space-y-1 pt-2">
                      {getPlanFeatures(plan)?.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs">
                          <CheckCircle className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>{t('settings.sub.cancel')}</Button>
            <Button onClick={handleUpgrade} disabled={!selectedPlan || upgradePlan.isPending}>
              {upgradePlan.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {t('settings.sub.upgradeNow')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
