import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Archive,
  Loader2,
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
import { useEmployees, Employee, EmployeeFormData } from '@/hooks/useEmployees';
import { supabase } from '@/integrations/supabase/client';
import { useCanAddEmployee } from '@/hooks/useCompanySubscription';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGate } from '@/components/auth/PermissionGate';

export default function Employees() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentCompanyId, memberships } = useAuth();
  
  const [companyFilter, setCompanyFilter] = useState<string>('all');

  // Determine which company to fetch: 'all' = null (all companies), else specific
  const companyIdForHook = companyFilter === 'all' ? null : companyFilter;

  const {
    employees,
    deletedEmployees,
    isLoading,
    createEmployee,
    updateEmployee,
    softDeleteEmployee,
    restoreEmployee,
    refetch,
  } = useEmployees(true, companyIdForHook);

  const userCompanies = memberships
    .filter(m => m.company)
    .map(m => ({ id: m.company_id, name: m.company!.name }));

  const getCompanyName = (companyId: string) => {
    return userCompanies.find(c => c.id === companyId)?.name || '—';
  };

  const { data: employeeLimit } = useCanAddEmployee();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deletedDialogOpen, setDeletedDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  // Fetch departments for all relevant companies
  useEffect(() => {
    const fetchDepartments = async () => {
      const companyIds = companyFilter === 'all'
        ? memberships.map(m => m.company_id)
        : [companyFilter];
      
      if (companyIds.length === 0) return;

      const { data } = await supabase
        .from('departments')
        .select('id, name')
        .in('company_id', companyIds)
        .eq('status', 'active');
      
      if (data) {
        setDepartments(data);
      }
    };
    
    fetchDepartments();
  }, [companyFilter, memberships]);

  const handleImportSuccess = async (importedEmployees: Partial<any>[]) => {
    let successCount = 0;
    for (const emp of importedEmployees) {
      const result = await createEmployee({
        employee_code: emp.employeeCode || `NV${Date.now()}`,
        full_name: emp.fullName || '',
        email: emp.email || null,
        phone: emp.phone || null,
        department: emp.department || null,
        position: emp.position || null,
        start_date: emp.startDate || null,
        salary: emp.salary || null,
        status: emp.status || 'active',
      });
      if (result) successCount++;
    }
    toast.success(t('employeesPage.importSuccess', { success: successCount, total: importedEmployees.length }));
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDepartment =
      departmentFilter === 'all' || emp.department === departmentFilter;

    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddEmployee = async (data: EmployeeFormData & { company_id?: string }) => {
    setIsSubmitting(true);
    // Override company_id if provided from form
    const originalCreateEmployee = createEmployee;
    let result;
    if (data.company_id) {
      // Insert directly with specified company_id
      const { company_id: selectedCompanyId, ...empData } = data;
      const { data: newEmp, error } = await supabase
        .from('employees')
        .insert([{ ...empData, company_id: selectedCompanyId, status: empData.status || 'active' }])
        .select()
        .single();
      if (error) {
        toast.error(t('employeesPage.addError'));
        result = null;
      } else {
        toast.success(t('employeesPage.addSuccess'));
        refetch();
        result = newEmp;
      }
    } else {
      result = await createEmployee(data);
    }
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
            <p className="font-medium">{emp.full_name}</p>
            <p className="text-xs text-muted-foreground">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: t('company.title'),
      hideOnMobile: true,
      render: (emp: Employee) => (
        <span className="text-sm">{getCompanyName(emp.company_id)}</span>
      ),
    },
    {
      key: 'department',
      header: t('employees.department'),
      hideOnMobile: true,
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
      render: (emp: Employee) => <StatusBadge status={emp.status as any} />,
    },
    {
      key: 'actions',
      header: '',
      render: (emp: Employee) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/employees/${emp.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              {t('common.view')}
            </DropdownMenuItem>
            <PermissionGate module="employees" action="edit">
              <DropdownMenuItem onClick={() => {
                setEditingEmployee(emp);
                setFormDialogOpen(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                {t('common.edit')}
              </DropdownMenuItem>
            </PermissionGate>
            <PermissionGate module="employees" action="delete">
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setDeleteConfirm(emp)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Pass employees directly to export (now uses DB Employee type)
  const exportEmployees = employees;

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <PageHeader
        title={t('employees.title')}
        subtitle={`${t('employees.subtitle')} - ${employees.length}`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <PermissionGate module="employees" action="delete">
              <Button variant="outline" size="sm" onClick={() => setDeletedDialogOpen(true)}>
                <Archive className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t('employeesPage.deleted')}</span> ({deletedEmployees.length})
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
                onClick={() => {
                  if (employeeLimit && !employeeLimit.canAdd) {
                    toast.error(
                      i18n.language === 'en'
                        ? `Employee limit reached (${employeeLimit.current}/${employeeLimit.max}). Please upgrade your plan.`
                        : `Đã đạt giới hạn nhân viên (${employeeLimit.current}/${employeeLimit.max}). Vui lòng nâng cấp gói dịch vụ.`
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

      {/* Filters */}
      <Card className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px] md:w-[180px]">
                <SelectValue placeholder={t('employees.department')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {userCompanies.length > 1 && (
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-[140px] md:w-[200px]">
                  <SelectValue placeholder={t('company.title')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('employeesPage.allCompanies')}</SelectItem>
                  {userCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] md:w-[180px]">
                <SelectValue placeholder={t('common.status.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="probation">{t('status.probation')}</SelectItem>
                <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredEmployees}
            keyExtractor={(emp) => emp.id}
            onRowClick={(emp) => navigate(`/employees/${emp.id}`)}
          />
        )}
      </Card>

      {/* Import Dialog */}
      <EmployeeImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={handleImportSuccess}
      />

      {/* Export Dialog */}
      <EmployeeExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        employees={exportEmployees}
      />

      {/* Add/Edit Employee Dialog */}
      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) setEditingEmployee(null);
        }}
        employee={editingEmployee}
        departments={departments}
        companies={userCompanies}
        onSubmit={editingEmployee ? handleEditEmployee : handleAddEmployee}
        isLoading={isSubmitting}
      />

      {/* Deleted Employees Dialog */}
      <DeletedEmployeesDialog
        open={deletedDialogOpen}
        onOpenChange={setDeletedDialogOpen}
        deletedEmployees={deletedEmployees}
        onRestore={restoreEmployee}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('employeesPage.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  {t('employeesPage.deleteConfirmDesc')}{' '}
                  <strong>{deleteConfirm?.full_name}</strong> ({deleteConfirm?.employee_code})?
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('employeesPage.deleteConfirmNote')}
                </p>
                <div className="space-y-2">
                  <Label>{t('employeesPage.deleteReason')}</Label>
                  <Textarea
                    placeholder={t('employeesPage.deleteReasonPlaceholder')}
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirm(null);
              setDeleteReason('');
            }}>
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
