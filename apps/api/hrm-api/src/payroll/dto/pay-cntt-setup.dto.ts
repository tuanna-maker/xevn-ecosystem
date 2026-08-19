import {
  IsArray,
  IsBooleanString,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  PAY_INPUT_PROFILE_STATUSES,
  PAY_POLICY_PACK_SCOPES,
  PAY_POLICY_PACK_STATUSES,
} from '../pay-cntt-setup.constants';

export class ListPayPolicyPacksQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsIn([...PAY_POLICY_PACK_STATUSES])
  status?: (typeof PAY_POLICY_PACK_STATUSES)[number];

  @IsOptional()
  @IsIn([...PAY_POLICY_PACK_SCOPES])
  scope?: (typeof PAY_POLICY_PACK_SCOPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string;

  @IsOptional()
  @IsDateString()
  effective_on?: string;

  @IsOptional()
  @IsBooleanString()
  include_archived?: string;

  @IsOptional()
  @IsBooleanString()
  include_usage_count?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

export class CreatePayPolicyPackDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(200)
  nameVi!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_vi?: string;

  @IsOptional()
  @IsIn([...PAY_POLICY_PACK_STATUSES])
  status?: (typeof PAY_POLICY_PACK_STATUSES)[number];

  @IsOptional()
  @IsIn([...PAY_POLICY_PACK_SCOPES])
  scope?: (typeof PAY_POLICY_PACK_SCOPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  businessLineTag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string;

  @IsDateString()
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsArray()
  policyDocRefs?: unknown[];

  @IsOptional()
  @IsObject()
  rateParams?: Record<string, unknown>;
}

export class UpdatePayPolicyPackDto {
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
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_vi?: string;

  @IsOptional()
  @IsIn([...PAY_POLICY_PACK_STATUSES])
  status?: (typeof PAY_POLICY_PACK_STATUSES)[number];

  @IsOptional()
  @IsIn([...PAY_POLICY_PACK_SCOPES])
  scope?: (typeof PAY_POLICY_PACK_SCOPES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  businessLineTag?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string | null;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string | null;

  @IsOptional()
  @IsDateString()
  effective_to?: string | null;

  @IsOptional()
  @IsArray()
  policyDocRefs?: unknown[];

  @IsOptional()
  @IsObject()
  rateParams?: Record<string, unknown>;
}

export class ListPayInputPackProfilesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsIn([...PAY_INPUT_PROFILE_STATUSES])
  status?: (typeof PAY_INPUT_PROFILE_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string;

  @IsOptional()
  @IsBooleanString()
  include_archived?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

export class CreatePayInputPackProfileDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(200)
  nameVi!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_vi?: string;

  @IsOptional()
  @IsIn([...PAY_INPUT_PROFILE_STATUSES])
  status?: (typeof PAY_INPUT_PROFILE_STATUSES)[number];

  @IsArray()
  @IsString({ each: true })
  allowedSourceKinds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredComponentCodes?: string[];

  @IsOptional()
  @IsObject()
  columnHints?: Record<string, unknown>;
}

export class UpdatePayInputPackProfileDto {
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
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_vi?: string;

  @IsOptional()
  @IsIn([...PAY_INPUT_PROFILE_STATUSES])
  status?: (typeof PAY_INPUT_PROFILE_STATUSES)[number];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedSourceKinds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredComponentCodes?: string[];

  @IsOptional()
  @IsObject()
  columnHints?: Record<string, unknown>;
}

export class ResolvePaySetupQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ou_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  business_line_tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position_key?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsDateString()
  effective_on?: string;
}
