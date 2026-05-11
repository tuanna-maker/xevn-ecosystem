import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RequestCatalogFieldRemovalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  requested_by_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  requested_by_email?: string;
}

