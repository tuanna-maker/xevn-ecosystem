import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCompanyAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsUUID()
  company_id!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
