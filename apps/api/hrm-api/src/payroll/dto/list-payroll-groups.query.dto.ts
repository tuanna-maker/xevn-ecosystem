import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListPayrollGroupsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsIn(['active', 'retired'])
  status?: 'active' | 'retired';

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  page_size?: string;
}
