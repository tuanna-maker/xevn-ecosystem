/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → Gói mặc định JD · F-JD-PCK-02 · WorkItem: PO-HRM-JD-DYNAMIC-BE-01
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PutJdPackGroupItemDto {
  @IsOptional()
  @IsUUID()
  group_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  group_code?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order!: number;

  @IsBoolean()
  always_on!: boolean;
}

export class PutJdDefaultPackDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_company_fallback?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PutJdPackGroupItemDto)
  groups!: PutJdPackGroupItemDto[];
}
