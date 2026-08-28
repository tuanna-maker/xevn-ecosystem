import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreatePaySystemDataDto {
  @IsString()
  @MaxLength(100)
  code: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  data_type?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePaySystemDataDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  data_type?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
