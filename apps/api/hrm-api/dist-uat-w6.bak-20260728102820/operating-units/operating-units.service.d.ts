import { type HrmListScopeContext } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { type HrmOperatingUnitRow } from './hrm-operating-unit-registry';
export declare class OperatingUnitsService {
    private readonly db;
    constructor(db: HrmDbService);
    private resolveVisibleSlugs;
    listOperatingUnits(authorization: string | undefined, context?: HrmListScopeContext): Promise<HrmOperatingUnitRow[]>;
}
