import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsBoolean,
  IsObject,
  IsIn, 
  IsDateString 
} from 'class-validator';

export class CreatePayPolicyDto {
  @IsString()
  @IsNotEmpty()
  pay_group_code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  effective_from: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdatePayPolicyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ClonePayPolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  effective_from: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpsertComponentDto {
  @IsString()
  @IsNotEmpty()
  component_type: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  sort_order: number;

  @IsBoolean()
  is_deduction: boolean;

  @IsOptional()
  @IsString()
  input_source?: string;

  @IsObject()
  params: Record<string, any>;
}
