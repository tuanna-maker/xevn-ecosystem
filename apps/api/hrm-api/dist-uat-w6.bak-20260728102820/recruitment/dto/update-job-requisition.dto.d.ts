declare const REQUISITION_STATUSES: readonly ["open", "closed", "on_hold", "draft", "pending_approval", "approved", "rejected", "cancelled"];
export declare class UpdateJobRequisitionDto {
    status: (typeof REQUISITION_STATUSES)[number];
    notes?: string;
    headcount?: number;
}
export {};
