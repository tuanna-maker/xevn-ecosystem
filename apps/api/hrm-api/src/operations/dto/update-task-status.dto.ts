import { IsIn } from 'class-validator';

const TASK_STATUSES = ['todo', 'in_progress', 'done', 'blocked'] as const;

export class UpdateTaskStatusDto {
  @IsIn(TASK_STATUSES)
  status!: (typeof TASK_STATUSES)[number];
}
