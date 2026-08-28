import {
  IsArray,
  IsBoolean,
  IsBooleanString,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PAY_SHEET_TPL_APPLICABILITY,
  PAY_SHEET_TPL_STATUSES,
} from '../pay-sheet-template.constants';

export class ListPaySheetTemplatesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_STATUSES])
  status?: (typeof PAY_SHEET_TPL_STATUSES)[number];

  @IsOptional()
  @IsBooleanString()
  is_default?: string;

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_APPLICABILITY])
  applicability_scope?: (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

  @IsOptional()
  @IsBooleanString()
  include_archived?: string;

  @IsOptional()
  @IsBooleanString()
  include_lines?: string;

  @IsOptional()
  @IsBooleanString()
  active_only?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string;

  @IsOptional()
  @IsUUID()
  policy_pack_id?: string;

  @IsOptional()
  @IsUUID()
  input_pack_profile_id?: string;
}

export class CreatePaySheetTemplateDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_STATUSES])
  status?: (typeof PAY_SHEET_TPL_STATUSES)[number];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_APPLICABILITY])
  applicabilityScope?: (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_APPLICABILITY])
  applicability_scope?: (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ou_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  positionKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position_key?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  businessLineTag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  applicabilityProvinceCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  applicability_province_code?: string;

  @IsOptional()
  @IsUUID()
  policyPackId?: string;

  @IsOptional()
  @IsUUID()
  policy_pack_id?: string;

  @IsOptional()
  @IsUUID()
  inputPackProfileId?: string;

  @IsOptional()
  @IsUUID()
  input_pack_profile_id?: string;
}

export class UpdatePaySheetTemplateDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_STATUSES])
  status?: (typeof PAY_SHEET_TPL_STATUSES)[number];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_APPLICABILITY])
  applicabilityScope?: (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

  @IsOptional()
  @IsIn([...PAY_SHEET_TPL_APPLICABILITY])
  applicability_scope?: (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ou_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  positionKey?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position_key?: string | null;

  @IsOptional()
  @IsUUID()
  employeeId?: string | null;

  @IsOptional()
  @IsUUID()
  employee_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  businessLineTag?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  applicabilityProvinceCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  applicability_province_code?: string | null;

  @IsOptional()
  @IsUUID()
  policyPackId?: string | null;

  @IsOptional()
  @IsUUID()
  policy_pack_id?: string | null;

  @IsOptional()
  @IsUUID()
  inputPackProfileId?: string | null;

  @IsOptional()
  @IsUUID()
  input_pack_profile_id?: string | null;
}

export class PaySheetTemplateLineInputDto {
  @IsUUID()
  componentId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayLabel?: string | null;

  @IsInt()
  @Min(0)
  sortOrder!: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  groupKey?: string | null;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isIdentityOrTotal?: boolean;

  @IsOptional()
  @IsUUID()
  formulaOverrideDefinitionId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  inputMethod?: string | null;

  @IsOptional()
  @IsUUID()
  systemDataMappingId?: string | null;

  @IsOptional()
  @IsObject()
  formulaOverrideJson?: Record<string, unknown> | null;
}

export class PutPaySheetTemplateLinesDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaySheetTemplateLineInputDto)
  lines!: PaySheetTemplateLineInputDto[];
}

export class BindPaySheetTemplateDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  paySheetTemplateId!: string;
}
