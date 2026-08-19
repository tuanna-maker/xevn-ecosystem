/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → Nhóm JD · F-JD-GRP-03 · WorkItem: PO-HRM-JD-DYNAMIC-BE-01
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { JdGroupFieldItemDto } from './create-jd-group-def.dto';

export class UpdateJdGroupDefDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  usage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  view_style?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JdGroupFieldItemDto)
  fields?: JdGroupFieldItemDto[];
}
