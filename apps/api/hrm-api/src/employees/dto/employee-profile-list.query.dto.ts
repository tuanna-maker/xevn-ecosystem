/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02
 * change_mode: FIX
 * What: Whitelist optional status + soft termination_context_id on profile list query
 * Why: R-CORE-06-STATUS-QUERY-400 — FE GET …/assets?status=assigned rejected HRM-VAL-001
 * spec_ref: API-01 R-CORE-06-TERM-CHK-01 · UC-BP-CORE-06 · QA CORE06QA1-MSLHUNCJ
 * must_keep: company_id required · Nest /core DENY · no TERM table invent · CORE-05 seals
 */
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/** Allowed asset status filter values (spine employee_assets.status). */
export const EMPLOYEE_ASSET_LIST_STATUSES = [
  'assigned',
  'returned',
  'maintenance',
  'lost',
] as const;

export type EmployeeAssetListStatus = (typeof EMPLOYEE_ASSET_LIST_STATUSES)[number];

/**
 * Scope for employee profile tab lists (degrees, training, assets).
 * CORE-06: optional status (+ soft termination_context_id) for assets checklist feed.
 */
export class EmployeeProfileListQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  /**
   * Optional filter — used by listAssets (R-CORE-06-TERM-CHK-01).
   * Other profile list endpoints ignore this field when present.
   */
  @IsOptional()
  @IsString()
  @IsIn([...EMPLOYEE_ASSET_LIST_STATUSES])
  status?: EmployeeAssetListStatus;

  /**
   * Soft/ephemeral correlation id for TERM checklist UI (HOLD invent TERM PK / table).
   * Whitelisted so ValidationPipe accepts FE query; not applied as SQL join this seat.
   */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  termination_context_id?: string;
}
