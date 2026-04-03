import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CandidateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onImportSuccess: () => void;
}

interface ImportRow {
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  source?: string;
  stage?: string;
  rating?: number;
  applied_date?: string;
  nationality?: string;
  hometown?: string;
  marital_status?: string;
  notes?: string;
  // Validation
  isValid: boolean;
  errors: string[];
}

const validStages = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];
const validSources = ['LinkedIn', 'Website', 'Giới thiệu', 'Referral', 'Email', 'TopCV', 'VietnamWorks', 'Facebook', 'Hội chợ việc làm'];

export function CandidateImportDialog({
  open,
  onOpenChange,
  companyId,
  onImportSuccess,
}: CandidateImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'result'>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: [],
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const parseExcelDate = (excelDate: any): string | undefined => {
    if (!excelDate) return undefined;
    
    if (typeof excelDate === 'number') {
      // Excel serial date
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return format(date, 'yyyy-MM-dd');
    }
    
    if (typeof excelDate === 'string') {
      // Try to parse various date formats
      const cleanDate = excelDate.trim();
      
      // dd/MM/yyyy format
      const ddmmyyyy = cleanDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        return `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`;
      }
      
      // yyyy-MM-dd format
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
        return cleanDate;
      }
    }
    
    return undefined;
  };

  const validateRow = (row: any, index: number): ImportRow => {
    const errors: string[] = [];
    
    const fullName = String(row['Họ tên'] || row['full_name'] || row['name'] || '').trim();
    const email = String(row['Email'] || row['email'] || '').trim().toLowerCase();
    const phone = String(row['Số điện thoại'] || row['phone'] || '').trim() || undefined;
    const position = String(row['Vị trí'] || row['position'] || '').trim() || undefined;
    const source = String(row['Nguồn'] || row['source'] || '').trim() || undefined;
    let stage = String(row['Trạng thái'] || row['stage'] || 'applied').trim().toLowerCase();
    const ratingStr = row['Đánh giá'] || row['rating'];
    const appliedDateStr = row['Ngày ứng tuyển'] || row['applied_date'];
    const nationality = String(row['Quốc tịch'] || row['nationality'] || '').trim() || undefined;
    const hometown = String(row['Quê quán'] || row['hometown'] || '').trim() || undefined;
    const maritalStatus = String(row['Tình trạng hôn nhân'] || row['marital_status'] || '').trim() || undefined;
    const notes = String(row['Ghi chú'] || row['notes'] || '').trim() || undefined;

    // Validate required fields
    if (!fullName) {
      errors.push(`Dòng ${index + 1}: Họ tên không được để trống`);
    }
    
    if (!email) {
      errors.push(`Dòng ${index + 1}: Email không được để trống`);
    } else if (!validateEmail(email)) {
      errors.push(`Dòng ${index + 1}: Email không hợp lệ`);
    }

    // Map Vietnamese stage names to English
    const stageMap: Record<string, string> = {
      'ứng tuyển': 'applied',
      'sàng lọc': 'screening',
      'phỏng vấn': 'interview',
      'đề xuất': 'offer',
      'đã tuyển': 'hired',
      'từ chối': 'rejected',
    };
    
    if (stageMap[stage]) {
      stage = stageMap[stage];
    }
    
    if (!validStages.includes(stage)) {
      stage = 'applied';
    }

    // Parse rating
    let rating: number | undefined;
    if (ratingStr !== undefined && ratingStr !== '') {
      const parsed = Number(ratingStr);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        rating = Math.round(parsed);
      }
    }

    // Parse applied date
    const applied_date = parseExcelDate(appliedDateStr);

    return {
      full_name: fullName,
      email,
      phone,
      position,
      source,
      stage,
      rating,
      applied_date,
      nationality,
      hometown,
      marital_status: maritalStatus,
      notes,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: 'Lỗi',
          description: 'File Excel không có dữ liệu',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      const parsedData = jsonData.map((row, index) => validateRow(row, index));
      setImportData(parsedData);
      setStep('preview');
    } catch (error) {
      console.error('Error parsing Excel:', error);
      toast({
        title: 'Lỗi đọc file',
        description: 'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Họ tên': 'Nguyễn Văn A',
        'Email': 'nguyenvana@email.com',
        'Số điện thoại': '0901234567',
        'Vị trí': 'Frontend Developer',
        'Nguồn': 'LinkedIn',
        'Trạng thái': 'Ứng tuyển',
        'Đánh giá': 4,
        'Ngày ứng tuyển': format(new Date(), 'dd/MM/yyyy', { locale: vi }),
        'Quốc tịch': 'Việt Nam',
        'Quê quán': 'Hà Nội',
        'Tình trạng hôn nhân': 'Độc thân',
        'Ghi chú': 'Ứng viên tiềm năng',
      },
      {
        'Họ tên': 'Trần Thị B',
        'Email': 'tranthib@email.com',
        'Số điện thoại': '0912345678',
        'Vị trí': 'Backend Developer',
        'Nguồn': 'TopCV',
        'Trạng thái': 'Phỏng vấn',
        'Đánh giá': 5,
        'Ngày ứng tuyển': format(new Date(), 'dd/MM/yyyy', { locale: vi }),
        'Quốc tịch': 'Việt Nam',
        'Quê quán': 'TP.HCM',
        'Tình trạng hôn nhân': 'Đã kết hôn',
        'Ghi chú': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
      { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
      { wch: 18 }, { wch: 30 },
    ];

    XLSX.writeFile(workbook, 'template-import-ung-vien.xlsx');

    toast({
      title: 'Đã tải template',
      description: 'File template đã được tải về máy',
    });
  };

  const handleImport = async () => {
    const validRows = importData.filter((row) => row.isValid);
    
    if (validRows.length === 0) {
      toast({
        title: 'Không có dữ liệu hợp lệ',
        description: 'Vui lòng kiểm tra lại file Excel',
        variant: 'destructive',
      });
      return;
    }

    setStep('importing');
    setImportProgress(0);

    const result = { success: 0, failed: 0, errors: [] as string[] };
    const batchSize = 10;
    
    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      
    const insertData = batch.map((row) => ({
        company_id: companyId,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        position: row.position,
        source: row.source,
        stage: row.stage,
        rating: row.rating,
        applied_date: row.applied_date,
        nationality: row.nationality,
        hometown: row.hometown,
        marital_status: row.marital_status,
        notes: row.notes,
      }));

      const { data, error } = await supabase
        .from('candidates')
        .insert(insertData)
        .select();

      if (error) {
        result.failed += batch.length;
        result.errors.push(`Lỗi batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        result.success += data?.length || 0;
        result.failed += batch.length - (data?.length || 0);
      }

      setImportProgress(Math.round(((i + batch.length) / validRows.length) * 100));
    }

    setImportResult(result);
    setStep('result');

    if (result.success > 0) {
      onImportSuccess();
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFileName('');
    setImportData([]);
    setImportProgress(0);
    setImportResult({ success: 0, failed: 0, errors: [] });
    onOpenChange(false);
  };

  const validCount = importData.filter((r) => r.isValid).length;
  const invalidCount = importData.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import ứng viên từ Excel
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Tải lên file Excel chứa danh sách ứng viên để import vào hệ thống'}
            {step === 'preview' && 'Xem trước dữ liệu và kiểm tra lỗi trước khi import'}
            {step === 'importing' && 'Đang import dữ liệu...'}
            {step === 'result' && 'Kết quả import'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === 'upload' && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hướng dẫn</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Tải template mẫu và điền thông tin ứng viên</li>
                    <li>Các cột bắt buộc: <strong>Họ tên</strong>, <strong>Email</strong></li>
                    <li>Trạng thái hợp lệ: Ứng tuyển, Sàng lọc, Phỏng vấn, Đề xuất, Đã tuyển, Từ chối</li>
                    <li>Nguồn hợp lệ: LinkedIn, Website, Giới thiệu, Email, TopCV, VietnamWorks, Facebook, Hội chợ việc làm</li>
                    <li>Đánh giá từ 1 đến 5 sao</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex justify-center">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Tải template mẫu
                </Button>
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Đang xử lý file...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <p className="font-medium">Kéo thả file Excel hoặc click để chọn</p>
                    <p className="text-sm text-muted-foreground">Hỗ trợ file .xlsx, .xls</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {validCount} hợp lệ
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {invalidCount} lỗi
                    </Badge>
                  )}
                </div>
              </div>

              {invalidCount > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Có {invalidCount} dòng không hợp lệ</AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-20 mt-2">
                      <ul className="list-disc list-inside text-sm">
                        {importData
                          .filter((r) => !r.isValid)
                          .flatMap((r) => r.errors)
                          .slice(0, 10)
                          .map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        {importData.filter((r) => !r.isValid).flatMap((r) => r.errors).length > 10 && (
                          <li>... và {importData.filter((r) => !r.isValid).flatMap((r) => r.errors).length - 10} lỗi khác</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              <ScrollArea className="h-[300px] border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Nguồn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="w-10">Hợp lệ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importData.map((row, index) => (
                      <TableRow key={index} className={!row.isValid ? 'bg-destructive/10' : ''}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{row.full_name || '-'}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>{row.phone || '-'}</TableCell>
                        <TableCell>{row.position || '-'}</TableCell>
                        <TableCell>{row.source || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {row.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-destructive" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Chọn file khác
                </Button>
                <Button onClick={handleImport} disabled={validCount === 0}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import {validCount} ứng viên
                </Button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-lg font-medium">Đang import ứng viên...</p>
              <div className="w-full max-w-md">
                <Progress value={importProgress} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">{importProgress}%</p>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-8 py-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{importResult.success}</p>
                  <p className="text-sm text-muted-foreground">Thành công</p>
                </div>

                {importResult.failed > 0 && (
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-2">
                      <X className="w-8 h-8 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-destructive">{importResult.failed}</p>
                    <p className="text-sm text-muted-foreground">Thất bại</p>
                  </div>
                )}
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Chi tiết lỗi</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <Button onClick={handleClose}>Đóng</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
