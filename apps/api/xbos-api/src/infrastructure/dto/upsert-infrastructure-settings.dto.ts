import { IsArray, IsObject, IsOptional } from 'class-validator';

export class UpsertInfrastructureSettingsDto {
  @IsOptional()
  @IsArray()
  foundationCategories?: unknown[];

  @IsOptional()
  @IsArray()
  sites?: unknown[];

  @IsOptional()
  @IsObject()
  blockTitleOverridesByEntity?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  customBlocksByEntity?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  customFieldDefsByEntity?: Record<string, unknown>;
}
