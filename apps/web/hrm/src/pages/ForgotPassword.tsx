import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Lỗi',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setIsEmailSent(true);
      toast({
        title: 'Email đã được gửi',
        description: 'Vui lòng kiểm tra hộp thư của bạn để đặt lại mật khẩu.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      toast({
        title: 'Lỗi',
        description: 'Đã xảy ra lỗi khi gửi email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
            <CardDescription>
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEmailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Kiểm tra email của bạn</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến email{' '}
                    <span className="font-medium">{form.getValues('email')}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEmailSent(false)}
                >
                  Gửi lại email
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Gửi link đặt lại mật khẩu
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
