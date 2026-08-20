import { DecideEmployeeMetadataChangeDto } from './dto/decide-employee-metadata-change.dto';
import { ListEmployeeMetadataChangeRequestsQueryDto } from './dto/list-employee-metadata-change-requests.query.dto';
import { SubmitEmployeeMetadataChangeDto } from './dto/submit-employee-metadata-change.dto';
import { EmployeeMetadataRepository } from './employee-metadata.repository';
export declare class EmployeeMetadataService {
    private readonly repository;
    constructor(repository: EmployeeMetadataRepository);
    private resolveMetadataCompanyUuid;
    submitChangeRequest(payload: SubmitEmployeeMetadataChangeDto): Promise<import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord>;
    listChangeRequests(query: ListEmployeeMetadataChangeRequestsQueryDto, authorization?: string): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord[];
    }>;
    approveChangeRequest(changeRequestId: string, decision: DecideEmployeeMetadataChangeDto, requestedCompanyId: string, authorization?: string): Promise<import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord>;
    rejectChangeRequest(changeRequestId: string, decision: DecideEmployeeMetadataChangeDto, requestedCompanyId: string, authorization?: string): Promise<import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord>;
    listAuditLogs(companyId: string, employeeId: string | undefined, authorization?: string): Promise<{
        total: number;
        data: import("./employee-metadata.repository").EmployeeMetadataAuditLogRecord[];
    }>;
}
