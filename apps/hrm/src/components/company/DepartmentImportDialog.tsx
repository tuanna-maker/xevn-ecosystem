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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DepartmentImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  existingDepartments: { id: string; name: string; code: string | null }[];
}

interface DepartmentData {
  name: string;
  code?: string;
  description?: string;
  manager_name?: string;
  manager_email?: string;
  parent_name?: string;
  status: string;
}

interface ImportRow {
  rowNumber: number;
  data: DepartmentData;
  status: 'valid' | 'invalid' | 'warning';
  errors: string[];
  warnings: string[];
}

const TEMPLATE_COLUMNS = [
  { key: 'name', label: 'Tên phòng ban', required: true },
  { key: 'code', label: 'Mã phòng ban', required: false },
  { key: 'description', label: 'Mô tả', required: false },
  { key: 'manager_name', label: 'Tên trưởng phòng', required: false },
  { key: 'manager_email', label: 'Email trưởng phòng', required: false },
  { key: 'parent_name', label: 'Tên phòng ban cha', required: false },
  { key: 'status', label: 'Trạng thái (active/inactive)', required: false },
];

export function DepartmentImportDialog({
  open,
  onOpenChange,
  onSuccess,
  existingDepartments,
}: DepartmentImportDialogProps) {
  const { currentCompanyId } = useAuth();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, warnings: 0 });

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
    const templateData = [
      TEMPLATE_COLUMNS.map(col => col.label),
      ['Phòng Nhân sự', 'HR', 'Quản lý nhân sự và tuyển dụng', 'Nguyễn Văn A', 'a@company.com', '', 'active'],
      ['Phòng Kỹ thuật', 'IT', 'Phát triển và vận hành hệ thống', 'Trần Văn B', 'b@company.com', '', 'active'],
      ['Nhóm Frontend', 'IT-FE', 'Phát triển giao diện', 'Lê Văn C', 'c@company.com', 'Phòng Kỹ thuật', 'active'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 25 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu nhập phòng ban');
    
    XLSX.writeFile(wb, 'mau_import_phong_ban.xlsx');
    toast.success(t('deptImport.templateDownloaded'));
  };

  const validateRow = (
    row: Record<string, string>, 
    rowNumber: number,
    existingNames: Set<string>,
    existingCodes: Set<string>,
    fileNamesSoFar: Set<string>,
    fileCodesSoFar: Set<string>
  ): ImportRow => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const name = row['Tên phòng ban']?.toString().trim();
    const code = row['Mã phòng ban']?.toString().trim();
    const description = row['Mô tả']?.toString().trim();
    const managerName = row['Tên trưởng phòng']?.toString().trim();
    const managerEmail = row['Email trưởng phòng']?.toString().trim();
    const parentName = row['Tên phòng ban cha']?.toString().trim();
    const statusStr = row['Trạng thái (active/inactive)']?.toString().trim().toLowerCase();

    // Required fields
    if (!name) errors.push(t('deptImport.nameRequired'));

    // Duplicate checks
    if (name && existingNames.has(name.toUpperCase())) {
      errors.push(t('deptImport.nameExists', { name }));
    }
    if (name && fileNamesSoFar.has(name.toUpperCase())) {
      errors.push(t('deptImport.nameDuplicate', { name }));
    }
    if (code && existingCodes.has(code.toUpperCase())) {
      errors.push(t('deptImport.codeExists', { code }));
    }
    if (code && fileCodesSoFar.has(code.toUpperCase())) {
      errors.push(t('deptImport.codeDuplicate', { code }));
    }

    // Email validation
    if (managerEmail && !managerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      warnings.push(t('deptImport.invalidEmail'));
    }

    // Parent validation
    if (parentName) {
      const parentExists = existingNames.has(parentName.toUpperCase()) || fileNamesSoFar.has(parentName.toUpperCase());
      if (!parentExists) {
        warnings.push(t('deptImport.parentNotFound', { name: parentName }));
      }
    }

    // Status validation
    let status = 'active';
    if (statusStr) {
      if (['active', 'inactive'].includes(statusStr)) {
        status = statusStr;
      } else {
        warnings.push(t('deptImport.invalidStatus'));
      }
    }

    const data: DepartmentData = {
      name: name || '',
      code,
      description,
      manager_name: managerName,
      manager_email: managerEmail,
      parent_name: parentName,
      status,
    };

    return {
      rowNumber,
      data,
      status: errors.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'valid',
      errors,
      warnings,
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error(t('deptImport.invalidFileFormat'));
      return;
    }

    const existingNames = new Set(
      existingDepartments.map(d => d.name.toUpperCase())
    );
    const existingCodes = new Set(
      existingDepartments.filter(d => d.code).map(d => d.code!.toUpperCase())
    );

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

        if (jsonData.length === 0) {
          toast.error(t('deptImport.emptyFile'));
          return;
        }

        const fileNamesSoFar = new Set<string>();
        const fileCodesSoFar = new Set<string>();
        const parsedData = jsonData.map((row, index) => {
          const result = validateRow(row, index + 2, existingNames, existingCodes, fileNamesSoFar, fileCodesSoFar);
          const name = row['Tên phòng ban']?.toString().trim();
          const code = row['Mã phòng ban']?.toString().trim();
          if (name) fileNamesSoFar.add(name.toUpperCase());
          if (code) fileCodesSoFar.add(code.toUpperCase());
          return result;
        });

        setImportData(parsedData);
        setStep('preview');
      } catch (error) {
        toast.error(t('deptImport.readError'));
        console.error('Error reading file:', error);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (!currentCompanyId) return;
    
    setStep('importing');
    
    const validRows = importData.filter(row => row.status !== 'invalid');
    let successCount = 0;
    let failedCount = importData.filter(row => row.status === 'invalid').length;
    let warningCount = 0;

    // Build a map to resolve parent relationships
    const createdDepartments = new Map<string, string>(); // name -> id
    existingDepartments.forEach(d => {
      createdDepartments.set(d.name.toUpperCase(), d.id);
    });

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      try {
        // Resolve parent_id
        let parentId: string | null = null;
        if (row.data.parent_name) {
          parentId = createdDepartments.get(row.data.parent_name.toUpperCase()) || null;
        }

        const { data: inserted, error } = await supabase.from('departments').insert({
          company_id: currentCompanyId,
          name: row.data.name,
          code: row.data.code || null,
          description: row.data.description || null,
          manager_name: row.data.manager_name || null,
          manager_email: row.data.manager_email || null,
          parent_id: parentId,
          status: row.data.status,
          level: parentId ? 2 : 1,
        }).select('id').single();

        if (error) throw error;

        // Add to created map for subsequent rows
        if (inserted) {
          createdDepartments.set(row.data.name.toUpperCase(), inserted.id);
        }

        if (row.status === 'warning') {
          warningCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        failedCount++;
        console.error('Import error:', error);
      }
      
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportResults({ success: successCount, failed: failedCount, warnings: warningCount });
    setStep('complete');
    
    if (successCount > 0) {
      onSuccess();
    }
  };

  const getStatusBadge = (status: ImportRow['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />{t('deptImport.valid')}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"><AlertCircle className="w-3 h-3 mr-1" />{t('deptImport.warning')}</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" />{t('deptImport.error')}</Badge>;
    }
  };

  const validCount = importData.filter(r => r.status === 'valid').length;
  const warningCount = importData.filter(r => r.status === 'warning').length;
  const invalidCount = importData.filter(r => r.status === 'invalid').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {t('deptImport.title')}
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
                   <h4 className="font-medium mb-1">{t('deptImport.downloadTemplate')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('deptImport.downloadTemplateDesc')}
                  </p>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('deptImport.downloadTemplateBtn')}
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
                  <p className="font-medium">{t('deptImport.dragDrop')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('deptImport.supportedFormats')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t('deptImport.instructions')}:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• {t('deptImport.inst1')}</li>
                <li>• {t('deptImport.inst2')}</li>
                <li>• {t('deptImport.inst3')}</li>
                <li>• {t('deptImport.inst4')}</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('deptImport.file')}: <span className="font-medium text-foreground">{file?.name}</span></p>
                <p className="text-sm text-muted-foreground mt-1">{t('deptImport.totalRows')}: <span className="font-medium text-foreground">{importData.length}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{validCount} {t('deptImport.valid').toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">{warningCount} {t('deptImport.warning').toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">{invalidCount} {t('deptImport.error').toLowerCase()}</span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t('deptImport.row')}</TableHead>
                    <TableHead className="w-24">{t('common.status.label')}</TableHead>
                    <TableHead>{t('dept.deptName')}</TableHead>
                    <TableHead>{t('dept.deptCode')}</TableHead>
                    <TableHead>{t('dept.parentDept')}</TableHead>
                    <TableHead className="w-48">{t('deptImport.errorsWarnings')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((row) => (
                    <TableRow key={row.rowNumber} className={row.status === 'invalid' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>{row.data.name}</TableCell>
                      <TableCell>{row.data.code || '-'}</TableCell>
                      <TableCell>{row.data.parent_name || '-'}</TableCell>
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

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={resetDialog}>
                {t('deptImport.reselect')}
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={validCount + warningCount === 0}
              >
                {t('deptImport.importCount', { count: validCount + warningCount })}
              </Button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-medium">{t('deptImport.importing')}</p>
            </div>
            <Progress value={importProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{importProgress}%</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-medium text-lg">{t('deptImport.complete')}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-muted-foreground">{t('deptImport.success')}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{importResults.warnings}</p>
                <p className="text-sm text-muted-foreground">{t('deptImport.hasWarnings')}</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                <p className="text-sm text-muted-foreground">{t('deptImport.failed')}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose}>{t('common.close')}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
