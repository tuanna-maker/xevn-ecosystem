// @CODE-MEMORY: DTO Validation for Salary Component Creation
import { IsString, IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSalaryComponentDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name_vi: string;

  @IsString()
  @IsNotEmpty()
  component_type: string;

  @IsBoolean()
  @IsOptional()
  is_taxable?: boolean;

  @IsBoolean()
  @IsOptional()
  in_bhxh_base?: boolean;
}
