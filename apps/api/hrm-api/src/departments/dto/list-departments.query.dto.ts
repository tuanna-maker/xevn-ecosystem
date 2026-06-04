import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListDepartmentsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;
}
