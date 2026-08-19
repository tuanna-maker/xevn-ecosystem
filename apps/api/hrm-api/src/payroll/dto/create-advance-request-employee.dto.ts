import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/** F-PAY-ADV-EMP-01 — product-path add NV to advance_request_employees (U65, no seed). */
export class CreateAdvanceRequestEmployeeDto {
  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsString()
  @MaxLength(64)
  employee_code!: string;

  @IsString()
  @MaxLength(256)
  employee_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  position?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  advance_amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  note?: string;
}
