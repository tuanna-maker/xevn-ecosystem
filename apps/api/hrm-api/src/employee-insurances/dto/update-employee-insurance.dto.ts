/**
 * @CODE-MEMORY
 * Screen:     DTO — PUT/PATCH /employee-insurances/:id
 * UC:         AC-PLT-SI-INS-01-ENROLLMENT · FR-UC-BP-CORE-10
 * BR:         BR-PLT-SI-INS-06 — open type key; no closed IsIn ceiling
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02
 * Coded:      2026-08-08
 * must_keep:  status IsIn lifecycle · ONE enrollment SoT
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02
 * change_mode: FIX
 * What: DROP closed @IsIn on type → @IsString @MaxLength(64)
 * Why: D-PLT-SI-INS-DTO-ISIN parity with CreateEmployeeInsuranceDto
 * must_keep: invent ∉ EFF → HRM-INS-TYPE-KEY in service
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-03
 * change_mode: FIX
 * What: start_date/end_date @IsDateString — reject "" (OBS-PLT-SI-INS-EMPTY-DATE)
 * Why: parity create — blank "" must 4xx HRM-VAL-001 not 500 SYS
 * must_keep: open type; invent HRM-INS-TYPE-KEY; omit/null optional
 */
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateEmployeeInsuranceDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  /** Open SI catalog key (F-SI-CAT-EFF-01). Membership = service assert when EFF>0. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  policy_number?: string;

  /** ISO date YYYY-MM-DD; omit/null OK; empty string "" → HRM-VAL-001 (not PG 500). */
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  contribution?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  employer_contribution?: number;

  @IsOptional()
  @IsIn(['active', 'suspended', 'stopped', 'closed', 'expired', 'pending'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
