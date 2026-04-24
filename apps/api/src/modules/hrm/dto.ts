import { IsObject, IsOptional, IsString } from 'class-validator';

export class SaveEmployeeMetadataValuesDto {
  @IsString()
  tenantId = 'tenant-xevn-holding';

  @IsString()
  legalEntityId!: string;

  @IsObject()
  values!: Record<string, string | number | boolean | null>;
}

export class SubmitEmployeeMetadataChangeDto extends SaveEmployeeMetadataValuesDto {
  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  actorUserId?: string;
}

export class ApproveEmployeeMetadataChangeDto {
  @IsString()
  tenantId = 'tenant-xevn-holding';

  @IsString()
  @IsOptional()
  approverUserId?: string;
}
