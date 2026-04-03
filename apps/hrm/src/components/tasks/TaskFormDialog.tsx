import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Task, TaskFormData, TASK_STATUSES, TASK_PRIORITIES, TASK_WORK_MODES, MEETING_PLATFORMS } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
  defaultDate?: string;
}

export function TaskFormDialog({ open, onOpenChange, task, onSubmit, isLoading, defaultDate }: TaskFormDialogProps) {
  const { t } = useTranslation();
  const { employees } = useEmployees();
  const { departments } = useDepartments();
  const [form, setForm] = useState<TaskFormData>({
    title: '', description: '', status: 'todo', priority: 'medium',
    progress: 0, work_mode: 'offline', department: '', start_date: '', due_date: '',
    meeting_url: '', meeting_platform: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title, description: task.description || '', status: task.status,
        priority: task.priority, progress: task.progress, work_mode: task.work_mode || 'offline',
        assignee_id: task.assignee_id || '', assignee_name: task.assignee_name || '',
        assignee_avatar: task.assignee_avatar || '', department: task.department || '',
        start_date: task.start_date || '', due_date: task.due_date || '',
        meeting_url: task.meeting_url || '', meeting_platform: task.meeting_platform || '',
        tags: task.tags || [],
      });
    } else {
      setForm({
        title: '', description: '', status: 'todo', priority: 'medium',
        progress: 0, work_mode: 'offline', department: '',
        start_date: defaultDate || '', due_date: defaultDate || '',
        meeting_url: '', meeting_platform: '',
      });
    }
  }, [task, open, defaultDate]);

  const handleAssigneeChange = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    setForm(prev => ({ ...prev, assignee_id: employeeId, assignee_name: emp?.full_name || '', assignee_avatar: emp?.avatar_url || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(form); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? t('taskManagement.editTask') : t('taskManagement.createNew')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('taskManagement.form.taskName')} *</Label>
            <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={t('taskManagement.form.taskNamePlaceholder')} required />
          </div>
          <div>
            <Label>{t('taskManagement.form.description')}</Label>
            <Textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t('taskManagement.form.descriptionPlaceholder')} rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t('taskManagement.form.status')}</Label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_STATUSES.map(s => (<SelectItem key={s.value} value={s.value}>{t(s.labelKey)}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('taskManagement.form.priority')}</Label>
              <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_PRIORITIES.map(p => (<SelectItem key={p.value} value={p.value}>{t(p.labelKey)}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('taskManagement.form.workMode')}</Label>
              <Select value={form.work_mode || 'offline'} onValueChange={v => setForm(p => ({ ...p, work_mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TASK_WORK_MODES.map(m => (<SelectItem key={m.value} value={m.value}>{t(m.labelKey)}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('taskManagement.form.assignee')}</Label>
              <Select value={form.assignee_id || ''} onValueChange={handleAssigneeChange}>
                <SelectTrigger><SelectValue placeholder={t('taskManagement.form.selectAssignee')} /></SelectTrigger>
                <SelectContent>{employees.map(e => (<SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('taskManagement.form.department')}</Label>
              <Select value={form.department || ''} onValueChange={v => setForm(p => ({ ...p, department: v }))}>
                <SelectTrigger><SelectValue placeholder={t('taskManagement.form.selectDepartment')} /></SelectTrigger>
                <SelectContent>{departments.map(d => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t('taskManagement.form.startDate')}</Label><Input type="date" value={form.start_date || ''} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
            <div><Label>{t('taskManagement.form.dueDate')}</Label><Input type="date" value={form.due_date || ''} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
          </div>

          <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-1">
              <Video className="h-4 w-4 text-primary" />
              <Label className="font-medium">{t('taskManagement.form.meetingLink')}</Label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Select value={form.meeting_platform || ''} onValueChange={v => setForm(p => ({ ...p, meeting_platform: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('taskManagement.form.meetingPlatform')} /></SelectTrigger>
                  <SelectContent>{MEETING_PLATFORMS.map(m => (<SelectItem key={m.value} value={m.value}>{m.icon} {t(m.labelKey)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input value={form.meeting_url || ''} onChange={e => setForm(p => ({ ...p, meeting_url: e.target.value }))} placeholder={t('taskManagement.form.meetingUrlPlaceholder')} />
              </div>
            </div>
          </div>

          <div>
            <Label>{t('taskManagement.form.progress')}: {form.progress}%</Label>
            <Slider value={[form.progress]} onValueChange={([v]) => setForm(p => ({ ...p, progress: v }))} max={100} step={5} className="mt-2" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('taskManagement.cancel')}</Button>
            <Button type="submit" disabled={isLoading || !form.title.trim()}>{task ? t('taskManagement.update') : t('taskManagement.create')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
