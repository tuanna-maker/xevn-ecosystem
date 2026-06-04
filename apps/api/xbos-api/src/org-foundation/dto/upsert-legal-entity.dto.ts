import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

/** Portal Command Center legal-entity save body (ValidationPipe whitelist-safe). */
export class UpsertLegalEntityDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  establishedAt?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  businessLines?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  charterCapital?: number;

  @IsOptional()
  @IsString()
  legalRepresentative?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
