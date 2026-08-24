import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';

export class ListInternalNewsQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-z-]{1,64}$/i)
  company_id?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f-]{1,32}$/i)
  category?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(draft|published|archived)$/i)
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsString()
  include_drafts?: string;

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
