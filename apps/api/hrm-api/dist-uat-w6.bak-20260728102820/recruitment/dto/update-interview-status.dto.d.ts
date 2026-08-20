declare const INTERVIEW_STATUSES: readonly ["scheduled", "passed", "failed", "cancelled"];
export declare class UpdateInterviewStatusDto {
    status: (typeof INTERVIEW_STATUSES)[number];
}
export {};
