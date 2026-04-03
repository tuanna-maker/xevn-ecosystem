import { useState, useMemo } from 'react';
import { AlertTriangle, X, ChevronDown, ChevronUp, Bell, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, differenceInDays, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Insurance {
  id: string;
  employee_code: string;
  employee_name: string;
  employee_avatar: string | null;
  department: string | null;
  health_insurance_number: string | null;
  expiry_date: string | null;
  status: string;
}

interface ExpiringInsuranceAlertProps {
  insuranceList: Insurance[];
  warningDays?: number; // Days before expiry to show warning
  onViewEmployee?: (insurance: Insurance) => void;
}

interface ExpiringItem extends Insurance {
  daysUntilExpiry: number;
  urgencyLevel: 'critical' | 'warning' | 'notice';
}

export function ExpiringInsuranceAlert({
  insuranceList,
  warningDays = 30,
  onViewEmployee,
}: ExpiringInsuranceAlertProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const expiringItems = useMemo(() => {
    const today = new Date();
    const warningDate = addDays(today, warningDays);

    return insuranceList
      .filter((item) => {
        if (!item.health_insurance_number || !item.expiry_date) return false;
        if (item.status === 'expired') return false;
        
        const expiryDate = new Date(item.expiry_date);
        return expiryDate <= warningDate;
      })
      .map((item) => {
        const expiryDate = new Date(item.expiry_date!);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        
        let urgencyLevel: 'critical' | 'warning' | 'notice';
        if (daysUntilExpiry <= 0) {
          urgencyLevel = 'critical';
        } else if (daysUntilExpiry <= 7) {
          urgencyLevel = 'critical';
        } else if (daysUntilExpiry <= 14) {
          urgencyLevel = 'warning';
        } else {
          urgencyLevel = 'notice';
        }

        return {
          ...item,
          daysUntilExpiry,
          urgencyLevel,
        } as ExpiringItem;
      })
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [insuranceList, warningDays]);

  const criticalCount = expiringItems.filter((i) => i.urgencyLevel === 'critical').length;
  const warningCount = expiringItems.filter((i) => i.urgencyLevel === 'warning').length;
  const noticeCount = expiringItems.filter((i) => i.urgencyLevel === 'notice').length;

  if (expiringItems.length === 0 || isDismissed) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getUrgencyBadge = (urgencyLevel: string, daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 0) {
      return (
        <Badge className="bg-red-600 text-white hover:bg-red-600 border-0">
          Đã hết hạn
        </Badge>
      );
    }
    switch (urgencyLevel) {
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">
            Còn {daysUntilExpiry} ngày
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
            Còn {daysUntilExpiry} ngày
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
            Còn {daysUntilExpiry} ngày
          </Badge>
        );
    }
  };

  return (
    <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-1">
              <span>Cảnh báo thẻ BHYT sắp hết hạn</span>
              <div className="flex items-center gap-1.5">
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    {criticalCount} khẩn cấp
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs px-1.5 py-0">
                    {warningCount} cảnh báo
                  </Badge>
                )}
                {noticeCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {noticeCount} lưu ý
                  </Badge>
                )}
              </div>
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              Có {expiringItems.length} nhân viên có thẻ BHYT sẽ hết hạn trong {warningDays} ngày tới. 
              Vui lòng kiểm tra và gia hạn kịp thời.
            </AlertDescription>

            {isExpanded && (
              <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {expiringItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg bg-white dark:bg-background border',
                      item.urgencyLevel === 'critical' && 'border-red-200 dark:border-red-800',
                      item.urgencyLevel === 'warning' && 'border-amber-200 dark:border-amber-800',
                      item.urgencyLevel === 'notice' && 'border-blue-200 dark:border-blue-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={item.employee_avatar || undefined} />
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(item.employee_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{item.employee_name}</span>
                          <span className="text-xs text-muted-foreground">({item.employee_code})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Số BHYT: {item.health_insurance_number}</span>
                          {item.department && (
                            <>
                              <span>•</span>
                              <span>{item.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {item.expiry_date && format(new Date(item.expiry_date), 'dd/MM/yyyy', { locale: vi })}
                          </span>
                        </div>
                        {getUrgencyBadge(item.urgencyLevel, item.daysUntilExpiry)}
                      </div>
                      {onViewEmployee && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => onViewEmployee(item)}
                        >
                          Xem
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 -ml-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Xem chi tiết ({expiringItems.length} nhân viên)
                </>
              )}
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 -mt-1 -mr-1"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
