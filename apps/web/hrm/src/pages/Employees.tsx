/**
 * @CODE-MEMORY
 * Screen:     /employees — table + filters + CRUD dialogs
 * UC:          J-HRM-02 list→profile · UC-HRM-21 · AC-EMP-COL-01..07 · TC-HRM-HDSD-025
 * WorkItem:    P1-HRM-SCALE-FE-W1 · D-HRM-EMP-COMPANY-COL-FE-01 · D-HDSD-BF-03-SOFTDEL-FE-01
 * Purpose:     Server-paged Employees table (RQ); company column = Plane A LE SoT.
 * must_keep:   navigate(`/employees/${id}`); do not change portal iframe key.
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 C-P1-HRM-PERF-02-CURSOR-FE
 *   Export/archive still call listAllEmployees; transport now walks next_cursor
 *   (no OFFSET page+=1). Dashboard tiles stay on useEmployeesSummary (FE-04).
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 D-HRM-EMP-COMPANY-COL-FE-01
 * what: Company column uses resolveEmployeeCompanyColumnLabel (reject Khối)
 * why: BA-HRM-EMP-COMPANY-COL-01 — «Thông tin công ty» = ĐVTV/LE not OU Khối
 * must_keep: Option C rejected (do not rename header to keep Khối); HOLD_DEPLOY
 *
 * @CODE-MEMORY-CHANGE 2026-07-31 D-HDSD-BF-03-SOFTDEL-FE-01
 * change_mode: FIX
 * What: Row-actions cell stopPropagation + onSelect for Xóa/Sửa/Xem (no row→profile steal)
 * Why: QA R-MUTATE-SOFTDEL-01 — menuitem Xóa bubbled onRowClick → profile; archive dialog blocked
 * must_keep: Plain row click → profile; softDeleteEmployee → POST …/archive; TC-06/07/08 untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: Precision Motion sharp text on list/search/filters/pagination/company col (E01–E06, E28)
 * Why: ADR-20260805 §8–§10 — pale ban; ops labels → text-xevn-text / textSecondary
 * must_keep: SoftDel; navigate(`/employees/${id}`); no OCR invent; no Nest/seed; stub honesty
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: SoftDel confirm AlertDialog title/desc sharp (E13); RBAC PermissionGate CTA chrome keep (E26)
 * Why: ADR §8–§10 · inventory W3-EMP-B lifecycle + RBAC chrome
 * must_keep: SoftDel archive; navigate(`/employees/${id}`); PermissionGate create/edit/delete
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-FE-01
 * change_mode: ADD
 * What: status filter Select prefers Nest GET …/employment-statuses/effective when EFF>0; bootstrap 3 when EFF=0
 * Why: SA Option A · AC-PLT-EMP-STATUS-01 · VAL-CNS-02 · peer ATT-CODE filter pattern
 * must_keep: SoftDel; navigate profile; PermissionGate; U65 no seed; no FE-ADMIN invent; personnel=false
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Archive,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Card } from '@/components/ui/card';
import { EmployeeImportDialog } from '@/components/employee/EmployeeImportDialog';
import { EmployeeExportDialog } from '@/components/employee/EmployeeExportDialog';
import { EmployeeFormDialog } from '@/components/employee/EmployeeFormDialog';
import { DeletedEmployeesDialog } from '@/components/employee/DeletedEmployeesDialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Employee, EmployeeFormData, dedupeEmployeesById } from '@/hooks/useEmployees';
import {
  EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK,
  resolveEmpEmploymentStatusLabel,
  useEmpEmploymentStatusesEffective,
} from '@/hooks/useEmpEmploymentStatusesEffective';
import {
  useEmployeesPage,
  HRM_EMPLOYEES_TABLE_PAGE_SIZE,
} from '@/hooks/useEmployeesPage';
import { useEmployeesSummary } from '@/hooks/useEmployeesSummary';
import { useCanAddEmployee } from '@/hooks/useCompanySubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useHrmOperatingUnitFilter } from '@/contexts/HrmOperatingUnitFilterContext';
import { resolveEmployeeCompanyColumnLabel } from '@/lib/employeeCompanyDisplayName';
import { listDepartmentsFromSettingsCatalog } from '@/lib/hrmDepartmentCatalog';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { listAllEmployees } from '@/integrations/hrmApi';
import { mapHrmEmployeeRecord } from '@/hooks/useEmployee';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function Employees() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentCompanyId, memberships } = useAuth();
  const { selectedSlug, operatingUnitLabelMap } = useHrmOperatingUnitFilter();

  const companyIdForHook = selectedSlug === 'all' ? null : selectedSlug;
  const scopeCompanyId =
    companyIdForHook ?? currentCompanyId ?? memberships[0]?.company_id ?? null;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deletedDialogOpen, setDeletedDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; code: string; name: string }[]>([]);

  const {
    nestOptions: nestStatusOptions,
    effectiveCount: empStatusEffectiveCount,
  } = useEmpEmploymentStatusesEffective();
  const empStatusCatalogBound = empStatusEffectiveCount > 0;
  const statusFilterOptions = useMemo(() => {
    if (empStatusCatalogBound) return nestStatusOptions;
    return EMP_EMPLOYMENT_STATUS_BOOTSTRAP_FALLBACK.map((o) => ({
      value: o.statusKey,
      label: t(o.i18nKey, { defaultValue: o.defaultNameVi }),
    }));
  }, [empStatusCatalogBound, nestStatusOptions, t]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, departmentFilter, statusFilter, companyIdForHook]);

  const {
    employees,
    total,
    pageSize,
    totalPages,
    isLoading,
    isFetching,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    refetch,
    invalidatePages,
  } = useEmployeesPage(companyIdForHook, {
    page,
    pageSize: HRM_EMPLOYEES_TABLE_PAGE_SIZE,
    keyword: debouncedSearch,
    status: statusFilter,
    department: departmentFilter,
  });

  const { data: employeeSummary } = useEmployeesSummary({
    include_archived: true,
  });

  const archivedCount = employeeSummary?.archived_count ?? 0;

  /** Lazy full archive load — only when deleted dialog opens (not on table mount). */
  const deletedQuery = useQuery({
    queryKey: ['employees-archived-list', scopeCompanyId],
    queryFn: async () => {
      if (!scopeCompanyId) return [] as Employee[];
      const res = await listAllEmployees({
        company_id: coerceHrmListCompanyId(scopeCompanyId),
        include_archived: true,
      });
      return dedupeEmployeesById((res.data ?? []).map(mapHrmEmployeeRecord)).filter(
        (e) => e.deleted_at != null,
      );
    },
    enabled: deletedDialogOpen && !!scopeCompanyId,
    staleTime: 60_000,
  });

  /** Export fetch — only when export dialog opens (not on table mount). */
  const exportQuery = useQuery({
    queryKey: [
      'employees-export-list',
      scopeCompanyId,
      debouncedSearch,
      statusFilter === 'all' ? '' : statusFilter,
    ],
    queryFn: async () => {
      if (!scopeCompanyId) return [] as Employee[];
      const res = await listAllEmployees({
        company_id: coerceHrmListCompanyId(scopeCompanyId),
        keyword: debouncedSearch.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      return dedupeEmployeesById((res.data ?? []).map(mapHrmEmployeeRecord)).filter(
        (e) => e.deleted_at == null,
      );
    },
    enabled: exportDialogOpen && !!scopeCompanyId,
    staleTime: 60_000,
  });

  const userCompanies = memberships
    .filter((m) => m.company)
    .map((m) => ({ id: m.company_id, name: m.company!.name }));

  const getCompanyName = (emp: Employee) => {
    const tenantId =
      typeof emp.custom_fields?.tenant_id === 'string'
        ? emp.custom_fields.tenant_id
        : undefined;
    return resolveEmployeeCompanyColumnLabel({
      companyId: emp.company_id,
      tenantId,
      companyDisplayName: emp.company_display_name,
      operatingUnitLabelMap,
      membershipCompanyName: userCompanies.find((c) => c.id === emp.company_id)?.name,
    });
  };

  const { data: employeeLimit } = useCanAddEmployee();

  useEffect(() => {
    const fetchDepartments = async () => {
      const companyIds =
        selectedSlug === 'all' ? memberships.map((m) => m.company_id) : [selectedSlug];

      if (companyIds.length === 0) return;

      const rows = await listDepartmentsFromSettingsCatalog(companyIds[0]);
      setDepartments(rows.map((d) => ({ id: d.id, code: d.code || d.id, name: d.name })));
    };

    void fetchDepartments();
  }, [selectedSlug, memberships]);

  const importSpreadsheetScope = (() => {
    const companyId =
      selectedSlug === 'all'
        ? currentCompanyId ?? memberships[0]?.company_id ?? null
        : selectedSlug;
    if (!companyId) return null;
    const tenantFromEnv = import.meta.env.VITE_HRM_SCOPE_TENANT_ID?.trim();
    return {
      tenantId: tenantFromEnv && tenantFromEnv.length > 0 ? tenantFromEnv : companyId,
      companyId,
    };
  })();

  const handleImportSuccess = async ({ importedCount }: { importedCount: number }) => {
    await invalidatePages();
    await refetch();
    toast.success(
      t('employeesPage.importSuccess', { success: importedCount, total: importedCount }),
    );
  };

  /** Department is not in list API filters — apply on current server page matching code/id/name. */
  const filteredEmployees = useMemo(() => {
    if (departmentFilter === 'all') return employees;
    const selectedDept = departments.find(
      (d) => d.code === departmentFilter || d.id === departmentFilter || d.name === departmentFilter,
    );
    const filterCode = selectedDept?.code || selectedDept?.id || departmentFilter;
    const filterName = selectedDept?.name || departmentFilter;

    return employees.filter((emp) => {
      const empDept = emp.department || (emp.custom_fields as any)?.department || '';
      return (
        empDept === filterCode ||
        empDept === filterName ||
        empDept === selectedDept?.id ||
        empDept.toLowerCase() === filterCode.toLowerCase()
      );
    });
  }, [employees, departmentFilter, departments]);

  const handleAddEmployee = async (data: EmployeeFormData & { company_id?: string }) => {
    setIsSubmitting(true);
    const result = await createEmployee(data);
    setIsSubmitting(false);
    return !!result;
  };

  const handleEditEmployee = async (data: EmployeeFormData & { company_id?: string }) => {
    if (!editingEmployee) return false;
    setIsSubmitting(true);
    const result = await updateEmployee(editingEmployee.id, data);
    setIsSubmitting(false);
    if (result) {
      setEditingEmployee(null);
    }
    return result;
  };

  const handleDeleteEmployee = async () => {
    if (!deleteConfirm) return;
    await softDeleteEmployee(deleteConfirm.id, deleteReason);
    setDeleteConfirm(null);
    setDeleteReason('');
  };

  const handleRestore = async (id: string) => {
    const ok = await restoreEmployee(id);
    if (ok) {
      await deletedQuery.refetch();
    }
    return ok;
  };

  const columns = [
    {
      key: 'employee_code',
      header: t('employees.employeeCode'),
      render: (emp: Employee) => (
        <span className="font-medium text-primary">{emp.employee_code}</span>
      ),
    },
    {
      key: 'full_name',
      header: t('employees.fullName'),
      render: (emp: Employee) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={emp.avatar_url || undefined} alt={emp.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {emp.full_name.split(' ').pop()?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-xevn-text">{emp.full_name}</p>
            <p className="text-xs text-xevn-textSecondary">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: t('company.title'),
      hideOnMobile: true,
      render: (emp: Employee) => (
        <span className="text-sm text-xevn-text">{getCompanyName(emp)}</span>
      ),
    },
    {
      key: 'department',
      header: t('employees.department'),
      hideOnMobile: true,
      render: (emp: Employee) => {
        const deptVal = emp.department || (emp.custom_fields as any)?.department || '';
        const matched = departments.find(
          (d) => d.code === deptVal || d.id === deptVal || d.name === deptVal,
        );
        return (
          <span className="text-sm text-xevn-text">
            {matched ? matched.name : deptVal || '-'}
          </span>
        );
      },
    },
    {
      key: 'position',
      header: t('employees.position'),
      hideOnMobile: true,
    },
    {
      key: 'start_date',
      header: t('employees.startDate'),
      hideOnMobile: true,
      render: (emp: Employee) => (
        <span>
          {emp.start_date ? new Date(emp.start_date).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('common.status.label'),
      hideOnMobile: true,
      render: (emp: Employee) => (
        <StatusBadge
          status={emp.status}
          label={resolveEmpEmploymentStatusLabel(statusFilterOptions, emp.status)}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (emp: Employee) => (
        <div
          data-stop-row-click=""
          data-testid="employee-row-actions"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={t('common.actions', { defaultValue: 'Thao tác' })}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  navigate(`/employees/${emp.id}`);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                {t('common.view')}
              </DropdownMenuItem>
              <PermissionGate module="employees" action="edit">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setEditingEmployee(emp);
                    setFormDialogOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t('common.edit')}
                </DropdownMenuItem>
              </PermissionGate>
              <PermissionGate module="employees" action="delete">
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    setDeleteConfirm(emp);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const exportEmployees =
    departmentFilter === 'all'
      ? exportQuery.data ?? []
      : (exportQuery.data ?? []).filter((emp) => emp.department === departmentFilter);

  const rangeFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeTo = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <PageHeader
        title={t('employees.title')}
        subtitle={`${t('employees.subtitle')} - ${total}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <PermissionGate module="employees" action="delete">
              <Button variant="outline" size="sm" onClick={() => setDeletedDialogOpen(true)}>
                <Archive className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t('employeesPage.deleted')}</span> ({archivedCount})
              </Button>
            </PermissionGate>
            <PermissionGate module="employees" action="import">
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t('employeesPage.importExcel')}</span>
              </Button>
            </PermissionGate>
            <PermissionGate module="employees" action="export">
              <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
                <Download className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t('common.export')}</span>
              </Button>
            </PermissionGate>
            <PermissionGate module="employees" action="create">
              <Button
                size="sm"
                data-testid={HDSD_MUTATE_TEST_IDS.employeesCreateBtn}
                aria-label="Thêm nhân viên"
                onClick={() => {
                  if (employeeLimit && !employeeLimit.canAdd) {
                    toast.error(
                      i18n.language === 'en'
                        ? `Employee limit reached (${employeeLimit.current}/${employeeLimit.max}). Please upgrade your plan.`
                        : `Đã đạt giới hạn nhân viên (${employeeLimit.current}/${employeeLimit.max}). Vui lòng nâng cấp gói dịch vụ.`,
                    );
                    return;
                  }
                  setEditingEmployee(null);
                  setFormDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                {t('employees.addEmployee')}
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <Card className="border-xevn-border bg-xevn-surface p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:w-[220px] md:w-[280px] shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xevn-textMuted" />
            <Input
              placeholder={t('common.search')}
              className="pl-10 text-[15px] text-xevn-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[240px] md:w-[280px]">
                <SelectValue placeholder={t('employees.department')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.code}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="w-[120px] md:w-[180px]"
                data-testid="emp-status-filter"
              >
                <SelectValue placeholder={t('common.status.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {statusFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border-xevn-border bg-xevn-surface">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-xevn-textMuted" />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredEmployees}
              keyExtractor={(emp) => emp.id}
              onRowClick={(emp) => navigate(`/employees/${emp.id}`)}
            />
            <div className="flex items-center justify-between border-t border-xevn-border px-4 md:px-6 py-3">
              <span className="text-sm text-xevn-textSecondary">
                {rangeFrom}–{rangeTo} / {total}
                {isFetching ? ' …' : ''}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 text-sm tabular-nums text-xevn-text">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <EmployeeImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
        spreadsheetScope={importSpreadsheetScope}
      />

      <EmployeeExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        employees={exportEmployees}
      />

      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) setEditingEmployee(null);
        }}
        employee={editingEmployee}
        companies={userCompanies}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        isLoading={isSubmitting}
      />

      <DeletedEmployeesDialog
        open={deletedDialogOpen}
        onOpenChange={setDeletedDialogOpen}
        deletedEmployees={deletedQuery.data ?? []}
        onRestore={handleRestore}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[20px] font-bold text-xevn-text">
              {t('employeesPage.deleteConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-xevn-textSecondary">
                <p className="text-[15px]">
                  {t('employeesPage.deleteConfirmDesc')}{' '}
                  <strong className="text-xevn-text">{deleteConfirm?.full_name}</strong>{' '}
                  ({deleteConfirm?.employee_code})?
                </p>
                <p className="text-sm text-xevn-textSecondary">
                  {t('employeesPage.deleteConfirmNote')}
                </p>
                <div className="space-y-2">
                  <Label className="text-xevn-text">{t('employeesPage.deleteReason')}</Label>
                  <Textarea
                    placeholder={t('employeesPage.deleteReasonPlaceholder')}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="text-xevn-text"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirm(null);
                setDeleteReason('');
              }}
            >
              {t('employeesPage.cancelBtn')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('employeesPage.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
