import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { ListDecisionsQueryDto } from './dto/list-decisions.query.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
export declare class DecisionsController {
    private readonly service;
    constructor(service: DecisionsService);
    private assertAccess;
    list(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListDecisionsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        page: number;
        page_size: number;
        data: import("./decisions.service").HrDecisionRow[];
    }>>;
    create(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateDecisionDto): Promise<import("../common/api-response").ApiSuccess<import("./decisions.service").HrDecisionRow>>;
    getById(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, decisionId: string, companyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<import("./decisions.service").HrDecisionRow>>;
    update(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, decisionId: string, queryCompanyId: string | undefined, body: UpdateDecisionDto): Promise<import("../common/api-response").ApiSuccess<import("./decisions.service").HrDecisionRow>>;
    uploadFile(decisionId: string, file: Express.Multer.File | undefined, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        storage_path: string;
        mime_type: string;
        id: string;
        company_id: string;
        decision_code: string;
        decision_type: string;
        title: string;
        content: string | null;
        employee_id: string | null;
        employee_name: string;
        employee_code: string | null;
        department: string | null;
        position: string | null;
        effective_date: string | null;
        expiry_date: string | null;
        signer_name: string | null;
        signer_position: string | null;
        signing_date: string | null;
        file_url: string | null;
        status: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    remove(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, decisionId: string, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
