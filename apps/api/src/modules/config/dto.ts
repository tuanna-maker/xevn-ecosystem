import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import type { ConfigDataType, ConfigScope } from './config.types';

export class GetEffectiveConfigQueryDto {
  @IsString()
  @IsNotEmpty()
  tenantId = 'tenant-xevn-holding';

  @IsString()
  @IsNotEmpty()
  moduleCode = 'hrm';

  @IsString()
  @IsNotEmpty()
  originCode = 'employee_profile';

  @IsString()
  @IsNotEmpty()
  legalEntityId = 'comp-001';
}

export class ConfigFieldDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/)
  fieldCode!: string;

  @IsString()
  @IsNotEmpty()
  blockCode!: string;

  @IsString()
  @IsNotEmpty()
  labelVi!: string;

  @IsIn(['text', 'number', 'date', 'select', 'phone', 'email'])
  dataType!: ConfigDataType;

  @IsBoolean()
  required!: boolean;

  @IsBoolean()
  readonly!: boolean;

  @IsBoolean()
  hidden!: boolean;

  @IsObject()
  @IsOptional()
  validationRules?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  optionsSource?: {
    categoryCode: string;
    scope: ConfigScope;
  };

  @IsInt()
  @Min(0)
  order!: number;
}

export class ConfigBlockDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/)
  blockCode!: string;

  @IsString()
  @IsNotEmpty()
  labelVi!: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsBoolean()
  @IsOptional()
  hidden?: boolean;
}

export class UpsertOriginDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  moduleCode!: string;

  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/)
  originCode!: string;

  @IsArray()
  blocks!: ConfigBlockDto[];

  @IsArray()
  fields!: ConfigFieldDto[];
}

export class UpsertVariantDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsNotEmpty()
  moduleCode!: string;

  @IsString()
  @IsNotEmpty()
  originCode!: string;

  @IsString()
  @IsNotEmpty()
  legalEntityId!: string;

  @IsObject()
  diffJson!: {
    blocks?: Array<Partial<ConfigBlockDto> & { blockCode: string }>;
    fields?: Array<Partial<ConfigFieldDto> & { fieldCode: string }>;
  };
}

export class PublishVariantDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;
}
