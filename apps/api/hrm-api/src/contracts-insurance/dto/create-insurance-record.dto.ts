import { IsDateString, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateInsuranceRecordDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  @MaxLength(50)
  provider!: string;

  @IsString()
  @MaxLength(60)
  policy_number!: string;

  @IsDateString()
  expiry_date!: string;
}
