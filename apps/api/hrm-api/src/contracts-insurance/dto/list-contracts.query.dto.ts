import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListContractsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
