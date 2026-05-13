import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ListLeaveRequestsQueryDto {
  @IsUUID()
  company_id!: string;

  @IsOptional()
  @IsString()
  status?: string;
}
