import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useDepartments } from '@/hooks/useDepartments';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { TaskGanttView } from '@/components/tasks/TaskGanttView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskDashboardView } from '@/components/tasks/TaskDashboardView';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { TaskExportDialog } from '@/components/tasks/TaskExportDialog';
import { TaskImportDialog } from '@/components/tasks/TaskImportDialog';
import { useTasks, Task, TASK_STATUSES, TaskFormData } from '@/hooks/useTasks';
import { Plus, Search, List, LayoutGrid, GanttChart, CalendarDays, BarChart3, Loader2, Download, Upload } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function Tasks() {
  const { t } = useTranslation();
  const { tasks, isLoading, stats, createTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { departments } = useDepartments();
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt' | 'calendar' | 'dashboard'>('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState<string>('');

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (departmentFilter !== 'all') result = result.filter(t => t.department === departmentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q) || t.assignee_name?.toLowerCase().includes(q) || t.department?.toLowerCase().includes(q));
    }
    return result;
  }, [tasks, statusFilter, departmentFilter, search]);

  const handleCreate = () => { setEditingTask(null); setDefaultDate(''); setFormOpen(true); };
  const handleCreateOnDate = (date: string) => { setEditingTask(null); setDefaultDate(date); setFormOpen(true); };
  const handleEdit = (task: Task) => { setEditingTask(task); setFormOpen(true); };
  const handleSubmit = (data: any) => {
    if (editingTask) updateTask.mutate({ ...data, id: editingTask.id }, { onSuccess: () => setFormOpen(false) });
    else createTask.mutate(data, { onSuccess: () => setFormOpen(false) });
  };
  const handleDelete = () => { if (deleteId) { deleteTask.mutate(deleteId); setDeleteId(null); } };
  const handleStatusChange = (id: string, status: string) => { updateTaskStatus.mutate({ id, status }); };

  const handleBulkImport = (importedTasks: TaskFormData[]) => {
    let completed = 0, failed = 0;
    importedTasks.forEach(tk => {
      createTask.mutate(tk, {
        onSuccess: () => { completed++; if (completed + failed === importedTasks.length) { toast({ title: t('taskManagement.toast.importComplete'), description: `${t('taskManagement.toast.importCreated')} ${completed} ${t('taskManagement.toast.importTasks')}${failed > 0 ? `, ${failed} ${t('taskManagement.toast.importErrors')}` : ''}` }); setImportOpen(false); } },
        onError: () => { failed++; if (completed + failed === importedTasks.length) { toast({ title: t('taskManagement.toast.importComplete'), description: `${t('taskManagement.toast.importCreated')} ${completed} ${t('taskManagement.toast.importTasks')}, ${failed} ${t('taskManagement.toast.importErrors')}`, variant: failed > 0 ? 'destructive' : 'default' }); setImportOpen(false); } },
      });
    });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const statusTabs = [
    { value: 'all', label: `${t('taskManagement.all')} (${stats.total})` },
    ...TASK_STATUSES.map(s => ({ value: s.value, label: `${t(s.labelKey)} (${stats[s.value as keyof typeof stats] || 0})` })),
  ];

  const viewModes = [
    { value: 'list' as const, label: t('taskManagement.views.list'), icon: List },
    { value: 'kanban' as const, label: t('taskManagement.views.kanban'), icon: LayoutGrid },
    { value: 'gantt' as const, label: t('taskManagement.views.gantt'), icon: GanttChart },
    { value: 'calendar' as const, label: t('taskManagement.views.calendar'), icon: CalendarDays },
    { value: 'dashboard' as const, label: t('taskManagement.views.dashboard'), icon: BarChart3 },
  ];

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <PageHeader title={t('taskManagement.title')} subtitle={t('taskManagement.subtitle')} actions={
        <div className="flex items-center gap-2">
          <PermissionGate module="tasks" action="create">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4 mr-1" />{t('taskManagement.import')}</Button>
          </PermissionGate>
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}><Download className="h-4 w-4 mr-1" />{t('taskManagement.export')}</Button>
          <PermissionGate module="tasks" action="create">
            <Button onClick={handleCreate}><Plus className="h-4 w-4 mr-1" />{t('taskManagement.createTask')}</Button>
          </PermissionGate>
        </div>
      } />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 w-full sm:w-auto">
          {viewModes.map(vm => (
            <Button key={vm.value} variant={viewMode === vm.value ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(vm.value)} className="shrink-0">
              <vm.icon className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">{vm.label}</span>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Select value={departmentFilter} onValueChange={v => { setDepartmentFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder={t('taskManagement.filterByDepartment')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('taskManagement.allDepartments')}</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('taskManagement.search')} value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9" />
          </div>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={v => { setStatusFilter(v); setCurrentPage(1); }} className="mb-4">
        <TabsList className="h-auto bg-transparent gap-1 p-0 overflow-x-auto scrollbar-hide flex flex-nowrap w-full sm:w-auto sm:flex-wrap">
           {statusTabs.map(tab => (
             <TabsTrigger key={tab.value} value={tab.value} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1.5 shrink-0">{tab.label}</TabsTrigger>
           ))}
         </TabsList>
      </Tabs>

      {viewMode === 'list' && <TaskListView tasks={filteredTasks} onEdit={handleEdit} onDelete={id => setDeleteId(id)} onStatusChange={handleStatusChange} currentPage={currentPage} pageSize={10} onPageChange={setCurrentPage} />}
      {viewMode === 'kanban' && <TaskKanbanView tasks={filteredTasks} onEdit={handleEdit} onStatusChange={handleStatusChange} />}
      {viewMode === 'gantt' && <TaskGanttView tasks={filteredTasks} onEdit={handleEdit} />}
      {viewMode === 'calendar' && <TaskCalendarView tasks={filteredTasks} onEdit={handleEdit} onCreateOnDate={handleCreateOnDate} />}
      {viewMode === 'dashboard' && <TaskDashboardView tasks={tasks} />}

      <TaskFormDialog open={formOpen} onOpenChange={setFormOpen} task={editingTask} onSubmit={handleSubmit} isLoading={createTask.isPending || updateTask.isPending} defaultDate={defaultDate} />
      <TaskExportDialog open={exportOpen} onOpenChange={setExportOpen} tasks={filteredTasks} />
      <TaskImportDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleBulkImport} isLoading={createTask.isPending} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('taskManagement.deleteConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('taskManagement.deleteMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('taskManagement.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('taskManagement.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
