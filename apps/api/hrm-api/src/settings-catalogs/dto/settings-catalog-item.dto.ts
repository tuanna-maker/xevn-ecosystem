import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class SettingsCatalogItemMutationDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  companyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  catalogKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  item_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  itemKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  item_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  itemName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  item_value?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  itemValue?: string;

  /** active = in picker; draft = deactivated (AC-SC-POS soft stop). */
  @IsOptional()
  @IsIn(['active', 'draft'])
  status?: 'active' | 'draft';

  @IsOptional()
  metadata?: Record<string, unknown>;
}
