/**
 * @CODE-MEMORY
 * Screen:     DTO — POST/revise compensation-packages
 * UC:         UC-BP-CORE-02 · F-CORE-EMP-02
 * WorkItem:   PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Purpose:    Create/Revise package lines + bank/MST header ADD (DATA §4)
 * must_keep:  base line required · allowance_code · Nest /core DENY · public CF bank SoT DENY
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: ADD bank_account · bank_name · bank_branch? · tax_id on create+revise DTOs
 * Why: DATA-01 §4 · API-01 F.1 · AC-CORE-02-06 · O6
 * must_keep: revise omit = copy-forward (service) · history snapshot bank/MST
 */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CompensationLineDto {
  @IsIn(['base', 'probation', 'allowance'])
  line_type!: 'base' | 'probation' | 'allowance';

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  /** Required when line_type=allowance (XBOS DM §33 Loại phụ cấp code). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  allowance_code?: string;

  /** Soft bind salary_components.code — BR-AMIS-PAY-SRC-02 per-component fixed PC. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  component_code?: string;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

export class CreateCompensationPackageDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsOptional()
  @IsUUID()
  contract_id?: string;

  @IsDateString()
  effective_from!: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  change_reason?: string;

  /** When true, link employee_contracts.compensation_package_id to the new package. */
  @IsOptional()
  @IsBoolean()
  link_to_contract?: boolean;

  /** C&B bank/MST — persist on package header only (DENY public EMP SoT). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  bank_account?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  bank_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  bank_branch?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  tax_id?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompensationLineDto)
  lines!: CompensationLineDto[];
}

export class ReviseCompensationPackageDto {
  @IsDateString()
  effective_from!: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  change_reason?: string;

  /** Omit = copy-forward prior header (DATA §4.2). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  bank_account?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  bank_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  bank_branch?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  tax_id?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompensationLineDto)
  lines!: CompensationLineDto[];
}
