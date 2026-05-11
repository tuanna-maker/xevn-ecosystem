import { IsJSON, IsOptional, IsString } from 'class-validator';

export class UpdateServiceRequestDto {
  @IsOptional()
  @IsString()
  status?: string;

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
