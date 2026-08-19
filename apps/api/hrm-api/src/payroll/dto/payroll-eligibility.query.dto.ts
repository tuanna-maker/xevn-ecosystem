import { IsOptional, IsUUID } from 'class-validator';

export class PayrollEligibilityQueryDto {
  @IsOptional()
  @IsUUID()
  payroll_group_id?: string;
}
