import { IsOptional, IsUUID } from 'class-validator';

export class UpdatePayrollPeriodDto {
  @IsOptional()
  @IsUUID()
  payroll_group_id?: string | null;
}
