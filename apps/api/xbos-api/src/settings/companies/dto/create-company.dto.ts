/**
 * @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-BE-01
 * solid_convention_ack: true
 * be_boundary: true
 */
import { IsArray, IsEnum, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export type AllowedModule = 'hrm' | 'logistics';
export const ALLOWED_MODULES: AllowedModule[] = ['hrm', 'logistics'];
export const ALLOWED_TENANT_KINDS = ['master', 'member'] as const;
export type AllowedTenantKind = (typeof ALLOWED_TENANT_KINDS)[number];

export class LegalEntitySubDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  businessLines?: string;
}

export class CreateCompanyDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9-]{2,49}$/, {
    message: 'tenantCode must be lowercase, start with a letter, contain only [a-z0-9-], and be 3-50 characters',
  })
  tenantCode!: string;

  @IsString()
  name!: string;

  @IsString()
  shortName!: string;

  @IsEnum(ALLOWED_TENANT_KINDS)
  tenantKind!: AllowedTenantKind;

  @IsArray()
  @IsEnum(ALLOWED_MODULES, { each: true })
  modules!: AllowedModule[];

  @IsOptional()
  @ValidateNested()
  @Type(() => LegalEntitySubDto)
  legalEntity?: LegalEntitySubDto;
}
