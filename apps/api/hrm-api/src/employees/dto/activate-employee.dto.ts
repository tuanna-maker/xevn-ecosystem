/**
 * @CODE-MEMORY
 * Screen:     F-CORE-ACT-01 activate body DTO
 * UC:         UC-BP-CORE-07 · FR-UC-BP-CORE-07 Diễn biến #2 · AC-CORE-07-05
 * BR:         R-CORE-07-EFF-01 · O6 · DENY epoch junk
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-07
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md §6
 * Purpose:    Require effective_date dd/MM/yyyy on POST …/activate (and gated PATCH alt).
 * WorkItem:   PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  HOLD invent typed activated_at · no ISO-only sole path · U65
 * SOLID:      DTO validation only
 * LastVerified: po-hrm-mvp-gd1-core-07-cluster-be-01.spec.ts
 */
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { EMP_ACT_EFFECTIVE_DATE_RE } from '../emp-activate.constants';

export class ActivateEmployeeDto {
  /** Ngày hiệu lực kích hoạt — bắt buộc · locale dd/MM/yyyy. */
  @IsString()
  @Matches(EMP_ACT_EFFECTIVE_DATE_RE, {
    message: 'effective_date must be dd/MM/yyyy',
  })
  effective_date!: string;
}

/**
 * Optional effective_date on PATCH when intent = status→active (gated CORE-07 path).
 * Free PATCH without activate intent remains RETAIN ≠ FR-07 DONE.
 */
export class GatedActivatePatchFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  status?: string;

  @IsOptional()
  @IsString()
  @Matches(EMP_ACT_EFFECTIVE_DATE_RE, {
    message: 'effective_date must be dd/MM/yyyy',
  })
  effective_date?: string;
}
