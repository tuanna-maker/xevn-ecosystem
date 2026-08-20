import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { DecideServiceRequestDto } from './dto/decide-service-request.dto';
import { ListServiceRequestsQueryDto } from './dto/list-service-requests.query.dto';
import { ListTasksQueryDto } from './dto/list-tasks.query.dto';
import { UpdateServiceRequestDto } from './dto/update-service-request.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
type TaskRow = {
    id: string;
    company_id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
};
type ServiceRequestRow = {
    id: string;
    company_id: string;
    service_type: string;
    employee_id: string | null;
    employee_name: string;
    employee_code: string | null;
    department: string | null;
    request_date: string;
    status: string;
    notes: string | null;
    meal_type: string | null;
    meal_date: string | null;
    meal_quantity: number | null;
    vehicle_purpose: string | null;
    vehicle_destination: string | null;
    vehicle_date: string | null;
    vehicle_time_start: string | null;
    vehicle_time_end: string | null;
    vehicle_passengers: number | null;
    supply_items: unknown;
    supply_urgency: string | null;
    approved_by: string | null;
    approved_at: string | null;
    rejected_reason: string | null;
    created_at: string;
    updated_at: string;
};
export type ServiceRequestResponse = ServiceRequestRow & {
    request_type: string;
};
export declare function mapServiceRequestRow(row: ServiceRequestRow): ServiceRequestResponse;
export declare class OperationsService {
    private readonly db;
    private readonly fanout;
    constructor(db: HrmDbService, fanout: AttendanceEventFanoutService);
    private toServiceRequestRealtimePayload;
    private ensureSchema;
    createTask(payload: CreateTaskDto, authorization?: string, tenantId?: string): Promise<TaskRow>;
    listTasks(query: ListTasksQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: TaskRow[];
    }>;
    private guardUuidResourceMutate;
    private loadTaskCompanyRow;
    private loadServiceRequestCompanyRow;
    updateTaskStatus(taskId: string, payload: UpdateTaskStatusDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<TaskRow>;
    createServiceRequest(payload: CreateServiceRequestDto, authorization?: string, tenantId?: string): Promise<ServiceRequestResponse>;
    listServiceRequests(query: ListServiceRequestsQueryDto, authorization?: string, tenantId?: string): Promise<ServiceRequestResponse[]>;
    updateServiceRequest(requestId: string, payload: UpdateServiceRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<ServiceRequestResponse>;
    deleteServiceRequest(requestId: string, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<{
        id: string;
    }>;
    approveServiceRequest(requestId: string, payload: DecideServiceRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<ServiceRequestResponse>;
    rejectServiceRequest(requestId: string, payload: DecideServiceRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<ServiceRequestResponse>;
    private countByScope;
    getSummary(requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<{
        attendance_records: number;
        payroll_periods: number;
        job_requisitions: number;
        tasks: number;
        service_requests: number;
    }>;
}
export {};
