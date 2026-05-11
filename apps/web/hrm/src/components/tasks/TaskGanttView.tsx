import { useMemo, useRef } from 'react';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isWeekend, isSameDay, type Locale } from 'date-fns';
import { vi, enUS, zhCN, km } from 'date-fns/locale';
import { Task, TASK_STATUSES, TASK_PRIORITIES } from '@/hooks/useTasks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const DATE_LOCALES: Record<string, Locale> = {
  vi, en: enUS, zh: zhCN, km, lo: vi, my: vi,
};

interface TaskGanttViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const DAY_WIDTH = 36;
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 56;

export function TaskGanttView({ tasks, onEdit }: TaskGanttViewProps) {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateLocale = DATE_LOCALES[i18n.language] || enUS;

  // Determine timeline range from tasks
  const { timelineStart, timelineEnd, days } = useMemo(() => {
    const tasksWithDates = tasks.filter(t => t.start_date || t.due_date);
    if (tasksWithDates.length === 0) {
      const today = new Date();
      const start = addDays(today, -7);
      const end = addDays(today, 30);
      return {
        timelineStart: start,
        timelineEnd: end,
        days: eachDayOfInterval({ start, end }),
      };
    }

    const dates = tasksWithDates.flatMap(t => {
      const d: Date[] = [];
      if (t.start_date) d.push(new Date(t.start_date));
      if (t.due_date) d.push(new Date(t.due_date));
      return d;
    });

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const start = addDays(startOfWeek(minDate), -7);
    const end = addDays(endOfWeek(maxDate), 7);

    return {
      timelineStart: start,
      timelineEnd: end,
      days: eachDayOfInterval({ start, end }),
    };
  }, [tasks]);

  const today = new Date();

  const getBarStyle = (task: Task) => {
    if (!task.start_date && !task.due_date) return null;
    const start = task.start_date ? new Date(task.start_date) : new Date(task.due_date!);
    const end = task.due_date ? new Date(task.due_date) : new Date(task.start_date!);
    const left = differenceInDays(start, timelineStart) * DAY_WIDTH;
    const width = Math.max((differenceInDays(end, start) + 1) * DAY_WIDTH, DAY_WIDTH);
    return { left, width };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-amber-500';
      case 'on_hold': return 'bg-orange-400';
      case 'cancelled': return 'bg-red-400';
      default: return 'bg-muted-foreground/40';
    }
  };

  const getPriorityInfo = (priority: string) =>
    TASK_PRIORITIES.find(p => p.value === priority) || TASK_PRIORITIES[1];

  // Group days by month
  const months = useMemo(() => {
    const result: { label: string; days: number }[] = [];
    let currentMonth = '';
    days.forEach(day => {
      const monthLabel = format(day, 'MM/yyyy');
      if (monthLabel !== currentMonth) {
        currentMonth = monthLabel;
        result.push({ label: format(day, 'MMMM yyyy', { locale: dateLocale }), days: 1 });
      } else {
        result[result.length - 1].days++;
      }
    });
    return result;
  }, [days, dateLocale]);

  const todayIndex = days.findIndex(d => isSameDay(d, today));

  const scrollToToday = () => {
    if (scrollRef.current && todayIndex >= 0) {
      scrollRef.current.scrollLeft = todayIndex * DAY_WIDTH - 200;
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {tasks.length} {t('taskManagement.gantt.tasks')} · {tasks.filter(t => t.start_date || t.due_date).length} {t('taskManagement.gantt.withTime')}
        </span>
        <Button variant="outline" size="sm" onClick={scrollToToday} className="text-xs h-7">
          {t('taskManagement.gantt.today')}
        </Button>
      </div>

      <div className="flex">
        {/* Left Panel - Task List */}
        <div className="w-[280px] min-w-[280px] border-r border-border bg-card z-10">
          {/* Header */}
          <div className="h-14 border-b border-border flex items-center px-3 bg-muted/50">
            <span className="text-xs font-medium text-muted-foreground">{t('taskManagement.gantt.taskCol')}</span>
          </div>
          {/* Rows */}
          {tasks.map((task) => {
            const priorityInfo = getPriorityInfo(task.priority);
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 px-3 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                style={{ height: ROW_HEIGHT }}
                onClick={() => onEdit(task)}
              >
                <Flag className={cn('h-3.5 w-3.5 shrink-0', priorityInfo.color)} fill={task.priority === 'urgent' ? 'currentColor' : 'none'} />
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={task.assignee_avatar || ''} />
                  <AvatarFallback className="text-[9px]">{(task.assignee_name || '?').charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground truncate flex-1">{task.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{task.progress}%</span>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
              {t('taskManagement.table.noTasks')}
            </div>
          )}
        </div>

        {/* Right Panel - Gantt Chart */}
        <div className="flex-1 overflow-x-auto" ref={scrollRef}>
          <div style={{ width: days.length * DAY_WIDTH, minHeight: tasks.length * ROW_HEIGHT + HEADER_HEIGHT }}>
            {/* Timeline Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border" style={{ height: HEADER_HEIGHT }}>
              {/* Month row */}
              <div className="flex h-7">
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="border-r border-border flex items-center px-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/50"
                    style={{ width: m.days * DAY_WIDTH }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
              {/* Day row */}
              <div className="flex h-7">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-center text-[10px] border-r border-border',
                      isWeekend(day) ? 'bg-muted/60 text-muted-foreground/60' : 'text-muted-foreground',
                      isSameDay(day, today) && 'bg-primary/10 text-primary font-bold'
                    )}
                    style={{ width: DAY_WIDTH }}
                  >
                    {format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Bars */}
            <div className="relative">
              {/* Background grid */}
              {tasks.map((_, rowIdx) => (
                <div key={rowIdx} className="flex border-b border-border" style={{ height: ROW_HEIGHT }}>
                  {days.map((day, colIdx) => (
                    <div
                      key={colIdx}
                      className={cn(
                        'border-r border-border/50',
                        isWeekend(day) && 'bg-muted/30',
                      )}
                      style={{ width: DAY_WIDTH }}
                    />
                  ))}
                </div>
              ))}

              {/* Today line */}
              {todayIndex >= 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary/60 z-20"
                  style={{ left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2 }}
                />
              )}

              {/* Bars */}
              {tasks.map((task, rowIdx) => {
                const bar = getBarStyle(task);
                if (!bar) return null;
                const statusColor = getStatusColor(task.status);
                return (
                  <Tooltip key={task.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute cursor-pointer group"
                        style={{
                          left: bar.left,
                          top: rowIdx * ROW_HEIGHT + 10,
                          width: bar.width,
                          height: ROW_HEIGHT - 20,
                        }}
                        onClick={() => onEdit(task)}
                      >
                        {/* Background bar */}
                        <div className={cn('h-full rounded-md opacity-25', statusColor)} />
                        {/* Progress fill */}
                        <div
                          className={cn('absolute top-0 left-0 h-full rounded-md transition-all', statusColor)}
                          style={{ width: `${task.progress}%` }}
                        />
                        {/* Label */}
                        {bar.width > 80 && (
                          <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-white drop-shadow truncate">
                            {task.title}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">{task.title}</p>
                        <p>{t('taskManagement.form.status')}: {t(TASK_STATUSES.find(s => s.value === task.status)?.labelKey || '')}</p>
                        <p>{t('taskManagement.form.progress')}: {task.progress}%</p>
                        {task.start_date && <p>{t('taskManagement.form.startDate')}: {format(new Date(task.start_date), 'dd/MM/yyyy')}</p>}
                        {task.due_date && <p>{t('taskManagement.form.dueDate')}: {format(new Date(task.due_date), 'dd/MM/yyyy')}</p>}
                        {task.assignee_name && <p>{t('taskManagement.form.assignee')}: {task.assignee_name}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
