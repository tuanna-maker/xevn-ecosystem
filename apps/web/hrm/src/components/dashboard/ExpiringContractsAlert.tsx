import { useTranslation } from 'react-i18next';
import { formatHrmDateVi, parseHrmDateOnly } from '@/lib/formatHrmDate';
import { useExpiringContractsDashboard } from '@/hooks/useExpiringContractsDashboard';
import { AlertTriangle, FileText, Calendar, ExternalLink, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { resolveContractTypeDisplayLabel } from '@/lib/labelMaps';

interface ExpiringContract {
  id: string;
  contract_code: string;
  employee_id?: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  contract_type: string;
  expiry_date: string;
  status: string;
  source: 'employee_contracts' | 'contracts';
}

export function ExpiringContractsAlert() {
  const { t } = useTranslation();

  const { data: expiringRows = [], isLoading } = useExpiringContractsDashboard();

  const expiringContracts = expiringRows.map((row): ExpiringContract => ({
    id: row.id,
    contract_code: row.employee_code
      ? `${row.employee_code}-HD`
      : `HD-${row.id.slice(0, 8).toUpperCase()}`,
    employee_id: row.employee_id,
    employee_name: row.employee_name?.trim() || t('expiringContracts.unknown'),
    employee_avatar: null,
    department: row.department ?? null,
    contract_type: row.contract_type,
    expiry_date: row.end_date,
    status: row.status,
    source: 'employee_contracts',
  }));

  const getDaysRemaining = (expiryDate: string) => {
    const expiry = parseHrmDateOnly(expiryDate);
    if (!expiry) return 0;
    return differenceInDays(expiry, new Date());
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    if (days <= 14) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  };

  const getUrgencyLabel = (days: number) => {
    if (days <= 0) return t('expiringContracts.expiresToday');
    if (days === 1) return t('expiringContracts.daysRemaining_one');
    return t('expiringContracts.daysRemaining', { count: days });
  };

  if (isLoading) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-amber-100 dark:bg-amber-900 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-amber-100 dark:bg-amber-900 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expiringContracts.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t('expiringContracts.title')}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t('expiringContracts.subtitle', { count: expiringContracts.length })}
              </p>
            </div>
          </div>
          <Link to={hrmPathWithEmbedSearch('/contracts')}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              {t('expiringContracts.viewAll')}
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {expiringContracts.slice(0, 5).map((contract) => {
            const daysRemaining = getDaysRemaining(contract.expiry_date);
            const detailPath = hrmPathWithEmbedSearch(
              contract.employee_id ? `/employees/${contract.employee_id}` : '/contracts',
            );
            return (
              <Link key={`${contract.source}-${contract.id}`} to={detailPath} className="block">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-background/40 border border-amber-100 dark:border-amber-800/50 hover:bg-white dark:hover:bg-background/60 transition-colors cursor-pointer">
                  <Avatar className="w-10 h-10 border-2 border-amber-200 dark:border-amber-700">
                    <AvatarImage src={contract.employee_avatar || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-sm font-medium">
                      {contract.employee_name.split(' ').pop()?.charAt(0) || 'N'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{contract.employee_name}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {contract.contract_code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>{resolveContractTypeDisplayLabel(contract.contract_type)}</span>
                      {contract.department && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{contract.department}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge className={`${getUrgencyColor(daysRemaining)} text-xs font-medium`}>
                      {getUrgencyLabel(daysRemaining)}
                    </Badge>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground justify-end">
                      <Calendar className="w-3 h-3" />
                      {formatHrmDateVi(contract.expiry_date)}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {expiringContracts.length > 5 && (
          <div className="mt-3 text-center">
            <Link to={hrmPathWithEmbedSearch('/contracts')}>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                {t('expiringContracts.viewMore', { count: expiringContracts.length - 5 })}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
