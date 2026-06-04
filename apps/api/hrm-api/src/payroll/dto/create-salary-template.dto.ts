import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSalaryTemplateDto {
  @IsString()
  @MaxLength(128)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(256)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
