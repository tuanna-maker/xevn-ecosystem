import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  CalendarIcon,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ViDatePickerField } from '@/components/ui/ViDatePickerField';
import { formatIsoDateToViDisplay } from '@xevn/ui';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  fetchCompanyUnitsForHrm,
  resolveIndustryDisplay,
} from '@/integrations/tenantScopeApi';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import {
  enrichHrmCompaniesWithWorkforceCounts,
  formatHrmEmployeeCount,
  sumKnownEmployeeCounts,
  type HrmCompanyRowWithWorkforce,
} from '@/lib/hrmCompanyEmployeeCount';

/**
 * @CODE-MEMORY
 * Screen:     HRM → Công ty / CompanyManagement
 * UC:         UC-HRM-CO-01 / FR-HRM-CO-IND-01 · FR-HRM-CO-HC-01 · UC-HRM-ORG-COMPANY · UC-HRM-03
 * BR:         BR-UX-DATE-02 · VAL-CO-FOUND-01..02 · AC-FID-CO-D01 · BR-INT-05
 * SRS:        docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md §3 · HRM_MENU_DATA_LINKAGE_MATRIX §2.2 `/company`
 * TechSpec:   company founded_date alias ↔ XBOS established_at DATE (ADR) · GET /employees/summary
 * ADR:        docs/architecture/ADR-HRM-DATE-WIRE-YYYY-MM-DD-20260722.md
 * BA-D:       docs/qa/evidence/fid-p0-ba-data-01-20260722.md (founded SoT = legal entity)
 * Purpose:    Quản lý hồ sơ công ty — Ngày thành lập nhập/hiển thị dd/MM/yyyy + Calendar mở trong Dialog;
 *             headcount theo operating slug (không LE UUID).
 * WorkItem:   FID-P0-FE-DATE-01
 * Coded:      2026-07-22
 * Callers:    Settings / Companies route
 * Callees:    ViDatePickerField · fetchCompanyUnitsForHrm · enrichHrmCompaniesWithWorkforceCounts
 * must_keep:  Form founded_date = ISO yyyy-MM-dd hoặc ''; không timezone shift new Date(iso);
 *             Persist legal PUT = FID-P0-FE-CO-BIND-01 — cấm toast giả «đã lưu» khi chưa API;
 *             CO-BIND tax/MST; OU filter JWT không mutate; dashboard summary path unchanged
 * SOLID:      Form field dùng SoT date picker — không Popover ad-hoc trong Dialog
 * LastVerified: docs/qa/evidence/dev-fe-hrm-co-emp-count-01-20260727.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FID-P0-FE-DATE-01
 * change_mode: FIX
 * What: founded_date → ViDatePickerField (ISO + Calendar modal); display formatIsoDateToViDisplay;
 *       onSubmit không toast success giả — defer persist sang FID-P0-FE-CO-BIND-01
 * Why: Sponsor picker khó mở; BA-D H1 bind null + toast-only save
 * must_keep: Payload alias founded_date = YYYY-MM-DD; MST/email/phone rebind = CO-BIND parallel
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-CO-EMP-COUNT-FE-01
 * change_mode: FIX
 * What: Sau group-member-units, enrich employee_count từ employees/summary theo operating slug;
 *       UI «—» khi null; card Tổng NV = sumKnown (không `|| 0` trên unknown).
 * Why: Mapper hard-null + `|| 0` → luôn 0; dashboard đúng ~1100 qua summary
 * must_keep: CO-BIND legal enrich; không dùng LE UUID làm company_id count
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-CO-INDUSTRY-FE-01 (alias D-HRM-CO-01-INDUSTRY-FE-01)
 * change_mode: FIX
 * What: Cột/badge Ngành nghề dùng resolveIndustryDisplay — chặn raw holding/subsidiary;
 *       SoT industry từ tenantScopeApi (business_lines), không entity_type.
 * Why: UI hiện `subsidiary` trong cột ngành nghề
 * must_keep: CO-EMP-COUNT enrich; CO-BIND tax/founded; OU filter
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: D-HRM-CO-01-INDUSTRY-FE-01
 * change_mode: FIX
 * What: List/detail «Ngành nghề» = resolveIndustryDisplay; empty = «—» (AC-CO-IND-03)
 * Why: Matrix UC-HRM-CO-01 planned closure — industry dictionary bind only
 * must_keep: enrichHrmCompaniesWithWorkforceCounts · formatHrmEmployeeCount · card Tổng NV
 * LastVerified: docs/qa/evidence/d-hrm-co-01-industry-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: D-HRM-CO-01-FE-HEADCOUNT-BIND-01
 * change_mode: UPGRADE
 * What: Card Tổng NV = summary.total (main); testid co-total-headcount / co-row-{slug}-count|industry
 * Why: UI-CO-COMPANY-HEADCOUNT · AC-CO-EMP-01..02 · display-ready BE by_company
 * must_keep: «—» on HRM fail; industry resolveIndustryDisplay; CO-BIND legal
 */

type Company = HrmCompanyRowWithWorkforce;

const companyFormSchema = z.object({
  name: z.string().min(1, 'Required').max(200),
  code: z.string().max(50).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  tax_code: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().max(100).optional(),
  employee_count: z.number().min(0).optional(),
  /** ISO yyyy-MM-dd — ViDatePickerField; empty = unset */
  founded_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')
    .optional()
    .or(z.literal('')),
  description: z.string().max(2000).optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

import { VSIC_LEVEL_1_INDUSTRIES } from '@/lib/vsic';

export function CompanyManagement() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rollupHeadcount, setRollupHeadcount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      code: '',
      logo_url: '',
      address: '',
      phone: '',
      email: '',
      tax_code: '',
      website: '',
      industry: '',
      employee_count: 0,
      founded_date: '',
      description: '',
      status: 'active',
    },
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const portalEmbed =
        typeof window !== 'undefined' && getHrmPortalMode(window.location.search);
      if (portalEmbed) {
        // CO-BIND legal profile first; workforce counts by operating slug (not LE UUID).
        const rows = await fetchCompanyUnitsForHrm();
        const { companies: withCounts, rollupTotal } =
          await enrichHrmCompaniesWithWorkforceCounts(rows);
        setCompanies(withCounts);
        setRollupHeadcount(rollupTotal);
        return;
      }
      setCompanies([]);
      setRollupHeadcount(null);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: t('common.error'),
        description: t('company.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: companies.length,
    active: companies.filter((c) => c.status === 'active').length,
    inactive: companies.filter((c) => c.status === 'inactive').length,
    /** AC-CO-EMP-01: API `total` on main summary; fallback sum known row counts only when rollup missing */
    totalEmployees:
      rollupHeadcount != null && !Number.isNaN(rollupHeadcount)
        ? rollupHeadcount
        : sumKnownEmployeeCounts(companies),
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    form.reset({
      name: '',
      code: '',
      logo_url: '',
      address: '',
      phone: '',
      email: '',
      tax_code: '',
      website: '',
      industry: '',
      employee_count: 0,
      founded_date: '',
      description: '',
      status: 'active',
    });
    setIsDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    form.reset({
      name: company.name,
      code: company.code || '',
      logo_url: company.logo_url || '',
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      tax_code: company.tax_code || '',
      website: company.website || '',
      industry: company.industry || '',
      employee_count: company.employee_count || 0,
      founded_date: company.founded_date
        ? String(company.founded_date).slice(0, 10)
        : '',
      description: company.description || '',
      status: company.status as 'active' | 'inactive' | 'suspended',
    });
    setIsDialogOpen(true);
  };

  const handleViewCompany = (company: Company) => {
    setViewingCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingCompanyId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompanyId) return;

    try {
      setCompanies(companies.filter((c) => c.id !== deletingCompanyId));
      toast({
        title: t('common.success'),
        description: t('company.companyDeleted'),
      });
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: t('common.error'),
        description: t('company.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCompanyId(null);
    }
  };

  const onSubmit = async (values: CompanyFormValues) => {
    try {
      // ISO zero-pad from ViDatePickerField — alias founded_date ↔ established_at (ADR).
      // Persist legal-entity PUT = FID-P0-FE-CO-BIND-01 (cấm toast-only «đã lưu»).
      const foundedIso = values.founded_date?.trim() || '';
      if (foundedIso && !/^\d{4}-\d{2}-\d{2}$/.test(foundedIso)) {
        toast({
          title: t('common.error'),
          description: t(
            'company.foundedDateInvalid',
            'Ngày thành lập không hợp lệ — dùng dd/MM/yyyy hoặc chọn trên lịch.',
          ),
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: t('common.warning', 'Chưa lưu lên máy chủ'),
        description: t(
          'company.foundedPersistDeferred',
          foundedIso
            ? `Ngày thành lập form = ${foundedIso} (ISO). Ghi pháp nhân (founded/MST/email/phone) chờ FID-P0-FE-CO-BIND-01 — không toast giả thành công.`
            : 'Ghi pháp nhân (founded/MST/email/phone) chờ FID-P0-FE-CO-BIND-01 — không toast giả thành công.',
        ),
        variant: 'destructive',
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: t('common.error'),
        description: t('company.saveError'),
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { labelKey: string; color: string }> = {
      active: { labelKey: 'common.status.active', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      inactive: { labelKey: 'common.status.inactive', color: 'bg-xevn-neutral/15 text-xevn-textSecondary dark:bg-slate-800/50 dark:text-xevn-textMuted' },
      suspended: { labelKey: 'company.suspended', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    const config = statusMap[status] || statusMap.inactive;
    return (
      <Badge variant="secondary" className={cn('font-medium', config.color)}>
        {t(config.labelKey)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('company.totalCompanies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{t('company.activeCompanies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">{t('company.inactiveCompanies')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="co-total-headcount">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatHrmEmployeeCount(stats.totalEmployees)}
                </p>
                <p className="text-xs text-muted-foreground">{t('company.totalEmployees')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {t('company.companyList')}
            </CardTitle>
            <Button size="sm" className="gap-2" onClick={handleAddCompany}>
              <Plus className="w-4 h-4" />
              {t('company.addCompany')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('company.searchCompany')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('common.status.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('common.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.status.inactive')}</SelectItem>
                <SelectItem value="suspended">{t('company.suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>{t('company.companyName')}</TableHead>
                  <TableHead>{t('company.companyCode')}</TableHead>
                  <TableHead>{t('company.industry')}</TableHead>
                  <TableHead>{t('company.employeeCount')}</TableHead>
                  <TableHead>{t('common.status.label')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        {t('common.loading')}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? t('company.noCompaniesMatch')
                        : t('company.noCompanies')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={company.logo_url || undefined} alt={company.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Building2 className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          {company.email && (
                            <p className="text-xs text-muted-foreground">{company.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {company.code || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span
                          data-testid={
                            company.workforce_operating_slug
                              ? `co-row-${company.workforce_operating_slug}-industry`
                              : undefined
                          }
                        >
                          {resolveIndustryDisplay(company.industry) ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-1"
                          data-testid={
                            company.workforce_operating_slug
                              ? `co-row-${company.workforce_operating_slug}-count`
                              : undefined
                          }
                        >
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {formatHrmEmployeeCount(company.employee_count)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(company.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCompany(company)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {t('common.viewDetail')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(company.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? t('company.editCompany') : t('company.addCompany')}
            </DialogTitle>
            <DialogDescription>
              {editingCompany
                ? t('company.updateCompanyDesc')
                : t('company.addCompanyDesc')}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('company.companyName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('company.companyNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.companyCode')}</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: COMPANY001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tax_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.taxCode')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('company.taxCodePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.industry')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('company.selectIndustry')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VSIC_LEVEL_1_INDUSTRIES.map((item) => (
                            <SelectItem key={item.key} value={item.label}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.employeeCount')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      <FormLabel>{t('company.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder="(028) 1234 5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.website')}</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="founded_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('company.foundedDate')}</FormLabel>
                      <FormControl>
                        <ViDatePickerField
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                          onBlur={field.onBlur}
                          disableFuture
                          calendarAriaLabel={t('company.foundedDate')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('company.address')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('company.addressPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo_url"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('company.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('company.descriptionPlaceholder')}
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.status.label')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('company.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">{t('common.status.active')}</SelectItem>
                          <SelectItem value="inactive">{t('common.status.inactive')}</SelectItem>
                          <SelectItem value="suspended">{t('company.suspended')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {editingCompany ? t('common.update') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={viewingCompany?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Building2 className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl">{viewingCompany?.name}</p>
                {viewingCompany?.code && (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {viewingCompany.code}
                  </code>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {viewingCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingCompany.status)}
                {resolveIndustryDisplay(viewingCompany.industry) && (
                  <Badge variant="outline">
                    {resolveIndustryDisplay(viewingCompany.industry)}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingCompany.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{viewingCompany.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {viewingCompany.website ? (
                    <a
                      href={viewingCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {viewingCompany.website}
                    </a>
                  ) : (
                    <span>-</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span>{t('company.taxCode')}: {viewingCompany.tax_code || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {formatHrmEmployeeCount(viewingCompany.employee_count)}{' '}
                    {t('company.employeeUnit')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {t('company.foundedDate')}:{' '}
                    {viewingCompany.founded_date
                      ? formatIsoDateToViDisplay(String(viewingCompany.founded_date).slice(0, 10)) ||
                        '-'
                      : '-'}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm md:col-span-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{viewingCompany.address || '-'}</span>
                </div>
              </div>

              {viewingCompany.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium mb-1">{t('company.description')}</p>
                  <p className="text-sm text-muted-foreground">{viewingCompany.description}</p>
                </div>
              )}

              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>{t('company.createdAt')}: {format(new Date(viewingCompany.created_at), 'dd/MM/yyyy HH:mm')}</p>
                <p>{t('company.updatedAt')}: {format(new Date(viewingCompany.updated_at), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false);
                if (viewingCompany) handleEditCompany(viewingCompany);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {t('common.edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('company.deleteCompanyConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('company.deleteCompanyDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
