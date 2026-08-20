import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
import { EmployeeSummaryQueryDto } from './dto/employee-summary.query.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeesService } from './employees.service';
export declare class EmployeesController {
    private readonly employeesService;
    private readonly employeeProfile;
    constructor(employeesService: EmployeesService, employeeProfile: EmployeeProfileService);
    private assertBusinessAccess;
    createEmployee(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateEmployeeDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        company_uuid: string | null;
        company_display_name: string | null;
        employee_code: string;
        email: string;
        full_name: string;
        job_title_key: string | null;
        manager_id: string | null;
        status: string;
        hired_at: string | null;
        archived_at: string | null;
        avatar_url: string | null;
        custom_fields: Record<string, string>;
        created_at: string;
        updated_at: string;
    }>>;
    listEmployees(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListEmployeesQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./employee-directory").DirectoryListItem[];
    }>> | Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        next_cursor: string | null;
        data: {
            id: string;
            company_id: string;
            company_uuid: string | null;
            company_display_name: string | null;
            employee_code: string;
            email: string;
            full_name: string;
            job_title_key: string | null;
            manager_id: string | null;
            status: string;
            hired_at: string | null;
            archived_at: string | null;
            avatar_url: string | null;
            custom_fields: Record<string, string>;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    getEmployeesSummary(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeSummaryQueryDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-summary.types").EmployeeSummaryResult>>;
    listEmployeeDegrees(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        data: {
            created_at: unknown;
            updated_at: unknown;
            id: string;
            employee_id: string;
            company_id: unknown;
        }[];
        phase: string;
        total: number;
    }>>;
    listEmployeeTraining(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    listEmployeeAssets(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    createEmployeeAsset(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    updateEmployeeAsset(employeeId: string, assetId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeAsset(employeeId: string, assetId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listEmployeeSkills(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    createEmployeeSkill(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    updateEmployeeSkill(employeeId: string, skillId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeSkill(employeeId: string, skillId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listEmployeeWorkTimeline(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    createEmployeeWorkTimeline(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    updateEmployeeWorkTimeline(employeeId: string, itemId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeWorkTimeline(employeeId: string, itemId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listEmployeeResumeFiles(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    createEmployeeResumeFile(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeResumeFile(employeeId: string, fileId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listEmployeeRewards(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    listEmployeeDiscipline(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: (Record<string, unknown> & {
            id: string;
        })[];
    }>>;
    createEmployeeReward(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    updateEmployeeReward(employeeId: string, rewardId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeReward(employeeId: string, rewardId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    createEmployeeDiscipline(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    updateEmployeeDiscipline(employeeId: string, disciplineId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeDiscipline(employeeId: string, disciplineId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    createEmployeeTraining(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    updateEmployeeTraining(employeeId: string, trainingId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<Record<string, unknown> & {
        id: string;
    }>>;
    deleteEmployeeTraining(employeeId: string, trainingId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: EmployeeProfileListQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    getEmployeeById(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: GetEmployeeQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        company_uuid: string | null;
        company_display_name: string | null;
        employee_code: string;
        email: string;
        full_name: string;
        job_title_key: string | null;
        manager_id: string | null;
        status: string;
        hired_at: string | null;
        archived_at: string | null;
        avatar_url: string | null;
        custom_fields: Record<string, string>;
        created_at: string;
        updated_at: string;
    }>> | Promise<import("../common/api-response").ApiSuccess<import("./employee-directory").DirectoryDetailItem>>;
    updateEmployee(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: UpdateEmployeeDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        company_uuid: string | null;
        company_display_name: string | null;
        employee_code: string;
        email: string;
        full_name: string;
        job_title_key: string | null;
        manager_id: string | null;
        status: string;
        hired_at: string | null;
        archived_at: string | null;
        avatar_url: string | null;
        custom_fields: Record<string, string>;
        created_at: string;
        updated_at: string;
    }>>;
    archiveEmployee(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        company_uuid: string | null;
        company_display_name: string | null;
        employee_code: string;
        email: string;
        full_name: string;
        job_title_key: string | null;
        manager_id: string | null;
        status: string;
        hired_at: string | null;
        archived_at: string | null;
        avatar_url: string | null;
        custom_fields: Record<string, string>;
        created_at: string;
        updated_at: string;
    }>>;
    restoreEmployee(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        company_uuid: string | null;
        company_display_name: string | null;
        employee_code: string;
        email: string;
        full_name: string;
        job_title_key: string | null;
        manager_id: string | null;
        status: string;
        hired_at: string | null;
        archived_at: string | null;
        avatar_url: string | null;
        custom_fields: Record<string, string>;
        created_at: string;
        updated_at: string;
    }>>;
}
