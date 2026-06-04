import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class ListEmployeeKpisQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;
}
