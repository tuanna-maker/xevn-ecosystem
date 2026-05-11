import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { assetOwnerModules } from './asset-common.dto';

export class ListAssetsQueryDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,64}$/)
  tenantId!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,64}$/)
  companyId!: string;

  @IsOptional()
  @IsIn(assetOwnerModules)
  ownerModule?: (typeof assetOwnerModules)[number];

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
