import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Task, TASK_STATUSES } from '@/hooks/useTasks';
import { Flag, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface TaskKanbanViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: string) => void;
}

const KANBAN_COLUMNS = TASK_STATUSES.filter(s => !['cancelled'].includes(s.value));

export function TaskKanbanView({ tasks, onEdit, onStatusChange }: TaskKanbanViewProps) {
  const { t } = useTranslation();
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    const taskId = result.draggableId;
    if (newStatus !== result.source.droppableId) {
      onStatusChange(taskId, newStatus);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.value);
          return (
            <div key={col.value} className="flex-shrink-0 w-[280px]">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Badge variant="secondary" className={cn('text-xs', col.color)}>
                  {t(col.labelKey)}
                </Badge>
                <span className="text-xs text-muted-foreground">({colTasks.length})</span>
              </div>

              <Droppable droppableId={col.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-[200px] rounded-lg p-2 space-y-2 transition-colors',
                      snapshot.isDraggingOver ? 'bg-primary/5 border-2 border-dashed border-primary/30' : 'bg-muted/30'
                    )}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              'bg-card rounded-lg p-3 border border-border cursor-pointer hover:shadow-md transition-shadow',
                              snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
                            )}
                            onClick={() => onEdit(task)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-medium text-foreground line-clamp-2 flex-1">{task.title}</span>
                              <Flag className={cn('h-3.5 w-3.5 ml-2 shrink-0', getPriorityColor(task.priority))} fill={task.priority === 'urgent' ? 'currentColor' : 'none'} />
                            </div>

                            {task.department && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded inline-block mb-2">{task.department}</span>
                            )}

                            <Progress value={task.progress} className="h-1.5 mb-2" />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={task.assignee_avatar || ''} />
                                  <AvatarFallback className="text-[8px]">{(task.assignee_name || '?').charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{task.assignee_name || ''}</span>
                              </div>
                              {task.due_date && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(task.due_date), 'd/M')}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
