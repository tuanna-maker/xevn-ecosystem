import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from '@/hooks/useTasks';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

interface TaskExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

export function TaskExportDialog({ open, onOpenChange, tasks }: TaskExportDialogProps) {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      let data = tasks;
      if (statusFilter !== 'all') data = data.filter(tk => tk.status === statusFilter);

      const rows = data.map((tk, idx) => ({
        'STT': idx + 1,
        [t('taskManagement.form.taskName')]: tk.title,
        [t('taskManagement.form.description')]: tk.description || '',
        [t('taskManagement.form.status')]: t(TASK_STATUSES.find(s => s.value === tk.status)?.labelKey || '') || tk.status,
        [t('taskManagement.form.priority')]: t(TASK_PRIORITIES.find(p => p.value === tk.priority)?.labelKey || '') || tk.priority,
        [t('taskManagement.form.workMode')]: tk.work_mode === 'online' ? 'Online' : 'Offline',
        [t('taskManagement.form.progress') + ' (%)']: tk.progress,
        [t('taskManagement.form.assignee')]: tk.assignee_name || '',
        [t('taskManagement.form.department')]: tk.department || '',
        [t('taskManagement.form.startDate')]: tk.start_date || '',
        [t('taskManagement.form.dueDate')]: tk.due_date || '',
        'Tags': tk.tags?.join(', ') || '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      if (rows.length > 0) {
        ws['!cols'] = Object.keys(rows[0]).map(key => ({ wch: Math.max(key.length, ...rows.map(r => String((r as any)[key] || '').length)) + 2 }));
      }
      XLSX.utils.book_append_sheet(wb, ws, t('taskManagement.title'));
      XLSX.writeFile(wb, `tasks-${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({ title: t('taskManagement.toast.success'), description: `${t('taskManagement.toast.exportSuccess')} ${rows.length} ${t('taskManagement.toast.importTasks')}` });
      onOpenChange(false);
    } catch (e) {
      toast({ title: t('taskManagement.toast.error'), description: t('taskManagement.toast.exportError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const filteredCount = statusFilter === 'all' ? tasks.length : tasks.filter(tk => tk.status === statusFilter).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{t('taskManagement.exportDialog.title')}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('taskManagement.exportDialog.filterByStatus')}</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('taskManagement.exportDialog.allStatuses')}</SelectItem>
                {TASK_STATUSES.map(s => (<SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{t('taskManagement.exportDialog.willExport')} <strong>{filteredCount}</strong> {t('taskManagement.exportDialog.tasksToExcel')}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>{t('taskManagement.cancel')}</Button>
            <Button onClick={handleExport} disabled={exporting || filteredCount === 0}>
              {exporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}{t('taskManagement.exportDialog.exportExcel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
