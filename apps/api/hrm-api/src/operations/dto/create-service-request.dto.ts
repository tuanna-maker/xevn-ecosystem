import { IsJSON, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateServiceRequestDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  service_type!: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsString()
  employee_name!: string;

  @IsOptional()
  @IsString()
  employee_code?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  request_date!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  meal_type?: string;

  @IsOptional()
  @IsString()
  meal_date?: string;

  @IsOptional()
  @IsString()
  meal_quantity?: string;

  @IsOptional()
  @IsString()
  vehicle_purpose?: string;

  @IsOptional()
  @IsString()
  vehicle_destination?: string;

  @IsOptional()
  @IsString()
  vehicle_date?: string;

  @IsOptional()
  @IsString()
  vehicle_time_start?: string;

  @IsOptional()
  @IsString()
  vehicle_time_end?: string;

  @IsOptional()
  @IsString()
  vehicle_passengers?: string;

  @IsOptional()
  @IsJSON()
  supply_items?: string;

  @IsOptional()
  @IsString()
  supply_urgency?: string;
}
