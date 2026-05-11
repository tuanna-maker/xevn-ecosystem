import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class CatalogExtensionItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  label!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  unit?: string;

  @IsOptional()
  @IsIn(['active', 'draft'])
  status?: 'active' | 'draft';
}

export class AppendExtensionItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CatalogExtensionItemDto)
  items!: CatalogExtensionItemDto[];
}
