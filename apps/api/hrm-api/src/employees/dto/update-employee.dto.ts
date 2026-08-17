import {
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { EMP_ACT_EFFECTIVE_DATE_RE } from '../emp-activate.constants';

/**
 * @CODE-MEMORY
 * WorkItem: R-SPINE-MGR-HIER-01-BE
 * change_mode: ADD
 * What: optional manager_id (UUID | null) on PATCH — FR-UC-H01 QL trực tiếp
 * Why: Option B HCNS sets direct manager via UC-H01 (U65 — no seed)
 * must_keep: null clears; self ESS cannot PATCH manager_id (employee-update-policy)
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: optional effective_date dd/MM/yyyy when gated PATCH status→active (F-CORE-ACT-01 alt)
 * must_keep: free PATCH ≠ FR-07 DONE · HOLD invent activated_at col · Nest /core DENY
 */
export class UpdateEmployeeDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title_key?: string;

  /** QL trực tiếp — UUID | null (clear). HR-only; self ESS rejects via allowlist. */
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID('4')
  manager_id?: string | null;

  @IsOptional()
  @IsDateString()
  hired_at?: string;

  /** Open catalog status_key — ∈ F-EMP-CAT-ST-EFF when EFF>0 (F-EMP-ST-CNS-01). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  status?: string;

  /** Soft reason payload — ∈ F-EMP-CAT-STR-EFF when required / EFF>0 (F-EMP-ST-CNS-02). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  status_reason_key?: string;

  /**
   * R-CORE-07-EFF-01 — required when PATCH intent = status→active (gated CORE-07).
   * Locale dd/MM/yyyy · HOLD invent typed activated_at.
   */
  @IsOptional()
  @IsString()
  @Matches(EMP_ACT_EFFECTIVE_DATE_RE, {
    message: 'effective_date must be dd/MM/yyyy',
  })
  effective_date?: string;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar_url?: string | null;
}
