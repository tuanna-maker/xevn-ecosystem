import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import type { PayPayrollGroupMatchRule } from '../pay-payroll-group-resolver';

export class UpdatePayrollGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name_vi?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsOptional()
  match_rule_json?: PayPayrollGroupMatchRule;

  @IsOptional()
  @IsUUID()
  formula_definition_id?: string | null;

  @IsOptional()
  @IsIn(['active', 'retired'])
  status?: 'active' | 'retired';
}
