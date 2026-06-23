import { IsDateString, IsEmail, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

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
