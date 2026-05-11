import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Building2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const useRegisterSchema = () => {
  const { t } = useTranslation();
  return z.object({
    fullName: z.string().min(2, t('register.errors.fullNameMin')).max(100),
    email: z.string().email(t('register.errors.emailInvalid')),
    password: z.string().min(6, t('register.errors.passwordMin')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.errors.confirmMismatch'),
    path: ['confirmPassword'],
  });
};

type RegisterFormValues = z.infer<ReturnType<typeof useRegisterSchema>>;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const registerSchema = useRegisterSchema();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(values.email, values.password, values.fullName);
      
      if (error) {
        toast({
          title: t('register.errors.failed'),
          description: error.message === 'User already registered'
            ? t('register.errors.alreadyRegistered')
            : error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('register.errors.success'),
        description: t('register.errors.successDesc'),
      });
      
      navigate('/onboarding');
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: t('register.errors.error'),
        description: t('register.errors.genericError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };


  const features = [
    t('register.features.employees'),
    t('register.features.attendance'),
    t('register.features.recruitment'),
    t('register.features.reports'),
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">UniHRM</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">
            {t('register.heroTitle')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('register.heroSubtitle')}
          </p>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">UniHRM</span>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('register.title')}</CardTitle>
              <CardDescription>{t('register.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.fullName')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('register.fullNamePlaceholder')}
                            autoComplete="name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.email')}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('register.emailPlaceholder')}
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.password')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('register.confirmPassword')}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    {t('register.submit')}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="text-sm text-center text-muted-foreground">
                {t('register.hasAccount')}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('register.login')}
                </Link>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {t('register.terms')}{' '}
                <a href="#" className="underline">{t('register.tos')}</a>
                {' '}{t('register.and')}{' '}
                <a href="#" className="underline">{t('register.privacy')}</a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
