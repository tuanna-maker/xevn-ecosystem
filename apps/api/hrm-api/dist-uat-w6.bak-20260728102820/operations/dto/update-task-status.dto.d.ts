declare const TASK_STATUSES: readonly ["todo", "in_progress", "done", "blocked"];
export declare class UpdateTaskStatusDto {
    status: (typeof TASK_STATUSES)[number];
}
export {};
