import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { ListDecisionsQueryDto } from './dto/list-decisions.query.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
export type HrDecisionRow = {
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
};
export declare class DecisionsService {
    private readonly db;
    private readonly settingsCatalogs?;
    constructor(db: HrmDbService, settingsCatalogs?: SettingsCatalogsService | undefined);
    private resolvePage;
    private resolvePageSize;
    private ensureSchema;
    listDecisions(query: ListDecisionsQueryDto, authorization?: string): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: HrDecisionRow[];
    }>;
    createDecision(payload: CreateDecisionDto, authorization?: string): Promise<HrDecisionRow>;
    updateDecision(decisionId: string, payload: UpdateDecisionDto, authorization?: string): Promise<HrDecisionRow>;
    deleteDecision(decisionId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    getDecisionById(decisionId: string, companyId: string, authorization?: string): Promise<HrDecisionRow>;
    private getDecisionScoped;
    saveDecisionFile(decisionId: string, companyId: string, authorization: string | undefined, file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }): Promise<{
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
    }>;
}
