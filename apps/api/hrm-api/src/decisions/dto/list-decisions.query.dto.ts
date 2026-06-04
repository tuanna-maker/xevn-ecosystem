import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

const pickScalar = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

export class ListDecisionsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  decision_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page) ?? '1')
  @Matches(/^\d+$/)
  page?: number | string = '1';

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page_size) ?? pickScalar(obj?.pageSize) ?? '20')
  @Matches(/^\d+$/)
  page_size?: number | string = '20';
}
