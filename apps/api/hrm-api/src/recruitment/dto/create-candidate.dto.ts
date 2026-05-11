import { IsEmail, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCandidateDto {
  @IsUUID()
  company_id!: string;

  @IsUUID()
  requisition_id!: string;

  @IsString()
  @MaxLength(150)
  full_name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MaxLength(30)
  source!: string;
}
