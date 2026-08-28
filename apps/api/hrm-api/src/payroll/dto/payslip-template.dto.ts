/**
 * @CODE-MEMORY
 * Purpose:    Data Transfer Objects cho Phiếu lương mẫu
 * ref_srs:    PO-HRM-PAY-PAYSLIP-TEMPLATE-SPEC-01
 */
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePayslipTemplateDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  pay_sheet_template_id?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class UpdatePayslipTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  pay_sheet_template_id?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class ListPayslipTemplatesQueryDto {
  @IsString()
  @IsOptional()
  q?: string;
}
