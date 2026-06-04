import { IsDateString, IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @MaxLength(80)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  requisition_id?: string;

  @IsString()
  @MaxLength(150)
  full_name!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  stage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsDateString()
  applied_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
