/**
 * @CODE-MEMORY
 * WorkItem: PO-HRM-MVP-GD1-CORE-03-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-CORE-CHK-01 request DTOs — /employees/:id/document-checklist*
 * Why: API-01 §4.5 · DATA-01 §4–§5 · UC-BP-CORE-03
 * must_keep: open documentTypeKey · status missing|submitted|approved · soft archive · no OCR body
 */
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { HRM_DOCUMENT_CHECKLIST_STATUSES } from '../emp-document-checklist.constants';

function toOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return undefined;
}

export class ListEmpDocumentChecklistQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_archived?: boolean;
}

export class GetEmpDocumentChecklistQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_archived?: boolean;
}

export class CreateEmpDocumentChecklistDto {
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-z][a-z0-9_]*$/i, {
    message: 'documentTypeKey must be open key format (a-z, digits, underscore)',
  })
  documentTypeKey!: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsIn([...HRM_DOCUMENT_CHECKLIST_STATUSES])
  status?: (typeof HRM_DOCUMENT_CHECKLIST_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fileRef?: string | null;
}

export class UpdateEmpDocumentChecklistDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Matches(/^[a-z][a-z0-9_]*$/i, {
    message: 'documentTypeKey must be open key format (a-z, digits, underscore)',
  })
  documentTypeKey?: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsIn([...HRM_DOCUMENT_CHECKLIST_STATUSES])
  status?: (typeof HRM_DOCUMENT_CHECKLIST_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  fileRef?: string | null;

  /** Soft-archive when ISO timestamptz or sentinel true via archive flag. */
  @IsOptional()
  @IsString()
  archivedAt?: string | null;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  @IsBoolean()
  archive?: boolean;
}
