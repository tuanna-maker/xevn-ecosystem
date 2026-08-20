import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import type { PayPayrollGroupMatchRule } from '../pay-payroll-group-resolver';

export class CreatePayrollGroupDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(200)
  name_vi!: string;

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
