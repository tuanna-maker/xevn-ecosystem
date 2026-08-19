import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** UC-BP-ATT-03d — tạo điểm GPS; `radius` = alias FE GPSLocation.radius. */
export class CreateWorkSiteDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  /** FE GPSLocation.radius — map sang radius_meters khi lưu. */
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
