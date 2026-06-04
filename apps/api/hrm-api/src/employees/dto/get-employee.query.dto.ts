import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

function toOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

export class GetEmployeeQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_archived?: boolean;
}
