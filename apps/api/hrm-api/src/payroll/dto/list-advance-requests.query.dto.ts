import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListAdvanceRequestsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
