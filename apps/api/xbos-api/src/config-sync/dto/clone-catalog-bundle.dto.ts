import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * XBOS-DM-LOG-09 / XBOS-DM-09 — copy a filtered catalog bundle company→company.
 * Choice: shared clone endpoint with domain filter (not a LOG-only god module).
 * LOG-09 callers pass domains=['logistics']; DM-09 may pass other domains / keyPrefix.
 */
export class CloneCatalogBundleDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  sourceTenantId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  sourceCompanyId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  destTenantId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  destCompanyId!: string;

  /**
   * Domain filter on `config_catalogs.domain`.
   * LOG-09: `['logistics']` (seed SoT). Optional second domain is a product decision — not invented here.
   */
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  domains!: string[];

  /** Optional key prefix filter (e.g. `log_dm_`). */
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{1,32}$/)
  keyPrefix?: string;

  /**
   * Conflict policy when dest already has a matching catalog_key.
   * Default `fail` = reject entire job (no half-copy) — TC-DM-LOG-09-COPY-BUNDLE-FD-002.
   */
  @IsOptional()
  @IsIn(['fail', 'skip', 'overwrite'])
  onConflict?: 'fail' | 'skip' | 'overwrite';

  @IsOptional()
  @IsString()
  @MaxLength(128)
  actor?: string;
}
