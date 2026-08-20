export declare class CompensationLineDto {
    line_type: 'base' | 'probation' | 'allowance';
    amount: number;
    currency?: string;
    allowance_code?: string;
    taxable?: boolean;
    note?: string;
    sort_order?: number;
}
export declare class CreateCompensationPackageDto {
    company_id: string;
    employee_id: string;
    contract_id?: string;
    effective_from: string;
    effective_to?: string;
    currency?: string;
    change_reason?: string;
    link_to_contract?: boolean;
    lines: CompensationLineDto[];
}
export declare class ReviseCompensationPackageDto {
    effective_from: string;
    effective_to?: string;
    currency?: string;
    change_reason?: string;
    lines: CompensationLineDto[];
}
