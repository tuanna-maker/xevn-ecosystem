import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength, IsBoolean, IsArray, IsIn } from 'class-validator';

export class CreateInternalNewsDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(256)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  slug?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  featured_image_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(32)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : undefined)
  published_at?: Date;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  visibility?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  department_ids?: string[];

  @IsOptional()
  @IsUUID()
  author_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  author_name?: string;
}
