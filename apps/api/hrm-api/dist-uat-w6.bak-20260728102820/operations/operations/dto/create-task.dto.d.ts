declare const TASK_PRIORITIES: readonly ["low", "medium", "high"];
export declare class CreateTaskDto {
    company_id: string;
    title: string;
    description?: string;
    priority: (typeof TASK_PRIORITIES)[number];
    due_date?: string;
}
export {};
