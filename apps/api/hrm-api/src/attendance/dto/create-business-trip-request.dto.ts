import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBusinessTripRequestDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  employee_code!: string;

  @IsString()
  employee_name!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsString()
  destination!: string;

  @IsString()
  start_date!: string;

  @IsString()
  end_date!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  total_days!: number;

  @IsString()
  purpose!: string;

  @IsOptional()
  @IsString()
  transportation?: string;

  @IsOptional()
  @IsString()
  accommodation?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimated_cost?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  advance_amount?: number;

  @IsOptional()
  @IsString()
  companions?: string;

  @IsOptional()
  @IsString()
  contact_info?: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
