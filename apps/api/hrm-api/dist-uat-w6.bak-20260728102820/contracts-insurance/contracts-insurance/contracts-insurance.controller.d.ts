import { ContractsInsuranceService } from './contracts-insurance.service';
import { CreateCompensationPackageDto, ReviseCompensationPackageDto } from './dto/create-compensation-package.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListCompensationQueryDto } from './dto/list-compensation.query.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { EmployeeCompensationService } from './employee-compensation.service';
export declare class ContractsInsuranceController {
    private readonly service;
    private readonly compensation;
    constructor(service: ContractsInsuranceService, compensation: EmployeeCompensationService);
    private assertAccess;
    createCompensationPackage(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateCompensationPackageDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-compensation.service").CompensationPackageDetail>>;
    getActiveCompensationPackage(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListCompensationQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("./employee-compensation.service").CompensationPackageDetail | null>>;
    listCompensationPackages(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListCompensationQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./employee-compensation.service").CompensationPackageDetail[];
    }>>;
    getCompensationPackageById(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, packageId: string, query: ListCompensationQueryDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-compensation.service").CompensationPackageDetail>>;
    reviseCompensationPackage(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, packageId: string, body: ReviseCompensationPackageDto, query: ListCompensationQueryDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-compensation.service").CompensationPackageDetail>>;
    listCompensationHistory(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListCompensationQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./employee-compensation.service").CompensationHistoryRow[];
    }>>;
    createContract(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateContractDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    createInsurance(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateInsuranceRecordDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        employee_id: string;
        provider: string;
        policy_number: string;
        expiry_date: string;
        status: string;
        created_at: string | Date;
        updated_at: string | Date;
    }>>;
    listExpiringContracts(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListExpiringQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        days: number;
        data: {
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
        }[];
    }>>;
    listInsurance(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListContractsQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./contracts-insurance.service").InsuranceListItemDto[];
    }>>;
    listInsurancePolicyParticipants(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListContractsQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./contracts-insurance.service").InsuranceListItemDto[];
    }>>;
    listExpiringInsurance(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListExpiringQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        days: number;
        data: {
            id: string;
            company_id: string;
            employee_id: string;
            provider: string;
            policy_number: string;
            expiry_date: string;
            status: string;
            created_at: string | Date;
            updated_at: string | Date;
        }[];
    }>>;
    listContracts(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListContractsQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: {
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
        }[];
    }>>;
    getContractById(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, contractId: string, query: ListContractsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    updateContract(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, contractId: string, body: UpdateContractDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    deleteContract(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, contractId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
