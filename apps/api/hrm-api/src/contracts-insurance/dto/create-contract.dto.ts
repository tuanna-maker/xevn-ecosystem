/**
 * @CODE-MEMORY
 * Screen:     HRM Contracts create form (P-CC-04) — contract term only
 * UC:         UC-HRM-CI-01 · UC-HRM-25 · BR-CD-F5-01 · FR-HRM-CI-01
 * BR:         BR-CD-F5-01 (salary not required on contract body); end_date theo loại (G-CI-01)
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.2 — Ngày kết thúc «Theo loại»
 * TechSpec:   docs/hrm/TECHSPEC.md §14.2 · §16.9 G-CI-01 · openapi createLaborContract
 * Purpose:    DTO for labor contract create — terms/dates/type; salary deprecated (F5).
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    contracts-insurance.controller.ts → createContract
 * Callees:    class-validator; service assertContractEndDateForCreate
 * Impact:     FE must not treat salary as required; use compensation-packages
 * must_keep:  salary optional + ignored; end_date optional at DTO — service enforces by type
 * SOLID:      SRP — contract term DTO separate from CompensationLineDto
 * LastVerified: contracts-insurance.service.spec.ts (G-CI-01)
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: BE-HRM-G-CI-01
 * change_mode: ADD
 * What: end_date @IsOptional — requiredness enforced in service by contract_type
 * Why: TechSpec G-CI-01 / SRS «Ngày kết thúc | Theo loại»
 * must_keep: BR-CD-F5-01 salary deprecated; HRM-CON-001/002 deterministic rejects
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E1A-POS-KEY-01
 * ADD position_key (+ snapshots/signer keys) — catalog SoT for EmployeeContracts tab
 *
 * @CODE-MEMORY-CHANGE 2026-08-01 D-HDSD-MUTATE-BE-01
 * position_key @IsOptional — service resolves employee.job_title_key or job_titles catalog
 * Why: Contracts.tsx / HDSD create POST omits position_key (UF-HRM-05 TC-HDSD-06-02-01)
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01
 * start_date @IsOptional — service defaults to today (Asia/Ho_Chi_Minh) for wizard Step1→2 draft
 * effective_from alias (SA-01 field map) — same persist column as start_date
 */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function emptyDateToUndefined(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' && !value.trim()) return undefined;
  return value;
}

export class CreateContractDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  employee_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  contract_code?: string;

  @IsString()
  @MaxLength(40)
  contract_type!: string;

  /** Optional at DTO — wizard Step1→2 defaults today in service (FR-HRM-CI-01 #4). */
  @IsOptional()
  @Transform(({ value }) => emptyDateToUndefined(value))
  @IsDateString()
  start_date?: string;

  /** SA-01 alias → `start_date` (effective_from). */
  @IsOptional()
  @Transform(({ value }) => emptyDateToUndefined(value))
  @IsDateString()
  effective_from?: string;

  /** Optional at DTO; required when contract_type is not open-ended (service G-CI-01). */
  @IsOptional()
  @IsDateString()
  end_date?: string;

  /**
   * @deprecated F5 / BR-CD-F5-01 — salary lives on compensation package lines, not contract body.
   * Accepted for backward compat; ignored by createContract.
   */
  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;

  /** Catalog SoT (job_titles.code) — E1-A MD-BIND; optional when employee has job_title_key. */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  position_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  signer_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  signer_position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  signer_position_key?: string;

  /** Print overlay — ADD nullable (PO-HRM-CONTRACT-LEGAL-PRINT-BE-01). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  pack_code?: string;

  @IsOptional()
  @IsUUID()
  template_id?: string;

  /** Optional denorm — UF-HRM-02 nullable (AC-CTR-XEVN-08). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  template_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  term_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  work_location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_location_scope?: string;

  @IsOptional()
  @IsString()
  job_description_text?: string;

  @IsOptional()
  @IsNumber()
  probation_days?: number;

  @IsOptional()
  @IsDateString()
  probation_end?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  license_class?: string;

  /** Alias → persist license_class only. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  driver_license_class?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  driver_license_number?: string;

  @IsOptional()
  @IsDateString()
  driver_license_issued_on?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  driver_license_issued_place?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  vehicle_plate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  route_or_region?: string;

  @IsOptional()
  @IsUUID()
  compensation_package_id?: string;

  @IsOptional()
  @IsDateString()
  signed_at?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  contract_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_arrangement?: string;

  @IsOptional()
  @IsNumber()
  salary_ratio_percent?: number;

  /** PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01 — candidate | employee (G-CTR-SUBJ-01). */
  @IsOptional()
  @IsIn(['candidate', 'employee'])
  subject_type?: 'candidate' | 'employee';

  @IsOptional()
  @IsUUID()
  candidate_id?: string;

  @IsOptional()
  @IsUUID()
  requisition_id?: string;

  /** Alias → `signed_at` (wizard GĐ1). */
  @IsOptional()
  @IsDateString()
  signing_date?: string;

  /** Alias → `work_arrangement`. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_form?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  contract_abstract?: string;

  /** Alias → `contract_abstract` (trích yếu). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  abstract?: string;

  /** AC-CTR-XEVN-08 — «Chỉ lưu sổ» may waive signed_at GĐ1 rules. */
  @IsOptional()
  @IsBoolean()
  registry_only?: boolean;
}
