import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

class InviteEmployeeItemDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;
}

export class InviteEmployeesDto {
  @IsUUID()
  company_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteEmployeeItemDto)
  employees!: InviteEmployeeItemDto[];
}
