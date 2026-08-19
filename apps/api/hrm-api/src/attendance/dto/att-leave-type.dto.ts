/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-ATT-CAT-LVT-01/02 · F-ATT-CAT-EFF-01
 * UC:         AC-PLT-ATT-01..03
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
 * Coded:      2026-08-07
 * must_keep:  format-only leaveTypeKey · soft-delete retire · no closed enum
 */
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListAttLeaveTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_archived?: string;

  /** Merge settings-catalogs leave_types REF (ATT wins on collision). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertAttLeaveTypeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  leaveTypeKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsString()
  @MaxLength(32)
  category!: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsCarryOver?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsAdvance?: boolean;

  @IsOptional()
  @IsBoolean()
  insuranceRegimeFlag?: boolean;

  @IsOptional()
  @IsBoolean()
  companyTopupFlag?: boolean;

  @IsOptional()
  @IsBoolean()
  countsTowardTimesheet?: boolean;

  /** Q-LEAVE-UNIT — day | hour (ATT-08). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  unit?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchAttLeaveTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsCarryOver?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsAdvance?: boolean;

  @IsOptional()
  @IsBoolean()
  insuranceRegimeFlag?: boolean;

  @IsOptional()
  @IsBoolean()
  companyTopupFlag?: boolean;

  @IsOptional()
  @IsBoolean()
  countsTowardTimesheet?: boolean;

  /** Q-LEAVE-UNIT — day | hour (ATT-08). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  unit?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetAttLeaveTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveAttLeaveTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
