import { IsDateString, IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateCandidatePoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  stage?: string;

  /** FR-HRM-INT-01 / G-DB-01 — bắt buộc khi stage=hired (hoặc reverse employees.candidate_id). */
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsDateString()
  applied_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
