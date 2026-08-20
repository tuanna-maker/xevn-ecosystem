export declare function isOpenEndedContractType(contractType: string): boolean;
export declare function contractTypeRequiresEndDate(contractType: string): boolean;
export declare function assertContractEndDateForCreate(input: {
    contractType: string;
    startDate: string;
    endDate?: string | null;
}): void;
