import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Users,
  Save,
  Image,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { languages } from '@/i18n';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { RolesPermissionsTab } from '@/components/settings/RolesPermissionsTab';
import { SubscriptionManagement } from '@/components/settings/SubscriptionManagement';

const currencies = [
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', flag: '🇻🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [currency, setCurrency] = useState('VND');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
  };

  const changeCurrency = (code: string) => {
    setCurrency(code);
    localStorage.setItem('currency', code);
    toast.success(t('common.saved'));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1 w-full max-w-4xl">
          <TabsTrigger value="account" className="gap-1.5 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.account')}</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5 text-xs sm:text-sm">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.branding') || 'Branding'}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.notifications')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.security')}</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.roles')}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5 text-xs sm:text-sm">
            <SettingsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.system')}</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-1.5 text-xs sm:text-sm">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">{t('settings.subscription')}</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.account')}</CardTitle>
              <CardDescription>
                {t('settings.accountDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                  AD
                </div>
                <div>
                  <Button variant="outline" size="sm">{t('common.upload')}</Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG max 2MB
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('employees.fullName')}</Label>
                  <Input defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label>{t('employees.email')}</Label>
                  <Input defaultValue="admin@company.vn" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>{t('employees.phone')}</Label>
                  <Input defaultValue="0901234567" />
                </div>
                <div className="space-y-2">
                  <Label>{t('employees.position')}</Label>
                  <Input defaultValue="Admin" readOnly />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-4">
          <BrandingSettings />
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications')}</CardTitle>
              <CardDescription>
                {t('settings.notificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.emailNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.emailNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.leaveNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.leaveNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.recruitmentNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.recruitmentNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.payrollNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.payrollNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.attendanceNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.attendanceNotificationsDesc')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.security')}</CardTitle>
              <CardDescription>
                {t('settings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('common.currentPassword')}</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>{t('common.newPassword')}</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>{t('common.confirmPassword')}</Label>
                <Input type="password" />
              </div>
              <Button>{t('common.save')}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('common.twoFactorAuth')}</CardTitle>
              <CardDescription>
                {t('settings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS</p>
                  <p className="text-sm text-muted-foreground">
                    {t('common.smsVerification')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Settings */}
        <TabsContent value="roles" className="space-y-4">
          <RolesPermissionsTab />
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.system')}</CardTitle>
              <CardDescription>
                {t('settings.systemDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select value={i18n.language} onValueChange={changeLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.timezone')}</Label>
                  <Select defaultValue="asia-ho-chi-minh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-ho-chi-minh">
                        (UTC+7) Ho Chi Minh
                      </SelectItem>
                      <SelectItem value="asia-bangkok">
                        (UTC+7) Bangkok
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.dateFormat')}</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('common.currency')}
                  </Label>
                  <Select value={currency} onValueChange={changeCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <span className="flex items-center gap-2">
                            <span>{curr.flag}</span>
                            <span>{curr.code}</span>
                            <span className="text-muted-foreground">({curr.symbol})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
