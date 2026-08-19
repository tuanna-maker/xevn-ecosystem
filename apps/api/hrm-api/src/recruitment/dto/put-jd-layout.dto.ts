/**
 * @CODE-MEMORY
 * Screen: HRM Cài đặt → bố cục mặc định JD · UC-BP-REC-00b · F-JD-LAY-02
 * WorkItem: PO-HRM-JD-DYNAMIC-BE-01
 */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PutJdLayoutItemDto {
  @IsUUID()
  field_id!: string;

  @IsString()
  @MaxLength(64)
  section!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order!: number;
}

export class PutJdLayoutDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PutJdLayoutItemDto)
  items!: PutJdLayoutItemDto[];
}
