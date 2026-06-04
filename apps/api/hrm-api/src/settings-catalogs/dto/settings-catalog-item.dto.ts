import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SettingsCatalogItemMutationDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  category_key!: string;

  @IsString()
  @MaxLength(64)
  item_key!: string;

  @IsString()
  @MaxLength(256)
  item_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  item_value?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
