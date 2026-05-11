import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ArrowUpRight, CheckCircle, Star, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useCompanySubscription, useUpgradePlan } from '@/hooks/useCompanySubscription';
import { useActiveSubscriptionPlans, SubscriptionPlan } from '@/hooks/useSubscriptionPlans';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

export function TrialExpiredGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { data: subscription, isLoading } = useCompanySubscription();
  const { data: plans = [] } = useActiveSubscriptionPlans();
  const upgradePlan = useUpgradePlan();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  if (getHrmPortalMode(location.search)) return <>{children}</>;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      await upgradePlan.mutateAsync({
        planId: selectedPlan.id,
        planCode: selectedPlan.code,
        maxEmployees: selectedPlan.max_employees,
      });
      toast.success(isEn ? 'Plan upgraded successfully!' : 'Đã nâng cấp gói dịch vụ thành công!');
      setUpgradeOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Don't block while loading or if no subscription data
  if (isLoading || !subscription) return <>{children}</>;

  // If subscription is active, render children normally
  if (subscription.is_active) return <>{children}</>;

  // Trial/subscription expired — show blocking overlay
  return (
    <>
      <div className="relative flex-1 flex flex-col min-w-0">
        {/* Blurred content behind */}
        <div className="flex-1 overflow-hidden pointer-events-none select-none filter blur-sm opacity-40">
          {children}
        </div>

        {/* Blocking overlay */}
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
          <Card className="max-w-lg w-full border-destructive shadow-2xl">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-bold">
                {isEn ? 'Your trial has expired' : 'Gói dùng thử đã hết hạn'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isEn
                  ? 'Your 14-day free trial has ended. Please upgrade to a paid plan to continue using UniHRM.'
                  : 'Gói dùng thử miễn phí 14 ngày của bạn đã kết thúc. Vui lòng nâng cấp lên gói trả phí để tiếp tục sử dụng UniHRM.'}
              </p>
              <Button size="lg" onClick={() => setUpgradeOpen(true)} className="gap-2">
                <ArrowUpRight className="w-4 h-4" />
                {isEn ? 'Upgrade now' : 'Nâng cấp ngay'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEn ? 'Choose a plan' : 'Chọn gói dịch vụ'}</DialogTitle>
            <DialogDescription>
              {isEn ? 'Upgrade to unlock all features.' : 'Nâng cấp để mở khóa tất cả tính năng.'}
            </DialogDescription>
          </DialogHeader>
          <div className={`grid grid-cols-1 gap-3 ${plans.length <= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <Card
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    'cursor-pointer transition-all border-2 relative',
                    isSelected ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'hover:border-primary/50',
                    plan.is_popular && !isSelected && 'border-amber-300'
                  )}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-xs gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        {isEn ? 'Popular' : 'Phổ biến'}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-5 pb-4 text-center space-y-2">
                    <p className="font-semibold">{isEn ? plan.name_en : plan.name_vi}</p>
                    <p className="text-2xl font-bold">
                      {formatPrice(plan.price_monthly)}
                      <span className="text-xs font-normal text-muted-foreground">/{isEn ? 'mo' : 'th'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{plan.max_employees} {isEn ? 'employees' : 'nhân viên'}</p>
                    <div className="text-left space-y-1 pt-2">
                      {(isEn ? plan.features_en : plan.features_vi)?.map((f, i) => (
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
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>{isEn ? 'Cancel' : 'Hủy'}</Button>
            <Button onClick={handleUpgrade} disabled={!selectedPlan || upgradePlan.isPending}>
              {upgradePlan.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {isEn ? 'Upgrade now' : 'Nâng cấp ngay'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
