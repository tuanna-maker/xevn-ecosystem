/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-ATT-LVRULE-01..04 leave accrual policy
 * UC:         AC-PLT-ATT-LEAVE-BAL-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01
 * Coded:      2026-08-08
 * must_keep:  open admin N+1 · soft-retire · no closed leave_type_key enum · engine HOLD
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02
 * change_mode: ADD
 * What: AssertConsumerAttLeaveAccrualPolicyDto — gated leave consumer body (grant/adjust
 *       surface) chấp nhận policyId/accrualMode/annualDays để wire assert invent KEY qua HTTP.
 * Why: QC Condition R-PLT-ATT-LVRULE-CNS-WIRE — Network phải phát 4xx HRM-ATT-LVRULE-KEY
 *      khi active policy>0 và consumer invent (trước đây chỉ helper+jest LIVE).
 * must_keep: whitelist khớp QA probe camelCase · engine HOLD · không đụng leave TXN sealed
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BE-01
 * change_mode: ADD
 * What: advanceMaxDays · advanceCapPercent on Create/Patch DTO + policy cols §4.2
 * Why:  FR-UC-BP-ATT-04b R-ATT-04B-CAP-CRUD · ≠ max_balance_days semantics
 * must_keep: allow_negative · engine HOLD · ≠ FR-04b DONE
 */
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListAttLeaveAccrualPoliciesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  leave_type_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  /** When true — include retired / archived; default list = active only. */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_inactive?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class CreateAttLeaveAccrualPolicyDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  leaveTypeKey!: string;

  @IsString()
  @MaxLength(64)
  accrualMode!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  unit?: string;

  @IsOptional()
  @IsBoolean()
  allowNegative?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  carryOverExpireRule?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carryCapDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBalanceDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advanceMaxDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  advanceCapPercent?: number | null;

  /** ISO date YYYY-MM-DD */
  @IsString()
  @MaxLength(32)
  effectiveFrom!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  effectiveTo?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchAttLeaveAccrualPolicyDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  accrualMode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualDays?: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  unit?: string;

  @IsOptional()
  @IsBoolean()
  allowNegative?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  carryOverExpireRule?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carryCapDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBalanceDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  advanceMaxDays?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  advanceCapPercent?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  effectiveTo?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetAttLeaveAccrualPolicyQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ResolveEffectiveAttLeaveAccrualPolicyQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  leave_type_key!: string;

  /** ISO date YYYY-MM-DD — default today (Asia/Ho_Chi_Minh). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  as_of?: string;
}

/**
 * F-ATT-LVRULE-CNS-01 — gated leave consumer (grant/adjust) invent guard body.
 * Consumer proposes a policy binding; when the company has ≥1 active policy for the
 * leave type, invent params (unknown policyId / ad-hoc mode|days) → HRM-ATT-LVRULE-KEY.
 * camelCase whitelist matches QA probe payload. Not an admin CREATE (open N+1 stays separate).
 */
export class AssertConsumerAttLeaveAccrualPolicyDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  leaveTypeKey!: string;

  /** Consumer-selected published policy id — invent/unknown → HRM-ATT-LVRULE-KEY. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  policyId?: string | null;

  /** Ad-hoc accrual mode override — forbidden when active policy set >0. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  accrualMode?: string | null;

  /** Ad-hoc annual days override — forbidden when active policy set >0. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualDays?: number | null;
}
