import { IsString, IsUUID, MaxLength } from 'class-validator';

/** FR-UC-BP-ATT-12 — read open activate_default shift for profile strip. */
export class GetActivateDefaultShiftQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;
}
