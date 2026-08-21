import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

/** POST …/leave-balance/enroll-on-activate — system replay / QA (≠ HR manual PUT). */
export class EnrollOnActivateDto {
  @IsUUID()
  employee_id!: string;

  @IsString()
  company_id!: string;

  @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, {
    message: 'effective_date must be dd/MM/yyyy',
  })
  effective_date!: string;

  @IsOptional()
  @IsString()
  activate_event_ref?: string;
}

export class UpsertShiftAssignmentDto {
  @IsUUID()
  employee_id!: string;

  @IsString()
  company_id!: string;

  @IsUUID()
  shift_id!: string;

  @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, {
    message: 'effective_from must be dd/MM/yyyy',
  })
  effective_from!: string;

  @IsOptional()
  @IsString()
  department_id?: string;
}
