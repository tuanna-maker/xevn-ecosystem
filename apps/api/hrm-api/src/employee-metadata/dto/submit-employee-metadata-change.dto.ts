import { IsJSON, IsOptional, IsString, IsUUID } from 'class-validator';

export class SubmitEmployeeMetadataChangeDto {
  /** UUID or operating slug (`finance`, `main` → holding UUID). */
  @IsString()
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsOptional()
  @IsUUID()
  legal_entity_id?: string;

  @IsString()
  field_key!: string;

  @IsOptional()
  @IsJSON()
  current_value?: string;

  @IsJSON()
  requested_value!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  actor_user_id?: string;

  @IsOptional()
  @IsString()
  actor_name?: string;

  @IsOptional()
  @IsString()
  workflow_code?: string;

  @IsOptional()
  @IsString()
  source_catalog_key?: string;
}
