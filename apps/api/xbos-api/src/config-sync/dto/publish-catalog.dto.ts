import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PublishCatalogItemDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_:-]{2,64}$/)
  code!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsIn(['active', 'draft'])
  status!: 'active' | 'draft';
}

export class PublishCatalogDto {
  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  tenantId!: string;

  @IsString()
  @Matches(/^[a-z0-9][a-z0-9_-]{1,62}$/)
  companyId!: string;

  @IsString()
  name!: string;

  @IsString()
  domain!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(['hrm', 'xbos', 'web-portal'], { each: true })
  assignedTo!: Array<'hrm' | 'xbos' | 'web-portal'>;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PublishCatalogItemDto)
  items!: PublishCatalogItemDto[];

  @IsOptional()
  @IsString()
  actor?: string;
}
