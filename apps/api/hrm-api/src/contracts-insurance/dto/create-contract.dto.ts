import { IsDateString, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  @MaxLength(40)
  contract_type!: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;
}
