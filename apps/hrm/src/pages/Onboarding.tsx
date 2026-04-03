import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Building2, Users, ArrowRight, Plus, Loader2, CheckCircle, Star, CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useActiveSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

type CompanyFormValues = {
  name: string;
  industry?: string;
  employee_count?: string;
  phone?: string;
  website?: string;
};

const industryKeys = [
  'it', 'manufacturing', 'trading', 'services', 'finance',
  'realestate', 'education', 'healthcare', 'tourism',
  'logistics', 'construction', 'other'
];

const employeeCountKeys = ['1-10', '11-50', '51-200', '201-500', '500+'];

type OnboardingStep = 'choice' | 'create-company' | 'select-plan' | 'join-company';

export default function Onboarding() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const { user, refreshProfile, refreshMemberships } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('choice');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [createdCompanyId, setCreatedCompanyId] = useState<string | null>(null);
  const [createdCompanyName, setCreatedCompanyName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { data: plans = [] } = useActiveSubscriptionPlans();

  const companySchema = z.object({
    name: z.string().min(2, t('onboarding.companyNameError')).max(200),
    industry: z.string().optional(),
    employee_count: z.string().optional(),
    phone: z.string().max(20).optional(),
    website: z.string().url(t('onboarding.invalidUrl')).optional().or(z.literal('')),
  });

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: '', industry: '', employee_count: '', phone: '', website: '' },
  });

  const handleCreateCompany = async (values: CompanyFormValues) => {
    if (!user) {
      toast({ title: t('common.error'), description: t('onboarding.pleaseLogin'), variant: 'destructive' });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const { data: companyId, error: companyError } = await supabase
        .rpc('create_company_with_owner', {
          p_name: values.name,
          p_industry: values.industry || null,
          p_employee_count: values.employee_count ? parseInt(values.employee_count.split('-')[0]) : 0,
          p_phone: values.phone || null,
          p_website: values.website || null,
          p_user_id: user.id,
          p_user_email: user.email || null,
          p_user_full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        });

      if (companyError) throw companyError;

      setCreatedCompanyId(companyId);
      setCreatedCompanyName(values.name);
      setStep('select-plan');
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({ title: t('common.error'), description: error.message || t('onboarding.cannotCreate'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async () => {
    if (!user || !createdCompanyId) return;

    setIsLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlanId);

      if (plan && createdCompanyId) {
        // Update the subscription with selected plan
        await supabase
          .from('company_subscriptions' as any)
          .update({
            plan_id: plan.id,
            plan_code: plan.code,
            max_employees: plan.max_employees,
            updated_at: new Date().toISOString(),
          } as any)
          .eq('company_id', createdCompanyId);
      }

      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      await refreshProfile();
      await refreshMemberships();

      toast({
        title: t('onboarding.createSuccess'),
        description: t('onboarding.welcomeTo', { name: createdCompanyName }),
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPlan = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      await refreshProfile();
      await refreshMemberships();

      toast({
        title: t('onboarding.createSuccess'),
        description: t('onboarding.welcomeTo', { name: createdCompanyName }),
      });
      navigate('/');
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCompany = async () => {
    if (!user) {
      toast({ title: t('common.error'), description: t('onboarding.pleaseLogin'), variant: 'destructive' });
      navigate('/login');
      return;
    }

    if (!inviteCode.trim()) {
      toast({ title: t('common.error'), description: t('onboarding.pleaseEnterCode'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data: company, error: findError } = await supabase
        .from('companies')
        .select('id, name, code')
        .eq('code', inviteCode.trim().toUpperCase())
        .maybeSingle();

      if (findError) throw findError;
      if (!company) {
        toast({ title: t('common.notFound'), description: t('onboarding.companyNotFound'), variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from('user_company_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('company_id', company.id)
        .maybeSingle();

      if (existing) {
        toast({ title: t('onboarding.alreadyMember'), description: t('onboarding.alreadyMember') });
        navigate('/');
        return;
      }

      const { error: memberError } = await supabase
        .from('user_company_memberships')
        .insert([{
          user_id: user.id,
          company_id: company.id,
          role: 'member',
          is_primary: true,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          status: 'active',
          invited_by: 'Invite Code',
        }]);

      if (memberError) throw memberError;

      await supabase.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id);
      await refreshProfile();
      await refreshMemberships();

      toast({ title: t('onboarding.joinSuccess'), description: t('onboarding.welcomeTo', { name: company.name }) });
      navigate('/');
    } catch (error: any) {
      console.error('Error joining company:', error);
      toast({ title: t('common.error'), description: error.message || t('onboarding.cannotJoin'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold">UniHRM</span>
        </div>

        {/* Step: Choice */}
        {step === 'choice' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">{t('onboarding.welcome')}</h1>
              <p className="text-muted-foreground">{t('onboarding.howToStart')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg border-2" onClick={() => setStep('create-company')}>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('onboarding.createCompany')}</h3>
                  <p className="text-sm text-muted-foreground">{t('onboarding.createCompanyDesc')}</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg border-2" onClick={() => setStep('join-company')}>
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t('onboarding.joinCompany')}</h3>
                  <p className="text-sm text-muted-foreground">{t('onboarding.joinCompanyDesc')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step: Create Company */}
        {step === 'create-company' && (
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />{t('onboarding.createCompany')}</CardTitle>
              <CardDescription>{t('onboarding.createCompanyDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateCompany)} className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('onboarding.companyName')} *</FormLabel>
                      <FormControl><Input placeholder={t('onboarding.companyNamePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="industry" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('onboarding.industry')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder={t('onboarding.selectIndustry')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {industryKeys.map((key) => (
                              <SelectItem key={key} value={t(`onboarding.industries.${key}`)}>{t(`onboarding.industries.${key}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="employee_count" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('onboarding.scale')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder={t('onboarding.employeeCount')} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {employeeCountKeys.map((key) => (
                              <SelectItem key={key} value={key}>{t(`onboarding.employeeCounts.${key}`)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('onboarding.phone')}</FormLabel>
                        <FormControl><Input placeholder="(028) 1234 5678" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="website" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('onboarding.website')}</FormLabel>
                        <FormControl><Input placeholder="https://company.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep('choice')} disabled={isLoading}>{t('onboarding.back')}</Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                      {t('onboarding.createCompanyBtn')}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step: Select Plan */}
        {step === 'select-plan' && (
          <div className="space-y-8 max-w-7xl mx-auto">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">
                {isEn ? 'Choose your plan' : 'Chọn gói dịch vụ'}
              </h2>
              <p className="text-muted-foreground text-lg">
                {isEn
                  ? 'Start with a 14-day free trial. No credit card required.'
                  : 'Bắt đầu với 14 ngày dùng thử miễn phí. Không cần thẻ tín dụng.'}
              </p>
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                {isEn ? '14-day free trial' : '14 ngày dùng thử miễn phí'}
              </Badge>
            </div>

            <div className={`grid grid-cols-1 gap-4 ${
              plans.length <= 3 ? 'md:grid-cols-3 max-w-4xl mx-auto' : plans.length <= 4 ? 'md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-5'
            }`}>
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <Card
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={cn(
                      'cursor-pointer transition-all border-2 relative hover:shadow-lg',
                      isSelected
                        ? 'border-primary shadow-lg ring-2 ring-primary/20 scale-[1.02]'
                        : plan.is_popular
                          ? 'border-amber-400 shadow-md'
                          : 'border-border hover:border-primary/40'
                    )}
                  >
                    {plan.is_popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 text-xs gap-1 px-3 py-0.5 shadow-sm">
                          <Star className="w-3 h-3 fill-white" />
                          {isEn ? 'Popular' : 'Phổ biến'}
                        </Badge>
                      </div>
                    )}
                    <CardContent className="pt-5 pb-4 px-4 space-y-3">
                      {/* Plan Name */}
                      <div className="text-center">
                        <p className="font-bold text-sm">{isEn ? plan.name_en : plan.name_vi}</p>
                      </div>

                      {/* Price */}
                      <div className="text-center">
                        <span className="text-2xl font-bold">{formatPrice(plan.price_monthly)}</span>
                        <span className="text-xs text-muted-foreground">/{isEn ? 'mo' : 'th'}</span>
                      </div>

                      {/* Employee Count */}
                      <p className="text-center text-xs text-muted-foreground">
                        {plan.max_employees} {isEn ? 'employees' : 'nhân viên'}
                      </p>

                      {/* Divider */}
                      <div className="border-t" />

                      {/* Features */}
                      <div className="space-y-2">
                        {(isEn ? plan.features_en : plan.features_vi)?.map((f: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs">
                            <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="text-center pt-1">
                          <Badge className="bg-primary text-primary-foreground">{isEn ? 'Selected' : 'Đã chọn'}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <Button variant="ghost" size="lg" onClick={handleSkipPlan} disabled={isLoading} className="text-muted-foreground">
                {isEn ? 'Skip, use Starter' : 'Bỏ qua, dùng gói Starter'}
              </Button>
              <Button onClick={handleSelectPlan} size="lg" disabled={isLoading || !selectedPlanId} className="min-w-[200px] gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isEn ? 'Start 14-day trial' : 'Bắt đầu dùng thử 14 ngày'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Join Company */}
        {step === 'join-company' && (
          <Card className="shadow-lg max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{t('onboarding.joinCompany')}</CardTitle>
              <CardDescription>{t('onboarding.enterInviteCode')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('onboarding.companyCode')}</label>
                <Input
                  placeholder={t('onboarding.companyCodePlaceholder')}
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground">{t('onboarding.companyCodeHint')}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep('choice')} disabled={isLoading}>{t('onboarding.back')}</Button>
                <Button onClick={handleJoinCompany} className="flex-1" disabled={isLoading || !inviteCode.trim()}>
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  {t('onboarding.joinCompanyBtn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
