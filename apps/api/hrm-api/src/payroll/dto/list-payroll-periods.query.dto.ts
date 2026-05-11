import { IsIn, IsOptional, IsUUID } from 'class-validator';

export class ListPayrollPeriodsQueryDto {
  @IsUUID()
  company_id!: string;

  @IsOptional()
  @IsIn(['draft', 'processed', 'closed'])
  status?: 'draft' | 'processed' | 'closed';
}
