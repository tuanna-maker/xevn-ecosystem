import { HrmListScopeContext } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
type ContractRow = {
    id: string;
    company_id: string;
    employee_id: string;
    contract_code?: string | null;
    contract_type: string;
    start_date: string;
    end_date: string | null;
    status: string;
    notes?: string | null;
    compensation_package_id?: string | null;
    created_at: string;
    updated_at: string;
    employee_name?: string | null;
    employee_code?: string | null;
    department?: string | null;
};
type InsuranceRow = {
    id: string;
    company_id: string;
    employee_id: string;
    provider: string;
    policy_number: string;
    expiry_date: string;
    status: string;
    created_at: string | Date;
    updated_at: string | Date;
};
export type InsuranceListItemDto = InsuranceRow & {
    employee_name?: string | null;
    employee_code?: string | null;
    department?: string | null;
    social_insurance_number: string;
    health_insurance_number: string | null;
    unemployment_insurance_number: string | null;
    social_insurance_rate: number | null;
    health_insurance_rate: number | null;
    unemployment_insurance_rate: number | null;
    base_salary: number | null;
    effective_date: string | null;
};
export declare class ContractsInsuranceService {
    private readonly db;
    constructor(db: HrmDbService);
    private resolvePage;
    private resolvePageSize;
    private resolveContractsListScope;
    private pushResolvableEmployeeScope;
    private qualifyContractInsuranceFilters;
    private ensureSchema;
    private ensureSeedData;
    createContract(payload: CreateContractDto, authorization?: string): Promise<ContractRow>;
    private resolveEmployeeId;
    createInsuranceRecord(payload: CreateInsuranceRecordDto, authorization?: string): Promise<InsuranceRow>;
    listExpiringContracts(query: ListExpiringQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        days: number;
        data: ContractRow[];
    }>;
    listContracts(query: ListContractsQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: ContractRow[];
    }>;
    getContractById(contractId: string, requestedCompanyId: string, authorization?: string, scopeContext?: HrmListScopeContext): Promise<ContractRow>;
    private loadContractScopeRow;
    updateContract(contractId: string, payload: UpdateContractDto, requestedCompanyId: string, authorization?: string): Promise<ContractRow>;
    deleteContract(contractId: string, requestedCompanyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listExpiringInsurance(query: ListExpiringQueryDto, authorization?: string): Promise<{
        total: number;
        days: number;
        data: InsuranceRow[];
    }>;
    private toDateOnly;
    private toIsoTimestamp;
    private mapInsuranceListItem;
    listInsurance(query: ListContractsQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: InsuranceListItemDto[];
    }>;
}
export {};
