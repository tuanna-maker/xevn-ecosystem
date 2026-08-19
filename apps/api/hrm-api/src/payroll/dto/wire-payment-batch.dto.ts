import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

/** AMIS step7 — wire payment batch from processed payslip lines (period close-out spine). */
export class WirePaymentBatchDto {
  @IsString()
  @MaxLength(80)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  payment_method?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bank_name?: string;

  /** When true, only payslips with employee_confirmed_at are wired (AMIS step6 gate). */
  @IsOptional()
  @IsBoolean()
  require_ess_confirm?: boolean;
}
