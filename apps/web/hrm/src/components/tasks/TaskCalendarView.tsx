import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from 'date-fns';
import { vi, enUS, zhCN, km } from 'date-fns/locale';
import { Task, TASK_STATUSES, MEETING_PLATFORMS } from '@/hooks/useTasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Video, ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TaskCalendarViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreateOnDate?: (date: string) => void;
}

const WEEKDAY_KEYS = [
  'taskManagement.calendar.sun',
  'taskManagement.calendar.mon',
  'taskManagement.calendar.tue',
  'taskManagement.calendar.wed',
  'taskManagement.calendar.thu',
  'taskManagement.calendar.fri',
  'taskManagement.calendar.sat',
];

const localeMap: Record<string, any> = { vi, en: enUS, zh: zhCN, km };

export function TaskCalendarView({ tasks, onEdit, onCreateOnDate }: TaskCalendarViewProps) {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dateLocale = localeMap[i18n.language] || enUS;

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart);
    return { days, startPadding };
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach(task => {
      const dates = new Set<string>();
      if (task.start_date) dates.add(task.start_date);
      if (task.due_date) dates.add(task.due_date);
      dates.forEach(d => {
        if (!map[d]) map[d] = [];
        map[d].push(task);
      });
    });
    return map;
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500';
      case 'review': return 'bg-amber-500';
      case 'on_hold': return 'bg-orange-400';
      case 'cancelled': return 'bg-red-400';
      default: return 'bg-muted-foreground';
    }
  };

  const getMeetingIcon = (platform: string | null) => {
    const p = MEETING_PLATFORMS.find(m => m.value === platform);
    return p?.icon || '🔗';
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setCurrentMonth(new Date())}>
            {t('taskManagement.calendar.today')}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_KEYS.map((key, i) => (
          <div
            key={key}
            className={cn(
              'text-center text-xs font-medium py-2',
              i === 0 ? 'text-destructive/70' : 'text-muted-foreground'
            )}
          >
            {t(key)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: calendarDays.startPadding }).map((_, i) => (
          <div key={`pad-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/10" />
        ))}

        {calendarDays.days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentDay = isToday(day);
          const isSunday = getDay(day) === 0;

          return (
            <div
              key={dateKey}
              className={cn(
                'min-h-[100px] border-b border-r border-border p-1 transition-colors group/cell relative',
                isCurrentDay && 'bg-primary/5',
                isSunday && 'bg-destructive/3',
              )}
            >
              {/* Day number + add button */}
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span
                  className={cn(
                    'text-xs font-medium inline-flex items-center justify-center',
                    isCurrentDay && 'bg-primary text-primary-foreground rounded-full w-6 h-6',
                    !isCurrentDay && isSunday && 'text-destructive/70',
                    !isCurrentDay && !isSunday && 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex items-center gap-1">
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">{dayTasks.length}</span>
                  )}
                  {onCreateOnDate && (
                    <button
                      onClick={() => onCreateOnDate(dateKey)}
                      className="opacity-0 group-hover/cell:opacity-100 transition-opacity w-4 h-4 rounded flex items-center justify-center bg-primary/10 hover:bg-primary/20 text-primary"
                      title={t('taskManagement.calendar.createMeeting')}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <Tooltip key={task.id}>
                    <TooltipTrigger asChild>
                      <div
                        className="group flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onEdit(task)}
                      >
                        <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', getStatusColor(task.status))} />
                        <span className="text-[10px] text-foreground truncate flex-1 leading-tight">
                          {task.title}
                        </span>
                        {task.meeting_url && (
                          <span className="text-[9px] shrink-0">{getMeetingIcon(task.meeting_platform)}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="text-xs space-y-1.5">
                        <p className="font-semibold">{task.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn('text-[10px]', TASK_STATUSES.find(s => s.value === task.status)?.color)}>
                            {t(TASK_STATUSES.find(s => s.value === task.status)?.labelKey || '')}
                          </Badge>
                          <span>{task.progress}%</span>
                        </div>
                        {task.assignee_name && (
                          <p className="text-muted-foreground">👤 {task.assignee_name}</p>
                        )}
                        {task.meeting_url && (
                          <a
                            href={task.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            <Video className="h-3 w-3" />
                            {getMeetingIcon(task.meeting_platform)} {t('taskManagement.calendar.joinMeeting')}
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{dayTasks.length - 3} {t('taskManagement.calendar.more')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-muted/20">
        <span className="text-[10px] text-muted-foreground font-medium">{t('taskManagement.calendar.legend')}:</span>
        {MEETING_PLATFORMS.slice(0, 3).map(p => (
          <span key={p.value} className="text-[10px] text-muted-foreground flex items-center gap-1">
            {p.icon} {t(p.labelKey)}
          </span>
        ))}
      </div>
    </div>
  );
}
