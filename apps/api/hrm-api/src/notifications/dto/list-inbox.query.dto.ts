import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListInboxQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  /** Viewer employee UUID — used to filter rows targeted at this user plus company broadcast rows. */
  @IsUUID()
  employee_id!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
