import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobPostingDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(256)
  title!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  @MaxLength(256)
  position!: string;

  @IsOptional()
  @IsString()
  employment_type?: string;

  @IsOptional()
  @IsString()
  work_location?: string;

  @IsOptional()
  @IsNumber()
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  salary_max?: number;

  @IsOptional()
  @IsBoolean()
  is_salary_visible?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  headcount?: number;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
