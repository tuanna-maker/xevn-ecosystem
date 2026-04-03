import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useActiveSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export function PricingSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { data: plans = [], isLoading } = useActiveSubscriptionPlans();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-1 mb-10">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('landing.pricing.monthly')}
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('landing.pricing.yearly')}
            {billingPeriod !== 'yearly' && (
              <span className="ml-1.5 text-xs text-emerald-600 font-semibold">
                {t('landing.pricing.saveDiscount')}
              </span>
            )}
          </button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {[...Array(5)].map((_, i) => (
              <Card key={i}><CardContent className="p-6 space-y-3">
                <Skeleton className="h-5 w-24 mx-auto" />
                <Skeleton className="h-8 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardContent></Card>
            ))}
          </div>
        )}

        {/* Plans Grid */}
        {!isLoading && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-7xl mx-auto ${
            plans.length <= 3 ? 'lg:grid-cols-3' : plans.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'
          }`}>
            {plans.map((plan) => {
              const features = lang === 'vi' ? plan.features_vi : plan.features_en;
              const planName = lang === 'vi' ? plan.name_vi : plan.name_en;
              const planDesc = lang === 'vi' ? plan.description_vi : plan.description_en;
              const price = billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const periodLabel = billingPeriod === 'monthly'
                ? t('landing.pricing.perMonth')
                : t('landing.pricing.perYear');

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-shadow ${
                    plan.is_popular
                      ? 'border-primary shadow-lg ring-1 ring-primary/20 scale-[1.02] z-10'
                      : 'border-border shadow-sm hover:shadow-md'
                  }`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-500 text-white border-0">
                        <Star className="w-3 h-3 fill-white" />
                        {t('landing.pricing.popular')}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2 pt-6">
                    <CardTitle className="text-base font-semibold">
                      {planName}
                    </CardTitle>
                    {(plan.description_vi || plan.description_en) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {planDesc}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col text-center">
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{formatPrice(price)}</span>
                      <p className="text-xs text-muted-foreground mt-1">{periodLabel}</p>
                    </div>

                    {/* Employees */}
                    <div className="flex items-center justify-center gap-1.5 text-xs mb-4">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="font-medium">{plan.max_employees} {t('landing.pricing.employees')}</span>
                    </div>

                    {/* Buy Button */}
                    <Link to="/register" className="w-full mb-4">
                      <Button
                        className="w-full"
                        variant={plan.is_popular ? 'default' : 'outline'}
                        size="sm"
                      >
                        {t('landing.pricing.buyNow')}
                      </Button>
                    </Link>

                    {/* Features */}
                    <div className="text-left space-y-1.5 mt-auto">
                      {Array.isArray(features) && features.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
