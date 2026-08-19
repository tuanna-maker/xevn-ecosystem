/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → trường JD · UC-BP-REC-00a · F-JD-DEF-02
 * WorkItem: PO-HRM-JD-DYNAMIC-BE-01 · TechSpec ARCH-02 §2.11
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateJdFieldDefDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  field_key!: string;

  @IsString()
  @MaxLength(200)
  label!: string;

  @IsString()
  @MaxLength(32)
  field_type!: string;

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
  applies_to_company_ids?: string[];
}
