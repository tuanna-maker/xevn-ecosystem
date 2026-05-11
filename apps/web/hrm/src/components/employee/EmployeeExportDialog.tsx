import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import {
  Download,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Employee } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';

interface EmployeeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
}

interface ExportColumn {
  key: keyof Employee | 'index';
  label: string;
  checked: boolean;
}

const getColumns = (t: (k: string) => string): ExportColumn[] => [
  { key: 'index', label: t('empExport.col.index'), checked: true },
  { key: 'employee_code', label: t('empExport.col.employeeCode'), checked: true },
  { key: 'full_name', label: t('empExport.col.fullName'), checked: true },
  { key: 'email', label: 'Email', checked: true },
  { key: 'phone', label: t('empExport.col.phone'), checked: true },
  { key: 'department', label: t('empExport.col.department'), checked: true },
  { key: 'position', label: t('empExport.col.position'), checked: true },
  { key: 'start_date', label: t('empExport.col.startDate'), checked: true },
  { key: 'status', label: t('empExport.col.status'), checked: true },
  { key: 'salary', label: t('empExport.col.salary'), checked: false },
  { key: 'gender', label: t('empExport.col.gender'), checked: false },
  { key: 'birth_date', label: t('empExport.col.birthDate'), checked: false },
  { key: 'id_number', label: t('empExport.col.idNumber'), checked: false },
  { key: 'permanent_address', label: t('empExport.col.address'), checked: false },
  { key: 'bank_name', label: t('empExport.col.bankName'), checked: false },
  { key: 'bank_account', label: t('empExport.col.bankAccount'), checked: false },
  { key: 'manager_id', label: t('empExport.col.manager'), checked: false },
];

export function EmployeeExportDialog({
  open,
  onOpenChange,
  employees,
}: EmployeeExportDialogProps) {
  const { t, i18n } = useTranslation();
  const { departments } = useDepartments();
  
  const [columns, setColumns] = useState<ExportColumn[]>(getColumns(t));
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const toggleColumn = (key: string) => {
    setColumns(prev =>
      prev.map(col =>
        col.key === key ? { ...col, checked: !col.checked } : col
      )
    );
  };

  const selectAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, checked: true })));
  };

  const deselectAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, checked: false })));
  };

  const getFilteredEmployees = () => {
    return employees.filter((emp) => {
      const matchesDepartment =
        departmentFilter === 'all' || emp.department === departmentFilter;
      const matchesStatus =
        statusFilter === 'all' || emp.status === statusFilter;
      return matchesDepartment && matchesStatus;
    });
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      active: t('common.status.active'),
      inactive: t('common.status.inactive'),
      probation: t('common.status.probation'),
    };
    return statusMap[status] || status;
  };

  const formatSalary = (salary: number | null | undefined) => {
    if (!salary) return '';
    return new Intl.NumberFormat('vi-VN').format(salary);
  };

  const handleExport = () => {
    const filteredData = getFilteredEmployees();
    const selectedColumns = columns.filter(col => col.checked);

    if (selectedColumns.length === 0) {
      toast.error(t('empExport.noColumnsError'));
      return;
    }

    if (filteredData.length === 0) {
      toast.error(t('empExport.noDataError'));
      return;
    }

    // Prepare header row
    const headers = selectedColumns.map(col => col.label);

    // Prepare data rows
    const dataRows = filteredData.map((emp, index) => {
      return selectedColumns.map(col => {
        switch (col.key) {
          case 'index':
            return index + 1;
          case 'start_date':
            return formatDate(emp.start_date);
          case 'birth_date':
            return formatDate(emp.birth_date);
          case 'status':
            return formatStatus(emp.status);
          case 'salary':
            return formatSalary(emp.salary);
          default:
            return emp[col.key as keyof Employee] || '';
        }
      });
    });

    // Create workbook
    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = selectedColumns.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t('empExport.sheetName'));

    // Generate filename with date
    const today = new Date().toISOString().split('T')[0];
    const filename = `danh_sach_nhan_vien_${today}.${fileFormat}`;

    // Export file
    if (fileFormat === 'xlsx') {
      XLSX.writeFile(wb, filename);
    } else {
      XLSX.writeFile(wb, filename, { bookType: 'csv' });
    }

    toast.success(t('empExport.exportSuccess', { count: filteredData.length }));
    onOpenChange(false);
  };

  const filteredCount = getFilteredEmployees().length;
  const selectedColumnsCount = columns.filter(c => c.checked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <FileSpreadsheet className="w-5 h-5" />
             {t('empExport.title')}
           </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filters */}
          <div className="space-y-3">
             <h4 className="font-medium">{t('empExport.filters')}</h4>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>{t('empExport.col.department')}</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                     <SelectValue placeholder={t('empExport.allDepartments')} />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">{t('empExport.allDepartments')}</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                 <Label>{t('empExport.col.status')}</Label>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger>
                     <SelectValue placeholder={t('empExport.allStatuses')} />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">{t('empExport.allStatuses')}</SelectItem>
                     <SelectItem value="active">{t('common.status.active')}</SelectItem>
                     <SelectItem value="probation">{t('common.status.probation')}</SelectItem>
                     <SelectItem value="inactive">{t('common.status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <p className="text-sm text-muted-foreground">
               {t('empExport.exportCount')}: <span className="font-medium text-foreground">{filteredCount}</span>
             </p>
          </div>

          <Separator />

          {/* Column selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <h4 className="font-medium">{t('empExport.selectColumns')} ({selectedColumnsCount}/{columns.length})</h4>
               <div className="flex gap-2">
                 <Button variant="ghost" size="sm" onClick={selectAllColumns}>
                   {t('common.selectAll')}
                 </Button>
                 <Button variant="ghost" size="sm" onClick={deselectAllColumns}>
                   {t('common.deselectAll')}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 max-h-[200px] overflow-y-auto p-1">
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`col-${col.key}`}
                    checked={col.checked}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  <Label
                    htmlFor={`col-${col.key}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {col.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* File format */}
          <div className="space-y-3">
            <h4 className="font-medium">{t('empExport.fileFormat')}</h4>
            <RadioGroup
              value={fileFormat}
              onValueChange={(value) => setFileFormat(value as 'xlsx' | 'csv')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="format-xlsx" />
                <Label htmlFor="format-xlsx" className="font-normal cursor-pointer">
                  Excel (.xlsx)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="format-csv" />
                <Label htmlFor="format-csv" className="font-normal cursor-pointer">
                  CSV (.csv)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
             <Button variant="outline" onClick={() => onOpenChange(false)}>
               {t('common.cancel')}
             </Button>
             <Button onClick={handleExport} disabled={filteredCount === 0 || selectedColumnsCount === 0}>
               <Download className="w-4 h-4 mr-2" />
               {t('empExport.exportBtn')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
