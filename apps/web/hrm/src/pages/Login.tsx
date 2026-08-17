/**
 * @CODE-MEMORY
 * Screen: HRM standalone `/login` (PORT-07)
 * UC: HRM auth · brand shell parity portal
 * BR: ADR dual-surface — dark brandShell login only; ops canvases light
 * SRS: N/A theme remaster
 * TechSpec: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §7–§9
 * Purpose: Align HRM login with portal — dark shell + surface card; sharp text; no marketing clutter.
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A
 * Coded: 2026-08-05
 * Callers: App.tsx public route
 * Callees: AuthContext.signIn · HrmApiSyncBanner
 * must_keep: zod form; HrmApiSyncBanner honesty; OAuth helper if wired later
 * SOLID: Auth chrome only
 * LastVerified: verify:xevn:theme-contrast --strict
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A · 2026-08-05
 * change_mode: UPGRADE
 * What: Remove left marketing hero / pale white/70 / feature chip strip / floating trust badge;
 *       use xevn-brand-shell + xevn-dialog-surface parity portal LoginPage
 * Why: Inventory PORT-07 · ADR §9 dark shell login · skill pale ban
 * must_keep: signIn + toast errors; forgot/register links; sync banner
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { HrmApiSyncBanner } from '@/components/layout/HrmApiSyncBanner';
import { toErrorMessage } from '@/lib/apiError';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEn = i18n.language === 'en';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password);
      if (error) {
        toast({
          title: isEn ? 'Login failed' : 'Đăng nhập thất bại',
          description: error.message === 'Invalid login credentials'
            ? (isEn ? 'Invalid email or password' : 'Email hoặc mật khẩu không đúng')
            : toErrorMessage(error, isEn ? 'Unable to sign in' : 'Không thể đăng nhập'),
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: isEn ? 'Login successful' : 'Đăng nhập thành công',
        description: isEn ? 'Welcome back!' : 'Chào mừng bạn quay trở lại!',
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: isEn ? 'Error' : 'Lỗi',
        description: toErrorMessage(error, isEn ? 'An error occurred during login' : 'Đã xảy ra lỗi khi đăng nhập'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="xevn-brand-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="xevn-dialog-surface w-full max-w-md p-8">
        <HrmApiSyncBanner />

        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img
            src="/xevn-logo.png"
            alt="XeVN"
            className="h-16 w-16 object-contain"
            width={64}
            height={64}
          />
          <div>
            <h1 className="xevn-type-title text-foreground">XeVN HRM</h1>
            <p className="xevn-type-label mt-1 text-xevn-textSecondary">
              {isEn ? 'Sign in to manage your workforce' : 'Đăng nhập để quản lý nhân sự'}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xevn-textSecondary">{t('common.email', 'Email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      autoComplete="email"
                      className="h-11 text-foreground"
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
                  <FormLabel className="text-xevn-textSecondary">
                    {isEn ? 'Password' : 'Mật khẩu'}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 pr-10 text-foreground"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xevn-textMuted transition-colors hover:text-foreground"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-11 w-full text-sm font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              {isEn ? 'Sign in' : 'Đăng nhập'}
            </Button>
          </form>
        </Form>

        <div className="mt-6 space-y-3 text-center">
          <Link
            to="/forgot-password"
            className="block text-sm text-xevn-textSecondary transition-colors hover:text-primary"
          >
            {isEn ? 'Forgot password?' : 'Quên mật khẩu?'}
          </Link>
          <p className="text-sm text-xevn-textSecondary">
            {isEn ? "Don't have an account? " : 'Chưa có tài khoản? '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              {isEn ? 'Sign up' : 'Đăng ký ngay'}
            </Link>
          </p>
          <Link
            to="/landing"
            className="inline-flex items-center gap-1.5 text-sm text-xevn-textSecondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {isEn ? 'Back to homepage' : 'Quay lại trang chủ'}
          </Link>
        </div>
      </div>
    </div>
  );
}
