import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ListServiceRequestsQueryDto {
  @IsUUID()
  company_id!: string;

  @IsOptional()
  @IsString()
  service_type?: string;
}
