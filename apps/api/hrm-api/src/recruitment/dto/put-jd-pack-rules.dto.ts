/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → Rule chọn gói · F-JD-RUL-02 · WorkItem: PO-HRM-JD-DYNAMIC-BE-01
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class JdPackRuleItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority!: number;

  @IsString()
  @MaxLength(32)
  match_type!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  match_value?: string | null;

  @IsOptional()
  @IsUUID()
  pack_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  pack_code?: string;

  @IsOptional()
  @IsObject()
  condition_json?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class PutJdPackRulesDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JdPackRuleItemDto)
  rules!: JdPackRuleItemDto[];
}
