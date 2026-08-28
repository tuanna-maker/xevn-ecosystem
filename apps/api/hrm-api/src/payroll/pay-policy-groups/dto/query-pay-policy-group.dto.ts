import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryPayPolicyGroupDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : undefined)
  is_active?: boolean;
}