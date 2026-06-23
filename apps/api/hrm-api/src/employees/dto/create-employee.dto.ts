import { IsDateString, IsEmail, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  employee_code!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(255)
  full_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title_key?: string;

  @IsOptional()
  @IsDateString()
  hired_at?: string;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar_url?: string | null;
}
