import { useState } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Task, TASK_STATUSES, TASK_PRIORITIES, TASK_WORK_MODES } from '@/hooks/useTasks';
import { MoreHorizontal, Pencil, Trash2, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TaskListView({ tasks, onEdit, onDelete, onStatusChange, currentPage, pageSize, onPageChange }: TaskListViewProps) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(tasks.length / pageSize);
  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusInfo = (status: string) => TASK_STATUSES.find(s => s.value === status) || TASK_STATUSES[0];
  const getPriorityInfo = (priority: string) => TASK_PRIORITIES.find(p => p.value === priority) || TASK_PRIORITIES[1];

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start && !end) return '—';
    const s = start ? format(new Date(start), 'd/M') : '?';
    const e = end ? format(new Date(end), 'd/M') : '?';
    if (start && end) {
      const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
      return `${s} - ${e} (${days} ${t('taskManagement.table.days')})`;
    }
    return `${s} - ${e}`;
  };

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-2 px-1">
        {t('taskManagement.table.showing')} {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, tasks.length)} {t('taskManagement.table.of')} {tasks.length} {t('taskManagement.table.records')}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="w-10 px-3 py-2.5"><Checkbox /></th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.table.assign')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[250px]">{t('taskManagement.table.taskName')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.form.department')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.table.status')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.table.performer')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.table.time')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[150px]">{t('taskManagement.table.progress')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.table.priority')}</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">{t('taskManagement.table.workMode')}</th>
              <th className="w-10 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.map((task) => {
              const statusInfo = getStatusInfo(task.status);
              const priorityInfo = getPriorityInfo(task.priority);
              return (
                <tr key={task.id} className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onEdit(task)}>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}><Checkbox /></td>
                  <td className="px-3 py-3">
                    {task.assignee_avatar || task.assignee_name ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={task.assignee_avatar || ''} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">{(task.assignee_name || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">?</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-sm font-medium text-foreground line-clamp-1">{task.title}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-muted-foreground">{task.department || '—'}</span>
                  </td>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <Badge variant="secondary" className={cn('text-xs font-medium whitespace-nowrap', statusInfo.color)}>{t(statusInfo.labelKey)}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center -space-x-1">
                      <Avatar className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={task.assignee_avatar || ''} />
                        <AvatarFallback className="text-[10px]">{(task.assignee_name || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateRange(task.start_date, task.due_date)}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="h-2 flex-1" />
                      <span className={cn('text-xs font-semibold min-w-[32px] text-right', task.progress >= 100 ? 'text-emerald-600' : 'text-foreground')}>{task.progress}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Flag className={cn('h-4 w-4', priorityInfo.color)} fill={task.priority === 'urgent' ? 'currentColor' : 'none'} />
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className="text-[10px]">{task.work_mode === 'online' ? '🌐 Online' : '🏢 Offline'}</Badge>
                  </td>
                  <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}><Pencil className="h-4 w-4 mr-2" />{t('taskManagement.table.edit')}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}><Trash2 className="h-4 w-4 mr-2" />{t('taskManagement.delete')}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {paginatedTasks.length === 0 && (
              <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">{t('taskManagement.table.noTasks')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-xs text-muted-foreground">{t('taskManagement.table.page')} {currentPage} / {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>‹</Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(p)} className="min-w-[32px]">{p}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>›</Button>
          </div>
        </div>
      )}
    </div>
  );
}
