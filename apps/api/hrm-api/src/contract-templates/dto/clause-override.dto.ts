/**
 * @CODE-MEMORY WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01
 * Plane A/B: HRM DB only. No cross-plane FK. tenant_id = TEXT DEFAULT.
 */
import { IsIn, IsOptional, IsString } from 'class-validator';

export type ClauseSource = 'template_file' | 'company_specific' | 'manual';

export const VALID_CLAUSE_SOURCES: ClauseSource[] = [
  'template_file',
  'company_specific',
  'manual',
];

export class UpsertClauseOverrideDto {
  @IsOptional()
  @IsString()
  override_text?: string;

  @IsString()
  @IsIn(VALID_CLAUSE_SOURCES)
  source!: ClauseSource;

  @IsOptional()
  @IsString()
  updated_by?: string;
}

export interface ClauseOverrideRow {
  id: string;
  tenant_id: string;
  template_code: string;
  clause_id: string;
  override_text: string | null;
  source: string;
  updated_by: string | null;
  updated_at: string;
  deleted_at: string | null;
  created_at: string;
}
