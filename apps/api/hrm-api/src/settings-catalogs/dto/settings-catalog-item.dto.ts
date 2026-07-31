import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

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

  /** active = in picker; draft = deactivated (AC-SC-POS soft stop). */
  @IsOptional()
  @IsIn(['active', 'draft'])
  status?: 'active' | 'draft';

  @IsOptional()
  metadata?: Record<string, unknown>;
}
