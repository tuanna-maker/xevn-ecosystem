import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListPerformanceCyclesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'closed';
}

export class ListPerformanceEvaluationsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  cycle_id?: string;
}
