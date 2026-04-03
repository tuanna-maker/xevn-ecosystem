import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2, Users, BarChart3, Shield, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
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
import loginHero from '@/assets/login-hero.png';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const FEATURES = [
  { icon: Users, labelVi: 'Quản lý nhân viên toàn diện', labelEn: 'Comprehensive Employee Management' },
  { icon: Clock, labelVi: 'Chấm công & quản lý ca làm', labelEn: 'Attendance & Shift Management' },
  { icon: BarChart3, labelVi: 'Bảng lương & báo cáo tự động', labelEn: 'Payroll & Automated Reports' },
  { icon: Shield, labelVi: 'Bảo mật & phân quyền chặt chẽ', labelEn: 'Secure Role-Based Access Control' },
];

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signIn, signInWithOAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
            : error.message,
          variant: 'destructive',
        });
        return;
      }
      // Check if user is platform admin
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data: isAdmin } = await supabase.rpc('is_platform_admin', { _user_id: userData.user.id });
        if (isAdmin) {
          toast({
            title: isEn ? 'Login successful' : 'Đăng nhập thành công',
            description: isEn ? 'Redirecting to Platform Admin...' : 'Đang chuyển đến trang Platform Admin...',
          });
          navigate('/platform-admin');
          return;
        }
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
        description: isEn ? 'An error occurred during login' : 'Đã xảy ra lỗi khi đăng nhập',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        toast({
          title: isEn ? 'Login failed' : 'Đăng nhập thất bại',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Feature Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-10 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top — Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/></svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">UniHRM</span>
          </div>

          {/* Center — Hero content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              {isEn ? 'Smart HR Management Platform' : 'Nền tảng quản lý nhân sự thông minh'}
            </h1>
            <p className="text-white/70 text-base xl:text-lg mb-8 leading-relaxed">
              {isEn
                ? 'Streamline your entire HR workflow — from recruitment to payroll — in one unified platform.'
                : 'Tối ưu hóa toàn bộ quy trình nhân sự — từ tuyển dụng đến tính lương — trong một nền tảng duy nhất.'}
            </p>

            {/* Feature list */}
            <div className="space-y-4 mb-10">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <f.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{isEn ? f.labelEn : f.labelVi}</span>
                </div>
              ))}
            </div>

            {/* Dashboard preview */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={loginHero}
                  alt="UniHRM Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span className="text-white text-xs font-medium">
                    {isEn ? '1,000+ companies trust us' : '1.000+ doanh nghiệp tin dùng'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-white/40 text-xs">© 2025 UniHRM. All rights reserved.</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/></svg>
            </div>
            <span className="text-xl font-bold">UniHRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isEn ? 'Sign in' : 'Đăng nhập'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isEn ? 'Sign in to manage your workforce' : 'Đăng nhập để quản lý nhân sự của bạn'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@company.com"
                        autoComplete="email"
                        className="h-11"
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
                    <FormLabel>{isEn ? 'Password' : 'Mật khẩu'}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="h-11 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={isLoading || isGoogleLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isEn ? 'Sign in' : 'Đăng nhập'}
              </Button>
            </form>
          </Form>

          {/* Links */}
          <div className="mt-6 space-y-3 text-center">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors block">
              {isEn ? 'Forgot password?' : 'Quên mật khẩu?'}
            </Link>
            <p className="text-sm text-muted-foreground">
              {isEn ? "Don't have an account? " : 'Chưa có tài khoản? '}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                {isEn ? 'Sign up' : 'Đăng ký ngay'}
              </Link>
            </p>
            <Link to="/landing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {isEn ? 'Back to homepage' : 'Quay lại trang chủ'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
