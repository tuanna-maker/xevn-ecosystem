/**
 * @CODE-MEMORY
 * Screen: Thư viện JD → Thêm · F-JD-RUL-03 resolve · WorkItem: PO-HRM-JD-DYNAMIC-BE-01
 */
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveJdPackDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  position_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_family?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  employment_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_mode?: string;
}
