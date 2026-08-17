/**
 * @CODE-MEMORY
 * Screen:     HRM YCTD list / UV picker receivable
 * UC:         FR-UC-BP-REC-05a #1–#2 · FR-UC-BP-REC-06b #1–#2
 * WorkItem:   PO-HRM-REC-UV-YCTD-BE-01
 * Purpose:    Query list YCTD + receivable/open_for_hire filter (F-REC-UV-YCTD-01).
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
 * ADD receivable · open_for_hire · q — empty 200[] when no open YCTD.
 */
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

export class ListJobRequisitionsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  companyId?: string;

  @IsString()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.companyId) ?? pickScalar(obj?.company_id))
  @MaxLength(64)
  company_id!: string;

  /** F-REC-UV-YCTD-01 — filter status receivable (AS-IS open). */
  @IsOptional()
  @IsString()
  @MaxLength(16)
  receivable?: string;

  /** Logical alias of receivable=true. */
  @IsOptional()
  @IsString()
  @MaxLength(16)
  open_for_hire?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    return pickScalar(value) ?? pickScalar(obj?.page);
  })
  @Matches(/^\d+$/)
  page?: number | string = '1';

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page_size) ?? pickScalar(obj?.pageSize))
  @Matches(/^\d+$/)
  pageSize?: number | string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    return pickScalar(value) ?? pickScalar(obj?.pageSize) ?? pickScalar(obj?.page_size);
  })
  @Matches(/^\d+$/)
  page_size?: number | string = '20';
}
