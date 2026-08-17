/**
 * @CODE-MEMORY
 * Screen:     Employees → Nhập Excel (E08)
 * UC:         TC-HRM-HDSD import spreadsheet
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-A
 * Purpose:    Server preview/commit Excel import dialog — ops-dense chrome.
 * must_keep:  preview→commit path; spreadsheetScope required; no OCR invent; U65 no seed
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: Sharp text on template/upload/preview/progress; instructions on xevn surface (no blue glass)
 * Why: ADR pale ban + dual-surface light ops canvas · inventory W3-EMP-A E08
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-F
 * change_mode: UPGRADE
 * What: DialogTitle ≥20 bold (S65 ATT settings import nested modal)
 * Why: ADR §10 ops-dense modal · inventory W3-ATT-F S65
 * must_keep: preview→commit path; spreadsheetScope; EMP-A sharp chrome
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT
 * change_mode: ADD
 * What: Wire ATT settings import Dialog → shared chrome testid att-import-dialog-precision
 * Why: ADR §16 LOCK · FE-DIALOG-01 shell · inventory S65 import
 * must_keep: preview→commit path; spreadsheetScope; no Nest invent; U65 no seed
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-att-dialog-ext.md
 */
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  commitEmployeeSpreadsheetImport,
  downloadEmployeeImportTemplate,
  previewEmployeeSpreadsheetImport,
  type EmployeeSpreadsheetImportPreview,
  type HrmSpreadsheetScope,
} from '@/integrations/hrmApi';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';

export interface EmployeeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after successful server commit; parent should refetch employees. */
  onImportSuccess: (result: { importedCount: number }) => void;
  /** Required for `hrm-api` scope resolution on preview/commit (see `resolveScopeContext`). */
  spreadsheetScope: HrmSpreadsheetScope | null;
}

type Step = 'upload' | 'preview' | 'importing' | 'complete';

type PreviewRowModel = {
  rowNumber: number;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string;
  hired_at: string;
  errors: string[];
  status: 'valid' | 'invalid';
};

function errorsByRow(errors: EmployeeSpreadsheetImportPreview['errors']) {
  const map = new Map<number, string[]>();
  for (const e of errors) {
    const line = e.field ? `${e.field}: ${e.message ?? e.code}` : e.message ?? e.code;
    const list = map.get(e.row) ?? [];
    list.push(line);
    map.set(e.row, list);
  }
  return map;
}

function buildPreviewRows(preview: EmployeeSpreadsheetImportPreview): PreviewRowModel[] {
  const byRow = errorsByRow(preview.errors);
  const out: PreviewRowModel[] = [];
  for (let i = 1; i <= preview.rowCount; i++) {
    const pr = preview.previewRows[i - 1];
    const errs = byRow.get(i) ?? [];
    out.push({
      rowNumber: i,
      employee_code: pr?.employee_code ?? '',
      email: pr?.email ?? '',
      full_name: pr?.full_name ?? '',
      job_title_key: pr?.job_title_key ?? '',
      hired_at: pr?.hired_at ?? '',
      errors: errs,
      status: errs.length > 0 ? 'invalid' : 'valid',
    });
  }
  return out;
}

export function EmployeeImportDialog({
  open,
  onOpenChange,
  onImportSuccess,
  spreadsheetScope,
}: EmployeeImportDialogProps) {
  const { t } = useTranslation();
  const d = (key: string) => String(t(`empImport.${key}`));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewPayload, setPreviewPayload] = useState<EmployeeSpreadsheetImportPreview | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState({ success: 0, failed: 0 });

  const tableRows = useMemo(
    () => (previewPayload ? buildPreviewRows(previewPayload) : []),
    [previewPayload],
  );

  const resetDialog = () => {
    setStep('upload');
    setFile(null);
    setPreviewPayload(null);
    setImportProgress(0);
    setImportResults({ success: 0, failed: 0 });
  };

  const handleDialogOpenChange = (next: boolean) => {
    if (!next) {
      resetDialog();
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };

  const downloadTemplate = async () => {
    try {
      const blob = await downloadEmployeeImportTemplate('xlsx');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employee_import_template.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(d('templateDownloaded'));
    } catch (e) {
      toast.error(toErrorMessage(e, d('templateDownloadFailed')));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!spreadsheetScope) {
      toast.error(d('scopeMissing'));
      return;
    }

    const okMimeOrExt =
      /\.(xlsx|xls|csv)$/i.test(uploadedFile.name) ||
      [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv',
        '',
      ].includes(uploadedFile.type);

    if (!okMimeOrExt) {
      toast.error(d('err.invalidFileType'));
      return;
    }

    setFile(uploadedFile);
    try {
      const preview = await previewEmployeeSpreadsheetImport(uploadedFile, spreadsheetScope);
      if (preview.rowCount === 0) {
        toast.error(d('err.emptyFile'));
        setFile(null);
        return;
      }
      setPreviewPayload(preview);
      setStep('preview');
    } catch (e) {
      toast.error(toErrorMessage(e, d('previewFailed')));
      setFile(null);
    }
    event.target.value = '';
  };

  const handleImport = async () => {
    if (!file || !spreadsheetScope) return;
    setStep('importing');
    setImportProgress(10);
    try {
      const result = await commitEmployeeSpreadsheetImport(file, spreadsheetScope);
      setImportProgress(100);
      setImportResults({ success: result.importedCount, failed: 0 });
      setStep('complete');
      onImportSuccess({ importedCount: result.importedCount });
    } catch (e) {
      setImportProgress(0);
      setStep('preview');
      if (e instanceof ApiClientError && e.code === 'SHEET-422' && e.details && typeof e.details === 'object') {
        const rowErrors = (e.details as { rowErrors?: EmployeeSpreadsheetImportPreview['errors'] }).rowErrors;
        if (rowErrors?.length) {
          setPreviewPayload((prev) =>
            prev
              ? {
                  ...prev,
                  errors: rowErrors,
                }
              : prev,
          );
        }
      }
      toast.error(toErrorMessage(e, d('commitFailed')));
    }
  };

  const getStatusBadge = (status: PreviewRowModel['status']) => {
    if (status === 'valid') {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {d('statusValid')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
        <XCircle className="w-3 h-3 mr-1" />
        {d('statusError')}
      </Badge>
    );
  };

  const validCount = tableRows.filter((r) => r.status === 'valid').length;
  const invalidCount = tableRows.filter((r) => r.status === 'invalid').length;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="max-w-5xl max-h-[90vh]"
        data-testid="att-import-dialog-precision"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[20px] font-bold text-xevn-text">
            <FileSpreadsheet className="w-5 h-5 text-xevn-primary" />
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
                  <h4 className="mb-1 font-medium text-xevn-text">{d('downloadTemplate')}</h4>
                  <p className="mb-3 text-sm text-xevn-textSecondary">{d('downloadTemplateDesc')}</p>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    {d('downloadTemplateBtn')}
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => spreadsheetScope && fileInputRef.current?.click()}
              role="presentation"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={!spreadsheetScope}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-xevn-text">{d('dragDrop')}</p>
                  <p className="mt-1 text-sm text-xevn-textSecondary">{d('supportedFormatsServer')}</p>
                  {!spreadsheetScope ? (
                    <p className="text-sm text-destructive mt-2">{d('scopeMissing')}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-xevn-border bg-xevn-background p-4">
              <h4 className="mb-2 font-medium text-xevn-text">{d('instructions')}</h4>
              <ul className="space-y-1 text-sm text-xevn-textSecondary">
                <li>• {d('instructionServer1')}</li>
                <li>• {d('instructionServer2')}</li>
                <li>• {d('instructionServer3')}</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'preview' && previewPayload && (
          <div className="space-y-4 py-4">
            {previewPayload.truncated ? (
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {d('previewTruncated')}
              </div>
            ) : null}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-xevn-textSecondary">
                  File: <span className="font-medium text-xevn-text">{file?.name}</span>
                </p>
                <p className="mt-1 text-sm text-xevn-textSecondary">
                  {d('totalRows')}:{' '}
                  <span className="font-medium text-xevn-text">{previewPayload.rowCount}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {validCount} {d('statusValid')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {invalidCount} {d('statusError')}
                  </span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{d('row')}</TableHead>
                    <TableHead className="w-28">{t('common.status.label')}</TableHead>
                    <TableHead>{d('col.jobTitleKey')}</TableHead>
                    <TableHead>{d('col.hiredAt')}</TableHead>
                    <TableHead>{t('empImport.col.code')}</TableHead>
                    <TableHead>{t('empImport.col.fullName')}</TableHead>
                    <TableHead>{t('empImport.col.email')}</TableHead>
                    <TableHead className="w-48">{d('errorsWarnings')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow
                      key={row.rowNumber}
                      className={row.status === 'invalid' ? 'bg-red-50 dark:bg-red-950/20' : ''}
                    >
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>{row.job_title_key}</TableCell>
                      <TableCell>{row.hired_at}</TableCell>
                      <TableCell>{row.employee_code}</TableCell>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          {row.errors.map((err, i) => (
                            <p key={i} className="text-red-600">
                              {err}
                            </p>
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
                <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleImport} disabled={validCount === 0}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('empImport.importCount', { count: validCount })}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="mt-4 font-medium text-xevn-text">{d('importing')}</p>
              <p className="mt-1 text-sm text-xevn-textSecondary">{d('doNotClose')}</p>
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
              <h3 className="mt-4 text-lg font-medium text-xevn-text">{d('importComplete')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{importResults.success}</p>
                <p className="text-sm text-green-700 dark:text-green-400">{d('resultSuccess')}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-600">{importResults.failed}</p>
                <p className="text-sm text-red-700 dark:text-red-400">{d('resultFailed')}</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => handleDialogOpenChange(false)}>{t('common.close')}</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
