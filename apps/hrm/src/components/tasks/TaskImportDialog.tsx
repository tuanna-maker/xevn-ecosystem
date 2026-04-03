import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { TaskFormData, TASK_STATUSES, TASK_PRIORITIES } from '@/hooks/useTasks';
import { useTranslation } from 'react-i18next';

interface TaskImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (tasks: TaskFormData[]) => void;
  isLoading?: boolean;
}

// Map status/priority values directly since labels are i18n now
const STATUS_VALUES = TASK_STATUSES.map(s => s.value);
const PRIORITY_VALUES = TASK_PRIORITIES.map(p => p.value);

export function TaskImportDialog({ open, onOpenChange, onImport, isLoading }: TaskImportDialogProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<TaskFormData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');

  // Build label-to-value maps dynamically using current translations
  const getStatusMap = () => {
    const map: Record<string, string> = {};
    TASK_STATUSES.forEach(s => { map[t(s.labelKey).toLowerCase()] = s.value; });
    return map;
  };
  const getPriorityMap = () => {
    const map: Record<string, string> = {};
    TASK_PRIORITIES.forEach(p => { map[t(p.labelKey).toLowerCase()] = p.value; });
    return map;
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [{
      [t('taskManagement.form.taskName')]: 'Example: Design UI',
      [t('taskManagement.form.description')]: 'Description',
      [t('taskManagement.form.status')]: t(TASK_STATUSES[0].labelKey),
      [t('taskManagement.form.priority')]: t(TASK_PRIORITIES[1].labelKey),
      [t('taskManagement.form.progress') + ' (%)']: 0,
      [t('taskManagement.form.assignee')]: 'Name',
      [t('taskManagement.form.department')]: 'IT',
      [t('taskManagement.form.startDate')]: '2026-03-20',
      [t('taskManagement.form.dueDate')]: '2026-04-20',
      [t('taskManagement.form.workMode')]: 'Offline',
      'Tags': 'design, ui',
    }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = Object.keys(templateData[0]).map(k => ({ wch: Math.max(k.length + 2, 20) }));
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'task-import-template.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setErrors([]);

    const statusMap = getStatusMap();
    const priorityMap = getPriorityMap();

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        const errs: string[] = [];
        const parsed: TaskFormData[] = [];
        const nameKey = t('taskManagement.form.taskName');
        const descKey = t('taskManagement.form.description');
        const statusKey = t('taskManagement.form.status');
        const priorityKey = t('taskManagement.form.priority');
        const progressKey = t('taskManagement.form.progress') + ' (%)';
        const assigneeKey = t('taskManagement.form.assignee');
        const deptKey = t('taskManagement.form.department');
        const startKey = t('taskManagement.form.startDate');
        const dueKey = t('taskManagement.form.dueDate');
        const modeKey = t('taskManagement.form.workMode');

        rows.forEach((row, idx) => {
          // Try multiple possible column names
          const title = String(row[nameKey] || row['Tên công việc'] || row['Task Name'] || '').trim();
          if (!title) { errs.push(`Row ${idx + 2}: Missing task name`); return; }

          const statusLabel = String(row[statusKey] || row['Trạng thái'] || row['Status'] || '').toLowerCase().trim();
          const priorityLabel = String(row[priorityKey] || row['Độ ưu tiên'] || row['Priority'] || '').toLowerCase().trim();
          const workMode = String(row[modeKey] || row['Hình thức'] || row['Work Mode'] || '').toLowerCase().trim();

          parsed.push({
            title,
            description: String(row[descKey] || row['Mô tả'] || row['Description'] || ''),
            status: statusMap[statusLabel] || (STATUS_VALUES.includes(statusLabel) ? statusLabel : 'todo'),
            priority: priorityMap[priorityLabel] || (PRIORITY_VALUES.includes(priorityLabel) ? priorityLabel : 'medium'),
            progress: Math.min(100, Math.max(0, Number(row[progressKey] || row['Tiến độ (%)'] || row['Progress (%)'] || 0))),
            work_mode: workMode === 'online' ? 'online' : 'offline',
            assignee_name: String(row[assigneeKey] || row['Người thực hiện'] || row['Assignee'] || ''),
            department: String(row[deptKey] || row['Phòng ban'] || row['Department'] || ''),
            start_date: String(row[startKey] || row['Ngày bắt đầu'] || row['Start Date'] || ''),
            due_date: String(row[dueKey] || row['Ngày kết thúc'] || row['Due Date'] || ''),
            tags: String(row['Tags'] || '').split(',').map(s => s.trim()).filter(Boolean),
          });
        });

        setErrors(errs);
        setPreview(parsed);
      } catch {
        setErrors([t('taskManagement.importDialog.error')]);
        setPreview([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => { if (preview.length === 0) return; onImport(preview); setPreview([]); setFileName(''); setErrors([]); };
  const handleClose = (o: boolean) => { if (!o) { setPreview([]); setFileName(''); setErrors([]); } onOpenChange(o); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{t('taskManagement.importDialog.title')}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/30">
            <FileSpreadsheet className="h-8 w-8 text-emerald-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('taskManagement.importDialog.downloadTemplate')}</p>
              <p className="text-xs text-muted-foreground">{t('taskManagement.importDialog.downloadTemplateDesc')}</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="h-4 w-4 mr-1" /> {t('taskManagement.importDialog.download')}</Button>
          </div>

          <div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" className="w-full h-20 border-dashed" onClick={() => fileRef.current?.click()}>
              <div className="text-center"><Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" /><span className="text-sm">{fileName || t('taskManagement.importDialog.selectFile')}</span></div>
            </Button>
          </div>

          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-1"><AlertCircle className="h-4 w-4 text-destructive" /><span className="text-sm font-medium text-destructive">{t('taskManagement.importDialog.error')}</span></div>
              {errors.map((err, i) => (<p key={i} className="text-xs text-destructive/80">{err}</p>))}
            </div>
          )}

          {preview.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-600">{t('taskManagement.importDialog.readSuccess')} <strong>{preview.length}</strong> {t('taskManagement.importDialog.tasksRead')}</p>
              <ul className="mt-1 space-y-0.5">
                {preview.slice(0, 5).map((tk, i) => (<li key={i} className="text-xs text-muted-foreground truncate">• {tk.title}</li>))}
                {preview.length > 5 && (<li className="text-xs text-muted-foreground">... {t('taskManagement.importDialog.andMore')} {preview.length - 5} {t('taskManagement.importDialog.moreTasks')}</li>)}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleClose(false)}>{t('taskManagement.cancel')}</Button>
            <Button onClick={handleImport} disabled={preview.length === 0 || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
              {t('taskManagement.importDialog.importBtn')} {preview.length > 0 ? `${preview.length} ${t('taskManagement.importDialog.tasksRead')}` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
