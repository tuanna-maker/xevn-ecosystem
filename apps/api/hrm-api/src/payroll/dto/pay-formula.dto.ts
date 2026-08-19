import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PAY_FORMULA_STATUSES } from '../pay-formula.constants';

export class ListPayFormulasQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsIn([...PAY_FORMULA_STATUSES])
  status?: (typeof PAY_FORMULA_STATUSES)[number];

  @IsOptional()
  @IsBooleanString()
  active_only?: string;

  @IsOptional()
  @IsBooleanString()
  include_archived?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

export class CreatePayFormulaDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  /** Opaque expression — accept camel or snake alias. */
  @ValidateIf((o: CreatePayFormulaDto) => o.expression == null)
  @IsObject()
  expressionJson?: Record<string, unknown>;

  @ValidateIf((o: CreatePayFormulaDto) => o.expressionJson == null)
  @IsObject()
  expression?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  requiredVarsJson?: Record<string, unknown> | string[];

  @IsOptional()
  @IsObject()
  requiredVars?: Record<string, unknown> | string[];

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class UpdatePayFormulaDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id?: string;

  @ValidateIf((o: UpdatePayFormulaDto) => o.expression == null && o.expressionJson != null)
  @IsObject()
  expressionJson?: Record<string, unknown>;

  @ValidateIf((o: UpdatePayFormulaDto) => o.expressionJson == null && o.expression != null)
  @IsObject()
  expression?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  requiredVarsJson?: Record<string, unknown> | string[];

  @IsOptional()
  @IsObject()
  requiredVars?: Record<string, unknown> | string[];

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class CreatePayFormulaVersionDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsObject()
  expressionJson?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  expression?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  requiredVarsJson?: Record<string, unknown> | string[];

  @IsOptional()
  @IsObject()
  requiredVars?: Record<string, unknown> | string[];

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;
}

export class PayFormulaNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class PreviewPayFormulaDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id?: string;

  @IsOptional()
  @IsString()
  periodId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsObject()
  variableOverrides?: Record<string, unknown>;
}
