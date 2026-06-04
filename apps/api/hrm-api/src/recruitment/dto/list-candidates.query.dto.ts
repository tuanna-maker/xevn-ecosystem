import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class ListCandidatesQueryDto {
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.companyId;
    if (Array.isArray(raw)) return String(raw[0] ?? '').trim();
    return raw == null ? raw : String(raw).trim();
  })
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsUUID()
  requisition_id?: string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.page;
    if (Array.isArray(raw)) return String(raw[0] ?? '').trim();
    return raw == null ? raw : String(raw).trim();
  })
  @Matches(/^\d+$/)
  page?: number | string = '1';

  @IsOptional()
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.pageSize;
    if (Array.isArray(raw)) return String(raw[0] ?? '').trim();
    return raw == null ? raw : String(raw).trim();
  })
  @Matches(/^\d+$/)
  page_size?: number | string = '20';
}
