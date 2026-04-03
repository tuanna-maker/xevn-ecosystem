import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Employee } from '@/hooks/useEmployees';

interface EmployeeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (employees: Partial<Employee>[]) => void;
  currentEmployees?: Employee[];
}

interface ImportRow {
  rowNumber: number;
  data: Partial<Employee>;
  status: 'valid' | 'invalid' | 'warning';
  errors: string[];
  warnings: string[];
}

const TEMPLATE_COLUMNS = [
  { key: 'employeeCode', labelKey: 'empImport.col.code', required: true },
  { key: 'fullName', labelKey: 'empImport.col.fullName', required: true },
  { key: 'email', labelKey: 'empImport.col.email', required: true },
  { key: 'phone', labelKey: 'empImport.col.phone', required: false },
  { key: 'department', labelKey: 'empImport.col.department', required: true },
  { key: 'position', labelKey: 'empImport.col.position', required: true },
  { key: 'startDate', labelKey: 'empImport.col.startDate', required: true },
  { key: 'status', labelKey: 'empImport.col.status', required: false },
  { key: 'salary', labelKey: 'empImport.col.salary', required: false },
  { key: 'gender', labelKey: 'empImport.col.gender', required: false },
  { key: 'birthDate', labelKey: 'empImport.col.birthDate', required: false },
  { key: 'idNumber', labelKey: 'empImport.col.idNumber', required: false },
  { key: 'address', labelKey: 'empImport.col.address', required: false },
  { key: 'bankName', labelKey: 'empImport.col.bankName', required: false },
  { key: 'bankAccount', labelKey: 'empImport.col.bankAccount', required: false },
];

export function EmployeeImportDialog({
  open,
  onOpenChange,
  onImportSuccess,
  currentEmployees,
}: EmployeeImportDialogProps) {
  const { t } = useTranslation();
  const d = (key: string) => String(t(`empImport.${key}`));
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const allExistingEmployees = currentEmployees || [];
  
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, warnings: 0 });

  // Build column labels from translations for current language
  const getColumnLabels = () => TEMPLATE_COLUMNS.map(col => t(col.labelKey));
  
  // Build a reverse map from label -> key for parsing uploaded files
  const buildLabelToKeyMap = () => {
    const map: Record<string, string> = {};
    TEMPLATE_COLUMNS.forEach(col => {
      map[t(col.labelKey)] = col.key;
    });
    return map;
  };

  const resetDialog = () => {
    setStep('upload');
    setFile(null);
    setImportData([]);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0, warnings: 0 });
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const labels = getColumnLabels();
    const templateData = [
      labels,
      ['NV001', 'Nguyễn Văn A', 'a.nguyen@company.vn', '0901234567', 'Phòng Kỹ thuật', 'Nhân viên', '01/01/2024', 'active', '15000000', 'Nam', '01/01/1990', '001234567890', '123 Đường ABC, Q.1, TP.HCM', 'Vietcombank', '1234567890'],
      ['NV002', 'Trần Thị B', 'b.tran@company.vn', '0912345678', 'Phòng Nhân sự', 'Chuyên viên', '15/02/2024', 'probation', '12000000', 'Nữ', '15/05/1995', '002345678901', '456 Đường XYZ, Q.2, TP.HCM', 'Techcombank', '0987654321'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 20 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, d('templateSheetName'));
    
    XLSX.writeFile(wb, 'employee_import_template.xlsx');
    toast.success(d('templateDownloaded'));
  };

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const ddmmyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateStr.match(ddmmyyyy);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    const yyyymmdd = /^\d{4}-\d{2}-\d{2}$/;
    if (yyyymmdd.test(dateStr)) return dateStr;
    if (!isNaN(Number(dateStr))) {
      const excelDate = XLSX.SSF.parse_date_code(Number(dateStr));
      if (excelDate) {
        return `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
      }
    }
    return null;
  };

  const validateRow = (
    row: Record<string, string>, 
    rowNumber: number,
    existingCodes: Set<string>,
    existingEmails: Set<string>,
    fileCodesSoFar: Set<string>,
    fileEmailsSoFar: Set<string>,
    colLabels: string[]
  ): ImportRow => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const data: Partial<Employee> = {};

    const employeeCode = row[colLabels[0]]?.toString().trim();
    const fullName = row[colLabels[1]]?.toString().trim();
    const email = row[colLabels[2]]?.toString().trim()?.toLowerCase();
    const phone = row[colLabels[3]]?.toString().trim();
    const department = row[colLabels[4]]?.toString().trim();
    const position = row[colLabels[5]]?.toString().trim();
    const startDateStr = row[colLabels[6]]?.toString().trim();
    const statusStr = row[colLabels[7]]?.toString().trim().toLowerCase();
    const salaryStr = row[colLabels[8]]?.toString().trim();
    const gender = row[colLabels[9]]?.toString().trim();
    const birthDateStr = row[colLabels[10]]?.toString().trim();
    const idNumber = row[colLabels[11]]?.toString().trim();
    const address = row[colLabels[12]]?.toString().trim();
    const bankName = row[colLabels[13]]?.toString().trim();
    const bankAccount = row[colLabels[14]]?.toString().trim();

    if (!employeeCode) errors.push(d('err.codeRequired'));
    if (!fullName) errors.push(d('err.nameRequired'));
    if (!email) errors.push(d('err.emailRequired'));
    if (!department) errors.push(d('err.departmentRequired'));
    if (!position) errors.push(d('err.positionRequired'));
    if (!startDateStr) errors.push(d('err.startDateRequired'));

    if (employeeCode && existingCodes.has(employeeCode.toUpperCase())) {
      errors.push(d('err.codeDuplicateSystem'));
    }
    if (email && existingEmails.has(email)) {
      errors.push(d('err.emailDuplicateSystem'));
    }
    if (employeeCode && fileCodesSoFar.has(employeeCode.toUpperCase())) {
      errors.push(d('err.codeDuplicateFile'));
    }
    if (email && fileEmailsSoFar.has(email)) {
      errors.push(d('err.emailDuplicateFile'));
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(d('err.emailInvalid'));
    }

    const startDate = parseDate(startDateStr || '');
    if (startDateStr && !startDate) {
      errors.push(d('err.startDateInvalid'));
    }

    const birthDate = parseDate(birthDateStr || '');
    if (birthDateStr && !birthDate) {
      warnings.push(d('err.birthDateInvalid'));
    }

    let status: 'active' | 'inactive' | 'probation' = 'active';
    if (statusStr) {
      if (['active', 'inactive', 'probation'].includes(statusStr)) {
        status = statusStr as 'active' | 'inactive' | 'probation';
      } else {
        warnings.push(d('err.statusInvalid'));
      }
    }

    let salary = 0;
    if (salaryStr) {
      const parsedSalary = parseFloat(salaryStr.replace(/[,\.]/g, ''));
      if (!isNaN(parsedSalary)) {
        salary = parsedSalary;
      } else {
        warnings.push(d('err.salaryInvalid'));
      }
    }

    data.id = `import-${Date.now()}-${rowNumber}`;
    data.employee_code = employeeCode;
    data.full_name = fullName;
    data.email = email;
    data.phone = phone;
    data.department = department;
    data.position = position;
    data.start_date = startDate || '';
    data.status = status;
    data.salary = salary;
    data.gender = gender;
    data.birth_date = birthDate || undefined;
    data.id_number = idNumber;
    data.permanent_address = address;
    data.bank_name = bankName;
    data.bank_account = bankAccount;

    return {
      rowNumber,
      data,
      status: errors.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'valid',
      errors,
      warnings,
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error(d('err.invalidFileType'));
      return;
    }

    setFile(uploadedFile);
    const colLabels = getColumnLabels();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

        if (jsonData.length === 0) {
          toast.error(d('err.emptyFile'));
          return;
        }

        const existingCodes = new Set<string>(
          allExistingEmployees.map(emp => emp.employee_code.toUpperCase())
        );
        const existingEmails = new Set<string>(
          allExistingEmployees.map(emp => (emp.email || '').toLowerCase())
        );

        const fileCodesSoFar = new Set<string>();
        const fileEmailsSoFar = new Set<string>();

        const parsedData = jsonData.map((row, index) => {
          const result = validateRow(row, index + 2, existingCodes, existingEmails, fileCodesSoFar, fileEmailsSoFar, colLabels);
          
          const code = row[colLabels[0]]?.toString().trim();
          const email = row[colLabels[2]]?.toString().trim()?.toLowerCase();
          if (code) fileCodesSoFar.add(code.toUpperCase());
          if (email) fileEmailsSoFar.add(email);
          
          return result;
        });

        setImportData(parsedData);
        setStep('preview');
      } catch (error) {
        toast.error(d('err.readFile'));
        console.error('Error reading file:', error);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    setStep('importing');
    
    const validRows = importData.filter(row => row.status !== 'invalid');
    const totalRows = validRows.length;
    let successCount = 0;
    let warningCount = 0;

    const importedEmployees: Partial<Employee>[] = [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (row.status === 'valid') {
        importedEmployees.push(row.data);
        successCount++;
      } else if (row.status === 'warning') {
        importedEmployees.push(row.data);
        warningCount++;
      }
      
      setImportProgress(Math.round(((i + 1) / totalRows) * 100));
    }

    const failedCount = importData.filter(row => row.status === 'invalid').length;
    
    setImportResults({ success: successCount, failed: failedCount, warnings: warningCount });
    setStep('complete');

    if (importedEmployees.length > 0) {
      onImportSuccess(importedEmployees);
    }
  };

  const getStatusBadge = (status: ImportRow['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />{d('statusValid')}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"><AlertCircle className="w-3 h-3 mr-1" />{d('statusWarning')}</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" />{d('statusError')}</Badge>;
    }
  };

  const validCount = importData.filter(r => r.status === 'valid').length;
  const warningCount2 = importData.filter(r => r.status === 'warning').length;
  const invalidCount = importData.filter(r => r.status === 'invalid').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {d('title')}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6 py-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{d('downloadTemplate')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{d('downloadTemplateDesc')}</p>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    {d('downloadTemplateBtn')}
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{d('dragDrop')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{d('supportedFormats')}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{d('instructions')}</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• {d('instruction1')}</li>
                <li>• {d('instruction2')}</li>
                <li>• {d('instruction3')}</li>
                <li>• {d('instruction4')}</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">File: <span className="font-medium text-foreground">{file?.name}</span></p>
                <p className="text-sm text-muted-foreground mt-1">{d('totalRows')}: <span className="font-medium text-foreground">{importData.length}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{validCount} {d('statusValid')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">{warningCount2} {d('statusWarning')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">{invalidCount} {d('statusError')}</span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{d('row')}</TableHead>
                    <TableHead className="w-24">{t('common.status.label')}</TableHead>
                    <TableHead>{t('empImport.col.code')}</TableHead>
                    <TableHead>{t('empImport.col.fullName')}</TableHead>
                    <TableHead>{t('empImport.col.email')}</TableHead>
                    <TableHead>{t('empImport.col.department')}</TableHead>
                    <TableHead>{t('empImport.col.position')}</TableHead>
                    <TableHead className="w-48">{d('errorsWarnings')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((row) => (
                    <TableRow key={row.rowNumber} className={row.status === 'invalid' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>{row.data.employee_code}</TableCell>
                      <TableCell>{row.data.full_name}</TableCell>
                      <TableCell>{row.data.email}</TableCell>
                      <TableCell>{row.data.department}</TableCell>
                      <TableCell>{row.data.position}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {row.errors.map((err, i) => (
                            <p key={i} className="text-red-600">{err}</p>
                          ))}
                          {row.warnings.map((warn, i) => (
                            <p key={i} className="text-yellow-600">{warn}</p>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={resetDialog}>
                <X className="w-4 h-4 mr-2" />
                {d('chooseOtherFile')}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={validCount + warningCount2 === 0}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('empImport.importCount', { count: validCount + warningCount2 })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="mt-4 font-medium">{d('importing')}</p>
              <p className="text-sm text-muted-foreground mt-1">{d('doNotClose')}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{d('progress')}</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{d('importComplete')}</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-green-700 dark:text-green-400">{d('resultSuccess')}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{importResults.warnings}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">{d('resultWarnings')}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{importResults.failed}</p>
                <p className="text-sm text-red-700 dark:text-red-400">{d('resultFailed')}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
