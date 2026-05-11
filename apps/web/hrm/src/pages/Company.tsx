import { useTranslation } from 'react-i18next';
import {
  Crown,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyManagement } from '@/components/company/CompanyManagement';
import { CompanyMembersManagement } from '@/components/company/CompanyMembersManagement';
import { DepartmentManagement } from '@/components/company/DepartmentManagement';

export default function Company() {
  const { t } = useTranslation();
  const { memberships, currentCompanyId } = useAuth();
  const currentMembership = memberships.find(m => m.company_id === currentCompanyId);
  const currentCompany = currentMembership?.company;
  const employeeCount = 0; // Will be computed from employees
  const usagePercent = (employeeCount / 100) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('company.title')}
        subtitle={t('company.subtitle')}
      />

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="companies" className="text-xs sm:text-sm">{t('company.management')}</TabsTrigger>
          <TabsTrigger value="members" className="text-xs sm:text-sm">{t('company.members')}</TabsTrigger>
          <TabsTrigger value="departments" className="text-xs sm:text-sm">{t('company.departments')}</TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs sm:text-sm">{t('company.subscription')}</TabsTrigger>
        </TabsList>

        {/* Companies Management Tab */}
        <TabsContent value="companies" className="space-y-6">
          <CompanyManagement />
        </TabsContent>

        {/* Members Management Tab */}
        <TabsContent value="members" className="space-y-6">
          <CompanyMembersManagement />
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-4">
          <DepartmentManagement />
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Plan */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-warning" />
                  {t('company.subscription')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6 p-4 bg-primary/5 rounded-lg">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">{currentMembership?.role || 'Free'}</h3>
                    <p className="text-muted-foreground">{t('company.plan')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t('company.planExpiry')}</p>
                    <p className="font-semibold">—</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('nav.employees')}</span>
                      <span>{employeeCount} / 100</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{t('nav.employees')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{t('nav.recruitment')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{t('nav.attendance')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{t('nav.payroll')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{t('nav.reports')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-sm">{t('common.support')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upgrade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border-2 border-primary rounded-lg">
                  <h4 className="font-bold text-lg mb-1">Enterprise</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unlimited employees, full customization
                  </p>
                  <p className="text-2xl font-bold text-primary">Contact</p>
                </div>
                <Button className="w-full">Upgrade</Button>
                <p className="text-xs text-center text-muted-foreground">
                  sales@unihrm.vn
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}