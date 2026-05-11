import { IsObject, IsOptional } from 'class-validator';

export class UpsertInfrastructureSettingsDto {
  @IsOptional()
  @IsObject()
  foundationCategories?: unknown;

  @IsOptional()
  @IsObject()
  sites?: unknown;

  @IsOptional()
  @IsObject()
  blockTitleOverridesByEntity?: unknown;

  @IsOptional()
  @IsObject()
  customBlocksByEntity?: unknown;

  @IsOptional()
  @IsObject()
  customFieldDefsByEntity?: unknown;
}

