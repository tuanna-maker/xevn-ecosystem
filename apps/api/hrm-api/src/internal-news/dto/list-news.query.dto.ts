import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return undefined;
}

export class ListInternalNewsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-z-]{1,64}$/i)
  company_id?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-z-]{1,32}$/i)
  category?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(draft|published|archived)$/i)
  status?: string;

  /** Query string `true`/`false` → boolean (avoid Transform+IsString mismatch). */
  @IsOptional()
  @Transform(({ value }) => toOptionalBoolean(value))
  @IsBoolean()
  include_drafts?: boolean;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.page;
    return v ? String(v) : '1';
  })
  @Matches(/^\d+$/)
  page?: string = '1';

  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.page_size ?? obj?.pageSize;
    return v ? String(v) : '20';
  })
  @Matches(/^\d+$/)
  page_size?: string = '20';
}
