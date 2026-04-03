import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  Phone,
  MapPin,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Interview {
  id: string;
  candidate_name: string;
  candidate_email: string | null;
  position: string | null;
  interview_date: string;
  interview_time: string;
  duration_minutes: number | null;
  interview_type: string | null;
  interviewer_name: string | null;
  status: string | null;
  location: string | null;
  meeting_link: string | null;
}

interface InterviewCalendarViewProps {
  interviews: Interview[];
  onViewDetail: (interview: Interview) => void;
  onOpenUpdate: (interview: Interview) => void;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500 border-blue-600',
  completed: 'bg-green-500 border-green-600',
  cancelled: 'bg-red-500 border-red-600',
  rescheduled: 'bg-orange-500 border-orange-600',
  no_show: 'bg-gray-500 border-gray-600',
};

const statusBgColors: Record<string, string> = {
  scheduled: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  completed: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
  cancelled: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  rescheduled: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  no_show: 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800',
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  onsite: MapPin,
  online: Video,
  phone: Phone,
};

export function InterviewCalendarView({ interviews, onViewDetail, onOpenUpdate }: InterviewCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const days = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const monthStart = startOfWeek(start, { weekStartsOn: 1 });
      const monthEnd = endOfWeek(end, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  }, [currentDate, viewMode]);

  const getInterviewsForDay = (day: Date) => {
    return interviews.filter((interview) =>
      isSameDay(new Date(interview.interview_date), day)
    );
  };

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getTitle = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy', { locale: vi });
  };

  const weekDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <Card className="overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hôm nay
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h3 className="text-lg font-semibold capitalize">{getTitle()}</h3>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Tuần
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Tháng
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'week' ? (
        <div className="grid grid-cols-7">
          {/* Week Header */}
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                'p-2 text-center border-b border-r last:border-r-0 bg-muted/20',
                isToday(day) && 'bg-primary/10'
              )}
            >
              <div className="text-xs text-muted-foreground">{weekDayNames[index]}</div>
              <div
                className={cn(
                  'text-lg font-semibold',
                  isToday(day) && 'text-primary'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}

          {/* Week Content */}
          {days.map((day, index) => {
            const dayInterviews = getInterviewsForDay(day);
            return (
              <div
                key={`content-${index}`}
                className={cn(
                  'min-h-[300px] border-r last:border-r-0 p-1',
                  isToday(day) && 'bg-primary/5'
                )}
              >
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1">
                    {dayInterviews.map((interview) => {
                      const TypeIcon = typeIcons[interview.interview_type || 'onsite'] || MapPin;
                      return (
                        <Tooltip key={interview.id}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'p-2 rounded-md border-l-4 cursor-pointer transition-all hover:shadow-md',
                                statusBgColors[interview.status || 'scheduled'],
                                statusColors[interview.status || 'scheduled']?.replace('bg-', 'border-l-')
                              )}
                              onClick={() => onViewDetail(interview as any)}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs font-medium">{interview.interview_time}</span>
                              </div>
                              <p className="text-sm font-medium truncate">{interview.candidate_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{interview.position}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <TypeIcon className="w-3 h-3 text-muted-foreground" />
                                {interview.interviewer_name && (
                                  <>
                                    <User className="w-3 h-3 text-muted-foreground ml-1" />
                                    <span className="text-xs text-muted-foreground truncate">
                                      {interview.interviewer_name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-medium">{interview.candidate_name}</p>
                              <p className="text-sm text-muted-foreground">{interview.position}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                {interview.interview_time}
                                {interview.duration_minutes && ` (${interview.duration_minutes} phút)`}
                              </div>
                              {interview.interviewer_name && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="w-4 h-4" />
                                  {interview.interviewer_name}
                                </div>
                              )}
                              <div className="flex gap-2 pt-2 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetail(interview as any);
                                  }}
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Chi tiết
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenUpdate(interview as any);
                                  }}
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Cập nhật
                                </Button>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {dayInterviews.length === 0 && (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground py-4">
                        Không có lịch
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      ) : (
        /* Month View */
        <div>
          {/* Month Header */}
          <div className="grid grid-cols-7 border-b">
            {weekDayNames.map((day, index) => (
              <div
                key={index}
                className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayInterviews = getInterviewsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[120px] border-r border-b last:border-r-0 p-1',
                    !isCurrentMonth && 'bg-muted/30',
                    isToday(day) && 'bg-primary/5'
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                      isToday(day) && 'bg-primary text-primary-foreground',
                      !isCurrentMonth && 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayInterviews.slice(0, 3).map((interview) => (
                      <Tooltip key={interview.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'px-1.5 py-0.5 rounded text-xs cursor-pointer truncate',
                              statusBgColors[interview.status || 'scheduled']
                            )}
                            onClick={() => onViewDetail(interview as any)}
                          >
                            <span className="font-medium">{interview.interview_time}</span>
                            <span className="ml-1 text-muted-foreground">{interview.candidate_name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{interview.candidate_name}</p>
                            <p className="text-sm">{interview.position}</p>
                            <p className="text-sm">
                              {interview.interview_time}
                              {interview.duration_minutes && ` (${interview.duration_minutes} phút)`}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                    {dayInterviews.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1.5">
                        +{dayInterviews.length - 3} khác
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="text-muted-foreground">Chú thích:</span>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', color)} />
              <span className="capitalize">
                {status === 'scheduled' && 'Đã lên lịch'}
                {status === 'completed' && 'Hoàn thành'}
                {status === 'cancelled' && 'Đã hủy'}
                {status === 'rescheduled' && 'Đổi lịch'}
                {status === 'no_show' && 'Vắng mặt'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
