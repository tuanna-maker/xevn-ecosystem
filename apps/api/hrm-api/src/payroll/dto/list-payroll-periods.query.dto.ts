import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListPayrollPeriodsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsIn(['draft', 'processed', 'closed'])
  status?: 'draft' | 'processed' | 'closed';
}
