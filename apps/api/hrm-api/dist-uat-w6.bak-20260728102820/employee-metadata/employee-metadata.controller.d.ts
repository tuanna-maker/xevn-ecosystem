import { DecideEmployeeMetadataChangeDto } from './dto/decide-employee-metadata-change.dto';
import { ListEmployeeMetadataChangeRequestsQueryDto } from './dto/list-employee-metadata-change-requests.query.dto';
import { SubmitEmployeeMetadataChangeDto } from './dto/submit-employee-metadata-change.dto';
import { EmployeeMetadataService } from './employee-metadata.service';
export declare class EmployeeMetadataController {
    private readonly employeeMetadataService;
    constructor(employeeMetadataService: EmployeeMetadataService);
    private assertBusinessAccess;
    submitChangeRequest(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: SubmitEmployeeMetadataChangeDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord>>;
    listChangeRequests(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListEmployeeMetadataChangeRequestsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord[];
    }>>;
    approveChangeRequest(changeRequestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideEmployeeMetadataChangeDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord>>;
    rejectChangeRequest(changeRequestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideEmployeeMetadataChangeDto): Promise<import("../common/api-response").ApiSuccess<import("./employee-metadata.repository").EmployeeMetadataChangeRequestRecord>>;
    listAuditLogs(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string, employeeId?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("./employee-metadata.repository").EmployeeMetadataAuditLogRecord[];
    }>>;
}
