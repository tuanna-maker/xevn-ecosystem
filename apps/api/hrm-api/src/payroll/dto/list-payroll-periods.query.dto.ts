import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ListPayrollPeriodsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsIn(['draft', 'processed', 'closed'])
  status?: 'draft' | 'processed' | 'closed';

  @IsOptional()
  @IsUUID()
  payroll_group_id?: string;
}
