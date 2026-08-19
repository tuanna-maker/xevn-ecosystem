import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PAY_PAYSLIP_PAYMENT_STATUSES } from '../pay-payslip.constants';

export class PatchPayslipPaymentStatusDto {
  @IsIn([...PAY_PAYSLIP_PAYMENT_STATUSES])
  payment_status!: (typeof PAY_PAYSLIP_PAYMENT_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsString()
  company_id?: string;
}
