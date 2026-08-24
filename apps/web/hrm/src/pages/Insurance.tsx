import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Shield,
  Heart,
  Briefcase,
  Pencil,
  Eye,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AddInsuranceDialog } from '@/components/insurance/AddInsuranceDialog';
import { InsuranceImportDialog } from '@/components/insurance/InsuranceImportDialog';
import { ExpiringInsuranceAlert } from '@/components/insurance/ExpiringInsuranceAlert';
import { InsurancePolicyMasterPanel } from '@/components/insurance/InsurancePolicyMasterPanel';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  deleteInsurancePolicyParticipant,
} from '@/integrations/hrmApi';
import { useInsuranceList, type InsuranceListItem } from '@/hooks/useInsuranceList';
import { HrmListLoadBanner } from '@/components/hrm/HrmListLoadBanner';
import {
  HRM_LIST_LOAD_FAILED_SHORT,
  isListFetchFailureEmpty,
} from '@/lib/hrmListLoadFailure';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { formatHrmDateVi } from '@/lib/formatHrmDate';
import {
  aggregateInsuranceSummary,
  calculateInsuranceContribution,
  DEFAULT_INSURANCE_RATES,
  formatInsuranceSummaryValue,
} from '@/lib/insuranceSummary';
import { ACT_HRM_INS_LINK_CAPABILITY } from '@/lib/insuranceParticipantLink';

type Insurance = InsuranceListItem;

const getInsuranceTypes = (t: any) => [
  { key: 'all', label: t('insurance.types.all'), icon: LayoutDashboard, color: 'bg-slate-500' },
  { key: 'bhxh', label: t('insurance.types.bhxh'), icon: Shield, color: 'bg-blue-500' },
  { key: 'bhyt', label: t('insurance.types.bhyt'), icon: Heart, color: 'bg-rose-500' },
  { key: 'bhtn', label: t('insurance.types.bhtn'), icon: Briefcase, color: 'bg-amber-500' },
];

const getStatusFilters = (t: any) => [
  { key: 'all', label: t('insurance.statuses.all') },
  { key: 'active', label: t('insurance.statuses.active') },
  { key: 'pending', label: t('insurance.statuses.pending') },
  { key: 'expired', label: t('insurance.statuses.expired') },
];

const getStatusBadge = (status: string, t: any) => {
  const config: Record<string, { labelKey: string; className: string }> = {
    active: { labelKey: 'insurance.statuses.active', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0' },
    pending: { labelKey: 'insurance.statuses.pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-0' },
    expired: { labelKey: 'insurance.statuses.expired', className: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-0' },
  };
  const { labelKey, className } = config[status] || { labelKey: '', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-0' };
  return <Badge className={className}>{labelKey ? t(labelKey) : status}</Badge>;
};

const formatCurrency = (amount: number | null) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const calculateInsuranceAmount = (
  baseSalary: number | null,
  rate: number | null,
  hasInsurance: boolean,
  defaultRate: number,
) => calculateInsuranceContribution(baseSalary, rate, hasInsurance, defaultRate);

export default function Insurance() {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const insuranceTypes = getInsuranceTypes(t);
  const statusFilters = getStatusFilters(t);

  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    insuranceList,
    totalCount,
    isLoading,
    isLoadingMore,
    isCapped,
    hasMore,
    fetchError,
    refetch,
    loadMore,
  } = useInsuranceList(selectedStatus);

  /** D-HRM-INS-EMPTY-MASK-01: non-2xx with no rows — never treat as true-empty. */
  const loadFailedEmpty = isListFetchFailureEmpty(fetchError, insuranceList.length);
  /** Loaded row count before client type/search filters — for capped honesty. */
  const loadedRowCount = insuranceList.length;

  const deleteMutation = useMutation({
    mutationFn: async (item: Insurance) => {
      if (!currentCompanyId) {
        throw new Error('Thiếu phạm vi công ty');
      }
      const participantId = item.participant_id?.trim();
      if (!participantId) {
        throw new Error(t('insurance.deleteRequiresParticipant'));
      }
      await deleteInsurancePolicyParticipant(participantId, currentCompanyId);
    },
    onSuccess: () => {
      void refetch();
      toast.success(t('insurance.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      setSelectedInsurance(null);
    },
    onError: (error: unknown) => {
      toast.error(`${t('insurance.deleteError')}: ${toErrorMessage(error)}`);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (items: Insurance[]) => {
      if (!currentCompanyId) {
        throw new Error('Thiếu phạm vi công ty');
      }
      const missing = items.filter((item) => !item.participant_id?.trim());
      if (missing.length > 0) {
        throw new Error(t('insurance.deleteRequiresParticipant'));
      }
      await Promise.all(
        items.map((item) =>
          deleteInsurancePolicyParticipant(item.participant_id!, currentCompanyId),
        ),
      );
    },
    onSuccess: () => {
      void refetch();
      toast.success(t('insurance.bulkDeleteSuccess', { count: selectedItems.length }));
      setIsBulkDeleteDialogOpen(false);
      setSelectedItems([]);
    },
    onError: (error: unknown) => {
      toast.error(`${t('insurance.deleteError')}: ${toErrorMessage(error)}`);
    },
  });

  // Filter by type
  const filteredByType = insuranceList.filter((item) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'bhxh') return !!item.social_insurance_number;
    if (selectedType === 'bhyt') return !!item.health_insurance_number;
    if (selectedType === 'bhtn') return !!item.unemployment_insurance_number;
    return true;
  });

  // Filter by search
  const filteredList = filteredByType.filter((item) =>
    item.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (item.social_insurance_number?.includes(searchQuery) ?? false) ||
    (item.health_insurance_number?.includes(searchQuery) ?? false) ||
    (item.unemployment_insurance_number?.includes(searchQuery) ?? false)
  );

  // Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, endIndex);

  const typeCounts = insuranceTypes.map((type) => {
    let count: number | null = 0;
    /** Subtype chips from loaded sample only — never invent full-scope counts when capped. */
    let countIsPartial = false;
    if (loadFailedEmpty) {
      count = null;
    } else if (type.key === 'all') {
      // Honest API total (page-1 response) — not loaded.length
      count =
        selectedStatus === 'all' && totalCount > 0
          ? totalCount
          : insuranceList.length;
    } else if (type.key === 'bhxh') {
      count = insuranceList.filter((i) => !!i.social_insurance_number).length;
      countIsPartial = isCapped;
    } else if (type.key === 'bhyt') {
      count = insuranceList.filter((i) => !!i.health_insurance_number).length;
      countIsPartial = isCapped;
    } else if (type.key === 'bhtn') {
      count = insuranceList.filter((i) => !!i.unemployment_insurance_number).length;
      countIsPartial = isCapped;
    }
    return { ...type, count, countIsPartial };
  });

  const formatSummaryOrError = (amount: number, count: number) => {
    if (loadFailedEmpty) return t('insurance.loadFailedShort', HRM_LIST_LOAD_FAILED_SHORT);
    if (isLoading) return '…';
    // No summary endpoint — amounts are from loaded rows only (label below when capped)
    return formatInsuranceSummaryValue(amount, count, formatCurrency);
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedList.map((c) => c.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleExport = () => {
    if (filteredList.length === 0) {
      toast.error(t('insurance.noExportData'));
      return;
    }

    const exportData = filteredList.map((item) => ({
      [t('insurance.table.employeeCode')]: item.employee_code,
      [t('insurance.table.employeeName')]: item.employee_name,
      [t('insurance.table.department')]: item.department || '',
      [t('insurance.table.socialInsurance')]: item.social_insurance_number || '',
      [t('insurance.table.healthInsurance')]: item.health_insurance_number || '',
      [t('insurance.table.unemploymentInsurance')]: item.unemployment_insurance_number || '',
      [t('insurance.export.socialRate')]: item.social_insurance_rate || '',
      [t('insurance.export.healthRate')]: item.health_insurance_rate || '',
      [t('insurance.export.unemploymentRate')]: item.unemployment_insurance_rate || '',
      [t('insurance.table.baseSalary')]: item.base_salary || '',
      [t('insurance.export.socialAmount')]: calculateInsuranceAmount(
        item.base_salary,
        item.social_insurance_rate,
        !!item.social_insurance_number,
        DEFAULT_INSURANCE_RATES.social,
      ),
      [t('insurance.export.healthAmount')]: calculateInsuranceAmount(
        item.base_salary,
        item.health_insurance_rate,
        !!item.health_insurance_number,
        DEFAULT_INSURANCE_RATES.health,
      ),
      [t('insurance.export.unemploymentAmount')]: calculateInsuranceAmount(
        item.base_salary,
        item.unemployment_insurance_rate,
        !!item.unemployment_insurance_number,
        DEFAULT_INSURANCE_RATES.unemployment,
      ),
      [t('insurance.table.effectiveDate')]: item.effective_date ? format(new Date(item.effective_date), 'dd/MM/yyyy') : '',
      [t('insurance.table.expiryDate')]: item.expiry_date ? format(new Date(item.expiry_date), 'dd/MM/yyyy') : '',
      [t('insurance.table.status')]: t(`insurance.statuses.${item.status}`) || item.status,
      [t('insurance.export.notes')]: item.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('insurance.export.sheetName'));
    XLSX.writeFile(wb, `insurance_${format(new Date(), 'ddMMyyyy')}.xlsx`);
    toast.success(t('insurance.exportSuccess'));
  };

  const handleOpenView = (item: Insurance) => {
    setSelectedInsurance(item);
    setIsViewDialogOpen(true);
  };

  const handleOpenEdit = (item: Insurance) => {
    setSelectedInsurance(item);
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (item: Insurance) => {
    setSelectedInsurance(item);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const insuranceSummary = aggregateInsuranceSummary(filteredList);

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl md:text-2xl font-bold text-xevn-text px-4 md:px-6 pt-4 pb-2">Bảo hiểm (Insurance)</h1>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)} data-capability={ACT_HRM_INS_LINK_CAPABILITY}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('insurance.addInsurance')}</span>
            <span className="sm:hidden">+</span>
          </Button>
          {selectedItems.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsBulkDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('insurance.bulkDelete', { count: selectedItems.length })}</span>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('insurance.search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* E3 — policy master CRUD + insurer/type pickers (AC-INS-*) */}
      <div className="px-4 md:px-6 pt-4">
        <InsurancePolicyMasterPanel />
      </div>

      {/* D-HRM-INS-EMPTY-MASK-01: error / retry — never silent empty on non-2xx */}
      {(fetchError || isLoading || isLoadingMore) && (
        <div className="px-4 md:px-6 pt-4 space-y-2">
          <HrmListLoadBanner
            isLoading={isLoading || isLoadingMore}
            loadFailed={Boolean(fetchError)}
            errorMessage={fetchError}
            loadingMessage={
              isLoadingMore && !isLoading
                ? t('insurance.loadingMore', 'Đang tải thêm bản ghi bảo hiểm…')
                : t('insurance.loadingApi', 'Đang tải dữ liệu bảo hiểm…')
            }
          />
          {fetchError ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              {t('common.retry', 'Thử lại')}
            </Button>
          ) : null}
        </div>
      )}

      {/* P1-HRM-SCALE-FE-W2-INS-LIST: capped first page — honest total + explicit load more */}
      {!loadFailedEmpty && !isLoading && isCapped && totalCount > 0 ? (
        <div className="px-4 md:px-6 pt-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
          <p className="text-xs text-muted-foreground">
            {t('insurance.cappedHint', {
              loaded: loadedRowCount,
              total: totalCount,
              defaultValue: `Hiển thị ${loadedRowCount} / ${totalCount} bản ghi — tổng từ API; số liệu BHXH/BHYT/BHTN theo bản ghi đã tải`,
            })}
          </p>
          {hasMore ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              disabled={isLoadingMore}
              onClick={() => void loadMore()}
            >
              {isLoadingMore ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {t('insurance.loadMore', 'Tải thêm')}
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Expiring Insurance Alert */}
      {!loadFailedEmpty ? (
        <div className="px-4 md:px-6 pt-4">
          <ExpiringInsuranceAlert
            insuranceList={insuranceList}
            warningDays={30}
            onViewEmployee={(item) => handleOpenView(item as Insurance)}
          />
        </div>
      ) : null}

      {/* Summary Cards — amounts from loaded rows only when capped (no summary endpoint) */}
      <div className="px-4 md:px-6 py-3 border-b bg-muted/30">
        {isCapped && !loadFailedEmpty && !isLoading ? (
          <p className="text-[11px] text-muted-foreground mb-2">
            {t('insurance.summary.partialNote', {
              loaded: loadedRowCount,
              total: totalCount,
              defaultValue: `Số tiền dưới đây tính trên ${loadedRowCount} bản ghi đã tải (tổng API ${totalCount}) — chưa có endpoint summary`,
            })}
          </p>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('insurance.summary.totalBHXH')}</p>
              <p className="font-semibold">
                {formatSummaryOrError(insuranceSummary.bhxhAmount, insuranceSummary.bhxhCount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <div className="p-2 bg-rose-100 rounded-lg">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('insurance.summary.totalBHYT')}</p>
              <p className="font-semibold">
                {formatSummaryOrError(insuranceSummary.bhytAmount, insuranceSummary.bhytCount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('insurance.summary.totalBHTN')}</p>
              <p className="font-semibold">
                {formatSummaryOrError(insuranceSummary.bhtnAmount, insuranceSummary.bhtnCount)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Calculator className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('insurance.summary.total')}</p>
              <p className="font-semibold">
                {loadFailedEmpty
                  ? t('insurance.loadFailedShort', HRM_LIST_LOAD_FAILED_SHORT)
                  : isLoading
                    ? '…'
                    : insuranceSummary.hasFinancialData
                      ? formatCurrency(insuranceSummary.totalAmount)
                      : formatInsuranceSummaryValue(
                          0,
                          insuranceSummary.participantCount,
                          formatCurrency,
                        )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Menu with Icons */}
      <div className="px-4 md:px-6 py-3 border-b bg-card">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {typeCounts.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.key;
            return (
              <button
                key={type.key}
                onClick={() => {
                  setSelectedType(type.key);
                  setCurrentPage(1);
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className={cn('w-6 h-6 rounded flex items-center justify-center text-white', type.color)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{type.label}</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-xs',
                  isSelected ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                )}>
                  {type.count == null
                    ? '—'
                    : type.countIsPartial
                      ? `~${type.count}`
                      : type.count}
                </span>
              </button>
            );
          })}

          {/* Status filter */}
          <div className="h-6 w-px bg-border mx-2" />
          {statusFilters.map((status) => (
            <button
              key={status.key}
              onClick={() => {
                setSelectedStatus(status.key);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedStatus === status.key
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedList.length > 0 &&
                    selectedItems.length === paginatedList.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>{t('insurance.table.employeeCode')}</TableHead>
              <TableHead>{t('insurance.table.employeeName')}</TableHead>
              <TableHead>{t('insurance.table.department')}</TableHead>
              <TableHead>{t('insurance.table.socialInsurance')}</TableHead>
              <TableHead>{t('insurance.table.healthInsurance')}</TableHead>
              <TableHead>{t('insurance.table.baseSalary')}</TableHead>
              <TableHead>{t('insurance.table.totalInsurance')}</TableHead>
              <TableHead>{t('insurance.table.effectiveDate')}</TableHead>
              <TableHead>{t('insurance.table.status')}</TableHead>
              <TableHead className="w-28">{t('insurance.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
               <TableCell colSpan={11} className="text-center py-10">
                   {t('insurance.loading')}
                 </TableCell>
               </TableRow>
             ) : loadFailedEmpty ? (
               <TableRow>
                 <TableCell colSpan={11} className="text-center py-10 space-y-3">
                   <p className="text-sm text-amber-900">
                     {fetchError || t('insurance.loadFailed', 'Không tải được danh sách bảo hiểm')}
                   </p>
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     className="gap-2"
                     onClick={() => void refetch()}
                   >
                     <RefreshCw className="h-4 w-4" />
                     {t('common.retry', 'Thử lại')}
                   </Button>
                </TableCell>
              </TableRow>
             ) : paginatedList.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={11} className="text-center py-10">
                   {t('insurance.noData')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedList.map((item) => {
                const totalInsurance =
                  calculateInsuranceAmount(
                    item.base_salary,
                    item.social_insurance_rate,
                    !!item.social_insurance_number,
                    DEFAULT_INSURANCE_RATES.social,
                  ) +
                  calculateInsuranceAmount(
                    item.base_salary,
                    item.health_insurance_rate,
                    !!item.health_insurance_number,
                    DEFAULT_INSURANCE_RATES.health,
                  ) +
                  calculateInsuranceAmount(
                    item.base_salary,
                    item.unemployment_insurance_rate,
                    !!item.unemployment_insurance_number,
                    DEFAULT_INSURANCE_RATES.unemployment,
                  );

                return (
                  <TableRow 
                    key={item.id}
                    className={cn(
                      selectedItems.includes(item.id) && 'bg-primary/5'
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={() => toggleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {item.employee_code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={item.employee_avatar || undefined} />
                          <AvatarFallback className="bg-amber-100  hidden  text-xs">
                            {getInitials(item.employee_name)}
                          </AvatarFallback>
                        </Avatar>
                        {item.employee_id ? (
                          <Link
                            to={hrmPathWithEmbedSearch(`/employees/${item.employee_id}`)}
                            className="font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.employee_name}
                          </Link>
                        ) : (
                          <span className="font-medium">{item.employee_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.department || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.social_insurance_number || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.health_insurance_number || '-'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.base_salary)}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatCurrency(totalInsurance)}
                    </TableCell>
                    <TableCell>
                      {formatHrmDateVi(item.effective_date)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, t)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenView(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleOpenDelete(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t bg-card">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t('insurance.showing', { from: filteredList.length > 0 ? startIndex + 1 : 0, to: Math.min(endIndex, filteredList.length), total: filteredList.length })}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('insurance.rowsPerPage')}</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {getPageNumbers().map((page, index) => 
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            )
          )}
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add Insurance Dialog */}
      <AddInsuranceDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) void refetch();
        }} 
      />

      {/* Edit Insurance Dialog */}
      <AddInsuranceDialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) void refetch();
        }}
        editingInsurance={selectedInsurance}
      />

      {/* Import Dialog */}
      <InsuranceImportDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('insurance.viewTitle')}</DialogTitle>
          </DialogHeader>
          {selectedInsurance && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('insurance.employeeCodeLabel')}</Label>
                  <p className="font-medium">{selectedInsurance.employee_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('insurance.employeeNameLabel')}</Label>
                  {selectedInsurance.employee_id ? (
                    <Link
                      to={hrmPathWithEmbedSearch(`/employees/${selectedInsurance.employee_id}`)}
                      className="font-medium text-primary hover:underline"
                    >
                      {selectedInsurance.employee_name}
                    </Link>
                  ) : (
                    <p className="font-medium">{selectedInsurance.employee_name}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('insurance.departmentLabel')}</Label>
                <p className="font-medium">{selectedInsurance.department || '-'}</p>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t('insurance.insuranceBookInfo')}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('insurance.table.socialInsurance')}</Label>
                    <p className="font-medium font-mono">{selectedInsurance.social_insurance_number || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('insurance.table.healthInsurance')}</Label>
                    <p className="font-medium font-mono">{selectedInsurance.health_insurance_number || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('insurance.types.bhtn')}</Label>
                    <p className="font-medium font-mono">{selectedInsurance.unemployment_insurance_number || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t('insurance.contributionInfo')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('insurance.baseSalaryLabel')}</Label>
                    <p className="font-medium">{formatCurrency(selectedInsurance.base_salary)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('insurance.statusLabel')}</Label>
                    <div className="mt-1">{getStatusBadge(selectedInsurance.status, t)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600">BHXH ({selectedInsurance.social_insurance_rate || 0}%)</p>
                    <p className="font-semibold text-blue-700">
                      {formatCurrency(
                        calculateInsuranceAmount(
                          selectedInsurance.base_salary,
                          selectedInsurance.social_insurance_rate,
                          !!selectedInsurance.social_insurance_number,
                          DEFAULT_INSURANCE_RATES.social,
                        ),
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg">
                    <p className="text-xs text-rose-600">BHYT ({selectedInsurance.health_insurance_rate || 0}%)</p>
                    <p className="font-semibold text-rose-700">
                      {formatCurrency(
                        calculateInsuranceContribution(
                          selectedInsurance.base_salary,
                          selectedInsurance.health_insurance_rate,
                          !!selectedInsurance.health_insurance_number,
                          DEFAULT_INSURANCE_RATES.health,
                        ),
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600">BHTN ({selectedInsurance.unemployment_insurance_rate || 0}%)</p>
                    <p className="font-semibold  hidden ">
                      {formatCurrency(
                        calculateInsuranceContribution(
                          selectedInsurance.base_salary,
                          selectedInsurance.unemployment_insurance_rate,
                          !!selectedInsurance.unemployment_insurance_number,
                          DEFAULT_INSURANCE_RATES.unemployment,
                        ),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label className="text-muted-foreground">{t('insurance.effectiveDateLabel')}</Label>
                  <p className="font-medium">
                    {selectedInsurance.effective_date 
                      ? format(new Date(selectedInsurance.effective_date), 'dd/MM/yyyy') 
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('insurance.expiryDateLabel')}</Label>
                  <p className="font-medium">
                    {selectedInsurance.expiry_date 
                      ? format(new Date(selectedInsurance.expiry_date), 'dd/MM/yyyy') 
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedInsurance.notes && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">{t('insurance.notesLabel')}</Label>
                  <p className="font-medium">{selectedInsurance.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('insurance.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('insurance.deleteConfirmDesc', { name: selectedInsurance?.employee_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('insurance.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedInsurance && deleteMutation.mutate(selectedInsurance)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('insurance.deleteInsurance')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('insurance.confirmBulkDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('insurance.bulkDeleteConfirmDesc', { count: selectedItems.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('insurance.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const items = insuranceList.filter((row) => selectedItems.includes(row.id));
                bulkDeleteMutation.mutate(items);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('insurance.deleteRecords', { count: selectedItems.length })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
