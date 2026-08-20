import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export enum PayrollEnrollMode {
  EXPLICIT = 'explicit',
  AUTO_ELIGIBLE = 'auto_eligible',
}

export class CreatePayrollEnrollDto {
  @IsEnum(PayrollEnrollMode)
  mode!: PayrollEnrollMode;

  @ValidateIf(
    (value: CreatePayrollEnrollDto) =>
      value.mode === PayrollEnrollMode.EXPLICIT,
  )
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @Type(() => String)
  employee_ids?: string[];

  @IsOptional()
  @Type(() => Boolean)
  auto_enroll_on_process?: boolean;
}
