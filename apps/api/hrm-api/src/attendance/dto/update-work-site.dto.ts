import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/** UC-BP-ATT-03d — sửa điểm GPS; `radius` = alias FE. */
export class UpdateWorkSiteDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  radius?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  radius_meters?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
