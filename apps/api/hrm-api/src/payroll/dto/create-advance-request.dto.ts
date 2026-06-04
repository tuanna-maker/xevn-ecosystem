import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAdvanceRequestDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  name!: string;

  @IsString()
  salary_period!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsArray()
  approval_steps?: Record<string, unknown>[];
}
