import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListJobPostingsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}
