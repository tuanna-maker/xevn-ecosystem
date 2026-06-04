import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { createOperationsTask, listOperationsTasks, updateOperationsTaskStatus } from '@/integrations/hrmApi';

export interface Task {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  work_mode: string;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  reporter_id: string | null;
  reporter_name: string | null;
  department: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  meeting_url: string | null;
  meeting_platform: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  members?: TaskMember[];
}

export interface TaskMember {
  id: string;
  task_id: string;
  employee_id: string | null;
  employee_name: string;
  employee_avatar: string | null;
  role: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  work_mode?: string;
  assignee_id?: string;
  assignee_name?: string;
  assignee_avatar?: string;
  department?: string;
  start_date?: string;
  due_date?: string;
  meeting_url?: string;
  meeting_platform?: string;
  tags?: string[];
}

const toApiStatus = (status: string): "todo" | "in_progress" | "done" | "blocked" => {
  if (status === 'review' || status === 'completed') return 'done';
  if (status === 'on_hold' || status === 'cancelled') return 'blocked';
  if (status === 'in_progress') return 'in_progress';
  return 'todo';
};

const fromApiStatus = (status: string): string => {
  if (status === 'done') return 'completed';
  if (status === 'blocked') return 'on_hold';
  return status;
};

export const TASK_STATUSES = [
  { value: 'todo', labelKey: 'taskManagement.statuses.todo', color: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', labelKey: 'taskManagement.statuses.in_progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'review', labelKey: 'taskManagement.statuses.review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'on_hold', labelKey: 'taskManagement.statuses.on_hold', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'completed', labelKey: 'taskManagement.statuses.completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'cancelled', labelKey: 'taskManagement.statuses.cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

export const TASK_PRIORITIES = [
  { value: 'low', labelKey: 'taskManagement.priorities.low', color: 'text-muted-foreground' },
  { value: 'medium', labelKey: 'taskManagement.priorities.medium', color: 'text-amber-500' },
  { value: 'high', labelKey: 'taskManagement.priorities.high', color: 'text-orange-500' },
  { value: 'urgent', labelKey: 'taskManagement.priorities.urgent', color: 'text-destructive' },
];

export const TASK_WORK_MODES = [
  { value: 'offline', labelKey: 'taskManagement.workModes.offline' },
  { value: 'online', labelKey: 'taskManagement.workModes.online' },
];

export const MEETING_PLATFORMS = [
  { value: 'google_meet', labelKey: 'taskManagement.meetingPlatforms.google_meet', icon: '📹', urlPrefix: 'https://meet.google.com/' },
  { value: 'zoom', labelKey: 'taskManagement.meetingPlatforms.zoom', icon: '🔵', urlPrefix: 'https://zoom.us/' },
  { value: 'microsoft_teams', labelKey: 'taskManagement.meetingPlatforms.microsoft_teams', icon: '🟣', urlPrefix: 'https://teams.microsoft.com/' },
  { value: 'other', labelKey: 'taskManagement.meetingPlatforms.other', icon: '🔗', urlPrefix: '' },
];

export function useTasks() {
  const { currentCompanyId } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      try {
        const res = await listOperationsTasks({ company_id: currentCompanyId, page: 1, page_size: 300 });
        return res.data.map((task) => ({
          id: task.id,
          company_id: task.company_id,
          title: task.title,
          description: task.description,
          status: fromApiStatus(task.status),
          priority: task.priority,
          progress: task.status === 'done' ? 100 : 0,
          work_mode: 'offline',
          assignee_id: null,
          assignee_name: null,
          assignee_avatar: null,
          reporter_id: null,
          reporter_name: null,
          department: null,
          start_date: null,
          due_date: task.due_date,
          completed_date: task.status === 'done' ? task.updated_at.split('T')[0] : null,
          meeting_url: null,
          meeting_platform: null,
          tags: null,
          created_by: null,
          created_at: task.created_at,
          updated_at: task.updated_at,
        })) as Task[];
      } catch {
        return [];
      }
    },
    enabled: !!currentCompanyId,
  });

  const createTask = useMutation({
    mutationFn: async (formData: TaskFormData) => {
      if (!currentCompanyId) throw new Error('No company');
      try {
        return await createOperationsTask({
          company_id: currentCompanyId,
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          priority: (formData.priority as 'low' | 'medium' | 'high') || 'medium',
        });
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: t('taskManagement.toast.success'), description: t('taskManagement.toast.createSuccess') });
    },
    onError: () => {
      toast({ title: t('taskManagement.toast.error'), description: t('taskManagement.toast.createError'), variant: 'destructive' });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...formData }: TaskFormData & { id: string }) => {
      await updateOperationsTaskStatus(id, { status: toApiStatus(formData.status) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: t('taskManagement.toast.success'), description: t('taskManagement.toast.updateSuccess') });
    },
    onError: () => {
      toast({ title: t('taskManagement.toast.error'), description: t('taskManagement.toast.updateError'), variant: 'destructive' });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      try {
        await updateOperationsTaskStatus(id, { status: toApiStatus(status) });
      } catch (err) {
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskProgress = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      await updateOperationsTaskStatus(id, {
        status: progress === 100 ? 'done' : 'in_progress',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await updateOperationsTaskStatus(id, { status: 'blocked' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: t('taskManagement.toast.success'), description: t('taskManagement.toast.deleteSuccess') });
    },
    onError: () => {
      toast({ title: t('taskManagement.toast.error'), description: t('taskManagement.toast.deleteError'), variant: 'destructive' });
    },
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    on_hold: tasks.filter(t => t.status === 'on_hold').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  return {
    tasks,
    isLoading,
    stats,
    createTask,
    updateTask,
    updateTaskStatus,
    updateTaskProgress,
    deleteTask,
  };
}
