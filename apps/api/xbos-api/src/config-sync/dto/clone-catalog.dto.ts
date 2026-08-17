import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

/**
 * XBOS-DM-09 — Sao chép bộ danh mục (partition → partition).
 * Source = tenantId + companyId; destination = destTenantId + destCompanyId.
 * Default onConflict=reject → 409 when dest already has overlapping item codes.
 */
export class CloneCatalogDto {
  /** Source tenant (typically master `xevn`). */
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  tenantId!: string;

  /** Source company (typically `holding`). */
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  companyId!: string;

  /** Destination tenant partition. */
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  destTenantId!: string;

  /** Destination company partition. */
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  destCompanyId!: string;

  /**
   * `reject` (default) — XBOS-CFG-409 when dest has overlapping codes (TC-DM09-CPY-FD-001).
   * `overwrite` — upsert via publish (same semantics as apply-to-members single target).
   */
  @IsOptional()
  @IsIn(['reject', 'overwrite'])
  onConflict?: 'reject' | 'overwrite';

  @IsOptional()
  @IsString()
  actor?: string;
}
