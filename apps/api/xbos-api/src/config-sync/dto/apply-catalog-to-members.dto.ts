import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Target partition for Option B fan-out (XBOS-DM-HRM-07 / G-BM-REC-01).
 * Prefer explicit tenant+company so member legal entities (`xe-du-lich`/`main`) work.
 */
export class ApplyCatalogMemberTargetDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  tenantId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  companyId!: string;
}

/**
 * Holding (or any source partition) → copy published catalog items to selected members.
 * Must supply `targets` and/or same-tenant `memberCompanyIds`.
 */
export class ApplyCatalogToMembersDto {
  /** Source tenant (typically master `xevn`). */
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  tenantId!: string;

  /** Source company (typically `holding`). */
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  companyId!: string;

  /** Cross-tenant member partitions (preferred). */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApplyCatalogMemberTargetDto)
  targets?: ApplyCatalogMemberTargetDto[];

  /**
   * Same-tenant shorthand — each id pairs with source `tenantId`.
   * SA wording «member companyIds».
   */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/, { each: true })
  memberCompanyIds?: string[];

  @IsOptional()
  @IsString()
  actor?: string;
}
