/**
 * PUT /recruitment/mail-templates — save company catalog (3 chuẩn + tùy chỉnh).
 */
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class RecMailTemplateItemDto {
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  @Matches(/^[a-z][a-z0-9_-]{1,63}$/i, {
    message: 'code must be slug: a-z, 0-9, _, -',
  })
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  label_vi!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  body!: string;

  @IsBoolean()
  active!: boolean;
}

export class UpsertMailTemplatesDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => RecMailTemplateItemDto)
  templates!: RecMailTemplateItemDto[];
}
