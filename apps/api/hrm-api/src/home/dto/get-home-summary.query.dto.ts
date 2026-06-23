import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class GetHomeSummaryQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  /** CSV: tasks,manager_pending,celebrations,whos_out — default tasks,manager_pending for MOB-UX-04a */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  include?: string;
}
