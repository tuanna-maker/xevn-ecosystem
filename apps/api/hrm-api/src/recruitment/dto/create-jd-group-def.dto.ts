/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → Nhóm thông tin JD · UC-00d · F-JD-GRP-02
 * WorkItem: PO-HRM-JD-DYNAMIC-BE-01 · GROUP-ARCH / GROUP-DATA
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

export class JdGroupFieldItemDto {
  @IsUUID()
  field_id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order!: number;

  @IsOptional()
  @IsBoolean()
  is_required_in_group?: boolean;
}

export class CreateJdGroupDefDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(200)
  label!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  kind?: string;

  @IsString()
  @MaxLength(32)
  usage!: string;

  @IsString()
  @MaxLength(32)
  view_style!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JdGroupFieldItemDto)
  fields?: JdGroupFieldItemDto[];
}
