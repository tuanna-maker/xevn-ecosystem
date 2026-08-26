import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { toOptionalQueryBoolean } from '../../common/query-boolean';
import { PAY_POSITION_SCOPES } from '../positions.constants';

export class ListPayPositionsQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn([...PAY_POSITION_SCOPES])
  position_scope?: (typeof PAY_POSITION_SCOPES)[number];

  /** Group CEO — union positions across member tenants. Omit/false = JWT tenant only. */
  @IsOptional()
  @Transform(({ value }) => toOptionalQueryBoolean(value))
  @IsBoolean()
  rollup_tenants?: boolean;
}

export class CreatePayPositionDto {
  @IsString()
  company_id!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  grade_code!: string;

  @IsOptional()
  @IsIn([...PAY_POSITION_SCOPES])
  position_scope?: (typeof PAY_POSITION_SCOPES)[number];

  @IsOptional()
  @IsString()
  historical_note?: string | null;
}

export class UpdatePayPositionDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  grade_code?: string;

  @IsOptional()
  @IsIn([...PAY_POSITION_SCOPES])
  position_scope?: (typeof PAY_POSITION_SCOPES)[number];

  @IsOptional()
  @IsString()
  historical_note?: string | null;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ListDepartmentPositionsQueryDto {
  @IsString()
  company_id!: string;
}

export class UpsertDepartmentPositionDto {
  @IsString()
  company_id!: string;

  @IsString()
  @MinLength(1)
  position_code!: string;

  @IsOptional()
  @IsString()
  local_name?: string | null;

  @IsOptional()
  @IsString()
  grade_code_override?: string | null;

  @IsOptional()
  sort_order?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

export class EffectivePositionsQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsString()
  department_code?: string;

  /** Group CEO — union master catalog across member tenants. */
  @IsOptional()
  @Transform(({ value }) => toOptionalQueryBoolean(value))
  @IsBoolean()
  rollup_tenants?: boolean;
}
