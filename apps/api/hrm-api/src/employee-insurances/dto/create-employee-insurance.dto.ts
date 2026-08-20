/**
 * @CODE-MEMORY
 * Screen:     DTO — POST /employee-insurances (enrollment create)
 * UC:         AC-PLT-SI-INS-01-ENROLLMENT · FR-UC-BP-CORE-10
 * BR:         BR-PLT-SI-INS-06 — open type key (Nest EFF SoT); no closed IsIn ceiling
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md AC-PLT-SI-INS-01*
 * TechSpec:   F-SI-CAT-EFF-01 · VAL-SI-CNS-02
 * Purpose:    Enrollment create body — type is open catalog key; membership asserted in service.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02
 * Coded:      2026-08-08
 * must_keep:  status IsIn lifecycle · employee_id UUID · ONE enrollment SoT schema
 * SOLID:      DTO format only; catalog ∈ EFF = service
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-02
 * change_mode: FIX
 * What: DROP closed @IsIn(social|health|…) on type → @IsString @MaxLength(64)
 * Why: D-PLT-SI-INS-DTO-ISIN — open Nest key ∈ EFF was 400 HRM-VAL-001 before KEY assert
 * must_keep: status enum; invent ∉ EFF still HRM-INS-TYPE-KEY in service
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-03
 * change_mode: FIX
 * What: start_date/end_date @IsDateString — reject "" (OBS-PLT-SI-INS-EMPTY-DATE → 4xx not 500)
 * Why: blank ViDateField posted "" → PG date cast HRM-SYS-001
 * must_keep: open type KEY assert; omit/null dates still optional; invent HRM-INS-TYPE-KEY
 */
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEmployeeInsuranceDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  /** Open SI catalog key (F-SI-CAT-EFF-01). Membership = service assert when EFF>0. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;

  @IsString()
  @MaxLength(256)
  provider!: string;

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
