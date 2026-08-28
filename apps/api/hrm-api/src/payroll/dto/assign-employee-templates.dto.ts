import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignEmployeesToTemplateDto {
  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  employee_ids!: string[];

  @IsString()
  @IsNotEmpty()
  company_id!: string;
}

export class UnassignEmployeesFromTemplateDto {
  @IsArray()
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  employee_ids!: string[];

  @IsString()
  @IsNotEmpty()
  company_id!: string;
}
