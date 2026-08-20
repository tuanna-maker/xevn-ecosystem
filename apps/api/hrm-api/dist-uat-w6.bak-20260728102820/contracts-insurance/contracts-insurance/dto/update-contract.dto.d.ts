export declare class UpdateContractDto {
    contract_type?: string;
    start_date?: string;
    end_date?: string;
    status?: 'active' | 'expired' | 'terminated';
    salary?: number;
    compensation_package_id?: string | null;
    notes?: string;
}
