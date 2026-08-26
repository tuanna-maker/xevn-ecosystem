import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { toOptionalQueryBoolean } from '../../common/query-boolean';

export class ListDepartmentsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string;

  /** Group CEO department tab — union catalogs across member tenants. Default: JWT tenant only. */
  @IsOptional()
  @Transform(({ value }) => toOptionalQueryBoolean(value))
  @IsBoolean()
  rollup_tenants?: boolean;
}
