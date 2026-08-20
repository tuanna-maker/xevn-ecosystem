import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import { EmployeesService } from './employees.service';
type ProfileRow = Record<string, unknown> & {
    id: string;
};
export declare class EmployeeProfileService {
    private readonly db;
    private readonly employees;
    constructor(db: HrmDbService, employees: EmployeesService);
    private ensureSchema;
    private listScopedRows;
    listDegrees(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        data: {
            created_at: unknown;
            updated_at: unknown;
            id: string;
            employee_id: string;
            company_id: unknown;
        }[];
        phase: string;
        total: number;
    }>;
    listTraining(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    listAssets(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    createAsset(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    updateAsset(assetId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteAsset(assetId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    listSkills(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    createSkill(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    updateSkill(skillId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteSkill(skillId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    listWorkTimeline(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    createWorkTimelineItem(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    updateWorkTimelineItem(itemId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteWorkTimelineItem(itemId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    listResumeFiles(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    createResumeFile(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteResumeFile(fileId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    listRewards(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    listDiscipline(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        total: number;
        data: ProfileRow[];
    }>;
    createReward(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    updateReward(rewardId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteReward(rewardId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    createDiscipline(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    updateDiscipline(disciplineId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteDiscipline(disciplineId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    createTraining(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    updateTraining(trainingId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string): Promise<ProfileRow>;
    deleteTraining(trainingId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string): Promise<{
        id: string;
    }>;
    private resolveSkillLevel;
    private insertProfileRow;
    private guardProfileRowMutate;
    private peekProfileRow;
    private updateProfileRow;
    private deleteProfileRow;
}
export {};
