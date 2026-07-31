import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class CompensationLineDto {
  @IsIn(['base', 'probation', 'allowance'])
  line_type!: 'base' | 'probation' | 'allowance';

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  /** Required when line_type=allowance (XBOS DM §33 Loại phụ cấp code). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  allowance_code?: string;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  note?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

export class CreateCompensationPackageDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsOptional()
  @IsUUID()
  contract_id?: string;

  @IsDateString()
  effective_from!: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  change_reason?: string;

  /** When true, link employee_contracts.compensation_package_id to the new package. */
  @IsOptional()
  @IsBoolean()
  link_to_contract?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompensationLineDto)
  lines!: CompensationLineDto[];
}

export class ReviseCompensationPackageDto {
  @IsDateString()
  effective_from!: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  change_reason?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CompensationLineDto)
  lines!: CompensationLineDto[];
}
