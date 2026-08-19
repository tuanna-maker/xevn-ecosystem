/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → trường JD · UC-BP-REC-00a · F-JD-DEF-03
 * WorkItem: PO-HRM-JD-DYNAMIC-BE-01
 */
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateJdFieldDefDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  section_hint?: string;

  @IsOptional()
  @IsObject()
  validation_json?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  applies_to_company_ids?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(32)
  field_type?: string;
}
