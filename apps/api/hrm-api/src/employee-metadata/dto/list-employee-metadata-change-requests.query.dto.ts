import { IsIn, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListEmployeeMetadataChangeRequestsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  /** Portal embed may send tenant_id; scope is resolved from JWT + headers. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  tenant_id?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsUUID()
  legal_entity_id?: string;

  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected', 'cancelled'])
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';

  @IsOptional()
  @IsString()
  field_key?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  page_size?: number;
}
