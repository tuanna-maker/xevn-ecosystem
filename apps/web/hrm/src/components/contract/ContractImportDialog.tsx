import { useState, useRef } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { createEmployeeContract, listEmployees } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { resolveContractTypeDisplayLabel } from '@/lib/labelMaps';

interface ContractImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ContractData {
  contract_code: string;
  employee_name: string;
  department?: string;
  contract_type: string;
  effective_date?: string;
  expiry_date?: string;
  status: string;
  notes?: string;
  created_by?: string;
}

interface ImportRow {
  rowNumber: number;
  data: ContractData;
  status: 'valid' | 'invalid' | 'warning';
  errors: string[];
  warnings: string[];
}

const TEMPLATE_COLUMNS = [
  { key: 'contract_code', label: 'MĂ£ há»£p Ä‘á»“ng', required: true },
  { key: 'employee_name', label: 'TĂªn nhĂ¢n viĂªn', required: true },
  { key: 'department', label: 'PhĂ²ng ban', required: false },
  { key: 'contract_type', label: 'Loáº¡i há»£p Ä‘á»“ng', required: true },
  { key: 'effective_date', label: 'NgĂ y hiá»‡u lá»±c (DD/MM/YYYY)', required: false },
  { key: 'expiry_date', label: 'NgĂ y háº¿t háº¡n (DD/MM/YYYY)', required: false },
  { key: 'status', label: 'Tráº¡ng thĂ¡i (active/pending/expired)', required: false },
  { key: 'notes', label: 'Ghi chĂº', required: false },
  { key: 'created_by', label: 'NgÆ°á»i táº¡o', required: false },
];

const CONTRACT_TYPES = [
  'Há»£p Ä‘á»“ng 1 nÄƒm',
  'Há»£p Ä‘á»“ng 3 nÄƒm', 
  'Há»£p Ä‘á»“ng 6 thĂ¡ng',
  'Há»£p Ä‘á»“ng há»c viá»‡c',
  'Há»£p Ä‘á»“ng thá»­ viá»‡c',
];

export function ContractImportDialog({
  open,
  onOpenChange,
}: ContractImportDialogProps) {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0, warnings: 0 });
  const [existingCodes, setExistingCodes] = useState<Set<string>>(new Set());

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
      ['HD-2024-001', 'Nguyá»…n VÄƒn A', 'PhĂ²ng Ká»¹ thuáº­t', 'Há»£p Ä‘á»“ng 1 nÄƒm', '01/01/2024', '31/12/2024', 'active', 'Ghi chĂº', 'Admin'],
      ['HD-2024-002', 'Tráº§n Thá»‹ B', 'PhĂ²ng NhĂ¢n sá»±', 'Há»£p Ä‘á»“ng thá»­ viá»‡c', '15/01/2024', '15/03/2024', 'pending', '', 'Admin'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 22 }));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Máº«u nháº­p há»£p Ä‘á»“ng');
    
    XLSX.writeFile(wb, 'mau_import_hop_dong.xlsx');
    toast.success('ÄĂ£ táº£i file máº«u thĂ nh cĂ´ng');
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
    if (yyyymmdd.test(dateStr)) {
      return dateStr;
    }
    
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
    existingCodeSet: Set<string>,
    fileCodesSoFar: Set<string>
  ): ImportRow => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const contractCode = row['MĂ£ há»£p Ä‘á»“ng']?.toString().trim();
    const employeeName = row['TĂªn nhĂ¢n viĂªn']?.toString().trim();
    const department = row['PhĂ²ng ban']?.toString().trim();
    const contractType = row['Loáº¡i há»£p Ä‘á»“ng']?.toString().trim();
    const effectiveDateStr = row['NgĂ y hiá»‡u lá»±c (DD/MM/YYYY)']?.toString().trim();
    const expiryDateStr = row['NgĂ y háº¿t háº¡n (DD/MM/YYYY)']?.toString().trim();
    const statusStr = row['Tráº¡ng thĂ¡i (active/pending/expired)']?.toString().trim().toLowerCase();
    const notes = row['Ghi chĂº']?.toString().trim();
    const createdBy = row['NgÆ°á»i táº¡o']?.toString().trim();

    // Required fields
    if (!contractCode) errors.push('MĂ£ há»£p Ä‘á»“ng khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
    if (!employeeName) errors.push('TĂªn nhĂ¢n viĂªn khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');
    if (!contractType) errors.push('Loáº¡i há»£p Ä‘á»“ng khĂ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng');

    // Duplicate checks
    if (contractCode && existingCodeSet.has(contractCode.toUpperCase())) {
      errors.push(`MĂ£ HÄ "${contractCode}" Ä‘Ă£ tá»“n táº¡i trong há»‡ thá»‘ng`);
    }
    if (contractCode && fileCodesSoFar.has(contractCode.toUpperCase())) {
      errors.push(`MĂ£ HÄ "${contractCode}" bá»‹ trĂ¹ng trong file import`);
    }

    // Contract type validation
    if (contractType && !CONTRACT_TYPES.includes(contractType)) {
      warnings.push(`Loáº¡i HÄ "${contractType}" khĂ´ng náº±m trong danh sĂ¡ch chuáº©n`);
    }

    // Date validation
    const effectiveDate = parseDate(effectiveDateStr || '');
    if (effectiveDateStr && !effectiveDate) {
      errors.push('NgĂ y hiá»‡u lá»±c khĂ´ng há»£p lá»‡');
    }

    const expiryDate = parseDate(expiryDateStr || '');
    if (expiryDateStr && !expiryDate) {
      warnings.push('NgĂ y háº¿t háº¡n khĂ´ng há»£p lá»‡');
    }

    // Status validation
    let status = 'pending';
    if (statusStr) {
      if (['active', 'pending', 'expired'].includes(statusStr)) {
        status = statusStr;
      } else {
        warnings.push('Tráº¡ng thĂ¡i khĂ´ng há»£p lá»‡, máº·c Ä‘á»‹nh lĂ  "pending"');
      }
    }

    const data: ContractData = {
      contract_code: contractCode || '',
      employee_name: employeeName || '',
      department,
      contract_type: contractType || '',
      effective_date: effectiveDate || undefined,
      expiry_date: expiryDate || undefined,
      status,
      notes,
      created_by: createdBy,
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
      toast.error('Vui lĂ²ng chá»n file Excel (.xlsx, .xls) hoáº·c CSV');
      return;
    }

    // Fetch existing contract codes
    
    const existingCodeSet = new Set(
      (existingContracts || []).map(c => c.contract_code.toUpperCase())
    );
    setExistingCodes(existingCodeSet);

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
          toast.error('File khĂ´ng cĂ³ dá»¯ liá»‡u');
          return;
        }

        const fileCodesSoFar = new Set<string>();
        const parsedData = jsonData.map((row, index) => {
          const result = validateRow(row, index + 2, existingCodeSet, fileCodesSoFar);
          const code = row['MĂ£ há»£p Ä‘á»“ng']?.toString().trim();
          if (code) fileCodesSoFar.add(code.toUpperCase());
          return result;
        });

        setImportData(parsedData);
        setStep('preview');
      } catch (error) {
        toast.error('Lá»—i Ä‘á»c file. Vui lĂ²ng kiá»ƒm tra Ä‘á»‹nh dáº¡ng file');
        console.error('Error reading file:', error);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    setStep('importing');
    
    const validRows = importData.filter(row => row.status !== 'invalid');
    let successCount = 0;
    let failedCount = importData.filter(row => row.status === 'invalid').length;
    let warningCount = 0;

    const employees =
      currentCompanyId != null
        ? (await listEmployees({ company_id: currentCompanyId, page_size: 500 })).data ?? []
        : [];

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      
      try {
        if (!currentCompanyId || row.status === 'invalid') {
          failedCount++;
          continue;
        }
        const employee = employees.find(
          (e) =>
            e.full_name?.toLowerCase() === row.data.employee_name?.toLowerCase() ||
            e.employee_code?.toLowerCase() === row.data.contract_code?.toLowerCase(),
        );
        if (!employee?.id) {
          failedCount++;
          continue;
        }
        await createEmployeeContract({
          company_id: currentCompanyId,
          employee_id: employee.id,
          contract_type: row.data.contract_type,
          start_date: row.data.effective_date ?? new Date().toISOString().slice(0, 10),
          end_date: row.data.expiry_date ?? row.data.effective_date ?? new Date().toISOString().slice(0, 10),
        });
        if (row.status === 'warning') {
          warningCount++;
        }
        successCount++;
      } catch (error) {
        failedCount++;
        console.error('Import error:', error);
        if (i === 0) toast.error(toErrorMessage(error, 'Import hợp đồng thất bại'));
      }
      
      setImportProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setImportResults({ success: successCount, failed: failedCount, warnings: warningCount });
    setStep('complete');
    
    // Refresh data
    queryClient.invalidateQueries({ queryKey: ['contracts'] });
  };

  const getStatusBadge = (status: ImportRow['status']) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"><CheckCircle2 className="w-3 h-3 mr-1" />Há»£p lá»‡</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"><AlertCircle className="w-3 h-3 mr-1" />Cáº£nh bĂ¡o</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"><XCircle className="w-3 h-3 mr-1" />Lá»—i</Badge>;
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
            Import há»£p Ä‘á»“ng tá»« Excel
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
                  <h4 className="font-medium mb-1">Táº£i file máº«u</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Táº£i file Excel máº«u Ä‘á»ƒ biáº¿t Ä‘á»‹nh dáº¡ng dá»¯ liá»‡u cáº§n nháº­p
                  </p>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Táº£i file máº«u (.xlsx)
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
                  <p className="font-medium">KĂ©o tháº£ file hoáº·c click Ä‘á»ƒ chá»n</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Há»— trá»£: .xlsx, .xls, .csv (tá»‘i Ä‘a 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">HÆ°á»›ng dáº«n:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>â€¢ CĂ¡c cá»™t báº¯t buá»™c: MĂ£ há»£p Ä‘á»“ng, TĂªn nhĂ¢n viĂªn, Loáº¡i há»£p Ä‘á»“ng</li>
                <li>â€¢ Loáº¡i HÄ: Há»£p Ä‘á»“ng 1 nÄƒm, 3 nÄƒm, 6 thĂ¡ng, há»c viá»‡c, thá»­ viá»‡c</li>
                <li>â€¢ Äá»‹nh dáº¡ng ngĂ y: DD/MM/YYYY (VD: 01/01/2024)</li>
                <li>â€¢ Tráº¡ng thĂ¡i: active, pending, expired</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">File: <span className="font-medium text-foreground">{file?.name}</span></p>
                <p className="text-sm text-muted-foreground mt-1">Tá»•ng sá»‘ dĂ²ng: <span className="font-medium text-foreground">{importData.length}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{validCount} há»£p lá»‡</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">{warningCount} cáº£nh bĂ¡o</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">{invalidCount} lá»—i</span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">DĂ²ng</TableHead>
                    <TableHead className="w-24">Tráº¡ng thĂ¡i</TableHead>
                    <TableHead>MĂ£ HÄ</TableHead>
                    <TableHead>NhĂ¢n viĂªn</TableHead>
                    <TableHead>Loáº¡i HÄ</TableHead>
                    <TableHead>NgĂ y hiá»‡u lá»±c</TableHead>
                    <TableHead className="w-48">Lá»—i/Cáº£nh bĂ¡o</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((row) => (
                    <TableRow key={row.rowNumber} className={row.status === 'invalid' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>{row.data.contract_code}</TableCell>
                      <TableCell>{row.data.employee_name}</TableCell>
                      <TableCell>{resolveContractTypeDisplayLabel(row.data.contract_type)}</TableCell>
                      <TableCell>{row.data.effective_date || '-'}</TableCell>
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
                Chá»n file khĂ¡c
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>Há»§y</Button>
                <Button onClick={handleImport} disabled={validCount + warningCount === 0}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {validCount + warningCount} há»£p Ä‘á»“ng
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="mt-4 font-medium">Äang import dá»¯ liá»‡u...</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tiáº¿n Ä‘á»™</span>
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
              <h3 className="mt-4 text-lg font-medium">Import hoĂ n táº¥t!</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-green-700 dark:text-green-400">ThĂ nh cĂ´ng</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">{importResults.warnings}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">CĂ³ cáº£nh bĂ¡o</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{importResults.failed}</p>
                <p className="text-sm text-red-700 dark:text-red-400">Tháº¥t báº¡i</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose}>ÄĂ³ng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
