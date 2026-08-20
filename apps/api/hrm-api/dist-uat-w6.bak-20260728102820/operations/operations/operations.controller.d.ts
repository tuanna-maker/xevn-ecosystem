import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideServiceRequestDto } from './dto/decide-service-request.dto';
import { ListServiceRequestsQueryDto } from './dto/list-service-requests.query.dto';
import { ListTasksQueryDto } from './dto/list-tasks.query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { OperationsService } from './operations.service';
export declare class OperationsController {
    private readonly service;
    constructor(service: OperationsService);
    private assertAccess;
    createTask(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateTaskDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        title: string;
        description: string | null;
        priority: string;
        status: string;
        due_date: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    listTasks(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListTasksQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: {
            id: string;
            company_id: string;
            title: string;
            description: string | null;
            priority: string;
            status: string;
            due_date: string | null;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    updateTaskStatus(taskId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: UpdateTaskStatusDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        title: string;
        description: string | null;
        priority: string;
        status: string;
        due_date: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    getSummary(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        attendance_records: number;
        payroll_periods: number;
        job_requisitions: number;
        tasks: number;
        service_requests: number;
    }>>;
    createServiceRequest(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateServiceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("./operations.service").ServiceRequestResponse>>;
    listServiceRequests(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListServiceRequestsQueryDto): Promise<import("../common/api-response").ApiSuccess<import("./operations.service").ServiceRequestResponse[]>>;
    updateServiceRequest(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: UpdateServiceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("./operations.service").ServiceRequestResponse>>;
    deleteServiceRequest(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    approveServiceRequest(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideServiceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("./operations.service").ServiceRequestResponse>>;
    rejectServiceRequest(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideServiceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("./operations.service").ServiceRequestResponse>>;
}
