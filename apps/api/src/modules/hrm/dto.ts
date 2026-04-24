import { IsObject, IsString } from 'class-validator';

export class SaveEmployeeMetadataValuesDto {
  @IsString()
  tenantId = 'tenant-xevn-holding';

  @IsString()
  legalEntityId!: string;

  @IsObject()
  values!: Record<string, string | number | boolean | null>;
}
