/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-CORE-DEP-01 request DTOs — welfare dependents on /employees/:id/dependents*
 * Why: API-01 §5.2 · DATA-01 §5 · UC-BP-CORE-01 O5/O6
 * must_keep: DOB required on POST · soft archive · no salary/MST in payload
 */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

function toOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true' || value === 1 || value === '1')
    return true;
  if (value === false || value === 'false' || value === 0 || value === '0')
    return false;
  return undefined;
}

export class ListEmployeeDependentsQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_archived?: boolean;
}

export class GetEmployeeDependentQueryDto {
  @IsString()
  company_id!: string;
}

export class CreateEmployeeDependentDto {
  @IsString()
  @MaxLength(255)
  full_name!: string;

  @IsString()
  @MaxLength(64)
  @Matches(/^[a-z][a-z0-9_]*$/i, {
    message: 'relation_code must be open key format (a-z, digits, underscore)',
  })
  relation_code!: string;

  @IsDateString()
  date_of_birth!: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  @IsBoolean()
  is_tax_dependent?: boolean;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;
}

export class UpdateEmployeeDependentDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[a-z][a-z0-9_]*$/i, {
    message: 'relation_code must be open key format (a-z, digits, underscore)',
  })
  relation_code?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  @IsBoolean()
  is_tax_dependent?: boolean;

  @IsOptional()
  @IsDateString()
  effective_from?: string | null;

  @IsOptional()
  @IsDateString()
  effective_to?: string | null;
}
